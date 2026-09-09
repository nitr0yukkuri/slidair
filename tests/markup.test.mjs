import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const file of ["index.html", "build/index.html"]) {
  test(`${file} keeps accessible names for compact action buttons`, () => {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<title>Slidair<\/title>/);
    assert.match(html, /<h1[^>]*>Slidair<\/h1>/);
    assert.match(html, /<button[^>]*id="randomize"[^>]*aria-label="ランダム"/s);
    assert.match(html, /<button[^>]*id="sample-deck"[^>]*aria-label="サンプルデッキ"/s);
    assert.match(html, /id="story-options"/);
    assert.match(html, /id="apply-story"/);
    assert.match(html, /id="safe-area-score"/);
    assert.match(html, /id="suggest-atmosphere"/);
  });
}

test("deck and scene preference controls keep explicit accessible names", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["undo-deck", "redo-deck", "move-slide-up", "move-slide-down", "duplicate-slide", "delete-slide", "favorite-scene"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*aria-label="[^"]+"`));
  }
  for (const filter of ["all", "favorites", "recent", "natural", "city", "dark"]) {
    assert.match(html, new RegExp(`class="scene-filter"[^>]*data-filter="${filter}"`));
  }
});
