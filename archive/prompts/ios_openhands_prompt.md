# Sippomi iOS — OpenHands / Codex プロンプト

> open-design × GPT Image 2 による全画面ビジュアル再設計。
> フレームワーク: Expo SDK 54 + React Native 0.81.5 + TypeScript
> 設計システム: open-design sippomi (Apple Japan × MUJI Hybrid)

## 事前準備 (OpenHands 起動前)

```bash
# open-design daemon 起動
/Users/shimizutaiga/.local/bin/open-design --port 7456 --no-open &
sleep 3
curl -s http://127.0.0.1:7456/api/health || echo "FAIL"

# APIキー読み込み
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env

# 作業ディレクトリ作成
mkdir -p /tmp/openhands-sippomi-ios/outputs/design
```

## Phase 0: プロジェクトコピー & open-design 接続確認

```bash
cp -r /Users/shimizutaiga/Projects/sippomi/apps/ios /tmp/openhands-sippomi-ios/
cd /tmp/openhands-sippomi-ios
npm install
export OD_DAEMON_URL=http://127.0.0.1:7456
```

**確認**: `curl http://127.0.0.1:7456/api/health` → 200 OK

---

## Phase 1: GPT Image 2 → UIモック画像生成 [Task 1-3]

### Task 1: 全画面モック画像生成

GPT Image 2 (gpt-image-2 via gpt-5.5 router) で1024x1024の2x2グリッドモックを生成。

```
A warm and modern iOS app UI mockup for a pet name matching app.
Design system: Apple Japan × MUJI hybrid. Warm cream base (#f4eede), soft orange accent (#F9A66C), terracotta (#E07A5F), brown text (#3D2C2A).
4 screens in 2x2 grid:

Top-left — Intro Screen: Hero with 3 pet silhouettes (dog/cat/rabbit SVG line-art), headline "Find your pet's perfect name", cream background, Apple-blue pill CTA
Top-right — Form Screen: Step dots (1-4), species grid (dog/cat/rabbit/hamster/bird with icons), filter chips (gender/color/vibe/length/theme)
Bottom-left — Swipe Screen: Tinder-style card deck, centered name card (34px Japanese), reading/meaning/reason tags, Like/Pass/Hold buttons
Bottom-right — Results Screen: Preference bar chart, ranked list (Gold/Silver/Bronze badges), share button

Clean iOS, generous whitespace, soft shadows, no emoji, no Material Design, no pure black/white. SF Pro Japanese.
```

API呼び出し:
```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env
curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"gpt-5.5","tools":[{"type":"image_generation","model":"gpt-image-2","size":"1024x1024","quality":"high"}],"input":"<上記プロンプト>"}' \
  -o /tmp/sippomi_ios_mock.json

python3 -c "
import json,base64
with open('/tmp/sippomi_ios_mock.json') as f: data=json.load(f)
for item in data.get('output',[]):
  if isinstance(item,dict) and item.get('result'):
    with open('/tmp/openhands-sippomi-ios/outputs/design/mock_screens.png','wb') as out:
      out.write(base64.b64decode(item['result']))
    print('mock_screens.png saved')
    break
"
```

### Task 2: 素材グリッド画像生成

```
Asset grid for pet name matching iOS app. Transparent/cream grid, 4 columns, elements separated:

1. Three organic blob shapes (cream, soft orange, terracotta)
2. Five pet silhouettes (dog/cat/rabbit/hamster/bird) — simple line-art
3. Card background texture (warm cream grain)
4. Gold/Silver/Bronze score badge icons
5. Like/Pass/Hold action icons (heart/X/bookmark) — simple line style
```

同様にAPI呼び出し → `/tmp/openhands-sippomi-ios/outputs/design/assets_grid.png`

### Task 3: 素材グリッド分割

Python (Pillow) でグリッド画像を個別ファイルに分割:
```bash
mkdir -p /tmp/openhands-sippomi-ios/outputs/assets/
pip3 install Pillow 2>/dev/null
python3 << 'PYEOF'
from PIL import Image
import os
img = Image.open('/tmp/openhands-sippomi-ios/outputs/design/assets_grid.png')
# 4列グリッド → セル位置計算 → 個別トリミング
# 出力: blob_cream.png, blob_orange.png, blob_terracotta.png
#       mascot_dog.svg 相当, mascot_cat.svg 相当, ...
#       card_texture.png, badge_gold.png, badge_silver.png, badge_bronze.png
#       icon_like.svg 相当, icon_pass.svg 相当, icon_hold.svg 相当
PYEOF
```

