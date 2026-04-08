# pet-namer

ペットの種類や雰囲気から名前候補を提案する、Vite ベースの静的サイトです。  
トップページの診断 UI と、犬・猫・うさぎ向けの SEO ページを同居させています。

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

## 利用できるコマンド

```bash
npm run dev      # ローカル開発
npm run lint     # ESLint
npm run test     # node:test による軽量チェック
npm run build    # Vite build
npm run check    # lint + test + build をまとめて実行
npm run preview  # build 済み成果物の確認
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run verify:deployment -- https://pet-namer.vercel.app
```

## 環境変数

最低限の雛形は [.env.example](./.env.example) にあります。

- `SITE_URL`: 本番 URL
- `PUBLIC_SITE_URL`: ローカルやプレビューで使う公開 URL
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

## フォルダ構成

- [src](./src): フロントエンド本体
- [public](./public): 画像、OGP、robots、sitemap などの静的資産
- [data](./data): 名前候補データ
- [api](./api): Vercel Functions
- [scripts](./scripts): ビルド補助スクリプト
- [tests](./tests): 軽量テスト
- [supabase](./supabase): local CLI config / migration / seed

## 実装済みの基盤

- Supabase local config
- `profiles` / `favorite_names` の migration
- RLS つきのお気に入り保存 API
- Supabase Auth パネル
- Turnstile 連携用のサーバー検証
- Sentry Browser SDK の初期化
- デプロイ確認スクリプト

## 運用フロー

ローカルでは、PR や push の前に次を実行します。

```bash
npm run check
```

GitHub では [ci.yml](./.github/workflows/ci.yml) が `push` と `pull_request` のたびに走り、同じチェックを自動実行します。

Preview / Production の確認は次で行えます。

```bash
npm run verify:deployment -- https://pet-namer.vercel.app
```

詳しい流れは [docs/deployment-checklist.md](./docs/deployment-checklist.md) にまとめています。

## あなたの作業が必要な項目

- Supabase にログインして remote project を作る
- Vercel に環境変数を登録する
- Cloudflare Turnstile の site key / secret を発行する
- Sentry の DSN を発行する

これらはアカウント権限が必要なので、コードから自動確定はできません。
