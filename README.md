# slide-atmosphere

プレゼンテーションのための、静かな環境背景ジェネレーター。

季節・時間帯・天気・スライドの役割を組み合わせ、本文を邪魔しない低彩度のグラデーション背景を生成します。季節はスライド下部の色だけで示し、背景を「装飾」ではなく、発表全体の空気を揃えるデザインシステムとして扱うためのプロトタイプです。

## MVP

- 16:9のプレゼンテーションプレビュー
- `spring / summer / autumn / winter` の季節
- `morning / day / evening / night` の時間帯
- `clear / cloudy / rain / snow` の天気
- `cover / section / content / quote / closing` のスライド役割
- URLパラメータによる再現可能なプリセット
- CSSグラデーション、SVGノイズ、低速トランジション
- `prefers-reduced-motion` 対応
- オフラインで動作する手動モード

## 起動

ビルドツール不要です。`index.html` をブラウザで開くか、静的サーバーを起動してください。

```powershell
cd C:\src\slide-atmosphere
node server.mjs
```

ブラウザで <http://localhost:4173> を開きます。

URLで状態を固定できます。

```text
http://localhost:4173/?season=autumn&period=evening&weather=rain&role=cover
```

## 設計方針

### 4つの状態軸

```text
WorldState = season + period + weather + role
```

- `season`: スライド下部の低彩度アクセントカラー
- `period`: 明るさと色温度
- `weather`: 彩度、コントラスト、質感
- `role`: 発表中の情報階層

季節は世界観の入口として使い、下部の色に限定します。天気や昼夜だけではプレゼン資料の構造を表現できないため、スライド役割も独立した軸として扱います。

### レイヤー

1. ベースグラデーション
2. ぼかした光
3. 天候による大気色
4. 周辺を落とすビネット
5. ほとんど見えないSVGノイズ

中央の安全領域には強い光や動きを置かず、タイトル・本文・図表の可読性を優先します。

## 今後の拡張

- 現在時刻に基づく自動モード
- Open-Meteo等の天気情報との接続
- 取得失敗時の固定フォールバック
- 1920×1080 PNG書き出し
- PowerPoint / Google Slides向けのプリセット出力
- 発表者用のライブプレビューと、聴衆用の静止画出力の分離

詳細な企画・リスク・実装判断は [`docs/design-analysis.md`](docs/design-analysis.md) を参照してください。

