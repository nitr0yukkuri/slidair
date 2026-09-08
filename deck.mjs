import { DEFAULT_STATE, normalizeState } from "./state.mjs";
import { contentForRole, isLegacySampleContent, normalizeContent } from "./content.mjs";

export const DECK_STORAGE_KEY = "slide-atmosphere:deck:v1";
export const DECK_VERSION = 1;
export const MAX_SLIDES = 48;

let idSequence = 0;

function nextSlideId() {
  idSequence += 1;
  return `slide-${Date.now().toString(36)}-${idSequence.toString(36)}`;
}

export function createSlide(state = DEFAULT_STATE, content, id = nextSlideId()) {
  const normalizedState = normalizeState(state);
  return {
    id: typeof id === "string" && id ? id : nextSlideId(),
    state: normalizedState,
    content: normalizeContent(content ?? contentForRole(normalizedState.role), contentForRole(normalizedState.role)),
  };
}

export function createDeck(state = DEFAULT_STATE, content, id) {
  const slide = createSlide(state, content, id);
  return {
    version: DECK_VERSION,
    activeSlideId: slide.id,
    slides: [slide],
  };
}

export function normalizeSlide(input = {}, fallback = createSlide()) {
  const source = input && typeof input === "object" ? input : {};
  const fallbackState = normalizeState(fallback.state);
  const state = normalizeState(source.state ?? fallbackState);
  const fallbackContent = source.state?.role === state.role
    ? fallback.content
    : contentForRole(state.role);
  const content = normalizeContent(source.content, fallbackContent);
  return createSlide(
    state,
    isLegacySampleContent(state.role, content) ? contentForRole(state.role) : content,
    typeof source.id === "string" && source.id ? source.id : undefined,
  );
}

export function normalizeDeck(input, fallback = createDeck()) {
  const source = input && typeof input === "object" ? input : {};
  const rawSlides = Array.isArray(source.slides) ? source.slides : [];
  const slides = [];
  const ids = new Set();

  rawSlides.slice(0, MAX_SLIDES).forEach((rawSlide) => {
    const slide = normalizeSlide(rawSlide, fallback.slides[slides.length] ?? fallback.slides[0]);
    if (ids.has(slide.id)) slide.id = nextSlideId();
    ids.add(slide.id);
    slides.push(slide);
  });

  if (slides.length === 0) return fallback;
  const activeSlideId = slides.some((slide) => slide.id === source.activeSlideId)
    ? source.activeSlideId
    : slides[0].id;
  return { version: DECK_VERSION, activeSlideId, slides };
}

export function readDeck(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target?.getItem(DECK_STORAGE_KEY);
    return raw ? normalizeDeck(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeDeck(deck, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const normalized = normalizeDeck(deck);
    target?.setItem(DECK_STORAGE_KEY, JSON.stringify(normalized));
    return Boolean(target);
  } catch {
    return false;
  }
}

export function activeSlide(deck) {
  return deck.slides.find((slide) => slide.id === deck.activeSlideId) ?? deck.slides[0] ?? null;
}

export function selectSlide(deck, slideId) {
  if (!deck.slides.some((slide) => slide.id === slideId)) return deck;
  return { ...deck, activeSlideId: slideId };
}

export function updateSlide(deck, slideId, updates = {}) {
  return {
    ...deck,
    slides: deck.slides.map((slide) => {
      if (slide.id !== slideId) return slide;
      const state = normalizeState(updates.state ?? slide.state);
      return createSlide(
        state,
        updates.content ?? slide.content,
        slide.id,
      );
    }),
  };
}

export function addSlide(deck, state, content) {
  if (deck.slides.length >= MAX_SLIDES) return deck;
  const slide = createSlide(state, content);
  return {
    ...deck,
    activeSlideId: slide.id,
    slides: [...deck.slides, slide],
  };
}

export function duplicateSlide(deck, slideId = deck.activeSlideId) {
  if (deck.slides.length >= MAX_SLIDES) return deck;
  const index = deck.slides.findIndex((slide) => slide.id === slideId);
  if (index < 0) return deck;
  const source = deck.slides[index];
  const clone = createSlide(source.state, source.content);
  const slides = [...deck.slides];
  slides.splice(index + 1, 0, clone);
  return { ...deck, activeSlideId: clone.id, slides };
}

export function deleteSlide(deck, slideId = deck.activeSlideId) {
  if (deck.slides.length <= 1) return deck;
  const index = deck.slides.findIndex((slide) => slide.id === slideId);
  if (index < 0) return deck;
  const slides = deck.slides.filter((slide) => slide.id !== slideId);
  const activeSlideId = deck.activeSlideId === slideId
    ? (slides[Math.min(index, slides.length - 1)]?.id ?? slides[0].id)
    : deck.activeSlideId;
  return { ...deck, activeSlideId, slides };
}

export function moveSlide(deck, slideId = deck.activeSlideId, offset = 0) {
  const index = deck.slides.findIndex((slide) => slide.id === slideId);
  const amount = Number.isFinite(offset) ? Math.trunc(offset) : 0;
  if (index < 0 || amount === 0) return deck;
  const nextIndex = Math.max(0, Math.min(deck.slides.length - 1, index + amount));
  if (nextIndex === index) return deck;
  const slides = [...deck.slides];
  const [slide] = slides.splice(index, 1);
  slides.splice(nextIndex, 0, slide);
  return { ...deck, slides };
}
