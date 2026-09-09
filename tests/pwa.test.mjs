import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { contentType } from "../server.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");

test("PWA manifest declares installable Slidair metadata", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.name, "Slidair — スライドに、空気を。");
  assert.equal(manifest.short_name, "Slidair");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ["192x192", "512x512"]);
  manifest.icons.forEach((icon) => {
    const iconPath = new URL(icon.src, root);
    assert.equal(existsSync(iconPath), true);
    assert.ok(statSync(iconPath).size > 1000);
  });
});

test("service worker provides an offline shell and runtime image cache", () => {
  const serviceWorker = read("sw.js");
  assert.match(serviceWorker, /caches\.open\(CACHE_NAME\)/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
  assert.match(serviceWorker, /\.\/slidair-schema\.mjs/);
  assert.match(serviceWorker, /return caches\.match\("\.\/index\.html"\)/);
  assert.match(serviceWorker, /"image", "script", "style", "manifest"/);
});

test("source and build expose the PWA entry points", () => {
  assert.equal(contentType("manifest.webmanifest"), "application/manifest+json");
  for (const file of ["index.html", "build/index.html"]) {
    const html = read(file);
    assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
    assert.match(html, /name="theme-color" content="#101114"/);
  }
  for (const file of ["app.js", "build/app.js"]) {
    assert.match(read(file), /serviceWorker\.register\("\.\/sw\.js"/);
  }
  assert.equal(existsSync(new URL("build/manifest.webmanifest", root)), true);
  assert.equal(existsSync(new URL("build/sw.js", root)), true);
  assert.equal(existsSync(new URL("build/assets/slidair-icon-512.png", root)), true);
});