import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { SCENE_PRESETS } from "../scenes.mjs";

test("scene catalog has unique stable IDs and all referenced artwork exists", async () => {
  assert.equal(new Set(SCENE_PRESETS.map(preset => preset.key)).size, SCENE_PRESETS.length);
  for (const preset of SCENE_PRESETS) {
    assert.ok(preset.label.trim(), preset.key + " needs a visible label");
    if (preset.art) await access(new URL("../" + preset.art, import.meta.url));
    if (preset.og) await access(new URL("../assets/" + preset.og, import.meta.url));
    for (const property of ["dayOpacity", "eveningExposure", "nightExposure"]) {
      if (preset[property] != null) assert.ok(preset[property] > 0 && preset[property] <= 1, preset.key + " " + property);
    }
  }
});
