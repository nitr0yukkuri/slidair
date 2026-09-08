import assert from "node:assert/strict";
import test from "node:test";
import { MAX_RECENT_SCENES, SCENE_PREFERENCES_KEY, normalizeScenePreferences, readScenePreferences, rememberScene, toggleFavorite, writeScenePreferences } from "../scene-preferences.mjs";

function createStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("scene preferences normalize unknown and duplicate keys", () => {
  const result = normalizeScenePreferences({ favorites: ["space", "space", "unknown"], recent: ["city", "unknown", "city"] });
  assert.deepEqual(result, { favorites: ["space"], recent: ["city"] });
});

test("favorites toggle and recent history stay bounded", () => {
  let preferences = normalizeScenePreferences();
  preferences = toggleFavorite(preferences, "space");
  assert.deepEqual(preferences.favorites, ["space"]);
  preferences = toggleFavorite(preferences, "space");
  assert.deepEqual(preferences.favorites, []);
  for (const key of ["space", "city", "lake", "underwater", "deep-sea", "aurora-veil", "snowfield"]) preferences = rememberScene(preferences, key);
  assert.equal(preferences.recent.length, MAX_RECENT_SCENES);
  assert.equal(preferences.recent[0], "snowfield");
  assert.equal(preferences.recent.includes("space"), false);
});

test("scene preferences round-trip through browser storage", () => {
  const storage = createStorage();
  const preferences = { favorites: ["aurora-veil"], recent: ["space", "city"] };
  assert.equal(writeScenePreferences(preferences, storage), true);
  assert.ok(storage.getItem(SCENE_PREFERENCES_KEY));
  assert.deepEqual(readScenePreferences(storage), preferences);
});
