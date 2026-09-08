# 追加10景色のプロンプト

10枚とも内蔵の `image_gen` で個別生成し、PNG原本からRGBのlossless WebPへ変換しました。共通の構図指示に、景色ごとの短いブリーフを組み合わせています。

## 共通プロンプト

```text
Use case: productivity-visual.
Asset type: A standalone photographic background for a refined Japanese presentation editor, landscape 16:9, full bleed.
Style: Atmospheric soft-focus environmental photography with subtle natural optical texture, restrained color, and broad soft light. Intentional optical defocus, not a flat artificial gradient. No text, interface, logo or watermark.
Composition: The left 60% and central text region must stay smooth and almost empty, with a calm medium-value tonal field. Put recognizable contours and any brighter light at the far right or low bottom edge. Use large coherent shapes and gentle depth. Avoid fine sharp detail, high contrast branches through the center, artificial bokeh circles, sparkles, lens flare, pattern noise, oversaturated colors and posterization.
```

## 景色別ブリーフ

| 景色 | ID | ブリーフ | 素材 |
| --- | --- | --- | --- |
| 木漏れ日 | forest-light | オリーブと苔の森。右上から面で差す淡い光、右端と下部だけに溶ける葉の層。左と中央は緑の霞。 | [WebP](../assets/scene-forest-light-v1.webp) |
| 竹林 | bamboo-grove | 冷たい翡翠とセージの竹林。右端だけにぼけた縦の竹、左は淡い霞。硬い茎や道は置かない。 | [WebP](../assets/scene-bamboo-grove-v1.webp) |
| 桜霞 | sakura-mist | 青灰の春霞に淡い桃色の桜の塊。桜は右端と右下へ寄せ、中央は静かな空気にする。 | [WebP](../assets/scene-sakura-mist-v1.webp) |
| 紫陽花 | hydrangea-rain | 雨上がりの青紫と煙った緑。右下にだけ大きくぼけた花の塊、左と中央は冷たい霧。 | [WebP](../assets/scene-hydrangea-rain-v1.webp) |
| 花畑 | lavender-haze | 低い紫の花畑が霞む丘へ続く。下部の水平な紫の面と、上の淡い薄紫の空気。 | [WebP](../assets/scene-lavender-haze-v1.webp) |
| 紅葉 | autumn-haze | 銅・錆・黄土の秋の森。右端と下部の葉の塊に暖かな光、左と中央は暖灰色の霧。 | [WebP](../assets/scene-autumn-haze-v1.webp) |
| 雪原 | snowfield | 真珠白と氷河青の広い雪原。右下にだけゆるい雪の起伏、左と中央は明るい雪の霞。 | [WebP](../assets/scene-snowfield-v1.webp) |
| 砂丘 | sand-dunes | 薄い砂色と灰金の砂丘。右下へ流れる大きな曲線だけを残し、左と中央は暖灰色の霞。 | [WebP](../assets/scene-sand-dunes-v1.webp) |
| 月夜の海 | moonlit-shore | 暗い海の藍色。右端の水面だけに幅広い銀青の反射、月や星は画面に置かない。 | [WebP](../assets/scene-moonlit-shore-v1.webp) |
| オーロラ | aurora-veil | 墨色の極地に、右上だけ淡い灰緑のオーロラの幕。下端に雪の地形を薄く置き、星空にはしない。 | [WebP](../assets/scene-aurora-veil-v1.webp) |

## 生成元

原本PNGは次のフォルダーに残しています。

`C:\Users\2250126\.codex\generated_images\01a07e29-7055-75c3-b277-2b81c9f41e60`

原本ファイル名は、素材のIDと同じ順に以下です。

- forest-light: `exec-09c1aa6f-217b-497b-94a5-809787d63db2.png`
- bamboo-grove: `exec-f436a8a2-f810-4967-98af-4d328da5735d.png`
- sakura-mist: `exec-e8ef7ef5-5afa-4f52-9f7a-46544d02cfdf.png`
- hydrangea-rain: `exec-49f6cffa-d153-4157-92c0-8efdc292848c.png`
- lavender-haze: `exec-0971144c-d66f-482f-b64c-7bd47d8f61eb.png`
- autumn-haze: `exec-7afb2cdd-e9d8-4bba-a674-9a4d9b062cb3.png`
- snowfield: `exec-e165da0e-9c7a-4582-8c33-28d5cac7d7f9.png`
- sand-dunes: `exec-03f7c9a6-d164-4d63-957b-23599532b7f5.png`
- moonlit-shore: `exec-fc4ab39e-a540-4a48-953b-6f68a14dd885.png`
- aurora-veil: `exec-b3530e49-8383-494e-a17d-23d8826e85eb.png`
