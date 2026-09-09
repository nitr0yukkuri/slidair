import { contentForRole, CONTENT_LIMITS, normalizeContent } from "./content.mjs";
import { createDeck, normalizeDeck } from "./deck.mjs";
import { DEFAULT_STATE, normalizeState, STATE_OPTIONS } from "./state.mjs";

export const SLIDAIR_SCHEMA_VERSION = 1;
export const SLIDAIR_DOCUMENT_LIMITS = Object.freeze({
  title: 120,
  description: 240,
});

const ENVIRONMENT_KEYS = Object.freeze(["season", "period", "weather", "scene"]);
const ROLES = new Set(STATE_OPTIONS.role);

export const SLIDAIR_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://slidair.app/schema/deck-v1.json",
  title: "Slidair deck",
  type: "object",
  required: ["slides"],
  properties: {
    version: { type: "integer", const: SLIDAIR_SCHEMA_VERSION },
    title: { type: "string", maxLength: SLIDAIR_DOCUMENT_LIMITS.title },
    description: { type: "string", maxLength: SLIDAIR_DOCUMENT_LIMITS.description },
    atmosphere: { $ref: "#/$defs/atmosphere" },
    activeSlideId: { type: "string" },
    slides: { type: "array", minItems: 1, maxItems: 48, items: { $ref: "#/$defs/slide" } },
  },
  $defs: {
    atmosphere: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(ENVIRONMENT_KEYS.map((key) => [key, { type: "string", enum: STATE_OPTIONS[key] }])),
    },
    content: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(Object.keys(CONTENT_LIMITS).map((key) => [key, { type: "string", maxLength: CONTENT_LIMITS[key] }])),
    },
    slide: {
      type: "object",
      required: ["role", "content"],
      properties: {
        id: { type: "string" },
        role: { type: "string", enum: [...ROLES] },
        atmosphere: { $ref: "#/$defs/atmosphere" },
        content: { $ref: "#/$defs/content" },
      },
    },
  },
});

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function parseInput(input) {
  if (typeof input !== "string") return { value: input, parseError: null };
  try {
    return { value: JSON.parse(input), parseError: null };
  } catch (error) {
    return { value: null, parseError: error instanceof Error ? error.message : "JSONを読み込めませんでした" };
  }
}

function inputAtmosphere(input, fallback = DEFAULT_STATE) {
  const source = isRecord(input) ? input : {};
  return Object.fromEntries(ENVIRONMENT_KEYS.map((key) => [
    key,
    normalizeState({ ...fallback, ...source })[key],
  ]));
}

function sourceState(rawSlide, baseAtmosphere, index) {
  const rawState = isRecord(rawSlide?.state) ? rawSlide.state : {};
  const rawAtmosphere = isRecord(rawSlide?.atmosphere) ? rawSlide.atmosphere : {};
  const defaultRole = index === 0 ? "cover" : "content";
  return normalizeState({
    ...baseAtmosphere,
    ...rawState,
    ...rawAtmosphere,
    role: rawSlide?.role ?? rawState.role ?? defaultRole,
  });
}

function sourceContent(rawSlide, role) {
  const rawContent = isRecord(rawSlide?.content) ? rawSlide.content : rawSlide;
  return normalizeContent({
    kicker: rawContent?.kicker,
    title: rawContent?.title,
    body: rawContent?.body ?? rawContent?.subtitle,
  }, contentForRole(role));
}

function normalizedInternalDeck(source, fallback) {
  const baseAtmosphere = inputAtmosphere(source.atmosphere, fallback?.slides?.[0]?.state ?? DEFAULT_STATE);
  const rawSlides = Array.isArray(source.slides) ? source.slides : [];
  const slides = rawSlides.map((rawSlide, index) => {
    const state = sourceState(rawSlide, baseAtmosphere, index);
    return {
      id: rawSlide?.id,
      state,
      content: sourceContent(rawSlide, state.role),
    };
  });
  return normalizeDeck({
    version: SLIDAIR_SCHEMA_VERSION,
    activeSlideId: source.activeSlideId,
    slides,
  }, fallback ?? createDeck(baseAtmosphere));
}

function environmentFromState(state) {
  const normalized = normalizeState(state);
  return Object.fromEntries(ENVIRONMENT_KEYS.map((key) => [key, normalized[key]]));
}

function publicSlide(slide) {
  const state = normalizeState(slide.state);
  return {
    id: slide.id,
    role: state.role,
    atmosphere: environmentFromState(state),
    content: normalizeContent(slide.content, contentForRole(state.role)),
  };
}

export function deckToSlidairDocument(deck, metadata = {}) {
  const normalized = normalizeDeck(deck);
  const firstState = normalized.slides[0]?.state ?? DEFAULT_STATE;
  const document = {
    version: SLIDAIR_SCHEMA_VERSION,
    slides: normalized.slides.map(publicSlide),
    activeSlideId: normalized.activeSlideId,
    atmosphere: environmentFromState(metadata.atmosphere ?? firstState),
  };
  const title = cleanText(metadata.title, SLIDAIR_DOCUMENT_LIMITS.title);
  const description = cleanText(metadata.description, SLIDAIR_DOCUMENT_LIMITS.description);
  if (title) document.title = title;
  if (description) document.description = description;
  return document;
}

