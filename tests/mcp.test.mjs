import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = new URL("../", import.meta.url);

async function connectClient() {
  const client = new Client({ name: "slidair-test-client", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [new URL("../mcp-server.mjs", import.meta.url).pathname.replace(/^\/(\w):/, "$1:")],
    cwd: root.pathname.replace(/^\/(\w):/, "$1:"),
    stderr: "pipe",
  });
  await client.connect(transport);
  return { client, transport };
}

function resultJson(result) {
  const text = result.content?.find((item) => item.type === "text")?.text;
  return text ? JSON.parse(text) : null;
}

test("MCP server exposes Slidair tools, resources, and a prompt", async (t) => {
  const { client, transport } = await connectClient();
  t.after(async () => {
    await client.close();
    await transport.close();
  });

  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map((tool) => tool.name),
    ["validate_deck", "create_deck", "apply_atmosphere_story", "make_share_url", "list_scenes"],
  );
  const resources = await client.listResources();
  assert.deepEqual(resources.resources.map((resource) => resource.uri), [
    "slidair://schema/deck-v1",
    "slidair://design-rules",
    "slidair://catalog/scenes",
  ]);
  const schema = await client.readResource({ uri: "slidair://schema/deck-v1" });
  assert.match(schema.contents[0].text, /Slidair deck/);
  const prompt = await client.getPrompt({ name: "make_deck_from_outline", arguments: { outline: "Rustの所有権を説明する" } });
  assert.ok(prompt.messages[0].content.text.includes("deck.json"));
  const prompts = await client.listPrompts();
  assert.deepEqual(prompts.prompts.map((prompt) => prompt.name), ["make_deck_from_outline"]);
});

test("MCP validate and share tools use the same canonical deck rules", async (t) => {
  const { client, transport } = await connectClient();
  t.after(async () => {
    await client.close();
    await transport.close();
  });

  const document = JSON.stringify({
    title: "MCPからのデッキ",
    slides: [{ role: "cover", atmosphere: { scene: "rust-forge" }, content: { title: "Rust" } }],
  });
  const validated = resultJson(await client.callTool({ name: "validate_deck", arguments: { document } }));
  assert.equal(validated.valid, true);
  assert.equal(validated.normalized.slides[0].atmosphere.scene, "rust-forge");
  const objectValidated = resultJson(await client.callTool({ name: "validate_deck", arguments: { document: { slides: [{ role: "cover", content: { title: "オブジェクト" } }] } } }));
  assert.equal(objectValidated.valid, true);

  const shared = resultJson(await client.callTool({ name: "make_share_url", arguments: { document, baseUrl: "https://slidair.example/" } }));
  assert.match(shared.url, /^https:\/\/slidair\.example\/\?season=/);
  assert.match(shared.url, /(?:^|&)deck=/);
});

test("MCP rejects invalid documents with a useful error", async (t) => {
  const { client, transport } = await connectClient();
  t.after(async () => {
    await client.close();
    await transport.close();
  });

  const result = await client.callTool({ name: "create_deck", arguments: { document: JSON.stringify({ slides: [{ role: "unknown" }] }) } });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /slides\[0\]\.role/);
});
