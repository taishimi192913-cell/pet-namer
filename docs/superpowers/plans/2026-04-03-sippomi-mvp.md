# ペットなまえ診断 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ペットの条件（種類・性別・雰囲気・毛色）を選ぶと名前候補が表示されるシンプルなWebサービスを作る。

**Architecture:** バックエンド不要のフルクライアントサイド構成。names.jsonに約300件の名前データを持ち、Vanilla JSでフィルタリング。広告スペースは空白で確保のみ。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), JSON

---

## File Structure

```
pet-namer/
├── index.html          # メインページ（構造）
├── style.css           # 全スタイル（レスポンシブ含む）
├── app.js              # フィルタリング・UI更新ロジック
└── data/
    └── names.json      # 名前データベース（約300件）
```

---

## Task 1: 名前データベース作成

**Files:**
- Create: `data/names.json`

各名前オブジェクトのスキーマ：
```json
{
  "name": "string（表記）",
  "reading": "string（ひらがな読み）",
  "meaning": "string（意味・由来）",
  "species": ["犬"|"猫"|"うさぎ"|"ハムスター"|"鳥"],
  "gender": "オス"|"メス"|"どちらでも",
  "vibe": ["かわいい"|"かっこいい"|"個性的"|"和風"|"洋風"|"ふわふわ系"],
  "color": ["白"|"黒"|"茶色"|"三毛"|"なし"]
}
```

フィルタリング仕様：
- 同カテゴリ内で複数選択 → OR（いずれかに一致）
- カテゴリ間 → AND（すべてのカテゴリ条件を満たす）
- 「どちらでも」はオス・メス両方にマッチ
- colorが「なし」の名前はすべての毛色選択でマッチ

- [ ] **Step 1: data/names.json を作成する**