export function slidairDocumentToDeck(input, fallback) {
  const parsed = parseInput(input);
  if (!isRecord(parsed.value)) return fallback ?? createDeck();
  return normalizedInternalDeck(parsed.value, fallback);
}

export function normalizeSlidairDocument(input, fallback) {
  const parsed = parseInput(input);
  if (!isRecord(parsed.value)) return deckToSlidairDocument(fallback ?? createDeck());
  const internal = normalizedInternalDeck(parsed.value, fallback);
  return deckToSlidairDocument(internal, {
    title: parsed.value.title,
    description: parsed.value.description,
    atmosphere: parsed.value.atmosphere,
  });
}

export function validateSlidairDocument(input) {
  const parsed = parseInput(input);
  const errors = [];
  const warnings = [];
  if (parsed.parseError) return { valid: false, errors: [{ path: "$", message: parsed.parseError }], warnings };
  if (!isRecord(parsed.value)) return { valid: false, errors: [{ path: "$", message: "デッキJSONはオブジェクトで指定してください" }], warnings };

  const source = parsed.value;
  if (source.version == null) warnings.push({ path: "version", message: "versionがないため1として扱います" });
  else if (source.version !== SLIDAIR_SCHEMA_VERSION) errors.push({ path: "version", message: `version ${SLIDAIR_SCHEMA_VERSION} のみ対応しています` });
  ["title", "description"].forEach((key) => {
    if (source[key] != null && typeof source[key] !== "string") errors.push({ path: key, message: "文字列で指定してください" });
    if (typeof source[key] === "string" && source[key].length > SLIDAIR_DOCUMENT_LIMITS[key]) errors.push({ path: key, message: `${SLIDAIR_DOCUMENT_LIMITS[key]}文字以内で指定してください` });
  });

  if (!Array.isArray(source.slides)) {
    errors.push({ path: "slides", message: "slides配列が必要です" });
  } else if (source.slides.length === 0) {
    errors.push({ path: "slides", message: "スライドを1枚以上指定してください" });
  } else if (source.slides.length > 48) {
    errors.push({ path: "slides", message: "スライドは48枚以内で指定してください" });
  } else {
    const ids = new Set();
    source.slides.forEach((slide, index) => {
      const path = `slides[${index}]`;
      if (!isRecord(slide)) {
        errors.push({ path, message: "スライドはオブジェクトで指定してください" });
        return;
      }
      const role = slide.role ?? slide.state?.role;
      if (role == null) warnings.push({ path: `${path}.role`, message: "roleがないため位置から補完します" });
      else if (!ROLES.has(role)) errors.push({ path: `${path}.role`, message: `roleは${[...ROLES].join(" / ")}のいずれかです` });
      if (slide.id != null) {
        if (typeof slide.id !== "string" || !slide.id.trim()) errors.push({ path: `${path}.id`, message: "idは空でない文字列で指定してください" });
        else if (ids.has(slide.id)) errors.push({ path: `${path}.id`, message: "idが重複しています" });
        else ids.add(slide.id);
      }
      ["atmosphere", "state"].forEach((stateKey) => {
        if (!isRecord(slide[stateKey])) return;
        ENVIRONMENT_KEYS.forEach((key) => {
          if (slide[stateKey][key] != null && !STATE_OPTIONS[key].includes(slide[stateKey][key])) errors.push({ path: `${path}.${stateKey}.${key}`, message: `利用できない${key}です` });
        });
      });
      const content = isRecord(slide.content) ? slide.content : slide;
      ["kicker", "title", "body"].forEach((key) => {
        if (content[key] != null && typeof content[key] !== "string") errors.push({ path: `${path}.content.${key}`, message: "文字列で指定してください" });
        if (typeof content[key] === "string" && content[key].length > CONTENT_LIMITS[key]) errors.push({ path: `${path}.content.${key}`, message: `${CONTENT_LIMITS[key]}文字以内で指定してください` });
      });
    });
    if (source.activeSlideId != null && typeof source.activeSlideId !== "string") errors.push({ path: "activeSlideId", message: "activeSlideIdは文字列で指定してください" });
    else if (source.activeSlideId != null && ids.size > 0 && !ids.has(source.activeSlideId)) warnings.push({ path: "activeSlideId", message: "存在しないため先頭スライドを選択します" });
  }

  if (isRecord(source.atmosphere)) {
    ENVIRONMENT_KEYS.forEach((key) => {
      if (source.atmosphere[key] != null && !STATE_OPTIONS[key].includes(source.atmosphere[key])) errors.push({ path: `atmosphere.${key}`, message: `利用できない${key}です` });
    });
  } else if (source.atmosphere != null) {
    errors.push({ path: "atmosphere", message: "atmosphereはオブジェクトで指定してください" });
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function parseSlidairDocument(input, fallback) {
  const validation = validateSlidairDocument(input);
  if (!validation.valid) return { ok: false, ...validation, document: null, deck: null };
  const document = normalizeSlidairDocument(input, fallback);
  return { ok: true, ...validation, document, deck: slidairDocumentToDeck(document, fallback) };
}
