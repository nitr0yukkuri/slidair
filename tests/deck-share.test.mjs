import assert from "node:assert/strict";
import test from "node:test";
import { addSlide, createDeck } from "../deck.mjs";
import { deserializeDeck, MAX_DECK_SHARE_LENGTH, serializeDeck } from "../deck-share.mjs";

test("deck share payload round-trips Japanese content and active slide", () => {
  let deck = createDeck({ scene: "aurora-veil", role: "cover" }, { title: "空気", body: "共有する本文" }, "one");
  deck = addSlide(deck, { scene: "deep-sea", role: "quote" }, { title: "深海", body: "静かな引用" });
  const restored = deserializeDeck(serializeDeck(deck));
  assert.deepEqual(restored, deck);
});

test("malformed or oversized deck payloads are rejected", () => {
  assert.equal(deserializeDeck("not-valid!"), null);
  assert.equal(deserializeDeck("a".repeat(MAX_DECK_SHARE_LENGTH + 1)), null);
});
