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

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    season: params.get("season") || seasonSelect.value,
    period: params.get("period") || periodSelect.value,
    weather: params.get("weather") || weatherSelect.value,
    scene: params.get("scene") || sceneSelect.value,
    role: params.get("role") || roleSelect.value,
  };
}

function validValue(select, value) {
  return [...select.options].some((option) => option.value === value) ? value : select.value;
}

function applyState(state, source = "manual preset") {
  const season = validValue(seasonSelect, state.season);
  const period = validValue(periodSelect, state.period);
  const weather = validValue(weatherSelect, state.weather);
  const scene = validValue(sceneSelect, state.scene);
  const role = validValue(roleSelect, state.role);
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
}

function currentState() {
  return { season: seasonSelect.value, period: periodSelect.value, weather: weatherSelect.value, scene: sceneSelect.value, role: roleSelect.value };
}

function updateUrl() {
  const url = new URL(window.location.href);
  const state = currentState();
  Object.entries(state).forEach(([key, value]) => url.searchParams.set(key, value));
  window.history.replaceState({}, "", url);
}

function timeToPeriod(hour) {
  if (hour < 6) return "night";
  if (hour < 10) return "morning";
  if (hour < 17) return "day";
  if (hour < 20) return "evening";
  return "night";
}

function selectChanged() {
  applyState(currentState());
  updateUrl();
}

seasonSelect.addEventListener("change", selectChanged);
periodSelect.addEventListener("change", selectChanged);
weatherSelect.addEventListener("change", selectChanged);
sceneSelect.addEventListener("change", selectChanged);
roleSelect.addEventListener("change", selectChanged);

document.querySelector("#now").addEventListener("click", () => {
  applyState({ ...currentState(), period: timeToPeriod(new Date().getHours()) }, "local time preset");
  updateUrl();
});

document.querySelector("#copy-url").addEventListener("click", async (event) => {
  const copyButton = event.currentTarget;
  updateUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyButton.textContent = "URLをコピーしました";
    window.setTimeout(() => { copyButton.textContent = "この状態のURLをコピー"; }, 1600);
  } catch {
    copyButton.textContent = "URLをアドレスバーからコピー";
    window.setTimeout(() => { copyButton.textContent = "この状態のURLをコピー"; }, 2200);
  }
});

applyState(readStateFromUrl(), "url preset");

