import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const buildRoot = join(projectRoot, "build");
const checkOnly = process.argv.includes("--check");
const entries = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "styles.css",
  "app.js",
  "atmosphere-story.mjs",
  "atmosphere-suggestions.mjs",
  "content.mjs",
  "deck-share.mjs",
  "deck.mjs",
  "history.mjs",
  "scene-preferences.mjs",
  "scenes.mjs",
  "state.mjs",
  "assets",
];

function filesUnder(path, prefix = "") {
  if (!existsSync(path)) return [];
  const stat = statSync(path);
  if (stat.isFile()) return [prefix];
  return readdirSync(path).flatMap((name) => filesUnder(join(path, name), join(prefix, name)));
}

function sourceFiles() {
  return entries.flatMap((entry) => filesUnder(join(projectRoot, entry), entry));
}

function assertBuildIsCurrent() {
  const mismatches = sourceFiles().filter((name) => {
    const sourcePath = join(projectRoot, name);
    const buildPath = join(buildRoot, name);
    if (!existsSync(buildPath)) return true;
    return !readFileSync(sourcePath).equals(readFileSync(buildPath));
  });
  if (mismatches.length > 0) {
    throw new Error(`build is out of date:\n${mismatches.join("\n")}`);
  }
}

if (checkOnly) {
  assertBuildIsCurrent();
  console.log("build check: pass");
} else {
  rmSync(buildRoot, { recursive: true, force: true });
  mkdirSync(buildRoot, { recursive: true });
  for (const entry of entries) cpSync(join(projectRoot, entry), join(buildRoot, entry), { recursive: true });
  console.log(`build: copied ${sourceFiles().length} files`);
}
