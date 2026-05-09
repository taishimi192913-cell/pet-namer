# Hermes Master Goal: Sippomi HP 再設計（全自動）

> Hermes `/goal` で **1回** 実行すればすべて完了するマスタープラン。
> 動画「Claude Design × ChatGPT Image-2 でLP制作」のフローを再現し、
> Sippomi HP の AI 感を排除する。全フェーズ opencode で自動実行。

## 事前準備（Hermesが最初に1回だけ実行）

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env
cd /Users/shimizutaiga/Projects/sippomi
mkdir -p outputs/design public/images/design-assets
```

## Phase 1: デザイン画像生成（opencode + gpt-image-2 API）

```
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase1_image_generation.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `outputs/design/mock_fullpage.png` と `outputs/design/assets_grid.png` が存在し 0byteでないこと。

---

## Phase 2: 素材抽出（opencode）

```
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase2_material_extractor.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `public/images/design-assets/` に 8個以上の SVG/WebP が存在すること。

---

## Phase 3: コード実装（opencode）

```
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase3_developer_agent.md)" --model deepseek/deepseek-v4-pro
```

完了条件: `npm run lint && npm test && npm run build` が全成功。

---

## Phase 4: QA検証（opencode）

```
cd /Users/shimizutaiga/Projects/sippomi
opencode run "$(cat /Users/shimizutaiga/Projects/sippomi/prompts/phase4_qa_agent.md)" --model deepseek/deepseek-v4-pro
```

完了条件: Lighthouse 85+/95+/95+ 以上、禁止事項違反 0、モバイル崩れなし。

---

## 最終報告

全Phase完了後、progress.txt に集約:

```
[hp-redesign-hermes] YYYY-MM-DD HH:MM
Phase 1 (画像生成): 完了
Phase 2 (素材抽出): 完了 — N個アセット
Phase 3 (コード実装): 完了 — lint/test/build 通過
Phase 4 (QA検証):   完了 — Lighthouse PXX/AXX/SXX
変更ファイル一覧: ...
総合判定: 合格
```

## 実行ルール

- 4つの Phase を順次実行（Phase N が完了するまで Phase N+1 に進まない）
- 各 Phase の opencode 起動はブロッキング実行（完了を待つ）
- いずれかの Phase が失敗した場合、後続Phaseは実行せずエラー報告
- Phase 1 の画像品質が不十分な場合は自動リトライ（最大3回）
