# pet-namer 再設計仕様書

> 作成日: 2026-04-04
> 目的: 現状の課題分析 → 再設計コンセプト → Cursor 実装仕様までを一気通貫で定義する

---

## 1. 現状の問題点

### 1-1. UX の問題

**導線が冗長で、診断に到達するまでが遠い。** index.html のトップには eyebrow テキスト、h1、説明文、CTA ボタン、統計ボックス 3 つ、信頼ストリップ 4 項目が並ぶ。ユーザーの目的は「名前を探す」の一点なのに、ファーストビューがランディングページ風の自己紹介で埋まっている。「148 名前候補」「12 雰囲気カテゴリ」といった数字はユーザーの意思決定に寄与しない。

**フィルタ条件が 4 カテゴリ × 最大 12 項目で、一覧性が低い。** 雰囲気チップだけで 12 個。かわいい / ふわふわ系 / スイーツ系の違いがユーザー目線で自明でなく、選択の認知負荷が高い。

**FAQ が診断フォームと結果パネルの間に挟まっている。** 「決定」を押して結果を見ようとしたとき、FAQ セクションが視覚的に割り込む。ページ構造として不自然。

**結果が全件ドバッと出る。** 148 件中の一致候補が一気にグリッド表示される。スコア順とはいえ、30〜50 件のカードを眺めるのは疲れる。「いちおし」以外の候補は段階的に見せるべき。

**ローディング演出が 1.2 秒の固定 setTimeout。** ブラウザ内のフィルタリングなのに擬似ウェイトを入れている。UX 的に不誠実で、リピートユーザーにはストレス。

**シェアボタンの導線が弱い。** 結果一番下にシェアセクションがあるが、そこまでスクロールしないと見えない。いちおし候補のすぐ横に置くべき。

### 1-2. 情報設計の問題

**「診断」という看板だが、実態はフィルタリング + 加点スコアリング。** 「診断」を名乗るなら、もう少し物語性や結果の個性が欲しい。現状はデータベース検索に近い。

**名前データのスキーマが平坦。** species / gender / vibe / color の 4 軸しかなく、音の響き（母音構成、文字数）・由来の系統（自然 / 食べ物 / 神話）・呼びやすさ（濁音の有無、リピート音）といった軸がない。スコアリングの深みが出ない。

**SEO ページが中身スカスカ。** dog-names.html は h1 + 2 段落 + リンクカード 3 枚だけで 73 行。ユーザーにも検索エンジンにも価値が薄い。リンク先の診断結果が同じトップページなので、SEO ページの存在意義がほぼ「入口の分散」だけになっている。

**auth パネルが中途半端に露出している。** Supabase 未設定でも UI に「設定待ちです」「Supabase の URL と anon key を設定すると〜」と表示される。開発者メモがエンドユーザーに見えてしまっている。

### 1-3. 見た目の問題

**グラスモーフィズムの多用で視覚階層がフラットになっている。** すべてのパネルに `backdrop-filter: blur(14px)` + 白半透明背景が適用されており、セクション間の優先度の差が伝わらない。「どこを見ればいいか」が直感的にわからない。

