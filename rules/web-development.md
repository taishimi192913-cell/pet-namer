# Web開発 詳細ルール集

Awwwards審査基準 / Refactoring UI / Smashing Magazine / UX Movement / WCAG 2.2 / Core Web Vitals に基づく実装ルール。

---

## 1. タイポグラフィシステム

### フォントサイズ階層（5段階制限）

| 段階 | 役割 | サイズ(rem) | weight | line-height | letter-spacing |
|------|------|------------|--------|-------------|----------------|
| **H1** | ページ主見出し | `clamp(2rem, 5vw, 3rem)` | 700-800 | 1.1 | -0.04em |
| **H2** | セクション見出し | `clamp(1.5rem, 3vw, 1.875rem)` | 600-700 | 1.2 | -0.02em |
| **H3** | サブセクション | `1.125rem〜1.25rem` | 600 | 1.3 | normal |
| **Body** | 本文 | `1rem` (16px) | 400 | 1.5-1.7 | normal |
| **Caption** | 補足・注釈 | `0.75rem〜0.875rem` | 400-500 | 1.4 | normal |

```css
/* 基本設定 */
html { font-size: 100%; } /* ブラウザデフォルト=16pxを尊重 */
body {
  font-family: 'Inter', 'SF Pro Text', -apple-system, sans-serif;
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  line-height: 1.6;
  color: var(--text-primary);
}

/* 見出し */
h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.04em; }
h2 { font-size: clamp(1.5rem, 3vw, 1.875rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; }
h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; }

/* 行長制限 — 日本語は35-45文字、英語は45-75文字が最適 */
p, li { max-width: 65ch; }

/* リンクは下線＋色で判別（色だけに頼らない） */
a { text-decoration: underline; text-underline-offset: 0.2em; }
```

### 禁止

- ❌ `font-size: 16px` 固定値 → `clamp()` で流体的に
- ❌ `line-height: 1` または `normal` → 本文は最低1.5
- ❌ 10種類以上の異なるフォントサイズ
- ❌ `text-wrap: normal` → 見出しには `text-wrap: balance` を推奨

---

## 2. スペーシングシステム

### 4px倍数体系

```
ベース単位: 4px

使用可能な値:
  4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

用途別推奨:
  4-8px   : 密接要素間（ラベル→入力欄、アイコン→テキスト）
  12-16px : 関連要素間（カード内のテキスト群）
  24-32px : カード内padding
  48-64px : セクション内のグループ間
  80-128px: セクション間（十分な余白から始め、必要なら削る）
```

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --space-5xl: 128px;
}
```

### 鉄則

- 「余白が多すぎる」状態から削る方が「足りない」状態から足すより良い
- ランダム値（`margin-top: 30px` 等）禁止
- 枠線で区切るより、余白で区切る

---

## 3. カラーシステム

### グレーパレット（9-10段階、青みslate推奨）

```css
:root {
  --gray-50:  hsl(210 20% 98%);
  --gray-100: hsl(210 20% 95%);
  --gray-200: hsl(210 16% 90%);
  --gray-300: hsl(210 14% 80%);
  --gray-400: hsl(210 12% 65%);
  --gray-500: hsl(210 10% 50%);
  --gray-600: hsl(210 12% 40%);
  --gray-700: hsl(210 14% 28%);
  --gray-800: hsl(210 16% 18%);
  --gray-900: hsl(210 20% 10%);
}
```

### テキストカラー

```css
:root {
  --text-primary:    hsl(210 20% 8%);    /* 本文 */
  --text-secondary:  hsl(210 10% 40%);   /* 補足。4.5:1以上確保 */
  --text-tertiary:   hsl(210 10% 55%);   /* 無効テキスト */
  --text-disabled:   hsl(210 10% 70%);
}
```

### 禁止

- ❌ `#000000`（純黒）→ `hsl(210 20% 8%)` 相当
- ❌ `#FFFFFF`（純白背景）→ `hsl(0 0% 98%)` 等のオフホワイト
- ❌ `#808080`（純グレー）→ 青みまたは暖かみを持たせる
- ❌ RGB / Hex 直指定 → HSL で管理
- ❌ コントラスト比 4.5:1 未満のテキスト色

