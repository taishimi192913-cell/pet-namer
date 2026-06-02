# Sippomi iOS — App Store 提出ガイド

**最終更新**: 2026-06-01
**対象アプリ**: `apps/name-matcher/` (Expo SDK 54 + RN 0.81.5)
**Bundle ID**: `com.shippomi.name-matcher`

---

## 前提条件（事前に用意するもの）

### Apple Developer Program
- [ ] Apple Developer Program 登録済み（$99/年）
  - https://developer.apple.com/programs/
- [ ] Apple ID（デベロッパーアカウント）
- [ ] チームID（App Store Connect → メンバーシップで確認）
  ```
  Team ID: _______________
  ```

### App Store Connect
- [ ] App Store Connect で新規アプリを作成済み
  - Bundle ID: `com.shippomi.name-matcher`
  - アプリ名: `しっぽみ - ペットの名前診断`
- [ ] App ID（ASC App ID）をメモ:
  ```
  Apple ID: _______________
  ```

### 環境変数
- [ ] `.env` ファイルを作成（Supabase URL と Anon Key）
  ```bash
  cp .env.example .env
  # .env を編集して実際の値を入れる
  ```

### EAS Project（EAS Build を使う場合のみ）
- [ ] EAS アカウント作成: https://expo.dev
- [ ] EAS プロジェクト作成後、プロジェクトIDをメモ:
  ```
  EAS Project ID: _______________
  ```

---

## 提出前に設定する値（4箇所）

以下の4つの値は実際のものに書き換えてください。

1. **`app.json`** → `extra.eas.projectId` → `"YOUR_EAS_PROJECT_ID"` を実際のIDに
2. **`app.json`** → `ios.appStoreUrl` → `"YOUR_APP_STORE_ID"` を実際のIDに
3. **`eas.json`** → `submit.production.ios.appleId` → あなたのApple ID
4. **`eas.json`** → `submit.production.ios.ascAppId` → App Store ConnectのApp ID
5. **`eas.json`** → `submit.production.ios.appleTeamId` → Apple Developer Team ID

---

## 提出手順（EAS Build + Submit）

```bash
cd /Users/shimizutaiga/Projects/sippomi/apps/name-matcher

# 1. EAS CLIをインストール（初回のみ）
npm install -g eas-cli

# 2. Expo にログイン（初回のみ）
npx eas login

# 3. EAS Build を実行（本番用）
npx eas build --platform ios --profile production

# 4. ビルドが完了したら TestFlight に提出
npx eas submit --platform ios --profile production
```

---

## 代替: ローカルXcodeビルド（EAS不要）

Apple Developerアカウントだけでビルドする場合：

```bash
cd /Users/shimizutaiga/Projects/sippomi/apps/name-matcher

# 1. Expo prebuild（ネイティブコード生成）
npx expo prebuild --platform ios --clean

# 2. Xcode で開く
open ios/app.xcworkspace

# 3. Xcode内で:
#    - チーム（Team）を自分のApple Developerチームに設定
#    - Product → Scheme → app (Release) を選択
#    - Any iOS Device (arm64) でビルド
#    - Product → Archive
#    - Organizer から App Store Connect に提出
```

---

## プライバシーポリシーの公開（必須）

- プライバシーポリシーの内容: `PRIVACY_POLICY.md`
- 公開URL: `https://sippomi.com/privacy` にホスティングする必要あり
- 内容をsippomi.comのWebサイトに掲載してから提出すること

---

## 提出前チェックリスト

### ✅ 確認済み
- [x] TypeScript コンパイルエラーなし (`npx tsc --noEmit`)
- [x] テスト全件パス
- [x] アプリアイコン 1024x1024 設定済み
- [x] スプラッシュスクリーン設定済み
- [x] プライバシーマニフェスト完備
- [x] ダークモード対応
- [x] 非暗号化申告 (`ITSAppUsesNonExemptEncryption: false`)
- [x] 日本語完全ローカライズ
- [x] iPad対応
- [x] アカウント不要（全機能オフライン利用可能）
- [x] アプリ内課金なし・広告なし（完全無料）

### ⚠️ あなたが設定する必要があるもの
- [ ] `.env` ファイルの作成（Supabase URL/Key）
- [ ] `app.json` の `YOUR_EAS_PROJECT_ID` を実際の値に
- [ ] `app.json` の `YOUR_APP_STORE_ID` を実際の値に
- [ ] `eas.json` の Apple ID / Team ID / App ID
- [ ] `https://sippomi.com/privacy` へのプライバシーポリシー公開
- [ ] App Store Connect でアプリのメタデータ入力
- [ ] スクリーンショット（5枚以上）の撮影・アップロード

---

## トラブルシューティング

| 問題 | 対処 |
|------|------|
| `EAS CLI not found` | `npm install -g eas-cli` |
| `Metro bundler timeout` | `npx expo start --clear` |
| `RNCAsyncStorage null` | 実機では動く。メモリフォールバックあり |
| Archive ビルド失敗 | `npx expo prebuild --platform ios --clean` を再実行 |
| TestFlight upload "Missing Compliance" | App Store Connect → ビルド → Export Compliance で「No」 |
