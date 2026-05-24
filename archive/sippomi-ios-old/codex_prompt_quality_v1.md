# Codex Prompt — Sippomi iOS: 品質磨き込み（行動ガイド準拠）

## 対象
```
/Users/shimizutaiga/Projects/iosアプリ/sippomi-ios/
```
Expo SDK 54, React Native 0.81.5, TypeScript, React Navigation

## 最重要
- **MVPを壊さない**。Intro→Form→Swipe→Results のフローは維持
- AGENTS.md に定義された禁止事項を絶対に守る（#000/#fff不使用、Material Design不使用、ランダムな余白値禁止）
- Metroバンドルが通ること（`npx expo start` → エラー0）
- 全機能無料。課金禁止

## コアルール
1. 1セッション1タスク、終わったらSTOP
2. tasks.json → 作業 → 検証 → progress.txt → STOP
3. 同一エラー3回連続で打ち切り
4. `npx tsc --noEmit` で毎回型チェック
5. 既存コードパターン・命名規則を必ず踏襲

---

## 品質基準（AGENTS.md / rules/ios-development.md より）

### スペーシング：4px倍数に統一

現在の問題：marginTopに 10, 14, 18, 20, 22, 24, 26, 28, 30 等のランダム値が多数混在

修正後の基準値（これ以外使わない）：
```
gap / margin-xs:   4
gap / margin-sm:   8
gap / margin-md:   16
gap / margin-lg:   24
gap / margin-xl:   32
padding-sm:        12
padding-md:        16
padding-lg:        24
padding-xl:        32
```

### フォントサイズ：5段階に制限

現在：12, 13, 14, 15, 16, 17, 18, 20, 24, 28, 34, 42, 44 の13種類が混在

修正後：以下の5段階のみ使用（React Native では `allowFontScaling={true}` がデフォルトで有効）
```
caption:  12 (補足、注釈、eyebrow)
body:     15 (本文、chip、意味文)
subhead:  17 (セクションタイトル、insightTitle、summaryTitle)
title:    24 (画面タイトル、swipeTitle)
hero:     34 (カード名前、modalタイトル)
```

### 角丸：統一スケール

現在：18, 20, 24, 28, 30, 36, 40, 999 の8種類

修正後：
```
radius-sm:  12  (小さなボタン、chip、scorePill)
radius-md:  18  (ボタン、section、summaryCard、iconButton)
radius-lg:  24  (カード、speciesCard、heroCard、form section)
radius-xl:  36  (スワイプカード、モーダル)
radius-full: 999 (chip、tag)
```

### カラー：純白禁止・直指定禁止

現在の問題：
- `#FFFFFF` / `#ffffff` が speciesCard, chip, scorePill, nameModalReasonCard, resultRowRanked, iconButton で使われている
- ハードコードされた色文字列多数（`#5F5246`, `#8c7b6f`, `#6d5e53`, `#7b553d`, `#cfbaa8`, `#fdf2e8`, `#d9c6b8` 等）

修正：
- `#FFFFFF` / `#ffffff` → `#FFFAF4`（palette.card）に置換
- ハードコード文字列 → palette から参照するか theme.ts に集約
- ダークモードの darkPalette にも対応値を定義

### タップ領域：最低44pt

現在：iconButton が 40×40 でHIG基準未達。actionButton の paddingVertical が 16（高さ不足の可能性）

修正：
- iconButton: 44×44 に拡大
- 全 Pressable に `hitSlop` または十分な `padding` を確保
- actionButton: minHeight: 52 を確保（paddingVertical: 16 + テキスト高さ ≥ 44）

### アクセシビリティ：全インタラクティブ要素にラベル

現在：全 Pressable / アイコンボタンに `accessibilityLabel` 未設定。VoiceOver 非対応。

修正：
- アイコンボタン全箇所に `accessibilityLabel` を付与
  - 戻るボタン: "戻る"
  - Likeボタン: "この名前が気に入った"
  - Passボタン: "この名前をスキップ"
  - Holdボタン: "この名前を保存"
  - 共有ボタン: "結果を共有"
  - 設定ボタン: "設定"
  - 閉じるボタン: "閉じる"
  - 各種カード: "名前の詳細を見る"
- `accessibilityRole="button"` を Pressable に付与
- スワイプ操作に代替アクションを提供（Like/Passボタンで代替可能なのでOK）
- 装飾的要素（ドット背景、モーダルドラッグハンドル、シルエットSVG）に `accessibilityElementsHidden={true}`

### ローディング・空状態：全データ画面に実装

現在の問題：
- App.tsx: 永続化データ読み込み中（hydration）に UI 表示がない
- ResultsScreen: Like一覧・保存一覧が空の場合の Empty State はあるが、ローディング中表示なし

修正：
- App.tsx に `isHydrated` が false の間のスプラッシュ/ローディング表示を追加
  - 例: 中央にロゴ + "読み込み中..." テキスト
- データ永続化のエラーハンドリング追加
  - loadPersistedSession / loadFavoriteCandidates の失敗時にエラー表示
  - 再試行ボタン

---

## サブタスク

