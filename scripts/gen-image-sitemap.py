"""Generate image sitemap for sippomi.com"""
import glob, os
from datetime import date

BASE = "/Users/shimizutaiga/Projects/sippomi"
SITE = "https://sippomi.com"
TODAY = date.today().isoformat()

images = []

# Breed OGP images
for f in sorted(glob.glob(f"{BASE}/public/ogp/breeds/dogs/*.webp")):
    name = os.path.basename(f).replace(".webp", "")
    page = f"{SITE}/breeds/dogs/{name}"
    images.append((page, f"{SITE}/ogp/breeds/dogs/{name}.webp", f"{name.replace('-', ' ').title()}の名前 OGP画像"))

for f in sorted(glob.glob(f"{BASE}/public/ogp/breeds/cats/*.webp")):
    name = os.path.basename(f).replace(".webp", "")
    page = f"{SITE}/breeds/cats/{name}"
    images.append((page, f"{SITE}/ogp/breeds/cats/{name}.webp", f"{name.replace('-', ' ').title()}の名前 OGP画像"))

# Journal images
journal_map = {
    "journal-first-days": "images/journal/journal-first-days.webp",
    "journal-first-shopping": "images/journal/journal-first-shopping.webp",
    "journal-first-pet-checklist": "images/journal/journal-first-pet-checklist.webp",
    "journal-first-pet-cost": "images/journal/journal-first-pet-cost.webp",
    "journal-first-summer": "images/journal/journal-first-summer.webp",
    "journal-pet-vaccine-schedule": "images/journal/journal-pet-vaccine-schedule.webp",
    "journal-dog-walk-when": "images/journal/journal-dog-walk-when.webp",
    "journal-dog-alone-training": "images/journal/journal-dog-alone-training.webp",
    "journal-cat-cage-necessary": "images/journal/journal-cat-cage-necessary.webp",
    "journal-cat-toilet-fixes": "images/journal/journal-cat-toilet-fixes.webp",
    "journal-home-safety": "images/journal/journal-home-safety.webp",
    "journal-pet-fast-eating": "images/journal/journal-pet-fast-eating.webp",
    "journal-pet-bousai": "images/journal/journal-pet-bousai.webp",
    "journal-kanto-pet-outings": "images/journal/journal-kanto-pet-outings.webp",
}

for slug, img in journal_map.items():
    img_path = os.path.join(BASE, "public", img)
    if os.path.exists(img_path):
        images.append((f"{SITE}/{slug}", f"{SITE}/{img}", f"{slug} アイキャッチ"))

# Main OGP
images.append((f"{SITE}/", f"{SITE}/ogp.webp", "シッポミ OGP画像"))

# Logo
images.append((f"{SITE}/", f"{SITE}/sippomi-mark.svg", "シッポミ ロゴ"))

# Build XML
xml = ['<?xml version="1.0" encoding="UTF-8"?>']
xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
xml.append('         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">')

for page_url, img_url, caption in images:
    xml.append("  <url>")
    xml.append(f"    <loc>{page_url}</loc>")
    xml.append(f"    <lastmod>{TODAY}</lastmod>")
    xml.append("    <image:image>")
    xml.append(f"      <image:loc>{img_url}</image:loc>")
    if caption:
        xml.append(f"      <image:caption>{caption}</image:caption>")
    xml.append("    </image:image>")
    xml.append("  </url>")

xml.append("</urlset>")

output = os.path.join(BASE, "public", "sitemap-images.xml")
with open(output, "w", encoding="utf-8") as f:
    f.write("\n".join(xml) + "\n")

print(f"✅ Image sitemap: {output}")
print(f"   {len(images)} images indexed")

# Update robots.txt to include image sitemap
robots_path = os.path.join(BASE, "public", "robots.txt")
with open(robots_path) as f:
    robots = f.read()

if "sitemap-images.xml" not in robots:
    robots += "\nSitemap: https://sippomi.com/sitemap-images.xml\n"
    with open(robots_path, "w") as f:
        f.write(robots)
    print(f"✅ robots.txt updated with image sitemap")
