import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const root = process.env.STATIC_ROOT ? resolve(process.env.STATIC_ROOT) : projectRoot;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const noCacheExtensions = new Set([".html", ".css", ".js", ".mjs", ".webmanifest"]);

export function resolveFilePath(pathname) {
  const requestPath = pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, "");
  const filePath = normalize(join(root, requestPath));
  const relativePath = relative(root, filePath);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    return null;
  }
  return filePath;
}

export function contentType(filePath) {
  return types[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function cacheControl(filePath) {
  return noCacheExtensions.has(extname(filePath).toLowerCase())
    ? "no-cache"
    : "public, max-age=3600";
}

async function readRequestJson(req, limit = 3_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("export payload is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function exportOrigin(req) {
  const host = String(req.headers.host ?? "127.0.0.1:4173").replace(/[^a-zA-Z0-9.:[\\]-]/g, "");
  return `http://${host}/`;
}

async function writeSlidePng(req, res) {
  try {
    const payload = await readRequestJson(req);
    if (typeof payload.html !== "string" || typeof payload.css !== "string") throw new Error("invalid export payload");
    if (/<\/?(?:script|iframe|object|embed)\b/i.test(payload.html)) throw new Error("invalid export markup");
    if (payload.html.length > 500_000 || payload.css.length > 1_500_000) throw new Error("export payload is too large");
    const width = Number(payload.width) || 1920;
    const height = Number(payload.height) || 1080;
    if (width !== 1920 || height !== 1080) throw new Error("PNG size must be 1920x1080");
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const base = exportOrigin(req);
      const css = payload.css.replace(/<\/style/gi, "<\\/style");
      await page.setContent(`<!doctype html><html><head><base href="${base}"><style>${css}</style></head><body><div class="export-root">${payload.html}</div></body></html>`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await document.fonts?.ready;
        await Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined)));
      });
      const target = page.locator(".export-root > .slide");
      await target.waitFor({ state: "visible" });
      const png = await target.screenshot({ type: "png", animations: "disabled" });
      res.writeHead(200, { "Content-Type": "image/png", "Content-Length": png.byteLength, "Cache-Control": "no-store", "Content-Disposition": "attachment; filename=slidair-slide.png" });
      res.end(png);
    } finally {
      await browser.close();
    }
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    res.end(error?.message || "PNG export failed");
  }
}

export function createStaticServer() {
  return createServer(async (req, res) => {
    const method = req.method ?? "GET";
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    if (pathname === "/__slidair/export.png") {
      if (method !== "POST") {
        res.writeHead(405, { Allow: "POST" });
        res.end("Method Not Allowed");
        return;
      }
      await writeSlidePng(req, res);
      return;
    }
    if (method !== "GET" && method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method Not Allowed");
      return;
    }

    const filePath = resolveFilePath(pathname);
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Length": body.byteLength,
        "Content-Type": contentType(filePath),
        "Cache-Control": cacheControl(filePath),
      });
      res.end(method === "HEAD" ? undefined : body);
    } catch (error) {
      const statusCode = error?.code === "ENOENT" ? 404 : 500;
      res.writeHead(statusCode);
      res.end(statusCode === 404 ? "Not found" : "Internal Server Error");
    }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createStaticServer().listen(4173, "127.0.0.1", () => {
    console.log("Slidair: http://127.0.0.1:4173");
  });
}