**配色のアクセントが coral (#e86b55) の一色に偏りすぎ。** CTA、選択チップ、ローディングスピナー、auth ボタン、すべて同じ coral グラデーション。結果として「重要なもの」のハイライトが効かず、すべてが同じ温度に見える。

**タイポグラフィに遊びがない。** font-weight: 800 の多用でメリハリが逆に消えている。800 が見出しにもラベルにも eyebrow にもチップにもボタンにも使われており、視覚的な優先順位付けが崩壊。

**aurora 背景アニメーションのパフォーマンス。** `filter: blur(65px)` を fixed 要素にかけ続けている。ローエンド端末で GPU 負荷になりうる。見た目の効果に対してコストが高い。

### 1-4. SEO と体験のバランスの問題

**seo-copy-panel が「検索エンジンに読ませるためだけの文章」になっている。** 「犬の名前診断・猫の名前診断に対応」セクションはキーワードの羅列感が強く、ユーザーが読んで有益な情報がほぼない。

**個別 SEO ページに独自コンテンツがない。** dog-names.html にあるのは「犬の名前を決めるときの探し方」という汎用的な 2 段落のみ。人気の名前ランキング、名付けの豆知識、実際の名前サンプルといった固有価値がない。

**meta keywords を使っている。** Google は meta keywords を無視して久しい。不要。

### 1-5. 保守性の問題

**HTML に全セクション・全チップが手書きで埋め込まれている。** 雰囲気カテゴリを 1 つ追加するだけで、HTML のチップ要素を手動追加 → names.json にタグ追加 → CSS は既存で動く、という 2 箇所変更。データ駆動で HTML を生成すべき。

**CSS が 1100 行の単一ファイル。** BEM 命名自体は整理されているが、auth パネル関連だけで 200 行近くを占め、将来の機能追加で膨張が加速する。

**app.js が 638 行の即時実行関数。** 認証ロジック（187〜341 行）とフィルタリングロジック（410〜483 行）と DOM 操作（530〜580 行）が同一スコープに混在。テストも分離もできない。

**SEO ページが個別 HTML ファイルのコピペ。** dog-names.html / cat-names.html / rabbit-names.html で header・footer が重複。ヘッダーを変えたいときに 4 ファイルを修正する必要がある。

---

## 2. 再設計コンセプト

### 2-1. 誰向けのサイトとして再定義するか

**ペルソナ: 「はじめてペットを迎える / 迎えたばかりの飼い主」。** 年齢は 20〜40 代、スマホ中心、名付けに迷っている。SNS で「うちの子の名前これにしました」と共有したい気持ちがある。

サイトのポジションは「名付け辞典」ではなく「名前さがしの相談相手」。データベースの網羅性より、少数の候補を自信を持って提示する方が価値が高い。

### 2-2. トップ体験を何にするか

**「開いたら 3 タップで結果が見える」を最優先にする。**

1. ファーストビューに種類選択（犬 / 猫 / うさぎ…）をドンと置く
2. 選んだら即座に下にスライドして雰囲気 + 性別の簡易選択を出す
3. 「この条件で名前を見る」で結果へ

イントロ的な説明文は最小限。診断フォームそのものがファーストビュー。

### 2-3. 何を削るべきか

| 削除 / 縮小する要素 | 理由 |
|---|---|
| 統計ボックス（148 名前候補 etc.） | ユーザーの意思決定に不要 |
| trust-strip（4 つの特徴文） | 冗長。フッター近くに 1 行で十分 |
| auth パネル | MVP では完全に非表示。Supabase 統合時に復活 |
| seo-copy-panel（キーワード段落） | 削除。SEO は個別ページの充実で対応 |
| FAQ（診断フォーム直下の配置） | フッター手前に移動し折りたたみ |
| 擬似ローディング 1.2 秒 | 削除。即時レンダリング |
| meta keywords | 削除 |

---

## 3. 新しい画面構成

### 3-1. トップページ（ `/` ）

```
┌─────────────────────────────────────┐
│ [ロゴ: なまえさがし]         [?FAQ] │  ← ヘッダー: ミニマル
├─────────────────────────────────────┤
│                                     │
│  うちの子の名前、                    │  ← h1: 1 行、短く
│  いっしょに探そう。                  │
│                                     │
│  ── まず、どの子？ ──               │  ← ステップ 1
│                                     │
│  [🐕 犬] [🐈 猫] [🐇 うさぎ]       │  ← 種類選択: 大きめカード
│  [🐹 ハムスター] [🐦 鳥]           │
│                                     │
├ ─ ─ (種類選択後にスライド表示) ─ ─ ┤
│                                     │
│  ── 気になる雰囲気は？ ──           │  ← ステップ 2
│  [かわいい] [かっこいい] [和風]      │
│  [洋風] [ふわふわ] [上品]           │
│  [個性的] [元気] [自然] [神秘的]    │
│                                     │
│  ── 性別 ──                         │  ← ステップ 2 続き
│  [オス] [メス] [どちらでも]          │
│                                     │
│  ── 毛色(任意) ──                   │
│  [白] [黒] [茶] [三毛] [指定なし]   │
│                                     │
│  [ 🔍 名前を探す ]                  │  ← CTA
│                                     │
├─────────────────────────────────────┤
│  結果エリア (後述)                   │
├─────────────────────────────────────┤
│  人気の探し方 → SEO リンク          │  ← 最下部
│  FAQ (折りたたみ)                    │
│  フッター                            │
└─────────────────────────────────────┘
```

### 3-2. 診断導線

**ステップ分割式（アコーディオンではなくスクロール追従型）。**

- **ステップ 1: 種類選択** — ファーストビュー内に収まる。アイコン付きの大きめカード。1 つ選ぶと下のステップ 2 がフェードイン。
- **ステップ 2: 雰囲気 + 性別 + 毛色** — 1 画面にまとめる。雰囲気は複数選択可、性別は単一選択、毛色は任意。
- **ステップ 2 の表示タイミング** — 種類未選択でもスクロールすれば到達できる（非表示にはしない）。ただし種類選択時にスムーズスクロールで誘導。

### 3-3. 結果表示

```
┌─────────────────────────────────────┐
│  あなたの条件にぴったりの名前        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🏆 いちおし                   │  │
│  │  ユキ  ゆき                    │  │
│  │  雪のように白くふわふわ          │  │
│  │  おすすめ度 92%                 │  │
│  │  [コピー] [𝕏 シェア] [LINE]    │  │  ← シェアはここに集約
│  └───────────────────────────────┘  │
│                                     │
│  ── ほかの候補（上位 5 件） ──       │
│  ┌────┐ ┌────┐ ┌────┐             │
│  │ハク │ │モカ │ │ソラ │  ...       │  ← コンパクトカード
│  │はく │ │もか │ │そら │             │
│  │82% │ │78% │ │76% │             │
│  └────┘ └────┘ └────┘             │
│                                     │
│  [ もっと見る (残り 23 件) ]         │  ← 段階開示
│                                     │
│  [ 条件を変えてもう一度 ]            │  ← 診断フォームへ戻る
└─────────────────────────────────────┘
```

**変更点:**
- 初期表示はいちおし 1 件 + 上位 5 件の合計 6 件まで。
- 「もっと見る」で残りを追加表示。
- シェアボタンはいちおし候補に直接配置。
- 結果ゼロの場合: 「条件を少しゆるめると見つかるかも」＋条件の自動緩和ボタン。

### 3-4. 個別 SEO ページ（ `/dog-names`, `/cat-names`, `/rabbit-names` ）

**現状の「リンク集」から「コンテンツ + 埋め込み診断」へ変更。**

構成:
1. h1 + リード文（その動物固有の名付け事情を 3〜4 文で）
2. **人気の名前 TOP10**（names.json から該当種を抽出して静的表示）
3. 名付けのコツ（2〜3 段落の読み物）
4. **「この子の名前を探す」ボタン** → トップページに `?species=犬` で遷移
5. 他の動物ページへのリンク

人気 TOP10 はビルド時に names.json から生成するか、HTML に直書きする。「コンテンツのあるページ」にすることで SEO 価値を上げる。

### 3-5. ログイン導線を残すべきか

**MVP では完全に削除する。**

理由:
- 未設定の auth パネルがエンドユーザーに見えるのは体験を損なう。
- 現状の auth 機能はログイン/ログアウトできるだけで、ログイン後のメリット（お気に入り保存など）がない。
- Supabase 統合のタイミングで、明確なメリットとセットで復活させるべき。

ただし **app.js のコード上は auth ロジックを別ファイル（`auth.js`）に分離して残す。** HTML と CSS だけを削除し、将来 `import` で復活できる状態にする。

---

## 4. UI 方針

### 4-1. トンマナ

**「やさしくて信頼できる、少しだけ遊び心がある」。**

- 全体的にやわらかい印象。角丸は大きめ（16〜24px）。
- テキストは丁寧語で、でも堅すぎない（「探そう」「見つけよう」）。
- アニメーションはチップ選択時のバウンスとカード表示のフェードインだけ。抑制的に。
- グラスモーフィズムはトップ結果カードだけに限定。他はソリッド背景。

### 4-2. 配色

```
--bg:           #f6f3ef       ← あたたかみのあるオフホワイト
--surface:      #ffffff
--surface-sub:  #faf8f5       ← セクション交互色
--text:         #2c2420       ← ダークブラウン（黒ほどきつくない）
--text-sub:     #7a6e64       ← 補足テキスト
--primary:      #d4724a       ← やわらかいテラコッタ（CTA）
--primary-hover:#c0613b
--accent:       #5a8a7a       ← 落ち着いたグリーン（タグ、補助）
--accent-light: #e8f0ec
--highlight:    #f0dfd0       ← 結果ハイライト背景
--border:       #e8e2db
```

coral (#e86b55) → テラコッタ (#d4724a) に変更し、刺激を和らげる。ネイビーはやめてダークブラウン系に統一し、ペットサイトらしいぬくもりを出す。

### 4-3. タイポグラフィ

```
--font-body:    "Hiragino Sans", "Noto Sans JP", sans-serif
--font-accent:  "Rounded Mplus 1c", "Hiragino Maru Gothic ProN", sans-serif  ← 見出し用丸ゴシック

h1:   font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 700;
h2:   font-size: 1.25rem; font-weight: 700;
h3:   font-size: 1rem; font-weight: 700;
body: font-size: 0.9375rem (15px); font-weight: 400; line-height: 1.7;
small/label: font-size: 0.8125rem (13px); font-weight: 600;
```

**font-weight 800 の乱用をやめる。** 見出しは 700、本文は 400、ラベルは 600 の 3 段階。

Google Fonts から `Rounded Mplus 1c` (weight 500, 700) を読み込み、h1 と結果の名前表示にだけ使用する。ファイルサイズを抑えるため `text=` パラメータでサブセット化。

### 4-4. コンポーネント方針

最小構成の再利用コンポーネント:

| 名前 | 用途 | 実装 |
|---|---|---|
| `StepHeading` | 「まず、どの子？」のようなステップ見出し | `<h2>` + 番号バッジ |
| `SpeciesCard` | 種類選択の大きめカード | `<button>` + アイコン + ラベル |
| `Chip` | 雰囲気・性別・毛色の選択チップ | `<button aria-pressed>` |
| `ResultSpotlight` | いちおし候補の大きなカード | `<article>` + シェアボタン内蔵 |
| `NameCard` | 通常の候補カード（コンパクト） | `<article>` + 名前 + 読み + スコア |
| `FAQItem` | FAQ 折りたたみ | `<details><summary>` |

### 4-5. モバイル最適化

- **ブレイクポイント: 640px（1 段階のみ）。** 720px は中途半端。
- 種類選択カードは SP で 2 列、PC で 5 列（1 行に収める）。
- 雰囲気チップは SP で折り返し自由、PC でも折り返し許容。
- 結果グリッドは SP で 1 列、PC で 3 列。
- タッチターゲットは最小 44px × 44px。
- スクロール量を減らすため、PC では診断フォームと結果を横並び 2 カラムにしない。1 カラムのほうが視線の流れが自然。

---

## 5. 実装方針

### 5-1. vanilla JS のまま行くか、Vite + React へ寄せるか

**vanilla JS + Vite (ビルドツールのみ) を推奨する。**

判断理由:
- ページ数は実質 4 ページ。React のコンポーネントモデルが活きるほどの複雑さがない。
- 現状のデプロイ先が Vercel の静的ホスティング。ビルドステップを入れても `vite build` → `dist/` を公開するだけで済む。
- Vite を入れる最大の理由は **CSS/JS のモジュール分割** と **本番ビルドのミニファイ**。React を入れる理由はない。
- Supabase を将来入れるときも、vanilla JS の ESM import で十分。

### 5-2. ディレクトリ構成

```
pet-namer/
├── index.html                  ← メインページ
├── dog-names.html              ← SEO ページ
├── cat-names.html
├── rabbit-names.html
├── src/
│   ├── main.js                 ← エントリーポイント
│   ├── diagnosis.js            ← フィルタリング + スコアリングロジック
│   ├── render.js               ← DOM 生成・更新
│   ├── share.js                ← シェア URL 生成
│   ├── auth.js                 ← Supabase Auth（MVP では import しない）
│   ├── constants.js            ← フィルタカテゴリ定義、スコア重み
│   └── styles/
│       ├── global.css          ← リセット、CSS 変数、基盤
│       ├── layout.css          ← ヘッダー、フッター、セクション
│       ├── components.css      ← チップ、カード、ボタン
│       └── pages.css           ← SEO ページ固有
├── data/
│   └── names.json              ← 名前データ
├── public/
│   ├── ogp.png
│   ├── robots.txt
│   ├── sitemap.xml
│   └── googlef3c0a5eccfee4973.html
├── api/
│   └── public-config.js        ← Vercel serverless（維持）
├── vite.config.js
├── package.json
└── .cursorrules
```

### 5-3. ロジック分割

**`diagnosis.js`（純粋関数のみ、DOM 非依存）:**
```js
export function filterNames(allNames, activeFilters) { ... }
export function scoreMatch(item, activeFilters) { ... }
export function getTopResults(allNames, activeFilters, limit = 6) { ... }
```

**`render.js`（DOM 生成 + 操作）:**
```js
export function createSpeciesCards(options, selectedValue, onSelect) { ... }  // → div.species-grid を返す
export function createChips(items, activeSet, onToggle) { ... }               // → div.chips を返す
export function createSpotlight(item) { ... }                                 // → article.spotlight を返す
export function createNameCard(item) { ... }                                  // → article.name-card を返す
export function renderResults(container, results, visibleCount) { ... }       // → container 内を書き換え
```

**`main.js`（状態管理 + イベント接続）:**
```js
import { getTopResults } from './diagnosis.js';
import { renderResults, renderSpotlight } from './render.js';
// 状態: activeFilters, currentResults
// イベント: チップ click → 状態更新 → 再レンダー
```

---

## 6. データ設計

### 6-1. names.json のスキーマ改善

現行:
```json
{
  "name": "ユキ",
  "reading": "ゆき",
  "meaning": "雪のように白くふわふわ",
  "species": ["犬", "猫", "うさぎ", "ハムスター"],
  "gender": "メス",
  "vibe": ["かわいい", "ふわふわ系", "和風"],
  "color": ["白"]
}
```

提案（MVP はオプショナルフィールドを段階追加）:
```json
{
  "name": "ユキ",
  "reading": "ゆき",
  "meaning": "雪のように白くふわふわ",
  "origin": "和語",
  "syllables": 2,
  "species": ["犬", "猫", "うさぎ", "ハムスター"],
  "gender": "メス",
  "vibe": ["かわいい", "ふわふわ", "和風"],
  "color": ["白"]
}
```

**MVP での変更点:**
- `"ふわふわ系"` → `"ふわふわ"` / `"スイーツ系"` → `"スイーツ"` / `"自然派"` → `"自然"` に正規化（「系」「派」を削る。チップ表示がすっきりする）
- `"レトロ"` は `"和風"` と統合を検討（データ上の区別が曖昧な名前が多い）
- `syllables` と `origin` は後から追加で良い

### 6-2. スコアリングの改善

現行の問題: 基礎点 40 + 加点方式で、条件未指定でも全名前が 40% 以上になる。ユーザーにとって「全部 40% 以上」は情報として無意味。

改善案:
```
スコア = (一致した条件数 / 指定した条件カテゴリ数) × 100
```

- 種類・性別・雰囲気・毛色の 4 カテゴリのうち、ユーザーが指定したカテゴリだけを母数にする。
- 雰囲気は複数一致でボーナス（1 個一致 = 1 カテゴリ分、2 個一致 = 1.3 カテゴリ分）。
- 条件を何も指定しなかった場合はスコア非表示、「すべての候補から」とだけ出す。
- スコアの代わりに「ぴったり / よく合う / 合うかも」の 3 段階ラベルにするのもあり。数値より体験として自然。

### 6-3. Supabase 統合の準備

**MVP で切っておくべき境界:**
1. `auth.js` に認証ロジックを隔離（前述）。
2. `data/names.json` は静的 import のまま。将来 Supabase の DB に移すなら `fetchNames()` 関数を `diagnosis.js` に用意し、データソースを差し替え可能にしておく。
3. 「お気に入り保存」の UI は作らない。ただし `NameCard` コンポーネントに `onFavorite` のフック点だけ設計上確保（ボタンスロットを空けておく）。
4. Supabase の環境変数読み込み（`/api/public-config`）はそのまま維持。

---

## 7. Cursor 実装用の具体仕様

### 7-1. 作業順序

| 順番 | 作業 | 対象ファイル |
|---|---|---|
| 1 | Vite 導入 + package.json 作成 | `package.json`, `vite.config.js` |
| 2 | CSS を 4 ファイルに分割・リライト | `src/styles/*.css` |
| 3 | `diagnosis.js` を app.js から抽出 | `src/diagnosis.js`, `src/constants.js` |
| 4 | `render.js` を新規作成 | `src/render.js` |
| 5 | `share.js` を新規作成 | `src/share.js` |
| 6 | `main.js` を新規作成（状態管理 + 接続） | `src/main.js` |
| 7 | `index.html` をリライト | `index.html` |
| 8 | SEO ページをリライト | `dog-names.html`, `cat-names.html`, `rabbit-names.html` |
| 9 | `auth.js` を分離・HTML から auth パネル削除 | `src/auth.js` |
| 10 | 動作確認 + 微調整 | 全体 |

### 7-2. ファイルごとの役割

**`vite.config.js`:**
```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dog: resolve(__dirname, 'dog-names.html'),
        cat: resolve(__dirname, 'cat-names.html'),
        rabbit: resolve(__dirname, 'rabbit-names.html'),
      },
    },
  },
});
```

**`src/constants.js`:**
```js
export const SPECIES_OPTIONS = [
  { value: '犬', label: '犬', icon: '🐕' },
  { value: '猫', label: '猫', icon: '🐈' },
  { value: 'うさぎ', label: 'うさぎ', icon: '🐇' },
  { value: 'ハムスター', label: 'ハムスター', icon: '🐹' },
  { value: '鳥', label: '鳥', icon: '🐦' },
];

export const VIBE_OPTIONS = [
  'かわいい', 'かっこいい', '和風', '洋風', 'ふわふわ',
  '上品', '個性的', '元気', '自然', '神秘的',
];

export const GENDER_OPTIONS = [
  { value: 'オス', label: 'オス' },
  { value: 'メス', label: 'メス' },
  { value: 'どちらでも', label: 'どちらでも' },
];

export const COLOR_OPTIONS = ['白', '黒', '茶色', '三毛'];

export const SCORE_LABELS = [
  { min: 80, label: 'ぴったり', class: 'score--perfect' },
  { min: 55, label: 'よく合う', class: 'score--good' },
  { min: 0, label: '合うかも', class: 'score--maybe' },
];

export const INITIAL_RESULT_COUNT = 6;
export const LOAD_MORE_COUNT = 12;
```

**`src/diagnosis.js`:**
- `matchesFilters(item, activeFilters)` — 現行ロジック踏襲
- `scoreMatch(item, activeFilters)` — 新スコアリング
- `getScoreLabel(score)` — スコアからラベルへの変換
- `getResults(allNames, activeFilters)` — フィルタ → スコア → ソート
- `getPopularNames(allNames, species, limit)` — SEO ページ用

**`src/render.js`:**
- `renderSpeciesStep(container, options, selected, onSelect)` — 種類カード生成
- `renderFilterStep(container, vibes, genders, colors, activeFilters, onChange)` — ステップ 2 生成
- `renderSpotlight(container, item)` — いちおし表示
- `renderNameGrid(container, items, visibleCount)` — カードグリッド
- `renderLoadMore(container, totalCount, visibleCount, onLoadMore)` — もっと見る

**`src/share.js`:**
- `getShareTextForX(name, reading)` — X 用テキスト
- `getShareURLForX(name, reading, pageURL)` — X intent URL
- `getShareURLForLINE(text, pageURL)` — LINE シェア URL
- `copyToClipboard(text)` — クリップボードコピー

**`src/main.js`:**
- 状態オブジェクト `{ species: Set, gender: Set, vibe: Set, color: Set, visibleCount: 6 }` を管理
- URL パラメータからプリセットを復元
- 各 render 関数を呼び出して画面を構築
- 「名前を探す」ボタンで結果を表示
- 「もっと見る」で `visibleCount` を増やして再レンダー

### 7-3. MVP で必要な要素

- [x] 種類・雰囲気・性別・毛色のフィルタ UI
- [x] フィルタリング + スコアリング
- [x] いちおし候補 + 上位候補カード表示（初期 6 件）
- [x] 「もっと見る」ボタン
- [x] 名前コピー機能
- [x] X / LINE シェアボタン（いちおし候補に配置）
- [x] URL パラメータによるプリセット
- [x] モバイル対応レイアウト
- [x] SEO ページ 3 ページのリライト
- [x] OGP メタタグ
- [x] Vercel デプロイ対応（vite build → dist）

### 7-4. 後回しでいい要素

- Supabase Auth 統合
- お気に入り保存
- 名前データの Supabase DB 移行
- Sentry 統合
- Cloudflare Turnstile
- `syllables` / `origin` フィールドの追加
- 名前の「詳細ページ」（1 名前 1 ページ）
- AdSense 広告枠
- ダークモード
- PWA 対応
- アクセス解析（GA4 は早めに入れてもいいが MVP 必須ではない）

---

## 8. 実装優先順位

| 優先度 | 項目 | 対応プロンプト | 理由 |
|---|---|---|---|
| **HIGH** | Vite 導入 + JS 分割 | プロンプト 1, 3 | 以降の全作業の土台 |
| **HIGH** | index.html リライト（新画面構成） | プロンプト 4 | 体験の中核 |
| **HIGH** | CSS リライト（新配色 + コンポーネント化） | プロンプト 2 | 見た目の印象を決定 |
| **HIGH** | diagnosis.js のスコアリング改善 | プロンプト 3 | 結果の質に直結 |
| **HIGH** | 結果表示の段階開示（6 件 + もっと見る） | プロンプト 3 | UX の根幹 |
| **HIGH** | モバイル対応の確認・修正 | プロンプト 2 | ユーザーの大半がスマホ |
| **MEDIUM** | SEO ページのリライト（TOP10 + 読み物） | プロンプト 6 | SEO 効果向上 |
| **MEDIUM** | names.json の vibe 正規化 | プロンプト 5 | データ品質 |
| **MEDIUM** | シェアボタンの配置最適化 | プロンプト 3 | 拡散性向上 |
| **MEDIUM** | OGP 画像の更新 | — (手動) | 新デザインに合わせる |
| **MEDIUM** | FAQ のフッター移動 | プロンプト 4 | 情報設計の整理 |
| **LOW** | auth.js の分離保存 | プロンプト 3 | 将来対応の準備 |
| **LOW** | Sentry / Turnstile の再統合 | — (後日) | 運用フェーズ |
| **LOW** | GA4 導入 | — (後日) | MVP 後で十分 |
| **LOW** | 名前データの拡充（200 → 300 件） | — (後日) | コンテンツ強化 |

---

## 9. Cursor に投げる実装プロンプト

以下のプロンプトを Cursor に順番に投げることを想定。各プロンプトは独立して実行可能。

---

### プロンプト 1: Vite 導入 + プロジェクト構造

```
## タスク
pet-namer プロジェクトに Vite を導入し、JS/CSS のモジュール分割基盤を作る。

## 前提
- 現在は index.html + app.js + style.css のフラット構成
- Vercel にデプロイする静的サイト
- React は使わない。vanilla JS + Vite（ビルドツールのみ）

## やること
1. `npm init -y` で package.json を作成
2. `npm install -D vite` をインストール
3. 以下のファイルを作成:
   - `vite.config.js`: マルチページ対応（index.html, dog-names.html, cat-names.html, rabbit-names.html を input に指定）。outDir は `dist`。
   - `src/main.js`: 空のエントリーポイント（`console.log('pet-namer loaded');` だけ入れる）
   - `src/styles/global.css`: 空ファイル
4. `index.html` の `<script src="app.js">` を `<script type="module" src="/src/main.js">` に変更
5. `index.html` の `<link rel="stylesheet" href="style.css">` を `<link rel="stylesheet" href="/src/styles/global.css">` に変更（global.css の中で style.css の内容はまだ移さなくてよい）
6. package.json に以下のスクリプトを追加:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
   ```
7. vercel.json を更新: `"buildCommand": "npm run build"`, `"outputDirectory": "dist"` を追加
8. `npm run dev` で起動確認できる状態にする

## 完成条件
- `npm run dev` でローカル開発サーバーが起動する
- `npm run build` で dist/ に HTML + バンドル済み JS/CSS が生成される
- 既存の app.js と style.css はまだ残っている（次のステップで移行する）
```

---

### プロンプト 2: CSS リライト

```
## タスク
style.css を 4 ファイルに分割し、新しい配色・タイポグラフィで書き直す。

## 対象ファイル
- 削除: `style.css`（内容を移行後に削除）
- 作成: `src/styles/global.css`, `src/styles/layout.css`, `src/styles/components.css`, `src/styles/pages.css`

## 配色（CSS 変数）
```css
:root {
  --bg: #f6f3ef;
  --surface: #ffffff;
  --surface-sub: #faf8f5;
  --text: #2c2420;
  --text-sub: #7a6e64;
  --primary: #d4724a;
  --primary-hover: #c0613b;
  --primary-light: rgba(212, 114, 74, 0.12);
  --accent: #5a8a7a;
  --accent-light: #e8f0ec;
  --highlight: #f0dfd0;
  --border: #e8e2db;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;
  --shadow-sm: 0 2px 8px rgba(44, 36, 32, 0.06);
  --shadow-md: 0 8px 24px rgba(44, 36, 32, 0.08);
  --shadow-lg: 0 16px 48px rgba(44, 36, 32, 0.12);
  --font-body: "Hiragino Sans", "Noto Sans JP", sans-serif;
  --font-accent: "Rounded Mplus 1c", "Hiragino Maru Gothic ProN", var(--font-body);
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## フォント読み込み
index.html の <head> に以下を追加:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rounded+Mplus+1c:wght@500;700&display=swap" rel="stylesheet">
```

## global.css の内容
- box-sizing リセット
- CSS 変数定義（上記）
- body: font-family, color, background
- html: scroll-behavior: smooth
- button リセット
- フォーカスの :focus-visible スタイル
- aurora 背景は削除（代わりに body の background を var(--bg) のソリッドに）

## layout.css の内容
- .page-header: sticky, background: var(--surface), border-bottom: 1px solid var(--border), padding: 16px 0
- .page-header__inner: max-width: 720px, margin: 0 auto, padding: 0 20px
- .page-header__logo: font-family: var(--font-accent), font-size: 1.25rem, font-weight: 700, color: var(--text), text-decoration: none
- .page-main: max-width: 720px, margin: 0 auto, padding: 32px 20px
- .page-footer: max-width: 720px, margin: 0 auto, padding: 40px 20px, text-align: center, border-top: 1px solid var(--border)
- .section + .section: margin-top: 48px

## components.css の内容
### チップ (.chip)
- padding: 10px 20px, border-radius: var(--radius-pill), border: 1.5px solid var(--border)
- background: var(--surface), color: var(--text), font-weight: 600, cursor: pointer
- transition: all 0.2s var(--transition-bounce)
- &:hover: border-color: var(--primary), transform: translateY(-1px)
- &.is-active: background: var(--primary), border-color: var(--primary), color: white

### 種類カード (.species-card)
- padding: 20px, border-radius: var(--radius-lg), border: 2px solid var(--border)
- background: var(--surface), text-align: center, cursor: pointer
- .species-card__icon: font-size: 2rem, display: block, margin-bottom: 8px
- .species-card__label: font-weight: 700, font-size: 0.9375rem
- &:hover: border-color: var(--primary), box-shadow: var(--shadow-sm)
- &.is-active: border-color: var(--primary), background: var(--primary-light)

### いちおしカード (.spotlight)
- padding: 28px, border-radius: var(--radius-lg), background: var(--text), color: white
- .spotlight__name: font-family: var(--font-accent), font-size: clamp(2rem, 5vw, 3rem), font-weight: 700
- .spotlight__reading: color: rgba(255,255,255,0.7), margin-top: 4px
- .spotlight__meaning: color: rgba(255,255,255,0.7), margin-top: 12px
- .spotlight__score: display: inline-block, padding: 6px 12px, border-radius: var(--radius-pill), background: rgba(255,255,255,0.15), font-weight: 700, font-size: 0.8125rem, margin-top: 12px
- .spotlight__actions: display: flex, gap: 8px, margin-top: 16px

### 名前カード (.name-card)
- padding: 20px, border-radius: var(--radius-md), border: 1px solid var(--border), background: var(--surface)
- transition: box-shadow 0.2s ease, transform 0.2s var(--transition-bounce)
- &:hover: box-shadow: var(--shadow-md), transform: translateY(-2px)
- .name-card__name: font-family: var(--font-accent), font-size: 1.5rem, font-weight: 700
- .name-card__reading: color: var(--text-sub), font-size: 0.8125rem
- .name-card__score: font-size: 0.75rem, font-weight: 700, color: var(--accent)

### CTA ボタン (.btn-primary)
- width: 100%, padding: 16px, border: none, border-radius: var(--radius-pill)
- background: var(--primary), color: white, font-weight: 700, font-size: 1rem, cursor: pointer
- box-shadow: 0 4px 16px rgba(212, 114, 74, 0.3)
- &:hover: background: var(--primary-hover), transform: translateY(-2px)

### シェアボタン (.share-btn)
- display: inline-flex, align-items: center, gap: 6px, padding: 10px 16px
- border-radius: var(--radius-pill), font-weight: 700, font-size: 0.8125rem
- &--x: background: #000, color: white
- &--line: background: #06c755, color: white
- &--copy: background: var(--surface-sub), color: var(--text), border: 1px solid var(--border)

### 結果グリッド (.result-grid)
- display: grid, grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)), gap: 12px

