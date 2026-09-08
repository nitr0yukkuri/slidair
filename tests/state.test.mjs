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

test("stateFromSearch preserves omitted axes when applying a preset to a selected slide", () => {
  assert.deepEqual(
    stateFromSearch("?scene=space", {
      season: "summer",
      period: "day",
      weather: "rain",
      scene: "city",
      role: "content",
    }),
    {
      season: "summer",
      period: "day",
      weather: "rain",
      scene: "space",
      role: "content",
    },
  );
});

test("stateToSearchParams emits a canonical axis order", () => {
  assert.equal(
    stateToSearchParams({ role: "content", scene: "lake" }).toString(),
    "season=autumn&period=night&weather=clear&scene=lake&role=content",
  );
});

test("new landscape scenes survive shared URLs without changing other axes", () => {
  for (const scene of ["underwater", "countryside", "clear-sky", "deep-sea", "first-sunrise", "forest-light", "bamboo-grove", "sakura-mist", "hydrangea-rain", "lavender-haze", "autumn-haze", "snowfield", "sand-dunes", "moonlit-shore", "aurora-veil"]) {
    const state = { season: "winter", period: "morning", weather: "snow", scene, role: "quote" };
    assert.deepEqual(stateFromSearch(stateToSearchParams(state)), state);
    assert.deepEqual(stateFromSearch("?scene=" + scene, { ...state, scene: "space" }), state);
  }
});
