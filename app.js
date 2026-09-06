import { normalizeState, stateFromSearch, stateToSearchParams } from "./state.mjs";

const slide = document.querySelector("#slide");
const seasonSelect = document.querySelector("#season");
const periodSelect = document.querySelector("#period");
const weatherSelect = document.querySelector("#weather");
const sceneSelect = document.querySelector("#scene");
const roleSelect = document.querySelector("#role");
const status = document.querySelector("#status");
const roleLabel = document.querySelector("#role-label");
const slideTitle = document.querySelector("#slide-title");
const slideCopy = document.querySelector("#slide-copy");
const slideMeta = document.querySelector("#slide-meta");

const roleNames = {
  cover: "COVER / 01",
  section: "SECTION / 02",
  content: "CONTENT / 03",
  quote: "QUOTE / 04",
  closing: "CLOSING / 05",
};

const roleCopy = {
  cover: ["背景は、発表の<br>空気をつくる。", "文字より前に立たず、空気だけを残す。"],
  section: ["次の景色へ。", "次の話へ移るための、静かな区切り。"],
  content: ["内容を、<br>内容として見せる。", "内容を、内容として見せるために。"],
  quote: ["静かな背景は、<br>言葉を強くする。", "言葉のまわりに、余白を残す。"],
  closing: ["ここから先の<br>景色へ。", "発表のあとに、少しだけ残るもの。"],
};

const labels = {
  spring: "spring",
  summer: "summer",
  autumn: "autumn",
  winter: "winter",
  morning: "morning",
  day: "day",
  evening: "evening",
  night: "night",
  clear: "clear",
  cloudy: "cloudy",
  rain: "rain",
  snow: "snow",
  none: "none",
  fireworks: "fireworks",
  lake: "lake",
  city: "city",
};

function applyState(state, source = "manual preset") {
  const normalized = normalizeState(state);
  const { season, period, weather, scene, role } = normalized;
  seasonSelect.value = season;
  periodSelect.value = period;
  weatherSelect.value = weather;
  sceneSelect.value = scene;
  roleSelect.value = role;
  slide.dataset.season = season;
  slide.dataset.period = period;
  slide.dataset.weather = weather;
  slide.dataset.scene = scene;
  slide.dataset.role = role;
  roleLabel.textContent = roleNames[role];
  slideTitle.innerHTML = roleCopy[role][0];
  slideCopy.textContent = roleCopy[role][1];
  const sceneLabel = scene === "none" ? "" : ` · ${labels[scene]}`;
  slideMeta.textContent = `${labels[season]} · ${labels[period]} · ${labels[weather]}${sceneLabel}`;
  status.textContent = source;
  return normalized;
}

function currentState() {
  return normalizeState({
    season: seasonSelect.value,
    period: periodSelect.value,
    weather: weatherSelect.value,
    scene: sceneSelect.value,
    role: roleSelect.value,
  });
}

function updateUrl(state = currentState(), mode = "replace") {
  const url = new URL(window.location.href);
  url.search = stateToSearchParams(state).toString();
  const updateHistory = mode === "push" ? window.history.pushState : window.history.replaceState;
  updateHistory.call(window.history, {}, "", url);
  return url.href;
}

function timeToPeriod(hour) {
  if (hour < 6) return "night";
  if (hour < 10) return "morning";
  if (hour < 17) return "day";
  if (hour < 20) return "evening";
  return "night";
}

function selectChanged() {
  const state = applyState(currentState());
  updateUrl(state, "push");
}

seasonSelect.addEventListener("change", selectChanged);
periodSelect.addEventListener("change", selectChanged);
weatherSelect.addEventListener("change", selectChanged);
sceneSelect.addEventListener("change", selectChanged);
roleSelect.addEventListener("change", selectChanged);

document.querySelector("#now").addEventListener("click", () => {
  const state = applyState({ ...currentState(), period: timeToPeriod(new Date().getHours()) }, "local time preset");
  updateUrl(state, "push");
});

document.querySelector("#copy-url").addEventListener("click", async (event) => {
  const copyButton = event.currentTarget;
  const currentUrl = updateUrl();
  try {
    await navigator.clipboard.writeText(currentUrl);
    copyButton.textContent = "URLをコピーしました";
    window.setTimeout(() => { copyButton.textContent = "この状態のURLをコピー"; }, 1600);
  } catch {
    copyButton.textContent = "URLをアドレスバーからコピー";
    window.setTimeout(() => { copyButton.textContent = "この状態のURLをコピー"; }, 2200);
  }
});

const initialState = stateFromSearch(window.location.search);
applyState(initialState, "url preset");
updateUrl(initialState);

window.addEventListener("popstate", () => {
  applyState(stateFromSearch(window.location.search), "history preset");
});
