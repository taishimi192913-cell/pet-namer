# Phase 4: QA検証（opencode）

【役割】Developer の実装結果を検証し、品質を保証するQAエンジニア。

【プロジェクトルート】/Users/shimizutaiga/Projects/sippomi/

【参照ファイル】
- /Users/shimizutaiga/Projects/sippomi/prompts/phase0_structured_brief.md
- /Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png

【Step 1: 基本検証（コマンドライン）】
以下のコマンドを実行し、すべて成功することを確認:

```bash
cd /Users/shimizutaiga/Projects/sippomi
npm run lint
npm test
npm run build
```

いずれかが失敗した場合、エラー内容を報告（自動修正はしない）。

【Step 2: モバイルビジュアル検証（Playwright）】

以下のページを 375px 幅（iPhone SE）で撮影し確認:
- index.html
- about.html
- privacy.html
- starter-set.html
- welcome-prep.html
- dog-names.html / cat-names.html / rabbit-names.html
- first-cat-guide.html / first-dog-guide.html
- journal-*.html（全記事ページ）

各ページの確認項目:
- [ ] 水平スクロールなし（横スクロール発生はNG）
- [ ] テキストの重なり・はみ出しなし
- [ ] ボタンタップ領域 44px 以上
- [ ] 画像アスペクト比崩れなし
- [ ] z-index 競合なし

【Step 3: Lighthouse 計測】

npm run dev で起動したURL（通常 http://localhost:5176 など）で以下を計測:

| 指標 | 目標 | 許容下限 |
|------|------|---------|
| Performance | 90+ | 85 |
| Accessibility | 100 | 95 |
| SEO | 100 | 95 |
| CLS | <0.1 | 変わらず |
| FCP | <2s | <3s |
| LCP | <3s | <4s |

目標未達項目があれば原因を特定して報告。

【Step 4: 禁止事項違反の静的チェック】

以下の grep を実行:

```bash
cd /Users/shimizutaiga/Projects/sippomi

# 純黒の使用
rg "#000000|#000\b" --type html --type css src/ *.html 2>/dev/null || true

# 純白の使用
rg "#FFFFFF|#FFF\b|#ffffff|#fff\b" --type html --type css src/ *.html 2>/dev/null || true

# border: 1px solid
rg "border:\s*1px\s+solid" --type css src/ 2>/dev/null || true

# font-size 絶対値（clamp 不使用で px 直指定）
rg "font-size:\s*\d+px" src/styles/ 2>/dev/null || true

# 絵文字
rg "[\x{1F300}-\x{1F9FF}]" *.html 2>/dev/null || true
```

検出があった場合は報告。

【Step 5: 回帰チェック】

- 診断機能の動作確認（種別選択 → 好み入力 → 結果表示 → 名前保存）
- 全リンク切れなし（a href の指すファイルが存在するか）
- コンソールエラーなし（Vite dev server 起動時に確認）

【最終報告】
/Users/shimizutaiga/Projects/sippomi/progress.txt に以下を追記:
```
[hp-redesign-qa] YYYY-MM-DD HH:MM
- lint: 通過/失敗（エラー数: N）
- test: 通過/失敗（失敗数: N）
- build: 成功/失敗
- Lighthouse: Perf XX / A11y XX / SEO XX / CLS X.XX
- 禁止事項違反: なし / あり（N件）
- モバイル崩れ: なし / あり（Nページ）
- 回帰チェック: 通過 / 失敗
- 総合判定: 合格 / 条件付き合格 / 不合格
```
