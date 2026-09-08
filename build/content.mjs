export const CONTENT_FIELDS = Object.freeze(["kicker", "title", "body"]);

export const CONTENT_LIMITS = Object.freeze({
  kicker: 60,
  title: 120,
  body: 240,
});

const LEGACY_ROLE_CONTENT = Object.freeze({
  content: Object.freeze({
    kicker: "CONTENT / 03",
    title: "内容を、\n内容として見せる。",
    body: "内容を、内容として見せるために。",
  }),
});

export const ROLE_CONTENT = Object.freeze({
  cover: Object.freeze({
    kicker: "COVER / 01",
    title: "背景は、発表の\n空気をつくる。",
    body: "文字より前に立たず、空気だけを残す。",
  }),
  section: Object.freeze({
    kicker: "SECTION / 02",
    title: "次の景色へ。",
    body: "次の話へ移るための、静かな区切り。",
  }),
  content: Object.freeze({
    kicker: "CONTENT / 03",
    title: "伝えたいことに、\nちょうどいい背景を。",
    body: "季節や時間帯に合わせて、スライドの空気を整える。",
  }),
  quote: Object.freeze({
    kicker: "QUOTE / 04",
    title: "静かな背景は、\n言葉を強くする。",
    body: "言葉のまわりに、余白を残す。",
  }),
  closing: Object.freeze({
    kicker: "CLOSING / 05",
    title: "ここから先の\n景色へ。",
    body: "発表のあとに、少しだけ残るもの。",
  }),
});

export function isLegacySampleContent(role, input) {
  const legacy = LEGACY_ROLE_CONTENT[role];
  if (!legacy || !input || typeof input !== "object") return false;
  return CONTENT_FIELDS.every((field) => input[field] === legacy[field]);
}

export function contentForRole(role) {
  return ROLE_CONTENT[role] ?? ROLE_CONTENT.cover;
}

export function normalizeContent(input = {}, fallback = ROLE_CONTENT.cover) {
  const source = input && typeof input === "object" ? input : {};
  return Object.fromEntries(
    CONTENT_FIELDS.map((field) => {
      const fallbackValue = fallback[field] ?? "";
      const value = typeof source[field] === "string" ? source[field] : fallbackValue;
      return [field, value.trim().slice(0, CONTENT_LIMITS[field])];
    }),
  );
}

export function contentStorageKey(role) {
  return `slide-atmosphere:content:${role}`;
}

export function readContentDraft(role, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target?.getItem(contentStorageKey(role));
    if (!raw) return null;
    const normalized = normalizeContent(JSON.parse(raw), contentForRole(role));
    return isLegacySampleContent(role, normalized) ? contentForRole(role) : normalized;
  } catch {
    return null;
  }
}

export function writeContentDraft(role, input, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const normalized = normalizeContent(input, contentForRole(role));
    target?.setItem(contentStorageKey(role), JSON.stringify(normalized));
    return Boolean(target);
  } catch {
    return false;
  }
}

export function clearContentDraft(role, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.removeItem(contentStorageKey(role));
    return Boolean(target);
  } catch {
    return false;
  }
}
