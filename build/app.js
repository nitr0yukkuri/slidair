import { SCENE_PRESETS, scenePreset } from "./scenes.mjs";
import { normalizeState, stateFromSearch, stateToSearchParams } from "./state.mjs";
import {
  contentForRole,
  normalizeContent,
  readContentDraft,
} from "./content.mjs";
import {
  activeSlide as getActiveSlide,
  MAX_SLIDES,
  addSlide as addDeckSlide,
  deleteSlide as deleteDeckSlide,
  duplicateSlide as duplicateDeckSlide,
  moveSlide as moveDeckSlide,
  createDeck,
  readDeck,
  selectSlide as selectDeckSlide,
  updateSlide,
  writeDeck,
} from "./deck.mjs";
import { readScenePreferences, rememberScene, toggleFavorite, writeScenePreferences } from "./scene-preferences.mjs";
import { DECK_SHARE_PARAM, MAX_DECK_SHARE_LENGTH, deserializeDeck, serializeDeck } from "./deck-share.mjs";

const appShell = document.querySelector(".app-shell");
const slide = document.querySelector("#slide");
const seasonSelect = document.querySelector("#season");
const periodSelect = document.querySelector("#period");
const weatherSelect = document.querySelector("#weather");
const sceneSelect = document.querySelector("#scene");
const roleSelect = document.querySelector("#role");
const status = document.querySelector("#status");
const randomizeButton = document.querySelector("#randomize");
const sampleDeckButton = document.querySelector("#sample-deck");
const roleLabel = document.querySelector("#role-label");
const slideTitle = document.querySelector("#slide-title");
const slideCopy = document.querySelector("#slide-copy");
const slideEditChrome = document.querySelector("#slide-edit-chrome");
const deckStrip = document.querySelector("#deck-strip");
const slideCount = document.querySelector("#slide-count");
const addSlideButton = document.querySelector("#add-slide");
const moveSlideUpButton = document.querySelector("#move-slide-up");
const moveSlideDownButton = document.querySelector("#move-slide-down");
const duplicateSlideButton = document.querySelector("#duplicate-slide");
const deleteSlideButton = document.querySelector("#delete-slide");
const favoriteSceneButton = document.querySelector("#favorite-scene");
const scenePreferenceNote = document.querySelector("#scene-preference-note");
const sceneFilterButtons = [...document.querySelectorAll(".scene-filter")];
const deckNote = document.querySelector("#deck-note");
const editModeToggle = document.querySelector("#edit-mode-toggle");
const slideOnlyToggle = document.querySelector("#slide-only-toggle");
const editorPanel = document.querySelector("#editor-panel");
const editorKicker = document.querySelector("#edit-kicker");
const editorTitle = document.querySelector("#edit-title");
const editorBody = document.querySelector("#edit-body");
const editorStatus = document.querySelector("#editor-status");
const resetContentButton = document.querySelector("#reset-content");
const presentationChrome = document.querySelector("#presentation-chrome");
const presentationExit = document.querySelector("#presentation-exit");
const slidePosition = document.querySelector("#slide-position");
const activeRoleName = document.querySelector("#active-role-name");
const atmosphereSummary = document.querySelector("#atmosphere-summary");
let copyFeedbackTimer;

let editMode = false;
let presentationMode = false;
let currentContent = contentForRole("cover");
let deck = null;
let scenePreferences = readScenePreferences();
let activeSceneFilter = 'all';

const roleNames = Object.freeze({
  cover: "表紙",
  section: "区切り",
  content: "本文",
  quote: "引用",
  closing: "締め",
});

