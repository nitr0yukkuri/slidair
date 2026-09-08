import assert from "node:assert/strict";
import test from "node:test";

import {
  clearContentDraft,
  contentStorageKey,
  contentForRole,
  normalizeContent,
  readContentDraft,
  writeContentDraft,
} from "../content.mjs";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("normalizeContent trims text and preserves intentional title breaks", () => {
  assert.deepEqual(normalizeContent({ title: "  一行目\n二行目  " }, contentForRole("cover")), {
    kicker: "COVER / 01",
    title: "一行目\n二行目",
    body: "文字より前に立たず、空気だけを残す。",
  });
  assert.equal(normalizeContent(null, contentForRole("cover")).title, contentForRole("cover").title);
});

test("content drafts are isolated by slide role", () => {
  const storage = createStorage();
  writeContentDraft("cover", { title: "自分の表紙" }, storage);
  assert.equal(readContentDraft("cover", storage).title, "自分の表紙");
  assert.equal(readContentDraft("section", storage), null);
  clearContentDraft("cover", storage);
  assert.equal(storage.getItem(contentStorageKey("cover")), null);
});

test("content drafts are normalized before persistence", () => {
  const storage = createStorage();
  writeContentDraft("content", { body: "  本文  " }, storage);
  assert.equal(readContentDraft("content", storage).body, "本文");
});
