# Codex 監査指示: sippomi iOS アプリ (name-matcher)

## 目的

sippomi の iOS 名前スワイプ診断アプリ（Expo SDK 54 / React Native 0.81.5 / TypeScript）のコード品質・依存関係・アーキテクチャを包括的に監査する。

## プロジェクト構成

```
sippomi/
├── AGENTS.md              ← 単一真実源（デザインルール・禁止事項）
├── rules/
│   └── ios-development.md ← iOS開発詳細ルール
├── apps/
│   └── name-matcher/      ← 監査対象（Expo + React Native）
│       ├── package.json   ← 依存関係
│       ├── App.tsx        ← エントリポイント
│       ├── index.ts       ← Expo登録
│       ├── tsconfig.json
│       ├── app.json
│       ├── babel.config.js
│       ├── metro.config.js
│       └── src/
│           ├── types/index.ts           ← 型定義
│           ├── theme.ts                 ← ダークテーマ対応
│           ├── designTokens.ts          ← デザイントークン
│           ├── styles.ts                ← スタイル定義
│           ├── session.ts               ← セッション管理
│           ├── persistence.ts           ← 永続化（AsyncStorage/Supabase）
│           ├── nativeCapabilities.ts    ← ネイティブ機能検出
│           ├── data/names.json          ← 10,000件の名前データ(4MB)
│           ├── screens/
│           │   ├── IntroScreen.tsx      ← 開始画面
│           │   ├── FormScreen.tsx       ← フィルター入力(Step1-5)
│           │   ├── SwipeScreen.tsx      ← スワイプ診断（← MotiView→Animated.Viewに修正済み）
│           │   └── ResultsScreen.tsx    ← 結果画面（← ViewShot除去、Share APIのみ）
│           └── components/
│               ├── SwipeCard.tsx
│               ├── NameDetailModal.tsx
│               ├── SpeciesOptionCard.tsx
│               ├── Section.tsx
│               ├── ScreenSafeArea.tsx
│               ├── ScorePill.tsx
│               ├── PreferenceChart.tsx
│               ├── PetSilhouette.tsx
│               ├── Chip.tsx
│               └── BackgroundDots.tsx
├── packages/
│   └── recommendation-core/              ← 推薦ロジック（JS）
│       ├── constants.js                   ← SPECIES/VIBE/COLOR/TONE等の定数
│       ├── recommendation.js             ← 名前推薦・学習アルゴリズム
│       └── index.js                      ← エクスポート
└── docs/
    ├── project-context.md
    ├── ios-swipe-app-plan.md
    └── edit-map.md
```

## 監査項目

### 1. 依存関係（package.json）

- **moti@0.30.0** → React 19.1.0 との非互換性が確認済み。`Invalid hook call` エラーの原因。既にアンインストールし `SwipeScreen.tsx` 内の `MotiView` は `Animated.View`（react-native-reanimated）に置き換え済みだが、監査して残骸がないか確認。
- **各パッケージのバージョン互換性** → Expo SDK 54 / React Native 0.81.5 / React 19.1.0 の組み合わせで非互換があるパッケージを洗い出す。
- **未使用依存関係** → ソースコードで実際にimportされていないパッケージを特定。
- **重複・競合** → 同じ機能を持つパッケージが複数あるか（例: ナビゲーション、アニメーション）。
- **Supabaseとの連携** → `@supabase/supabase-js` が開発ビルドで正しく動作するか。環境変数 `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` の設定状況。

### 2. コード品質（全ソースファイル）

**TypeScript:**
- `any` 型の使用箇所（AGENTS.md の禁止事項#10）
- `as` キャストの安易な使用
- 不足している型定義、または過剰に広い型
- non-null assertion (`!`) の使用
- 未使用の import / 変数 / 関数

**React Native / Expo:**
- `#FFFFFF` / `#000000` の使用（AGENTS.md 禁止事項#2）
- セマンティックカラー（`theme.apply()`）の一貫した使用
- 44x44pt 最小タップ領域の遵守
- Dynamic Type 対応の有無
- アクセシビリティラベルの欠落
- ダークモード非対応の箇所
- 空状態・エラー状態・ローディング状態（AGENTS.md 禁止事項#13）
- `StyleSheet.create()` vs inline styles の一貫性

**パフォーマンス:**
- `names.json` 4MB / 10,000件の読み込み方法（`import` によるバンドル時読み込み）の最適化余地
- `buildSwipeQueue()` / `rankNamesForSwipe()` が10,000件全てを同期処理する場合のUIブロックリスク
- メモ化（`useMemo` / `useCallback`）の適切な使用
- 不要な再レンダリングの可能性
- `react-native-reanimated` の worklet 関数が正しく宣言されているか

### 3. アーキテクチャ

