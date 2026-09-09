import assert from "node:assert/strict";
import test from "node:test";

import {
  DECK_STORAGE_KEY,
  MAX_SLIDES,
  addSlide,
  deleteSlide,
  duplicateSlide,
  moveSlide,
  activeSlide,
  createDeck,
  normalizeDeck,
  readDeck,
  selectSlide,
  updateSlide,
  writeDeck,
} from "../deck.mjs";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("a deck starts with one normalized active slide", () => {
  const deck = createDeck({ season: "summer", role: "cover" }, { title: "最初のスライド" }, "slide-1");
  assert.equal(deck.slides.length, 1);
  assert.equal(deck.activeSlideId, "slide-1");
  assert.equal(activeSlide(deck).content.title, "最初のスライド");
});

test("adding a slide selects it without changing the first slide", () => {
  const first = createDeck({ role: "cover" }, { title: "表紙" }, "slide-1");
  const next = addSlide(first, { role: "content" }, { title: "本文" });
  assert.equal(next.slides.length, 2);
  assert.notEqual(next.activeSlideId, first.activeSlideId);
  assert.equal(next.slides[0].content.title, "表紙");
  assert.equal(activeSlide(next).content.title, "本文");
});

test("adding a slide at the maximum leaves the deck unchanged", () => {
  let deck = createDeck({ role: "cover" }, { title: "表紙" }, "slide-1");
  for (let index = deck.slides.length; index < MAX_SLIDES; index += 1) {
    deck = addSlide(deck, { role: "content" }, { title: `本文${index}` });
  }
  const next = addSlide(deck, { role: "content" }, { title: "上限後" });
  assert.equal(next, deck);
  assert.equal(next.slides.length, MAX_SLIDES);
});
test("slide selection and updates are isolated to the selected slide", () => {
  const first = createDeck({ role: "cover" }, { title: "表紙" }, "slide-1");
  const withSecond = addSlide(first, { role: "content" }, { title: "本文" });
  const selected = selectSlide(withSecond, "slide-1");
  const updated = updateSlide(selected, "slide-1", { content: { title: "更新後" } });
  assert.equal(activeSlide(updated).content.title, "更新後");
  assert.equal(updated.slides[1].content.title, "本文");
});

test("deck drafts round-trip through browser storage", () => {
  const storage = createStorage();
  const deck = addSlide(createDeck({ role: "cover" }, { title: "表紙" }, "slide-1"), { role: "content" }, { title: "本文" });
  assert.equal(writeDeck(deck, storage), true);
  assert.equal(storage.getItem(DECK_STORAGE_KEY) !== null, true);
  assert.equal(readDeck(storage).slides.length, 2);
});

test("malformed deck data falls back to one slide", () => {
  const fallback = createDeck({ role: "cover" }, { title: "表紙" }, "slide-1");
  const normalized = normalizeDeck({ slides: [{ id: "slide-1", state: { role: "invalid" } }] }, fallback);
  assert.equal(normalized.slides.length, 1);
  assert.equal(normalized.slides[0].state.role, "cover");
});

test("existing and new scenes keep their content and order in a version-one draft", () => {
  const scenes = ["space", "underwater", "countryside", "clear-sky", "deep-sea", "first-sunrise", "forest-light", "bamboo-grove", "sakura-mist", "hydrangea-rain", "lavender-haze", "autumn-haze", "snowfield", "sand-dunes", "moonlit-shore", "aurora-veil", "rust-forge"];
  let deck = createDeck({ scene: scenes[0] }, { title: scenes[0] }, "original");
  for (const scene of scenes.slice(1)) {
    deck = addSlide(deck, { scene, period: "day", role: "quote" }, { title: scene, body: "保存する本文" });
  }
  const storage = createStorage();
  assert.equal(writeDeck(deck, storage), true);
  const restored = readDeck(storage);
  assert.equal(restored.version, 1);
  assert.deepEqual(restored.slides.map(slide => slide.state.scene), scenes);
  assert.deepEqual(restored.slides.map(slide => slide.content), deck.slides.map(slide => slide.content));
  assert.equal(restored.activeSlideId, deck.activeSlideId);
});

test("legacy placeholder content is migrated to the meaningful default", () => {
  const normalized = normalizeDeck({
    slides: [{
      id: "slide-1",
      state: { role: "content" },
      content: {
        kicker: "CONTENT / 03",
        title: "内容を、\n内容として見せる。",
        body: "内容を、内容として見せるために。",
      },
    }],
    activeSlideId: "slide-1",
  });
  assert.equal(normalized.slides[0].content.title, "伝えたいことに、\nちょうどいい背景を。");
  assert.equal(normalized.slides[0].content.body, "季節や時間帯に合わせて、スライドの空気を整える。");
});


test("duplicating inserts an independent active copy after the source", () => {
  const first = createDeck({ role: "cover" }, { title: "表紙", body: "本文" }, "slide-1");
  const deck = addSlide(first, { role: "content" }, { title: "本文" });
  const duplicated = duplicateSlide(selectSlide(deck, "slide-1"), "slide-1");
  assert.equal(duplicated.slides.length, 3);
  assert.equal(duplicated.slides[1].content.title, "表紙");
  assert.notEqual(duplicated.slides[1].id, "slide-1");
  assert.equal(duplicated.activeSlideId, duplicated.slides[1].id);
  assert.notEqual(duplicated.slides[1], duplicated.slides[0]);
});

test("duplicate respects the slide limit and unknown IDs", () => {
  let deck = createDeck({ role: "cover" }, undefined, "slide-1");
  for (let index = 1; index < MAX_SLIDES; index += 1) deck = addSlide(deck, { role: "content" });
  assert.equal(duplicateSlide(deck), deck);
  const single = createDeck();
  assert.equal(duplicateSlide(single, "missing"), single);
});

test("deleting an active slide selects the next slide, then previous at the end", () => {
  const first = createDeck({ role: "cover" }, { title: "一" }, "one");
  const second = addSlide(first, { role: "content" }, { title: "二" });
  const third = addSlide(second, { role: "quote" }, { title: "三" });
  const middleId = third.slides[1].id;
  const middle = deleteSlide(selectSlide(third, middleId), middleId);
  assert.equal(middle.slides.length, 2);
  assert.equal(activeSlide(middle).content.title, "三");
  const end = deleteSlide(third, third.activeSlideId);
  assert.equal(activeSlide(end).content.title, "二");
  assert.equal(deleteSlide(first), first);
});

test("moving a slide clamps to the deck edges and preserves active selection", () => {
  const first = createDeck({ role: "cover" }, { title: "一" }, "one");
  let deck = addSlide(first, { role: "content" }, { title: "二" });
  deck = addSlide(deck, { role: "quote" }, { title: "三" });
  deck = selectSlide(deck, "one");
  const moved = moveSlide(deck, "one", 2);
  assert.deepEqual(moved.slides.map((slide) => slide.content.title), ["二", "三", "一"]);
  assert.equal(moved.activeSlideId, "one");
  assert.equal(moveSlide(moved, "one", 1), moved);
  assert.equal(moveSlide(moved, "missing", -1), moved);
});
