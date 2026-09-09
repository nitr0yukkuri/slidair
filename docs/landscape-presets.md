# 景色プリセット

既存のUI・背景レイヤー・保存形式を引き継ぎ、32種類の景色を扱う。写真の輪郭は光と色として認識できる程度にぼかし、左側の文字領域を静かに保つ。宇宙だけは、成立している精細な星雲表現をそのまま保つ。

| 景色 | ID | 表現 | 実装素材 |
| --- | --- | --- | --- |
| 海中 | underwater | 青緑の水、右上から差す柔らかな光 | [WebP](../assets/scene-underwater-v1.webp) |
| 田舎 | countryside | 朝もや、緑の田畑、遠い丘の層 | [WebP](../assets/scene-countryside-v1.webp) |
| 快晴 | clear-sky | 広い青空、右下に溶ける薄い雲 | [WebP](../assets/scene-clear-sky-v1.webp) |
| 深海 | deep-sea | 暗い藍、遠くから届く青い光 | [WebP](../assets/scene-deep-sea-v1.webp) |
| 初日の出 | first-sunrise | 右端の淡い金色、霞んだ水平線と水面 | [WebP](../assets/scene-first-sunrise-v1.webp) |
| 木漏れ日 | forest-light | オリーブ色の森、右上の面光 | [WebP](../assets/scene-forest-light-v1.webp) |
| 竹林 | bamboo-grove | 左の淡い霞と右端の縦の竹 | [WebP](../assets/scene-bamboo-grove-v1.webp) |
| 桜霞 | sakura-mist | 青灰の空気、右下の淡い桜色 | [WebP](../assets/scene-sakura-mist-v1.webp) |
| 桜並木 | cherry-blossom | 淡い朝霞、右上から入る桜色のアーチと右下の遠い小径 | [PNG](../assets/scene-cherry-blossom-v1.png) |
| 紫陽花 | hydrangea-rain | 雨上がりの青紫、右下の花の塊 | [WebP](../assets/scene-hydrangea-rain-v1.webp) |
| 花畑 | lavender-haze | 低い紫の面、霞む丘 | [WebP](../assets/scene-lavender-haze-v1.webp) |
| 紅葉 | autumn-haze | 銅色の葉、右端の暖かな光 | [WebP](../assets/scene-autumn-haze-v1.webp) |
| 雪原 | snowfield | 真珠色の雪面、右下のゆるい起伏 | [WebP](../assets/scene-snowfield-v1.webp) |
| 砂丘 | sand-dunes | 右下へ流れる砂の曲線 | [WebP](../assets/scene-sand-dunes-v1.webp) |
| 月夜の海 | moonlit-shore | 暗い海、右端に溶ける銀色の反射 | [WebP](../assets/scene-moonlit-shore-v1.webp) |
| オーロラ | aurora-veil | 暗い極地、右上の淡い緑の幕 | [WebP](../assets/scene-aurora-veil-v1.webp) |
| 山霞 | misty-mountains | 青灰の山並み、右側へ沈む淡い湖面 | [PNG](../assets/scene-misty-mountains-v1.png) |
| 潮だまり | tidepool-coast | 雨上がりの青緑の水面、右下の岩 | [PNG](../assets/scene-tidepool-coast-v1.png) |
| 雲海 | cloud-sea | 真珠色の雲の層、右下へ溶ける稜線 | [PNG](../assets/scene-cloud-sea-v1.png) |
| 藤棚 | wisteria-bower | 煙った紫の花房、右端の葉影 | [PNG](../assets/scene-wisteria-bower-v1.png) |
| 石庭 | stone-garden | 濡れた灰色の砂面、右下の苔石 | [PNG](../assets/scene-stone-garden-v1.png) |
| 夕渓谷 | red-canyon | 錆色の谷壁、右側へ沈む夕霞 | [PNG](../assets/scene-red-canyon-v1.png) |
| 霧の港 | misty-harbor | 青灰の港、右端へ溶ける淡い水面 | [PNG](../assets/scene-misty-harbor-v1.png) |
| 雨の窓 | rain-window | 青灰の雨粒、右端の微かな暖色反射 | [PNG](../assets/scene-rain-window-v1.png) |
| 白樺林 | birch-grove | 白い幹とセージの葉、右端の縦のリズム | [PNG](../assets/scene-birch-grove-v1.png) |
| 夜の灯台 | lighthouse-night | 暗い海岸、右端の柔らかな灯り | [PNG](../assets/scene-lighthouse-night-v1.png) |
| Rust Forge | rust-forge | 黒い鉄の面、右端に錆びた赤と細い光。低レイヤーの堅牢さを抽象化した技術系の空気 | [PNG](../assets/scene-rust-forge-v1.png) |

