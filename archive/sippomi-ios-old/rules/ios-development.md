# iOSアプリ開発 詳細ルール集

Apple Human Interface Guidelines / Kodeco / SwiftUI Field Guide / iOS Dev Weekly に基づく実装ルール。

---

## 1. タイポグラフィ — San Francisco Dynamic Type

### セマンティックフォントスタイル（絶対値禁止）

| スタイル | デフォルトpt | ウェイト | 用途 |
|---------|------------|---------|------|
| `.largeTitle` | 34pt | Regular | 画面最上部の主見出し |
| `.title` | 28pt | Regular | セクションタイトル |
| `.title2` | 22pt | Regular | サブセクション |
| `.title3` | 20pt | Regular | 小セクション |
| `.headline` | 17pt | **Semibold** | 段落見出し |
| `.body` | 17pt | Regular | 本文 |
| `.callout` | 16pt | Regular | 補足テキスト |
| `.subheadline` | 15pt | Regular | 副次的説明 |
| `.footnote` | 13pt | Regular | 脚注 |
| `.caption` | 12pt | Regular | キャプション |
| `.caption2` | 11pt | Regular | 最小キャプション |

### 実装ルール

```swift
// ✅ 正: セマンティックスタイル
Text("タイトル")
    .font(.headline)
    .fontWeight(.semibold)

// ✅ カスタムフォントでもDynamic Type対応
Text("見出し")
    .font(.custom("MyFont", size: 17, relativeTo: .body))

// ✅ 固定サイズが本当に必要な場合のみ
Text("ロゴ")
    .font(.custom("BrandFont", fixedSize: 24))

// ❌ 禁止: 絶対値直指定
Text("タイトル")
    .font(.system(size: 17))  // Dynamic Type非対応になる
```

### Dynamic Type サイズカテゴリ

```
xSmall → Small → Medium → Large(デフォルト) → xLarge → xxLarge → xxxLarge
→ AX1 → AX2 → AX3 → AX4 → AX5（アクセシビリティ拡大、最大310%）
```

### @ScaledMetric（非テキスト要素の拡大縮小）

```swift
@ScaledMetric var iconSize = 24.0

Image(systemName: "star")
    .frame(width: iconSize, height: iconSize)
```

---

## 2. スペーシング — 8ptグリッド

### 絶対数値

| 項目 | 値 | 根拠 |
|------|----|------|
| 最小タップ領域 | **44×44pt** | HIG必須。違反はリジェクト対象 |
| 標準水平マージン (iPhone) | **16pt** | `.padding(.horizontal, 16)` |
| 標準水平マージン (iPad) | **20pt** | ワイド画面用 |
| セル間隔 | 8pt（推奨最小） | List/Form内 |
| セクション間隔 | 24〜32pt | 意味的境界 |
| スペーシング単位 | 8pt刻み | 8/16/24/32/40/48/64 |

```swift
// ✅ 正: 明示的な値
.padding(.horizontal, 16)
.padding(.vertical, 8)

// ❌ 禁止: 無引数（環境依存）
.padding()

// ❌ 禁止: ランダム値
.padding(.top, 30)
```

### Safe Area

```swift
// ✅ 背景延長にのみ使用
.background(Color(.systemBackground))
.ignoresSafeArea(edges: .top)

// ❌ コンテンツに ignoresSafeArea を使わない
// ❌ 自前のキーボード回避は非推奨 → keyboardLayoutGuide (iOS 15+) を使う
```

---

## 3. カラーシステム

### セマンティックカラー（これ以外の直指定禁止）

```swift
// テキスト
Color.primary        // 本文（Light: rgba(0,0,0,0.85), Dark: rgba(255,255,255,0.85)）
Color.secondary      // 補助（透明度0.6）

// 背景
Color(.systemBackground)           // メイン背景
Color(.secondarySystemBackground)  // グループ化背景（List等）
Color(.tertiarySystemBackground)   // 三階層背景

// UI用
Color(.separator)       // 区切り線
Color(.placeholderText) // プレースホルダー
Color(.tintColor)       // アクセント
Color(.systemRed)       // 破壊的操作（削除等）
Color(.systemGreen)     // 確認・成功
Color(.systemBlue)      // リンク
```

### 禁止パターン

```swift
// ❌ RGB直指定 → ダークモード非対応
Color(red: 0.2, green: 0.2, blue: 0.2)
.foregroundColor(.black)
.background(.white)

// ✅ セマンティックカラー
.foregroundColor(.primary)
.background(Color(.systemBackground))
```

### カラーアクセシビリティ

