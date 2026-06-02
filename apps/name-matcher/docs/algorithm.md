# しっぽみ 名前診断アルゴリズム詳細

## 1. アーキテクチャ概要

```
┌─────────────────────────┐
│    names.json           │ ← 10,000件の名前データ
│  (静的JSONファイル)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  recommendation-core/   │
│                         │
│  constants.js ──────────┤ ← 種別・雰囲気・色等の定義
│  reading.js ────────────┤ ← ふりがな判定ユーティリティ
│  learning.js ───────────┤ ← 好み学習エンジン
│  recommendation.js ─────┤ ← フィルター・スコアリング・キュー生成
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Swipe  │ │Results │
│ Screen │ │ Screen │
└────────┘ └────────┘
```

## 2. 名前データベース構造

### names.json（10,000件）

各エントリのスキーマ:

```json
{
  "name": "ソラ",                                // 名前（ひらがな/カタカナ/漢字混在）
  "reading": "そら",                              // 読み（ひらがな）
  "meaning": "空のように広く自由なイメージ",       // 意味・由来説明
  "species": ["犬", "猫"],                        // 対象ペット種（複数可）
  "gender": "男の子",                             // 性別: "男の子"|"女の子"|"どちらでも"
  "vibe": ["かっこいい", "洋風"],                  // 雰囲気タグ（複数可）
  "color": ["白・クリーム", "茶色"],               // 色イメージ（複数可）
  "length": "2",                                  // 文字数: "2"|"3"|"4+"
  "theme": ["自然・植物"],                         // テーマ（複数可）
  "tone": ["さわやか"]                             // 響き（複数可）
}
```

### 一意識別子

```js
favoriteKeyForItem(item)
// → `${name}::${reading}::${species}`
// 例: "ソラ::そら::犬|猫"
```

### データ特性

| 項目 | 値 |
|------|-----|
| 総件数 | 10,000件 |
| ペット種別 | 犬・猫・うさぎ・ハムスター・鳥・爬虫類・魚・小動物（8種） |
| 性別 | 男の子・女の子・どちらでも |
| 雰囲気 | 11種類 |
| 色イメージ | 色名（白・黒・茶色・三毛など+複合色） |
| 文字数 | 2文字・3文字・4文字以上 |

## 3. フィルタリングシステム

### アクティブフィルター生成

`createActiveFilters(answers)` はユーザーの選択を `Set<string>` に変換:

```js
filters = {
  species: Set(string),  // 選択された種別
  gender: Set(string),   // 選択された性別
  vibe: Set(string),     // 選択された雰囲気（canonicalVibe適用済）
  color: Set(string),    // 選択された色イメージ
  length: Set(string),   // 選択された文字数
  theme: Set(string),    // 選択されたテーマ
  tone: Set(string),     // 選択された響き
}
```

### フィルター照合ロジック（`matchesFilters`）

空のフィルター（`Set.size === 0`）はチェックをスキップ（= すべて許可）。

| カテゴリ | ロジック | 特殊ケース |
|---------|---------|-----------|
| species | `item.species.some(s ⇒ selected.has(s))` | — |
| gender | `selected.has(item.gender)` | `item.gender === 'どちらでも'` → 常に通過、`selected.has('どちらでも')` → 常に通過 |
| vibe | `item.vibe.some(v ⇒ selected.has(canonicalVibe(v)))` | canonicalVibeで正規化後比較 |
| color | `item.color.some(v ⇒ selected.has(v))` | `item.color.includes('なし')` → 常に通過 |
| length | `selected.has(item.length)` | 完全一致 |
| theme | `item.theme.some(v ⇒ selected.has(v))` | 部分一致でOK |
| tone | `item.tone?.some(v ⇒ selected.has(v))` | tone未定義はフィルター通過 |

## 4. スコアリングシステム

### 4.1 totalスコア計算

```js
total = initialFit * 0.5 + learnedPreference * 0.4 + diversityBoost * 0.1
```

3つの要素をバランスよく組み合わせた総合スコア（0〜1）。

### 4.2 initialFit（重み 0.5）

ユーザーの初期フィルター条件への適合度。

```
ベース: 0.4
種別マッチ必須（0でない → 0でなければ続行）
+ 性別マッチ:     +0.12  (max: 0.12)
+ 雰囲気マッチ:   割合 × 0.22  (max: 0.22)
+ 色マッチ:       +0.06〜0.12  (max: 0.12)
+ 文字数マッチ:    +0.07  (max: 0.07)
+ テーママッチ:    +0.07  (max: 0.07)
+ 響きマッチ:      +0.07  (max: 0.07)

合計スコア = (獲得スコア) / (可能最大スコア)、最低0.05
```

重要: 種別がフィルターに合わない場合、`initialFit = 0`（ランキングから除外）。

### 4.3 learnedPreference（重み 0.4）

ユーザーのスワイプ履歴からの学習スコア。詳細は §5 参照。

ベースライン:
- まだ1回もスワイプしていない: 0.4
- スワイプ済みで学習シグナル0: 0.5

スコアは正規化関数を通して 0〜1 にマッピング:
```js
normalize(rawScore, hasSignals) {
  return hasSignals
    ? Math.max(0, Math.min(1, (rawScore + 1.4) / 2.8))
    : 0.5;
}
```

### 4.4 diversityBoost（重み 0.1）

最近見た名前との**多様性**を確保するブースト。

