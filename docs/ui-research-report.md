# UI研究レポート — ペット・まとめサイト分析
生成日時: 2026/4/5 12:23:27
目的: pet-namer UIをプロ品質に改善するための参考調査

---

## アニマルブック（動物情報まとめ）
URL: https://animalbook.jp/
ページタイトル: 動物完全大百科 | Animalbook.jp
スクリーンショット: /tmp/ui-research/matome_naver.png

### レイアウト構造
| 項目 | 値 |
|------|----|
| ヘッダーの高さ | 68px |
| サイドバー | なし |
| カード数 | 17 |
| メインmax-width | none |
| 背景色 | rgb(238, 246, 238) |
| グリッドクラス | `card-grid card-grid--2` |

### カラーパレット
- `rgb(19, 40, 24)`
- `rgb(0, 0, 238)`
- `rgba(26, 54, 33, 0.88)`
- `rgb(223, 238, 221)`
- `rgb(215, 235, 213)`
- `rgb(31, 61, 39)`
- `rgba(29, 87, 51, 0.88)`
- `rgb(255, 255, 255)`

### タイポグラフィ
- **H1**: 32px / weight:700 / LS:0.64px
- **本文**: 24px / LH:normal
- **ボタン**: 13.12px / weight:800

### フォント
- "Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif
- Arial
- "Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif

### カードコンポーネント
#### カード 1
- クラス: `.card-grid`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(19, 40, 24)`

#### カード 2
- クラス: `.menu-card`
- border-radius: `18px`
- box-shadow: `rgba(0, 0, 0, 0.18) 0px 12px 30px 0px`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(19, 40, 24)`

#### カード 3
- クラス: `.menu-card__media`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(19, 40, 24)`

#### カード 4
- クラス: `.menu-card__overlay`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `24px`
- border: `0px none rgb(19, 40, 24)`

### 余白設計
- `.hero-backdrop`: padding `0px`, gap `normal`
- `.hero`: padding `0px`, gap `normal`
- `.intro`: padding `0px`, gap `normal`

---

## PETOKOTO（ペット情報メディア）
URL: https://petokoto.com/
ページタイトル: ペトコト（PETOKOTO）｜ペットライフメディア
スクリーンショット: /tmp/ui-research/petokoto.png

### レイアウト構造
| 項目 | 値 |
|------|----|
| ヘッダーの高さ | 78px |
| サイドバー | なし |
| カード数 | 183 |
| メインmax-width | 100% |
| 背景色 | rgba(0, 0, 0, 0) |
| グリッドクラス | `v-application__wrap` |

### カラーパレット
- `rgba(0, 0, 0, 0.87)`
- `rgb(250, 111, 69)`
- `rgb(244, 243, 238)`
- `rgb(0, 0, 0)`
- `rgb(255, 255, 255)`
- `rgb(242, 164, 155)`

### タイポグラフィ
- **本文**: 15px / LH:18px
- **ボタン**: 16px / weight:400

### フォント
- "Zen Kaku Gothic New"

### カードコンポーネント
#### カード 1
- クラス: `.v-responsive`
- border-radius: `12px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `1px solid rgb(26, 25, 25)`

#### カード 2
- クラス: `.text-p-black-lighten-6`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(184, 184, 184)`

#### カード 3
- クラス: `.mt-2`
- border-radius: `30px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `4px 12px`
- border: `2px solid rgb(250, 111, 70)`

#### カード 4
- クラス: `.mt-3`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(78, 77, 77)`

### 余白設計
- `.main-wrapper`: padding `0px`, gap `normal`
- `.pt-2 bg-p-beige-lighten-6 flex-center w-`: padding `8px 0px 0px`, gap `normal`
- `.pt-6 pb-14 bg-white flex-center w-100 bo`: padding `24px 0px 56px`, gap `normal`

---

## ニャンペディア（猫情報まとめ）
URL: https://www.anicom-sompo.co.jp/nyanpedia/
ページタイトル: ページが見つかりません│ペット保険の加入は「アニコム損害保険株式会社」
スクリーンショット: /tmp/ui-research/anicom.png

### レイアウト構造
| 項目 | 値 |
|------|----|
| ヘッダーの高さ | 107px |
| サイドバー | あり |
| カード数 | 1 |
| メインmax-width | none |
| 背景色 | rgba(0, 0, 0, 0) |
| グリッドクラス | `list animation01` |

### カラーパレット
- `rgba(255, 255, 255, 0.8)`
- `rgb(85, 85, 85)`
- `rgb(51, 153, 51)`
- `rgb(255, 255, 255)`
- `rgb(0, 0, 0)`
- `rgb(147, 197, 0)`
- `rgb(253, 140, 8)`
- `rgb(236, 109, 116)`

### タイポグラフィ
- **本文**: 11px / LH:16.5px
- **ボタン**: 13.3333px / weight:400

### フォント
- "ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif

### カードコンポーネント
#### カード 1
- クラス: `.sitemenu`
- border-radius: `0px`
- box-shadow: `none`
- background: `rgba(0, 0, 0, 0)`
- padding: `0px`
- border: `0px none rgb(85, 85, 85)`

### 余白設計
- `.mainLayout`: padding `0px`, gap `normal`

---

## Cursor / Antigravity 向け実装プロンプト

```
以下のリサーチ結果をもとにpet-namer（ペット名前診断サイト）のUIを
プロのWebデザイナーレベルにリニューアルしてください。

【参考サイトから抽出したデザインパターン】

1. レイアウト:
   - max-width 1100〜1200px中央揃え
   - ヘッダー高さ 60〜80px、sticky配置
   - セクション間 padding 40〜60px

2. カードデザイン:
   - border-radius: 12〜16px
   - box-shadow: 0 2px 12px rgba(0,0,0,0.08)
   - 背景: 白(#fff)または薄グレー(#f8f8f8)
   - ホバー: transform translateY(-4px) + shadow強化

3. カラーパレット:
   - ベース: 白 #ffffff
   - 背景: クリーム #fff8f2 または薄グレー #f5f5f5
   - アクセント: オレンジ #E08745（既存を維持）
   - テキスト: #222 / ミュート: #777

4. タイポグラフィ:
   - フォント: Noto Sans JP
   - H1: 28〜36px / bold
   - 本文: 15〜16px / line-height 1.7

5. チップ・フィルターUI:
   - 角丸pill形状
   - 選択時: オレンジ背景 + 白文字
   - 非選択: 白背景 + ボーダー
```
