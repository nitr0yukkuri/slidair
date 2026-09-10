# Slidair deck.json

Slidairは、内容と空気の意図を小さなJSONに変換し、レイアウトと可読性をアプリ側で守ります。AIや外部ツールからデッキを渡すときは、`version: 1` のschemaを使います。

```json
{
  "version": 1,
  "title": "Rustの所有権モデル",
  "atmosphere": {
    "season": "winter",
    "period": "night",
    "weather": "clear",
    "scene": "rust-forge"
  },
  "slides": [
    {
      "role": "cover",
      "content": {
        "kicker": "RUST / 01",
        "title": "所有権は、\n安全性を設計する。",
        "body": "堅牢な低レイヤーを支える仕組み。"
      }
    },
    {
      "role": "content",
      "content": {
        "title": "コンパイル時に保証する",
        "body": "実行前にメモリの扱いを検証する。"
      }
    }
  ]
}
```

## AIに任せる範囲

- `role`、文章、季節・時間帯・天気・景色の意図
- 表紙から締めまでの順番

## Slidairが守る範囲

- レイアウト、余白、文字サイズ、コントラスト
- 背景画像、ぼかし、暗幕、モーション
- 最大48枚、利用可能なrole・sceneの検証

`atmosphere` はデッキ全体の初期値です。各スライドに同じキーを置けば、そのスライドだけ上書きできます。`content` を省略して `title` / `body` をスライド直下に置く旧形式も読み込めますが、新しく生成する場合は `content` を使います。

## MCP

ローカルMCPサーバーは次のコマンドで起動します。

```sh
npm run mcp
```

公開するツールは `validate_deck`、`create_deck`、`apply_atmosphere_story`、`make_share_url`、`list_scenes` です。schemaとデザインルールは `slidair://schema/deck-v1` と `slidair://design-rules` から読めます。

MCPクライアントの設定例（stdio）:

```json
{
  "mcpServers": {
    "slidair": {
      "command": "npm",
      "args": ["--prefix", "C:/src/slide-atmosphere", "run", "mcp"]
    }
  }
}
```

MCPはSlidair本体を置き換えません。AIが生成したJSONを、UIの「JSONを読み込む」から取り込むか、`make_share_url` の結果を開いて確認します。 保存ボタンから同じschemaの `.slidair.json` を書き出せるので、編集したデッキを再利用できます。
