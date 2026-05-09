# Phase 2: 素材抽出（opencode）

【タスク】Phase 1 で生成された素材グリッド画像から、個別アセットを切り出して
          Web で使える形に整える。

【プロジェクトルート】/Users/shimizutaiga/Projects/sippomi/

【入力】
- /Users/shimizutaiga/Projects/sippomi/outputs/design/assets_grid.png
- /Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png（参考）
- /Users/shimizutaiga/Projects/sippomi/prompts/phase0_structured_brief.md（カラーパレット参照）

【出力先】
/Users/shimizutaiga/Projects/sippomi/public/images/design-assets/

【タスク詳細】

Step 1: assets_grid.png を読み込み、各素材の位置と形状を特定する。

Step 2: 以下の命名で個別ファイルとして保存:
  - blob_bg_hero.svg          — ヒーロー背景 blob
  - blob_bg_features.svg      — Features セクション blob
  - blob_bg_cta.svg           — 下部 CTA セクション blob
  - blob_accent_01.svg        — 装飾 blob 1
  - blob_accent_02.svg        — 装飾 blob 2
  - divider_curve_01.svg      — セクション区切り曲線
  - card_bg_texture.svg       — カード背景テクスチャ
  - mascot_dog.svg            — 犬シルエット
  - mascot_cat.svg            — 猫シルエット
  - mascot_rabbit.svg         — うさぎシルエット

Step 3: 各素材の最適化
  - SVG は minify（不要な属性削除、viewBox を適切に設定）
  - ラスタ画像がある場合は WebP に変換（品質80%以上）
  - 背景透過を確認

Step 4: カラーパレットの確認
  - SVG の fill/stroke 色が phase0 のカラーパレットと一致しているか確認
  - 必要に応じて色を調整

【完了条件】
- public/images/design-assets/ に 8個以上の SVG/WebP が存在すること
- 各ファイルが実際に表示可能であること（ブラウザで開いて確認）

【注意】
- 画像処理には Python（Pillow）または Node.js（sharp）を使用可
- SVG の手作業編集が必要な場合は、シンプルな path に置き換えてもよい
- 素材として使えないものは CSS で再現する方針を Developer に伝達すること
