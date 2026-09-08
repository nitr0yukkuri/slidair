// Stable scene IDs are shared by URL state, the inspector, and saved slide decks.
export const SCENE_PRESETS = Object.freeze([
  Object.freeze({"key":"none","label":"なし"}),
  Object.freeze({"key":"fireworks","label":"花火"}),
  Object.freeze({"key":"lake","label":"湖"}),
  Object.freeze({"key":"city","label":"都会"}),
  Object.freeze({"key":"space","label":"宇宙"}),
  Object.freeze({"key":"underwater","label":"海中","family":"soft","art":"./assets/scene-underwater-v1.webp"}),
  Object.freeze({"key":"countryside","label":"田舎","family":"soft","art":"./assets/scene-countryside-v1.webp"}),
  Object.freeze({"key":"clear-sky","label":"快晴","family":"soft","art":"./assets/scene-clear-sky-v1.webp"}),
  Object.freeze({"key":"deep-sea","label":"深海","family":"soft","tone":"dark","art":"./assets/scene-deep-sea-v1.webp"}),
  Object.freeze({"key":"first-sunrise","label":"初日の出","family":"soft","art":"./assets/scene-first-sunrise-v1.webp"}),
  Object.freeze({"key":"forest-light","label":"木漏れ日","family":"soft","art":"./assets/scene-forest-light-v1.webp","dayOpacity":0.44,"eveningExposure":0.52,"nightExposure":0.45}),
  Object.freeze({"key":"bamboo-grove","label":"竹林","family":"soft","art":"./assets/scene-bamboo-grove-v1.webp","dayOpacity":0.52,"eveningExposure":0.44,"nightExposure":0.37}),
  Object.freeze({"key":"sakura-mist","label":"桜霞","family":"soft","art":"./assets/scene-sakura-mist-v1.webp","dayOpacity":0.66,"eveningExposure":0.4,"nightExposure":0.34}),
  Object.freeze({"key":"hydrangea-rain","label":"紫陽花","family":"soft","art":"./assets/scene-hydrangea-rain-v1.webp","dayOpacity":0.46,"eveningExposure":0.46,"nightExposure":0.39}),
  Object.freeze({"key":"lavender-haze","label":"花畑","family":"soft","art":"./assets/scene-lavender-haze-v1.webp","dayOpacity":0.62,"eveningExposure":0.42,"nightExposure":0.35}),
  Object.freeze({"key":"autumn-haze","label":"紅葉","family":"soft","art":"./assets/scene-autumn-haze-v1.webp","dayOpacity":0.54,"eveningExposure":0.46,"nightExposure":0.39}),
  Object.freeze({"key":"snowfield","label":"雪原","family":"soft","art":"./assets/scene-snowfield-v1.webp","dayOpacity":0.78,"eveningExposure":0.38,"nightExposure":0.32}),
  Object.freeze({"key":"sand-dunes","label":"砂丘","family":"soft","art":"./assets/scene-sand-dunes-v1.webp","dayOpacity":0.54,"eveningExposure":0.4,"nightExposure":0.34}),
  Object.freeze({"key":"moonlit-shore","label":"月夜の海","family":"soft","tone":"dark","art":"./assets/scene-moonlit-shore-v1.webp"}),
  Object.freeze({"key":"aurora-veil","label":"オーロラ","family":"soft","tone":"dark","art":"./assets/scene-aurora-veil-v1.webp"}),
]);

export function scenePreset(key) {
  return SCENE_PRESETS.find(preset => preset.key === key) ?? SCENE_PRESETS[0];
}