- **状態管理**: `useState` ベースの状態管理。複雑なセッション状態は適切に管理されているか？ Context や Redux の必要性は？
- **ナビゲーション**: `@react-navigation/native` + `@react-navigation/native-stack` → `canRenderNativeStack()` によるフォールバック設計。このフォールバックは現実的か？実際にネイティブスタックが使えているか？
- **永続化**: `persistence.ts` の `memoryStore` はAsyncStorage利用不可時のフォールバック。データ損失リスクは？
- **Supabase連携**: 環境変数不足時の `null` フォールバック。全`supabase`参照箇所でnullチェックがされているか？
- **recommendation-core パッケージ**: JSモジュールとして相対パス `../../../../packages/` でimport。この解決は安定しているか？パッケージ化（npm workspace / monorepo）すべきか？

### 4. 修正履歴と残課題

以下の修正が行われている。各修正が完全か監査すること：

1. **moti削除 + MotiView→Animated.View置換**（SwipeScreen.tsx）: `import { MotiView }` が残っていないか。`Animated.View` の entering/exit animation が正しくReanimatedのworkletとして宣言されているか。
2. **persistence.ts マイグレーション追加**: 旧フィルタースキーマに `tone` フィールドがない問題に対し `{ ...defaults, ...parsed.filters }` で補完するロジック。他の新フィールド（theme等）もカバーできているか。
3. **react-native-view-shot削除**: 全ファイルで `captureRef` / `ViewShot` / `react-native-view-shot` の残骸がないか。
4. **FormScreen Step5（響き）追加**: `TONE_OPTIONS` のimport・レンダリングが正しいか。`filters.tone?.length` のオプショナルチェーンが全ての参照箇所で使われているか。

### 5. セキュリティ

- Supabaseの `ANON_KEY` がバンドルに露出しているか（環境変数経由のため許容、ただし確認）
- ユーザー入力のサニタイズ（フォーム画面のテキスト入力）
- XSSの可能性（React Nativeでは低いが、WebView等があれば確認）

## 参照ファイルの絶対パス

- AGENTS.md: `/Users/shimizutaiga/Projects/sippomi/AGENTS.md`
- iOS開発ルール: `/Users/shimizutaiga/Projects/sippomi/rules/ios-development.md`
- プロジェクトコンテキスト: `/Users/shimizutaiga/Projects/sippomi/docs/project-context.md`
- アプリ計画: `/Users/shimizutaiga/Projects/sippomi/docs/ios-swipe-app-plan.md`
- 編集早見表: `/Users/shimizutaiga/Projects/sippomi/docs/edit-map.md`

## 実行手順（Codex用）

```bash
cd /Users/shimizutaiga/Projects/sippomi/apps/name-matcher

# 1. 全TypeScriptファイルの型チェック
npx tsc --noEmit

# 2. ESLint（あれば）
npx eslint src/ --ext .ts,.tsx

# 3. 未使用export/importのスキャン
# npx ts-prune（あれば）

# 4. コード内の禁止パターンスキャン
grep -rn '#FFFFFF\|#000000\|#fff\|#000' src/ --include="*.tsx" --include="*.ts"
grep -rn 'as any\|: any' src/ --include="*.tsx" --include="*.ts"
grep -rn 'captureRef\|ViewShot\|react-native-view-shot' src/ --include="*.tsx" --include="*.ts"
grep -rn 'from.*moti' src/ --include="*.tsx" --include="*.ts"
grep -rn 'filters\.tone\.length' src/ --include="*.tsx" --include="*.ts"

# 5. バンドルサイズ確認
npx react-native bundle --platform ios --dev true --entry-file index.ts --bundle-output /dev/null --assets-dest /dev/null 2>&1 | head -20
```

## 出力形式

各監査項目ごとに以下を出力：

```
## [カテゴリ名]
### [発見事項タイトル]
- **重大度**: high / medium / low
- **ファイル**: path/to/file.tsx:行
- **問題**: 説明
- **推奨修正**: 具体的な修正方法
- **リスク**: 放置した場合の影響
```

優先順位は **high → medium → low** の順で出力すること。

## Codex実行コマンド

```bash
cd /Users/shimizutaiga/Projects/sippomi/apps/name-matcher

# TypeScriptチェック
npx tsc --noEmit

# コード監査
codex exec '
You are auditing a React Native (Expo SDK 54) app called "sippomi name-matcher".
Follow the audit checklist in .hermes/plans/2026-05-27_225000-codex-audit-ios-name-matcher.md

Focus on:
1. package.json dependency audit (compatibility, unused, conflicts)
2. TypeScript quality (any, type safety, unused code)
3. Architecture review (state management, navigation, persistence)
4. AGENTS.md compliance (no #000/#FFF, no Material Design, 44pt tap targets, accessibility)
5. Performance (names.json 4MB import, render optimization)
6. Security (env vars, input sanitization)

The AGENTS.md and rules/ios-development.md have the design system rules to check against.
Read these files before starting the audit.

Output findings organized by severity (high/medium/low).
'
```
