import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { renderSlidePngBuffer } from "../../../../../slide-png-render.mjs";

export const prerender = false;

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const MAX_ACTIVE_RENDERS = 2;
const requestTimes = new Map<string, number[]>();
let activeRenders = 0;
let browserPromise: Promise<Awaited<ReturnType<typeof playwright.launch>>> | undefined;

async function launchBrowser() {
  if (process.platform === "win32") {
    return playwright.launch({ channel: "msedge", headless: true });
  }
  return playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

async function sharedBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = undefined;
      throw error;
    });
  }
  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = undefined;
    return sharedBrowser();
  }
  return browser;
}

async function readJson(request: Request, limit = 3_000_000) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > limit) throw new Error("export payload is too large");
  if (!request.body) throw new Error("invalid export payload");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("export payload is too large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body));
}

function consumeRateLimit(address: string, now = Date.now()) {
  const recent = (requestTimes.get(address) ?? []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestTimes.set(address, recent);
    return false;
  }
  recent.push(now);
  requestTimes.set(address, recent);
  if (requestTimes.size > 1_000) {
    for (const [key, timestamps] of requestTimes) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_WINDOW_MS)) requestTimes.delete(key);
    }
  }
  return true;
}

function textResponse(message: string, status: number, headers: HeadersInit = {}) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function POST({ request, clientAddress }: { request: Request; clientAddress: string }) {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");
  if (!originHeader || originHeader !== requestOrigin) {
    return textResponse("same-origin export required", 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return textResponse("JSON export payload required", 415);
  }
  if (!consumeRateLimit(clientAddress || "unknown")) {
    return textResponse("too many PNG exports", 429, { "Retry-After": "60" });
  }
  if (activeRenders >= MAX_ACTIVE_RENDERS) {
    return textResponse("PNG export is busy; try again shortly", 503, { "Retry-After": "5" });
  }

  activeRenders += 1;
  try {
    const payload = await readJson(request);
    const browser = await sharedBrowser();
    const png = await renderSlidePngBuffer(payload, {
      browser,
      baseUrl: `${requestOrigin}/`,
    });
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(png.byteLength),
        "Cache-Control": "no-store",
        "Content-Disposition": "attachment; filename=slidair-slide.png",
      },
    });
  } catch (error) {
    if (browserPromise) {
      try {
        const browser = await browserPromise;
        if (!browser.isConnected()) browserPromise = undefined;
      } catch {
        browserPromise = undefined;
      }
    }
    const message = error instanceof Error ? error.message : "PNG export failed";
    const status = /invalid|too large|1920x1080/i.test(message) ? 400 : 500;
    return textResponse(message || "PNG export failed", status);
  } finally {
    activeRenders -= 1;
  }
}
