import assert from "node:assert/strict";
import test from "node:test";
import { ATMOSPHERE_STORIES, applyStoryToDeck, storyBeatForSlide } from "../atmosphere-story.mjs";
import { addSlide, createDeck } from "../deck.mjs";
import { SCENE_PRESETS } from "../scenes.mjs";

test("atmosphere stories provide five stable role beats", () => {
  assert.equal(ATMOSPHERE_STORIES.length, 3);
  const sceneKeys = new Set(SCENE_PRESETS.map((preset) => preset.key));
  for (const story of ATMOSPHERE_STORIES) {
    assert.equal(story.beats.length, 5);
    assert.equal(new Set(story.beats.map((beat) => beat.scene)).size >= 3, true);
    assert.ok(story.beats.every((beat) => sceneKeys.has(beat.scene) && beat.period && beat.season && beat.weather));
  }
});

test("story beat selection follows slide roles and remains deterministic", () => {
  const story = ATMOSPHERE_STORIES[1];
  const roles = ["cover", "section", "content", "quote", "closing"];
  const beats = roles.map((role, index) => storyBeatForSlide(story, { state: { role } }, index, roles.length));
  assert.deepEqual(beats, story.beats);
  assert.deepEqual(storyBeatForSlide(story, { state: {} }, 0, 3), story.beats[0]);
  assert.deepEqual(storyBeatForSlide(story, { state: {} }, 2, 3), story.beats[4]);
});

test("applying a story preserves slide identity and content", () => {
  let deck = createDeck({ role: "cover", scene: "none" }, { title: "表紙", body: "内容" }, "one");
  deck = addSlide(deck, { role: "content", scene: "none" }, { title: "本文", body: "内容2" });
  const next = applyStoryToDeck(deck, "quiet-nature");
  assert.deepEqual(next.slides.map((slide) => slide.id), deck.slides.map((slide) => slide.id));
  assert.deepEqual(next.slides.map((slide) => slide.content), deck.slides.map((slide) => slide.content));
  assert.notEqual(next.slides[0].state.scene, deck.slides[0].state.scene);
  assert.equal(next.activeSlideId, deck.activeSlideId);
});