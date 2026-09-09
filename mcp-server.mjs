import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { ATMOSPHERE_STORIES, applyStoryToDeck } from "./atmosphere-story.mjs";
import { deckToSlidairDocument, parseSlidairDocument, SLIDAIR_SCHEMA } from "./slidair-schema.mjs";
import { MAX_DECK_SHARE_LENGTH, serializeDeck } from "./deck-share.mjs";
import { SCENE_PRESETS } from "./scenes.mjs";
import { stateToSearchParams } from "./state.mjs";

const serverInfo = Object.freeze({ name: "slidair", version: "1.0.0" });
const documentInput = {
  document: z.union([z.string().min(2), z.record(z.string(), z.unknown())]).describe("Slidair deck JSON (文字列またはJSONオブジェクト)"),
};

function textResult(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: "text", text }] };
}

function errorResult(message) {
  return { isError: true, content: [{ type: "text", text: message }] };
}

function parseDocument(document) {
  const parsed = parseSlidairDocument(document);
  if (!parsed.ok) {
    const details = parsed.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
    return { parsed: null, error: `Slidair deck JSONが不正です。\n${details}` };
  }
  return { parsed, error: null };
}

function shareUrlForDeck(deck, baseUrl) {
  let url;
  try {
    url = new URL(baseUrl || "http://127.0.0.1:4173/");
  } catch {
    return { error: "baseUrlはhttpまたはhttpsのURLで指定してください" };
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    return { error: "baseUrlは認証情報を含まないhttpまたはhttpsのURLで指定してください" };
  }
  const payload = serializeDeck(deck);
  if (payload.length > MAX_DECK_SHARE_LENGTH) {
    return { error: `共有データが長すぎます（${payload.length} / ${MAX_DECK_SHARE_LENGTH}文字）` };
  }
  const firstState = deck.slides[0].state;
  url.search = stateToSearchParams(firstState).toString();
  url.searchParams.set("deck", payload);
  return { url: url.href, payloadLength: payload.length };
}

export function createSlidairMcpServer() {
  const server = new McpServer(serverInfo);

  server.registerResource(
    "deck-schema",
    "slidair://schema/deck-v1",
    { description: "Slidair deck.jsonのJSON Schema", mimeType: "application/schema+json" },
    async (uri) => ({ contents: [{ uri: String(uri), mimeType: "application/schema+json", text: JSON.stringify(SLIDAIR_SCHEMA, null, 2) }] }),
  );

  server.registerResource(
    "design-rules",
    "slidair://design-rules",
    { description: "AIがSlidairの空気を壊さずに使うためのルール", mimeType: "text/markdown" },
    async (uri) => ({
      contents: [{
        uri: String(uri),
        mimeType: "text/markdown",
        text: [
          "# Slidair design rules",
          "- AIは内容・role・空気の意図だけを決める。CSS、座標、文字サイズ、画像URLは指定しない。",
          "- roleはcover / section / content / quote / closingのいずれかにする。",
          "- season・period・weather・sceneはSlidairのカタログにある値だけを使う。",
          "- 1デッキは48枚以内。本文は短く、背景を主役にしない。",
          "- 同じ入力からは同じdeck.jsonを返し、必要ならvalidate_deckで確認する。",
        ].join("\n"),
      }],
    }),
  );

  server.registerResource(
    "scene-catalog",
    "slidair://catalog/scenes",
    { description: "利用できる景色の一覧", mimeType: "application/json" },
    async (uri) => ({
      contents: [{
        uri: String(uri),
        mimeType: "application/json",
        text: JSON.stringify(SCENE_PRESETS.map(({ key, label, categories, family, tone }) => ({ key, label, categories, family, tone })), null, 2),
      }],
    }),
  );

  server.registerTool("validate_deck", {
    description: "Slidairのdeck.jsonを検証し、エラーをパス付きで返します。",
    inputSchema: documentInput,
  }, async ({ document }) => {
    const parsed = parseSlidairDocument(document);
    return textResult(parsed.ok
      ? { valid: true, warnings: parsed.warnings, normalized: parsed.document }
      : { valid: false, errors: parsed.errors, warnings: parsed.warnings });
  });

  server.registerTool("create_deck", {
    description: "Slidairのdeck.jsonを検証・正規化し、UIで表示できるcanonical documentを返します。",
    inputSchema: documentInput,
  }, async ({ document }) => {
    const { parsed, error } = parseDocument(document);
    return error ? errorResult(error) : textResult({ document: parsed.document, warnings: parsed.warnings });
  });

  server.registerTool("apply_atmosphere_story", {
    description: "既存デッキにSlidairの空気の流れプリセットを適用します。",
    inputSchema: {
      ...documentInput,
      story: z.enum(ATMOSPHERE_STORIES.map((item) => item.key)).default(ATMOSPHERE_STORIES[0].key).describe("適用する空気の流れ"),
    },
  }, async ({ document, story }) => {
    const { parsed, error } = parseDocument(document);
    if (error) return errorResult(error);
    const nextDeck = applyStoryToDeck(parsed.deck, story);
    return textResult({ document: deckToSlidairDocument(nextDeck, parsed.document), story, warnings: parsed.warnings });
  });

  server.registerTool("make_share_url", {
    description: "Slidairのdeck.jsonから、ブラウザで復元できる共有URLを作ります。",
    inputSchema: {
      ...documentInput,
      baseUrl: z.string().optional().describe("Slidairの公開URL。省略時はローカル開発URL"),
    },
  }, async ({ document, baseUrl }) => {
    const { parsed, error } = parseDocument(document);
    if (error) return errorResult(error);
    const result = shareUrlForDeck(parsed.deck, baseUrl);
    return result.error ? errorResult(result.error) : textResult({ ...result, warnings: parsed.warnings });
  });

  server.registerTool("list_scenes", {
    description: "Slidairで選べる景色を一覧します。",
  }, async () => textResult(SCENE_PRESETS.map(({ key, label, categories, family, tone }) => ({ key, label, categories, family, tone }))));

  server.registerPrompt("make_deck_from_outline", {
    description: "アウトラインからSlidairのdeck.jsonを作るための指示を返します。",
    argsSchema: {
      outline: z.string().min(1).describe("スライドにしたいアウトライン"),
    },
  }, async ({ outline }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: [
          "次のアウトラインをSlidairのdeck.jsonに変換してください。",
          "role・season・period・weather・sceneはカタログ内の値だけを使い、CSSや座標は出力しないでください。",
          "表紙→区切り→本文→引用→締めの流れを必要に応じて使い、最後にvalidate_deckへ渡せるJSONだけを返してください。",
          "アウトライン:",
          outline,
        ].join("\n"),
      },
    }],
  }));

  return server;
}

export async function startSlidairMcpServer() {
  const server = createSlidairMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startSlidairMcpServer().catch((error) => {
    console.error("Slidair MCP server error:", error);
    process.exit(1);
  });
}