```json
[
  {"name":"ソラ","reading":"そら","meaning":"空・自由","species":["犬","猫","うさぎ","鳥"],"gender":"どちらでも","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"ハク","reading":"はく","meaning":"白・清らか","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風"],"color":["白"]},
  {"name":"ユキ","reading":"ゆき","meaning":"雪・純白","species":["犬","猫","うさぎ","ハムスター"],"gender":"どちらでも","vibe":["かわいい","和風","ふわふわ系"],"color":["白"]},
  {"name":"レオ","reading":"れお","meaning":"ライオン（英）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["茶色","なし"]},
  {"name":"モカ","reading":"もか","meaning":"コーヒー色","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色"]},
  {"name":"コタロウ","reading":"こたろう","meaning":"小太郎（和風男の子）","species":["犬","猫"],"gender":"オス","vibe":["かわいい","和風"],"color":["なし"]},
  {"name":"ハナ","reading":"はな","meaning":"花・華やか","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","和風","ふわふわ系"],"color":["なし"]},
  {"name":"マロン","reading":"まろん","meaning":"栗・茶色（仏）","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色"]},
  {"name":"クロ","reading":"くろ","meaning":"黒・黒猫","species":["犬","猫"],"gender":"どちらでも","vibe":["かっこいい","和風","個性的"],"color":["黒"]},
  {"name":"チャチャ","reading":"ちゃちゃ","meaning":"茶色・活発","species":["犬","猫","うさぎ","ハムスター"],"gender":"どちらでも","vibe":["かわいい","ふわふわ系"],"color":["茶色"]},
  {"name":"ルナ","reading":"るな","meaning":"月（西洋）","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","個性的"],"color":["白","なし"]},
  {"name":"ライ","reading":"らい","meaning":"雷・力強い","species":["犬"],"gender":"オス","vibe":["かっこいい","個性的"],"color":["黒","なし"]},
  {"name":"ピチ","reading":"ぴち","meaning":"元気・活発","species":["鳥","ハムスター"],"gender":"どちらでも","vibe":["かわいい","個性的"],"color":["なし"]},
  {"name":"ミル","reading":"みる","meaning":"ミルク色（仏）","species":["犬","猫","うさぎ","ハムスター"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["白"]},
  {"name":"タロウ","reading":"たろう","meaning":"太郎・長男","species":["犬","猫"],"gender":"オス","vibe":["和風","かわいい"],"color":["なし"]},
  {"name":"サクラ","reading":"さくら","meaning":"桜・春","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","和風","ふわふわ系"],"color":["なし"]},
  {"name":"ノア","reading":"のあ","meaning":"安らぎ（ヘブライ）","species":["犬","猫"],"gender":"どちらでも","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"キラ","reading":"きら","meaning":"輝く","species":["犬","猫","鳥"],"gender":"メス","vibe":["かわいい","個性的","洋風"],"color":["なし"]},
  {"name":"マックス","reading":"まっくす","meaning":"最大・力強い（英）","species":["犬"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"ベル","reading":"べる","meaning":"鈴・美しい音（仏）","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","ふわふわ系"],"color":["なし"]},
  {"name":"リク","reading":"りく","meaning":"陸・大地","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"メイ","reading":"めい","meaning":"5月・明るい","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"コジロウ","reading":"こじろう","meaning":"小次郎（和風）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"ミミ","reading":"みみ","meaning":"耳・小さくかわいい","species":["猫","うさぎ","ハムスター"],"gender":"メス","vibe":["かわいい","ふわふわ系"],"color":["なし"]},
  {"name":"ゴロウ","reading":"ごろう","meaning":"五郎・貫禄","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"リリー","reading":"りりー","meaning":"百合の花（英）","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","ふわふわ系"],"color":["白"]},
  {"name":"クッキー","reading":"くっきー","meaning":"クッキー色・甘い","species":["犬","猫","うさぎ","ハムスター"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色"]},
  {"name":"カイ","reading":"かい","meaning":"海・広大","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"ナナ","reading":"なな","meaning":"七・可愛い響き","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","和風"],"color":["なし"]},
  {"name":"ポチ","reading":"ぽち","meaning":"定番・愛着","species":["犬"],"gender":"オス","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"シロ","reading":"しろ","meaning":"白・シンプル","species":["犬","猫"],"gender":"どちらでも","vibe":["かわいい","和風"],"color":["白"]},
  {"name":"クマ","reading":"くま","meaning":"熊・どっしり","species":["犬"],"gender":"オス","vibe":["かわいい","和風","個性的"],"color":["茶色","黒"]},
  {"name":"ピノ","reading":"ぴの","meaning":"松の実（伊）","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風"],"color":["茶色"]},
  {"name":"ジロウ","reading":"じろう","meaning":"次郎・二番目","species":["犬","猫"],"gender":"オス","vibe":["和風","かわいい"],"color":["なし"]},
  {"name":"フク","reading":"ふく","meaning":"福・幸運","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","和風"],"color":["なし"]},
  {"name":"エマ","reading":"えま","meaning":"全体・完全（独）","species":["犬","猫"],"gender":"メス","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"ゼウス","reading":"ぜうす","meaning":"神々の王（ギリシャ）","species":["犬"],"gender":"オス","vibe":["かっこいい","個性的","洋風"],"color":["なし"]},
  {"name":"アン","reading":"あん","meaning":"恵み（英）","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"ニコ","reading":"にこ","meaning":"笑顔・勝利（ギリシャ）","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"カスタード","reading":"かすたーど","meaning":"クリーム色・甘い","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色","白"]},
  {"name":"ムサシ","reading":"むさし","meaning":"武蔵（武士）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"アズキ","reading":"あずき","meaning":"小豆色・和風","species":["猫","うさぎ","ハムスター"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["茶色","黒"]},
  {"name":"ラム","reading":"らむ","meaning":"子羊・純真","species":["犬","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["白"]},
  {"name":"オリバー","reading":"おりばー","meaning":"オリーブ（英）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"トト","reading":"とと","meaning":"魚・親しみ","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"ミント","reading":"みんと","meaning":"ミント・爽やか","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","個性的"],"color":["白"]},
  {"name":"アポロ","reading":"あぽろ","meaning":"太陽神（ギリシャ）","species":["犬"],"gender":"オス","vibe":["かっこいい","個性的","洋風"],"color":["なし"]},
  {"name":"ラテ","reading":"らて","meaning":"カフェラテ・温かい","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色","白"]},
  {"name":"ふく","reading":"ふく","meaning":"福・丸い","species":["ハムスター","うさぎ"],"gender":"どちらでも","vibe":["かわいい","和風","ふわふわ系"],"color":["なし"]},
  {"name":"シャネル","reading":"しゃねる","meaning":"気品・高貴","species":["犬","猫"],"gender":"メス","vibe":["かっこいい","洋風","個性的"],"color":["黒","白"]},
  {"name":"ゴン","reading":"ごん","meaning":"権・力強い","species":["犬"],"gender":"オス","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"コロ","reading":"ころ","meaning":"丸い・転がる","species":["犬","ハムスター"],"gender":"どちらでも","vibe":["かわいい","和風","ふわふわ系"],"color":["なし"]},
  {"name":"ティア","reading":"てぃあ","meaning":"涙・神の贈り物（ギリシャ）","species":["犬","猫"],"gender":"メス","vibe":["かわいい","洋風","個性的"],"color":["なし"]},
  {"name":"バンビ","reading":"ばんび","meaning":"小鹿・可愛い","species":["犬","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色"]},
  {"name":"キョウ","reading":"きょう","meaning":"今日・京","species":["犬","猫"],"gender":"どちらでも","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"パール","reading":"ぱーる","meaning":"真珠・白く輝く","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","ふわふわ系"],"color":["白"]},
  {"name":"ガク","reading":"がく","meaning":"岳・山のように","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"ちび","reading":"ちび","meaning":"小さい・愛らしい","species":["犬","猫","ハムスター"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"サム","reading":"さむ","meaning":"神に聞いた（英）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"フィン","reading":"ふぃん","meaning":"白い（アイルランド）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風","個性的"],"color":["白"]},
  {"name":"アリス","reading":"ありす","meaning":"高貴・真実（英）","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","個性的"],"color":["なし"]},
  {"name":"ボン","reading":"ぼん","meaning":"良い（仏）","species":["犬"],"gender":"オス","vibe":["かわいい","洋風","個性的"],"color":["なし"]},
  {"name":"コウ","reading":"こう","meaning":"光・香","species":["犬","猫","鳥"],"gender":"どちらでも","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"リン","reading":"りん","meaning":"鈴・凛","species":["猫","うさぎ","鳥"],"gender":"メス","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"ザック","reading":"ざっく","meaning":"神は覚えている（英）","species":["犬"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"モモ","reading":"もも","meaning":"桃・かわいい","species":["犬","猫","うさぎ","ハムスター"],"gender":"メス","vibe":["かわいい","和風","ふわふわ系"],"color":["茶色","白"]},
  {"name":"ユズ","reading":"ゆず","meaning":"柚子・爽やか","species":["犬","猫"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["茶色"]},
  {"name":"テツ","reading":"てつ","meaning":"鉄・強い","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["黒"]},
  {"name":"キキ","reading":"きき","meaning":"輝く・生き生き","species":["猫","鳥"],"gender":"メス","vibe":["かわいい","個性的","洋風"],"color":["黒","三毛"]},
  {"name":"ジャスパー","reading":"じゃすぱー","meaning":"宝石・碧い石","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風","個性的"],"color":["なし"]},
  {"name":"ミサ","reading":"みさ","meaning":"美沙・優雅","species":["犬","猫"],"gender":"メス","vibe":["かわいい","和風"],"color":["なし"]},
  {"name":"トム","reading":"とむ","meaning":"双子（英）","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"ミュウ","reading":"みゅう","meaning":"鳴き声・繊細","species":["猫"],"gender":"どちらでも","vibe":["かわいい","個性的","洋風"],"color":["なし"]},
  {"name":"ロッキー","reading":"ろっきー","meaning":"岩山・力強い","species":["犬"],"gender":"オス","vibe":["かっこいい","洋風"],"color":["なし"]},
  {"name":"チェリー","reading":"ちぇりー","meaning":"さくらんぼ・赤","species":["犬","猫","うさぎ"],"gender":"メス","vibe":["かわいい","洋風","個性的"],"color":["茶色","なし"]},
  {"name":"ゲン","reading":"げん","meaning":"元気・源","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"ポポ","reading":"ぽぽ","meaning":"丸い・温かい","species":["ハムスター","うさぎ","鳥"],"gender":"どちらでも","vibe":["かわいい","ふわふわ系"],"color":["なし"]},
  {"name":"エル","reading":"える","meaning":"神（ヘブライ）","species":["犬","猫"],"gender":"どちらでも","vibe":["かっこいい","洋風","個性的"],"color":["なし"]},
  {"name":"ニャン","reading":"にゃん","meaning":"猫の声","species":["猫"],"gender":"どちらでも","vibe":["かわいい","個性的","和風"],"color":["なし"]},
  {"name":"アロハ","reading":"あろは","meaning":"愛・ハワイ","species":["犬"],"gender":"どちらでも","vibe":["かわいい","洋風","個性的"],"color":["なし"]},
  {"name":"しずく","reading":"しずく","meaning":"雫・儚い美しさ","species":["猫","うさぎ"],"gender":"メス","vibe":["かわいい","和風","個性的"],"color":["白","なし"]},
  {"name":"クレア","reading":"くれあ","meaning":"明るい・輝く（仏）","species":["犬","猫"],"gender":"メス","vibe":["かわいい","洋風"],"color":["なし"]},
  {"name":"シン","reading":"しん","meaning":"心・新","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"ゴールド","reading":"ごーるど","meaning":"金・黄金","species":["犬","鳥"],"gender":"どちらでも","vibe":["かっこいい","洋風","個性的"],"color":["茶色"]},
  {"name":"キャラ","reading":"きゃら","meaning":"キャラメル色","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","洋風","ふわふわ系"],"color":["茶色"]},
  {"name":"麦","reading":"むぎ","meaning":"麦・素朴","species":["犬","猫"],"gender":"どちらでも","vibe":["かわいい","和風"],"color":["茶色","白"]},
  {"name":"波","reading":"なみ","meaning":"波・自由","species":["犬","猫"],"gender":"メス","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"海","reading":"かい","meaning":"海・大きい","species":["犬"],"gender":"オス","vibe":["かっこいい","和風"],"color":["なし"]},
  {"name":"虎","reading":"とら","meaning":"虎・勇猛","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風","個性的"],"color":["茶色","三毛"]},
  {"name":"雪","reading":"ゆき","meaning":"雪・白","species":["犬","猫","うさぎ"],"gender":"どちらでも","vibe":["かわいい","和風","ふわふわ系"],"color":["白"]},
  {"name":"月","reading":"つき","meaning":"月・夜","species":["猫","うさぎ"],"gender":"どちらでも","vibe":["かっこいい","和風","個性的"],"color":["白","なし"]},
  {"name":"星","reading":"ほし","meaning":"星・輝く","species":["犬","猫","鳥"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["なし"]},
  {"name":"凪","reading":"なぎ","meaning":"凪・穏やか","species":["猫","犬"],"gender":"どちらでも","vibe":["かっこいい","和風","個性的"],"color":["なし"]},
  {"name":"蓮","reading":"れん","meaning":"蓮・清純","species":["犬","猫"],"gender":"オス","vibe":["かっこいい","和風"],"color":["白","なし"]},
  {"name":"楓","reading":"かえで","meaning":"楓・秋","species":["犬","猫"],"gender":"どちらでも","vibe":["かわいい","和風","個性的"],"color":["茶色","なし"]},
  {"name":"桐","reading":"きり","meaning":"桐・高貴","species":["猫"],"gender":"どちらでも","vibe":["かっこいい","和風","個性的"],"color":["なし"]}
]
```

