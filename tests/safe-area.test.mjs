import assert from "node:assert/strict";
import test from "node:test";
import { contrastRatio, parseCssColor, scoreSafeArea } from "../safe-area.mjs";

test("safe area color math handles common CSS colors", () => {
  assert.deepEqual(parseCssColor("#fff"), [1, 1, 1]);
  assert.deepEqual(parseCssColor("rgb(0, 0, 0)"), [0, 0, 0]);
  assert.equal(Number(contrastRatio([1, 1, 1], [0, 0, 0]).toFixed(2)), 21);
});

test("safe area score rewards contrast and penalizes texture", () => {
  const calm = scoreSafeArea([{ label: "本文", textColor: [1, 1, 1], backgrounds: [[0, 0, 0]], texture: 0 }]);
  const busy = scoreSafeArea([{ label: "本文", textColor: [1, 1, 1], backgrounds: [[0, 0, 0], [0.5, 0.5, 0.5]], texture: 0.16 }]);
  assert.equal(calm.score, 100);
  assert.ok(busy.score < calm.score);
  assert.equal(busy.fields[0].label, "本文");
});