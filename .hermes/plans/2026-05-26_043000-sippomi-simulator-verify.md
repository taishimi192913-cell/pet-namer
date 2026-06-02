# Plan: Sippomi ローカル確認 — iOS Simulator 起動 + Web HP

**作成日時**: 2026-05-26 13:30
**目的**: 機能修正後の Web HP と iOS アプリをローカルで起動し、ユーザーが目視確認できる状態にする

---

## 現状

| 対象 | 状態 |
|------|------|
| Web HP (Vite) | localhost:5176 で稼働中（proc_e29743d84c74, PID 27849） |
| Expo Dev Server | localhost:19000 で稼働中（proc_8083ecea38cf, PID 28281） |
| iOS ネイティブビルド | `ios/` ディレクトリあり。`petnamer.xcodeproj` と Pods インストール済み |
| 利用可能な Simulator | iPhone 17 Pro (iOS 26.4), iPhone 17 Pro Max, iPad Pro など |
| 修正内容（直近コミット） | `hp-improvement-v5`: デザイン強化、名前拡充、ジャーナルUX、セキュリティ監査 |

---

## Step-by-step Plan

### Step 1: Expo Dev Server の稼働確認

- Expo Dev Server が `http://localhost:19000` で応答していることを curl で再確認
- 応答に `"sdkVersion":"54.0.0"` と `"bundleIdentifier":"com.shippomi.name-matcher"` が含まれていること

### Step 2: iOS Simulator ビルド & 起動

以下のコマンドを実行する（Expo managed workflow + `ios/` ディレクトリ既存のため、`expo run:ios` を使用）:

```bash
cd /Users/shimizutaiga/Projects/sippomi/apps/name-matcher

# シミュレーターを起動（iPhone 17 Pro, iOS 26.4）
xcrun simctl boot "iPhone 17 Pro"

# Simulator.app を前面に表示
open -a Simulator

# Expo でビルド → シミュレーターにインストール → 起動
npx expo run:ios --device "iPhone 17 Pro"
```

**所要時間見積もり**: 
- 初回 or キャッシュクリア後: 3〜5分（Metro bundler + Xcode ビルド）
- キャッシュあり: 1〜2分

**注意点**:
- `ios/` ディレクトリの `petnamer.xcodeproj` があり Pods もインストール済みなので、`expo prebuild` は不要
- `--device "iPhone 17 Pro"` で明示的にシミュレーターを指定すれば、どの端末にインストールするか迷わない
- ビルド中はターミナルに進捗が表示される。エラーが発生した場合はログを確認

### Step 3: Web HP の稼働確認

- Vite Dev Server が `http://localhost:5176` で応答（HTTP 200）していることを curl で再確認
- すでに起動済みのため、再起動は不要

### Step 4: 確認結果の提示

- iOS: シミュレーターが起動しアプリ画面が表示されたら「iOSアプリ起動完了」と報告
- Web: localhost:5176 のURLを再提示
- ユーザーは両方をそのまま目視確認すればよい

---

## ファイル変更

なし（起動・確認のみ。コード変更は行わない）

---

## 検証

- [x] Web HP: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5176` → 200
- [ ] iOS: Simulator 上で Sippomi アプリが起動し、IntroScreen → FormScreen → SwipeScreen → ResultsScreen の遷移が正常
- [ ] iOS: ダークモード・ライトモード両方で表示崩れなし

---

## リスク・トレードオフ

| リスク | 対策 |
|--------|------|
| `expo run:ios` が Pods のバージョン不一致で失敗 | `cd ios && pod install --repo-update` を先に実行 |
| Metro bundler のポート競合 | 既存の Expo Dev Server (19000) と競合する場合、既存プロセスを kill |
| Xcode ビルドがタイムアウト | 初回ビルドは最大5分。それ以上かかる場合は DerivedData クリア (`rm -rf ~/Library/Developer/Xcode/DerivedData`) |
| Simulator が既に起動済み | `xcrun simctl boot` は既に起動中の場合はエラーにならないのでそのまま続行 |

---

## ユーザーのアクション

1. Web HP → ブラウザで http://localhost:5176 を開く
2. iOS App → シミュレーターが自動起動するので画面を確認する

以上で完了。
