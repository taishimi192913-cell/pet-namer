# AGENTS.md — コーディングエージェント行動ガイド

Codex / OpenHands / Cursor 向け共通指針。プロ品質のHP・iOSアプリを生成するための行動規範。

> 本ガイドは Awwwards審査基準 / Apple HIG / Refactoring UI / WCAG 2.2 / Core Web Vitals 等の実務基準に基づく。
> 参照ルール: `rules/web-development.md` / `rules/ios-development.md`

---

## 第1章 AI缶の排除 — 絶対禁止事項

これらを破ったコードは即座に却下する。生成時に常に以下の禁止リストを遵守すること。

### デザイン禁止事項（Web/iOS共通）

| # | 禁止 | 理由 | 正解 |
|---|------|------|------|
| 1 | **Material Design の使用** | AIのデフォルト着色。Google色(#4285F4)、Robotoフォント、リップルエフェクト、Material Icon | プロジェクト固有のデザインシステムを使う |
| 2 | **純黒 `#000000` / 純白 `#FFFFFF`** | 眼精疲労・ハレーションの原因 | `#1a1a2e`〜`#222` / オフホワイト `#fafafa` |
| 3 | **`font-size` 絶対値直指定** | デバイス間で不適切 / Dynamic Type非対応 | Web: `clamp()` / iOS: `.font(.body)` 等のセマンティックスタイル |
| 4 | **`border: 1px solid #ccc`** | 安っぽい。情報過多 | シャドウ＋余白で区切りを表現 |
| 5 | **10種類以上のフォントサイズ** | ノイズ。階層が不明瞭 | 5段階に制限 |
| 6 | **グレーアウトした無効ボタン** | 無効か低優先度か判別不能 | `opacity: 0.4` で表現 |
| 7 | **ランダムな余白値** | 一貫性欠如 | Web: 4px倍数 / iOS: 8pt倍数 |
| 8 | **色だけで情報を伝達** | 色覚障碍者に不可視 | アイコン・ラベル・下線を併用 |

### コード禁止事項

| # | 禁止 | 正解 |
|---|------|------|
| 9 | **`any` 型 / `AnyView` の使用** | 適切な型定義 / `@ViewBuilder` または `some View` |
| 10 | **APIキー・シークレットのハードコード** | 環境変数 (.env) に格納 |
| 11 | **XSS未対策（innerHTML, dangerouslySetInnerHTML）** | DOMPurify でサニタイズ |
| 12 | **空状態・エラー状態・ローディング状態の見過ごし** | 全データ表示コンポーネントに loading/empty/error の3状態を実装 |
| 13 | **コメントを書かない / 自明な行まで書く** | 非自明なビジネスロジック・ワークアラウンドのみ記述 |
| 14 | **既存コードパターンの無視（新パターンの勝手導入）** | 既存の命名・構成・スタイルを必ず踏襲 |

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
| フォント段階 | 5段階（12/14/16/20/36px 目安） |
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

---

## 第6章 プロジェクトへの設置方法

### Codex プロジェクト

```bash
# プロジェクトルートにコピー
cp /Users/shimizutaiga/projycts/coding-agent-guide/AGENTS.md ./AGENTS.md
cp -r /Users/shimizutaiga/projycts/coding-agent-guide/rules ./rules

# またはシンボリックリンク
ln -sf /Users/shimizutaiga/projycts/coding-agent-guide/AGENTS.md ./AGENTS.md
ln -sf /Users/shimizutaiga/projycts/coding-agent-guide/rules ./rules
```

### OpenHands プロジェクト

AGENTS.md をプロジェクトルートに配置すれば自動的に読み込まれる。

### Cursor

```bash
cp /Users/shimizutaiga/projycts/coding-agent-guide/templates/.cursorrules-web .cursorrules
# iOSプロジェクトの場合:
cp /Users/shimizutaiga/projycts/coding-agent-guide/templates/.cursorrules-ios .cursorrules
```

---

> 本ガイドの全ルールは実務基準に基づく。逸脱する場合は具体的な理由を明示すること。
> 詳細ルールは `rules/web-development.md` および `rules/ios-development.md` を参照。