- [ ] **Step 2: 動作確認（コンソールで件数チェック）**

ブラウザコンソールで実行：
```js
fetch('./data/names.json').then(r=>r.json()).then(d=>console.log('総数:', d.length))
```
Expected: `総数: 100` 以上

- [ ] **Step 3: Commit**

```bash
cd /Users/shimizutaiga/Desktop/pet-namer
git init
git add data/names.json
git commit -m "feat: add pet names database (100+ entries)"
```

---

## Task 2: HTMLの骨格作成

**Files:**
- Create: `index.html`

- [ ] **Step 1: index.html を作成する**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ペットなまえ診断 — 愛するペットにぴったりの名前を</title>
  <meta name="description" content="犬・猫・うさぎなど、ペットの種類・性別・雰囲気・毛色から最適な名前を提案します。">
  <meta property="og:title" content="ペットなまえ診断">
  <meta property="og:description" content="ペットにぴったりの名前が見つかる無料サービス">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header class="site-header">
    <div class="container">
      <div class="logo">🐾 ペットなまえ診断</div>
      <p class="tagline">愛するペットにぴったりの名前が見つかる</p>
    </div>
  </header>

  <main class="container layout">

    <!-- メインコンテンツ -->
    <div class="main-content">

      <!-- フィルターパネル -->
      <section class="filter-panel" aria-label="絞り込み条件">
        <h2 class="section-title">条件を選んでください</h2>

        <div class="filter-group">
          <h3 class="filter-label">🐾 動物の種類</h3>
          <div class="chips" data-filter="species">
            <button class="chip" data-value="犬">犬</button>
            <button class="chip" data-value="猫">猫</button>
            <button class="chip" data-value="うさぎ">うさぎ</button>
            <button class="chip" data-value="ハムスター">ハムスター</button>
            <button class="chip" data-value="鳥">鳥</button>
          </div>
        </div>

        <div class="filter-group">
          <h3 class="filter-label">♂♀ 性別</h3>
          <div class="chips" data-filter="gender">
            <button class="chip" data-value="オス">オス</button>
            <button class="chip" data-value="メス">メス</button>
            <button class="chip" data-value="どちらでも">どちらでも</button>
          </div>
        </div>

        <div class="filter-group">
          <h3 class="filter-label">✨ 雰囲気</h3>
          <div class="chips" data-filter="vibe">
            <button class="chip" data-value="かわいい">かわいい</button>
            <button class="chip" data-value="かっこいい">かっこいい</button>
            <button class="chip" data-value="個性的">個性的</button>
            <button class="chip" data-value="和風">和風</button>
            <button class="chip" data-value="洋風">洋風</button>
            <button class="chip" data-value="ふわふわ系">ふわふわ系</button>
          </div>
        </div>

        <div class="filter-group">
          <h3 class="filter-label">🎨 毛色</h3>
          <div class="chips" data-filter="color">
            <button class="chip" data-value="白">白</button>
            <button class="chip" data-value="黒">黒</button>
            <button class="chip" data-value="茶色">茶色</button>
            <button class="chip" data-value="三毛">三毛</button>
          </div>
        </div>
      </section>

      <!-- 結果エリア -->
      <section class="results-panel" aria-label="名前候補">
        <div class="results-header">
          <span class="result-count" id="resultCount">すべての名前を表示中</span>
          <button class="sort-btn" id="sortBtn">ランダム並び替え 🔀</button>
        </div>
        <div class="name-grid" id="nameGrid">
          <!-- app.js が動的に生成 -->
        </div>
        <p class="no-results hidden" id="noResults">条件に合う名前が見つかりませんでした。条件を変えてみてください。</p>
      </section>

    </div>

    <!-- サイドバー -->
    <aside class="sidebar">

      <!-- 広告スペース（空白） -->
      <div class="ad-space ad-space--rectangle" aria-hidden="true"></div>

      <!-- 人気ランキング -->
      <div class="widget">
        <h3 class="widget-title">🏆 人気の名前</h3>
        <ol class="ranking-list" id="rankingList">
          <!-- app.js が動的に生成 -->
        </ol>
      </div>

      <!-- 広告スペース（空白） -->
      <div class="ad-space ad-space--banner" aria-hidden="true"></div>

    </aside>

  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© 2026 ペットなまえ診断</p>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: ブラウザで開いてHTMLの骨格が表示されることを確認**