### Phase A: スペーシング統一（styles.ts）
1. styles.ts の全 `marginTop` / `marginBottom` / `gap` / `padding` / `paddingVertical` / `paddingHorizontal` を4px倍数に統一。10→8/12、14→12/16、18→16、20→20(OK)、22→24、26→24、28→28(OK)、30→32。隣接する値をマージして最も近い4px倍数に
2. `formScrollContent` の padding:20→padding:24, paddingBottom:34→40
3. `heroCard` の padding:28→padding:24、borderRadius:28→24
4. `heroTitle` の fontSize:34→34(OK, hero tier)、lineHeight:42→44
5. `heroBody` の fontSize:16→15(body tier)、lineHeight:26→24
6. `heroBullet` の fontSize:15→15(OK)、lineHeight:22→24
7. `primaryButton` の borderRadius:18→18(OK)、paddingVertical:16→16(OK)
8. `section` の marginTop:18→24、padding:18→16、borderRadius:24→24(OK)
9. `speciesCard` の borderRadius:24→24(OK)、padding:14→16
10. `swipeShell` の padding:18→24
11. `insightCard` の marginTop:16→16(OK)、padding:18→16、borderRadius:24→24(OK)
12. `card` の borderRadius:36→36(OK)、padding:24→24(OK)
13. `cardName` の fontSize:42→44(OK, hero tier)、marginTop:26→24
14. `cardMeaning` の marginTop:16→16(OK)、fontSize:16→15(body tier)
15. `scorePill` の borderRadius:18→18(OK)、paddingVertical:12→12(OK)
16. `actionsRow` の marginTop:16→16(OK)、gap:12→16
17. `summaryCard` の marginTop:16→16(OK)、padding:18→16、borderRadius:24→24(OK)
18. `resultsContent` の padding:20→24、paddingBottom:34→40
19. `resultRowGold/Silver/Bronze` の borderLeftWidth:4→4(OK)
20. `nameModalCard` の paddingHorizontal:22→24、paddingTop:10→8
21. `nameModalTitle` の fontSize:44→44(OK, hero tier)、marginTop:8→8(OK)
22. `nameModalMeaning` の marginTop:16→16(OK)、fontSize:16→15(body tier)
23. `nameModalReasonCard` の marginTop:20→24
24. `modalCloseButton` の marginTop:22→24、paddingVertical:15→16
25. `emptyCardBody` の marginTop:12→12(OK)

### Phase B: フォントサイズ5段階統一（styles.ts）

26. styles.ts の全 `fontSize` を以下の5段階に分類し直す：
    - caption(12): eyebrow(12→12), scorePillLabel(12), modalEyebrow(12), resultRowAction(12), rankBadgeText(14→12)
    - body(15): heroBody(16→15), formBody(15→15), sectionBody(default→15), cardMeaning(16→15), summaryLine(default→15), resultsLead(16→15), resultRowBody(default→15), nameModalMeaning(16→15), nameModalReasonText(15→15), emptyCardBody(15→15)
    - subhead(17): sectionTitle(18→17), insightTitle(17→17), summaryTitle(18→17), speciesCardText(15→17), cardScore(18→17), cardReading(16→17), cardLabel(13→17), nameModalSectionTitle(16→17), resultRowName(16→17), preferenceChartTitle(16→17)
    - title(24): formTitle(28→24), swipeTitle(24→24), emptyCardTitle(24→24)
    - hero(34): heroTitle(34→34), cardName(42→34), nameModalTitle(44→34)
27. 対応する darkPalette スタイル名も変更に合わせて調整
28. `npx tsc --noEmit` で型エラー0を確認

### Phase C: 角丸統一（styles.ts）

29. 角丸を以下に統一：
    - radius-sm(12): scorePill(18→12), metaChip(999→12)
    - radius-md(18): primaryButton(18→18), secondaryButton(18→18), actionButton(18→18), modalCloseButton(18→18), resultRowRanked(18→18), nameModalScoreText(999→18), rankBadge(17→18)
    - radius-lg(24): heroCard(28→24), speciesCard(24→24), insightCard(24→24), summaryCard(24→24), nameModalReasonCard(20→24), heroSilhouetteBubble(24→24), section(24→24)
    - radius-xl(36): card(36→36)
    - radius-full(999): chip(999→999), nameModalTag(999→999), metaChip(12→999)、nameModalScoreText(18→999)
30. iconButton / iconButtonMuted の borderRadius:20→24 (44×44 の半分 = 22 だが、近い 24 を使用して完全な円にはしない)
31. `npx tsc --noEmit` で型エラー0を確認

### Phase D: カラー純白排除・直指定排除（styles.ts + theme.ts）

32. styles.ts から以下の `#FFFFFF` / `#ffffff` を `palette.card` (`#FFFAF4`) に置換：
    - iconButton backgroundColor: '#FFFFFF' → palette.card
    - speciesCard backgroundColor: '#FFFFFF' → palette.card  
    - chip backgroundColor: '#ffffff' → palette.card
    - scorePill backgroundColor: '#ffffff' → palette.card
    - resultRowRanked backgroundColor: '#FFFFFF' → palette.card
    - nameModalReasonCard backgroundColor: '#FFFFFF' → palette.card