### もっと見るボタン (.btn-load-more)
- width: 100%, padding: 14px, border: 1.5px solid var(--border), border-radius: var(--radius-pill)
- background: transparent, color: var(--text-sub), font-weight: 600, cursor: pointer
- &:hover: border-color: var(--primary), color: var(--primary)

## pages.css の内容
- SEO ページ用のスタイル（.seo-hero, .seo-ranking, .seo-tips）
- .seo-ranking: カウンターリスト
- .seo-tips: 読みやすい段落スタイル

## レスポンシブ（640px）
@media (max-width: 640px) で:
- .species-grid: grid-template-columns: repeat(2, 1fr)（PC は repeat(5, 1fr)）
- .result-grid: grid-template-columns: 1fr
- .spotlight__name: font-size: 1.75rem

## 完成条件
- style.css が削除され、4 つの CSS ファイルに分割されている
- global.css が他 3 ファイルを @import している
- 新配色が適用されている
- aurora 背景アニメーションが削除されている
- グラスモーフィズム（backdrop-filter）はスポットライトカードのみ（他は不使用）
- font-weight: 800 が一切使われていない
```

---

### プロンプト 3: JS ロジック分割

```
## タスク
app.js を 5 つのモジュールに分割する。

## 対象ファイル
- 削除: `app.js`
- 作成: `src/main.js`, `src/diagnosis.js`, `src/render.js`, `src/share.js`, `src/constants.js`
- 変更なし: `src/auth.js`（app.js の認証関連コード 187〜341 行を移動するが、main.js からは import しない）