```bash
open /Users/shimizutaiga/Desktop/pet-namer/index.html
```

Expected: ヘッダー・フィルターラベル・サイドバーが表示される（スタイルなし・ロジックなし）

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML structure"
```

---

## Task 3: スタイル実装

**Files:**
- Create: `style.css`

- [ ] **Step 1: style.css を作成する**

```css
/* ===== リセット & 変数 ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: #ff7043;
  --primary-dark: #e64a19;
  --primary-light: #fff3e0;
  --bg: #f7f7f7;
  --surface: #ffffff;
  --border: #e0e0e0;
  --text: #333333;
  --text-muted: #888888;
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

/* ===== レイアウト ===== */
.container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
  align-items: start;
}

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none; /* モバイルでサイドバー非表示 */
  }
}

/* ===== ヘッダー ===== */
.site-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: var(--primary);
}

.tagline {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ===== フィルターパネル ===== */
.filter-panel {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text);
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  font-weight: bold;
}

/* ===== 結果エリア ===== */
.results-panel {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-count {
  font-size: 13px;
  color: var(--text-muted);
}

.sort-btn {
  font-size: 12px;
  color: var(--primary);
  background: none;
  border: 1px solid var(--primary);
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.sort-btn:hover {
  background: var(--primary);
  color: white;
}

.name-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (max-width: 480px) {
  .name-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ===== 名前カード ===== */
.name-card {
  background: var(--primary-light);
  border: 1.5px solid #ffccbc;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  position: relative;
}

.name-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(255,112,67,0.2);
}

.name-card__name {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-dark);
}

.name-card__reading {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.name-card__meaning {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.name-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
  margin-top: 8px;
}

.tag {
  font-size: 10px;
  background: white;
  color: var(--primary-dark);
  padding: 2px 7px;
  border-radius: 10px;
  border: 1px solid #ffccbc;
}

/* シェアボタン（カードホバー時） */
.name-card__share {
  display: none;
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 16px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.name-card:hover .name-card__share {
  display: block;
}

/* no results */
.no-results {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
  font-size: 14px;
}

.hidden { display: none !important; }

/* ===== サイドバー ===== */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 広告スペース（空白） */
.ad-space {
  background: transparent;
  border-radius: var(--radius);
}

.ad-space--rectangle {
  width: 100%;
  height: 250px;
}

.ad-space--banner {
  width: 100%;
  height: 90px;
}

/* ウィジェット */
.widget {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow);
}

.widget-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--text);
}

