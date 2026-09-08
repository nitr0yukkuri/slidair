const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const shouldStartServer = !process.env.BASE_URL;
const smokeRoot = process.argv[2] ? require("node:path").resolve(process.argv[2]) : null;
let server;

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`サーバーが起動しません: ${url}`);
}

(async () => {
  if (shouldStartServer) {
    server = spawn(process.execPath, ["server.mjs"], { stdio: "ignore", env: { ...process.env, ...(smokeRoot ? { STATIC_ROOT: smokeRoot } : {}) } });
    await waitForServer(baseUrl);
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/?season=spring&period=day&weather=clear&scene=none&role=cover`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".scene-choices .choice-button").count(), 20);
    assert.equal(await page.locator("#slide-count").innerText(), "1枚");

    await page.getByRole("button", { name: "複製", exact: true }).click();
    assert.equal(await page.locator("#slide-count").innerText(), "2枚");
    await page.getByRole("button", { name: "元に戻す", exact: true }).click();
    assert.equal(await page.locator("#slide-count").innerText(), "1枚");
    await page.getByRole("button", { name: "やり直す", exact: true }).click();
    assert.equal(await page.locator("#slide-count").innerText(), "2枚");
    await page.keyboard.press("Control+z");
    assert.equal(await page.locator("#slide-count").innerText(), "1枚");
    await page.keyboard.press("Control+Shift+z");
    assert.equal(await page.locator("#slide-count").innerText(), "2枚");
    await page.keyboard.press("Alt+ArrowUp");
    await page.keyboard.press("Delete");
    assert.equal(await page.locator("#slide-count").innerText(), "1枚");

    const dragContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const dragPage = await dragContext.newPage();
    await dragPage.goto(`${baseUrl}/?season=spring&period=day&weather=clear&scene=none&role=cover`, { waitUntil: "networkidle" });
    await dragPage.getByRole("button", { name: "サンプルデッキ", exact: true }).click();
    await dragPage.locator(".deck-item").nth(0).dragTo(dragPage.locator(".deck-item").nth(4));
    assert.match(await dragPage.locator(".deck-thumb").nth(4).getAttribute("aria-label"), /5枚目、表紙$/);
    await dragPage.getByRole("button", { name: "元に戻す", exact: true }).click();
    assert.match(await dragPage.locator(".deck-thumb").nth(0).getAttribute("aria-label"), /1枚目、表紙$/);
    await dragContext.close();

    const editContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const editPage = await editContext.newPage();
    await editPage.goto(`${baseUrl}/?season=spring&period=day&weather=clear&scene=none&role=cover`, { waitUntil: "networkidle" });
    const originalTitle = await editPage.locator("#slide-title").innerText();
    await editPage.getByRole("button", { name: "テキストを編集", exact: true }).click();
    const editedTitle = `${originalTitle} 更新`;
    await editPage.locator("#slide-title").fill(editedTitle);
    await editPage.getByRole("button", { name: "編集を完了", exact: true }).click();
    await editPage.getByRole("button", { name: "元に戻す", exact: true }).click();
    assert.equal(await editPage.locator("#slide-title").innerText(), originalTitle);
    await editPage.getByRole("button", { name: "やり直す", exact: true }).click();
    assert.equal(await editPage.locator("#slide-title").innerText(), editedTitle);
    await editContext.close();

    await page.getByRole("button", { name: "宇宙", exact: true }).click();
    await page.getByRole("button", { name: "お気に入りに追加", exact: true }).click();
    await page.getByRole("button", { name: "お気に入りの景色", exact: true }).click();
    assert.equal(await page.locator('.scene-choices [data-value="space"]').isVisible(), true);
    assert.equal(await page.locator('.scene-choices [data-value="city"]').isVisible(), false);
    for (const [label, minimum] of [["自然カテゴリ", 1], ["都会カテゴリ", 1], ["暗めカテゴリ", 1]]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      assert.ok(await page.locator(".scene-choices .choice-button:visible").count() >= minimum);
    }
    await page.getByRole("button", { name: "すべての景色", exact: true }).click();

    await page.getByRole("button", { name: "デッキを共有", exact: true }).click();
    assert.match(page.url(), /[?&]deck=/);
    const sharedUrl = page.url();
    const localDeckBefore = await page.evaluate(() => localStorage.getItem("slide-atmosphere:deck:v1"));
    const restored = await context.newPage();
    await restored.goto(sharedUrl, { waitUntil: "networkidle" });
    assert.equal(await restored.locator("#slide-count").innerText(), "1枚");
    assert.equal(await restored.locator("#slide").getAttribute("data-scene"), "space");
    assert.match(await restored.locator('meta[property="og:image"]').getAttribute("content"), /scene-space-nebula-v1\.webp$/);
    assert.equal(await restored.evaluate(() => localStorage.getItem("slide-atmosphere:deck:v1")), localDeckBefore);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    const unnamed = await page.locator("button:visible").evaluateAll((buttons) => buttons.filter((button) => !(button.getAttribute("aria-label") || button.textContent || "").trim()).length);
    assert.equal(unnamed, 0);
    assert.deepEqual(errors, []);
    console.log("browser smoke: pass");
  } finally {
    await browser.close();
    if (server) {
      server.kill();
      await once(server, "exit").catch(() => {});
    }
  }
})().catch((error) => {
  console.error(error);
  if (server) server.kill();
  process.exitCode = 1;
});