## src/constants.js
以下を export:
- SPECIES_OPTIONS: [{ value, label, icon }] の配列（犬🐕, 猫🐈, うさぎ🐇, ハムスター🐹, 鳥🐦）
- VIBE_OPTIONS: string[] = ['かわいい', 'かっこいい', '和風', '洋風', 'ふわふわ', '上品', '個性的', '元気', '自然', '神秘的']
  ※「ふわふわ系」→「ふわふわ」、「スイーツ系」→削除（「かわいい」に統合）、「自然派」→「自然」、「レトロ」→削除（「和風」に統合）
- GENDER_OPTIONS: [{ value, label }]
- COLOR_OPTIONS: string[]
- SCORE_LABELS: [{ min, label }] = [{ min: 80, label: 'ぴったり' }, { min: 55, label: 'よく合う' }, { min: 0, label: '合うかも' }]
- INITIAL_RESULT_COUNT: 6
- LOAD_MORE_COUNT: 12

## src/diagnosis.js
以下を export（すべて純粋関数、DOM 非依存）:

### matchesFilters(item, activeFilters)
- 現行 app.js の matchesFilters ロジックを移植
- カテゴリごとに OR、カテゴリ間で AND
- gender の「どちらでも」特例、color の「なし」特例を維持

### scoreMatch(item, activeFilters)
- 新ロジック:
  - 指定されたカテゴリ数を数える（activeCategories）
  - 各カテゴリで一致度を計算（0〜1）
    - species: item.species のいずれかが selected に含まれれば 1, そうでなければ 0
    - gender: 完全一致 or どちらでも → 1, 不一致 → 0
    - vibe: (一致した vibe 数 / 選択した vibe 数) で 0〜1（2個以上一致ならボーナス ×1.15、上限 1）
    - color: item.color に「なし」があれば 0.5, 一致あれば 1, なければ 0
  - スコア = (各カテゴリ一致度の合計 / activeCategories) × 100
  - activeCategories が 0（何も選ばなかった）なら score = null（スコア非表示）
  - 小数点以下切り捨て、上限 99
