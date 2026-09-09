# Slidair

プレゼンテーションのための、静かな環境背景ジェネレーター。

季節・時間帯・天気・景色・スライドの役割を組み合わせ、本文を邪魔しない低彩度の背景を生成します。季節はスライド下部の色、景色はぼかした背景や静かな星空で示し、背景を「装飾」ではなく、発表全体の空気を揃えるデザインシステムとして扱うためのプロトタイプです。

## MVP

- 16:9のプレゼンテーションプレビュー
- `spring / summer / autumn / winter` の季節
- `morning / day / evening / night` の時間帯
- `clear / cloudy / rain / snow` の天気
- なし・花火・湖・都会・宇宙・海中・田舎・快晴・深海・初日の出・木漏れ日・竹林・桜霞・桜並木・紫陽花・花畑・紅葉・雪原・砂丘・月夜の海・オーロラ・山霞・潮だまり・雲海・藤棚・石庭・夕渓谷・霧の港・雨の窓・白樺林・夜の灯台・Rust Forgeの32種類の景色
- `cover / section / content / quote / closing` のスライド役割
- スライド一覧からの追加・切り替え・複製・削除・前後移動・ドラッグ並べ替え（Alt+矢印、Ctrl/Cmd+D、Delete）
- 直近50操作のUndo / Redo（Ctrl/Cmd+Z、Ctrl/Cmd+Shift+Z）
- ランダムな空気感・現在時刻のデッキ全体適用（役割・文章・順番を維持）
- Atmosphere Story（表紙から締めまでの5ビート）をデッキ全体へ適用
- 本文からローカル判定で3つの空気候補を提案
- URLパラメータによる再現可能なプリセットと、デッキ全体を含む共有URL
- 編集モードでタイトル・本文・小見出しをライブ編集
- スライドごとの背景・役割・文章をブラウザへデッキとして下書き保存
- スライドだけを大きく表示する発表モード（Esc・矢印キー・PageUp/PageDown・Space対応）
- スマホ向け固定フッターナビ（プレビュー・デッキ・背景・発表）
- PWA対応（ホーム画面追加・オフラインのシェルキャッシュ）
- AI連携: deck.json の読み込みと、ローカルstdio MCP（npm run mcp）に対応。仕様は docs/deck-schema.md。
- 発表の空気を示す静かなワードマークと、状態操作のヘッダー
- 宇宙専用の星雲素材と、役割・時間帯に応じた光量調整（[詳細分析](docs/space-art-direction.md)）
- 海中・田舎・快晴・深海・初日の出など10種類の柔らかな自然背景と、Rust Forgeの技術系背景（[素材と制作メモ](docs/landscape-presets.md)、[追加素材のプロンプト](docs/scene-expansion-prompts.md)）
- CSSグラデーション、SVGノイズ、低速トランジション
- `prefers-reduced-motion` 対応
- 景色のカテゴリ絞り込み、お気に入り、最近使った景色の保存
- 景色ごとのOG画像メタデータ切り替え
- Node単体テスト、Chromiumスモーク、アクセシビリティ監査をGitHub Actionsで実行
- オフラインで動作する手動モード

## 起動

ビルドツール不要です。`index.html` をブラウザで開くか、静的サーバーを起動してください。

```powershell
cd C:\src\slide-atmosphere
node server.mjs
```

ブラウザで <http://localhost:4173> を開きます。

状態変換と静的サーバーの純粋な検証は、Node.js標準のテストランナーで実行できます。ブラウザの回帰とアクセシビリティ監査も同じコマンドから実行できます。

```powershell
npm test

npm run test:browser

npm run audit:a11y
```

公開対象のbuild/はソースから再生成できます。コミット前とCIでは同期チェックを実行します。

```powershell
npm run build
npm run check:build
```

URLで状態を固定できます。

```text
http://localhost:4173/?season=autumn&period=night&weather=rain&scene=none&role=cover
```

## 設計方針

### 5つの状態軸

```text
WorldState = season + period + weather + scene + role
```

- `season`: スライド下部の低彩度アクセントカラー
- `period`: 明るさと色温度
- `weather`: 彩度、コントラスト、質感
- `scene`: 独立した背景。花火・湖・都会と26種類の自然風景は低コントラストのぼかし、宇宙は星雲の光で表現。深海・月夜の海・オーロラは全時間帯で暗い基盤を保つ
- `role`: 発表中の情報階層

季節は世界観の入口として使い、下部の色に限定します。景色は背景の個性を足すための独立軸です。景色を選んだときは、雨・雪・曇りの大気処理を景色へ重ねません。中央の安全領域を強い図像で埋めないまま、スライド役割も独立した軸として扱います。

### 環境とコンテンツの分離

通常のURLは現在選択中の背景だけを短く共有します。共有ボタンを使うと、タイトル・本文・小見出しを含む複数スライドのデッキ全体をbase64urlでURLへ持たせられます。受け取ったデッキはそのタブのsessionStorageに一時保存され、手元の下書きを上書きせず編集モードで続きから変更できます。

### レイヤー

1. ベースグラデーション
2. ぼかした光
3. 天候による大気色
4. 周辺を落とすビネット
5. ほとんど見えないSVGノイズ
6. 任意の景色画像

中央の安全領域には強い光や動きを置かず、景色画像も文字より後ろに置きます。タイトル・本文・図表の可読性を優先します。

## 今後の拡張

- 現在時刻に基づく自動モード
- Open-Meteo等の天気情報との接続
- 取得失敗時の固定フォールバック
- 1920×1080 PNG書き出し
- PowerPoint / Google Slides向けのプリセット出力
- 発表者用のライブプレビューと、聴衆用の静止画出力の分離

詳細な企画・リスク・実装判断は [`docs/design-analysis.md`](docs/design-analysis.md) を参照してください。実装の背景と検証を技術記事としてまとめた [`docs/technical-article.md`](docs/technical-article.md) も参照してください。