## 表示と操作

- 景色は32種類を5列×7段で表示。選択状態・画像・ラベルを一体として表示する。
- 左右キーは隣の景色、上下キーは同じ列の景色へ移動。Home / End で先頭・末尾へ移動する。
- 朝・昼は濃い文字と明るい下地を使う。夕方・夜は画像の露出を抑えて淡い文字の読める暗さにする。
- 深海・月夜の海・オーロラ・潮だまり・霧の港・雨の窓・夜の灯台・Rust Forgeは全時間帯で暗い下地と淡い文字を使い、季節の光も抑える。
- 追加景色のぼかしは画面サイズに応じて5〜11px。彩度も抑え、文字と競合する細部を弱める。
- スライド・一覧・選択欄には同じ素材を使用。下書き形式は従来のversion 1を継続する。
- URLの scene に各IDを指定できる。天気の保存値は保持され、景色選択中の背景には重ねない。

## 素材の制作

今回追加した自然10点とRust Forgeを内蔵 image_gen ツールで個別に新規生成。各画像は1672×941px。
自然10点は生成PNGを原本として保持し、PillowでRGBへ読み込み、lossless WebP（method 6）へ保存した。Rust ForgeはPNGのまま実行時素材に採用した。
画像内容の追加編集は行っていない。自然10点は書き出し前後のRGB画素一致を確認し、Rust Forgeは原本PNGを直接参照している。

| ID | ファイルサイズ（bytes） | 生成PNGのファイル名 |
| --- | ---: | --- |
| underwater | 1,139,950 | exec-b1abde41-ec5d-480b-9a7f-e41952f29738.png |
| countryside | 1,089,564 | exec-85a1993b-6ea9-497c-9a85-2d4f76c81c65.png |
| clear-sky | 1,153,214 | exec-2b63fb65-5ebd-4198-b751-9889391e7fff.png |
| deep-sea | 898,146 | exec-6882e241-06f4-4280-9b18-eec055831467.png |
| first-sunrise | 1,070,502 | exec-8f3ead24-96f2-497c-a34c-40f19142bb2a.png |

原本フォルダー:
`C:\Users\2250126\.codex\generated_images\01a07e29-7055-75c3-b277-2b81c9f41e60`

以下は各生成に送信した最終プロンプト。


### 海中

```text
Use case: productivity-visual.
Create a standalone photographic atmosphere background for a refined Japanese presentation editor, landscape 16:9. No interface, text, typography, logos, or watermarks. The established series uses quiet optical defocus, low contrast, restrained natural color and broad soft light, unlike a sharp detailed cosmic scene. Keep the left 60% and central text zone smooth, spacious and nearly free of objects. Place any recognizable contours toward the far right or bottom edge. Intentional soft-focus environmental photography: recognizable overall feeling, no sharply readable tiny details, no artificial bokeh circles or decorative glitter. Rich gentle gradients, subtle natural optical texture, no banding or posterization. Full bleed composition, elegant and calm.
Scene brief: A quiet view from just below clear seawater. Deep translucent turquoise and muted teal, soft shafts of sunlight enter from the far upper-right, wavering caustic light dissolves in the distance, very faint pale seabed glow only at the bottom right. The left and center are calm blue-green open water. Airy shallow-water depth, medium-dark soft teal tonal field with restrained silver highlights. No fish, coral, diver, bubbles, buildings, horizon, or stars. Diffuse the light before it reaches the text zone. Strong atmospheric defocus, yet visibly underwater.
```


