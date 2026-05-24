# Sippomi Edit Map

全3作品（HP / 名前診断アプリ / 生活記録アプリ）を編集するための早見表。

## まずここを見る

- 全エージェント共通ルール: [AGENTS.md](/Users/shimizutaiga/Projects/sippomi/AGENTS.md)
- ブランド全体の状況: [docs/project-context.md](/Users/shimizutaiga/Projects/sippomi/docs/project-context.md)
- セットアップ手順: [docs/setup-stack.md](/Users/shimizutaiga/Projects/sippomi/docs/setup-stack.md)
- Web デザイン仕様: [AGENTS.md §A.2](/Users/shimizutaiga/Projects/sippomi/AGENTS.md)（旧 DESIGN.md は統合済み）

---

## HP（Web）編集先

- トップページ: [index.html](/Users/shimizutaiga/Projects/sippomi/index.html)
- スタイル: [src/styles/](/Users/shimizutaiga/Projects/sippomi/src/styles/)
- 診断ロジック: [src/diagnosis.js](/Users/shimizutaiga/Projects/sippomi/src/diagnosis.js)
- 名前候補データ: [data/names.json](/Users/shimizutaiga/Projects/sippomi/data/names.json)
- 画像/ロゴ/OGP: [public/](/Users/shimizutaiga/Projects/sippomi/public)
- 認証/会員: [src/auth.js](/Users/shimizutaiga/Projects/sippomi/src/auth.js)
- デプロイ: [vercel.json](/Users/shimizutaiga/Projects/sippomi/vercel.json)

## 名前診断アプリ（name-matcher）編集先

- パス: [apps/name-matcher/](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/)
- エントリポイント: [apps/name-matcher/App.tsx](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/App.tsx)
- カラーパレット: [apps/name-matcher/src/styles.ts](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/src/styles.ts)（AGENTS.md §A.3 参照）
- テーマ/ダークモード: [apps/name-matcher/src/theme.ts](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/src/theme.ts)
- 画面: [apps/name-matcher/src/screens/](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/src/screens/)
- ペットシルエット: [apps/name-matcher/src/components/PetSilhouette.tsx](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/src/components/PetSilhouette.tsx)
- 進捗: [apps/name-matcher/progress.txt](/Users/shimizutaiga/Projects/sippomi/apps/name-matcher/progress.txt)
- 共有ロジック: [packages/recommendation-core/](/Users/shimizutaiga/Projects/sippomi/packages/recommendation-core/)

## 生活記録アプリ（pet-life-companion）編集先

- パス: [apps/pet-life-companion/](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/)
- カラーテーマ: [apps/pet-life-companion/PetLifeCompanion/AppTheme.swift](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/PetLifeCompanion/AppTheme.swift)（AGENTS.md §A.8 参照）
- 画面: [apps/pet-life-companion/PetLifeCompanion/Views/](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/PetLifeCompanion/Views/)
- データ/モデル: [apps/pet-life-companion/PetLifeCompanion/Models/](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/PetLifeCompanion/Models/)
- 進捗: [apps/pet-life-companion/progress.txt](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/progress.txt)
- 画像アセット: [apps/pet-life-companion/PetLifeCompanion/Assets.xcassets/](/Users/shimizutaiga/Projects/sippomi/apps/pet-life-companion/PetLifeCompanion/Assets.xcassets/)

## 最短ルール

- HP の見た目: `index.html` と `src/styles/*`
- 名前診断アプリの色: `apps/name-matcher/src/styles.ts` の `palette`
- 生活記録の色: `apps/pet-life-companion/.../AppTheme.swift`
- 診断結果を変える: `src/diagnosis.js` と `data/names.json`
- 会員系を変える: `src/auth.js` と `api/*` と `supabase/*`
- デプロイを変える: `vercel.json` と `.env*`
- 全作品共通ルール: `AGENTS.md`（旧 DESIGN.md は統合済み）

## 過去の資産

- [archive/](/Users/shimizutaiga/Projects/sippomi/archive/) — 完了済みタスク、旧プロンプト、旧コード
- エージェントは `archive/` を参照しないこと

## 迷ったとき

`rg` で文言や class 名を検索すると速いです。

```bash
cd /Users/shimizutaiga/Projects/sippomi
rg "探したい文言やclass名"
```
