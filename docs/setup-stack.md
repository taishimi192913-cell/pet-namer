# Sippomi Setup Memo

Sippomi は Vite + Vercel + Supabase を前提にしたブランドサイトです。  
「まずローカルで触れる状態にする」と「本番用の外部サービスをつなぐ」は分けて考えると進めやすいです。

## まずローカルで動かす

```bash
cd /Users/shimizutaiga/Projects/apps/sippomi
npm install
cp .env.example .env
npm run dev
```

開発サーバーは通常 `http://localhost:5173` で開きます。

## バイブコーディングを始めるだけなら

UI や文言の修正だけなら、`.env` は初期値のままでもかなり進められます。  
ただし、次を触るときは外部設定が必要です。

- お気に入り保存
- ログイン
- コミュニティ投稿
- Turnstile 付きフォーム
- 本番のエラー監視

## 外部サービスで実際に必要なセットアップ

### 1. Vercel

このディレクトリはすでに `.vercel/project.json` で Vercel にリンクされています。

確認コマンド:

```bash
npx vercel whoami
npx vercel project inspect
```

必要な作業:

1. Vercel にログインする
2. Preview / Production に環境変数を入れる
3. 必要なら Vercel ダッシュボード側の project 名も `sippomi` に寄せる

よく使うコマンド:

```bash
npx vercel pull --yes
npx vercel env ls
npx vercel --prod
```

### 2. Supabase

必要になる場面:

- ログイン
- お気に入り保存
- コミュニティ
- 将来のフォーム保存や管理画面

やること:

1. Supabase ダッシュボードで project を作る
2. `.env` に以下を入れる
3. 同じ値を Vercel にも登録する
4. 必要なら `supabase/migrations` を remote に反映する

最低限必要な変数:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

ローカル Supabase を使うとき:

```bash
npm run supabase:start
npm run supabase:reset
```

### 3. Cloudflare Turnstile

必要になる場面:

- 投稿フォーム
- 問い合わせ
- Bot 対策つきの送信 API

やること:

1. Turnstile site を作る
2. `TURNSTILE_SITE_KEY` を `.env` と Vercel に入れる
3. `TURNSTILE_SECRET_KEY` はサーバー側だけに入れる

### 4. Sentry

必要になる場面:

- 本番公開後の JS エラー監視
- 不具合調査

やること:

1. Sentry project を作る
2. `SENTRY_DSN` を `.env` と Vercel に入れる
3. Source map を上げる運用をするなら `SENTRY_AUTH_TOKEN` も追加する

## いま埋めるべきファイル

- `.env`: ローカル開発用
- `.env.example`: チーム共有用のひな形
- `vercel.json`: デプロイ設定と security headers
- `supabase/config.toml`: local Supabase 設定

## おすすめの順番

1. `npm run dev` で UI を触れる状態にする
2. ペット向け HP の文言やデザインを先に詰める
3. お気に入りやログインが必要になったら Supabase をつなぐ
4. 投稿フォームを作る段階で Turnstile を足す
5. 公開直前に Sentry を入れる
