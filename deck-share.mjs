import { normalizeDeck } from "./deck.mjs";

export const DECK_SHARE_PARAM = "deck";
export const MAX_DECK_SHARE_LENGTH = 48000;

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  const base64 = typeof globalThis.btoa === "function"
    ? globalThis.btoa(binary)
    : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = typeof globalThis.atob === "function"
    ? globalThis.atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function serializeDeck(deck) {
  const normalized = normalizeDeck(deck);
  return encodeBase64Url(JSON.stringify({
    version: normalized.version,
    activeSlideId: normalized.activeSlideId,
    slides: normalized.slides,
  }));
}

export function deserializeDeck(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_DECK_SHARE_LENGTH) return null;
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
    const parsed = JSON.parse(decodeBase64Url(value));
    if (!parsed || !Array.isArray(parsed.slides) || parsed.slides.length === 0) return null;
    return normalizeDeck(parsed);
  } catch {
    return null;
  }
}