**Phase 1 完了条件**: mock_screens.png + assets_grid.png + 14個以上の個別アセット

---

## Phase 2: open-design mobile-app スキル → プロトタイプ生成 [Task 4-7]

open-design daemon に接続し、mobile-app スキルで4画面生成:

### Task 4: IntroScreen プロトタイプ
```
open-design mobile-app スキル, 設計システム sippomi
画面: IntroScreen — オンボーディング
内容: 3匹のペットシルエット, 大見出し, CTAボタン
```

### Task 5: FormScreen プロトタイプ
```
open-design mobile-app スキル, 設計システム sippomi
画面: FormScreen — フォーム (Checkout アーキタイプ)
内容: 種別グリッド, チップフィルター, ステップインジケーター
```

### Task 6: SwipeScreen プロトタイプ
```
open-design mobile-app スキル, 設計システム sippomi
画面: Swipe — カードデッキ (Focus アーキタイプ)
内容: 名前カード, スコアバッジ, Like/Pass/Hold アクション
```

### Task 7: ResultsScreen プロトタイプ
```
open-design mobile-app スキル, 設計システム sippomi
画面: Results — ランキング (Feed アーキタイプ)
内容: 選好サマリ, バーチャート, ランキングリスト, 共有ボタン
```

**Phase 2 完了条件**: 4画面のプロトタイプHTMLが生成されていること。

---

## Phase 3: コード実装 [Task 8-20]

AGENTS.md ルールに従い、以下のコンポーネントを再実装:

| Task | ファイル | 変更内容 |
|------|----------|---------|
| 8 | `src/styles.ts` | カラーパレット・シャドウを DESIGN.md に更新 |
| 9 | `src/theme.ts` | ダークモードパレット更新 |
| 10 | `src/screens/IntroScreen.tsx` | ヒーロー刷新（blob背景 + シルエット + CTA） |
| 11 | `src/components/PetSilhouette.tsx` | SVGシルエット微調整 |
| 12 | `src/components/ScreenSafeArea.tsx` | 背景パターン更新 |
| 13 | `src/screens/FormScreen.tsx` | チップ・種別カード刷新 |
| 14 | `src/components/Chip.tsx` | 選択状態のアニメーション追加 |
| 15 | `src/components/SpeciesOptionCard.tsx` | カードデザイン刷新 |
| 16 | `src/components/SwipeCard.tsx` | カードレイアウト刷新、テクスチャ背景追加 |
| 17 | `src/components/ScorePill.tsx` | バッジデザイン刷新 |
| 18 | `src/screens/ResultsScreen.tsx` | ランキング + チャート刷新 |
| 19 | `src/components/PreferenceChart.tsx` | バーチャート色更新 |
| 20 | `src/components/NameDetailModal.tsx` | モーダルカード刷新 |

**実装ルール (AGENTS.md 厳守)**:
- 絵文字禁止 / `#000` `#FFF` 禁止
- `font-size` 絶対値禁止（StyleSheet.create 内の数値はOK）
- Material Design 禁止
- 既存ロジック（session.ts, persistence.ts, recommendation-core）は変更禁止

**Phase 3 完了条件**: `npx tsc --noEmit` エラー0

---

## Phase 4: 検証 & マージ [Task 21-25]

| Task | 内容 |
|------|------|
| 21 | `npx tsc --noEmit` 実行、エラー修正 |
| 22 | Metro bundle 成功確認 |
| 23 | 全4画面のスクリーンショット比較（プロトタイプ vs 実装） |
| 24 | ダークモード表示確認 |
| 25 | 正本へマージ → progress.txt 追記 |

**最終完了条件**:
- tsc エラー0
- Metro バンドル成功
- 全4画面がプロトタイプに準拠（目視80%以上一致）
- 正本 `/Users/shimizutaiga/Projects/sippomi/apps/ios/src/` に反映済み
