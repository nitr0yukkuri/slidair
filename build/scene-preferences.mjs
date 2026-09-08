import { SCENE_PRESETS } from "./scenes.mjs";

export const SCENE_PREFERENCES_KEY = "slide-atmosphere:scene-preferences:v1";
export const MAX_RECENT_SCENES = 6;
const SCENE_KEYS = new Set(SCENE_PRESETS.map((preset) => preset.key));

function cleanKeys(values, limit = Number.POSITIVE_INFINITY) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  return values.filter((key) => {
    if (!SCENE_KEYS.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

export function normalizeScenePreferences(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const favorites = cleanKeys(source.favorites);
  const recent = cleanKeys(source.recent, MAX_RECENT_SCENES);
  return { favorites, recent };
}

export function readScenePreferences(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target?.getItem(SCENE_PREFERENCES_KEY);
    return normalizeScenePreferences(raw ? JSON.parse(raw) : {});
  } catch {
    return normalizeScenePreferences();
  }
}

export function writeScenePreferences(preferences, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.setItem(SCENE_PREFERENCES_KEY, JSON.stringify(normalizeScenePreferences(preferences)));
    return Boolean(target);
  } catch {
    return false;
  }
}

export function toggleFavorite(preferences, sceneKey) {
  const normalized = normalizeScenePreferences(preferences);
  if (!SCENE_KEYS.has(sceneKey)) return normalized;
  const favorites = normalized.favorites.includes(sceneKey)
    ? normalized.favorites.filter((key) => key !== sceneKey)
    : [...normalized.favorites, sceneKey];
  return { ...normalized, favorites };
}

export function rememberScene(preferences, sceneKey) {
  const normalized = normalizeScenePreferences(preferences);
  if (!SCENE_KEYS.has(sceneKey)) return normalized;
  return { ...normalized, recent: [sceneKey, ...normalized.recent.filter((key) => key !== sceneKey)].slice(0, MAX_RECENT_SCENES) };
}