const SCENE_OG_ASSETS = Object.freeze({
  none: "og-cover.png",
  fireworks: "scene-fireworks-v2.png",
  lake: "scene-lake.png",
  city: "scene-city.png",
  space: "scene-space-nebula-v1.webp",
  underwater: "scene-underwater-v1.webp",
  countryside: "scene-countryside-v1.webp",
  "clear-sky": "scene-clear-sky-v1.webp",
  "deep-sea": "scene-deep-sea-v1.webp",
  "first-sunrise": "scene-first-sunrise-v1.webp",
  "forest-light": "scene-forest-light-v1.webp",
  "bamboo-grove": "scene-bamboo-grove-v1.webp",
  "sakura-mist": "scene-sakura-mist-v1.webp",
  "hydrangea-rain": "scene-hydrangea-rain-v1.webp",
  "lavender-haze": "scene-lavender-haze-v1.webp",
  "autumn-haze": "scene-autumn-haze-v1.webp",
  snowfield: "scene-snowfield-v1.webp",
  "sand-dunes": "scene-sand-dunes-v1.webp",
  "moonlit-shore": "scene-moonlit-shore-v1.webp",
  "aurora-veil": "scene-aurora-veil-v1.webp",
});
const RANDOM_SEASONS = Object.freeze(["spring", "summer", "autumn", "winter"]);
const RANDOM_PERIODS = Object.freeze(["morning", "day", "evening", "night"]);
const RANDOM_WEATHER = Object.freeze(["clear", "cloudy", "rain", "snow"]);
const RANDOM_SCENES = Object.freeze(SCENE_PRESETS.filter((preset) => preset.key !== "none").map((preset) => preset.key));
const SAMPLE_DECK_STATES = Object.freeze([
  Object.freeze({ season: "summer", period: "evening", weather: "clear", scene: "aurora-veil", role: "cover" }),
  Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "forest-light", role: "section" }),
  Object.freeze({ season: "summer", period: "day", weather: "clear", scene: "clear-sky", role: "content" }),
  Object.freeze({ season: "autumn", period: "night", weather: "clear", scene: "moonlit-shore", role: "quote" }),
  Object.freeze({ season: "winter", period: "morning", weather: "snow", scene: "first-sunrise", role: "closing" }),
]);

const editableNodes = [
  { field: "kicker", element: roleLabel, label: "小見出し", hitX: 24, hitY: 18 },
  { field: "title", element: slideTitle, label: "タイトル", hitX: 30, hitY: 24 },
  { field: "body", element: slideCopy, label: "本文", hitX: 26, hitY: 20 },
];


let contentFitFrame;
function scheduleContentFit() {
  cancelAnimationFrame(contentFitFrame);
  contentFitFrame = requestAnimationFrame(fitSlideContent);
}

