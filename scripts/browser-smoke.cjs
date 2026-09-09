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
    assert.match(await page.title(), /Slidair$/);
    assert.equal(await page.locator('link[rel="manifest"]').getAttribute("href"), "./manifest.webmanifest");
    const registration = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return null;
      const ready = await navigator.serviceWorker.ready;
      return { scope: ready.scope, state: ready.active?.state };
    });
    assert.ok(registration);
    assert.equal(new URL(registration.scope).pathname, "/");
    assert.equal(registration.state, "activated");
    const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const offlinePage = await offlineContext.newPage();
    await offlinePage.goto(`${baseUrl}/?season=winter&period=night&weather=snow&scene=none&role=section`, { waitUntil: "networkidle" });
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlineContext.setOffline(true);
    await offlinePage.reload({ waitUntil: "domcontentloaded" });
    assert.match(await offlinePage.title(), /Slidair$/);
    await offlineContext.close();
    assert.equal(await page.locator(".scene-choices .choice-button").count(), 32);
    for (const [label, key, asset] of [
      ["山霞", "misty-mountains", "scene-misty-mountains-v1.png"],
      ["潮だまり", "tidepool-coast", "scene-tidepool-coast-v1.png"],
      ["雲海", "cloud-sea", "scene-cloud-sea-v1.png"],
      ["藤棚", "wisteria-bower", "scene-wisteria-bower-v1.png"],
      ["石庭", "stone-garden", "scene-stone-garden-v1.png"],
      ["夕渓谷", "red-canyon", "scene-red-canyon-v1.png"],
      ["霧の港", "misty-harbor", "scene-misty-harbor-v1.png"],
      ["雨の窓", "rain-window", "scene-rain-window-v1.png"],
      ["白樺林", "birch-grove", "scene-birch-grove-v1.png"],
      ["夜の灯台", "lighthouse-night", "scene-lighthouse-night-v1.png"],
      ["Rust Forge", "rust-forge", "scene-rust-forge-v1.png"],
      ["桜並木", "cherry-blossom", "scene-cherry-blossom-v1.png"],
    ]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      assert.equal(await page.locator("#slide").getAttribute("data-scene"), key);
      assert.match(await page.locator('meta[property="og:image"]').getAttribute("content"), new RegExp(`${asset}$`));
    }
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

    await page.locator("#deck-file-input").setInputFiles({
      name: "slidair-demo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({
        version: 1,
        title: "インポート確認",
        atmosphere: { season: "winter", period: "night", weather: "clear", scene: "rust-forge" },
        slides: [
          { role: "cover", content: { title: "MCPから来た表紙", body: "UIへ取り込める" } },
          { role: "content", atmosphere: { scene: "deep-sea" }, content: { title: "本文", body: "空気はスライドごとに変えられる" } }
        ]
      }))
    });
    await page.waitForTimeout(100);
    assert.equal(await page.locator("#slide-count").innerText(), "2枚");
    assert.equal(await page.locator("#slide-title").innerText(), "MCPから来た表紙");
    assert.equal(await page.locator("#slide").getAttribute("data-scene"), "rust-forge");
    assert.match(await page.locator("#status").innerText(), /インポート確認.*読み込みました/);
    await page.getByRole("button", { name: "元に戻す", exact: true }).click();
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

    const bulkContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const bulkPage = await bulkContext.newPage();
    await bulkPage.goto(`${baseUrl}/?season=spring&period=day&weather=clear&scene=none&role=cover`, { waitUntil: "networkidle" });
    await bulkPage.getByRole("button", { name: "サンプルデッキ", exact: true }).click();
    const rolesBeforeRandom = await bulkPage.locator(".deck-thumb").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
    const scenesBeforeRandom = await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => preview.dataset.scene));
    await bulkPage.getByRole("button", { name: "ランダム", exact: true }).click();
    assert.equal(await bulkPage.locator(".deck-item").count(), 5);
    assert.deepEqual(await bulkPage.locator(".deck-thumb").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label"))), rolesBeforeRandom);
    const randomAtmospheres = await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => [preview.dataset.season, preview.dataset.period, preview.dataset.weather, preview.dataset.scene]));
    assert.ok(randomAtmospheres.every((atmosphere) => JSON.stringify(atmosphere) === JSON.stringify(randomAtmospheres[0])));
    await bulkPage.getByRole("button", { name: "元に戻す", exact: true }).click();
    assert.deepEqual(await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => preview.dataset.scene)), scenesBeforeRandom);
    await bulkPage.getByRole("button", { name: "やり直す", exact: true }).click();
    assert.ok((await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => preview.dataset.period))).every((period) => period === randomAtmospheres[0][1]));
    await bulkPage.getByRole("button", { name: "現在時刻", exact: true }).click();
    const currentPeriods = await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => preview.dataset.period));
    assert.ok(currentPeriods.every((period) => period === currentPeriods[0]));
    await bulkPage.locator(".story-disclosure > summary").click();
    await bulkPage.getByRole("button", { name: /^Night Journey/ }).click();
    assert.equal(await bulkPage.locator(".story-beat").count(), 5);
    await bulkPage.getByRole("button", { name: "この流れを適用", exact: true }).click();
    assert.match(await bulkPage.locator("#status").innerText(), /Night Journey/);
    const storyScenes = await bulkPage.locator(".deck-thumb-preview").evaluateAll((previews) => previews.map((preview) => preview.dataset.scene));
    assert.equal(storyScenes.length, 5);
    assert.ok(new Set(storyScenes).size >= 3);
    await bulkContext.close();

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
    await editPage.getByRole("button", { name: "テキストを編集", exact: true }).click();
    await editPage.getByRole("button", { name: "内容から空気を提案", exact: true }).click();
    assert.equal(await editPage.locator(".suggestion-card").count(), 3);
    await editPage.locator(".suggestion-apply").first().click();
    assert.match(await editPage.locator("#status").innerText(), /を適用しました/);
    await editPage.getByRole("button", { name: "編集を完了", exact: true }).click();
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
    assert.equal(await page.locator("#mobile-bottom-nav").isVisible(), true);
    assert.equal(await page.locator(".mobile-nav-button").count(), 4);
    assert.ok(await page.locator(".mobile-nav-button").evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().height >= 44)));
    await page.getByRole("button", { name: "背景", exact: true }).click();
    await page.waitForTimeout(450);
    assert.ok(await page.locator("#controls").evaluate((element) => element.getBoundingClientRect().top <= 8));
    await page.getByRole("button", { name: "デッキ", exact: true }).click();
    await page.waitForTimeout(450);
    assert.ok(await page.locator("#deck-panel").evaluate((element) => element.getBoundingClientRect().top <= 8));
    await page.getByRole("button", { name: "プレビュー", exact: true }).click();
    await page.waitForTimeout(450);
    assert.ok(await page.locator(".canvas-toolbar").evaluate((element) => element.getBoundingClientRect().top <= 8));
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