```js
base: 0.45
recentTraitsに含まれない新しい特性 × 0.12ずつ加算
上限: 1.0
```

直近36件（キュー1回分）で見た特性と重複しない新しいvibe・theme・color・toneが多いほど高いスコア。

## 5. 好み学習エンジン（learning.js）

### 5.1 学習データ構造（PreferenceProfile）

```js
{
  total: 0,         // 総スワイプ数
  likes: 0,         // Like数
  passes: 0,        // Pass数
  holds: 0,         // Hold数
  categories: {
    vibe: { "かわいい": 1.0, "洋風": 0.3, ... },    // 累積スコア
    color: { "白・クリーム": 1.0, ... },
    gender: { "男の子": 0.7, ... },
    length: { "2": 0.7, ... },
    theme: { "自然・植物": 0.9, ... },
    tone: { "やわらかい": 0.8, ... },
  }
}
```

### 5.2 フィードバック更新（applySwipeFeedback）

| アクション | delta |
|-----------|-------|
| Like | +1.0 |
| Hold  | +0.3 |
| Pass | -0.7 |

各カテゴリの重み:
| カテゴリ | 乗数 |
|---------|------|
| vibe | ×1.0 |
| color | ×1.0 |
| theme | ×0.9 |
| tone | ×0.8 |
| length | ×0.7 |
| gender | ×0.7 |

例: 「かわいい」vibeを持つ名前をLikeした場合 → `vibe["かわいい"] += 1.0`
同じ名前をPassした場合 → `vibe["かわいい"] -= 0.7`

### 5.3 学習スコア計算（scorePreferenceMatch）

学習シグナルがない場合 → 0.5（中立）
学習シグナルがある場合:

1. 各カテゴリで、itemの全タグのスコア平均を計算
2. 全カテゴリの平均を計算
3. 正規化関数で 0〜1 にマッピング

```js
// イメージ:
// itemのvibe = ["かわいい", "洋風"]
// 学習: vibe["かわいい"] = 1.0, vibe["洋風"] = -0.7
// vibeスコア = (1.0 + (-0.7)) / 2 = 0.15
// 全カテゴリの平均を取って正規化
```

### 5.4 好みサマリー（summarizePreferenceProfile）

各カテゴリのトップエントリを抽出し、人間に読みやすい形式で表示:

```js
// 例:
// headline: "あなたは かわいい・2文字・白系 の名前に反応しやすいようです。"
// bullets: ["雰囲気: かわいい / 洋風", "色イメージ: 白・クリーム", ...]
```

## 6. スワイプキュー生成（buildSwipeQueue）

### 6.1 キュー生成フロー

```
names.json (10,000件)
    │
    ▼
rankNamesForSwipe()  ──→ 全件をスコア順にソート
    │
    ▼
既視キー(seenKeys) でフィルター ──→ すでに見た名前を除外
    │
    ▼
探索ギャップ ──→ 4件ごとに1件スキップ（探索不足防止）
    │
    ▼
ラベル付け ──→ スコアに応じて推奨ラベルを付与
    │
    ▼
上限36件でクリップ
```

### 6.2 推奨ラベル閾値

| スコア | ラベル |
|--------|--------|
| ≥ 0.78 | 「かなり相性が良さそう」 |
| ≥ 0.62 | 「試す価値あり」 |
| < 0.62 | 「意外とハマるかも」 |

### 6.3 自動補充（hydrateQueue）

セッションのキューが10件（SWIPE_REPLENISH_THRESHOLD）を下回ったとき、
既視キーを使い回して新しいキューを生成。これにより無限スワイプが可能。

## 7. 結果画面（getResults）

### 7.1 結果生成フロー

1. 全10,000件を`matchesFilters`でフィルター
2. 通過した各名前に`scoreMatch`でスコアリング
3. スコア降順（スコア同値は五十音順）
4. Likeした名前は`topLikedNames`から取得（直近10件）

### 7.2 結果スコア表示

```js
SCORE_LABELS = [
  { min: 80, label: 'ぴったり' },     // score ≥ 80
  { min: 55, label: 'よく合う' },     // score ≥ 55
  { min: 0,  label: '合うかも' },     // それ以外
]
```

## 8. セッション管理

### セッションの永続化

```js
savedSession = {
  filters: FiltersState,           // ユーザーのフィルター選択
  preference: PreferenceProfile,   // 学習済み好みプロファイル
  queue: SwipeCandidate[],         // 現在のスワイプキュー
  swipes: SwipeRecord[],           // 全スワイプ履歴
  savedNames: string[],            // 保存した名前のキー一覧
  seenKeys: string[],              // 表示済み名前キー
  savedResultKeys: string[],       // 結果画面で保存したキー
  totalSwipes: number,             // スワイプ総数
  sessionCount: number,            // セッション数
}
```

AsyncStorageによって自動保存され、アプリ再起動後も復元される。

## 9. パフォーマンス特性

| 処理 | 計算量 | 備考 |
|------|--------|------|
| フィルタリング | O(n × f) | n=10,000, f=フィルター数 |
| スコアリング | O(n) | 一度のソートのみ |
| キュービルド | O(n log n + n) | 全件ソート + フィルタリング |
| 結果生成 | O(n log n) | フィルター + ソート |
| 学習更新 | O(1) | バケット更新のみ |

全処理はブラウザ上で同期的に実行可能（10,000件の10〜30ms以内）。
