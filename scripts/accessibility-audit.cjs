const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const smokeRoot = process.argv[2] ? require("node:path").resolve(process.argv[2]) : null;
let server;
async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("サーバーが起動しません");
}
(async () => {
  if (!process.env.BASE_URL) { server = spawn(process.execPath, ["server.mjs"], { stdio: "ignore", env: { ...process.env, ...(smokeRoot ? { STATIC_ROOT: smokeRoot } : {}) } }); await waitForServer(); }
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${baseUrl}/?season=spring&period=day&weather=clear&scene=none&role=cover`, { waitUntil: "networkidle" });
    const audit = await page.evaluate(() => {
      const visible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
      const controls = [...document.querySelectorAll("button, input, select, textarea")].filter(visible);
      const unnamed = controls.filter((element) => !(element.getAttribute("aria-label") || element.textContent || element.labels?.[0]?.textContent || "").trim());
      const focusableButtons = controls.filter((element) => element.matches("button") && !element.disabled);
      const focusFailures = [];
      focusableButtons.forEach((element) => {
        element.focus();
        const style = getComputedStyle(element);
        if (style.outlineStyle === "none" && style.boxShadow === "none") focusFailures.push(element.id || element.textContent.trim());
      });
      return { unnamed: unnamed.map((element) => element.id || element.tagName), focusFailures, width: document.documentElement.scrollWidth, viewport: innerWidth };
    });
    assert.deepEqual(audit.unnamed, []);
    assert.deepEqual(audit.focusFailures, []);
    assert.ok(audit.width <= audit.viewport + 1);
    await page.getByRole("button", { name: "複製", exact: true }).click();
    assert.equal(await page.locator("#slide-count").innerText(), "2枚");
    await page.keyboard.press("Control+d");
    assert.equal(await page.locator("#slide-count").innerText(), "3枚");
    console.log("a11y audit: pass");
  } finally {
    await browser.close();
    if (server) { server.kill(); await once(server, "exit").catch(() => {}); }
  }
})().catch((error) => { console.error(error); if (server) server.kill(); process.exitCode = 1; });
