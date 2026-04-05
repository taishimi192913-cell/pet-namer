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
```

## 環境変数

最低限の雛形は [.env.example](./.env.example) にあります。

- `SITE_URL`: 本番 URL
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `SENTRY_DSN`

## フォルダ構成

- [src](./src): フロントエンド本体
- [public](./public): 画像、OGP、robots、sitemap などの静的資産
- [data](./data): 名前候補データ
- [api](./api): Vercel Functions
- [scripts](./scripts): ビルド補助スクリプト
- [tests](./tests): 軽量テスト
- [supabase](./supabase): 将来の DB / migration 用

## 運用フロー

ローカルでは、PR や push の前に次を実行します。

```bash
npm run check
```

GitHub では [ci.yml](./.github/workflows/ci.yml) が `push` と `pull_request` のたびに走り、同じチェックを自動実行します。

## 今後の未整備項目

- Supabase の初期化と migration 管理
- Turnstile の実装
- Sentry の本番導入
- README のスクリーンショット追加
