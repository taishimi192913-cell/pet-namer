【タスク】Sippomi HP への研究知見適用 — 71ソース分析に基づく品質向上

【モード】: 自律実行（中間確認禁止）

【背景】
71ソース（記事44本＋動画27本）のAIコーディング研究により、HP/LP制作における最重要スキルが特定された。
本タスクでは、その知見を既存の Sippomi HP に適用し、さらなる品質向上を図る。

【参照研究ファイル】
- /Users/shimizutaiga/Projects/hp-ios-research/hp_ios_research_report.md  — 総合レポート（Phase 0〜5）
- /Users/shimizutaiga/Projects/hp-ios-research/tool_comparison_matrix.md   — ツール比較マトリクス
- /Users/shimizutaiga/Projects/hp-ios-research/skill_roadmap.md           — 30日スキルロードマップ
- /Users/shimizutaiga/.hermes/skills/software-development/hp-ios-dev-guide/SKILL.md — Hermesスキル定義

【プロジェクトルート】
/Users/shimizutaiga/Projects/sippomi/

【必読ファイル（作業前に読む）】
1. /Users/shimizutaiga/Projects/sippomi/AGENTS.md — エージェント行動ガイド
2. /Users/shimizutaiga/Projects/sippomi/DESIGN.md — デザイン仕様（Apple Japan × MUJI ハイブリッド）
3. /Users/shimizutaiga/Projects/sippomi/rules/web-development.md — Web開発詳細ルール
4. /Users/shimizutaiga/Projects/sippomi/codex_prompt_hp_v2.md — 既存HP磨き込みプロンプト（31タスク完了済）
5. /Users/shimizutaiga/Projects/sippomi/progress.txt — 全実行履歴（現状把握用）

【スコープ（絶対に逸脱しない）】
- 入力: 上記研究ファイル群の知見
- 出力: Sippomi HP の各HTMLファイル、CSSファイル、src/ 以下のJSファイル（必要に応じて）
- 対象外:
  - iOSアプリ（apps/ios/）には触らない
  - Supabaseスキーマ変更はしない
  - パッケージ追加（package.json変更）はしない
  - id属性、data-*属性、診断ロジック（src/diagnosis.js）のコアは変更禁止
  - names.json、APIエンドポイントは触らない

