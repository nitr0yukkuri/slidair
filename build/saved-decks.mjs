import { normalizeDeck } from "./deck.mjs";

export const SAVED_DECKS_KEY = "slide-atmosphere:saved-decks:v1";
export const MAX_SAVED_DECKS = 20;

let idSequence = 0;

function nextSavedDeckId() {
  idSequence += 1;
  return `saved-${Date.now().toString(36)}-${idSequence.toString(36)}`;
}

function cleanName(value, fallback) {
  const name = typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 80) : "";
  return name || fallback;
}

export function suggestedDeckName(deck) {
  const normalized = normalizeDeck(deck);
  const title = normalized.slides[0]?.content?.title;
  return cleanName(title, "無題のデッキ");
}

export function normalizeSavedDeck(input) {
  const source = input && typeof input === "object" ? input : {};
  const deck = normalizeDeck(source.deck ?? source);
  const savedAt = Number.isFinite(Date.parse(source.savedAt))
    ? new Date(source.savedAt).toISOString()
    : new Date(0).toISOString();
  return {
    id: typeof source.id === "string" && source.id.trim() ? source.id.trim() : nextSavedDeckId(),
    name: cleanName(source.name, suggestedDeckName(deck)),
    savedAt,
    deck,
  };
}

export function normalizeSavedDecks(input) {
  const source = Array.isArray(input) ? input : [];
  const ids = new Set();
  return source
    .map(normalizeSavedDeck)
    .filter((entry) => {
      if (ids.has(entry.id)) return false;
      ids.add(entry.id);
      return true;
    })
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
    .slice(0, MAX_SAVED_DECKS);
}

export function readSavedDecks(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target?.getItem(SAVED_DECKS_KEY);
    return raw ? normalizeSavedDecks(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function writeSavedDecks(entries, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.setItem(SAVED_DECKS_KEY, JSON.stringify(normalizeSavedDecks(entries)));
    return Boolean(target);
  } catch {
    return false;
  }
}

export function upsertSavedDeck(entries, deck, { id, name } = {}) {
  const current = normalizeSavedDecks(entries);
  const existing = current.find((entry) => entry.id === id);
  const entry = normalizeSavedDeck({
    id: existing?.id ?? id ?? nextSavedDeckId(),
    name: name ?? existing?.name ?? suggestedDeckName(deck),
    savedAt: new Date().toISOString(),
    deck,
  });
  return {
    entry,
    entries: normalizeSavedDecks([entry, ...current.filter((item) => item.id !== entry.id)]),
  };
}

export function removeSavedDeck(entries, id) {
  return normalizeSavedDecks(entries).filter((entry) => entry.id !== id);
}

export function findSavedDeckId(entries, deck) {
  const target = JSON.stringify(normalizeDeck(deck));
  return normalizeSavedDecks(entries).find((entry) => JSON.stringify(entry.deck) === target)?.id ?? null;
}
