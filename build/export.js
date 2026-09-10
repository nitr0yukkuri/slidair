import { scenePreset } from "./scenes.mjs";
import { normalizeState, stateFromSearch, stateToSearchParams } from "./state.mjs";
import { contentForRole } from "./content.mjs";
import { createDeck, readDeck } from "./deck.mjs";
import { DECK_SHARE_PARAM, MAX_DECK_SHARE_LENGTH, deserializeDeck, serializeDeck } from "./deck-share.mjs";
import { downloadDeckFile } from "./deck-file.mjs";
import { downloadSlidePng, slidePngFileName } from "./slide-png.mjs";
import { suggestedDeckName } from "./saved-decks.mjs";

const roleNames = Object.freeze({
  cover: "表紙",
  section: "区切り",
  content: "本文",
  quote: "引用",
  closing: "締め",
});
const axisLabels = Object.freeze({
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
  morning: "朝",
  day: "昼",
  evening: "夕方",
  night: "夜",
  clear: "晴れ",
  cloudy: "曇り",
  rain: "雨",
  snow: "雪",
});

const exportSlides = document.querySelector("#export-slides");
const exportDeckTitle = document.querySelector("#export-deck-title");
const exportCount = document.querySelector("#export-count");
const exportStatus = document.querySelector("#export-status");
const template = document.querySelector("#slide-template");
const exportPngButton = document.querySelector("#export-png");
const exportPdfButton = document.querySelector("#export-pdf");
const exportJsonButton = document.querySelector("#export-json");
const exportShareButton = document.querySelector("#export-share");
const backToEditor = document.querySelector("#back-to-editor");
let activeIndex = 0;

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
  Object.entries(properties).forEach(([property, value]) => {
    if (value == null) element.style.removeProperty(property);
    else element.style.setProperty(property, String(value));
  });
}

function fitSlideContent(slide) {
  const content = slide.querySelector(".slide-content");
  if (!content) return;
  const fits = (scale) => {
    content.style.setProperty("--content-scale", String(scale));
    const required = [...content.children].reduce((height, element) => {
      const style = getComputedStyle(element);
      return height + element.getBoundingClientRect().height
        + (Number.parseFloat(style.marginTop) || 0)
        + (Number.parseFloat(style.marginBottom) || 0);
    }, 0);
    return required <= content.clientHeight;
  };
  if (fits(1)) return;
  let low = 0.2;
  let high = 1;
  for (let step = 0; step < 9; step += 1) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  fits(low);
}

function slideStateLabel(state) {
  const scene = scenePreset(state.scene);
  return [axisLabels[state.season], axisLabels[state.period], scene.label].join(" · ");
}

function createExportSlide(slideItem, index) {
  const state = normalizeState(slideItem.state);
  const content = slideItem.content ?? contentForRole(state.role);
  const element = template.content.firstElementChild.cloneNode(true);
  element.dataset.season = state.season;
  element.dataset.period = state.period;
  element.dataset.weather = state.weather;
  element.dataset.scene = state.scene;
  element.dataset.role = state.role;
  applyScenePresentation(element, state.scene);

  const filter = element.querySelector("filter");
  const filterId = `grain-export-${index + 1}`;
  filter.id = filterId;
  element.querySelector("rect")?.setAttribute("filter", `url(#${filterId})`);
  element.querySelector(".slide-kicker").textContent = content.kicker;
  element.querySelector("[data-edit-field='title']").textContent = content.title;
  element.querySelector("[data-edit-field='body']").textContent = content.body;

  const item = document.createElement("article");
  item.className = "export-slide-item";
  item.dataset.index = String(index);
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-pressed", String(index === activeIndex));
  item.setAttribute("aria-label", `${index + 1}枚目、${roleNames[state.role]}、${content.title.replace(/\s+/g, " ")}`);
  const meta = document.createElement("div");
  meta.className = "export-slide-meta";
  const number = document.createElement("span");
  number.className = "export-slide-number";
  number.textContent = String(index + 1).padStart(2, "0");
  const stateLabel = document.createElement("span");
  stateLabel.className = "export-slide-state";
  stateLabel.textContent = `${roleNames[state.role]} · ${slideStateLabel(state)}`;
  meta.append(number, stateLabel);
  item.append(meta, element);
  item.addEventListener("click", () => selectSlide(index));
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSlide(index);
    }
  });
  return item;
}

function selectSlide(index) {
  if (index < 0 || index >= deck.slides.length) return;
  activeIndex = index;
  exportSlides.querySelectorAll(".export-slide-item").forEach((item, itemIndex) => {
    const selected = itemIndex === activeIndex;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  exportStatus.textContent = `${index + 1}枚目を選択中`;
}

function renderDeck() {
  exportSlides.replaceChildren(...deck.slides.map(createExportSlide));
  exportCount.textContent = `${deck.slides.length}枚`;
  exportDeckTitle.textContent = suggestedDeckName(deck);
  document.title = `Slidair · ${suggestedDeckName(deck)} · 書き出し`;
  requestAnimationFrame(() => exportSlides.querySelectorAll(".export-slide").forEach(fitSlideContent));
  selectSlide(activeIndex);
}

function buildShareUrl() {
  const active = deck.slides[activeIndex] ?? deck.slides[0];
  const url = new URL("./", window.location.href);
  url.search = stateToSearchParams(active.state).toString();
  const payload = serializeDeck(deck);
  if (payload.length <= MAX_DECK_SHARE_LENGTH) url.searchParams.set(DECK_SHARE_PARAM, payload);
  return url.href;
}

async function copyShareUrl() {
  try {
    await navigator.clipboard.writeText(buildShareUrl());
    exportStatus.textContent = "共有URLをコピーしました";
  } catch {
    exportStatus.textContent = "コピーできませんでした。アドレスバーからURLをコピーできます";
  }
}

async function exportPng() {
  const item = exportSlides.querySelector(`.export-slide-item[data-index="${activeIndex}"] .export-slide`);
  if (!item) return;
  exportStatus.textContent = "PNGを書き出しています…";
  try {
    const downloaded = await downloadSlidePng(item, {
      mode: "full",
      position: activeIndex + 1,
      fileName: slidePngFileName(activeIndex + 1, "full"),
    });
    exportStatus.textContent = downloaded ? "PNGを書き出しました" : "PNGを書き出せませんでした";
  } catch {
    exportStatus.textContent = "PNGを書き出せませんでした";
  }
}

function exportPdf() {
  exportStatus.textContent = "印刷ダイアログを開きました。PDF保存を選べます";
  window.print();
}

function exportJson() {
  const downloaded = downloadDeckFile(deck, { title: suggestedDeckName(deck) });
  exportStatus.textContent = downloaded ? "Slidair JSONを書き出しました" : "JSONを書き出せませんでした";
}

const params = new URLSearchParams(window.location.search);
const sharedDeck = deserializeDeck(params.get(DECK_SHARE_PARAM));
const deck = sharedDeck ?? readDeck() ?? createDeck(
  stateFromSearch(window.location.search),
  contentForRole(stateFromSearch(window.location.search).role),
  "slide-1",
);
activeIndex = Math.max(0, deck.slides.findIndex((slideItem) => slideItem.id === deck.activeSlideId));
const editorUrl = new URL("./", window.location.href);
editorUrl.search = window.location.search;
backToEditor.href = editorUrl.href;
renderDeck();

exportPngButton.addEventListener("click", exportPng);
exportPdfButton.addEventListener("click", exportPdf);
exportJsonButton.addEventListener("click", exportJson);
exportShareButton.addEventListener("click", copyShareUrl);
