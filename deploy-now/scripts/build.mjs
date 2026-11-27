import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const deployRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(deployRoot, "..");
const publicRoot = join(deployRoot, "public");
const astroCli = join(deployRoot, "node_modules", "astro", "bin", "astro.mjs");

execFileSync(process.execPath, [join(repositoryRoot, "scripts", "build.mjs")], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(publicRoot, { recursive: true });
cpSync(join(repositoryRoot, "build"), publicRoot, { recursive: true });

execFileSync(process.execPath, [astroCli, "build"], {
  cwd: deployRoot,
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
  stdio: "inherit",
});
