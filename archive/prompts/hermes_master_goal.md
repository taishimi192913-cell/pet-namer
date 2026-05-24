# Hermes Master Goal: Sippomi HP 再設計（open-design + GPT Image 2）

> Hermes `/goal` で実行するマスタープラン。
> 動画「Claude Design × GPT Image 2 でLP制作」のフローを
> open-design で再現。全フェーズ opencode で自動実行。

## 事前準備（Hermesが最初に1回だけ実行）

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env
cd /Users/shimizutaiga/Projects/sippomi
mkdir -p outputs/design public/images/design-assets
```

## Phase 0: open-design 起動 & 設計システム登録

```bash
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase0_open_design_setup.md)" --model deepseek/deepseek-v4-pro
```

完了条件: open-design daemon が http://127.0.0.1:7456 で起動中。

## Phase 1: デザイン画像生成（opencode + gpt-image-2 API）

```bash
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase1_image_generation.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `outputs/design/mock_fullpage.png` と `outputs/design/assets_grid.png` が存在し 0byteでないこと。

## Phase 2: 素材抽出（opencode）

```bash
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase2_material_extractor.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `public/images/design-assets/` に 8個以上の SVG/WebP が存在すること。

## Phase 3: open-design でLP生成 → コード実装（opencode）

```bash
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase3_developer_agent.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `npm run lint && npm test && npm run build` が全成功。

## Phase 4: QA検証（opencode）

```bash
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase4_qa_agent.md)" --model deepseek/deepseek-v4-pro
```

完了条件: Lighthouse 85+/95+/95+ 以上、禁止事項違反 0、モバイル崩れなし。

## 最終報告

全Phase完了後、progress.txt に集約:

```
[hp-redesign-hermes] YYYY-MM-DD HH:MM
Phase 0 (open-design起動): 完了 / 失敗
Phase 1 (画像生成): 完了 / 失敗
Phase 2 (素材抽出): 完了 — N個アセット
Phase 3 (コード実装): 完了 — lint/test/build 通過
Phase 4 (QA検証):   完了 — Lighthouse PXX/AXX/SXX
変更ファイル一覧: ...
総合判定: 合格
```

## 実行ルール

- 5つの Phase を順次実行（Phase N が完了するまで Phase N+1 に進まない）
- Phase 0 の daemon はバックグラウンド起動、後続Phaseはブロッキング実行
- 各 Phase の opencode 起動はブロッキング実行（完了を待つ）
- いずれかの Phase が失敗した場合、後続Phaseは実行せずエラー報告
- Phase 1 の画像品質が不十分な場合は自動リトライ（最大3回）
