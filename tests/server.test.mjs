import assert from "node:assert/strict";
import test from "node:test";

import { contentType, resolveFilePath } from "../server.mjs";

test("resolveFilePath maps the root URL to index.html", () => {
  assert.match(resolveFilePath("/"), /index\.html$/);
});

test("resolveFilePath rejects paths outside the project root", () => {
  assert.equal(resolveFilePath("/../package.json"), null);
});

test("contentType identifies module and image assets", () => {
  assert.equal(contentType("state.mjs"), "text/javascript; charset=utf-8");
  assert.equal(contentType("scene-city.png"), "image/png");
});
