import { deckToSlidairDocument } from "./slidair-schema.mjs";

export const DECK_FILE_NAME = "slidair-deck.slidair.json";

export function deckFilePayload(deck, metadata = {}) {
  return `${JSON.stringify(deckToSlidairDocument(deck, metadata), null, 2)}\n`;
}

export function downloadDeckFile(deck, metadata = {}, {
  windowRef = globalThis.window,
  documentRef = globalThis.document,
  fileName = DECK_FILE_NAME,
} = {}) {
  if (!windowRef?.Blob || !documentRef?.createElement) return false;

  let objectUrl;
  try {
    const blob = new windowRef.Blob([deckFilePayload(deck, metadata)], { type: "application/json" });
    objectUrl = windowRef.URL?.createObjectURL?.(blob);
    if (!objectUrl) return false;
    const anchor = documentRef.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    anchor.click();
    windowRef.setTimeout?.(() => windowRef.URL?.revokeObjectURL?.(objectUrl), 0);
    return true;
  } catch {
    if (objectUrl) windowRef.URL?.revokeObjectURL?.(objectUrl);
    return false;
  }
}
