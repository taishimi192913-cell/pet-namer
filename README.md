# Sippomi

Sippomi は、ペットの名前診断とお迎え準備をひとつにつなぐ Vite ベースのサイトです。  
トップページの診断 UI に加えて、犬・猫・うさぎ向けの SEO ページ、お迎えガイド、読みもの、飼い主向けコミュニティの入口を同居させています。

## クイックスタート

```bash
cd /Users/shimizutaiga/Projects/apps/sippomi
npm install
cp .env.example .env
npm run dev
```

開発サーバーは通常 `http://localhost:5173` で起動します。

UI やコピーの修正だけなら、`.env` は初期値のままでも進められます。  
Supabase / Turnstile / Sentry が必要なのは、ログイン、お気に入り保存、コミュニティ、本番監視まで触るときです。

セットアップの全体像は [docs/setup-stack.md](./docs/setup-stack.md) にまとめています。  
どこを編集すればよいかは [docs/edit-map.md](./docs/edit-map.md) を見ればすぐ追えます。

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
npm run verify:deployment -- https://sippomi.com
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

## 現在のブランド構成

- ブランド名: `シッポミ | Sippomi`
- コア価値: 名前を決めるところから、お迎え準備までやさしくつなぐ
- 主な導線:
  - 名前診断
  - お迎え準備
  - 暮らしのヒント
  - 飼い主SNS
  - 将来の商品導線

現在の詳細なコンテキストは [docs/project-context.md](./docs/project-context.md) にまとめています。

## フォルダ構成

- [src](./src): フロントエンド本体
- [public](./public): 画像、OGP、robots、sitemap などの静的資産
- [data](./data): 名前候補、苗字DB、有名人ペット名鑑データ
- [api](./api): Vercel Functions
- [scripts](./scripts): ビルド補助スクリプト
- [tests](./tests): 軽量テスト
- [supabase](./supabase): local CLI config / migration / seed
- [docs/edit-map.md](./docs/edit-map.md): 「この変更はどこを触るか」の早見表

## 実装済みの基盤

- Supabase local config
- `profiles` / `favorite_names` の migration
- RLS つきのお気に入り保存 API
- Supabase Auth パネル
- 飼い主SNS用の community API / migration
- 日本の苗字DBを使った苗字相性診断
- 有名人・名作・話題のペット名鑑
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
npm run verify:deployment -- https://sippomi.com
```

詳しい流れは [docs/deployment-checklist.md](./docs/deployment-checklist.md) にまとめています。

## あなたの作業が必要な項目

- Supabase にログインして remote project を作る
- Vercel に環境変数を登録する
- Cloudflare Turnstile の site key / secret を発行する
- Sentry の DSN を発行する

これらはアカウント権限が必要なので、コードから自動確定はできません。
