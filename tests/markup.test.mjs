import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const file of ["index.html", "build/index.html"]) {
  test(`${file} keeps accessible names for compact action buttons`, () => {
    const html = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<button[^>]*id="randomize"[^>]*aria-label="ランダム"/s);
    assert.match(html, /<button[^>]*id="sample-deck"[^>]*aria-label="サンプルデッキ"/s);
  });
}
