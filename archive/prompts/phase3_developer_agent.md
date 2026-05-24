# Phase 3: open-design Landing → コード実装

【タスク】open-design の landing page スキルで Sippomi の
          デザインを生成し、その後 opencode で全ページを実装する。

【モード】自律実行（中間確認禁止）

【プロジェクトルート】/Users/shimizutaiga/Projects/sippomi/

【前提】
- Phase 0 完了: open-design daemon 起動済み (http://127.0.0.1:7456)
- Phase 1 完了: mock_fullpage.png, assets_grid.png 生成済み
- Phase 2 完了: 個別アセット抽出済み (public/images/design-assets/)

【必読ファイル（作業前に必ず読む）】
1. /Users/shimizutaiga/Projects/sippomi/AGENTS.md
2. /Users/shimizutaiga/Projects/sippomi/DESIGN.md
3. /Users/shimizutaiga/Projects/sippomi/rules/web-development.md
4. /Users/shimizutaiga/Projects/sippomi/prompts/phase0_structured_brief.md

【入力ファイル】
- outputs/design/mock_fullpage.png — デザインモック（再現目標）
- public/images/design-assets/ — 個別素材
- http://127.0.0.1:7456 — open-design daemon

【Step 1: open-design で LP スケルトン生成】

```bash
export OD_DAEMON_URL=http://127.0.0.1:7456
export OD_PROJECT_ID=sippomi
cd /Users/shimizutaiga/Projects/sippomi
```

open-design-landing スキルを呼び出すプロンプト:

```
Sippomi のランディングページを open-design-landing スキルで生成して。

設計システム: sippomi (Apple Japan × MUJI hybrid)
参照画像: /Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png
使用素材: /Users/shimizutaiga/Projects/sippomi/public/images/design-assets/

7セクション構成:
1. Hero — 「名前が決まる、その瞬間から。」+ ペットシルエット + CTA「名前を診断する」
2. Features — 3枚の特徴カード（無料診断 / 苗字相性 / コミュニティ）
3. How It Works — 3ステップ診断フロー（種別選択→好み入力→名前提案）
4. Trust/Stats — 信頼セクション
5. Trending — 人気の名前ランキング
6. Community — 飼い主コミュニティ参加導線
7. Footer CTA — 「今すぐ名前を診断する」

制約:
- 既存の id属性 / data-*属性 は一切変更しない
- index.html に直接出力
- CSSは埋め込み
- レスポンシブ対応
- 禁止事項厳守（絵文字禁止 / #000 #FFF禁止 / Material Design禁止）
```

【Step 2: 全ページ実装・統合】

open-design 生成のデザインを元に、以下全ファイルを実装:

### 対象ファイル:
- HTML: index.html, about.html, privacy.html, starter-set.html, welcome-prep.html
  dog-names.html, cat-names.html, rabbit-names.html
  first-cat-guide.html, first-dog-guide.html
  journal-*.html（全記事ページ）
- CSS: src/styles/global.css, layout.css, components.css, pages.css

### 対象外（変更禁止）:
- src/diagnosis.js / src/constants.js（診断ロジック）
- src/main.js / src/render.js（レンダリングロジック）
- src/auth.js / src/community.js（Auth / コミュニティ）
- data/names.json / japanese-surnames.json
- APIエンドポイント / package.json
- 全HTMLの id属性 / data-*属性
- apps/ios/

### 実装ルール:
1. mock_fullpage.png のトンマナ・配色・余白感を優先
2. CSS変数（:root）を Sippomi DESIGN.md 準拠に:
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
3. public/images/design-assets/ の素材を積極的に使用
4. 背景 blob は CSS background-image で配置
5. 既存の id / data-* 属性は一切変更しない
6. 診断機能・ランキング・コミュニティはJSが正常動作すること

【禁止事項（AGENTS.md 第1章厳守）】
- Material Design / Material Icons 禁止
- 純黒 #000000 / 純白 #FFFFFF 禁止
- font-size 絶対値直指定禁止（clamp() 使用）
- border: 1px solid #ccc 禁止（シャドウで区切り）
- フォントサイズ5段階まで
- 絵文字禁止
- 既存コードパターンの無視禁止

【技術スタック】
Vanilla JS + Vite + 独自CSS + Supabase + Vercel
テスト: node --test / Lint: ESLint

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
- [ ] 診断機能の動作確認（種別選択→好み入力→結果表示→名前保存）

【作業完了後】
progress.txt に以下を追記:
- 変更したファイル一覧
- npm test / npm run lint / npm run build の結果
- モック画像との差分で妥協した点
