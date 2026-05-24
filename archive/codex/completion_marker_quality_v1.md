# Sippomi iOS 品質磨き込み v1 完了マーカー

## 変更ファイル一覧
- `App.tsx`
- `src/styles.ts`
- `src/theme.ts`
- `src/persistence.ts`
- `src/components/BackgroundDots.tsx`
- `src/components/Chip.tsx`
- `src/components/NameDetailModal.tsx`
- `src/components/PetSilhouette.tsx`
- `src/components/ScorePill.tsx`
- `src/components/ScreenSafeArea.tsx`
- `src/components/SpeciesOptionCard.tsx`
- `src/components/SwipeCard.tsx`
- `src/screens/FormScreen.tsx`
- `src/screens/IntroScreen.tsx`
- `src/screens/ResultsScreen.tsx`

## 主な変更内容
- `styles.ts` の余白・フォントサイズ・角丸・純白色を品質基準へ整理し、フォントサイズは 12 / 15 / 17 / 24 / 34 の5段階へ統一。
- 全主要 Pressable に `accessibilityLabel` / `accessibilityRole` を追加し、装飾要素はアクセシビリティツリーから除外。
- タップ領域を 44pt 以上に調整し、Swipe の Like / Pass / Hold、結果画面の候補詳細、フォーム選択を VoiceOver で操作しやすく改善。
- persistence 読み書きを try-catch で保護し、保存・読込失敗時もクラッシュせず local fallback できるように変更。
- hydration 中のローディング UI と再試行 UI を追加。

## 検証結果
- `npx tsc --noEmit`: 成功
- Metro 既存プロセスで `iOS Bundled 1118ms index.ts (1 module)`: 成功
- iPhone 17 Pro Simulator 起動: 成功
- ダークモード screenshot 確認: 表示崩れなし
- 代表的な品質違反検索:
  - `#FFFFFF` / `#ffffff`: ヒットなし
  - 指定外 fontSize: ヒットなし
  - 代表的なランダム余白・角丸: ヒットなし

## 残リスク・懸念点
- Metro ログに `SafeAreaView has been deprecated` 警告が残る。アプリ内コードは `react-native-safe-area-context` に差し替え済みのため、依存パッケージ側または Metro キャッシュ由来の可能性がある。
- VoiceOver の実機確認は未実施。コード上のラベル付与と操作導線は確認済み。
- `/Users/shimizutaiga/Projects/iosアプリ/sippomi-ios` の単体コピーは `../../packages/recommendation-core` 依存が切れているため、今回の品質改善対象外。
