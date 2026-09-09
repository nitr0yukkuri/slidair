// Curated atmosphere arcs. Each beat uses existing world-state axes so applying a story stays deterministic.
export const ATMOSPHERE_STORIES = Object.freeze([
  Object.freeze({
    key: "quiet-nature",
    label: "Quiet Nature",
    description: "自然の静けさから、余韻へ",
    beats: Object.freeze([
      Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "misty-mountains" }),
      Object.freeze({ season: "summer", period: "day", weather: "cloudy", scene: "countryside" }),
      Object.freeze({ season: "autumn", period: "evening", weather: "rain", scene: "forest-light" }),
      Object.freeze({ season: "winter", period: "night", weather: "clear", scene: "moonlit-shore" }),
      Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "first-sunrise" }),
    ]),
  }),
  Object.freeze({
    key: "night-journey",
    label: "Night Journey",
    description: "深い夜から、静かな夜明けへ",
    beats: Object.freeze([
      Object.freeze({ season: "winter", period: "night", weather: "clear", scene: "moonlit-shore" }),
      Object.freeze({ season: "summer", period: "night", weather: "cloudy", scene: "deep-sea" }),
      Object.freeze({ season: "autumn", period: "evening", weather: "rain", scene: "misty-harbor" }),
      Object.freeze({ season: "spring", period: "morning", weather: "cloudy", scene: "aurora-veil" }),
      Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "first-sunrise" }),
    ]),
  }),
  Object.freeze({
    key: "japanese-season",
    label: "Japanese Season",
    description: "石・竹・桜をめぐる静かな季節",
    beats: Object.freeze([
      Object.freeze({ season: "winter", period: "morning", weather: "clear", scene: "stone-garden" }),
      Object.freeze({ season: "spring", period: "day", weather: "clear", scene: "bamboo-grove" }),
      Object.freeze({ season: "spring", period: "evening", weather: "rain", scene: "sakura-mist" }),
      Object.freeze({ season: "autumn", period: "night", weather: "clear", scene: "moonlit-shore" }),
      Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "cherry-blossom" }),
    ]),
  }),
]);

const ROLE_BEAT_INDEX = Object.freeze({ cover: 0, section: 1, content: 2, quote: 3, closing: 4 });

export function storyPreset(key) {
  return ATMOSPHERE_STORIES.find((story) => story.key === key) ?? ATMOSPHERE_STORIES[0];
}

export function storyBeatForSlide(storyOrKey, slide, index, total) {
  const story = typeof storyOrKey === "string" ? storyPreset(storyOrKey) : storyOrKey;
  const safeTotal = Math.max(1, Number(total) || 1);
  const roleIndex = ROLE_BEAT_INDEX[slide?.state?.role];
  const positionIndex = safeTotal === 1 ? 0 : Math.round((index / (safeTotal - 1)) * (story.beats.length - 1));
  const beatIndex = roleIndex == null ? positionIndex : roleIndex;
  return story.beats[Math.min(story.beats.length - 1, Math.max(0, beatIndex))];
}

export function applyStoryToDeck(deck, storyOrKey) {
  const story = typeof storyOrKey === "string" ? storyPreset(storyOrKey) : storyOrKey;
  return {
    ...deck,
    slides: deck.slides.map((slide, index) => ({
      ...slide,
      state: { ...slide.state, ...storyBeatForSlide(story, slide, index, deck.slides.length) },
    })),
  };
}