### ダークモード

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary:    hsl(210 20% 92%);
    --text-secondary:  hsl(210 10% 65%);
    --gray-50:  hsl(210 20% 8%);
    --gray-100: hsl(210 16% 12%);
    --gray-200: hsl(210 14% 18%);
    --gray-300: hsl(210 12% 25%);
    --gray-800: hsl(210 16% 88%);
    --gray-900: hsl(210 20% 95%);
    --shadow-color: 0 0% 0%;
  }
}
```

---

## 4. シャドウシステム（奥行き表現）

### 光源: 左上想定 → 影は右下

```css
:root {
  --shadow-xs: 0 1px 2px  hsl(var(--shadow-color, 0 0% 0%) / 0.06);
  --shadow-sm: 0 1px 2px  hsl(var(--shadow-color, 0 0% 0%) / 0.06),
               0 1px 3px  hsl(var(--shadow-color, 0 0% 0%) / 0.08);
  --shadow-md: 0 2px 4px  hsl(var(--shadow-color, 0 0% 0%) / 0.06),
               0 4px 12px hsl(var(--shadow-color, 0 0% 0%) / 0.12);
  --shadow-lg: 0 4px 8px  hsl(var(--shadow-color, 0 0% 0%) / 0.08),
               0 8px 32px hsl(var(--shadow-color, 0 0% 0%) / 0.16);
  --shadow-xl: 0 8px 16px hsl(var(--shadow-color, 0 0% 0%) / 0.10),
               0 16px 48px hsl(var(--shadow-color, 0 0% 0%) / 0.20);
}
```

### 標高レベル（Z-index不要の階層）

| レベル | 使用シャドウ | 用途 |
|--------|------------|------|
| 0 | none | 背景 |
| 1 | `--shadow-sm` | カード、静的コンテンツ |
| 2 | `--shadow-md` | ドロップダウン、ツールチップ |
| 3 | `--shadow-lg` | モーダル、ダイアログ |
| 4 | `--shadow-xl` | トースト通知、最前面 |

### 禁止

- ❌ `box-shadow` なしの `border: 1px solid` → まずシャドウで区切る
- ❌ 単層シャドウ → 必ず2層以上で自然な拡散を表現

---

## 5. 角丸（Border Radius）

```css
:root {
  --radius-sm: 4px;    /* 入力欄、小さなボタン */
  --radius-md: 8px;    /* ボタン標準 */
  --radius-lg: 12px;   /* カード標準 */
  --radius-xl: 16px;   /* モーダル、大型カード */
  --radius-2xl: 24px;  /* 特大コンテナ */
  --radius-full: 9999px; /* チップ、アバター */
}
```

- 角丸は神経科学的に目の負荷を下げる
- 要素サイズに比例させる（小要素は小さく、大要素は大きく）
- 内部要素の角丸 = 親の角丸 - padding（一貫性）

---

## 6. レイアウトパターン

### Bento Grid（Apple式非対称グリッド）

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-md);
}

.bento-card-xl { grid-column: span 8; }
.bento-card-lg { grid-column: span 6; }
.bento-card-md { grid-column: span 4; }
.bento-card-sm { grid-column: span 3; }

@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-card-xl, .bento-card-lg, .bento-card-md, .bento-card-sm {
    grid-column: span 1;
  }
}
```

### ページ基本構造（10サイト分析の共通パターン）

```
[ Sticky Header — position: sticky; backdrop-filter: blur() ]
[ Hero — 大見出し + グラデーションテキスト + 2 CTA ]
[ Social Proof — 企業ロゴカルーセル / 数字実績 ]
[ Value Props — Bento Grid カード ]
[ Feature Details — タブ切替 または 縦スクロール ]
[ Testimonials — 顔写真 + 引用 + 役職 ]
[ Final CTA — Get started / Contact ]
[ Mega Footer — 4〜6カラムリンク集 ]
```

### Sticky Header

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: hsl(var(--bg) / 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}
```

### Container Queries（ブレークポイントフリー）

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## 7. アニメーションとインタラクション

### スクロール駆動アニメーション（JS不要）

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: fade-up linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

### Reduce Motion 対応

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### フォーカス可視化

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
/* :focus ではなく :focus-visible を使う（マウスクリックで枠が出ない） */
```

---

## 8. パフォーマンス基準

### Core Web Vitals 合格閾値（75パーセンタイル）

| 指標 | 合格 | 要改善 | 不良 |
|------|------|--------|------|
| **LCP** (最大コンテンツ描画) | ≤2.5秒 | ≤4.0秒 | >4.0秒 |
| **INP** (インタラクション応答) | ≤200ms | ≤500ms | >500ms |
| **CLS** (累積レイアウトシフト) | ≤0.1 | ≤0.25 | >0.25 |

