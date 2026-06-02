#!/bin/bash
# ============================================================
# Sippomi name-matcher iOS ビルド・提出スクリプト
# 使い方:
#   ./scripts/build-ios.sh          # EAS Build (production)
#   ./scripts/build-ios.sh preview  # TestFlight用プレビュー
#   ./scripts/build-ios.sh local    # ローカルXcodeアーカイブ
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📱 Sippomi name-matcher iOS ビルド"
echo "======================================"

# --- 環境変数チェック ---
if [ ! -f .env ]; then
  echo "⚠️  .env ファイルがありません。"
  echo "   .env.example をコピーして .env を作成し、"
  echo "   SupabaseのURLとキーを設定してください。"
  echo "   (Supabaseがなくてもアプリは動作しますが、"
  echo "    名前データが空になります)"
  exit 1
fi

MODE="${1:-production}"

case "$MODE" in
  production)
    echo "モード: Production (App Store 提出用)"
    npx eas build --platform ios --profile production
    echo ""
    echo "✅ ビルド完了！"
    echo "   次のコマンドで提出: npx eas submit --platform ios --profile production"
    ;;

  preview)
    echo "モード: Preview (TestFlight 配信用)"
    npx eas build --platform ios --profile preview
    ;;

  local)
    echo "モード: ローカル Xcode ビルド"
    echo "  Step 1: Expo prebuild"
    npx expo prebuild --platform ios --clean
    echo ""
    echo "  Step 2: Xcode Archive"
    cd ios
    xcodebuild -workspace app.xcworkspace \
      -scheme app \
      -configuration Release \
      -archivePath ./build/sippomi.xcarchive \
      archive
    echo ""
    echo "✅ ローカルビルド完了！"
    echo "   アーカイブ: ios/build/sippomi.xcarchive"
    echo "   Xcode → Organizer から提出できます"
    ;;

  *)
    echo "エラー: 不明なモード '$MODE'"
    echo "使い方: $0 [production|preview|local]"
    exit 1
    ;;
esac
