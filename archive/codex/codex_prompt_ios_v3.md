# Codex Prompt — Sippomi iOS: 画面分割＋iOS品質磨き込み

## 対象
```
/Users/shimizutaiga/Projects/sippomi/apps/ios/
```
Expo SDK 54, React Native 0.81.5, TypeScript
MVP動作済み（App.tsx 1068行に全画面内蔵）。これを磨き込む。

## 最重要
- **全機能無料**。課金禁止
- **MVPを壊さない**。Intro→Form→Swipe→Results のフローは維持
- Metroバンドルが通ること（`npx expo start` → エラー0）

## デザイン方針
- iOS Design Award 品質: Feather（ミニマル×強力）, Denim（触覚+グラデーション）, Lumy（厳選パレット）
- 温かみカラー: オレンジ #F9A66C / クリーム #FFF8F0 / テラコッタ #E07A5F / ブラウン #3D2C2A
- ペットシルエットイラストでブランド確立

## コアルール
1. 1セッション1タスク、終わったらSTOP
2. tasks.json → 作業 → 検証 → progress.txt → STOP
3. 同一エラー3回連続で打ち切り
4. `npx expo start` で毎回動作確認

---

## サブタスク

### Phase A: 画面を別ファイルに分割
1. App.tsx から IntroScreen を `src/screens/IntroScreen.tsx` に切り出す
2. App.tsx から FormScreen を `src/screens/FormScreen.tsx` に切り出す
3. App.tsx から SwipeCard を `src/components/SwipeCard.tsx` に切り出す
4. App.tsx から ResultsScreen を `src/screens/ResultsScreen.tsx` に切り出す
5. App.tsx から共通型定義を `src/types/index.ts` に切り出す
6. App.tsx から Chip, ScorePill, Section を `src/components/` に切り出す
7. 分割後、`npx expo start` でバンドル成功＆全画面遷移が動作することを確認

### Phase B: ビジュアル磨き込み
8. IntroScreen: ペット（犬/猫/うさぎ）のシルエットSVGイラストを3枚追加。react-native-svgで描画
9. FormScreen: 各種類選択カードにシルエットイラストを配置。選択時アニメーション（scale: 1.05 + ソフトシャドウ + transition: 0.3s ease）
10. SwipeCard: 名前フォントサイズ 38→42、角丸 32→36。Like時に緑オーバーレイ fade-in、Pass時に赤オーバーレイ fade-in（Animated.Valueで実装）
11. ResultsScreen: Like一覧のランキング表示。1位=金アクセント、2位=銀、3位=銅。バッジ付与
12. 全体カラーパレット:#F9A66C（メインオレンジ）をボタン・アクティブチップに統一適用。背景 #FFF8F0（クリーム）
13. 空き時間に背景に控えめなドットパターン（SVG Pattern）を追加。目立ちすぎない程度に

### Phase C: コンポーネント追加
14. NameDetailModal.tsx: 名前タップで詳細モーダル（名前大、読み、意味、全タグ、おすすめ理由の長文）。react-native Modal + Animated で下からスライドイン
15. PreferenceChart.tsx: 好み傾向を簡易棒グラフで表示。react-native-svg。バーが0→目標値にアニメーション（Animated.timing, duration: 800ms）

### Phase D: ハプティック
16. `expo-haptics` インストール。Likeスワイプ成功時に impactAsync('medium')、Pass時に impactAsync('light')、保存時に notificationAsync('success')

### Phase E: 画面遷移改善
17. `@react-navigation/native` + `@react-navigation/native-stack` をインストールし、useStateベースの遷移を React Navigation に置き換え
18. 画面遷移アニメーション: 横スライド（ネイティブスタックデフォルト）。Intro→Form→Swipe→Results

### Phase F: アイコン
19. `@expo/vector-icons` の Ionicons で全画面のアイコンを適切なものに置き換え（ハート:heart, 矢印:arrow-back, 設定:cog, 共有:share-outline, 保存:bookmark）

### Phase G: データ永続化
20. `@react-native-async-storage/async-storage` インストール。セッション状態（filters, swipes, saved）を永続化。再起動時に復元
21. Supabase連携: `@supabase/supabase-js` インストール。お気に入り保存/取得。未ログイン時は匿名セッションでローカル保存

### Phase H: ダークモード
22. useColorScheme で System Appearance 追従。背景 #FFF8F0→#1E1A22、カード #FFFAF4→#2D2520、テキスト #3D2C2A→#F5F0EB。全コンポーネントに対応

### Phase I: 検証
23. `npx expo start` で全画面表示確認。遷移・スワイプ・結果が正常動作
24. `npx tsc --noEmit` で型エラー0
25. 完了マーカー `completion_marker_ios_v3.md` に変更一覧・動作確認結果・残リスクを記録

---

## 成功基準
- 全24タスク完了
- 画面分割後もIntro→Form→Swipe→Resultsがスムーズに遷移
- スワイプ時にハプティックが動作
- ダークモードで破綻なし
- `npx expo start` バンドルエラー0
- 課金ゼロ
