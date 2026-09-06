const slide = document.querySelector("#slide");
const periodSelect = document.querySelector("#period");
const weatherSelect = document.querySelector("#weather");
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
  cover: ["背景は、発表の空気をつくる。", "文字より前に立たず、でも何もないわけではない。静かな環境としてのプレゼンテーション背景。"],
  section: ["次の景色へ。", "セクションの境目に、少しだけ呼吸できる余白を置く。"],
  content: ["内容を、内容として見せる。", "背景の仕事は、文字や図表が読みやすい状態をつくること。"],
  quote: ["静かな背景は、言葉を強くする。", "視線を奪うのではなく、伝えたい一文の周りに空気を残す。"],
  closing: ["ここから先の景色へ。", "発表が終わったあとも、考えが少しだけ残るように。"],
};

const labels = {
  morning: "morning",
  day: "day",
  evening: "evening",
  night: "night",
  clear: "clear",
  cloudy: "cloudy",
  rain: "rain",
  snow: "snow",
};

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    period: params.get("period") || periodSelect.value,
    weather: params.get("weather") || weatherSelect.value,
    role: params.get("role") || roleSelect.value,
  };
}

function validValue(select, value) {
  return [...select.options].some((option) => option.value === value) ? value : select.value;
}

function applyState(state, source = "manual preset") {
  const period = validValue(periodSelect, state.period);
  const weather = validValue(weatherSelect, state.weather);
  const role = validValue(roleSelect, state.role);
  periodSelect.value = period;
  weatherSelect.value = weather;
  roleSelect.value = role;
  slide.dataset.period = period;
  slide.dataset.weather = weather;
  slide.dataset.role = role;
  roleLabel.textContent = roleNames[role];
  slideTitle.textContent = roleCopy[role][0];
  slideCopy.textContent = roleCopy[role][1];
  slideMeta.textContent = `${labels[period]} · ${labels[weather]}`;
  status.textContent = source;
}

function currentState() {
  return { period: periodSelect.value, weather: weatherSelect.value, role: roleSelect.value };
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

periodSelect.addEventListener("change", selectChanged);
weatherSelect.addEventListener("change", selectChanged);
roleSelect.addEventListener("change", selectChanged);

document.querySelector("#now").addEventListener("click", () => {
  applyState({ ...currentState(), period: timeToPeriod(new Date().getHours()) }, "local time preset");
  updateUrl();
});

document.querySelector("#copy-url").addEventListener("click", async (event) => {
  updateUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    event.currentTarget.textContent = "URLをコピーしました";
    window.setTimeout(() => { event.currentTarget.textContent = "この状態のURLをコピー"; }, 1600);
  } catch {
    event.currentTarget.textContent = "URLをアドレスバーからコピー";
    window.setTimeout(() => { event.currentTarget.textContent = "この状態のURLをコピー"; }, 2200);
  }
});

applyState(readStateFromUrl(), "url preset");
