# Codex Prompt — Sippomi HP: Webデザイン全面磨き込み

## 対象プロジェクト
```
/Users/shimizutaiga/Projects/sippomi/
```
Vanilla JS + Vite + 独自CSS（Apple Japan × MUJI ハイブリッド） + Supabase + Vercel

---

## 【最重要制約】

### 触ってはいけない
- JavaScriptのDOMフック（全 `id` 属性）: speciesGrid, vibeChips, genderChips, colorChips, lengthChips, themeChips, callStyleChips, ownerLifestyleChips, wishChips, uniquenessChips, sceneChips, btnDiagnose, resultContainer, resultSection, resultShareArea, btnRetry, trendingSection, celebSection, surnameCheckerSection, authPanelSection, communitySection, savedFavoritesSection
- 全 `data-*` 属性（data-species, data-share, data-state, data-color, aria-*）
- JS import構造（main-loader.js → main.js → 各モジュール）
- diagnosis.js の診断ロジック
- names.json, japanese-surnames.json のデータ構造
- API エンドポイント（api/*.js）
- package.json の依存関係（追加は可、削除は不可）

### デザインルール
- **Apple Japan の大胆な見せ方 + MUJI の静かな生活導線** のハイブリッドを厳守
- 背景ベース: MUJI Kinari `#f4eede` を基準。Apple純白ベースに戻さない
- テキスト: Apple `#1d1d1f` / `#6e6e73`。巨大見出し + 大胆な面の使用
- CTA: Apple Blue `#0071e3` のピル型ボタン
- カード: Apple的に大きめ面積、角丸 28px まで
- **絵文字禁止**。雰囲気はタイポグラフィと余白で作る
- **詰め込まない**。日本の「間（Ma）」: セクション間 120-200px、カード間 24-32px

---

## 【永続タスク】
あなたは以下のサブタスクを完了するまで作業を続けるAgentである。
1セッションで1サブタスクのみ実行し、verification 後 STOP せよ。

### コアルール
1. 1セッション1タスク、終わったらSTOP
2. タスク完了後: `progress.txt` 更新 → 動作確認 → STOP
3. 再開時: `progress.txt` → git log → 次のタスク1つ → STOP
4. 「おそらく動く」禁止。`npm run dev` でブラウザ確認するか `npm test` 実行
5. `npm run lint` でエラーがないこと

---

## 【サブタスク一覧】

### Phase 1: デザイントークン追加
1. `src/styles/global.css` の `:root` に新デザイントークンを追加: `--color-soft-orange: #F9A66C;`, `--color-terracotta: #E07A5F;`, `--color-warm-brown: #3D2C2A;`, `--color-cream-white: #FFF8F0;`, `--color-warm-bg: #FFFAF5;`, `--color-glass-border: rgba(255,255,255,0.4);`, `--color-glass-bg: rgba(255,255,255,0.7);`, `--shadow-soft: 0 2px 12px rgba(0,0,0,0.06);`, `--shadow-card: 0 10px 30px rgba(0,0,0,0.06);`, `--radius-card: 20px;`, `--radius-large: 28px;`
2. フォントサイズスケールを追加: `--text-hero: clamp(3rem, 8vw, 5rem);`, `--text-section: clamp(1.8rem, 4vw, 3rem);`, `--text-card-title: 1.25rem;`, `--text-body: 1.0625rem;`

### Phase 2: ヒーローセクション再設計
3. `index.html` の hero-section 内の `.hero-copy` を再構成: 大見出しのフォントサイズを `--text-hero` に、サブコピーを1行追加（「3つの質問であなたのペットにぴったりの名前を」）、`.hero-stats` に3つの数字実績を追加（「登録名前数: 1,200+」「診断実績: 10,000+」「満足度: 98%」）
4. `.hero-background-decor` に控えめなパララックス効果（背景要素が scroll 速度の 0.5 倍で動く）。`landing-effects.js` に追加
5. `.hero-actions` のCTAボタンを大きく: padding 16→20、font-size 1.1rem、box-shadow `--shadow-glow`。hover 時に微妙な scale(1.02)

### Phase 3: 診断UIの質感向上
6. `src/styles/components.css` の `.diagnosis-panel` に Frosted Glass 風背景を追加: `background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px;`
7. 種別選択 `.species-card` のアクティブ状態を改善: `.is-active` 時に背景グラデーション + scale(1.05) + ソフトシャドウ。transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)（バウンス感）
8. フィルターチップ `.chip` のアクティブ状態を改善: グラデーション背景 + 白文字 + 微細シャドウ。非アクティブ時に透過背景 + 微細ボーダー。角丸 22px
9. 診断ボタン `#btnDiagnose` に押下時アニメーション追加: `scale(0.96) → scale(1.02)` のリバウンド効果。`landing-effects.js` に実装

### Phase 4: 診断結果のビジュアル強化
10. 結果表示の `.result-section` の表示アニメーション: 下からふわっと（opacity 0→1 + translateY 20px→0）。Intersection Observer でトリガー
11. トップ結果 `.top-result` のカードデザイン強化: 背景グラデーション + 名前文字サイズ 36-48px + letter-spacing 0.05em + 名前の1文字ずつが上から落ちてくるアニメーション。render.js の createResultCard で実装
12. 名前カード `.name-card` の hover 時に translateY(-4px) + box-shadow拡大。transition 0.3s ease
13. 名前カードの数字カウントアップアニメーション（スコア表示時に 0→スコア へカウントアップ）

### Phase 5: スクロールナラティブ改善
14. 各セクション（`.section`）に Intersection Observer でスクロールインアニメーション: opacity 0→1 + translateY 20px→0。threshold 0.15。`landing-effects.js` に実装
15. `.section-label` の上に薄い区切り線（1px, `--border` 色）を追加し、セクション間のリズムを明確に
16. モバイル向けの固定フッターCTA（画面下部に常駐する「今すぐ無料診断」ボタン）。スクロール位置が hero を過ぎたら表示。`landing-effects.js` に実装

### Phase 6: 信頼構築要素の追加
17. `index.html` の diagnose section の前に「信頼セクション」を追加: 3カラムグリッド（PC） / 1カラム（SP）。アイコン + 数字 + テキストの縦積み。内容: 「1,200+の名前から厳選」「AIがあなたに最適な名前を提案」「24時間いつでも無料」
18. 診断結果エリアの下部に「この診断の仕組み」折りたたみパネルを追加（アルゴリズムの簡易説明 + データソース）

### Phase 7: トレンドランキング・芸能人ペットのUI改善
19. トレンドランキング `.trending-row` のトップ3に特別スタイル: 1位=金グラデーション、2位=銀、3位=銅。`.trending-row--top` に rank ごとの色設定
20. 芸能人ペット `.celeb-card` の画像がない場合のプレースホルダーをイラスト風に改善（シルエット + 種別アイコン）
21. 姓判定 `.surname-checker__badge` の結果アニメーション: スコア表示時に scale(1.3) → scale(1) のポップアニメーション

### Phase 8: コミュニティ・認証周り
22. コミュニティ `.community-gate` のログイン前画面にイラスト的要素（ペットのシルエット + 吹き出し「みんなの名前を見てみよう」）
23. `.auth-panel__body` の開閉アニメーションをより滑らかに（max-height transition の代わりに JS で高さ計算して animate）

### Phase 9: パフォーマンス・レスポンシブ
24. 全画像に `loading="lazy"` + `decoding="async"` を追加。hero 画像に `fetchpriority="high"` を追加
25. モバイルブレイクポイント（768px以下）で `.hero-title` のフォントサイズを適切に縮小。`.hero-stats` を横スクロールに
26. モバイルで `.species-grid` を 2カラムに。`.chips` を横スクロールに（flex-wrap: nowrap; overflow-x: auto）
27. CSS の `@media (prefers-reduced-motion)` 対応: 全アニメーションを無効化

### Phase 10: 検証
28. `npm run dev` で全画面を確認: ヒーロー → 診断 → 結果 → トレンド → 芸能人 → 姓判定 → 認証 → コミュニティ。表示崩れがないこと
29. `npm test` 実行し全テスト通過確認
30. `npm run lint` 実行し全エラー解決
31. 完了マーカー `completion_marker_hp_v2.md` を作成: 変更ファイル一覧、テスト結果、残リスク

---

## 成功基準
- Apple Japan（大胆なタイポグラフィ・面の使用）+ MUJI（Kinari 背景・静かな導線）のハイブリッドが維持されている
- 全JavaScript機能（診断・トレンド・芸能人・姓判定・認証・コミュニティ）が正常動作
- モバイル（375px幅）で表示崩れがない
- `npm test` が全通過
- Lighthouse Performance 90+ / Accessibility 100 / SEO 100
- CLS < 0.1