- クリティカルパスリソース: ≤170KB（圧縮後）
- Lighthouse パフォーマンススコア: ≥80

### 画像最適化ルール

```html
<!-- WebP優先, 遅延ロード, サイズ明示（CLS防止） -->
<img
  src="image.webp"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
  alt="説明的な代替テキスト"
/>
```

- 全画像に `width` / `height` 属性を明示（CLS防止）
- `font-display: swap` でWebフォントのCLS防止
- 動的コンテンツ挿入は既存コンテンツの「下」に（CLS防止）

---

## 9. アクセシビリティ（WCAG 2.2 AA準拠）

### HTML構造要件

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <title>一意のページタイトル</title>
</head>
<body>
  <!-- スキップリンク必須 -->
  <a href="#main-content" class="skip-link">メインコンテンツへ</a>

  <header>
    <nav aria-label="メインナビゲーション">...</nav>
  </header>

  <main id="main-content">
    <h1>ページの主題（1ページ1つのみ）</h1>
    <!-- 見出しレベルをスキップしない: h1→h2→h3 -->
  </main>

  <footer>...</footer>
</body>
</html>
```

### コントラスト要件

| 対象 | 最低比 |
|------|--------|
| 通常テキスト（<18pt, <14pt太字） | **4.5:1** |
| 大テキスト（≥18pt, ≥14pt太字） | **3:1** |
| UIコンポーネント境界・アイコン | **3:1** |
| フォーカスインジケータ | **3:1** |

### フォーム要件

```html
<!-- labelとinputをfor/idで紐付け -->
<label for="email">メールアドレス</label>
<input type="email" id="email" name="email" autocomplete="email" />

<!-- エラー表示: テキストで明示 + aria-describedbyで紐付け -->
<input type="email" id="email" aria-describedby="email-error" />
<p id="email-error" role="alert">有効なメールアドレスを入力してください</p>
```

### 動的コンテンツ通知

```html
<!-- 画面リーダーに状態変化を通知 -->
<div role="status" aria-live="polite">検索結果: 12件</div>
<div role="alert">エラーが発生しました</div>
```

### 必須チェック項目

- [ ] `<html lang="ja">` 設定
- [ ] スキップリンク実装
- [ ] セマンティックHTML（`<header>`, `<nav>`, `<main>`, `<h1>`〜`<h6>`）
- [ ] 見出しレベルスキップなし
- [ ] 全 `<img>` に `alt` 属性（装飾は空 `alt=""`）
- [ ] 全フォーム入力に `<label>`（`for`/`id` 紐付け）
- [ ] `:focus-visible` スタイル定義
- [ ] タッチターゲット ≥ 24×24px
- [ ] `aria-label` / `aria-describedby` 適切に使用
- [ ] `prefers-reduced-motion` 対応
- [ ] `prefers-color-scheme` 対応
- [ ] `autocomplete` 属性を適切に設定

---

## 10. 共通コンポーネント定義（15種）

| # | コンポーネント | 実装ポイント |
|---|--------------|------------|
| 1 | **Sticky Header** | `position: sticky; backdrop-filter: blur()` |
| 2 | **Hero Section** | 大見出し + グラデーションテキスト + 2 CTA + 背景効果 |
| 3 | **Logo Carousel** | 自動スクロールの企業ロゴ行 |
| 4 | **Bento Card** | CSS Grid 12カラムの可変サイズカード |
| 5 | **Stats Bar** | 数字実績の横並び（カウントアップアニメーション） |
| 6 | **Code Block** | シンタックスハイライト付きコード表示 |
| 7 | **Testimonial Card** | 顔写真 + 引用 + 役職 |
| 8 | **Tab Switcher** | カテゴリ切替UI（aria-selected, role="tablist"） |
| 9 | **Accordion FAQ** | 折りたたみ（details/summary または JS） |
| 10 | **Mega Menu** | 大規模ドロップダウンナビゲーション |
| 11 | **Mega Footer** | 4〜6カラムのリンク集 |
| 12 | **Glass Card** | `backdrop-filter: blur()` + 半透明背景 |
| 13 | **Infinite Scroll** | Intersection Observer による自動読み込み |
| 14 | **Pricing Calculator** | インタラクティブ計算機 |
| 15 | **Empty State** | イラスト + キャッチコピー + CTAボタン |

---

> **参照**: Awwwards審査基準 / Refactoring UI / Smashing Magazine / UX Movement / WCAG 2.2 / Core Web Vitals
