# 宇宙背景のアートディレクションと検証

更新日：2026-09-08

## 今回の方向

深い黒の中を、銀青の細い星雲とわずかな琥珀色が流れる宇宙。
右側の非対称な光を特徴にし、文字が置かれる左側から中央は広い暗がりにする。
前回整えた編集UI、日本語の明朝体、スライドの配置はそのまま生かす。

「宇宙らしさ」は、星の数を増やすことより、明暗の幅と奥行きの違いでつくる。大きな光、細い光、遠い星を異なる大きさで置き、視線が左の言葉から右の星雲へ自然に流れる構図を採用した。

## 元の宇宙の分析

| 観点 | 元の状態 | 調整 |
| --- | --- | --- |
| 黒の深さ | 宇宙レイヤーが透過し、昼の明るい下地が混ざっていた | 宇宙専用の暗いベース色を設定。時間帯を変えても下地は濃い黒を保つ |
| 奥行き | 2つのぼかしと3つの点が中心で、距離の違いが弱かった | 星雲の大きな曲線、細い塵の層、遠い小さな星を専用画像として制作 |
| 色の質 | 青紫の広いグラデーションが一様に見えた | 黒を主体に、銀青と少量の琥珀色へ整理 |
| 光の配置 | 右上と左下にぼかしが広がるだけで、印象に残る形が弱かった | 右側の細い星雲をひとつの特徴にした。左側は文字のために暗く保った |
| 星の輪郭 | 均一なCSSぼかしで、点も光も同じ質感になっていた | 宇宙に汎用景色のぼかしを重ねず、素材の星と細い光を保つ |
| 役割ごとの強弱 | 本文・表紙などでも宇宙の描画強度が同じだった | 表紙0.94、区切り0.90、本文0.80、引用0.86、締め0.88の画像不透明度に設定 |
| 時間帯との関係 | 昼夜の下地が透けることで明るさが変わっていた | 黒は固定し、画像の露出だけを朝1.025、昼1.06、夕0.98、夜0.94に調整 |
| 季節色 | 下部の広い色面が宇宙の黒を浅く見せることがあった | 宇宙では光の高さを32%、不透明度を0.26へ抑え、下端に季節の気配を残す |
| 文字との関係 | 背景を暗くするだけでは、本文と星雲の強さを調整できなかった | 左側への薄い暗色グラデーションと、役割別の文字周辺の陰影を追加 |
| 選択ボタン・一覧 | 本体とは違う簡易グラデーションだった | 同じ星雲画像を共有。選択ボタンでは右の光が見える位置でトリミング |
| 動き | 汎用トランジションが宇宙にも適用されていた | 常時アニメーションは追加せず、動きを減らす設定では宇宙の遷移を完全に停止 |

## 実装

- 専用素材：[scene-space-nebula-v1.webp](../assets/scene-space-nebula-v1.webp)
- 宇宙の描画、選択ボタン、一覧は共通のCSS変数 `--space-art` を参照。
- 一覧へ `data-role` を追加し、本文・表紙などの画像強度も本体に合わせた。
- 宇宙を汎用景色の昼夜フィルターから除外。除外条件の詳細度を増やさず、都会の既存設定が優先される状態を保持。
- 状態モデル、URL、保存形式、文章、操作構成は変更していない。
- 追加の外部ライブラリや外部画像URLは使用していない。

素材は組み込みの `imagegen` で新規制作した。元画像は1672 × 941px、1,605,784 bytes。画素が完全に一致するロスレスWebPへ変換し、1,112,592 bytesにした。約30.7%の削減。生成元のPNGもそのまま保持している。

## 検証結果

### 宇宙の組み合わせ

4季節 × 4時間帯 × 5役割 = **80通り**を確認。

全組み合わせで、専用の暗い下地、ぼかしなし、役割ごとの画像強度、時間帯ごとの露出、文字の収まり、サムネイルの役割、天気を無効にする既存仕様を確認した。

### 画面・操作

- PC：1440 × 960
- タブレット：768px幅
- スマホ：390px幅、320px幅
- 表紙、本文、引用の実画面
- 発表モードとEscによる復帰
- 宇宙から「なし」へ切り替えた際の天気選択の復帰
- 再読み込み後の宇宙設定の復元
- ページの横方向のはみ出しなし、JavaScript実行エラーなし

### 他の背景

「なし・湖・都会・花火」×「昼・夜」の8条件を変更前後で撮影。
**8枚すべて、スライド画像が画素単位で一致。**

### 文字のコントラスト

冬・昼の設定で、5役割の標準文章の各文字の矩形を取得。文字を隠して同じ背景を撮影し、矩形内の最も厳しい画素との相対輝度比を計算した。

- 標準本文：最小 **8.44:1**
- 小見出し：最小 **9.41:1**
- 大きな見出し：最小 **3.02:1**

これは今回の標準文章と撮影条件の測定値。自由入力で光の上まで文字を置いた場合や、プロジェクターで投影した場合の比率まで保証する測定ではない。

Node.js標準の既存15テストも通過した。

## 最終生成プロンプト

制作方法：組み込みのimagegen。参照画像なしの新規生成。

```text
Use case: stylized-concept.
Asset type: original 16:9 ultra-wide cinematic deep-space background for an elegant Japanese presentation editor. Make a standalone artwork, no UI and absolutely no typography.
Primary request: extraordinarily refined, quiet, memorable cosmic atmosphere; deep black with luminous silver-blue nebular dust and the faintest champagne-amber accents, an expensive large-format art photograph feeling.
Composition: left 60% and center-left are very dark, beautifully graded midnight ink negative space reserved for large white slide text. On the right third, a gracefully curved, oblique veil of distant interstellar dust, gossamer-like layered filaments and a narrow luminous edge, sweeping from upper-right toward far lower-right; one memorable asymmetric curve that suggests vast depth, not a circle and not a solid planet. Let the filament fade naturally into black toward the center. A few tiny, sharply resolved distant stars with highly varied brightness and size; most nearly imperceptible, a handful visible near edges, never a uniform star wallpaper. Tiny hints of amber stardust among cool silver-blue light on the extreme right. Rightmost light visible but no white-hot blown-out areas. Entire bottom left and middle remain dark enough to place text.
Style and mood: cinematic astrophotography interpreted as restrained fine art, subtle physical dust texture, rich optical depth, soft volumetric glow surrounding delicate crisp filaments, exquisite smooth dark tonal transitions, minimal confident composition. Palette mostly near-black navy/charcoal, slate blue, pale silver, extremely restrained champagne. No bright purple or saturated neon.
Constraints: wide landscape 2560x1440 or higher 16:9. Full bleed. No text, labels, logos, border, watermark, diagram, grid, rings, orbital lines, lens flare, prominent planet, sun, spaceship, explosion, dense glitter, repeating dots, evenly spaced stars, oversaturated rainbow or flat synthetic gradient. It must look like an art-directed universe, and remain usable underneath presentation text.
```
