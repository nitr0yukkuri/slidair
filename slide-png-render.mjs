const PNG_WIDTH = 1920;
const PNG_HEIGHT = 1080;
const MAX_HTML_LENGTH = 500_000;
const MAX_CSS_LENGTH = 1_500_000;

export function validateSlidePngPayload(payload) {
  if (!payload || typeof payload.html !== "string" || typeof payload.css !== "string") {
    throw new Error("invalid export payload");
  }
  if (payload.html.length > MAX_HTML_LENGTH || payload.css.length > MAX_CSS_LENGTH) {
    throw new Error("export payload is too large");
  }
  const width = Number(payload.width) || PNG_WIDTH;
  const height = Number(payload.height) || PNG_HEIGHT;
  if (width !== PNG_WIDTH || height !== PNG_HEIGHT) throw new Error("PNG size must be 1920x1080");
  return { html: payload.html, css: payload.css, width, height };
}

function documentShell(baseUrl) {
  const base = new URL(baseUrl);
  if (base.protocol !== "https:" && base.hostname !== "localhost" && base.hostname !== "127.0.0.1") {
    throw new Error("invalid export origin");
  }
  base.pathname = "/";
  base.search = "";
  base.hash = "";
  return `<!doctype html><html><head><base href="${base.href}"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline' data:;"></head><body><div class="export-root"></div></body></html>`;
}

function sanitizeSlideMarkup(html) {
  const allowedTags = new Set([
    "ARTICLE", "DIV", "SPAN", "P", "H1", "H2", "H3", "STRONG", "EM", "BR",
    "SVG", "DEFS", "FILTER", "FETURBULENCE", "FEGAUSSIANBLUR", "FECOLORMATRIX",
    "FECOMPONENTTRANSFER", "FEFUNCR", "FEFUNCG", "FEFUNCB", "FEFUNCA", "FEMERGE", "FEMERGENODE", "FEOFFSET",
    "FECOMPOSITE", "FEBLEND", "RECT", "PATH", "LINE", "POLYLINE", "POLYGON", "CIRCLE",
    "ELLIPSE", "G", "LINEARGRADIENT", "RADIALGRADIENT", "STOP", "USE",
  ]);
  const safeAttributes = new Set([
    "class", "id", "style", "hidden", "aria-hidden", "role", "xmlns", "viewbox", "width", "height",
    "x", "y", "x1", "y1", "x2", "y2", "rx", "ry", "cx", "cy", "r", "d", "points",
    "fill", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
    "filter", "preserveaspectratio", "stitchtiles", "stddeviation", "basefrequency", "numoctaves", "seed", "result", "in", "in2",
    "type", "values", "operator", "mode", "color-interpolation-filters", "offset",
    "stop-color", "stop-opacity", "href", "xlink:href",
    "data-season", "data-period", "data-weather", "data-scene", "data-role",
  ]);
  const template = document.createElement("template");
  template.innerHTML = html;
  const elements = [...template.content.querySelectorAll("*")];
  const slide = elements.find((element) => element.matches("article.slide"));
  if (!slide || template.content.children.length !== 1 || template.content.firstElementChild !== slide) return false;
  for (const element of elements) {
    if (!allowedTags.has(element.tagName.toUpperCase())) return false;
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || !safeAttributes.has(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if ((name === "href" || name === "xlink:href") && !attribute.value.startsWith("#")) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  document.querySelector(".export-root").replaceChildren(slide);
  return true;
}

export async function renderSlidePngBuffer(payload, {
  browserType,
  browser: sharedBrowser,
  launchOptions = { headless: true },
  baseUrl,
  timeout = 15_000,
} = {}) {
  const exportPayload = validateSlidePngPayload(payload);
  if (!sharedBrowser && !browserType?.launch) throw new Error("PNG renderer is unavailable");
  const browser = sharedBrowser ?? await browserType.launch(launchOptions);
  let context;
  try {
    context = await browser.newContext({
      viewport: { width: exportPayload.width, height: exportPayload.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const origin = new URL(baseUrl).origin;
    await page.route("**/*", (route) => {
      let requestOrigin;
      try { requestOrigin = new URL(route.request().url()).origin; } catch {}
      return requestOrigin === origin ? route.continue() : route.abort();
    });
    await page.setContent(documentShell(baseUrl), { waitUntil: "networkidle", timeout });
    const accepted = await page.evaluate(sanitizeSlideMarkup, exportPayload.html);
    if (!accepted) throw new Error("invalid export markup");
    await page.addStyleTag({ content: exportPayload.css });
    await page.evaluate(async () => {
      await document.fonts?.ready;
      await Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined)));
    });
    const target = page.locator(".export-root > .slide");
    await target.waitFor({ state: "visible", timeout });
    return await target.screenshot({ type: "png", animations: "disabled", timeout });
  } finally {
    await context?.close();
    if (!sharedBrowser) await browser.close();
  }
}
