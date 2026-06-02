"""Add FAQPage structured data to all breed pages."""
import os, re, glob

BASE = "/Users/shimizutaiga/Projects/sippomi"

def get_breed_name(filepath):
    with open(filepath) as f:
        content = f.read()
    match = re.search(r'<title>(.+?)の名前', content)
    if match:
        return match.group(1)
    return os.path.basename(filepath).replace(".html", "").replace("-", " ").title()

FAQ_TEMPLATE = """    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "BREEDの名前におすすめの傾向は？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BREEDの性格や特徴に合った名前がおすすめです。性別やイメージをもとに、BREEDにぴったりの名前候補を無料で提案します。"
          }
        },
        {
          "@type": "Question",
          "name": "ペットの名前はどうやって決めればいい？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "呼びやすさ（2〜4音が理想）、家族全員が呼びやすいこと、悪い意味がないことを確認しましょう。シッポミの名前診断では、これらの条件を考慮した名前を無料で提案します。"
          }
        },
        {
          "@type": "Question",
          "name": "無料で名前診断できますか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "はい、完全無料です。会員登録も不要。犬種・猫種、性別、イメージを選ぶだけで、ぴったりの名前候補をすぐに表示します。"
          }
        }
      ]
    },
    {
      "@type": "Organization","""

ORG_FULL = '    {\n      "@type": "Organization",\n      "name": "シッポミ",\n      "url": "https://sippomi.com",\n      "logo": "https://sippomi.com/sippomi-mark.svg"\n    }'
ORG_SIMPLE = '    {\n      "@type": "Organization",\n      "name": "シッポミ"\n    }'

count = 0
for category in ["dogs", "cats"]:
    for filepath in sorted(glob.glob(f"{BASE}/breeds/{category}/*.html")):
        breed = get_breed_name(filepath)
        
        with open(filepath) as f:
            content = f.read()
        
        if '"@type": "FAQPage"' in content:
            print(f"  skip {breed}: already present")
            continue
        
        faq_block = FAQ_TEMPLATE.replace("BREED", breed)
        
        if ORG_FULL in content:
            repl = faq_block + '\n      "name": "シッポミ",\n      "url": "https://sippomi.com",\n      "logo": "https://sippomi.com/sippomi-mark.svg"\n    }'
            content = content.replace(ORG_FULL, repl)
            with open(filepath, "w") as f:
                f.write(content)
            count += 1
            print(f"  OK {breed}")
        elif ORG_SIMPLE in content:
            repl = faq_block + '\n      "name": "シッポミ"\n    }'
            content = content.replace(ORG_SIMPLE, repl)
            with open(filepath, "w") as f:
                f.write(content)
            count += 1
            print(f"  OK {breed} (simple)")
        else:
            print(f"  FAIL {breed}: Organization not found")

print(f"\nTotal: {count} pages updated")
