"""Add FAQPage structured data to all breed pages."""
import os, re, glob

BASE = "/Users/shimizutaiga/Projects/sippomi"

def get_breed_name(filepath):
    """Extract breed name from page title."""
    with open(filepath) as f:
        content = f.read()
    match = re.search(r'<title>(.+?)の名前', content)
    if match:
        return match.group(1)
    return os.path.basename(filepath).replace(".html", "").replace("-", " ")

def add_faq_to_file(filepath):
    breed = get_breed_name(filepath)
    
    with open(filepath) as f:
        content = f.read()
    
    # Skip if already has FAQPage
    if '"@type": "FAQPage"' in content:
        print(f"  ⏭ {breed}: already has FAQPage")
        return False
    
    # FAQPage block to insert before Organization
    faq_block = f'''    {{
      "@type": "FAQPage",
      "mainEntity": [
        {{
          "@type": "Question",
          "name": "{breed}の名前におすすめの傾向は？",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{breed}の性格や特徴に合った名前がおすすめです。性別やイメージをもとに、{breed}にぴったりの名前候補を無料で提案します。"
          }}
        }},
        {{
          "@type": "Question",
          "name": "ペットの名前はどうやって決めればいい？",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "呼びやすさ（2〜4音が理想）、家族全員が呼びやすいこと、悪い意味がないことを確認しましょう。シッポミの名前診断では、これらの条件を考慮した名前を無料で提案します。"
          }}
        }},
        {{
          "@type": "Question",
          "name": "無料で名前診断できますか？",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "はい、完全無料です。会員登録も不要。犬種・猫種、性別、イメージを選ぶだけで、ぴったりの名前候補をすぐに表示します。"
          }}
        }}
      ]
    }},
    {{
      "@type": "Organization","""
    
    # Find and replace Organization block
    old_org = '''    {
      "@type": "Organization",
      "name": "シッポミ",
      "url": "https://sippomi.com",
      "logo": "https://sippomi.com/sippomi-mark.svg"
    }'''
    
    new_org = faq_block + '\n      "name": "シッポミ",\n      "url": "https://sippomi.com",\n      "logo": "https://sippomi.com/sippomi-mark.svg"\n    }'
    
    # Check for alternative Organization format (name only)
    old_org_simple = '''    {
      "@type": "Organization",
      "name": "シッポミ"
    }'''
    new_org_simple = faq_block + '\n      "name": "シッポミ"\n    }'
    
    if old_org in content:
        content = content.replace(old_org, new_org)
        with open(filepath, "w") as f:
            f.write(content)
        print(f"  ✅ {breed}")
        return True
    elif old_org_simple in content:
        content = content.replace(old_org_simple, new_org_simple)
        with open(filepath, "w") as f:
            f.write(content)
        print(f"  ✅ {breed} (simple org)")
        return True
    else:
        print(f"  ❌ {breed}: Organization pattern not found")
        return False

# Process all breed files
count = 0
for category in ["dogs", "cats"]:
    for f in sorted(glob.glob(f"{BASE}/breeds/{category}/*.html")):
        if add_faq_to_file(f):
            count += 1

print(f"\n✅ {count} breed pages updated")
