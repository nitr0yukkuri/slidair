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
| 桜並木 | cherry-blossom | 淡い青灰とアイボリーの春朝。右上から桜色の花のアーチを一つだけ入れ、遠い小径は右下へ沈める。左60%と中央は滑らかな空気に保ち、枝の細部や人物は置かない。 | [PNG](../assets/scene-cherry-blossom-v1.png) |
| 紫陽花 | hydrangea-rain | 雨上がりの青紫と煙った緑。右下にだけ大きくぼけた花の塊、左と中央は冷たい霧。 | [WebP](../assets/scene-hydrangea-rain-v1.webp) |
| 花畑 | lavender-haze | 低い紫の花畑が霞む丘へ続く。下部の水平な紫の面と、上の淡い薄紫の空気。 | [WebP](../assets/scene-lavender-haze-v1.webp) |
| 紅葉 | autumn-haze | 銅・錆・黄土の秋の森。右端と下部の葉の塊に暖かな光、左と中央は暖灰色の霧。 | [WebP](../assets/scene-autumn-haze-v1.webp) |
| 雪原 | snowfield | 真珠白と氷河青の広い雪原。右下にだけゆるい雪の起伏、左と中央は明るい雪の霞。 | [WebP](../assets/scene-snowfield-v1.webp) |
| 砂丘 | sand-dunes | 薄い砂色と灰金の砂丘。右下へ流れる大きな曲線だけを残し、左と中央は暖灰色の霞。 | [WebP](../assets/scene-sand-dunes-v1.webp) |
| 月夜の海 | moonlit-shore | 暗い海の藍色。右端の水面だけに幅広い銀青の反射、月や星は画面に置かない。 | [WebP](../assets/scene-moonlit-shore-v1.webp) |
| オーロラ | aurora-veil | 墨色の極地に、右上だけ淡い灰緑のオーロラの幕。下端に雪の地形を薄く置き、星空にはしない。 | [WebP](../assets/scene-aurora-veil-v1.webp) |

## 今回追加した6景色

既存シリーズの共通プロンプトに、次のブリーフを組み合わせて内蔵の `image_gen` で個別生成した。左60%と中央の文字領域を空け、右端または下端にだけ大きな輪郭を置く方針を維持している。

| 景色 | ID | 最終ブリーフ | 素材 | 原本PNG |
| --- | --- | --- | --- | --- |
| 山霞 | misty-mountains | 霧の山と湖。青灰の山並みと淡い水面を右端・下部へ寄せ、左と中央はスレート青とセージの霞。 | [PNG](../assets/scene-misty-mountains-v1.png) | `exec-db1b2933-d255-4a6c-8bcf-840fc7112408.png` |
| 潮だまり | tidepool-coast | 雨上がりの岩礁と潮だまり。深い青緑の水面と炭色の岩を右端・下部へ置き、中央は静かな水の余白。 | [PNG](../assets/scene-tidepool-coast-v1.png) | `exec-47f9e93a-cb2d-48fb-a081-01403007150e.png` |
| 雲海 | cloud-sea | 高い稜線から見る雲海。真珠白と青灰の雲の層を右端・下部へ集め、中央は淡い空気だけにする。 | [PNG](../assets/scene-cloud-sea-v1.png) | `exec-77e7a162-75f0-411b-b195-f66b3c092816.png` |
| 藤棚 | wisteria-bower | 晩春の藤棚。煙った紫の花房とセージの葉を右端・下部へ寄せ、花の細部や中央の格子は描かない。 | [PNG](../assets/scene-wisteria-bower-v1.png) | `exec-f27aa95d-2a3d-4f50-9314-17b08a4049e0.png` |
| 石庭 | stone-garden | 雨上がりの日本庭園。灰色の砂面と苔石を右端・下部へ置き、左と中央は均質な濡れた空気にする。 | [PNG](../assets/scene-stone-garden-v1.png) | `exec-1cf1fabb-5ec5-48de-b1e0-8d764d115184.png` |
| 夕渓谷 | red-canyon | 夕霞の遠い赤い谷。錆色と夕暮れの青灰の大きな面を右端・下部へ置き、岩肌の細部は残さない。 | [PNG](../assets/scene-red-canyon-v1.png) | `exec-d3f4b8b0-4845-4e6b-8ced-195831f586b9.png` |

各素材の最終プロンプトは、上の共通プロンプトに表のブリーフを続けたもの。生成時の禁止事項は共通プロンプトを継承し、文字・UI・ロゴ・透かし・過度な彩度・中央を横切る輪郭を除外した。

## 今回追加した4景色

既存シリーズの共通プロンプトに、次のブリーフを組み合わせて内蔵の `image_gen` で個別生成した。左60%と中央の文字領域を空け、右端または下端にだけ大きな輪郭を置く方針を維持している。

| 景色 | ID | 最終ブリーフ | 素材 | 原本PNG |
| --- | --- | --- | --- | --- |
| 霧の港 | misty-harbor | 霧の港。青灰の水面と遠い港の輪郭を右端・下部へ置き、左と中央は霧の余白。 | [PNG](../assets/scene-misty-harbor-v1.png) | `exec-789a40d0-a9f6-49d7-9689-ad45383f4567.png` |
| 雨の窓 | rain-window | 大きな窓越しの雨。青灰のガラスと右端の淡い琥珀反射、中央を横切る窓枠は置かない。 | [PNG](../assets/scene-rain-window-v1.png) | `exec-c9650803-2cb4-46ea-86a5-a49a170c2b7c.png` |
| 白樺林 | birch-grove | 白樺の幹とセージの葉を右端・下部へ寄せ、左と中央は乳白の朝霞。 | [PNG](../assets/scene-birch-grove-v1.png) | `exec-1fa8120a-8069-418b-97f2-16628cb684c8.png` |
| 夜の灯台 | lighthouse-night | 暗い海岸と遠い灯台。柔らかな暖色の光を右端にだけ置き、左と中央は夜の青灰。 | [PNG](../assets/scene-lighthouse-night-v1.png) | `exec-ef4cd02e-a97d-4835-a977-afe69794af10.png` |

