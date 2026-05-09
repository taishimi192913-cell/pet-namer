# Phase 3: コード実装（opencode）

【タスク】Sippomi HP のビジュアル再設計。
          Designer 生成のモック画像を参照し、AGENTS.md ルールに従ってコードを実装。

【モード】自律実行（中間確認禁止）

【プロジェクトルート】/Users/shimizutaiga/Projects/sippomi/

【必読ファイル（作業前に必ず読む）】
1. /Users/shimizutaiga/Projects/sippomi/AGENTS.md — エージェント行動ガイド
2. /Users/shimizutaiga/Projects/sippomi/DESIGN.md — デザイン仕様（Apple Japan × MUJI）
3. /Users/shimizutaiga/Projects/sippomi/rules/web-development.md — Web開発詳細ルール
4. /Users/shimizutaiga/Projects/sippomi/prompts/phase0_structured_brief.md — 構造化指示書

【入力ファイル】
- /Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png — デザインモック（再現目標）
- /Users/shimizutaiga/Projects/sippomi/public/images/design-assets/ — 個別素材

【スコープ】
- HTML: index.html, about.html, privacy.html, starter-set.html, welcome-prep.html
        dog-names.html, cat-names.html, rabbit-names.html
        first-cat-guide.html, first-dog-guide.html
        journal-*.html（全15ページ以上）
- CSS: src/styles/global.css, layout.css, components.css, pages.css
- JS: 新規ビジュアル要素のアニメーション・インタラクション（追加分のみ）

【対象外（変更禁止）】
- src/diagnosis.js（診断ロジック）
- names.json / japanese-surnames.json
- APIエンドポイント
- package.json（依存関係）
- 全HTMLの id属性 / data-*属性
- apps/ios/（iOSアプリ）

【実装方針】

1. mock_fullpage.png を常に参照し、「雰囲気の再現」を優先（ピクセルパーフェクト不要）

2. CSS変数（:root）を phase0 のカラーパレットに更新:
   ```css
   --color-bg-base: hsl(42 46% 94%);       /* #f4eede MUJI生成り */
   --color-text-primary: hsl(240 2% 12%);   /* #1d1d1f */
   --color-text-secondary: hsl(240 2% 45%); /* #6e6e73 */
   --color-cta: hsl(211 100% 45%);          /* #0071e3 */
   --color-accent-1: hsl(29 84% 70%);       /* #F9A66C */
   --color-accent-2: hsl(14 66% 62%);       /* #E07A5F */
   --color-text-emphasis: hsl(10 15% 18%);  /* #3D2C2A */
   --color-card-bg: hsl(34 100% 96%);       /* #FFF8F0 */
   ```

3. 全セクションを mock_fullpage.png のレイアウトに合わせて再構築:
   - Hero: blob背景 + キャッチコピー + ペットシルエット + CTA
   - Features: 3カード + blobアイコン
   - How It Works: 3ステップ + 曲線接続
   - Trust: 数字 + バッジ
   - Trending: ランキングカード
   - Community: 参加導線
   - Footer CTA: 最終アクション

4. public/images/design-assets/ の素材を積極的に使用:
   - 背景 blob は CSS background-image で配置
   - ペットシルエットは img タグで使用
   - 装飾曲線はセクション区切りに使用
   - CSS だけで表現しきれない有機的形状は素材でカバー

5. 既存の id / data-* 属性は一切変更しない（JS診断ロジックとの結合維持）

【禁止事項（AGENTS.md 第1章厳守）】
- Material Design 禁止
- 純黒 #000000 / 純白 #FFFFFF 禁止
- font-size 絶対値直指定禁止（clamp() 使用）
- border: 1px solid #ccc 禁止（シャドウで区切り）
- フォントサイズ 5段階まで
- 絵文字禁止
- 既存コードパターンの無視禁止

【技術スタック】
- Vanilla JS + Vite + 独自CSS + Supabase + Vercel
- テスト: node --test
- Lint: ESLint

【検証コマンド（実装後に必ず実行）】
```bash
cd /Users/shimizutaiga/Projects/sippomi
npm run lint && npm test && npm run build
```

【品質ゲート】
- [ ] mock_fullpage.png との目視比較でトンマナ・配色・余白が一致
- [ ] npm run lint 通過
- [ ] npm test 通過
- [ ] npm run build 成功
- [ ] Mobile 375px で全ページ崩れなし
- [ ] 全 id属性 / data-*属性 が変更されていないこと

【作業完了後】
/Users/shimizutaiga/Projects/sippomi/progress.txt に以下を追記:
- 変更したファイル一覧
- npm test / npm run lint / npm run build の結果
- モック画像との差分で妥協した点（あれば）