【研究から抽出した Sippomi HP 適用アクション —— 5フェーズ 25タスク】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase A: 素材の質 監査・強化（素材の質が9割を決める）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A1. 全ページの画像アセットを確認（index.html, about.html, journal-*.html ほか）
    - hero-pets.png, ogp.png, public/images/journal/*.webp の品質確認
    - 画質が粗い、サイズ不適切なものがあればリストアップ

A2. ヒーロー画像の最適化
    - 研究知見: 「AI生成のままではダサい。素材抽出・最適化が必須」
    - hero-pets.png が WebP 最適化済みか確認
    - 必要なら width/height 属性、srcset 対応、lazy loading の確認

A3. ファビコン・OGP画像の全ページ確認
    - 全HTMLファイルで <meta property="og:image"> が正しいパスか
    - ファビコンが全ページで設定されているか

A4. 透過処理・背景最適化の確認
    - mascot.png, sippomi-mark.svg が背景透過済みか
    - 研究知見: 「背景透過済みのPNG素材が3枚以上」が品質基準

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase B: モバイルファースト 磨き込み（日本はスマホ利用率が高い）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

B1. 全ページの 375px 幅（iPhone SE）での表示確認（Playwright使用可）
    - はみ出し、重なり、フォントサイズ不適切を検出
    - 修正が必要な箇所をリストアップし修正

B2. タップ領域の全ページ監査（最小24px、推奨44px）
    - 全ボタン、リンク、インタラクティブ要素のタップ領域を確認
    - 小さすぎる要素を修正

B3. モバイルCTAの視認性・押しやすさ確認
    - 研究知見: 「CTAボタンの色・サイズがコンバージョンを左右」
    - 特に index.html（診断開始ボタン）のモバイル表示を重点確認

B4. モバイルでのフォーム要素の使いやすさ
    - input, select のフォントサイズが16px以上（iOS自動ズーム防止）
    - ペット名入力欄のタップ領域・プレースホルダーの視認性

B5. モバイルフッターの固定CTA最適化
    - 既存の mobile fixed footer CTA の表示・動作確認
    - z-index の競合がないか

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase C: 反復改善サイクルに向けた準備（イテレーションが速度を決める）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C1. CSS変数の整理と命名の一貫性確認
    - :root のCSS変数が DESIGN.md のパレットと一致しているか
    - 未使用変数の削除、命名の揺れを統一

C2. コンポーネント間のスタイル統一
    - 共通コンポーネント（カード、ボタン、チップ、セクションタイトル）のスタイルを全ページ横断で確認
    - border-radius、padding、shadow のブレを是正

C3. アニメーションの motion-reduce 対応確認
    - 研究知見: 「prefers-reduced-motion 対応は Web/iOS 共通の必須要件」
    - 全ページのアニメーションに @media (prefers-reduced-motion: reduce) が定義されているか

C4. prefers-color-scheme: dark の対応確認
    - ダークモード表示でテキストの可読性が保たれているか
    - 背景色・文字色のコントラスト比チェック

C5. フォント読み込みの最適化
    - 研究知見: 「LCP改善にはフォントのfont-display: swapが有効」
    - フォントの読み込み戦略を確認（preload, font-display）
    - システムフォントスタック（-apple-system）の使用確認

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase D: SEO・計測・公開基盤の再確認（最後の1マイルが壁）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

D1. メタタグ全ページ監査
    - <title>, <meta name="description"> の有無・内容確認
    - <html lang="ja"> 設定確認
    - キーワードの自然な盛り込み確認

D2. 構造化データ（Schema.org）の確認
    - 研究知見: 「SEOには構造化データが効く」
    - FAQPage, Article, WebSite などの Schema.org JSON-LD が適切か
    - 全journal記事ページに Article schema があるか

D3. OGP / Twitter Card 全ページ確認
    - og:title, og:description, og:image, og:url, og:type の全ページでの設定確認
    - twitter:card の設定確認
    - SNSシェア時の表示を想定した内容チェック

D4. GA4 / アナリティクス動作確認
    - GA4測定IDが全ページに埋め込まれているか（inject-ga4.mjs の動作確認）
    - Vercel Analytics の設定確認
    - 主要イベント（診断完了、名前保存、コミュニティ参加）が計測されているか

D5. sitemap.xml / robots.txt の確認
    - sitemap.xml に全公開ページが含まれているか
    - robots.txt の設定が適切か（不要なページのブロックがないか）
    - generate-sitemap.mjs が最新のページ構成を反映しているか

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase E: コンテンツ品質の磨き込み
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

E1. ヒーローセクションのコピー再検討
    - 研究知見: 「目的・ターゲット・トンマナを一文で定義」
    - index.html のメインキャッチコピーが「誰に・何を伝えるか」明確か
    - サブコピーが適切か（DESIGN.md の Apple+MUJI トーンに沿っているか）

E2. 信頼要素（Trust Signals）の強化
    - 研究知見: 「LPには実績数字・導入事例・信頼バッジが効く」
    - 既存のトラストセクションの内容確認
    - 数字（診断件数、ユーザー数など）の表示があれば確認

E3. CTAの文言・配置の最適化
    - 研究知見: 「CTAは1ページに3回以上配置すべき」
    - 全主要ページでのCTA配置状況を確認
    - ボタンテキストが行動を促す内容か（「詳しく見る」→「名前を診断する」など）

E4. 全ページの typo・表記ゆれチェック
    - Sippomi / sippomi の表記統一
    - 句読点（、。）の一貫性
    - 数字の表記統一（半角/全角）

E5. journal記事の品質チェック
    - 全 journal-*.html の見出し階層（h1→h2→h3）が正しいか
    - 画像の alt 属性が適切か
    - 内部リンクが切れていないか

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【禁止事項（AGENTS.md 第1章を厳守）】
- Material Design の使用禁止
- 純黒 #000000 / 純白 #FFFFFF 禁止
- font-size 絶対値直指定禁止（clamp() を使用）
- border: 1px solid #ccc 禁止（シャドウで区切り）
- 10種類以上のフォントサイズ禁止（5段階まで）
- 絵文字使用禁止
- 既存コードパターンの無視禁止（命名・構成・スタイルを踏襲）
- id属性、data-*属性、診断ロジック、names.json、APIエンドポイントの変更禁止

【品質ゲート（実装後チェック）】
- [ ] Lighthouse: Performance 90+, Accessibility 100, SEO 100, CLS < 0.1
- [ ] Mobile 375px で全ページ崩れなし
- [ ] コントラスト比 4.5:1 以上（全テキスト）
- [ ] スペーシングが4px倍数
- [ ] シャドウで区切り（border不使用）
- [ ] prefers-reduced-motion 対応
- [ ] フォントサイズ5段階以内
- [ ] npm test が通過
- [ ] npm run lint が通過
- [ ] npm run build が成功

【作業プロセス（AGENTS.md 第2章に従う）】
1. 深堀り分析: 各Phase開始前に該当ファイルを読み込み、現状を理解
2. 計画: 修正が必要なファイルをリストアップ
3. 実装: 本ガイドの全ルールに従い1ステップずつ
4. 検証: npm test && npm run lint && npm run build で確認
5. 完了報告: 変更ファイル一覧・検証結果を progress.txt に追記

【作業順序】
Phase A → B → C → D → E の順に実施すること。
各Phase完了後、progress.txt に「[hp-research-apply] Phase X 完了: YYYY-MM-DD HH:MM」の形式で記録。

【ファイル変更前の確認】
- 既存コードの命名規則（camelCase, BEM）を踏襲
- CSS変数は :root で一元管理
- HTMLのセマンティック構造を維持
- 変更は必要最小限に留める

【技術スタック】
- Vanilla JS + Vite + 独自CSS + Supabase + Vercel
- テスト: Node.js built-in test runner（node --test）
- Lint: ESLint（eslint.config.js）
- 開発サーバー: Vite（npm run dev）

【最終報告（全Phase完了後、progress.txt に追記）】
- 変更したファイル一覧
- 各Phaseの達成状況
- Lighthouseスコア（変更前→変更後）
- 残りのリスク・懸念点
- 次の改善候補
