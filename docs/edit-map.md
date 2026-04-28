# Sippomi Edit Map

ペット向け HP を変えたいときに、最初に見るための早見表です。  
迷ったらまずこのファイルから当たりをつけてください。

## まずここを見る

- ブランド全体の状況: [docs/project-context.md](/Users/shimizutaiga/Projects/apps/sippomi/docs/project-context.md)
- セットアップ手順: [docs/setup-stack.md](/Users/shimizutaiga/Projects/apps/sippomi/docs/setup-stack.md)
- トップページ本体: [index.html](/Users/shimizutaiga/Projects/apps/sippomi/index.html)

## よくある変更と編集先

- トップページの見出し、導線、セクション順を変えたい
  - [index.html](/Users/shimizutaiga/Projects/apps/sippomi/index.html)

- 診断の質問内容や結果ロジックを変えたい
  - [src/constants.js](/Users/shimizutaiga/Projects/apps/sippomi/src/constants.js)
  - [src/diagnosis.js](/Users/shimizutaiga/Projects/apps/sippomi/src/diagnosis.js)
  - [src/render.js](/Users/shimizutaiga/Projects/apps/sippomi/src/render.js)
  - [src/main.js](/Users/shimizutaiga/Projects/apps/sippomi/src/main.js)

- 名前候補データを増やしたい、調整したい
  - [data/names.json](/Users/shimizutaiga/Projects/apps/sippomi/data/names.json)
  - [src/name-enrichment.js](/Users/shimizutaiga/Projects/apps/sippomi/src/name-enrichment.js)

- 苗字相性診断を変えたい
  - [src/surname-diagnosis.js](/Users/shimizutaiga/Projects/apps/sippomi/src/surname-diagnosis.js)
  - [data/japanese-surnames.json](/Users/shimizutaiga/Projects/apps/sippomi/data/japanese-surnames.json)
  - [scripts/build-surnames.mjs](/Users/shimizutaiga/Projects/apps/sippomi/scripts/build-surnames.mjs)

- デザインや色、余白、カード見た目を変えたい
  - [src/styles/global.css](/Users/shimizutaiga/Projects/apps/sippomi/src/styles/global.css)
  - [src/styles/layout.css](/Users/shimizutaiga/Projects/apps/sippomi/src/styles/layout.css)
  - [src/styles/components.css](/Users/shimizutaiga/Projects/apps/sippomi/src/styles/components.css)
  - [src/styles/pages.css](/Users/shimizutaiga/Projects/apps/sippomi/src/styles/pages.css)
  - デザイン方針メモ: [DESIGN.md](/Users/shimizutaiga/Projects/apps/sippomi/DESIGN.md)

- 犬・猫・うさぎの SEO ページを直したい
  - [dog-names.html](/Users/shimizutaiga/Projects/apps/sippomi/dog-names.html)
  - [cat-names.html](/Users/shimizutaiga/Projects/apps/sippomi/cat-names.html)
  - [rabbit-names.html](/Users/shimizutaiga/Projects/apps/sippomi/rabbit-names.html)

- お迎え準備や記事ページを増やしたい
  - [welcome-prep.html](/Users/shimizutaiga/Projects/apps/sippomi/welcome-prep.html)
  - [journal-first-days.html](/Users/shimizutaiga/Projects/apps/sippomi/journal-first-days.html)
  - [journal-home-safety.html](/Users/shimizutaiga/Projects/apps/sippomi/journal-home-safety.html)
  - [journal-first-shopping.html](/Users/shimizutaiga/Projects/apps/sippomi/journal-first-shopping.html)
  - [starter-set.html](/Users/shimizutaiga/Projects/apps/sippomi/starter-set.html)

- 画像やロゴ、OGP を変えたい
  - [public](/Users/shimizutaiga/Projects/apps/sippomi/public)
  - ロゴ: [public/sippomi-mark.svg](/Users/shimizutaiga/Projects/apps/sippomi/public/sippomi-mark.svg)
  - OGP: [public/sippomi-ogp.svg](/Users/shimizutaiga/Projects/apps/sippomi/public/sippomi-ogp.svg)

- ログインやお気に入り保存を変えたい
  - [src/auth.js](/Users/shimizutaiga/Projects/apps/sippomi/src/auth.js)
  - [api/favorites.js](/Users/shimizutaiga/Projects/apps/sippomi/api/favorites.js)
  - [api/public-config.js](/Users/shimizutaiga/Projects/apps/sippomi/api/public-config.js)
  - [api/_lib/supabase.js](/Users/shimizutaiga/Projects/apps/sippomi/api/_lib/supabase.js)

- 飼い主コミュニティを変えたい
  - [src/community.js](/Users/shimizutaiga/Projects/apps/sippomi/src/community.js)
  - [api/community.js](/Users/shimizutaiga/Projects/apps/sippomi/api/community.js)
  - [supabase/migrations/20260409223500_add_owner_community_posts.sql](/Users/shimizutaiga/Projects/apps/sippomi/supabase/migrations/20260409223500_add_owner_community_posts.sql)

- データベースや認証設定を変えたい
  - [supabase/config.toml](/Users/shimizutaiga/Projects/apps/sippomi/supabase/config.toml)
  - [supabase/migrations](/Users/shimizutaiga/Projects/apps/sippomi/supabase/migrations)
  - [supabase/seed.sql](/Users/shimizutaiga/Projects/apps/sippomi/supabase/seed.sql)

- デプロイや環境変数、ドメイン設定を変えたい
  - [vercel.json](/Users/shimizutaiga/Projects/apps/sippomi/vercel.json)
  - [.env.example](/Users/shimizutaiga/Projects/apps/sippomi/.env.example)
  - [.vercel/project.json](/Users/shimizutaiga/Projects/apps/sippomi/.vercel/project.json)
  - [scripts/verify-deployment.mjs](/Users/shimizutaiga/Projects/apps/sippomi/scripts/verify-deployment.mjs)

## 最短ルール

- 見た目を変える: `html` と `src/styles/*`
- 診断結果を変える: `src/diagnosis.js` と `data/names.json`
- 会員系を変える: `src/auth.js` と `api/*` と `supabase/*`
- デプロイを変える: `vercel.json` と `.env*`
- 記事内の商品リンク: 1記事につき楽天などのアフィリエイト商品リンクは `2件まで`
- 商品リンクを入れる場所: 記事の内容に直接つながる箇所だけに絞り、広告ブロックを連続で並べすぎない

## 迷ったとき

`rg` で文言や class 名を検索すると速いです。

```bash
cd /Users/shimizutaiga/Projects/apps/sippomi
rg "探したい文言やclass名"
```
