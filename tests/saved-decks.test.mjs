import assert from "node:assert/strict";
import test from "node:test";
import { addSlide, createDeck } from "../deck.mjs";
import {
  findSavedDeckId,
  MAX_SAVED_DECKS,
  normalizeSavedDecks,
  readSavedDecks,
  removeSavedDeck,
  duplicateSavedDeck,
  renameSavedDeck,
  SAVED_DECKS_KEY,
  suggestedDeckName,
  upsertSavedDeck,
  writeSavedDecks,
} from "../saved-decks.mjs";

function storageStub() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("saved decks persist named snapshots and can be found again", () => {
  const storage = storageStub();
  const deck = createDeck({}, { title: "  発表の空気  ", body: "本文" }, "one");
  const first = upsertSavedDeck([], deck);
  assert.equal(first.entry.name, "発表の空気");
  assert.equal(writeSavedDecks(first.entries, storage), true);
  const restored = readSavedDecks(storage);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, first.entry.id);
  assert.equal(findSavedDeckId(restored, deck), first.entry.id);
  assert.equal(storage.getItem(SAVED_DECKS_KEY) != null, true);
});

test("saving an existing entry updates it without duplicating the deck", () => {
  const deck = createDeck({}, { title: "最初" }, "one");
  const first = upsertSavedDeck([], deck, { name: "自分のデッキ" });
  const changed = addSlide(deck, {}, { title: "追加" });
  const second = upsertSavedDeck(first.entries, changed, { id: first.entry.id });
  assert.equal(second.entries.length, 1);
  assert.equal(second.entry.name, "自分のデッキ");
  assert.equal(second.entry.deck.slides.length, 2);
});

test("saved deck list removes duplicates, caps at twenty, and supports deletion", () => {
  const entries = Array.from({ length: MAX_SAVED_DECKS + 3 }, (_, index) => ({
    id: `saved-${index}`,
    name: `Deck ${index}`,
    savedAt: new Date(2025, 0, index + 1).toISOString(),
    deck: createDeck({}, { title: String(index) }, `slide-${index}`),
  }));
  const normalized = normalizeSavedDecks([...entries, entries[0]]);
  assert.equal(normalized.length, MAX_SAVED_DECKS);
  assert.equal(normalized.some((entry) => entry.id === "saved-0"), false);
  assert.equal(removeSavedDeck(normalized, "saved-2").some((entry) => entry.id === "saved-2"), false);
});


test("saved deck names can be renamed and snapshots can be duplicated", () => {
  const deck = createDeck({}, { title: "元デッキ" }, "one");
  const first = upsertSavedDeck([], deck, { name: "元デッキ" });
  const renamed = renameSavedDeck(first.entries, first.entry.id, "  発表用  ", { savedAt: "2026-01-02T00:00:00.000Z" });
  assert.equal(renamed[0].name, "発表用");
  assert.equal(renamed[0].id, first.entry.id);
  const duplicated = duplicateSavedDeck(renamed, first.entry.id, { savedAt: "2026-01-03T00:00:00.000Z" });
  assert.equal(duplicated.length, 2);
  assert.equal(duplicated[0].name, "発表用 のコピー");
  assert.notEqual(duplicated[0].id, duplicated[1].id);
  assert.equal(duplicated[0].savedAt > duplicated[1].savedAt, true);
});test("suggested name falls back when the first slide has no title", () => {
  assert.equal(suggestedDeckName(createDeck({}, { title: "   " })), "無題のデッキ");
});
