import assert from "node:assert/strict";
import test from "node:test";
import { slideExportPayload, slidePngFileName } from "../slide-png.mjs";

function fakeSlide(properties) {
  const style = { setProperty: (...args) => properties.push(args) };
  const content = { style };
  return {
    cloneNode: () => ({
      removeAttribute: () => {},
      classList: { add: () => {} },
      style,
      querySelectorAll: () => [content],
      outerHTML: "<article class=slide></article>",
    }),
  };
}

test("PNG filenames are stable for full and background exports", () => {
  assert.equal(slidePngFileName(1, "full"), "slidair-slide-01-full.png");
  assert.equal(slidePngFileName(7, "background"), "slidair-slide-07-background.png");
});

test("PNG export payload freezes the slide at 1920x1080 and hides content for background mode", () => {
  const properties = [];
  const slide = fakeSlide(properties);
  const documentRef = { styleSheets: [], baseURI: "http://127.0.0.1:4173/" };
  const payload = slideExportPayload(slide, { mode: "background", documentRef, width: 1920, height: 1080 });
  assert.deepEqual(payload, { html: "<article class=slide></article>", css: "", width: 1920, height: 1080 });
  assert.ok(properties.some(([name, value]) => name === "display" && value === "none"));
});