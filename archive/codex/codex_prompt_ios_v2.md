# Codex Prompt — Sippomi iOS App: スワイプ式ペット名前診断アプリ新規構築

## 対象プロジェクト
```
/Users/shimizutaiga/Projects/sippomi/
```
新規: Expo + React Native + TypeScript + Supabase。既存の `packages/recommendation-core/` を共通ロジックとして再利用。

---

## 【最重要】全機能無料。課金要素は一切なし

収益化は後日検討。まずは完全無料で全機能を提供する。
- IAPなし、サブスクなし、広告なし
- 無制限スワイプ、無制限お気に入り保存
- ログインなしでも開始可能（匿名セッション）

---

## 【永続タスク】
あなたは以下のサブタスクをすべて完了するまで作業を続けるAgentである。

### コアルール
1. 1セッション1タスク。複数やるな
2. タスク完了後: tasks.json更新 → テスト → git commit → progress.txt更新 → STOP
3. 再開時: progress.txt → tasks.json → git log → 次のタスク1つ → STOP
4. 「おそらく動く」禁止。`npx expo start` または `npm test` で検証
5. 同一エラー3回連続で打ち切り

### アーキテクチャ
```
sippomi/
├── apps/ios/               # Expo iOSアプリ ← NEW
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── screens/
│       │   ├── OnboardingScreen.tsx
│       │   ├── IntakeScreen.tsx      # Step 1-4
│       │   ├── SwipeScreen.tsx        # スワイプデッキ
│       │   ├── InsightScreen.tsx      # 好み分析
│       │   └── ResultScreen.tsx       # 最終候補・保存
│       ├── components/
│       │   ├── SwipeCard.tsx
│       │   ├── SwipeDeck.tsx
│       │   ├── PreferenceChart.tsx
│       │   ├── NameDetailModal.tsx
│       │   └── FilterChip.tsx
│       ├── hooks/
│       │   ├── useRecommendation.ts
│       │   ├── useSwipeLearning.ts
│       │   └── useSupabase.ts
│       ├── store/
│       │   └── sessionStore.ts        # Zustand
│       └── types/
│           └── index.ts
├── packages/recommendation-core/      # 共通推薦ロジック（既存）
├── src/                               # 既存Webアプリ
└── ...
```

### デザイン方針（iOSアプリ）
- **iOS Design Award レベルの品質** を目指す
- **Feather (ADA Winner 2025)** の哲学: ミニマルなインターフェースの背後に強力な機能を隠す
- **Denim (ADA Finalist)** の質感: メッシュグラデーション、カスタム触覚、スムーズスクロール
- **Lumy (ADA Finalist)** の色彩: 厳選されたカラーパレット、エレガントなウィジェット
- **Vocabulary (ADA Finalist)** の一貫性: 魅力的で一貫したイラストシステム
- Apple HIG準拠: SF Pro/SF Pro Rounded、44ptヒットターゲット、8ptグリッド、Dynamic Type
- カラーパレット: 温かみのあるオレンジ `#F9A66C` + クリームホワイト `#FFF8F0` + テラコッタ `#E07A5F` + ダークブラウン `#3D2C2A`
- **ペットのシルエットイラスト** でブランドキャラクターを確立（Vocabulary のイラストシステムを参考）

### スワイプUI仕様
- 中央に1枚カード。背面に2枚（scale: 0.9, 0.81）
- **右スワイプ**: Like（緑のグラデーションオーバーレイ + ハプティック）
- **左スワイプ**: Pass（赤のグラデーションオーバーレイ + ハプティック）
- **下スワイプまたはボタン**: 保留
- **タップ**: 詳細モーダル表示
- カードの回転角 = 水平オフセット × 0.002
- スワイプ閾値 = 画面幅の 60%
- library: `react-native-deck-swiper` or `react-native-tinder-card` + `react-native-gesture-handler` + `react-native-reanimated`

---

## 【サブタスク一覧】

### Phase 1: プロジェクト骨組み
1. Expoプロジェクト作成: `apps/ios/` に `npx create-expo-app@latest sippomi-ios --template blank-typescript`
2. パッケージインストール: `react-native-gesture-handler`, `react-native-reanimated`, `@react-navigation/native`, `@react-navigation/native-stack`, `@supabase/supabase-js`, `zustand`, `react-native-svg`
3. `tsconfig.json` 設定: path aliases (`@/` → `src/`), strict mode
4. `app.json` 設定: name="Sippomi", slug="sippomi-ios", bundleIdentifier, splash, icon の設定
5. `packages/recommendation-core/` を apps/ios から参照できるよう tsconfig paths と package.json workspaces を設定

### Phase 2: 推薦エンジン移植
6. `apps/ios/src/recommendation/` を作成し、`packages/recommendation-core/` の recommendation.js, constants.js, learning.js を TypeScript に移植
7. 推薦エンジンの型定義: `Name`, `NameFilter`, `PreferenceVector`, `SwipeEvent`, `RecommendationResult` の interface を `types/index.ts` に定義
8. スワイプ学習ロジック実装: Likeされた属性の重みを上げ、Passされた属性の重みを下げる。exploration率20-30%。diversity制約。`useSwipeLearning.ts` に
9. 初回候補生成: speciesはhard filter、性別/毛色/雰囲気はsoft filter。20-40件生成。`useRecommendation.ts` に