- 色だけで情報を伝えない（アイコン・ラベル併用）
- Increase Contrast 対応: `@Environment(\.colorSchemeContrast)` で検出
- 最低コントラスト比: 通常文字 **4.5:1**、大文字(≥18pt) **3:1**

---

## 4. ナビゲーション — 決定木

```
アプリの階層構造は？
├── フラット（3〜5画面）
│   └── TabView(.tabBar) ← 最優先。タブ2〜5個
├── 階層型（マスター→詳細→さらに詳細）
│   └── NavigationStack ← 標準
├── 多数のコンテンツカテゴリ
│   ├── iPad: NavigationSplitView（sidebar + detail）
│   └── iPhone: TabView + NavigationStack の組み合わせ
└── 一時的タスク/フォーム入力
    └── .sheet ← 作業完了後に閉じる前提
```

### TabView 実装ルール

```swift
TabView(selection: $selectedTab) {
    ForEach(Tab.allCases) { tab in
        NavigationStack {
            tab.contentView
        }
        .tabItem {
            Label(tab.title, systemImage: tab.icon)
        }
        .tag(tab)
    }
}
// 各タブ内に独立した NavigationStack を持たせること
```

### NavigationStack（iOS 16+ 標準）

```swift
NavigationStack(path: $path) {
    List(items) { item in
        NavigationLink(value: item) {
            ItemRow(item: item)
        }
    }
    .navigationDestination(for: Item.self) { item in
        DetailView(item: item)
    }
}
```

### 禁止

- ❌ `.sheet` の中に `.sheet` を重ねる
- ❌ スワイプバック（interactivePopGesture）の無効化
- ❌ TabView内でNavigationStackを使わない（状態の分離が必要）

---

## 5. ジェスチャー標準

### システムジェスチャー（絶対に潰さない）

| ジェスチャー | 動作 | 対象 |
|-------------|------|------|
| 左端スワイプ | 戻る | NavigationStack |
| 下スワイプ | モーダル閉じる | `.sheet` |
| 長押し | コンテキストメニュー | リスト行等 |
| 引っ張って更新 | Pull to Refresh | ScrollView/List |
| タップ | 主アクション | 全インタラクティブ要素 |

### 追加可能なジェスチャー

```swift
// スワイプアクション（リスト行）
.swipeActions(edge: .trailing) {
    Button("削除", role: .destructive) { delete() }
}

// ダブルタップ
.onTapGesture(count: 2) { ... }

// ドラッグ（並び替え）
.onMove { from, to in ... }
```

### 禁止

- ❌ 戻るスワイプの無効化
- ❌ システムジェスチャーと競合する独自エッジスワイプ
- ❌ 長押しでの独自ポップアップ → `.contextMenu` を使う

---

## 6. アニメーションとトランジション

### 標準値

| 対象 | 時間 |
|------|------|
| 画面遷移 | 0.3〜0.4秒 |
| 小要素の表示/非表示 | 0.2〜0.3秒 |
| スプリング | `response: 0.3〜0.5, dampingFraction: 0.7〜0.8` |

### Reduce Motion 対応必須

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

// reduceMotion == true の時はアニメーションを無効化
func animate() {
    withAnimation(reduceMotion ? .none : .easeInOut(duration: 0.3)) {
        // ...
    }
}
```

### 原則

- アニメーションは「意味のあるフィードバック」にのみ使う。装飾目的禁止
- `.animation` modifier を推奨、`withAnimation` は最小限に

---

## 7. アーキテクチャ — MV パターン

```swift
/// ViewModel
@MainActor
final class ItemViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadItems() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            items = try await APIClient.shared.fetchItems()
        } catch is CancellationError {
            // タスクがキャンセルされた
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

/// View
struct ItemsView: View {
    @StateObject private var viewModel = ItemViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task { await viewModel.loadItems() }
                }
            } else if viewModel.items.isEmpty {
                EmptyStateView(message: "アイテムがありません")
            } else {
                List(viewModel.items) { item in
                    ItemRow(item: item)
                }
            }
        }
        .task { await viewModel.loadItems() }
    }
}
```

### @StateObject vs @ObservedObject

```swift
// ✅ 所有権がある場合 → @StateObject
struct ParentView: View {
    @StateObject private var viewModel = ItemViewModel()
}

// ✅ 注入される場合 → @ObservedObject
struct ChildView: View {
    @ObservedObject var viewModel: ItemViewModel
}