各素材の最終プロンプトは、上の共通プロンプトに表のブリーフを続けたもの。生成時の禁止事項は共通プロンプトを継承し、文字・UI・ロゴ・透かし・過度な彩度・中央を横切る輪郭を除外した。

## 生成元

原本PNGは次のフォルダーに残しています。

`C:\Users\2250126\.codex\generated_images\01a07e29-7055-75c3-b277-2b81c9f41e60`

今回追加した10景色の原本フォルダー:
`C:\Users\2250126\.codex\generated_images\01a0814a-85aa-7971-81a2-44f682fef9e0`

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
- misty-harbor: `exec-789a40d0-a9f6-49d7-9689-ad45383f4567.png`
- rain-window: `exec-c9650803-2cb4-46ea-86a5-a49a170c2b7c.png`
- birch-grove: `exec-1fa8120a-8069-418b-97f2-16628cb684c8.png`
- lighthouse-night: `exec-ef4cd02e-a97d-4835-a977-afe69794af10.png`
## 今回追加した桜並木

既存の桜霞と役割が重ならないよう、桜色の主題を右上のアーチへ寄せ、左60%と中央に朝霞の余白を残した。内蔵 `image_gen` で2026-09-09に生成し、生成されたPNGを実行時素材として採用した。

| 景色 | ID | 最終プロンプト | 素材 | 原本PNG |
| --- | --- | --- | --- | --- |
| 桜並木 | cherry-blossom | Standalone photographic atmosphere background for a presentation editor, 16:9. A spring cherry blossom avenue in early morning haze; one broad soft pink canopy enters from the upper-right and curves toward the far right edge, with a barely visible pale path in the lower-right. Keep the left 60% and central text region smooth, quiet, and almost empty in pale blue-gray and warm ivory. Soft-focus environmental photography, broad coherent shapes, natural optical texture, low contrast, restrained blush pink palette. No people, buildings, text, logos, watermarks, artificial bokeh, glitter, hard light shafts, oversaturation, or crisp branches through the text area. | [PNG](../assets/scene-cherry-blossom-v1.png) | `exec-f8c6b6cc-6686-4ef8-a239-4c06d89c4b90.png` |

生成元フォルダー:

`C:\Users\2250126\.codex\generated_images\01a07e29-7055-75c3-b277-2b81c9f41e60`
## 技術系の試作: Rust Forge

既存のsoft familyと同じ文字安全領域を守りながら、自然景観ではなく言語テーマの空気を試す素材。Rustの堅牢性・低レイヤー感を、黒い鉄の面、錆びた赤、右端の細い光へ抽象化した。ロゴやコード画面を描かず、プレゼン背景としての余白を優先している。

| 景色 | ID | 最終ブリーフ | 素材 | 原本PNG |
| --- | --- | --- | --- | --- |
| Rust Forge | rust-forge | 黒い鉄の大きな面と、右端・下部にだけ現れる錆びた赤の反射。遠い細い光を一本だけ置き、左60%と中央は低ディテールの黒青い余白にする。堅牢で静かな低レイヤーの気配を、コード・回路・端末・ロゴなしで表現する。 | [PNG](../assets/scene-rust-forge-v1.png) | `exec-3610f378-50ab-4959-a9dd-66957f3a5923.png` |

### Rust Forgeに使った最終プロンプト

```text
Use case: productivity-visual
Asset type: 16:9 presentation background for slide-atmosphere
Primary request: an original abstract atmospheric background for a Rust programming language themed presentation, expressing robustness and low-level engineering as visual mood rather than literal software imagery
Scene/backdrop: immense dark forged iron surface and quiet industrial planes receding into haze, with a restrained oxidized rust-red glow along the far right edge and one or two hairline cool-white highlights like precise machining light; no recognizable machine or object
Style/medium: refined editorial atmospheric photography, soft-focus, subtle film grain, premium minimal design, tactile but calm
Composition/framing: wide 16:9 landscape; keep the left 62% and center smooth, low-detail, and dark for presentation text; place the visual interest only on the far right and lower-right; broad breathing room, no centered focal object
Lighting/mood: robust, grounded, quiet, precise, resilient; charcoal black and deep blue-black ambient light with controlled ember-red oxidation and a very thin pale steel glint
Color palette: black iron, graphite, deep slate navy, restrained rust red, muted ember, tiny cool silver highlights; low saturation, no harsh contrast
Materials/textures: matte forged metal, oxidized iron patina, soft haze, broad planes, subtle brushed texture dissolved by shallow depth of field; no sharp micro-detail
Text (verbatim): none
Constraints: original artwork for a presentation editor; no people, no readable screens, no code, no logos, no trademarks, no letters, no numbers, no watermark; maintain clean text-safe negative space on the left and center; keep any bright line extremely thin and confined to the right side
Avoid: neon cyberpunk, circuit boards, server racks, terminal windows, syntax, literal Rust logo, animal or snake imagery, gears, tools, dense grids, busy center, glossy chrome, dramatic sparks, flames, high saturation, stock-photo factory staging
```

原本は `C:\Users\2250126\.codex\generated_images\01a07e29-7055-75c3-b277-2b81c9f41e60\exec-3610f378-50ab-4959-a9dd-66957f3a5923.png` に保存している。