### Phase 3: 画面実装
10. `OnboardingScreen.tsx`: 3ページのスワイプオンボーディング。「あなたのペットにぴったりの名前を」「3分で候補が絞れます」「スワイプで直感的に選べます」。最後のページに「始める」ボタン
11. `IntakeScreen.tsx`: Step 1-4。各種類（犬/猫/ウサギ）のシルエットイラストカード。性別・毛色・雰囲気タグ・文字数選択。選択中の状態をアニメーション付きで表示。必須は種類のみ、他はスキップ可
12. `SwipeScreen.tsx`: スワイプデッキ中央配置。上部に「残り n 件」表示。下部に Like/Pass/保留 ボタン（ボタンでもスワイプできる）。5件ごとに「あなたの好み」インサイトをポップアップ
13. `InsightScreen.tsx`: 好みの雰囲気Top3、文字数傾向、色傾向、性別傾向をビジュアル表示。棒グラフ + タグクラウド。「最近の傾向」と「全体傾向」のタブ
14. `ResultScreen.tsx`: 最終候補Top10をリスト表示。Like一覧。2件比較モード。お気に入り保存（Supabase）。シェア機能。「別の条件でもう一度」ボタン

### Phase 4: コンポーネント実装
15. `SwipeCard.tsx`: 名前（太字 24px）、読み（16px）、意味（14px）、雰囲気タグチップ、おすすめ理由の表示。背面に影（iOS風のソフトシャドウ）。角丸 20px。タップで詳細モーダル
16. `SwipeDeck.tsx`: 3枚のカードを重ねて表示（前面=1.0, 2枚目=0.92, 3枚目=0.85 scale）。react-native-reanimated でスワイプアニメーション。スワイプ時に Like/Pass オーバーレイ表示
17. `NameDetailModal.tsx`: 名前の詳細情報。大きな名前表示、読み、意味、タグ一覧、おすすめ理由の詳細。ハプティックフィードバック付き閉じるボタン
18. `FilterChip.tsx`: 選択状態に応じて色が変わるタグチップ。選択時=グラデーション背景+白文字。非選択時=透過背景+微細ボーダー。scale アニメーション
19. `PreferenceChart.tsx`: SVG で簡易棒グラフ表示。アニメーション付き（バーの高さが0→目標値に伸びる）

### Phase 5: 状態管理・データ永続化
20. `store/sessionStore.ts` (Zustand): 診断セッション状態（species, gender, color, vibe, length, preferenceVector, swipeHistory, likedNames, passedNames）
21. Supabase連携: 匿名セッション作成、お気に入り保存/取得、スワイプ履歴保存。`hooks/useSupabase.ts` に
22. オフライン対応: AsyncStorage にセッション状態をキャッシュ。Supabase が使えない時はローカルで継続

### Phase 6: 画面遷移・アニメーション
23. React Navigation で画面遷移を設定: Onboarding → Intake → Swipe → Insight → Result。スワイプ画面と Insight 画面間は自由に行き来可能
24. 画面遷移アニメーション: 横スライド（ネイティブスタックのデフォルト）+ 共有要素遷移（名前カード→詳細モーダル）
25. タブバー: Swipe / Insight / Result の3タブ（Frosted Glass 背景、選択インジケーターに洗練された形状）
26. ダークモード対応: System Appearance に追従。全コンポーネントで useColorScheme 対応

### Phase 7: iOSネイティブ体験
27. SF Symbols をアイコンに使用（@expo/vector-icons の Ionicons で代替可能なものはそれで）
28. Haptic Feedback: スワイプ成功時、Like/Passボタン押下時、お気に入り保存時に `expo-haptics`
29. Dynamic Island / Live Activities 不要（MVPではスキップ）
30. App Clip 不要（MVPスキップ）

### Phase 8: App Store 準備
31. アプリアイコン作成: Sippomi のペットシルエットマーク。1024x1024px
32. スプラッシュスクリーン: ブランドロゴ + 温かみのある背景グラデーション
33. プライバシー画面（初回起動時）: 収集データの説明。削除方法の明記。同意取得
34. App Store メタデータ準備: 説明文（日本語）、スクリーンショット5枚分のキャプション、キーワード

### Phase 9: 検証・調整
35. `npx expo start` で全画面をiOS Simulatorで確認。表示崩れ・アニメーションのカクつきがないこと
36. `npx tsc --noEmit` で型チェック。エラー0
37. `npm test` 実行（テストがあれば）。推薦ロジックの単体テストを追加
38. 完了マーカー `apps/ios/completion_marker.md` を作成: 変更ファイル一覧、ビルド結果、残リスク

---

## 成功基準
- Onboarding → Intake → Swipe → Insight → Result の全フローが完動
- スワイプ操作がスムーズ（60fps）
- 推薦エンジンが正しく動作（初回候補生成 + スワイプ後の再ランキング）
- 好み分析がLike/Pass履歴を正しく反映
- お気に入り保存・復元が動作
- ダークモードで破綻しない
- ログインなしで全機能が使える
- 課金要素が一切ない