function fitSlideContent() {
  const content = slide.querySelector(".slide-content");
  const fits = (scale) => {
    content.style.setProperty("--content-scale", String(scale));
    const required = [...content.children].reduce((height, element) => {
      const style = getComputedStyle(element);
      return height + element.getBoundingClientRect().height
        + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }, 0);
    return required <= content.clientHeight;
  };
  if (!fits(1)) {
    let low = 0.2;
    let high = 1;
    for (let step = 0; step < 9; step += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    fits(low);
  }
  // A contenteditable field can scroll its clipped ancestor while being filled.
  slide.scrollTop = 0;
}

new ResizeObserver(scheduleContentFit).observe(slide);

function renderContent(content) {
  roleLabel.textContent = content.kicker;
  slideTitle.textContent = content.title;
  slideCopy.textContent = content.body;
  scheduleContentFit();
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

function currentSlide() {
  return deck ? getActiveSlide(deck) : null;
}

function persistDeck() {
  const saved = writeDeck(deck);
  deckNote.textContent = saved
    ? "このブラウザに保存済み"
    : "表示中（保存できませんでした）";
  deckNote.dataset.saved = String(saved);
  return saved;
}

function applyScenePresentation(element, key) {
  const preset = scenePreset(key);
  element.dataset.sceneFamily = preset.family ?? "";
  element.dataset.sceneTone = preset.tone ?? "";
  const properties = {
    "--landscape-art": preset.art ? `url("${preset.art}")` : null,
    "--scene-day-opacity": preset.dayOpacity,
    "--scene-evening-exposure": preset.eveningExposure,
    "--scene-night-exposure": preset.nightExposure,
  };
  for (const [property, value] of Object.entries(properties)) {
    if (value == null) element.style.removeProperty(property);
    else element.style.setProperty(property, String(value));
  }
}

function updateDeckActions() {
  const selectedIndex = deck.slides.findIndex((slideItem) => slideItem.id === deck.activeSlideId);
  const atStart = selectedIndex <= 0;
  const atEnd = selectedIndex < 0 || selectedIndex >= deck.slides.length - 1;
  moveSlideUpButton.disabled = atStart;
  moveSlideDownButton.disabled = atEnd;
  duplicateSlideButton.disabled = deck.slides.length >= MAX_SLIDES;
  deleteSlideButton.disabled = deck.slides.length <= 1;
  moveSlideUpButton.title = atStart ? "これ以上前へ移動できません。" : "選択中のスライドを前へ移動します。";
  moveSlideDownButton.title = atEnd ? "これ以上次へ移動できません。" : "選択中のスライドを次へ移動します。";
  duplicateSlideButton.title = deck.slides.length >= MAX_SLIDES ? "スライドは最大" + MAX_SLIDES + "枚までです。" : "選択中のスライドを複製します。";
  deleteSlideButton.title = deck.slides.length <= 1 ? "スライドが1枚のため削除できません。" : "選択中のスライドを削除します。";
}
function renderDeckStrip() {
  const previousScroll = deckStrip.scrollLeft;
  const restoreFocus = deckStrip.contains(document.activeElement);
  deckStrip.replaceChildren();
  deck.slides.forEach((slideItem, index) => {
    const item = document.createElement("div");
    item.className = "deck-item";
    item.setAttribute("role", "listitem");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "deck-thumb";
    button.setAttribute("aria-current", String(slideItem.id === deck.activeSlideId));
    button.setAttribute("aria-label", `${index + 1}枚目、${roleNames[slideItem.state.role]}`);

    const preview = document.createElement("span");
    preview.className = "deck-thumb-preview";
    preview.dataset.season = slideItem.state.season;
    preview.dataset.period = slideItem.state.period;
    preview.dataset.scene = slideItem.state.scene;
    preview.dataset.role = slideItem.state.role;
    applyScenePresentation(preview, slideItem.state.scene);

    const previewCopy = document.createElement("span");
    previewCopy.className = "deck-thumb-copy";
    const previewKicker = document.createElement("span");
    previewKicker.className = "deck-thumb-kicker";
    const previewTitle = document.createElement("span");
    previewTitle.className = "deck-thumb-title";
    previewTitle.textContent = slideItem.content.title;
    previewCopy.append(previewKicker, previewTitle);
    preview.append(previewCopy);

    const caption = document.createElement("span");
    caption.className = "deck-thumb-caption";
    const number = document.createElement("strong");
    number.textContent = String(index + 1).padStart(2, "0");
    const role = document.createElement("span");
    role.textContent = roleNames[slideItem.state.role];
    caption.append(number, role);

    button.append(preview, caption);
    button.addEventListener("click", () => selectSlide(slideItem.id));
    item.append(button);
    deckStrip.append(item);
  });
  slideCount.textContent = `${deck.slides.length}枚`;
  const atSlideLimit = deck.slides.length >= MAX_SLIDES;
  addSlideButton.disabled = atSlideLimit;
  addSlideButton.title = atSlideLimit
    ? `スライドは最大${MAX_SLIDES}枚までです。`
    : "新しいスライドを追加します。";
  updateDeckActions();
  if (atSlideLimit && deckNote.dataset.saved !== "false") {
    deckNote.textContent = `スライドは最大${MAX_SLIDES}枚までです。`;
  } else if (!atSlideLimit && deckNote.dataset.saved === "true") {
    deckNote.textContent = "このブラウザに保存済み";
  }
  deckStrip.scrollLeft = previousScroll;
  scrollActiveThumbnailIntoView();
  if (restoreFocus) deckStrip.querySelector('[aria-current="true"]')?.focus({ preventScroll: true });
}

function scrollActiveThumbnailIntoView() {
  if (presentationMode) return;
  const active = deckStrip.querySelector('[aria-current="true"]');
  if (!active) return;
  const bounds = deckStrip.getBoundingClientRect();
  const thumb = active.getBoundingClientRect();
  if (thumb.right > bounds.right - 4) deckStrip.scrollLeft += thumb.right - bounds.right + 4;
  else if (thumb.left < bounds.left + 4) deckStrip.scrollLeft += thumb.left - bounds.left - 4;
}

function renderActiveSlide(source = "slide selected") {
  const selected = currentSlide();
  if (!selected) return null;
  const state = normalizeState(selected.state);
  seasonSelect.value = state.season;
  periodSelect.value = state.period;
  weatherSelect.value = state.weather;
  sceneSelect.value = state.scene;
  roleSelect.value = state.role;
  slide.dataset.season = state.season;
  slide.dataset.period = state.period;
  slide.dataset.weather = state.weather;
  slide.dataset.scene = state.scene;
  slide.dataset.role = state.role;
  applyScenePresentation(slide, state.scene);
  applyContent(selected.content, source);
  syncInspector(state);
  const position = deck.slides.findIndex((item) => item.id === selected.id) + 1;
  const number = String(position).padStart(2, "0");
  slidePosition.textContent = `${number} / ${String(deck.slides.length).padStart(2, "0")}`;
  activeRoleName.textContent = roleNames[state.role];
  document.querySelector("#inspector-index").textContent = number;
  status.textContent = editMode ? "編集中" : "プレビュー";
  editorStatus.textContent = deckNote.dataset.saved === "false" ? "保存できませんでした" : "このブラウザに保存済み";
  return state;
}

function contentMatchesRole(content, role) {
  const normalized = normalizeContent(content, contentForRole(role));
  const preset = normalizeContent(contentForRole(role), contentForRole(role));
  return JSON.stringify(normalized) === JSON.stringify(preset);
}

function contentForRoleChange(content, previousRole, nextRole) {
  const nextPreset = contentForRole(nextRole);
  if (contentMatchesRole(content, previousRole)) return nextPreset;
  return { ...content, kicker: nextPreset.kicker };
}

function applyState(state, source = "manual preset") {
  const normalized = normalizeState(state);
  const selected = currentSlide();
  if (!selected) return normalized;
  const content = normalized.role === selected.state.role
    ? selected.content
    : contentForRoleChange(selected.content, selected.state.role, normalized.role);
  deck = updateSlide(deck, selected.id, { state: normalized, content });
  persistDeck();
  renderDeckStrip();
  renderActiveSlide(source);
  return normalized;
}

function textFromEditable(element) {
  return element.innerText.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
}

function editableContent() {
  return normalizeContent({
    kicker: textFromEditable(roleLabel),
    title: textFromEditable(slideTitle),
    body: textFromEditable(slideCopy),
  }, contentForRole(roleSelect.value));
}

function persistContent(content = editableContent()) {
  scheduleContentFit();
  currentContent = normalizeContent(content, contentForRole(roleSelect.value));
  const selected = currentSlide();
  if (!selected) return;
  deck = updateSlide(deck, selected.id, { content: currentContent });
  fillEditor(currentContent);
  renderDeckStrip();
  const saved = persistDeck();
  editorStatus.textContent = saved ? "自動保存済み（このブラウザ）" : "表示中（保存できませんでした）";
  status.textContent = "編集中";
}

function commitEditable(element) {
  const content = editableContent();
  const field = editableNodes.find((node) => node.element === element)?.field;
  if (field && element.textContent !== content[field]) element.textContent = content[field];
  persistContent(content);
}

function saveEditedContent() {
  persistContent();
}

function setEditableNodes(enabled) {
  slide.classList.toggle("is-editing", enabled);
  slideEditChrome.hidden = !enabled;
  slideEditChrome.setAttribute("aria-hidden", String(!enabled));
  editableNodes.forEach(({ element, label }) => {
    element.contentEditable = String(enabled);
    element.spellcheck = false;
    element.setAttribute("aria-label", `${label}を編集`);
    if (enabled) {
      element.setAttribute("role", "textbox");
      element.setAttribute("aria-multiline", "true");
    } else {
      element.removeAttribute("role");
      element.removeAttribute("aria-multiline");
      element.removeAttribute("aria-label");
    }
  });
}

function pastePlainText(event) {
  if (!event.clipboardData) return;
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditedContent();
}

function editableKeydown(event) {
  if (event.key === "Enter" && event.currentTarget === roleLabel) {
    event.preventDefault();
    commitEditable(event.currentTarget);
    event.currentTarget.blur();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    commitEditable(event.currentTarget);
    event.currentTarget.blur();
  }
}

function editableBlur(event) {
  if (editMode) commitEditable(event.currentTarget);
}

function finishActiveEdit() {
  const active = document.activeElement;
  if (editableNodes.some(({ element }) => element === active)) commitEditable(active);
}

function placeCaretAtEnd(element) {
  element.focus();
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function handleSlidePointerDown(event) {
  if (!editMode || event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest("[data-edit-field]")) return;

  const target = editableNodes.find(({ element, hitX, hitY }) => {
    const rect = element.getBoundingClientRect();
    return event.clientX >= rect.left - hitX
      && event.clientX <= rect.right + hitX
      && event.clientY >= rect.top - hitY
      && event.clientY <= rect.bottom + hitY;
  });
  if (!target) return;

  event.preventDefault();
  placeCaretAtEnd(target.element);
}

slide.addEventListener("pointerdown", handleSlidePointerDown);

editableNodes.forEach(({ element }) => {
  element.addEventListener("input", saveEditedContent);
  element.addEventListener("keydown", editableKeydown);
  element.addEventListener("blur", editableBlur);
  element.addEventListener("paste", pastePlainText);
});

function setEditMode(enabled) {
  if (!enabled) finishActiveEdit();
  editMode = enabled;
  appShell.dataset.mode = enabled ? "edit" : "preview";
  editorPanel.hidden = !enabled;
  editorPanel.setAttribute("aria-hidden", String(!enabled));
  editModeToggle.setAttribute("aria-pressed", String(enabled));
  editModeToggle.querySelector(".button-label").textContent = enabled ? "編集を完了" : "テキストを編集";
  editModeToggle.querySelector("use").setAttribute("href", enabled ? "#icon-check" : "#icon-edit");
  setEditableNodes(enabled);
  status.textContent = enabled ? "編集中" : "プレビュー";
}

function setPresentationMode(enabled) {
  if (enabled && editMode) setEditMode(false);
  presentationMode = enabled;
  appShell.dataset.view = enabled ? "slide-only" : "editor";
  presentationChrome.hidden = !enabled;
  presentationChrome.setAttribute("aria-hidden", String(!enabled));
  slideOnlyToggle.setAttribute("aria-pressed", String(enabled));
  if (enabled) presentationExit.focus();
  else {
    slideOnlyToggle.focus();
    scrollActiveThumbnailIntoView();
  }
}

function selectSlide(slideId, historyMode = "push") {
  if (slideId === deck.activeSlideId) return;
  finishActiveEdit();
  deck = selectDeckSlide(deck, slideId);
  persistDeck();
  renderDeckStrip();
  const state = renderActiveSlide("slide selected");
  updateUrl(state, historyMode);
}

function selectSlideByOffset(offset) {
  const currentIndex = deck.slides.findIndex((slideItem) => slideItem.id === deck.activeSlideId);
  const nextIndex = currentIndex + offset;
  const target = deck.slides[nextIndex];
  if (target) selectSlide(target.id, "replace");
}

function handleDeckKeydown(event) {
  if (presentationMode || editMode) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
  if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    duplicateCurrentSlide();
    return;
  }
  if ((event.key === "Delete" || event.key === "Backspace") && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    deleteCurrentSlide();
    return;
  }
  if (event.altKey && !event.metaKey && !event.ctrlKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault();
    moveCurrentSlide(event.key === "ArrowUp" ? -1 : 1);
  }
}
function handlePresentationKeydown(event) {
  if (!presentationMode) return;
  if (event.key === "Escape") {
    event.preventDefault();
    setPresentationMode(false);
    return;
  }
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    selectSlideByOffset(1);
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    selectSlideByOffset(-1);
  }
}

function operateOnCurrentSlide(operation, source) {
  finishActiveEdit();
  const selectedId = deck.activeSlideId;
  const nextDeck = operation(deck, selectedId);
  if (nextDeck === deck) return false;
  deck = nextDeck;
  persistDeck();
  renderDeckStrip();
  const state = renderActiveSlide(source);
  updateUrl(state, "push");
  status.textContent = source;
  return true;
}

function duplicateCurrentSlide() {
  if (deck.slides.length >= MAX_SLIDES) {
    status.textContent = "スライドは最大" + MAX_SLIDES + "枚までです";
    return;
  }
  operateOnCurrentSlide(duplicateDeckSlide, "スライドを複製しました");
}

function deleteCurrentSlide() {
  if (deck.slides.length <= 1) {
    status.textContent = "スライドは1枚以上必要です";
    return;
  }
  operateOnCurrentSlide(deleteDeckSlide, "スライドを削除しました");
}

function moveCurrentSlide(offset) {
  operateOnCurrentSlide((currentDeck, selectedId) => moveDeckSlide(currentDeck, selectedId, offset), offset < 0 ? "スライドを前へ移動しました" : "スライドを次へ移動しました");
}
function addNewSlide() {
  finishActiveEdit();
  if (deck.slides.length >= MAX_SLIDES) {
    status.textContent = `スライドは最大${MAX_SLIDES}枚までです`;
    return;
  }
  const selected = currentSlide();
  const nextState = {
    ...selected.state,
    role: "content",
  };
  deck = addDeckSlide(deck, nextState, contentForRole(nextState.role));
  persistDeck();
  renderDeckStrip();
  const state = renderActiveSlide("new slide");
  updateUrl(state, "push");
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomizeAtmosphere() {
  finishActiveEdit();
  const nextState = {
    ...currentState(),
    season: randomItem(RANDOM_SEASONS),
    period: randomItem(RANDOM_PERIODS),
    weather: randomItem(RANDOM_WEATHER),
    scene: randomItem(RANDOM_SCENES),
  };
  const state = applyState(nextState, "random atmosphere");
  updateUrl(state, "push");

}

function loadSampleDeck() {
  finishActiveEdit();
  const selected = currentSlide();
  const shouldConfirm = deck.slides.length > 1
    || (selected && !contentMatchesRole(selected.content, selected.state.role));
  if (shouldConfirm && !window.confirm("現在のデッキを5枚のサンプルデッキに置き換えますか？")) return;

  let nextDeck = createDeck(
    SAMPLE_DECK_STATES[0],
    contentForRole(SAMPLE_DECK_STATES[0].role),
    "sample-1",
  );
  SAMPLE_DECK_STATES.slice(1).forEach((state) => {
    nextDeck = addDeckSlide(nextDeck, state, contentForRole(state.role));
  });
  deck = selectDeckSlide(nextDeck, nextDeck.slides[0].id);
  persistDeck();
  renderDeckStrip();
  const state = renderActiveSlide("sample deck");
  updateUrl(state, "push");
  status.textContent = "サンプルデッキを作成しました";
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

function setMetaContent(selector, content) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", content);
}

function updateShareMetadata(state, href = window.location.href) {
  const preset = scenePreset(state.scene);
  const period = periodSelect.selectedOptions[0]?.textContent ?? "";
  const sceneTitle = preset.key === "none" ? "静かな背景" : preset.label + "の空気";
  const shareTitle = sceneTitle + " · " + period + " | slide-atmosphere";
  const shareDescription = preset.key === "none"
    ? "季節・時間帯・天気から、言葉を邪魔しないプレゼン背景をつくる。"
    : preset.label + "の空気をまとったプレゼンテーション背景。";
  const imageAsset = SCENE_OG_ASSETS[preset.key] ?? SCENE_OG_ASSETS.none;
  const imageUrl = new URL("./assets/" + imageAsset, window.location.href).href;
  document.title = shareTitle;
  setMetaContent('meta[property="og:title"]', shareTitle);
  setMetaContent('meta[property="og:description"]', shareDescription);
  setMetaContent('meta[property="og:url"]', href);
  setMetaContent('meta[property="og:image"]', imageUrl);
  setMetaContent('meta[name="twitter:title"]', shareTitle);
  setMetaContent('meta[name="twitter:description"]', shareDescription);
  setMetaContent('meta[name="twitter:image"]', imageUrl);
}
function updateUrl(state = currentState(), mode = "replace") {
  const normalized = normalizeState(state);
  const url = new URL(window.location.href);
  const preserveDeck = url.searchParams.has(DECK_SHARE_PARAM);
  url.search = stateToSearchParams(normalized).toString();
  if (preserveDeck) {
    const payload = serializeDeck(deck);
    if (payload.length <= MAX_DECK_SHARE_LENGTH) url.searchParams.set(DECK_SHARE_PARAM, payload);
  }
  const updateHistory = mode === "push" ? window.history.pushState : window.history.replaceState;
  updateHistory.call(window.history, {}, "", url);
  updateShareMetadata(normalized, url.href);
  return url.href;
}

function buildDeckShareUrl() {
  const normalized = currentState();
  const url = new URL(window.location.href);
  url.search = stateToSearchParams(normalized).toString();
  const payload = serializeDeck(deck);
  if (payload.length > MAX_DECK_SHARE_LENGTH) return null;
  url.searchParams.set(DECK_SHARE_PARAM, payload);
  window.history.replaceState({}, "", url);
  updateShareMetadata(normalized, url.href);
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
  if (sceneSelect.value) rememberSelectedScene();
  const state = applyState(currentState());
  updateUrl(state, "push");
}

seasonSelect.addEventListener("change", selectChanged);
periodSelect.addEventListener("change", selectChanged);
weatherSelect.addEventListener("change", selectChanged);
sceneSelect.addEventListener("change", selectChanged);
roleSelect.addEventListener("change", selectChanged);

editModeToggle.addEventListener("click", () => setEditMode(!editMode));
slideOnlyToggle.addEventListener("click", () => setPresentationMode(!presentationMode));
presentationExit.addEventListener("click", () => setPresentationMode(false));
addSlideButton.addEventListener("click", addNewSlide);
randomizeButton.addEventListener("click", randomizeAtmosphere);
sampleDeckButton.addEventListener("click", loadSampleDeck);
moveSlideUpButton.addEventListener("click", () => moveCurrentSlide(-1));
moveSlideDownButton.addEventListener("click", () => moveCurrentSlide(1));
duplicateSlideButton.addEventListener("click", duplicateCurrentSlide);
deleteSlideButton.addEventListener("click", deleteCurrentSlide);
sceneFilterButtons.forEach((button) => button.addEventListener("click", () => applySceneFilter(button.dataset.filter)));
favoriteSceneButton.addEventListener("click", () => {
  scenePreferences = toggleFavorite(scenePreferences, sceneSelect.value);
  writeScenePreferences(scenePreferences);
  updateFavoriteSceneControl();
  if (activeSceneFilter === "favorites") applySceneFilter();
  status.textContent = scenePreferences.favorites.includes(sceneSelect.value)
    ? "お気に入りに追加しました"
    : "お気に入りから解除しました";
});
resetContentButton.addEventListener("click", () => {
  const selected = currentSlide();
  deck = updateSlide(deck, selected.id, { content: contentForRole(selected.state.role) });
  persistDeck();
  renderDeckStrip();
  renderActiveSlide("初期文に戻しました");
  status.textContent = "初期文に戻しました";
});

document.querySelector("#now").addEventListener("click", () => {
  const state = applyState({ ...currentState(), period: timeToPeriod(new Date().getHours()) }, "local time preset");
  updateUrl(state, "push");
});

document.querySelector("#copy-url").addEventListener("click", async (event) => {
  const copyButton = event.currentTarget;
  const label = copyButton.querySelector(".button-label");
  window.clearTimeout(copyFeedbackTimer);
  const deckUrl = buildDeckShareUrl();
  const currentUrl = deckUrl ?? updateUrl();
  if (!deckUrl) status.textContent = "デッキが長すぎるため背景URLをコピーします";
  try {
    await navigator.clipboard.writeText(currentUrl);
    label.textContent = "コピーしました";
    copyButton.querySelector("use").setAttribute("href", "#icon-check");
    status.textContent = deckUrl ? "デッキ全体のURLをコピーしました" : "背景URLをコピーしました";
  } catch {
    label.textContent = "コピー失敗";
    status.textContent = "アドレスバーからURLをコピーできます";
  }
  copyFeedbackTimer = window.setTimeout(() => {
    label.textContent = "デッキを共有";
    copyButton.querySelector("use").setAttribute("href", "#icon-link");
    status.textContent = editMode ? "編集中" : "プレビュー";
  }, 2200);
});

function applySceneFilter(filter = activeSceneFilter) {
  activeSceneFilter = filter;
  const sceneGroup = document.querySelector(".scene-choices");
  if (!sceneGroup) return;
  const visibleKeys = filter === "favorites"
    ? new Set(scenePreferences.favorites)
    : filter === "recent"
      ? new Set(scenePreferences.recent)
      : null;
  sceneGroup.querySelectorAll(".choice-button").forEach((button) => {
    const categories = (button.dataset.categories ?? "").split(" ").filter(Boolean);
    const matches = filter === "all"
      ? true
      : visibleKeys
        ? visibleKeys.has(button.dataset.value)
        : categories.includes(categoryName);
    button.hidden = !matches;
  });
  sceneFilterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
  const empty = filter !== "all" && !sceneGroup.querySelector(".choice-button:not([hidden])");
  scenePreferenceNote.hidden = !empty;
  scenePreferenceNote.textContent = filter === "favorites"
    ? "お気に入りの景色はまだありません。ハートで追加できます。"
    : filter === "recent"
      ? "最近使った景色はまだありません。景色を選ぶとここに表示されます。"
      : "このカテゴリの景色はありません。";
}

function updateFavoriteSceneControl() {
  const key = sceneSelect.value;
  const favorite = scenePreferences.favorites.includes(key);
  const label = favorite ? "お気に入りから解除" : "お気に入りに追加";
  favoriteSceneButton.setAttribute("aria-pressed", String(favorite));
  favoriteSceneButton.setAttribute("aria-label", label);
  favoriteSceneButton.title = label + "します。";
  favoriteSceneButton.classList.toggle("is-favorite", favorite);
}

function rememberSelectedScene() {
  scenePreferences = rememberScene(scenePreferences, sceneSelect.value);
  writeScenePreferences(scenePreferences);
  updateFavoriteSceneControl();
  if (activeSceneFilter === "recent" || activeSceneFilter === "favorites") applySceneFilter();
}
function setupChoiceControls() {
  const optionIcons = {
    morning: "sunrise", day: "sun", evening: "sunset", night: "moon",
    clear: "sun", cloudy: "cloud", rain: "rain", snow: "snow",
  };
  document.querySelectorAll("[data-choice-control]").forEach((control) => {
    const select = control.querySelector("select");
    const label = control.querySelector("label");
    const group = document.createElement("div");
    group.className = "choice-group" + (select.id === "scene" ? " scene-choices" : "");
    group.setAttribute("role", "group");
    label.id = `${select.id}-label`;
    group.setAttribute("aria-labelledby", label.id);
    for (const option of select.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.dataset.value = option.value;
      if (select.id === "scene") {
        applyScenePresentation(button, option.value);
        const preset = scenePreset(option.value);
        button.dataset.categories = (preset.categories ?? []).join(" ");
        button.dataset.sceneLabel = option.textContent;
      }
      button.setAttribute("aria-pressed", String(option.selected));
      if (optionIcons[option.value]) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("icon");
        svg.setAttribute("aria-hidden", "true");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", `#icon-${optionIcons[option.value]}`);
        svg.append(use);
        button.append(svg);
      } else {
        const swatch = document.createElement("span");
        swatch.className = select.id === "scene" ? "scene-swatch" : "season-dot";
        swatch.setAttribute("aria-hidden", "true");
        button.append(swatch);
      }
      const text = document.createElement("span");
      text.textContent = option.textContent;
      button.append(text);
      button.addEventListener("click", () => {
        if (select.value === option.value) return;
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      group.append(button);
    }
    group.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const buttons = [...group.querySelectorAll("button:not([hidden]):not(:disabled)")];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const vertical = ["ArrowUp", "ArrowDown"].includes(event.key);
      const step = select.id === "scene" && vertical
        ? getComputedStyle(group).gridTemplateColumns.split(" ").length
        : 1;
      const offset = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -step : step;
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + offset + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    });
    select.hidden = true;
    label.removeAttribute("for");
    control.append(group);
  });
}

function syncInspector(state) {
  document.querySelectorAll("[data-choice-control]").forEach((control) => {
    const key = control.dataset.choiceControl;
    const unavailable = key === "weather" && state.scene !== "none";
    const group = control.querySelector(".choice-group");
    group.setAttribute("aria-disabled", String(unavailable));
    control.querySelectorAll(".choice-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.value === state[key]));
      button.disabled = unavailable;
    });
  });
  const labelFor = (select) => select.selectedOptions[0]?.textContent ?? "";
  document.querySelector("#scene-value").textContent = labelFor(sceneSelect);
  document.querySelector("#weather-note").textContent = state.scene === "none"
    ? "季節の色は、スライドの下部に。"
    : "景色の選択中は、天気は反映されません。";
  atmosphereSummary.textContent = [labelFor(seasonSelect), labelFor(periodSelect), labelFor(state.scene === "none" ? weatherSelect : sceneSelect)].join(" · ");
  updateFavoriteSceneControl();
}

