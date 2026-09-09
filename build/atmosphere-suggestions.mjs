// Local, deterministic text-to-atmosphere suggestions. No slide text leaves the browser.
const SUGGESTION_BLUEPRINTS = Object.freeze([
  Object.freeze({
    key: "quiet-tension",
    label: "Quiet tension",
    description: "課題の輪郭を残し、視線を落ち着かせる",
    state: Object.freeze({ season: "winter", period: "night", weather: "cloudy", scene: "misty-harbor" }),
    terms: Object.freeze(["課題", "問題", "停滞", "コスト", "リスク", "失敗", "遅い", "困る", "未解決"]),
  }),
  Object.freeze({
    key: "technical-calm",
    label: "Technical calm",
    description: "仕組みの複雑さを、深い青の余白で整える",
    state: Object.freeze({ season: "summer", period: "night", weather: "clear", scene: "deep-sea" }),
    terms: Object.freeze(["システム", "設計", "実装", "データ", "API", "運用", "構成", "技術", "コード"]),
  }),
  Object.freeze({
    key: "clear-forward",
    label: "Clear forward",
    description: "解決や成果を、朝の光へつなげる",
    state: Object.freeze({ season: "spring", period: "morning", weather: "clear", scene: "first-sunrise" }),
    terms: Object.freeze(["解決", "改善", "成果", "成功", "未来", "次", "前進", "効果", "実現"]),
  }),
]);

function normalizeText(content = {}) {
  return [content.kicker, content.title, content.body]
    .filter((value) => typeof value === "string")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchedTerms(text, terms) {
  return terms.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
}

export function suggestionBlueprints() {
  return SUGGESTION_BLUEPRINTS;
}

export function suggestAtmospheres(content, currentState = {}) {
  const text = normalizeText(content);
  return SUGGESTION_BLUEPRINTS
    .map((blueprint, index) => {
      const matches = matchedTerms(text, blueprint.terms);
      return {
        key: blueprint.key,
        label: blueprint.label,
        description: blueprint.description,
        state: { ...currentState, ...blueprint.state },
        matchedTerms: matches,
        confidence: Math.min(0.96, matches.length ? 0.58 + matches.length * 0.1 : 0.34 - index * 0.03),
        order: index,
      };
    })
    .sort((a, b) => b.matchedTerms.length - a.matchedTerms.length || a.order - b.order)
    .map(({ order, ...suggestion }) => suggestion);
}