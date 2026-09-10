import assert from "node:assert/strict";
import test from "node:test";
import { suggestAtmospheres } from "../atmosphere-suggestions.mjs";

test("text suggestions rank the matching mood first", () => {
  const suggestions = suggestAtmospheres({ title: "課題とコスト", body: "既存システムの運用を改善する" }, { role: "content" });
  assert.equal(suggestions.length, 3);
  assert.equal(suggestions[0].key, "quiet-tension");
  assert.ok(suggestions[0].matchedTerms.length >= 2);
  assert.deepEqual(suggestions.map((suggestion) => suggestion.key), ["quiet-tension", "technical-calm", "clear-forward"]);
});

test("generic text still returns three local candidates", () => {
  const suggestions = suggestAtmospheres({ title: "発表", body: "ここから始めます" }, { season: "autumn", role: "cover" });
  assert.equal(suggestions.length, 3);
  assert.ok(suggestions.every((suggestion) => suggestion.state.role === "cover"));
  assert.ok(suggestions.every((suggestion) => suggestion.confidence > 0 && suggestion.confidence <= 1));
});