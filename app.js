import { normalizeState, stateFromSearch, stateToSearchParams } from "./state.mjs";
import {
  clearContentDraft,
  contentForRole,
  normalizeContent,
  readContentDraft,
  writeContentDraft,
} from "./content.mjs";

const appShell = document.querySelector(".app-shell");
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
const editModeToggle = document.querySelector("#edit-mode-toggle");
const editorPanel = document.querySelector("#editor-panel");
const editorKicker = document.querySelector("#edit-kicker");
const editorTitle = document.querySelector("#edit-title");
const editorBody = document.querySelector("#edit-body");
const editorStatus = document.querySelector("#editor-status");
const resetContentButton = document.querySelector("#reset-content");

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

let editMode = false;
let currentContent = contentForRole("cover");

function renderContent(content) {
  roleLabel.textContent = content.kicker;
  slideTitle.textContent = content.title;
  slideCopy.textContent = content.body;
}

function fillEditor(content) {
  editorKicker.value = content.kicker;
  editorTitle.value = content.title;
  editorBody.value = content.body;
}

function applyContent(content, source = "content preset") {
  currentContent = normalizeContent(content, contentForRole(roleSelect.value));
  renderContent(currentContent);
  fillEditor(currentContent);
  editorStatus.textContent = source;
}

function loadContentForRole(role) {
  const draft = readContentDraft(role);
  applyContent(draft ?? contentForRole(role), draft ? "このブラウザの下書きを読み込みました" : "役割の初期文を表示中");
}

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
  loadContentForRole(role);
  const sceneLabel = scene === "none" ? "" : ` · ${labels[scene]}`;
  slideMeta.textContent = `${labels[season]} · ${labels[period]} · ${labels[weather]}${sceneLabel}`;
  status.textContent = source;
  return normalized;
}

function editorContent() {
  return normalizeContent({
    kicker: editorKicker.value,
    title: editorTitle.value,
    body: editorBody.value,
  }, contentForRole(roleSelect.value));
}

function saveEditedContent() {
  currentContent = editorContent();
  renderContent(currentContent);
  const saved = writeContentDraft(roleSelect.value, currentContent);
  editorStatus.textContent = saved ? "自動保存済み（このブラウザ）" : "表示中（保存できませんでした）";
  status.textContent = "editing draft";
}

function setEditMode(enabled) {
  editMode = enabled;
  appShell.dataset.mode = enabled ? "edit" : "preview";
  editorPanel.hidden = !enabled;
  editorPanel.setAttribute("aria-hidden", String(!enabled));
  editModeToggle.setAttribute("aria-pressed", String(enabled));
  editModeToggle.textContent = enabled ? "編集を閉じる" : "スライドを編集";
  status.textContent = enabled ? "edit mode" : "preview mode";
  if (enabled) editorKicker.focus();
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

editModeToggle.addEventListener("click", () => setEditMode(!editMode));
editorKicker.addEventListener("input", saveEditedContent);
editorTitle.addEventListener("input", saveEditedContent);
editorBody.addEventListener("input", saveEditedContent);
resetContentButton.addEventListener("click", () => {
  clearContentDraft(roleSelect.value);
  applyContent(contentForRole(roleSelect.value), "初期文に戻しました");
  status.textContent = "content reset";
});

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