sceneSelect.replaceChildren(...SCENE_PRESETS.map(preset => new Option(preset.label, preset.key)));
setupChoiceControls();
applySceneFilter();
const initialState = stateFromSearch(window.location.search);
const sharedDeck = deserializeDeck(new URLSearchParams(window.location.search).get(DECK_SHARE_PARAM));
const savedDeck = sharedDeck ?? readDeck();
deck = savedDeck ?? createDeck(
  initialState,
  readContentDraft(initialState.role) ?? contentForRole(initialState.role),
  "slide-1",
);
let initialSource = sharedDeck ? "共有デッキを復元" : savedDeck ? "deck restored" : "url preset";
if (savedDeck) {
  const selected = currentSlide();
  const requestedState = stateFromSearch(window.location.search, selected.state);
  if (JSON.stringify(requestedState) !== JSON.stringify(selected.state)) {
    applyState(requestedState, "url preset");
    initialSource = "url preset";
  }
} else {
  persistDeck();
}
if (sharedDeck) persistDeck();
renderDeckStrip();
const activeState = renderActiveSlide(initialSource);
updateUrl(activeState);

window.addEventListener("popstate", () => {
  applyState(stateFromSearch(window.location.search), "history preset");
});

document.addEventListener("keydown", (event) => {
  handlePresentationKeydown(event);
  handleDeckKeydown(event);
});
