const PNG_WIDTH = 1920;
const PNG_HEIGHT = 1080;
const EXPORT_ENDPOINT = "/__slidair/export.png";

function stylesheetText(documentRef) {
  const rules = [];
  for (const sheet of [...(documentRef?.styleSheets ?? [])]) {
    try { rules.push([...sheet.cssRules].map((rule) => rule.cssText).join("\n")); } catch {}
  }
  return rules.join("\n");
}

function modeClass(mode) {
  return mode === "background" ? "slide-export-background" : "slide-export-full";
}

export function slidePngFileName(position = 1, mode = "full") {
  const number = String(Math.max(1, Number(position) || 1)).padStart(2, "0");
  return `slidair-slide-${number}-${mode === "background" ? "background" : "full"}.png`;
}

/**
 * PNGはブラウザのforeignObject制約を避けるため、ローカルの静的サーバーで
 * 実際のスライドDOMを描画してから返す。CSS・背景画像・フォントを同じ
 * オリジンで解決するので、画面と書き出しの見た目がずれにくい。
 */
export function slideExportPayload(slideElement, {
  mode = "full",
  width = PNG_WIDTH,
  height = PNG_HEIGHT,
  documentRef = globalThis.document,
} = {}) {
  if (!slideElement?.cloneNode || !documentRef) throw new Error("スライド要素が見つかりません");
  const clone = slideElement.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.add(modeClass(mode));
  clone.style.setProperty("width", `${width}px`, "important");
  clone.style.setProperty("height", `${height}px`, "important");
  clone.style.setProperty("max-width", "none", "important");
  clone.style.setProperty("max-height", "none", "important");
  clone.style.setProperty("aspect-ratio", "16 / 9", "important");
  if (mode === "background") {
    clone.querySelectorAll(".slide-content, .slide-edit-chrome, [data-edit-field]").forEach((element) => {
      element.style.setProperty("display", "none", "important");
    });
  }
  return { html: clone.outerHTML, css: stylesheetText(documentRef), width, height };
}

export async function renderSlidePng(slideElement, {
  mode = "full",
  width = PNG_WIDTH,
  height = PNG_HEIGHT,
  windowRef = globalThis.window,
  documentRef = globalThis.document,
  endpoint = EXPORT_ENDPOINT,
} = {}) {
  if (!windowRef?.fetch || !windowRef?.Blob || !documentRef?.baseURI) {
    throw new Error("PNG書き出しに必要なブラウザ機能がありません");
  }
  const response = await windowRef.fetch(new URL(endpoint, documentRef.baseURI), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(slideExportPayload(slideElement, { mode, width, height, documentRef })),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "PNGを書き出せませんでした");
  }
  return await response.blob();
}

export async function downloadSlidePng(slideElement, {
  mode = "full",
  fileName,
  windowRef = globalThis.window,
  documentRef = globalThis.document,
  ...options
} = {}) {
  if (!documentRef?.createElement || !windowRef?.URL?.createObjectURL) return false;
  let objectUrl;
  try {
    const blob = await renderSlidePng(slideElement, { mode, windowRef, documentRef, ...options });
    objectUrl = windowRef.URL.createObjectURL(blob);
    const anchor = documentRef.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName || slidePngFileName(options.position, mode);
    anchor.rel = "noopener";
    anchor.click();
    return true;
  } finally {
    if (objectUrl) windowRef.setTimeout?.(() => windowRef.URL.revokeObjectURL?.(objectUrl), 0);
  }
}