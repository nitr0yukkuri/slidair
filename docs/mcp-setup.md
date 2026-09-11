# MCPからSlidairを使う

Slidairには、追加料金やAPIキーがいらないローカルstdio MCPサーバーが付属しています。Node.js 20以上を用意し、リポジトリのルートで次を実行します。

~~~bash
npm install
npm run mcp
~~~

MCPクライアントからは、validate_deck、create_deck、apply_atmosphere_story、make_share_url、list_scenesが使えます。生成結果はSlidairの同じschemaで返るので、UIの「JSONを読み込む」から取り込めます。

## 設定例

mcp.config.example.jsonをコピーし、argsのパスを自分のチェックアウト先へ変更してください。WindowsではC:/...のようにスラッシュを使うとJSONをそのまま貼り付けられます。

### Cursor

.cursor/mcp.jsonへ次の内容を追加します。

~~~json
{
  "mcpServers": {
    "slidair": {
      "command": "node",
      "args": ["C:/src/slidair/mcp-server.mjs"]
    }
  }
}
~~~

### Claude Desktop

claude_desktop_config.jsonのmcpServersへ同じslidairエントリを追加します。設定後にClaude Desktopを再起動してください。

### VS Code

.vscode/mcp.jsonではキーがserversになります。

~~~json
{
  "servers": {
    "slidair": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/src/slidair/mcp-server.mjs"]
    }
  }
}
~~~

## サンプルJSONから最初のデッキを作る

1. examples/hello.deck.jsonをクライアントのチャットへ貼るか、create_deckへ渡す。
2. 返ってきたcanonical documentをslidair-deck.slidair.jsonとして保存する。
3. Slidairを開き、「JSONを読み込む」でファイルを選ぶ。
4. 必要ならmake_share_urlへ同じJSONを渡し、デッキ全体のURLを作る。

MCPは内容・role・空気の意図だけを扱い、CSSや座標を生成しません。レイアウト、余白、文字色、背景の強さはSlidairが決めます。