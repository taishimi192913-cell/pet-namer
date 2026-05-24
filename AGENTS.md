# AGENTS.md — Sippomi 単一真実源

OpenHands / opencode / Codex 共通の行動規範・デザイン仕様。
**全エージェントはこのファイルのみを参照すればよい。** 旧 DESIGN.md は本ファイルに統合され削除済み。

> 本ガイドは Awwwards審査基準 / Apple HIG / Refactoring UI / WCAG 2.2 / Core Web Vitals 等の実務基準に基づく。
> 参照ルール: `rules/web-development.md` / `rules/ios-development.md`

---

## 第1章 AI缶の排除 — 絶対禁止事項

これらを破ったコードは即座に却下する。生成時に常に以下の禁止リストを遵守すること。

### デザイン禁止事項（Web/iOS共通）

| # | 禁止 | 理由 | 正解 |
|---|------|------|------|
| 1 | **Material Design の使用** | AIのデフォルト着色。Google色(#4285F4)、Robotoフォント、リップルエフェクト、Material Icon | プロジェクト固有のデザインシステム（本ファイル §A）を使う |
| 2 | **純黒 `#000000` / 純白 `#FFFFFF`** | 眼精疲労・ハレーションの原因 | `#1a1a2e`〜`#222` / オフホワイト `#fafafa` または `#FDF8F4` |
| 3 | **`font-size` 絶対値直指定** | デバイス間で不適切 / Dynamic Type非対応 | Web: `clamp()` / React Native: 相対値またはデザイントークン |
| 4 | **`border: 1px solid #ccc`** | 安っぽい。情報過多 | シャドウ＋余白で区切りを表現 |
| 5 | **10種類以上のフォントサイズ** | ノイズ。階層が不明瞭 | 5段階に制限（§A 参照） |
| 6 | **グレーアウトした無効ボタン** | 無効か低優先度か判別不能 | `opacity: 0.4` で表現 |
| 7 | **ランダムな余白値** | 一貫性欠如 | Web: 4px倍数 / iOS: 8pt倍数 |
| 8 | **色だけで情報を伝達** | 色覚障碍者に不可視 | アイコン・ラベル・下線を併用 |
| 9 | **絵文字の使用** | デザインの質を落とす | テキスト＋アイコンで表現 |

### コード禁止事項

| # | 禁止 | 正解 |
|---|------|------|
| 10 | **`any` 型 / `AnyView` の使用** | 適切な型定義 / `@ViewBuilder` または `some View` |
| 11 | **APIキー・シークレットのハードコード** | 環境変数 (.env) に格納 |
| 12 | **XSS未対策（innerHTML, dangerouslySetInnerHTML）** | DOMPurify でサニタイズ |
| 13 | **空状態・エラー状態・ローディング状態の見過ごし** | 全データ表示コンポーネントに loading/empty/error の3状態を実装 |
| 14 | **コメントを書かない / 自明な行まで書く** | 非自明なビジネスロジック・ワークアラウンドのみ記述 |
| 15 | **既存コードパターンの無視（新パターンの勝手導入）** | 既存の命名・構成・スタイルを必ず踏襲 |

---

## 第2章 エージェント動作ルール

### 作業プロセス

```
1. 深堀り分析: タスクの影響範囲・既存コード・依存関係を理解
2. 計画: 実装方針をアウトライン化（新規ファイル・変更ファイル・削除ファイル）
3. 実装: 本ガイドの全ルールに従い1ステップずつ
4. 検証: 実装後は必ず検証（テスト実行・lint・ビルド確認）
5. 完了報告: 変更ファイル一覧・検証結果を報告
```

### コードスタイル

```yaml
命名規則:
  変数/関数: camelCase（isLoading, hasError, handleClick）
  コンポーネント/型: PascalCase
  ディレクトリ: kebab-case（auth-wizard, user-profile）
  イベントハンドラ: handle プレフィックス（handleSubmit, handleDelete）
  真偽値: 動詞プレフィックス（isLoading, hasError, canSubmit, shouldRender）

ファイル構成:
  [1] エクスポートされるコンポーネント本体
  [2] サブコンポーネント
  [3] ヘルパー関数
  [4] 静的データ
  [5] 型定義
```

### エラーハンドリング

- アーリーリターン（guard clause）を先に、ハッピーパスを最後に記述
- データ取得コンポーネントは常に loading / empty / error の3状態を実装
- エラー状態には再試行ボタンを付ける
- try-catch を適切に使用、エラーメッセージはユーザー向けに具体化

### セキュリティ（必須）

- ユーザー入力は必ずサニタイズ
- HTML レンダリングには DOMPurify を使用
- 環境変数でシークレット管理
- SQLインジェクション・XSS・コマンドインジェクションを絶対に書かない

---

## 第3章 Web開発 即参照シート

> 詳細: `rules/web-development.md`

### 数値基準早見表

| 項目 | 基準値 |
|------|--------|
| フォント段階 | 5段階（§A タイポグラフィ参照） |
| スペーシング | 4px倍数体系（4/8/16/24/32/48/64/96/128） |
| セクション間 | 80-128px |
| カード内padding | 24-32px |
| 本文 line-height | 1.5-1.7 |
| 見出し line-height | 1.1-1.3 |
| 行長制限 | `max-width: 65ch` |
| 角丸カード | 8-12px |
| 角丸ボタン | 6-8px |
| 最小タップ領域 | 24×24px（推奨44×44px） |
| LCP | ≤2.5秒 |
| INP | ≤200ms |
| CLS | ≤0.1 |
| コントラスト比（通常文字） | ≥4.5:1 |
| コントラスト比（大文字/UI） | ≥3:1 |

### カラーパレット構築ルール

```css
/* HSLで管理。Hex直指定禁止 */
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
/* グレーは必ず青み(slate)または暖かみ(warm)をつける。純粋な #808080 禁止 */
```

### シャドウシステム

```css
/* 光源: 左上想定 → 影は右下 */
--shadow-xs: 0 1px 2px  rgb(0 0 0 / 0.06);
--shadow-sm: 0 1px 3px  rgb(0 0 0 / 0.08);
--shadow-md: 0 4px 12px rgb(0 0 0 / 0.12);
--shadow-lg: 0 8px 32px rgb(0 0 0 / 0.16);
--shadow-xl: 0 16px 48px rgb(0 0 0 / 0.20);
/* 枠線の代わりに box-shadow で区切りを表現すること */
```

### 必須CSSテクニック

```css
/* 流体タイポグラフィ */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);

/* ブレークポイントフリーグリッド */
grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));

/* スクロール駆動アニメーション（JS不要） */
animation: fade-in linear;
animation-timeline: view();

/* Container Queries */
container-type: inline-size;
@container (min-width: 400px) { ... }

/* :has() 親セレクタ */
.form-group:has(input:invalid) { border-left: 3px solid #ef4444; }

/* ダークモード自動対応 */
@media (prefers-color-scheme: dark) { ... }
/* prefers-reduced-motion も必須 */
@media (prefers-reduced-motion: reduce) { ... }
```

---

## 第4章 iOS開発 即参照シート

> 詳細: `rules/ios-development.md`
> iOSカラーパレットは §A.3 を参照

### 絶対数値

| 項目 | 値 | 根拠 |
|------|----|------|
| 最小タップ領域 | 44×44pt | HIG必須 |
| 標準水平マージン(iPhone) | 16pt | HIG |
| 標準水平マージン(iPad) | 20pt | HIG |
| スペーシング単位 | 8pt刻み | 8ptグリッド |
| Dynamic Type | セマンティックスタイル必須 | `.font(.body)` 等 |
| カラー | セマンティックカラーのみ | `Color.primary` 等 |
| 画面遷移アニメーション | 0.3〜0.4秒 | HIG |
| Reduce Motion | 対応必須 | `@Environment(\.accessibilityReduceMotion)` |

### SwiftUI正しい記法

```swift
// ✅ 正: セマンティックフォント
Text("タイトル")
    .font(.headline)    // 絶対値禁止
    .foregroundColor(.primary)  // Color.black 禁止

// ✅ 正: @StateObject（Viewが所有する場合）
@StateObject private var viewModel = ItemViewModel()

// ✅ 正: @ObservedObject（外部から注入される場合）
@ObservedObject var viewModel: ItemViewModel

// ✅ 正: .task modifier（自動キャンセル付き）
.task { await viewModel.load() }

// ✅ 正: @ViewBuilder（AnyView禁止）
@ViewBuilder
func content() -> some View { ... }

// ✅ 正: @MainActor でUIスレッド保護
@MainActor class ViewModel: ObservableObject { ... }

// ❌ 禁止パターン
// Color.black / Color.white → セマンティックカラーを使う
// .font(.system(size: 14)) → セマンティックスタイルを使う
// AnyView → @ViewBuilder を使う
// DispatchQueue.main.async → await MainActor.run { } を使う
```

### React Native（Expo）特記事項

- カラーパレットは `src/styles.ts` の `palette` オブジェクトで一元管理（§A.3 参照）
- `#FFFFFF` は禁止。ボタン白文字には `#FDF8F4`（petalWhite）を使用
- `#000000` は禁止。テキスト黒には `#4A353A`（warmMauve）または `#5C444A`（deepMauve）を使用
- スペーシングは 8pt 倍数を原則とする

### ナビゲーション決定木

```
アプリの階層構造:
├── フラット（3〜5画面）     → TabView
├── 階層型（Master→Detail） → NavigationStack
├── 多カテゴリ（iPad）       → NavigationSplitView
├── 多カテゴリ（iPhone）     → TabView + NavigationStack
└── 一時的タスク/フォーム    → .sheet
```

### 必須アクセシビリティ

```swift
// 全インタラクティブ要素にラベル
Button { ... } label: { Image(systemName: "trash") }
    .accessibilityLabel("このメッセージを削除")

// 装飾画像を隠す
Image("decorative")
    .accessibilityHidden(true)

// Dynamic Type全サイズテスト
ContentView()
    .environment(\.dynamicTypeSize, .accessibility5)
```

---

## 第5章 品質ゲート

### 実装後チェックリスト（Web）

- [ ] 全テキストにカラーコントラスト 4.5:1 以上
- [ ] `#000` / `#fff` 不使用
- [ ] フォントサイズ5段階以内
- [ ] スペーシングが4px倍数
- [ ] シャドウで区切り（`border: 1px solid` 不使用）
- [ ] 角丸が適切に適用されている
- [ ] ダークモード対応
- [ ] `prefers-reduced-motion` 対応
- [ ] 全インタラクティブ要素が24px以上
- [ ] `<html lang="ja">` 設定済み
- [ ] スキップリンク実装済み
- [ ] セマンティックHTML使用（`<header>`, `<nav>`, `<main>`, `<h1>`〜`<h6>`）
- [ ] `:focus-visible` スタイル定義済み
- [ ] 全 `<img>` に `alt` 属性（装飾は空 `alt=""`）
- [ ] Lighthouse パフォーマンススコア 80以上
- [ ] loading / empty / error 状態を全データコンポーネントに実装

### 実装後チェックリスト（iOS）

- [ ] 全テキストがセマンティックフォントスタイル（`.font(.body)` 等）
- [ ] 全インタラクティブ要素が44×44pt以上
- [ ] 全カラーがセマンティック（`Color.primary`, `Color(.systemBackground)` 等）
- [ ] ダークモード全画面確認済み
- [ ] Dynamic Type AX5（最大）でレイアウト崩れなし
- [ ] Reduce Motion対応済み
- [ ] 全インタラクティブ要素に `.accessibilityLabel`
- [ ] VoiceOverで全画面操作可能
- [ ] TabView/NavigationStack の正しい構造
- [ ] `@StateObject` / `@ObservedObject` 正しい使い分け
- [ ] `.ignoresSafeArea()` が背景延長のみに限定
- [ ] 16pt水平マージン維持
- [ ] 8ptグリッドスペーシング
- [ ] `Color.black` / `.white` 不使用
- [ ] React Native: `#FFFFFF` / `#000000` 不使用（iOSカラーパレット §A.3 参照）

---

## 第6章 プロジェクト構造

```
sippomi/
├── AGENTS.md              ← 本ファイル（単一真実源）
├── README.md              ← プロジェクト入口
├── rules/                 ← 詳細実装ルール
│   ├── web-development.md
│   └── ios-development.md
├── docs/                  ← 人間向け設計資料
│   ├── project-context.md
│   ├── ios-swipe-app-plan.md
│   ├── deployment-checklist.md
│   ├── setup-stack.md
│   └── edit-map.md
├── archive/               ← 過去のタスク資産（エージェント非参照）
│   ├── prompts/
│   ├── codex/
│   └── superpowers/
├── src/                   ← HP Web ソース（Vite + Vanilla JS）
├── apps/
│   ├── name-matcher/      ← 名前診断アプリ（Expo + React Native）
│   └── pet-life-companion/← 生活記録アプリ（Swift/Xcode ネイティブ）
└── packages/              ← 共有パッケージ
    └── recommendation-core/
```

---

## §A Sippomi デザインシステム

Apple Japan × MUJI ハイブリッド。Apple の大胆なタイポグラフィと製品ページ構成 + MUJI の静かな生活導線と背景色。

**印象語**: premium, quiet, editorial, consumer-friendly, spacious

### §A.1 タイポグラフィ（5段階）

| 段階 | 役割 | Webサイズ | weight | line-height |
|------|------|----------|--------|-------------|
| **Hero Display** | ページ主見出し | `clamp(4rem, 11vw, 7rem)` | 600 | 1.02 |
| **Section Title** | セクション見出し | `clamp(2rem, 5vw, 4rem)` | 600 | 1.08 |
| **Panel Title** | カード見出し | `clamp(1.4rem, 2.6vw, 2.4rem)` | 600 | 1.15 |
| **Body** | 本文 | `17px` | 400 | 1.47 |
| **Small Label** | 補足 | `12px`-`14px` | 500 | 1.4 |

フォントスタック:
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro JP", "SF Pro Display",
             "SF Pro Text", "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3",
             "Noto Sans JP", Meiryo, sans-serif;
```
- 日本語は角ゴシック系。明朝は使わない。
- 本文は Apple 寄りにやや詰める。巨大見出しはごく弱い負のトラッキングを許可。

### §A.2 Web カラーパレット（Apple Japan × MUJI）

#### MUJI Base（背景・土台）
| トークン | 色 | 用途 |
|---------|----|------|
| **Kinari** | `#f4eede` | 全体背景（メイン） |
| Background Secondary | `#f5f5f5` | セカンド背景 |
| Surface | `#fafafa` | カード表面（※`#fff`禁止） |
| Beige Accent | `#e0ceaa` | ベージュアクセント |
| MUJI Red | `#7f0019` | 小さなアクセントのみ |

#### Apple Premium Layer（テキスト・CTA）
| トークン | 色 | 用途 |
|---------|----|------|
| Text Primary | `#1d1d1f` | 本文テキスト |
| Text Secondary | `#6e6e73` | 補足テキスト |
| On Dark | `#f5f5f7` | ダーク背景上のテキスト |
| Apple Blue | `#0071e3` | CTA / リンク |
| Link Blue | `#0066cc` | リンク |
| Dark Section | `#1d1d1f` | ダークセクション背景（※`#000`禁止） |

#### 使用ルール
- 全体背景は MUJI の `#f4eede` (Kinari) を基準
- 広い面積で使う色は `#f4eede`, `#fafafa`, `#f5f5f5`
- Apple Blue は CTA とリンクに限定
- MUJI Red は小さなアクセントだけ

### §A.3 iOS カラーパレット（女性向け暖色系）

React Native `src/styles.ts` の `palette` オブジェクトで管理:

```typescript
palette = {
  softPink:    '#F0A1B5',  // 桜ピンク
  rose:        '#D4788F',  // ローズ
  warmMauve:   '#4A353A',  // 深紅紫（テキスト黒の代わり）
  cornflower:  '#5B9BD5',  // ソフト青
  warmIvory:   '#FAF5F0',  // 温もりアイボリー（背景）
  softPetal:   '#FDF8F4',  // 花びら（カード表面、白の代わり）
  petalWhite:  '#FEFAF7',  // 白代替
  roseQuartz:  '#F0E2E0',  // ライン
  deepMauve:   '#5C444A',  // 本文テキスト
  mutedMauve:  '#6D555A',  // 補足テキスト
  lightPink:   '#FCE8EE',  // 選択サーフェス
  visiblePink: '#F5CED8',  // 強調サーフェス
  passSurface: '#F3B8B8',  // Passボタン
  holdSurface: '#E8D5C4',  // Holdボタン
  likeSurface: '#B8DFCA',  // Likeボタン
  disabled:    '#E0D5D8',  // 無効
}
```

**ダークモード**: 背景を深紅紫ベース (`#2D1F24`) に、全色をダークパレットに合わせる。

### §A.4 コンポーネントスタイリング

#### Hero
- Apple 型の巨大タイポグラフィ
- 背景色は MUJI `#f4eede`
- 大きなビジュアルパネルを 1 つ配置

#### Buttons
- **Primary**: Apple Blue fill, オフホワイトテキスト (`#fafafa`), pill radius (`--radius-pill: 9999px`)
- **Secondary**: 白サーフェス, ほぼ黒テキスト, 控えめなボーダー, pill radius
- **iOS**: 背景色は §A.3 の passSurface/holdSurface/likeSurface、テキストは `#FDF8F4`
- hover は色変化とごく小さな浮き上がり

#### Cards
- 静的紹介カードは Apple 的に大きめ面積で見せる
- Light card: white / warm gray
- Dark card: `#1d1d1f` background + `#f5f5f7` text
- 角丸: 8-12px

#### Forms / Diagnosis UI
- 入力パネルは白ベース
- 選択チップは Apple Blue または dark fill

### §A.5 レイアウト原則

- Hero max width: `1400px`
- Main content max width: `1260px`
- Horizontal padding: `16px` - `32px`
- Vertical spacing: `48px` - `120px`
- 2 カラムまたは 3 カラムを基本
- 1 セクションにつき 1 つの強いメッセージを置く

#### レスポンシブ
- Desktop: 2 カラムのヒーローと大型カード
- Tablet: 1-2 カラムに縮退
- Mobile: 大見出しは維持しつつ、面は縦積み
- 主要 CTA はファーストビューで見える位置に残す

### §A.6 Depth & Elevation

- 基本はフラット
- 白カードのみ `0 10px 30px rgba(0,0,0,0.06)` まで
- dark panel は影よりコントラストで見せる
- ガラスナビは使わず、ヘッダーは軽い透明度に留める

### §A.7 Do's and Don'ts

#### Do
- Apple のように見出しを大きく、面を大胆に使う
- MUJI のように背景と余白は落ち着かせる
- 入口を少なくし、各セクションに役割を持たせる
- 背景に十分な呼吸感を持たせる

#### Don't
- パステル調のかわいさでまとめない
- 小さなカードを大量に並べて密度を上げない
- 絵文字で雰囲気を作らない
- 背景を Apple 純白ベースへ戻さない
- `#000000` / `#FFFFFF` を一切使わない

### §A.8 iOS SwiftUI（pet-life-companion）カラーパレット

SwiftUI ネイティブ。`AppTheme.swift` で管理。

```swift
// Backgrounds — MUJI Kinari ベース
canvas:      '#f4eede'  // 全体背景（Kinari、Webと共通）
surface:     '#FFF8F0'  // カード表面（※#fff禁止）
softSurface: '#f9f5eb'  // ソフト背景
elevated:    .systemBackground  // セマンティック（自動ダーク対応）

// Brand accents — 温かみのあるアースカラー
brandOrange:     '#E8A87C'  // ソフトオレンジ
brandTerracotta: '#C97B63'  // テラコッタ
brandDarkBrown:  '#4A353A'  // ダークブラウン（テキスト、dark時は反転）
brandCta:        '#0071e3'  // Apple Blue（Webと共通）

// Layout
screenPadding: 16, cardPadding: 20, cornerRadius: 20, pillRadius: 9999
```

**ダークモード**: SwiftUI の `Color("ColorName")` で Asset Catalog 管理、各色の dark variant を定義済み。

### §A.9 シナジー導線 — 3作品間連携

全作品で同一ブランド「Sippomi」の世界観を共有。

| 導線 | 内容 |
|------|------|
| **HP → 名前診断** | App Store / 診断アプリ紹介バナー |
| **HP → 生活記録** | App Store / 生活記録アプリ紹介バナー |
| **名前診断 → HP** | 結果画面に「Sippomi HP を見る」リンク |
| **名前診断 → 生活記録** | 結果画面に「毎日の記録をつける」導線 |
| **生活記録 → 名前診断** | 「名前をさがす」導線 |

**共通ルール**:
- 全作品で §A.1 タイポグラフィ体系をできる限り踏襲
- `#000000` / `#FFFFFF` / Material Design / 絵文字 は全作品で禁止
- 背景基調は MUJI Kinari `#f4eede` を基準（Web と pet-life-companion で共有、name-matcher は暖色系バリエーション）
- 相互リンク時は Sippomi ブランドロゴ/名称を必ず表示

---

> 本ファイルが Sippomi プロジェクトの全エージェント向け単一真実源である。
> 過去の資産は `archive/` に移動済み。エージェントは `archive/` を参照しないこと。
> 詳細ルールは `rules/web-development.md` および `rules/ios-development.md` を参照。