.ranking-list {
  list-style: none;
  padding: 0;
}

.ranking-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  cursor: pointer;
}

.ranking-list li:last-child { border-bottom: none; }

.ranking-list li:hover { color: var(--primary); }

.rank-num {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-muted);
  min-width: 20px;
}

.rank-num--gold { color: #f9a825; }
.rank-num--silver { color: #9e9e9e; }
.rank-num--bronze { color: #a1590e; }

/* ===== フッター ===== */
.site-footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 20px;
}
```

- [ ] **Step 2: ブラウザで確認**

```bash
open /Users/shimizutaiga/Desktop/pet-namer/index.html
```

Expected: ヘッダー・フィルターチップ・2カラムレイアウトが整ったデザインで表示される

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add responsive styles"
```

---

## Task 4: フィルタリングロジック実装

**Files:**
- Create: `app.js`

- [ ] **Step 1: app.js を作成する**

```js
// ===== 状態管理 =====
const state = {
  names: [],          // names.jsonから読み込んだ全データ
  filters: {          // 選択中のフィルター（カテゴリ→Set）
    species: new Set(),
    gender: new Set(),
    vibe: new Set(),
    color: new Set(),
  },
  shuffled: false,    // ランダム並び替えフラグ
};

// ===== 初期化 =====
async function init() {
  const res = await fetch('./data/names.json');
  state.names = await res.json();
  renderNameGrid(state.names);
  renderRanking(state.names);
  bindFilters();
  bindSortBtn();
}

// ===== フィルタリング =====
function applyFilters() {
  const { species, gender, vibe, color } = state.filters;

  return state.names.filter(n => {
    // 種類フィルター：選択なし or いずれかに一致
    if (species.size > 0 && !n.species.some(s => species.has(s))) return false;

    // 性別フィルター：選択なし or 一致 or 「どちらでも」は両方OK
    if (gender.size > 0) {
      const matches =
        gender.has(n.gender) ||
        gender.has('どちらでも') ||
        n.gender === 'どちらでも';
      if (!matches) return false;
    }

    // 雰囲気フィルター：選択なし or いずれかに一致
    if (vibe.size > 0 && !n.vibe.some(v => vibe.has(v))) return false;

    // 毛色フィルター：選択なし or 一致 or nameのcolorに「なし」が含まれる
    if (color.size > 0) {
      const matches =
        n.color.includes('なし') ||
        n.color.some(c => color.has(c));
      if (!matches) return false;
    }

    return true;
  });
}

// ===== 名前グリッドの描画 =====
function renderNameGrid(names) {
  const grid = document.getElementById('nameGrid');
  const noResults = document.getElementById('noResults');
  const count = document.getElementById('resultCount');

  const list = state.shuffled ? shuffle([...names]) : names;

  count.textContent = `${list.length}件の名前が見つかりました`;

  if (list.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');
  grid.innerHTML = list.map(n => `
    <div class="name-card" onclick="onCardClick('${n.name}', '${n.reading}')">
      <div class="name-card__name">${n.name}</div>
      <div class="name-card__reading">${n.reading}</div>
      <div class="name-card__meaning">${n.meaning}</div>
      <div class="name-card__tags">
        ${[...n.vibe].slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}
        ${n.color.filter(c => c !== 'なし').slice(0,1).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <button class="name-card__share" onclick="shareCard(event, '${n.name}', '${n.reading}')" title="シェア">🔗</button>
    </div>
  `).join('');
}

// ===== ランキングの描画 =====
function renderRanking(allNames) {
  const list = document.getElementById('rankingList');
  const top5 = [...allNames].sort(() => Math.random() - 0.5).slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4', '5'];
  const classes = ['rank-num--gold', 'rank-num--silver', 'rank-num--bronze', '', ''];

  list.innerHTML = top5.map((n, i) => `
    <li>
      <span class="rank-num ${classes[i]}">${medals[i]}</span>
      <span>${n.name}（${n.reading}）</span>
    </li>
  `).join('');
}

// ===== フィルターチップのバインド =====
function bindFilters() {
  document.querySelectorAll('.chips').forEach(group => {
    const category = group.dataset.filter;
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value;
        if (state.filters[category].has(value)) {
          state.filters[category].delete(value);
          chip.classList.remove('active');
        } else {
          state.filters[category].add(value);
          chip.classList.add('active');
        }
        const result = applyFilters();
        renderNameGrid(result);
      });
    });
  });
}

// ===== ランダム並び替えボタン =====
function bindSortBtn() {
  document.getElementById('sortBtn').addEventListener('click', () => {
    state.shuffled = !state.shuffled;
    const result = applyFilters();
    renderNameGrid(result);
  });
}

// ===== カードクリック（詳細表示は将来拡張） =====
function onCardClick(name, reading) {
  // Phase 2: モーダルで詳細表示予定
}

// ===== シェア機能 =====
function shareCard(event, name, reading) {
  event.stopPropagation();
  const text = `うちのペットの名前候補は「${name}（${reading}）」に決めました🐾 #ペットなまえ診断`;
  const url = encodeURIComponent(location.href);
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
}

// ===== ユーティリティ =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== 起動 =====
init();
```

- [ ] **Step 2: ブラウザで動作確認**

```bash
open /Users/shimizutaiga/Desktop/pet-namer/index.html
```

確認項目：
1. 名前カードが全件表示される
2. 「犬」をクリック → 犬を含む名前だけに絞り込まれる
3. さらに「オス」をクリック → AND条件で絞り込まれる
4. フィルターを外すと元に戻る
5. 「ランダム並び替え」で順番が変わる
6. カードの 🔗 ボタンでTwitterシェア画面が開く

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add filtering logic and share functionality"
```

---

## Task 5: GitHub Pages でデプロイ

**Files:** なし（設定のみ）

- [ ] **Step 1: GitHubリポジトリ作成 & プッシュ**

```bash
cd /Users/shimizutaiga/Desktop/pet-namer
gh repo create pet-namer --public --source=. --push
```

- [ ] **Step 2: GitHub Pages を有効化**

```bash
gh api repos/:owner/pet-namer/pages \
  --method POST \
  -f source[branch]=main \
  -f source[path]=/
```

- [ ] **Step 3: 公開URLを確認**

```bash
gh api repos/:owner/pet-namer/pages --jq '.html_url'
```

Expected: `https://<username>.github.io/pet-namer/` が表示される

- [ ] **Step 4: 公開URLにアクセスして動作確認**

ブラウザで上記URLを開き、以下を確認：
1. 名前カードが表示される
2. フィルターが動作する
3. シェアボタンが機能する

---

## 完成チェックリスト

- [ ] 4つのフィルター（種類・性別・雰囲気・毛色）が動作する
- [ ] AND条件・OR条件が正しく機能する
- [ ] 件数が正しく表示される
- [ ] ランダム並び替えが動作する
- [ ] Twitterシェアが機能する
- [ ] モバイルで1カラム表示になる
- [ ] 広告スペースは空白（テキストラベルなし）
- [ ] GitHub Pagesで公開済み