- return { score, label } （label は SCORE_LABELS から）

### getResults(allNames, activeFilters)
- allNames を matchesFilters でフィルタ
- scoreMatch でスコア付与
- score 降順 → 名前の辞書順でソート
- return { items, total }

### getPopularNames(allNames, species, limit = 10)
- 指定 species に属する名前を抽出
- vibe 配列の長さ（≒汎用性）降順で並び替え
- 上位 limit 件を返す

## src/render.js
以下を export（DOM 操作のみ）:

### createSpeciesCards(options, selectedValue, onSelect)
- div.species-grid を返す
- 各 option から button.species-card を生成
- onSelect(value) をクリックイベントに接続
- selectedValue と一致するカードに .is-active を付与

### createChips(items, activeSet, onToggle)
- div.chips を返す
- 各 item から button.chip を生成
- onToggle(value) をクリックイベントに接続
- activeSet に含まれるチップに .is-active を付与

### createSpotlight(item)
- article.spotlight を返す
- 名前、読み、意味、スコアラベル、シェアボタン（X / LINE / コピー）を含む
- シェアボタンのクリックイベントは share.js の関数を呼ぶ

### createNameCard(item)
- article.name-card を返す
- 名前、読み、スコアラベルを含む
- コンパクト表示（meaning はホバーで表示 or 省略）

