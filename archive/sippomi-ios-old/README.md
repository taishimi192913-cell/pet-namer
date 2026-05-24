# Sippomi iOS

Expo ベースの iOS アプリです。全体設計は [docs/ios-swipe-app-plan.md](/Users/shimizutaiga/Projects/apps/sippomi/docs/ios-swipe-app-plan.md) を参照してください。

## 今回入れたもの

- `Step 1-4` のインテーク
- スワイプ型の `Like / Pass / Hold`
- 好み学習の簡易サマリー
- 既存 `Sippomi` ロジックを元にした shared recommendation core

## 起動

```bash
cd apps/ios
npm run ios
```

Expo で iPhone Simulator を開きます。

## Xcode で開きたい場合

ネイティブの `ios/` プロジェクトが必要な場合は、次を実行します。

```bash
cd apps/ios
npx expo prebuild --platform ios
```

その後、生成された `ios/*.xcworkspace` を Xcode で開けます。
