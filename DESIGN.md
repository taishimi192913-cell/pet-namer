# DESIGN.md — Sippomi Hybrid Home

> 参照元は `awesome-design-md-jp` の `design-md/apple/DESIGN.md` と `design-md/muji/DESIGN.md`。このホームでは Apple Japan の大胆なタイポグラフィと製品ページ構成を借りつつ、背景色・生活感・余白の土台は MUJI に従う。

* * *

## 1. Visual Theme & Atmosphere

- ベース思想: Apple のプレミアムな見せ方 + MUJI の静かな生活導線
- 印象語: premium, quiet, editorial, consumer-friendly, spacious
- レイアウト密度: ゆったり。大見出しと大きな面を使う
- UI の役割: 「説明」より「体験を選ばせる」ことを優先

* * *

## 2. Color Palette & Roles

### MUJI Base

- Background Main: `#f4eede`
- Background Secondary: `#f5f5f5`
- Surface: `#ffffff`
- Beige Accent: `#e0ceaa`
- MUJI Red: `#7f0019`

### Apple Premium Layer

- Text Primary: `#1d1d1f`
- Text Secondary: `#6e6e73`
- On Dark: `#f5f5f7`
- Apple Blue: `#0071e3`
- Link Blue: `#0066cc`
- Dark Section: `#000000`

### Rules

- 全体背景は MUJI の `Kinari` を基準にする
- 広い面積で使う色は `#f4eede`, `#fff`, `#f5f5f5`
- Apple Blue は CTA とリンクに限定
- MUJI Red は小さなアクセントだけ

* * *

## 3. Typography Rules

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro JP", "SF Pro Display", "SF Pro Text", "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "Noto Sans JP", Meiryo, sans-serif;
```

- 可能なら Apple 系スタックを先頭に置く
- 日本語は角ゴシック系
- 明朝は使わない

### Scale

- Hero Display: `clamp(4rem, 11vw, 7rem)` / `600` / `1.02`
- Section Title: `clamp(2rem, 5vw, 4rem)` / `600` / `1.08`
- Panel Title: `clamp(1.4rem, 2.6vw, 2.4rem)` / `600` / `1.15`
- Body: `17px` / `400` / `1.47`
- Small Label: `12px` - `14px` / `500` / `1.4`

### Tracking

- 本文は Apple 寄りにやや詰める
- 巨大見出しはごく弱い負のトラッキングを許可
- 小ラベルは `0.08em` - `0.14em` の広いトラッキング

* * *

## 4. Component Stylings

### Hero

- Apple 型の巨大タイポグラフィ
- 背景色は MUJI `#f4eede`
- 大きなビジュアルパネルを 1 つ配置

### Buttons

- Primary: Apple Blue fill, white text, pill radius
- Secondary: white surface, near-black text, subtle border, pill radius
- hover は色変化とごく小さな浮き上がり

### Cards

- 静的紹介カードは Apple 的に大きめ面積で見せる
- Light card: white / warm gray
- Dark card: `#1d1d1f` background + `#f5f5f7` text
- 角丸は 28px 前後まで許可

### Forms / Diagnosis UI

- 入力パネルは白ベース
- 選択チップは Apple Blue または dark fill
- 絵文字アイコンは禁止

* * *

## 5. Layout Principles

- Hero max width: `1400px`
- Main content max width: `1260px`
- Horizontal padding: `16px` - `32px`
- Vertical spacing: `48px` - `120px`
- 2 カラムまたは 3 カラムを基本
- 1 セクションにつき 1 つの強いメッセージを置く

* * *

## 6. Depth & Elevation

- 基本はフラット
- 白カードのみ `0 10px 30px rgba(0,0,0,0.06)` まで
- dark panel は影よりコントラストで見せる
- ガラスナビは使わず、今回のヘッダーは軽い透明度に留める

* * *

## 7. Do's and Don'ts

### Do

- Apple のように見出しを大きく、面を大胆に使う
- MUJI のように背景と余白は落ち着かせる
- 入口を少なくし、各セクションに役割を持たせる
- 背景に十分な呼吸感を持たせる

### Don't

- パステル調のかわいさでまとめない
- 小さなカードを大量に並べて密度を上げない
- 絵文字で雰囲気を作らない
- 背景を Apple 純白ベースへ戻さない

* * *

## 8. Responsive Behavior

- Desktop: 2 カラムのヒーローと大型カード
- Tablet: 1-2 カラムに縮退
- Mobile: 大見出しは維持しつつ、面は縦積み
- 主要 CTA はファーストビューで見える位置に残す

* * *

## 9. Agent Prompt Guide

```text
Sippomi のホームページを Apple Japan と MUJI のハイブリッドとして実装すること。
- 背景色は MUJI の Kinari #f4eede を基準
- テキストは Apple の #1d1d1f / #6e6e73 を採用
- Hero と主要導線は Apple 的な大見出しと製品ページ構成
- CTA は Apple Blue のピル型を許可
- 絵文字は禁止
- 診断機能の ID と JavaScript フックは維持
```
