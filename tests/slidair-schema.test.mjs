import assert from "node:assert/strict";
import test from "node:test";
import { addSlide, createDeck } from "../deck.mjs";
import {
  SLIDAIR_SCHEMA_VERSION,
  deckToSlidairDocument,
  normalizeSlidairDocument,
  parseSlidairDocument,
  slidairDocumentToDeck,
  validateSlidairDocument,
} from "../slidair-schema.mjs";

test("AI-friendly document normalizes into the immutable deck model", () => {
  const result = parseSlidairDocument({
    title: "Rustの発表",
    atmosphere: { season: "winter", period: "night", weather: "clear", scene: "rust-forge" },
    slides: [
      { id: "cover", role: "cover", content: { title: "Rust Forge", body: "堅牢な低レイヤー" } },
      { id: "quote", role: "quote", atmosphere: { scene: "deep-sea" }, content: { title: "安全性は設計する", body: "静かな引用" } },
    ],
    activeSlideId: "quote",
  });

  assert.equal(result.ok, true);
  assert.equal(result.document.version, SLIDAIR_SCHEMA_VERSION);
  assert.equal(result.deck.activeSlideId, "quote");
  assert.equal(result.deck.slides[0].state.scene, "rust-forge");
  assert.equal(result.deck.slides[1].state.scene, "deep-sea");
  assert.equal(result.deck.slides[1].content.body, "静かな引用");
});

test("document round-trips deck state and content", () => {
  let deck = createDeck({ season: "spring", period: "day", weather: "rain", scene: "bamboo-grove", role: "cover" }, { title: "表紙", body: "導入" }, "one");
  deck = addSlide(deck, { season: "autumn", period: "night", weather: "clear", scene: "rust-forge", role: "content" }, { title: "本文", body: "説明" });
  const restored = slidairDocumentToDeck(deckToSlidairDocument(deck));
  assert.deepEqual(restored, deck);
});

test("validation reports actionable paths without mutating input", () => {
  const input = {
    version: 1,
    slides: [{ role: "unknown", content: { title: "x" } }, { id: "same", role: "content", content: { title: "y" } }, { id: "same", role: "content", content: { title: "z" } }],
  };
  const result = validateSlidairDocument(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path === "slides[0].role"));
  assert.ok(result.errors.some((error) => error.path === "slides[2].id"));
  assert.equal(input.slides[0].role, "unknown");
});

test("missing version and role stay compatible with a warning", () => {
  const result = parseSlidairDocument(JSON.stringify({ slides: [{ content: { title: "最初" } }] }));
  assert.equal(result.ok, true);
  assert.equal(result.document.version, 1);
  assert.deepEqual(result.warnings.map((warning) => warning.path), ["version", "slides[0].role"]);
  assert.equal(result.deck.slides[0].state.role, "cover");
});

test("invalid JSON and unsupported versions are rejected", () => {
  assert.equal(parseSlidairDocument("{").ok, false);
  assert.equal(parseSlidairDocument({ version: 2, slides: [{ role: "cover" }] }).ok, false);
});

test("normalization keeps public metadata while applying safe limits", () => {
  const document = normalizeSlidairDocument({
    title: "  発表  ",
    description: "  説明  ",
    slides: [{ role: "cover", content: { title: "  表紙  " } }],
  });
  assert.equal(document.title, "発表");
  assert.equal(document.description, "説明");
  assert.equal(document.slides[0].content.title, "表紙");
});
