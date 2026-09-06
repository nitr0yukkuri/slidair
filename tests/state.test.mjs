import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_STATE,
  normalizeState,
  stateFromSearch,
  stateToSearchParams,
} from "../state.mjs";

test("normalizeState fills missing and invalid axes with the default state", () => {
  assert.deepEqual(normalizeState({ scene: "invalid", role: "quote" }), {
    ...DEFAULT_STATE,
    role: "quote",
  });
});

test("stateFromSearch parses a reproducible preset", () => {
  assert.deepEqual(
    stateFromSearch("?season=winter&period=day&weather=rain&scene=fireworks&role=section"),
    {
      season: "winter",
      period: "day",
      weather: "rain",
      scene: "fireworks",
      role: "section",
    },
  );
});

test("stateToSearchParams emits a canonical axis order", () => {
  assert.equal(
    stateToSearchParams({ role: "content", scene: "lake" }).toString(),
    "season=autumn&period=night&weather=clear&scene=lake&role=content",
  );
});