### renderResults(container, results, visibleCount)
- container の中身をクリア
- results.items が 0 件の場合: 「条件に合う名前が見つかりませんでした。条件を少し広げてみてください。」を表示
- results.items の先頭 1 件を createSpotlight で、残り（2〜visibleCount）を createNameCard で生成
- visibleCount < results.total なら「もっと見る（残り N 件）」ボタンを末尾に追加

## src/share.js
以下を export:

### getXShareURL(name, reading)
- テキスト: `うちの子の名前候補は「${name}（${reading}）」！ #ペットなまえ診断`
- URL: window.location.href
- return twitter intent URL

### getLINEShareURL(name, reading)
- return LINE share URL

### copyNameToClipboard(name)
- navigator.clipboard.writeText(name)
- return Promise<void>

## src/main.js
- import { getResults } from './diagnosis.js'
- import { createSpeciesCards, createChips, renderResults } from './render.js'
- import { SPECIES_OPTIONS, VIBE_OPTIONS, GENDER_OPTIONS, COLOR_OPTIONS, INITIAL_RESULT_COUNT, LOAD_MORE_COUNT } from './constants.js'
- import './styles/global.css'

### 状態
```js
const state = {
  species: new Set(),
  gender: new Set(),
  vibe: new Set(),
  color: new Set(),
  visibleCount: INITIAL_RESULT_COUNT,
  results: null,
};
```

