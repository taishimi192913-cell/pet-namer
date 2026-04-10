# Sippomi Project Context

Sippomi は、`名前が決まる、その瞬間から。` を軸にした、ペットの名前診断とお迎え準備のブランドサイトです。  
このメモは、他スレッドから見ても現状をすぐ追えるように、主要な機能と最近の変更をまとめた共有コンテキストです。

## ブランド

- 表記: `シッポミ | Sippomi`
- URL 想定: `https://sippomi.com`
- 役割:
  - 名前診断の入口
  - お迎え準備メディア
  - 飼い主コミュニティ
  - 将来のアフィリエイト / 物販 / OEM 導線
- 現在の作業ディレクトリ: [apps/sippomi](/Users/shimizutaiga/Projects/apps/sippomi)

## 主要ページ

- トップ: [index.html](../index.html)
- お迎え準備: [welcome-prep.html](../welcome-prep.html)
- 読みもの:
  - [journal-first-days.html](../journal-first-days.html)
  - [journal-home-safety.html](../journal-home-safety.html)
  - [journal-first-shopping.html](../journal-first-shopping.html)
- 商品の仮LP: [starter-set.html](../starter-set.html)
- SEOページ:
  - [dog-names.html](../dog-names.html)
  - [cat-names.html](../cat-names.html)
  - [rabbit-names.html](../rabbit-names.html)

## 実装済みの主要機能

### 1. 名前診断

- 10の質問で候補を絞る構成
- 飼い主の好みや暮らし方まで加味する分岐
- 候補は20件表示
- 実装の中心:
  - [src/diagnosis.js](../src/diagnosis.js)
  - [src/constants.js](../src/constants.js)
  - [src/main.js](../src/main.js)
  - [src/render.js](../src/render.js)

### 2. 苗字との相性チェック

- 日本の苗字DBを読み込み
- 一般的な読み、順位、推定人数を参照
- ユーザーのふりがな入力があればそれを優先
- 実装の中心:
  - [src/surname-diagnosis.js](../src/surname-diagnosis.js)
  - [data/japanese-surnames.json](../data/japanese-surnames.json)
  - [scripts/build-surnames.mjs](../scripts/build-surnames.mjs)

### 3. 名前の深掘り表示

- ランキングや候補から `由来を詳しく見る` が開く
- 由来、響き、暮らしの中での印象を表示
- 実装の中心:
  - [src/render.js](../src/render.js)
  - [src/main.js](../src/main.js)

### 4. 有名人・名作・話題のペット名鑑

- 実写写真つきの名鑑データ
- 有名人属性、ペット種別、犬種などで絞り込み可能
- 実装の中心:
  - [data/celebrity-pets.json](../data/celebrity-pets.json)
  - [scripts/build-celebrity-pets.mjs](../scripts/build-celebrity-pets.mjs)

### 5. 飼い主SNS

- ログイン必須の飼い主限定コミュニティ
- 投稿、絞り込み、削除に対応
- Supabase を前提にしたAPI / migrationあり
- 実装の中心:
  - [src/community.js](../src/community.js)
  - [api/community.js](../api/community.js)
  - [supabase/migrations/20260409223500_add_owner_community_posts.sql](../supabase/migrations/20260409223500_add_owner_community_posts.sql)

## ブランド資産

- ロゴ: [public/sippomi-mark.svg](../public/sippomi-mark.svg)
- OGP: [public/sippomi-ogp.svg](../public/sippomi-ogp.svg)

## 最近の整理内容

- 旧ブランド表記を `Sippomi` / `シッポミ` へ移行
- OGP画像とロゴのファイル名もブランド名に合わせて変更
- 旧ブランド接頭辞の localStorage key を `sippomi.*` に更新
- 補助スクリプトの user-agent 文字列も `Sippomi` に統一

## ローカル確認の基本

```bash
npm install
cp .env.example .env
npm run dev
```

必要に応じて以下を使います。

```bash
npm run test
npm run build
npm run build:surnames
```

## 補足

- ふだんの編集先は [docs/edit-map.md](../docs/edit-map.md) を見ると早いです。
- 旧 `pet-namer` 表記の履歴メモは一部残っていますが、現行の作業基準は `Sippomi` です。