33. styles.ts から `.disabled` のハードコード色を palette 参照に置換
34. darkPalette (theme.ts) の全カラー値に #000000 / #FFFFFF が含まれていないか確認。`#000000` shadowColor は影用なので許容
35. `npx tsc --noEmit` で型エラー0を確認

### Phase E: タップ領域44pt確保（styles.ts + 各コンポーネント）

36. iconButton / iconButtonMuted: width/height 40→44, borderRadius 24→22（44の半分）
37. actionButton: minHeight: 52 を全 actionButton に追加（paddingVertical:16 + フォント20px相当 ≥ 52 > 44）
38. screenHeaderRow の戻るボタンに十分な hitSlop があるか確認（44×44 を確保）
39. textButton も Pressable 内にありタップ領域が狭い可能性 → `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` で44pt確保
40. SwipeCard のタップ領域: cardHeader の Pressable、cardName の Pressable が44pt以上あるか確認

### Phase F: アクセシビリティ実装（全コンポーネント + 全画面）

41. App.tsx: 全 Pressable に `accessibilityLabel` + `accessibilityRole="button"` 追加
    - 「結果へ」ボタン: accessibilityLabel="結果画面へ移動"
    - Pass/Hold/Like ボタン: 適切なラベル
42. FormScreen.tsx: 全 Pressable + Chip + SpeciesOptionCard にラベル
    - 戻るボタン: "条件入力へ戻る"
    - 各種Chip: 既に label テキストがあるのでOK（子テキストが読まれる）
    - SpeciesOptionCard: `accessibilityLabel="ペットの種類: {label} {active ? '選択中' : ''}"`
    - 「スワイプ診断へ進む」ボタン: accessibilityLabel="条件を確定して名前のスワイプ診断へ進む"
43. ResultsScreen.tsx: 全 Pressable + ランキング行にラベル
    - ランキング行: `accessibilityLabel="{index+1}位: {name}, {meaning}"`
    - 「もう少しスワイプする」/「条件入力からやり直す」: 適切なラベル
44. NameDetailModal.tsx: Modal + Pressable
    - 閉じるバックドロップ: accessibilityLabel="閉じる"
    - 閉じるボタン: accessibilityLabel="詳細を閉じる"
    - modalHandle: `accessibilityElementsHidden={true}` (装飾)
    - タグ一覧: `accessibilityLabel="タグ: {tags.join(', ')}"`
45. SwipeCard.tsx: 
    - cardHeader Pressable: `accessibilityLabel="名前の詳細を開く: {candidate.item.name}"`
    - スコアピル: `accessibilityLabel="{label}: {value}%"` 
46. IntroScreen.tsx: 全 Pressable にラベル
47. BackgroundDots.tsx: 装飾要素なので `accessibilityElementsHidden={true}` または `importantForAccessibility="no"`
48. PetSilhouette.tsx: 装飾要素なので同様に対応
49. 全 icon-only ボタン（Ionicons のみの Pressable）に `accessibilityLabel` 追加

### Phase G: ローディング・エラー状態（App.tsx + persistence.ts）

50. App.tsx: `isHydrated` が false の間、中央にスプラッシュ表示
    - アプリアイコン風のロゴ + ActivityIndicator
    - `accessibilityLabel="読み込み中"`
51. persistence.ts: loadPersistedSession / loadFavoriteCandidates を try-catch でラップ
    - エラー時は `console.error` + `return null`（クラッシュさせない）
52. App.tsx: persistence読み込み失敗時のフォールバック動作確認
    - 読み込み失敗時もアプリが動作すること（デフォルトセッションで開始）
53. savePersistedSession / saveFavoriteCandidate も try-catch で保護
    - 保存失敗は `console.error` のみ、UIは止めない

### Phase H: 検証と仕上げ

54. `npx tsc --noEmit` で型エラー0
55. `npx expo start` でバンドル成功
56. Intro→Form→Swipe→Results 全画面遷移が正常動作
57. ダークモード切替で全画面表示崩れなし
58. VoiceOver ON で全画面の操作が可能（実機がない場合はコード上でラベルが全箇所にあることを確認）
59. 完了マーカー `completion_marker_quality_v1.md` に変更ファイル一覧・検証結果・残リスクを記録

---

## 成功基準
- 全59タスク完了
- スペーシングが4px倍数に統一
- フォントサイズが5段階に統一（caption/body/subhead/title/hero）
- 角丸が統一スケール（12/18/24/36/999）
- 純白(#FFFFFF) 不使用
- 全インタラクティブ要素が44pt以上
- 全インタラクティブ要素に accessibilityLabel 付与
- ローディング中表示あり
- エラーハンドリングあり（クラッシュしない）
- `npx expo start` バンドルエラー0
- `npx tsc --noEmit` 型エラー0
- 課金ゼロ

---

> 本プロンプトは AGENTS.md / rules/ios-development.md の品質基準に基づく。
> 禁止事項（Material Design, #000/#fff, ランダム余白値, any型, 空状態見過ごし）を絶対に守ること。