### 初期化フロー
1. names.json を fetch
2. URL パラメータからプリセットを state に適用
3. 診断フォーム（種類カード、チップ群）を render
4. 「名前を探す」ボタンのクリックで runDiagnosis()
5. プリセットがあれば自動で runDiagnosis()

### runDiagnosis()
1. state から activeFilters を組み立て
2. getResults(allNames, activeFilters) を呼ぶ
3. state.results に結果を保存、state.visibleCount をリセット
4. renderResults(resultContainer, state.results, state.visibleCount) を呼ぶ
5. 結果エリアへスムーズスクロール

### 「もっと見る」
- state.visibleCount += LOAD_MORE_COUNT
- renderResults を再呼出

## 完成条件
- app.js が削除され、5 つのモジュールに分かれている
- `npm run dev` で正常動作する
- 診断フォームで条件を選んで「名前を探す」を押すと、結果が表示される
- 結果はいちおし 1 件 + 上位 5 件の計 6 件が初期表示
- 「もっと見る」で追加表示される
- いちおし候補にシェアボタン（X / LINE / コピー）がある
- auth パネルは HTML 上に存在しない
- 擬似ローディング（setTimeout 1.2 秒）は削除されている
```

---

### プロンプト 4: index.html リライト

```
## タスク
index.html を新しい画面構成でリライトする。

## 対象ファイル
- 変更: `index.html`

## 新しい HTML 構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>なまえさがし | ペットの名前診断 - 犬・猫・うさぎの名前候補を無料で提案</title>
  <meta name="description" content="犬・猫・うさぎなどペットの名前を無料で診断。種類・性別・雰囲気・毛色から、あなたのペットにぴったりの名前候補を提案します。">
  <link rel="canonical" href="https://pet-namer.vercel.app/">
  <!-- OGP -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="なまえさがし | ペットの名前診断">
  <meta property="og:description" content="犬・猫・うさぎなどペットの名前候補を無料で提案。">
  <meta property="og:url" content="https://pet-namer.vercel.app/">
  <meta property="og:image" content="https://pet-namer.vercel.app/ogp.png">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <!-- JSON-LD: WebApplication のみ残す（FAQPage は FAQ セクションが目立たなくなるので削除） -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "なまえさがし",
    "url": "https://pet-namer.vercel.app/",
    "description": "ペットの名前を無料で診断できるツール",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
    "inLanguage": "ja"
  }
  </script>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rounded+Mplus+1c:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles/global.css">
</head>
<body>
  <header class="page-header">
    <div class="page-header__inner">
      <a href="/" class="page-header__logo">なまえさがし</a>
      <button type="button" class="page-header__faq-link" id="faqToggle">よくある質問</button>
    </div>
  </header>

  <main class="page-main">
    <!-- ステップ 1: 種類選択 -->
    <section class="section" id="stepSpecies">
      <h1 class="hero-title">うちの子の名前、<br>いっしょに探そう。</h1>
      <p class="hero-lead">種類・雰囲気・性別から、ぴったりの名前候補を提案します。</p>
      <h2 class="step-heading">まず、どの子？</h2>
      <div class="species-grid" id="speciesGrid">
        <!-- JS で生成 -->
      </div>
    </section>

    <!-- ステップ 2: 詳細条件 -->
    <section class="section" id="stepFilters">
      <div class="filter-group">
        <h2 class="step-heading">気になる雰囲気は？</h2>
        <p class="step-hint">複数えらべます。迷ったら少なめから。</p>
        <div class="chips" id="vibeChips"><!-- JS --></div>
      </div>
      <div class="filter-group">
        <h2 class="step-heading">性別</h2>
        <div class="chips" id="genderChips"><!-- JS --></div>
      </div>
      <div class="filter-group">
        <h2 class="step-heading">毛色 <span class="optional-badge">任意</span></h2>
        <div class="chips" id="colorChips"><!-- JS --></div>
      </div>
      <div class="cta-area">
        <p class="selection-summary" id="selectionSummary"></p>
        <button type="button" class="btn-primary" id="btnDiagnose">名前を探す</button>
      </div>
    </section>

    <!-- 結果エリア -->
    <section class="section" id="resultSection" hidden>
      <div id="resultContainer"><!-- JS --></div>
      <div class="result-actions">
        <button type="button" class="btn-secondary" id="btnRetry">条件を変えてもう一度</button>
      </div>
    </section>

    <!-- SEO リンク -->
    <section class="section section--subtle">
      <h2 class="section-heading">人気の探し方</h2>
      <div class="seo-link-grid">
        <a href="/dog-names" class="seo-link-card">
          <span class="seo-link-card__icon">🐕</span>
          <span class="seo-link-card__label">犬の名前診断</span>
        </a>
        <a href="/cat-names" class="seo-link-card">
          <span class="seo-link-card__icon">🐈</span>
          <span class="seo-link-card__label">猫の名前診断</span>
        </a>
        <a href="/rabbit-names" class="seo-link-card">
          <span class="seo-link-card__icon">🐇</span>
          <span class="seo-link-card__label">うさぎの名前診断</span>
        </a>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" id="faqSection">
      <h2 class="section-heading">よくある質問</h2>
      <div class="faq-list">
        <details class="faq-item">
          <summary>利用は無料ですか？</summary>
          <p>はい、すべての機能を無料で利用できます。会員登録も不要です。</p>
        </details>
        <details class="faq-item">
          <summary>「おすすめ度」はどう決まりますか？</summary>
          <p>選んだ条件（種類・性別・雰囲気・毛色）と名前データの一致度から算出しています。あくまで目安としてお使いください。</p>
        </details>
        <details class="faq-item">
          <summary>条件を選ばなくても使えますか？</summary>
          <p>はい。何も選ばずに「名前を探す」を押すと、すべての候補が表示されます。</p>
        </details>
        <details class="faq-item">
          <summary>データはどこかに保存されますか？</summary>
          <p>いいえ。すべてブラウザ内で処理され、サーバーには送信されません。</p>
        </details>
      </div>
    </section>
  </main>

  <footer class="page-footer">
    <p class="footer-note">なまえさがし — 個人開発のペット名前診断ツール</p>
    <nav class="footer-links">
      <a href="/">トップ</a>
      <a href="/dog-names">犬の名前</a>
      <a href="/cat-names">猫の名前</a>
      <a href="/rabbit-names">うさぎの名前</a>
    </nav>
    <p class="footer-copy">&copy; 2026</p>
  </footer>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

