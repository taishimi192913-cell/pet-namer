# pet-namer Design System

## コンセプト
「温かい日本の文具・エディトリアル」  
ペットを迎えた喜びの瞬間に寄り添う、手書き感覚の温もりと本格的なデザイン品質の融合。

---

## カラーパレット

| 用途 | CSS変数 | HEX |
|------|---------|-----|
| メインアクセント（オレンジ） | `--primary` | `#f07d5a` |
| アクセントホバー | `--primary-hover` | `#e0643e` |
| セカンダリ（ティール） | `--accent` | `#4aa899` |
| 背景ベース | `--bg` | `#faf7f3` |
| サーフェス | `--surface` | `#ffffff` |
| テキスト | `--text` | `#2d2520` |
| テキスト補足 | `--text-sub` | `#8a7e74` |
| ボーダー | `--border` | `#ede5db` |

### アクセントカラー（セクション用）
- ゴールド: `--gold: #e8b84b`（ランキング・おすすめ）
- ローズ: `--rose: #ec8fa3`（有名人・トレンド）
- ティール: `--teal: #6bc5b8`（うさぎ・鳥系）

---

## タイポグラフィ

| 役割 | フォント変数 | フォントファミリ |
|------|-------------|----------------|
| 見出し（H1・H2） | `--font-display` | Noto Serif JP → Yu Mincho |
| 本文・UI | `--font-body` | M PLUS Rounded 1c → Hiragino Maru Gothic |
| 数字・ラベル | `--font-num` | Nunito |

### 使い分けルール
- **`--font-display`**: ヒーローH1、セクションH2（`.step-heading`）、スポットライト名前
- **`--font-body`**: 本文・説明文・チップ・カード内テキスト
- **`--font-num`**: スコアパーセント、ランキング順位、カウンター

---

## スペーシング

```
セクション padding: 32px 0 (モバイル) / 48px 0 (デスクトップ)
カードgap: 12px (モバイル) / 16px (デスクトップ)
コンテナmax-width: 860px
```

---

## コンポーネント

### セクションラベル (`.section-label`)
- `0.68rem / letter-spacing: 0.2em / uppercase`
- 左にライン装飾 → テキスト → 右にフェードアウトライン
- カラー: `--primary`

### ステップ見出し (`.step-heading h2`)
- フォント: `--font-display` (Noto Serif JP)
- 左にカラードット/アイコンバッジ (`.step-num`)

### 名前カード (`.name-card`)
- 背景: `--surface-card (#fffcf9)`
- border-radius: `--radius-sm (14px)`
- shadow: `--shadow-sm`
- ホバー: `translateY(-4px)` + `--shadow-md`
- ランキングバッジ: グラデーション `#f5a623 → #E08745`

### チップ (`.chip`)
- 非選択: 白背景 + `--border` ボーダー
- 選択: `--primary` 背景 + 白文字
- アニメーション: `chip-pop cubic-bezier(0.34, 1.56, 0.64, 1)` 0.38s

### スポットライト (`.spotlight`)
- 最高マッチ名を大きく展示
- フォント: `--font-display` for name
- 背景: グラデーション `--primary → peach`

---

## アニメーション

```css
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);  /* チップ選択 */
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* フェードイン */
--ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);        /* スライド */
```

### スタガードカードアニメ
```css
.name-card { animation-delay: calc(var(--i, 0) * 75ms); }
```

---

## 背景・テクスチャ

| 効果 | 実装 |
|------|------|
| ドット背景 | `body` に `radial-gradient` 28px grid |
| ペーパーグレイン | `body::before` SVG noise filter `opacity: 0.028` |
| Auroraグラデ | `.aurora-bg::before/after` `filter: blur(65px)` keyframes |

---

## セクション構成（ページ順）

1. **HERO** — キャッチコピー + 統計 + ヒーロー画像
2. **RANKING** — 今年の人気名前ランキング（犬/猫/うさぎ）
3. **CELEBRITY PETS** — 有名人・名作キャラのペット名鑑
4. **STEP 1** — 種類選択
5. **STEP 2** — 雰囲気・性別・毛色
6. **RESULT** — スポットライト + 名前カードグリッド
7. **FAQ** — よくある質問

---

## Figma MCP 連携メモ
- デザイントークンは上記CSS変数を使用
- Figmaで変更 → `--primary` 等を更新 → CSSに反映
- カラースタイル名: `Primary/Orange`, `Accent/Teal`, `Surface/Base`, `Text/Main`
