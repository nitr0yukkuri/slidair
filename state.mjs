export const STATE_KEYS = Object.freeze([
  "season",
  "period",
  "weather",
  "scene",
  "role",
]);

export const STATE_OPTIONS = Object.freeze({
  season: Object.freeze(["spring", "summer", "autumn", "winter"]),
  period: Object.freeze(["morning", "day", "evening", "night"]),
  weather: Object.freeze(["clear", "cloudy", "rain", "snow"]),
  scene: Object.freeze(["none", "fireworks", "lake", "city"]),
  role: Object.freeze(["cover", "section", "content", "quote", "closing"]),
});

export const DEFAULT_STATE = Object.freeze({
  season: "autumn",
  period: "night",
  weather: "clear",
  scene: "none",
  role: "cover",
});

export function normalizeState(input = {}) {
  return Object.fromEntries(
    STATE_KEYS.map((key) => {
      const value = input[key];
      const normalized = STATE_OPTIONS[key].includes(value) ? value : DEFAULT_STATE[key];
      return [key, normalized];
    }),
  );
}

export function stateFromSearch(search = "") {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  return normalizeState(Object.fromEntries(STATE_KEYS.map((key) => [key, params.get(key)])));
}

export function stateToSearchParams(state) {
  const params = new URLSearchParams();
  const normalized = normalizeState(state);
  STATE_KEYS.forEach((key) => params.set(key, normalized[key]));
  return params;
}
