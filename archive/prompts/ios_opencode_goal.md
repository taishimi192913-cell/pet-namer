# Sippomi iOS — opencode 自律実行プロンプト

【タスクID】: sippomi-ios-opencode
【モード】: 自律実行（中間確認禁止）

【強制使用ツール】
- open-design daemon (http://127.0.0.1:7456)
- GPT Image 2 API (gpt-image-2 モデル, OpenAI Responses API)
- opencode CLI

【作業ディレクトリ】
- 正本参照: /Users/shimizutaiga/Projects/sippomi/apps/ios/
- 作業ワークディレクトリ: /tmp/opencode-sippomi-ios/
- 完了後、正本へ結果マージ

【スコープ（絶対に逸脱しない）】
- Sippomi iOS 全4画面のビジュアル再設計
  - IntroScreen（ヒーロー + CTA）
  - FormScreen（Step 1-4 種別/性別/色/雰囲気/長さ/テーマ選択）
  - Swipe（Tinder風スワイプデッキ + PanResponder）
  - ResultsScreen（結果一覧 + ランキング + 共有）
- 対象: src/screens/*.tsx, src/components/*.tsx, src/styles.ts, src/theme.ts
- 対象外: src/session.ts, src/persistence.ts, src/data/, packages/recommendation-core/, package.json
- 全HTMLの id属性 / data-*属性 変更禁止（*Webではないため*）

【Phase 0: open-design 設計システム登録】

```bash
# SippomiのDESIGN.mdは既に登録済み（design-systems/sippomi/）
# open-design daemon 起動確認
/Users/shimizutaiga/.local/bin/open-design --port 7456 --no-open &
sleep 3
curl -s http://127.0.0.1:7456/api/health || echo "FAIL"
export OD_DAEMON_URL=http://127.0.0.1:7456
```

完了条件: daemon が応答すること。

【Phase 1: GPT Image 2 → UI モック画像生成】

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env
mkdir -p /tmp/opencode-sippomi-ios/outputs/design
```

Step 1-1: 全画面まとめて1枚のモック画像（1024x1024）

プロンプト:
```
A warm and modern iOS app UI mockup for a pet name matching app.
Design system: Apple Japan × MUJI hybrid. Warm cream base (#f4eede), soft orange accent (#F9A66C), terracotta (#E07A5F), brown text (#3D2C2A).
4 screens laid out in a 2x2 grid on a single image:

Top-left — Intro Screen: Hero with 3 pet silhouettes (dog/cat/rabbit in SVG line-art style), headline "Find your pet's perfect name", cream background, Apple-blue pill CTA button

Top-right — Form Screen: Step indicators (1-4 dots), species selection grid (dog/cat/rabbit/hamster/bird) with silhouette icons, filter chips for gender/color/vibe/length/theme, terracotta accent on selected

Bottom-left — Swipe Screen: Tinder-style card deck, centered name card with Japanese name in large 34px, reading, meaning, reason tags, Like/Pass/Hold buttons at bottom, card has soft shadow on cream background

Bottom-right — Results Screen: Preference summary chart (horizontal bars), ranked name list with Gold/Silver/Bronze badges, share button, "Start Over" text link

Style: clean iOS, generous whitespace, soft shadows, no emoji, no Material Design, no pure black/white. Apple SF Pro Japanese typography.
```

Step 1-2: 素材グリッド画像（背景テクスチャ、シルエット、装飾要素）

プロンプト:
```
Asset grid for the pet name matching iOS app design. Arrange on a transparent/cream grid, each element clearly separated:

1. Three soft organic blob shapes (cream, soft orange, terracotta) for screen backgrounds
2. Five pet silhouettes — dog, cat, rabbit, hamster, bird (simple elegant line-art, minimal)
3. Card background texture (subtle warm cream grain)
4. Three score badge icons (gold circle, silver circle, bronze circle)
5. Like/Pass/Hold action icons (heart, X, bookmark — simple line style)

Grid layout: 4 columns, each element on its own cell, no overlap. Clean, minimal, no text labels.
```

API呼び出し (gpt-image-2 via gpt-5.5 router):

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env

# モック画像
curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{\"model\":\"gpt-5.5\",\"tools\":[{\"type\":\"image_generation\",\"model\":\"gpt-image-2\",\"size\":\"1024x1024\",\"quality\":\"high\"}],\"input\":\"<上記モックプロンプト>\"}" \
  -o /tmp/sippomi_ios_mock.json

# 素材グリッド
curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{\"model\":\"gpt-5.5\",\"tools\":[{\"type\":\"image_generation\",\"model\":\"gpt-image-2\",\"size\":\"1024x1024\",\"quality\":\"high\"}],\"input\":\"<上記素材プロンプト>\"}" \
  -o /tmp/sippomi_ios_assets.json

# base64抽出
python3 -c "
import json,base64
for fn,key in [('/tmp/opencode-sippomi-ios/outputs/design/mock_screens.png','/tmp/sippomi_ios_mock.json'),('/tmp/opencode-sippomi-ios/outputs/design/assets_grid.png','/tmp/sippomi_ios_assets.json')]:
  with open(key) as f: data=json.load(f)
  for item in data.get('output',[]):
    if isinstance(item,dict) and item.get('result'):
      with open(fn,'wb') as out: out.write(base64.b64decode(item['result']))
      print(f'{fn} saved')
      break
"
```

完了条件: mock_screens.png と assets_grid.png が存在し 0byteでないこと。最大3回リトライ。

【Phase 2: 素材抽出】

```bash
# 素材グリッドから個別PNG/SVGを抽出
# sharp (Node.js) または Pillow (Python) を使用
# グリッドのセル位置を特定し、以下の命名で保存:
mkdir -p /tmp/opencode-sippomi-ios/outputs/assets/

# 出力ファイル:
# blob_cream.png, blob_orange.png, blob_terracotta.png
# mascot_dog.svg, mascot_cat.svg, mascot_rabbit.svg, mascot_hamster.svg, mascot_bird.svg
# card_texture.png
# badge_gold.png, badge_silver.png, badge_bronze.png
# icon_like.svg, icon_pass.svg, icon_hold.svg
```

完了条件: 14個以上のファイルが存在すること。

【Phase 3: open-design mobile-app スキル → UI プロトタイプ生成】

```bash
export OD_DAEMON_URL=http://127.0.0.1:7456
cd /tmp/opencode-sippomi-ios/
```

opencode 経由で open-design に接続し、mobile-app スキルで各画面のプロトタイプを生成:

```
Sippomi iOS app の全4画面を open-design mobile-app スキルで生成してください。
設計システム: sippomi (Apple Japan × MUJI Hybrid)
参照画像: /tmp/opencode-sippomi-ios/outputs/design/mock_screens.png

画面1: IntroScreen — オンボーディング（ヒーロー + CTA）
画面2: FormScreen — フォーム（種別選択 + チップ）
画面3: SwipeScreen — スワイプ（カードデッキ）
画面4: ResultsScreen — 結果（ランキング + 共有）

各画面は iPhone 15 Pro フレーム内に収めること。
カラーパレット: cream bg #FFF8F0, orange accent #F9A66C, terracotta #E07A5F, brown text #3D2C2A
```

完了条件: 4画面すべてのプロトタイプHTMLが生成されていること。

【Phase 4: Expo React Native 実装】

opencode で以下を実装:

1. 正本 (/Users/shimizutaiga/Projects/sippomi/apps/ios/) を /tmp/opencode-sippomi-ios/ にコピー
2. 各画面コンポーネントを open-design プロトタイプ + GPT Image 2 モックに合わせて再実装:
   - `src/screens/IntroScreen.tsx` — ヒーローセクション刷新
   - `src/screens/FormScreen.tsx` — チップデザイン刷新、種別カード刷新
   - `src/screens/ResultsScreen.tsx` — ランキング表示刷新
   - `src/components/SwipeCard.tsx` — カードデザイン刷新
   - `src/components/Chip.tsx` — チップデザイン刷新
   - `src/components/SpeciesOptionCard.tsx` — 種別カード刷新
   - `src/styles.ts` — カラーパレット・シャドウ更新
   - `src/theme.ts` — ダークモードパレット更新
3. AGENTS.md 禁止事項を厳守:
   - 絵文字禁止
   - 純黒 #000 / 純白 #FFF 禁止
   - font-size 絶対値禁止（セマンティックスタイル使用）
   - Material Design 禁止
4. 既存のロジック（session.ts, persistence.ts, recommendation-core）は変更しない

```bash
cd /tmp/opencode-sippomi-ios/
npx tsc --noEmit  # TypeScriptチェック
npx expo export --platform ios  # ビルド確認
```

完了条件: tscエラー0、ビルド成功。

【Phase 5: 検証 + マージ】

```bash
cd /tmp/opencode-sippomi-ios/
npx tsc --noEmit
# 全画面のスクリーンショット確認
# 正本へ変更ファイルのみマージ
cp -r src/ /Users/shimizutaiga/Projects/sippomi/apps/ios/src/
```

【進捗トラッキング】
- 20分ごとに /tmp/opencode-sippomi-ios/progress.txt に「現在のステップ / 次のステップ / 残り予想」を追記
- 進捗ファイルが3時間更新されなかったら、エラーログを書いて終了

【エラー処理】
- 同じエラーが3回連続で出たら打ち切り
- /tmp/opencode-sippomi-ios/error.log に「諦めた理由」「試行した対策」「次に試せそうな案」を書く
- GPT Image 2 429 rate limit → 30秒待って再試行

【終了条件（以下すべて満たすまで停止しない）】
1. Phase 0→5 全完了
2. npx tsc --noEmit エラー0
3. 全4画面が open-design プロトタイプに準拠
4. 正本 /Users/shimizutaiga/Projects/sippomi/apps/ios/src/ に変更反映
5. /tmp/opencode-sippomi-ios/completion_marker.md に日付・結果サマリ・所要時間を書き込む

【最終報告（completion_marker.md に記載）】
- 変更したファイル一覧
- tsc / ビルド結果
- 画面ごとのプロトタイプ忠実度（%）
- 残りのリスク・懸念点
- 次の作業者へ伝えるべきこと
