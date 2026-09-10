import assert from "node:assert/strict";
import test from "node:test";
import { addSlide, createDeck } from "../deck.mjs";
import { deckFilePayload, DECK_FILE_NAME } from "../deck-file.mjs";

test("deck file payload is formatted Slidair JSON and round-trips the deck", () => {
  let deck = createDeck(
    { season: "spring", period: "day", weather: "clear", scene: "cherry-blossom", role: "cover" },
    { kicker: "DEMO", title: "保存できるデッキ", body: "あとで編集を続けられる" },
    "cover",
  );
  deck = addSlide(deck, { season: "winter", period: "night", weather: "snow", scene: "rust-forge", role: "content" }, { title: "本文", body: "JSONに残る" });

  const source = deckFilePayload(deck, { title: "Slidairデモ" });
  assert.match(source, /^\{\n  "version": 1,/);
  assert.equal(source.endsWith("\n"), true);
  const document = JSON.parse(source);
  assert.equal(document.title, "Slidairデモ");
  assert.equal(document.slides.length, 2);
  assert.equal(document.slides[1].atmosphere.scene, "rust-forge");
  assert.equal(document.slides[0].content.title, "保存できるデッキ");
});

test("deck file uses a stable importable filename", () => {
  assert.equal(DECK_FILE_NAME, "slidair-deck.slidair.json");
});
