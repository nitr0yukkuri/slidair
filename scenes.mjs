// Stable scene IDs are shared by URL state, the inspector, and saved slide decks.
export const SCENE_PRESETS = Object.freeze([
  Object.freeze({ key: "none", label: "なし", og: "og-cover.png", categories: ["ミニマル"] }),
  Object.freeze({ key: "fireworks", label: "花火", art: "./assets/scene-fireworks-v2.png", og: "scene-fireworks-v2.png", categories: ["幻想", "都会"] }),
  Object.freeze({ key: "lake", label: "湖", art: "./assets/scene-lake.png", og: "scene-lake.png", categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "city", label: "都会", art: "./assets/scene-city.png", og: "scene-city.png", categories: ["都会", "暗め"] }),
  Object.freeze({ key: "space", label: "宇宙", art: "./assets/scene-space-nebula-v1.webp", og: "scene-space-nebula-v1.webp", categories: ["幻想", "暗め"] }),
  Object.freeze({ key: "underwater", label: "海中", family: "soft", art: "./assets/scene-underwater-v1.webp", og: "scene-underwater-v1.webp", categories: ["自然", "暗め"] }),
  Object.freeze({ key: "countryside", label: "田舎", family: "soft", art: "./assets/scene-countryside-v1.webp", og: "scene-countryside-v1.webp", categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "clear-sky", label: "快晴", family: "soft", art: "./assets/scene-clear-sky-v1.webp", og: "scene-clear-sky-v1.webp", categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "deep-sea", label: "深海", family: "soft", tone: "dark", art: "./assets/scene-deep-sea-v1.webp", og: "scene-deep-sea-v1.webp", categories: ["自然", "暗め"] }),
  Object.freeze({ key: "first-sunrise", label: "初日の出", family: "soft", art: "./assets/scene-first-sunrise-v1.webp", og: "scene-first-sunrise-v1.webp", categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "forest-light", label: "木漏れ日", family: "soft", art: "./assets/scene-forest-light-v1.webp", og: "scene-forest-light-v1.webp", dayOpacity: 0.44, eveningExposure: 0.52, nightExposure: 0.45, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "bamboo-grove", label: "竹林", family: "soft", art: "./assets/scene-bamboo-grove-v1.webp", og: "scene-bamboo-grove-v1.webp", dayOpacity: 0.52, eveningExposure: 0.44, nightExposure: 0.37, categories: ["自然", "暗め"] }),
  Object.freeze({ key: "sakura-mist", label: "桜霞", family: "soft", art: "./assets/scene-sakura-mist-v1.webp", og: "scene-sakura-mist-v1.webp", dayOpacity: 0.66, eveningExposure: 0.4, nightExposure: 0.34, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "hydrangea-rain", label: "紫陽花", family: "soft", art: "./assets/scene-hydrangea-rain-v1.webp", og: "scene-hydrangea-rain-v1.webp", dayOpacity: 0.46, eveningExposure: 0.46, nightExposure: 0.39, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "lavender-haze", label: "花畑", family: "soft", art: "./assets/scene-lavender-haze-v1.webp", og: "scene-lavender-haze-v1.webp", dayOpacity: 0.62, eveningExposure: 0.42, nightExposure: 0.35, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "autumn-haze", label: "紅葉", family: "soft", art: "./assets/scene-autumn-haze-v1.webp", og: "scene-autumn-haze-v1.webp", dayOpacity: 0.54, eveningExposure: 0.46, nightExposure: 0.39, categories: ["自然", "暗め"] }),
  Object.freeze({ key: "snowfield", label: "雪原", family: "soft", art: "./assets/scene-snowfield-v1.webp", og: "scene-snowfield-v1.webp", dayOpacity: 0.78, eveningExposure: 0.38, nightExposure: 0.32, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "sand-dunes", label: "砂丘", family: "soft", art: "./assets/scene-sand-dunes-v1.webp", og: "scene-sand-dunes-v1.webp", dayOpacity: 0.54, eveningExposure: 0.4, nightExposure: 0.34, categories: ["自然", "明るめ"] }),
  Object.freeze({ key: "moonlit-shore", label: "月夜の海", family: "soft", tone: "dark", art: "./assets/scene-moonlit-shore-v1.webp", og: "scene-moonlit-shore-v1.webp", categories: ["自然", "幻想", "暗め"] }),
  Object.freeze({ key: "aurora-veil", label: "オーロラ", family: "soft", tone: "dark", art: "./assets/scene-aurora-veil-v1.webp", og: "scene-aurora-veil-v1.webp", categories: ["自然", "幻想", "暗め"] }),
]);

export function scenePreset(key) {
  return SCENE_PRESETS.find(preset => preset.key === key) ?? SCENE_PRESETS[0];
}
