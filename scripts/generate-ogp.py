"""Sippomi種別ページ用OGP画像生成スクリプト"""
from PIL import Image, ImageDraw, ImageFont
import os

BRAND_COLOR = (240, 125, 90)
BRAND_DARK = (80, 50, 40)
ACCENT_WARM = (244, 238, 222)
TEXT_DARK = (60, 55, 50)

WIDTH, HEIGHT = 1200, 630
OUTPUT_DIR = "/Users/shimizutaiga/Projects/sippomi/public/ogp/breeds"

dog_names = {
    "toy-poodle": "トイプードル",
    "shiba-inu": "柴犬",
    "pug": "パグ",
    "pomeranian": "ポメラニアン",
    "miniature-dachshund": "ミニチュアダックスフンド",
    "golden-retriever": "ゴールデンレトリバー",
    "french-bulldog": "フレンチブルドッグ",
    "corgi": "コーギー",
    "chihuahua": "チワワ",
    "yorkshire-terrier": "ヨークシャーテリア",
}
cat_names = {
    "scottish-fold": "スコティッシュフォールド",
    "russian-blue": "ロシアンブルー",
    "ragdoll": "ラグドール",
    "persian": "ペルシャ猫",
    "norwegian-forest": "ノルウェージャンフォレストキャット",
    "munchkin": "マンチカン",
    "maine-coon": "メインクーン",
    "british-shorthair": "ブリティッシュショートヘア",
    "bengal": "ベンガル猫",
    "american-shorthair": "アメリカンショートヘア",
}

font_dir = "/System/Library/Fonts/"
font_path = os.path.join(font_dir, "Hiragino Sans GB.ttc")

try:
    fnt_title = ImageFont.truetype(font_path, 52)
    fnt_small = ImageFont.truetype(font_path, 28)
    fnt_brand = ImageFont.truetype(font_path, 22)
except Exception:
    fnt_title = ImageFont.load_default()
    fnt_small = ImageFont.load_default()
    fnt_brand = ImageFont.load_default()
    print("⚠️ システムフォントが見つからないためデフォルトフォントを使用")

def create_ogp(breed_jp, breed_type, slug):
    img = Image.new("RGB", (WIDTH, HEIGHT), ACCENT_WARM)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (WIDTH, 6)], fill=BRAND_COLOR)
    draw.rectangle([(40, 100), (48, 530)], fill=BRAND_COLOR)

    type_label = "犬の名前" if breed_type == "dog" else "猫の名前"
    draw.text((80, 180), type_label, fill=TEXT_DARK + (180,), font=fnt_brand)

    parts = breed_jp.split("の名前", 1)
    title = breed_jp
    sub = "人気ランキングとおしゃれな名付け方"

    draw.text((80, 220), title, fill=TEXT_DARK, font=fnt_title)
    draw.text((80, 300), sub, fill=BRAND_COLOR, font=fnt_small)
    draw.text((80, 480), "シッポミ — 名前が決まる、その瞬間から。", fill=TEXT_DARK + (150,), font=fnt_brand)
    draw.rectangle([(80, 520), (WIDTH - 80, 522)], fill=TEXT_DARK + (30,))

    for i in range(3):
        cx = WIDTH - 80 - i * 35
        cy = HEIGHT - 60
        r = 8 - i * 2
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=BRAND_COLOR)

    return img


os.makedirs(f"{OUTPUT_DIR}/dogs", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/cats", exist_ok=True)

created = 0
for slug, name in dog_names.items():
    img = create_ogp(name, "dog", slug)
    path = f"{OUTPUT_DIR}/dogs/{slug}.webp"
    img.save(path, "WEBP", quality=85)
    size_kb = os.path.getsize(path) // 1024
    print(f"  ✅ {slug}.webp ({size_kb}KB)")
    created += 1

for slug, name in cat_names.items():
    img = create_ogp(name, "cat", slug)
    path = f"{OUTPUT_DIR}/cats/{slug}.webp"
    img.save(path, "WEBP", quality=85)
    size_kb = os.path.getsize(path) // 1024
    print(f"  ✅ {slug}.webp ({size_kb}KB)")
    created += 1

print(f"\n{created} OGP images created in {OUTPUT_DIR}/")