### 田舎

```text
Use case: productivity-visual.
Create a standalone photographic atmosphere background for a refined Japanese presentation editor, landscape 16:9. No interface, text, typography, logos, or watermarks. The established series uses quiet optical defocus, low contrast, restrained natural color and broad soft light, unlike a sharp detailed cosmic scene. Keep the left 60% and central text zone smooth, spacious and nearly free of objects. Place any recognizable contours toward the far right or bottom edge. Intentional soft-focus environmental photography: recognizable overall feeling, no sharply readable tiny details, no artificial bokeh circles or decorative glitter. Rich gentle gradients, subtle natural optical texture, no banding or posterization. Full bleed composition, elegant and calm.
Scene brief: A peaceful Japanese rural landscape of broad rice fields and distant low rolling wooded hills dissolving into morning haze. Soft moss-green and blue-green field planes near the bottom, a very small indistinct farmhouse silhouette at the far lower-right if needed, cool gray-blue mist above, restrained mellow sunlight. Quiet horizontal layers with no crisp horizon edge, no grid of crop rows, no readable buildings, people, cars, poles or signs. Most of the upper and central-left frame is gentle misty open tonal space. Optical defocus makes a memory of countryside rather than a detailed travel photo. Balanced medium-value colors, not beige.
```


### 快晴

```text
Use case: productivity-visual.
Create a standalone photographic atmosphere background for a refined Japanese presentation editor, landscape 16:9. No interface, text, typography, logos, or watermarks. The established series uses quiet optical defocus, low contrast, restrained natural color and broad soft light, unlike a sharp detailed cosmic scene. Keep the left 60% and central text zone smooth, spacious and nearly free of objects. Place any recognizable contours toward the far right or bottom edge. Intentional soft-focus environmental photography: recognizable overall feeling, no sharply readable tiny details, no artificial bokeh circles or decorative glitter. Rich gentle gradients, subtle natural optical texture, no banding or posterization. Full bleed composition, elegant and calm.
Scene brief: An immense clear blue sky on a beautifully fine day, an airy open blue atmosphere. Restrained luminous cerulean fading to pale ice blue near the bottom, extremely soft faint wisps of white cloud confined to the far bottom-right edge, almost cloudless everywhere else. Large breathing space, pure fresh daylight, photographic atmosphere with subtle optical haze rather than a flat manufactured gradient. No sun disc, hard clouds, horizon, ground, mountains, birds, lens flare or objects. Soft, luminous yet subdued, no oversaturated cyan or cartoon blue.
```


### 深海

```text
Use case: productivity-visual.
Create a standalone photographic atmosphere background for a refined Japanese presentation editor, landscape 16:9. No interface, text, typography, logos, or watermarks. The established series uses quiet optical defocus, low contrast, restrained natural color and broad soft light, unlike a sharp detailed cosmic scene. Keep the left 60% and central text zone smooth, spacious and nearly free of objects. Place any recognizable contours toward the far right or bottom edge. Intentional soft-focus environmental photography: recognizable overall feeling, no sharply readable tiny details, no artificial bokeh circles or decorative glitter. Rich gentle gradients, subtle natural optical texture, no banding or posterization. Full bleed composition, elegant and calm.
Scene brief: The profound stillness of the deep ocean, clearly underwater rather than outer space. Mostly midnight marine blue, inky petrol navy and the faintest deep teal. A very distant broad shaft of muted blue light descends diagonally from the extreme top right and fades completely before the dark lower half. Slight layered water turbidity reveals immense depth, all highly defocused and low contrast. Left and center are velvety dark water with subtle tonal depth. No stars, speckles, plankton, bright particles, fish, animals, bubbles, rocks, sea floor, plants, vessels or space nebula. No vivid electric blue. Beautiful darkness that still contains color.
```


