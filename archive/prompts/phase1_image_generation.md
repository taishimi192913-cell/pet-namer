# Phase 1: デザイン画像生成（opencode → gpt-image-2 API）

【タスク】Sippomi LP のデザインモック画像と素材グリッド画像を gpt-image-2 で生成する。

【モード】自律実行（中間確認禁止）

【事前準備】
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env

【API情報】
- エンドポイント: https://api.openai.com/v1/responses
- モデル: gpt-image-2
- APIキー参照先: $OPENAI_API_KEY（環境変数）
- 画像サイズ: 1024x1536（縦長LPレイアウト）
- 品質: high

【入力】
/Users/shimizutaiga/Projects/sippomi/prompts/phase0_structured_brief.md
内の「gpt-image-2 生成用プロンプト（英語）」セクション

【出力先】
mkdir -p /Users/shimizutaiga/Projects/sippomi/outputs/design

【Step 1: モック画像生成】
以下の curl で 全セクションLPモック画像 を生成:

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env

MOCK_PROMPT='A warm and sophisticated landing page design for a pet name diagnosis web service. Target: first-time pet owners (women and families, 20-40s). Style: Apple Japan product page × MUJI lifestyle magazine hybrid. Mood: warm, refined, calm, trustworthy, gentle — with subtle playfulness. Color palette: warm cream base (#f4eede), soft orange accents, terracotta, dark brown text, Apple blue CTA. Use irregular soft blob shapes in the background — organic, curved, flowing. Large card layouts with generous rounded corners (24-28px). Abundant whitespace between sections (120-200px). No emoji, no neon colors, no Material Design, no pure black/white. Output: 1024x1536 vertical layout. Sections from top to bottom: 1. Hero — large headline, pet silhouettes (dog, cat, rabbit), big pill CTA button. 2. Features — 3 feature cards with soft blob icons. 3. How It Works — 3-step flow with gentle connecting curves. 4. Trust section — numbers and badges. 5. Trending names — ranking cards. 6. Community section. 7. Footer CTA. Make it look like a professional designer made it — no generic AI aesthetic.'

curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{\"model\":\"gpt-5.5\",\"tools\":[{\"type\":\"image_generation\",\"model\":\"gpt-image-2\",\"size\":\"1024x1536\",\"quality\":\"high\"}],\"input\":\"$MOCK_PROMPT\"}" \
  -o /tmp/sippomi_mock_response.json

python3 -c "
import json, base64
with open('/tmp/sippomi_mock_response.json') as f:
    data = json.load(f)
for item in data.get('output', []):
    if isinstance(item, dict) and item.get('model') == 'gpt-image-2' and item.get('result'):
        with open('/Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png', 'wb') as out:
            out.write(base64.b64decode(item['result']))
        print('mock_fullpage.png saved')
        break
"
```

【Step 2: 素材グリッド画像生成】
同様に素材グリッド画像を生成:

```bash
source /Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env

ASSETS_PROMPT='Asset grid for the same pet name diagnosis website design. Arrange the following elements in an organized grid layout on a transparent or light cream background, each clearly separated for individual extraction: 1. Three soft blob shapes (organic, flowing, warm colors — cream, soft orange, terracotta) for hero/mid/footer backgrounds. 2. Two gentle curved divider lines. 3. One subtle card background texture. 4. Three line-art pet silhouettes (dog, cat, rabbit) — simple, elegant, minimal line weight. Make each element clean and clearly separable. No text labels, no emoji, clean design.'

curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{\"model\":\"gpt-5.5\",\"tools\":[{\"type\":\"image_generation\",\"model\":\"gpt-image-2\",\"size\":\"1024x1536\",\"quality\":\"high\"}],\"input\":\"$ASSETS_PROMPT\"}" \
  -o /tmp/sippomi_assets_response.json

python3 -c "
import json, base64
with open('/tmp/sippomi_assets_response.json') as f:
    data = json.load(f)
for item in data.get('output', []):
    if isinstance(item, dict) and item.get('model') == 'gpt-image-2' and item.get('result'):
        with open('/Users/shimizutaiga/Projects/sippomi/outputs/design/assets_grid.png', 'wb') as out:
            out.write(base64.b64decode(item['result']))
        print('assets_grid.png saved')
        break
"
```

【リトライ条件】
- 画像が生成されなかった場合（output に image_generation_call がない）、プロンプトを調整して再試行（最大3回）
- 429 rate limit の場合は 30秒待って再試行

【完了条件】
```bash
ls -la /Users/shimizutaiga/Projects/sippomi/outputs/design/mock_fullpage.png
ls -la /Users/shimizutaiga/Projects/sippomi/outputs/design/assets_grid.png
```
両ファイルが存在し、ファイルサイズが 0 でないこと。

【最終確認】
画像を開いて「AI感がない」「プロのデザイナーが作った水準」であることを確認。
満たさない場合はプロンプトのトンマナ記述（warm, refined, organic, professional など）を強化して再生成。
