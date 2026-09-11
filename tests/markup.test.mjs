import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const file of ["index.html", "build/index.html"]) {
  test(`${file} keeps accessible names for compact action buttons`, () => {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<title>Slidair<\/title>/);
    assert.match(html, /<h1[^>]*>Slidair<\/h1>/);
    assert.doesNotMatch(html, /safe-area|文字安全度/);
    assert.doesNotMatch(html, /id="atmosphere-summary"/);
    assert.match(html, /<button[^>]*id="randomize"[^>]*aria-label="ランダム"/s);
    assert.match(html, /<button[^>]*id="save-deck"[^>]*aria-label="デッキを保存"/s);
    assert.match(html, /id="saved-decks-disclosure"/);
    assert.match(html, /<button[^>]*id="export-deck"[^>]*aria-label="JSONを書き出す"/s);
    assert.match(html, /<button[^>]*id="sample-deck"[^>]*aria-label="サンプルデッキ"/s);
    assert.match(html, /<button[^>]*id="import-deck"[^>]*aria-label="JSONデッキを読み込む"/s);
    assert.match(html, /id="deck-file-input"[^>]*accept="application\/json,.json"/s);
    assert.match(html, /id="story-options"/);
    assert.match(html, /id="apply-story"/);
    assert.match(html, /id="suggest-atmosphere"/);
    assert.match(html, /id="mobile-bottom-nav"/);
    for (const [target, label] of [["preview", "プレビュー"], ["deck", "デッキ"], ["settings", "背景"], ["present", "発表"]]) {
      assert.match(html, new RegExp(`data-mobile-target="${target}"[^>]*>[\\s\\S]*${label}`));
    }
  });
}

test("deck and scene preference controls keep explicit accessible names", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["undo-deck", "redo-deck", "move-slide-up", "move-slide-down", "duplicate-slide", "delete-slide", "favorite-scene", "import-deck", "save-deck", "export-deck"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*aria-label="[^"]+"`));
  }
  for (const filter of ["all", "favorites", "recent", "natural", "city", "dark"]) {
    assert.match(html, new RegExp(`class="scene-filter"[^>]*data-filter="${filter}"`));
  }
});
test("export page exposes named output actions", () => {
  for (const file of ["export.html", "build/export.html"]) {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<title>Slidair · 書き出し<\/title>/);
    assert.match(html, /id="export-slides"/);
    assert.match(html, /id="export-png"[^>]*>PNGを書き出す<\/button>/s);
    assert.match(html, /id="export-pdf"[^>]*>PDF \/ Canva用を作る<\/button>/s);
    assert.match(html, /id="export-json"[^>]*>Slidair JSONを保存<\/button>/s);
    assert.match(html, /id="export-share"[^>]*>共有URLをコピー<\/button>/s);
    assert.match(html, /id="back-to-editor"/);
    assert.match(html, /id="slide-template"/);
  }
});