// ❌ 間違い: @ObservedObject で新規生成
// @ObservedObject private var viewModel = ItemViewModel()  // View再描画で再生成される
```

---

## 8. AIがよくミスる10項目

| # | ミス | 正解 |
|---|------|------|
| 1 | `@ObservedObject` で新規インスタンス生成 | `@StateObject` を使う |
| 2 | `Color.black` / `.white` 直指定 | セマンティックカラー `.primary` / `.secondary` |
| 3 | フォントサイズ直指定 `.font(.system(size:14))` | `.font(.body)` 等のセマンティックスタイル |
| 4 | 固定Frameの濫用 | `fixedSize`, `.frame(idealHeight:)` を適切に |
| 5 | `DispatchQueue.main.async` でUI更新 | `await MainActor.run { }` または `@MainActor` |
| 6 | `AnyView` の使用 | `@ViewBuilder` または `some View` のまま |
| 7 | 1つのViewに全UIを詰め込む | 小さく再利用可能なViewに分割 |
| 8 | `.padding()` の無引数使用 | `.padding(.horizontal, 16)` など明示 |
| 9 | `.ignoresSafeArea()` の無秩序な使用 | 背景延長に限定 |
| 10 | 空状態・エラー状態・ローディング状態の見過ごし | 全データViewで3状態を実装 |

---

## 9. Swift Concurrency — 正しい実装

```swift
// ✅ async/await（iOS 15+）
func fetchData() async throws -> [Item] {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([Item].self, from: data)
}

// ✅ @MainActor でUI更新を保護
@MainActor
final class ViewModel: ObservableObject {
    @Published var items: [Item] = []

    func load() async {
        do {
            items = try await fetchData()
        } catch is CancellationError {
            return
        } catch {
            // エラーハンドリング
        }
    }
}

// ✅ .task modifier — ビュー消滅時に自動キャンセル
.task { await viewModel.load() }

// ❌ 禁止: .onAppear での非同期処理（キャンセル管理が面倒）
// .onAppear { Task { await viewModel.load() } }
```

### ViewModifier でスタイル再利用

```swift
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}
```

---

## 10. アクセシビリティ実装ルール

```swift
// 1. 全インタラクティブ要素にラベル
Button(action: delete) {
    Image(systemName: "trash")
}
.accessibilityLabel("このメッセージを削除")
.accessibilityHint("削除すると元に戻せません")

// 2. 要素のグループ化
VStack {
    Text("タイトル")
    Text("サブタイトル")
}
.accessibilityElement(children: .combine)

// 3. 装飾要素を隠す
Image("decorative")
    .accessibilityHidden(true)

// 4. カスタムアクション（スワイプ代替）
.accessibilityAction(named: "お気に入り") { ... }

// 5. ソート順序
.accessibilitySortPriority(1)  // 重要な要素ほど大きな値

// 6. アクションの種類
.accessibilityAddTraits(.isButton)
.accessibilityAddTraits(.isHeader)
```

### 検査方法

```swift
// Xcode Previews で Dynamic Type 全サイズ確認
#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environment(\.dynamicTypeSize, .accessibility5)
            .environment(\.colorScheme, .dark)
    }
}
#endif
```

- Xcode の Accessibility Inspector で全画面を検査
- VoiceOver ON で実機全フローをテスト

---

## 11. iOS 26 Liquid Glass 対応

- タブバーが浮遊型＋角丸＋触れると光る（標準コンポーネントで自動適用）
- 既存アプリのチェック: パディング不足、ブランド色との衝突、ツールバーが窮屈になっていないか
- 猶予モード: `Info.plist` に `UIDesignRequiresCompatability = YES` で無効化可能（一時的措置）

---

## 12. 実装チェックリスト

- [ ] 全テキストがセマンティックフォントスタイル（`.font(.body)` 等）
- [ ] 全インタラクティブ要素が 44×44pt 以上
- [ ] 全カラーがセマンティックカラー
- [ ] ダークモード全画面確認済み
- [ ] Dynamic Type AX5（最大）でレイアウト崩れなし
- [ ] Reduce Motion 対応済み
- [ ] 全インタラクティブ要素に `.accessibilityLabel`
- [ ] VoiceOver で全画面操作可能
- [ ] ナビゲーションが正しい階層構造
- [ ] `@StateObject` と `@ObservedObject` を正しく使い分け
- [ ] `.ignoresSafeArea()` が背景延長のみに限定
- [ ] 16pt 水平マージン維持
- [ ] 8pt グリッドスペーシング
- [ ] `Color.black` / `.white` 不使用
- [ ] loading / empty / error の3状態実装
- [ ] コントラスト比 4.5:1 以上
- [ ] `.task` modifier 使用、自動キャンセル管理

---

> **参照**: Apple HIG / Kodeco / SwiftUI Field Guide / iOS Dev Weekly