## 削除する要素
- 統計ボックス（148名前候補 etc.）
- trust-strip
- auth パネル全体
- seo-copy-panel（キーワード段落）
- meta keywords
- FAQPage の JSON-LD
- タグライン「まっすぐな条件入力と〜」

## 変更点
- サイト名を「ペット名前診断」→「なまえさがし」に変更（柔らかい印象）
- h1 を「名前探しはシンプルに〜」→「うちの子の名前、いっしょに探そう。」に変更
- FAQ を最下部に移動
- 結果セクションに hidden 属性を付与（初期非表示）
- 「決定」→「名前を探す」にボタンラベル変更
- 「条件を変えてもう一度」ボタンを追加（診断フォームへのスムーズスクロール）

## 完成条件
- auth パネルが HTML 上に存在しない
- seo-copy-panel が存在しない
- 統計ボックスが存在しない
- h1 が「うちの子の名前、いっしょに探そう。」になっている
- 結果セクションが初期非表示で、JS から操作される前提になっている
```

---

### プロンプト 5: names.json の vibe 正規化

```
## タスク
data/names.json 内の vibe フィールドを正規化する。

## 変更ルール
1. 「ふわふわ系」→「ふわふわ」（全エントリ）
2. 「スイーツ系」→「かわいい」に統合（「スイーツ系」を削除し、既に「かわいい」がなければ追加）
3. 「自然派」→「自然」（全エントリ）
4. 「レトロ」→「和風」に統合（「レトロ」を削除し、既に「和風」がなければ追加）
5. 各エントリの vibe 配列から重複を除去
6. vibe 配列をアルファベット順（日本語の Unicode 順）にソート

## 対象ファイル
- `data/names.json`

## 完成条件
- 「ふわふわ系」「スイーツ系」「自然派」「レトロ」が names.json 内に一切存在しない
- 各エントリの vibe に重複がない
- JSON としてパース可能（構文エラーなし）
```

---

### プロンプト 6: SEO ページのリライト

```
## タスク
dog-names.html, cat-names.html, rabbit-names.html を、コンテンツのあるページにリライトする。

## 共通構成
各ページは以下の構成にする:
1. ヘッダー（トップと同じ .page-header）
2. h1 + リード文（2〜3 文）
3. 「人気の名前 TOP10」セクション — names.json からその種類の名前を手動で 10 件ピックアップし、ol リストで掲載（名前、読み、ひとこと説明）
4. 「名付けのコツ」セクション — 3 段落の読み物（その動物固有の話題）
5. CTA: 「○○の名前を探す」ボタン → `/?species=○○` へリンク
6. 他の動物ページへのリンク
7. フッター（トップと同じ）

## dog-names.html の具体内容
- h1: 犬の名前を探す — 人気の候補と名付けのコツ
- リード: 犬の名前は、呼びやすさと響きの良さが大切。短くてはっきりした音の名前が、しつけの場面でも伝わりやすいと言われています。
- TOP10: ソラ、レオ、ハク、コタロウ、モカ、リク、フク、ムギ、ハナ、マロン（names.json の犬対応名から選定）
- 名付けのコツ:
  - 段落1: 2〜3 音節の名前が犬には人気。「レオ」「ソラ」のように母音で終わる名前は、呼んだときに響きやすく、犬も聞き取りやすい傾向があります。
  - 段落2: 家族全員が自然に呼べるかも大事なポイント。お子さんがいる家庭では、小さな子でも発音しやすい名前を選ぶと、犬との絆が深まりやすくなります。
  - 段落3: 「和風」「洋風」など雰囲気の軸を先に決めると、候補が絞りやすくなります。迷ったらまず診断で気になる条件を試してみてください。
- CTA: 犬の名前を診断する → /?species=犬

## cat-names.html
- h1: 猫の名前を探す — 人気の候補と名付けのコツ
- TOP10: ソラ、ユキ、ルナ、モカ、ハナ、キナコ、ミケ、リン、アズキ、シジミ
- 名付け段落: 猫は自分の名前の音を認識しているという研究もある。高めの母音（「い」「え」）を含む名前は猫の注意を引きやすいと言われている。2 音の名前が呼びかけやすく人気。

## rabbit-names.html
- h1: うさぎの名前を探す — 人気の候補と名付けのコツ
- TOP10: ユキ、モフ、ソラ、モカ、ハナ、キナコ、ミルク、ダイフク、ココ、フワリ
- 名付け段落: うさぎはやわらかい響きの名前が似合う。「ふわふわ」「かわいい」系の雰囲気から選ぶ人が多い。食べ物由来の名前（キナコ、ダイフク、ミルク）も人気。

## スタイル
- 各ページも /src/styles/global.css を読み込む
- Google Fonts の link タグもヘッダーに含める
- SEO ページ固有のスタイルは pages.css に含まれている前提

## 完成条件
- 各ページに人気 TOP10 リストが存在する
- 各ページに 3 段落の読み物がある
- 診断へのCTAリンクがある
- ヘッダーとフッターがトップと統一されている
- meta description が各動物に固有の内容になっている
```

---

以上で、分析 → 設計 → 仕様 → Cursor プロンプトまでを網羅した。