### 初日の出

```text
Use case: productivity-visual.
Create a standalone photographic atmosphere background for a refined Japanese presentation editor, landscape 16:9. No interface, text, typography, logos, or watermarks. The established series uses quiet optical defocus, low contrast, restrained natural color and broad soft light, unlike a sharp detailed cosmic scene. Keep the left 60% and central text zone smooth, spacious and nearly free of objects. Place any recognizable contours toward the far right or bottom edge. Intentional soft-focus environmental photography: recognizable overall feeling, no sharply readable tiny details, no artificial bokeh circles or decorative glitter. Rich gentle gradients, subtle natural optical texture, no banding or posterization. Full bleed composition, elegant and calm.
Scene brief: The first sunrise of the new year above a very quiet distant sea, serene and hopeful. A small hazy honey-gold glow at the far right near the low horizon; no hard-edged sun disc. Fine apricot and soft pale gold light blends into muted smoky rose and cool slate-blue atmosphere on the left. A faint golden reflection only along the far lower-right water. Horizon is heavily softened into mist, no hard line crossing the text area. Intentional optical defocus and gentle cinematic bloom, balanced moderate brightness, not orange saturation. No mountains, buildings, people, boats, birds, fireworks or lens flare. The central-left area stays calm and smooth for overlaid text.
```


## 検証結果

- Node標準テスト: 43件成功。追加景色のURL往復・部分プリセット適用・既存景色と混在する下書きの保存復元・32件のカタログ素材参照を含む。
- Chromium実画面: 32種類の選択、上下キーによる5列グリッド移動、共有URL、再読み込み、6画面幅（1440 / 1280 / 900 / 768 / 390 / 320px）を確認。横にはみ出す選択肢なし、実行時エラーなし。
- 追加した10景色 × 4時間帯 × 5レイアウト、計200通りを確認。冬の季節設定、1440×960pxのウィンドウ、既定コンテンツで、各文字の領域の背景画素と文字色を比較した。
- 小見出し・本文は4.5:1、見出しは3:1以上を判定基準として、600文字フィールドすべて通過。追加10景色の全フィールド中の最低値は、木漏れ日4.92、竹林5.55、桜霞5.63、紫陽花4.69、花畑5.99、紅葉4.70、雪原5.69、砂丘4.89、月夜の海8.71、オーロラ9.75。
- 海中の朝・昼は画像の不透明度を44%とし、本文に見出しと同じ濃い文字色を使う。田舎の夕方・夜は露出を個別に抑える。追加景色はカタログのdayOpacity・eveningExposure・nightExposureで個別に調整し、紫陽花と砂丘は再計測後に昼の混ざり方を下げた。
- コントラスト検証は上記の既定コンテンツ・描画条件での結果であり、自由入力したすべての文章や任意の表示環境の保証ではない。
- 既存20背景は、カタログ統合前後を同一位置・同一サイズで比較して画素一致。初回描画を完了させ、遷移も止めて比較した。選択欄が4段に増えたことによるページ高さの変化は比較対象から除いた。
- JavaScript構文検査と差分の空白検査を通過。


## 技術系の試作: Rust Forge

Rustの堅牢性と低レイヤー感を、黒い鉄の面・錆びた赤・右側にだけ走る細い光へ翻訳した。ロゴ、コード、回路図、端末画面は使わず、soft familyのぼかしと文字安全領域を継承する。内蔵のimage_genで生成した1672×941pxのRGB PNG（1,445,606 bytes）をそのまま実行時素材に採用し、同じ画像をスライド・サムネイル・OGメタデータで共有する。
