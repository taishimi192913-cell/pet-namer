#!/usr/bin/env python3
"""Bulk-generate breed pages + missing journal articles for sippomi.com."""
import os

ROOT = '/Users/shimizutaiga/Projects/sippomi'

HEADER = '''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#f4eede">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1c1b18">
  <link rel="icon" type="image/svg+xml" href="/sippomi-mark.svg">
'''

FOOTER_OPEN = '''  </main>
  <section class="section related-articles" aria-labelledby="relatedHeading-{slug}">
  <h2 id="relatedHeading-{slug}" class="related-articles__title">あわせて読みたい</h2>
  <div class="related-articles__grid" id="relatedArticles-{slug}"></div>
  </section>
  <footer class="page-footer">
    <div class="page-footer__inner">
      <a href="/" class="footer-logo">
        <div class="footer-logo-icon" aria-hidden="true">
          <img src="/sippomi-mark.svg" alt="" class="footer-logo-mark" width="32" height="32" loading="lazy" decoding="async">
        </div>
        <span class="footer-logo-text">シッポミ</span>
      </a>
      <p class="footer-note">名前が決まる、その瞬間から。シッポミは、はじめてのペット暮らしに寄り添います。</p>
      <nav class="footer-links">
        <a href="/welcome-prep">お迎えガイド</a>
        <a href="/dog-names">犬の名前</a>
        <a href="/cat-names">猫の名前</a>
      </nav>
      <p class="footer-copy">&copy; 2026 シッポミ</p>
    </div>
  </footer>
  <script type="module" src="/src/site-visuals.js"></script>
  <script type="module" src="/src/analytics.js"></script>
  <script type="module">
  import { renderRelatedArticles } from '/src/journal-links.js';
  renderRelatedArticles('{slug}');
  </script>
</body>
</html>'''

# ── Dog breeds ──
DOG_BREEDS = {
    'maltese': ('マルチーズ', 'マルチーズにぴったりの名前を10選。白くてふわふわした見た目に合う名前や、優しい響きの名前を集めました。', ['journal-dog-alone-training', 'journal-dog-barking', 'journal-first-shopping', 'journal-home-safety', 'journal-first-summer']),
    'bichon-frise': ('ビションフリーゼ', 'ビションフリーゼにぴったりの名前を10選紹介。明るく活発な性格に合う名前や、人気の名前ランキング。', ['journal-dog-walk-when', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-fast-eating', 'journal-first-summer']),
    'pomeranian': ('ポメラニアン', 'ポメラニアンにぴったりの名前を10選。小さくてふわふわした見た目に合う可愛い名前を集めました。', ['journal-dog-alone-training', 'journal-dog-barking', 'journal-first-pet-checklist', 'journal-first-shopping', 'journal-dog-biting']),
    'mini-dachshund': ('ミニチュアダックスフンド', 'ミニチュアダックスフンドにぴったりの名前を10選。胴長の愛らしい姿に合う名前から人気ランキングまで。', ['journal-dog-walk-when', 'journal-dog-barking', 'journal-dog-biting', 'journal-first-days', 'journal-first-summer']),
    'yorkshire-terrier': ('ヨークシャーテリア', 'ヨークシャーテリアにぴったりの名前を10選。小さくて華やかな見た目に合う名前や人気の名前を紹介。', ['journal-dog-alone-training', 'journal-puppy-toilet-training', 'journal-first-pet-checklist', 'journal-home-safety', 'journal-pet-fast-eating']),
    'papillon': ('パピヨン', 'パピヨンにぴったりの名前を10選。蝶のような耳と賢い性格に合う名前や人気ランキング。', ['journal-dog-walk-when', 'journal-dog-barking', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-heatstroke']),
    'shetland-sheepdog': ('シェットランド・シープドッグ', 'シェットランド・シープドッグにぴったりの名前を10選。賢くて美しいシェルティに合う名前を集めました。', ['journal-dog-alone-training', 'journal-dog-walk-when', 'journal-first-summer', 'journal-home-safety', 'journal-pet-vaccine-schedule']),
    'pug': ('パグ', 'パグにぴったりの名前を10選。愛嬌のある顔と性格に合う名前や人気の名前を紹介します。', ['journal-pet-heatstroke', 'journal-first-summer', 'journal-dog-barking', 'journal-pet-fast-eating', 'journal-first-days']),
    'french-bulldog': ('フレンチブルドッグ', 'フレンチブルドッグにぴったりの名前を10選。個性的な見た目と穏やかな性格に合う名前を集めました。', ['journal-dog-barking', 'journal-dog-biting', 'journal-pet-heatstroke', 'journal-first-summer', 'journal-puppy-toilet-training']),
    'border-collie': ('ボーダーコリー', 'ボーダーコリーにぴったりの名前を10選。賢くて活発な性格に合う、かっこいい名前や人気ランキング。', ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-first-days', 'journal-pet-insurance', 'journal-dog-heartworm']),
    'welsh-corgi': ('ウェルシュ・コーギー', 'コーギーにぴったりの名前を10選。短い足と大きな耳が可愛いコーギーに合う名前を紹介します。', ['journal-dog-walk-when', 'journal-dog-barking', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-fast-eating']),
    'golden-retriever': ('ゴールデン・レトリーバー', 'ゴールデン・レトリーバーにぴったりの名前を10選。明るくて人懐っこい性格に合う名前や人気ランキング。', ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-dog-biting', 'journal-puppy-toilet-training', 'journal-first-summer']),
    'beagle': ('ビーグル', 'ビーグルにぴったりの名前を10選。明るくて好奇心旺盛な性格に合う名前を集めました。', ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-dog-barking', 'journal-first-days', 'journal-pet-heatstroke']),
    'miniature-schnauzer': ('ミニチュアシュナウザー', 'ミニチュアシュナウザーにぴったりの名前を10選。ひげと眉毛が特徴的な愛らしい犬種に合う名前を紹介。', ['journal-dog-barking', 'journal-dog-alone-training', 'journal-puppy-toilet-training', 'journal-first-pet-checklist', 'journal-home-safety']),
    'doberman': ('ドーベルマン', 'ドーベルマンにぴったりの名前を10選。かっこよくて賢い性格に合う名前や人気ランキング。', ['journal-dog-walk-when', 'journal-dog-biting', 'journal-dog-heartworm', 'journal-pet-insurance', 'journal-pet-neuter']),
    'rottweiler': ('ロットワイラー', 'ロットワイラーにぴったりの名前を10選。たくましい見た目と忠実な性格に合う名前を集めました。', ['journal-dog-biting', 'journal-dog-walk-when', 'journal-pet-neuter', 'journal-pet-insurance', 'journal-first-days']),
    'great-pyrenees': ('グレート・ピレニーズ', 'グレート・ピレニーズにぴったりの名前を10選。大きくて優しい性格に合う名前や人気の名前を紹介。', ['journal-pet-heatstroke', 'journal-first-summer', 'journal-dog-walk-when', 'journal-home-safety', 'journal-pet-bousai']),
}

# ── Cat breeds ──
CAT_BREEDS = {
    'mix': ('雑種（ミックス）', '雑種・ミックス猫にぴったりの名前を10選。個性豊かな猫に合うユニークで可愛い名前を集めました。', ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping']),
    'siamese': ('シャム', 'シャム猫にぴったりの名前を10選。エレガントな見た目とおしゃべりな性格に合う名前を紹介。', ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-cat-night-crying', 'journal-home-safety', 'journal-first-summer']),
    'abyssinian': ('アビシニアン', 'アビシニアンにぴったりの名前を10選。活発で知的な性格に合う名前や人気ランキング。', ['journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping', 'journal-pet-fast-eating']),
    'exotic-shorthair': ('エキゾチックショートヘア', 'エキゾチックショートヘアにぴったりの名前を10選。ペルシャに似た愛らしい顔立ちに合う名前を集めました。', ['journal-cat-toilet-fixes', 'journal-cat-cage-necessary', 'journal-first-shopping', 'journal-pet-fast-eating', 'journal-first-summer']),
    'ragdoll': ('ラグドール', 'ラグドールにぴったりの名前を10選。抱っこが好きな穏やかな性格に合う優しい響きの名前を紹介。', ['journal-cat-cage-necessary', 'journal-cat-scratching', 'journal-home-safety', 'journal-first-days', 'journal-pet-vaccine-schedule']),
    'persian': ('ペルシャ', 'ペルシャ猫にぴったりの名前を10選。長く美しい被毛と優雅な雰囲気に合う名前を集めました。', ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-home-safety', 'journal-pet-fast-eating', 'journal-first-shopping']),
    'maine-coon': ('メインクーン', 'メインクーンにぴったりの名前を10選。大きな体と優しい性格に合う、風格のある名前を紹介。', ['journal-cat-cage-necessary', 'journal-cat-scratching', 'journal-home-safety', 'journal-first-summer', 'journal-pet-vaccine-schedule']),
    'sphynx': ('スフィンクス', 'スフィンクスにぴったりの名前を10選。個性的な見た目と愛情深い性格に合うユニークな名前を集めました。', ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-pet-heatstroke', 'journal-first-summer', 'journal-pet-fast-eating']),
    'russian-blue': ('ロシアンブルー', 'ロシアンブルーにぴったりの名前を10選。神秘的なグレーの被毛と控えめな性格に合う名前を紹介。', ['journal-cat-toilet-fixes', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping', 'journal-cat-scratching']),
    'american-shorthair': ('アメリカンショートヘア', 'アメリカンショートヘアにぴったりの名前を10選。丈夫でバランスの取れた体型と穏やかな性格に合う名前を紹介。', ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-pet-fast-eating', 'journal-first-summer']),
}

# ── Small animals ──
SMALL_ANIMALS = {
    'hamster': ('ハムスター', 'ハムスターにぴったりの名前を10選。小さくて愛らしい姿に合う名前や、食べ物に由来する可愛い名前を集めました。', ['journal-home-safety', 'journal-first-shopping', 'journal-first-pet-checklist', 'journal-pet-bousai', 'journal-pet-fast-eating']),
    'ferret': ('フェレット', 'フェレットにぴったりの名前を10選。いたずら好きで愛嬌のある性格に合う、ユニークで可愛い名前を紹介。', ['journal-home-safety', 'journal-first-shopping', 'journal-pet-fast-eating', 'journal-first-summer', 'journal-pet-bousai']),
    'bird': ('鳥（小鳥・インコ・オウム）', '鳥にぴったりの名前を10選。色鮮やかな羽やおしゃべりな性格に合う、ユニークな名前を集めました。', ['journal-home-safety', 'journal-first-shopping', 'journal-first-summer', 'journal-pet-bousai', 'journal-pet-fast-eating']),
    'reptile': ('爬虫類（トカゲ・カメ・ヘビ）', '爬虫類にぴったりの名前を10選。かっこいい見た目やユニークな性格に合う名前を集めました。', ['journal-home-safety', 'journal-first-shopping', 'journal-pet-bousai', 'journal-pet-heatstroke', 'journal-first-summer']),
}


# ── Generate breed name pages ──
def gen_breed_page(filename, breed_name_jp, description, slug, related_slugs, parent_slug, parent_name, parent_title):
    names = _name_suggestions(slug)
    faq_qs = _faq_questions(breed_name_jp, parent_name)
    breadcrumb_items = [
        (parent_name, f'/{parent_slug}'),
        (f'{breed_name_jp}の名前', ''),
    ]
    breadcrumb_json = _breadcrumb_json(breadcrumb_items)
    faq_json = _faq_json(faq_qs)
    
    names_html = ''.join(f'''    <div class="breed-name-item">
      <strong class="breed-name">{n[0]}</strong>
      <span class="breed-name-reading">{n[1]}</span>
      <span class="breed-name-impression">{n[2]}</span>
    </div>''' for n in names[:10])
    
    content = HEADER
    content += f'''  <title>{breed_name_jp}の名前10選｜人気ランキングと呼びやすい名前の選び方 — シッポミ</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://sippomi.com/{filename}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{breed_name_jp}の名前10選｜人気ランキングと呼びやすい名前の選び方 — シッポミ">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="https://sippomi.com/{filename}">
  <meta property="og:image" content="https://sippomi.com/ogp.webp">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="シッポミ">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{breed_name_jp}の名前10選｜人気ランキングと呼びやすい名前の選び方 — シッポミ">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://sippomi.com/ogp.webp">
  <script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "CollectionPage",
      "name": "{breed_name_jp}の名前を探す",
      "url": "https://sippomi.com/{filename}",
      "description": "{description}",
      "inLanguage": "ja"
    }},
    {breadcrumb_json}
  ]
}}</script>
  <link rel="stylesheet" href="/src/styles/global.css">
  <script type="application/ld+json">{faq_json}</script>
</head>
<body>
  <header class="page-header">
    <div class="page-header__inner">
      <a href="/" class="page-header__logo">
        <div class="page-header__logo-icon" aria-hidden="true">
          <img src="/sippomi-mark.svg" alt="" class="page-header__logo-mark" width="38" height="38" loading="lazy" decoding="async">
        </div>
        <div>
          <span class="page-header__logo-text">シッポミ</span>
          <span class="page-header__logo-sub">Sippomi</span>
        </div>
      </a>
      <nav class="page-header__nav" aria-label="サイトナビゲーション">
        <a href="/#stepSpecies" class="page-header__nav-link">名前を決める</a>
        <a href="/welcome-prep" class="page-header__nav-link">お迎えガイド</a>
        <a href="/starter-set" class="page-header__nav-link">商品</a>
        <a href="/#faqSection" class="page-header__faq-link">FAQ</a>
      </nav>
    </div>
  </header>
  <main class="page-main">
    <nav aria-label="パンくずリスト">
      <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="/"><span itemprop="name">シッポミ</span></a>
          <meta itemprop="position" content="1">
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="/{parent_slug}"><span itemprop="name">{parent_title}</span></a>
          <meta itemprop="position" content="2">
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <span itemprop="name">{breed_name_jp}の名前</span>
          <meta itemprop="position" content="3">
        </li>
      </ol>
    </nav>

    <section class="section breed-hero">
      <h1>{breed_name_jp}の名前10選</h1>
      <p class="breed-intro">{description}</p>
    </section>

    <section class="section">
      <h2>{breed_name_jp}におすすめの名前一覧</h2>
      <div class="breed-names-list">
{names_html}
      </div>
    </section>

    <section class="section seo-cta">
      <a class="btn-primary" href="/#stepSpecies">トップで名前診断を始める</a>
    </section>

    <section class="section section--subtle seo-cross">
      <p class="seo-cross__title">名前が決まったら次に読む</p>
      <div class="seo-cross__links">
        <a href="/{parent_slug}">{parent_title}</a>
        <a href="/journal-first-pet-checklist">お迎え準備チェックリスト</a>
        <a href="/journal-first-days">迎えた初日にやること</a>
      </div>
    </section>

    <section class="section section--subtle seo-cross">
      <p class="seo-cross__title">ほかの動物の名前</p>
      <div class="seo-cross__links">
        <a href="/dog-names">犬の名前を探す</a>
        <a href="/cat-names">猫の名前を探す</a>
        <a href="/rabbit-names">うさぎの名前を探す</a>
      </div>
    </section>
'''
    # FAQ section
    content += '''    <section class="section faq-section" aria-labelledby="faq-heading">
      <h2 class="faq-section__title" id="faq-heading">よくある質問</h2>
      <div class="faq-list">
'''
    for q, a in faq_qs:
        content += f'''        <details class="faq-item">
          <summary class="faq-item__question">{q}</summary>
          <div class="faq-item__answer"><p>{a}</p></div>
        </details>
'''
    content += '''      </div>
    </section>
'''
    footer = FOOTER_OPEN.replace('{slug}', slug)
    content += footer
    return content


def _name_suggestions(slug):
    pool = {
        'labrador-retriever': [('ソラ', 'そら', '明るく爽やか'), ('レオ', 'れお', '力強い'), ('ハク', 'はく', '清らか'), ('コタロウ', 'こたろう', '親しみやすい'), ('モカ', 'もか', 'おしゃれ'), ('リク', 'りく', '大地のイメージ'), ('マロン', 'まろん', '愛らしい'), ('ベル', 'べる', '優しい響き'), ('ルカ', 'るか', '人懐っこい'), ('ハナ', 'はな', '可愛らしい')],
        'shih-tzu': [('モカ', 'もか', '甘くて可愛い'), ('ハナ', 'はな', '華やか'), ('ココ', 'ここ', '小さくて愛らしい'), ('マロン', 'まろん', 'ふわふわ'), ('ミルク', 'みるく', '優しい'), ('モモ', 'もも', '桃のように可愛い'), ('チョビ', 'ちょび', 'ちょっとした茶目っ気'), ('ピノ', 'ぴの', '小さくて可愛い'), ('クッキー', 'くっきー', '甘い雰囲気'), ('ラテ', 'らて', '温かみのある')],
        'cavalier': [('チャーリー', 'ちゃーりー', '愛される王様気質'), ('ソラ', 'そら', '穏やかな空'), ('ルーイ', 'るーい', 'フレンドリー'), ('ベラ', 'べら', '美しい'), ('ハリー', 'はりー', '活発'), ('リリー', 'りりー', '優雅'), ('ココ', 'ここ', '小さくて可愛い'), ('バディ', 'ばでぃ', '相棒'), ('ミリー', 'みりー', '愛らしい'), ('ウィンストン', 'うぃんすとん', '気品がある')],
        'maltese': [('ユキ', 'ゆき', '白くて清らか'), ('ココ', 'ここ', '小さくて可愛い'), ('モカ', 'もか', '温かみのある'), ('ピノ', 'ぴの', '小さな粒'), ('ラテ', 'らて', '優しい色合い'), ('マロン', 'まろん', 'ふわふわ'), ('ミルク', 'みるく', '白くて優しい'), ('ティアラ', 'てぃあら', '気品がある'), ('モモ', 'もも', '桃のように可愛い'), ('リボン', 'りぼん', '愛らしい')],
        'bichon-frise': [('モコ', 'もこ', 'ふわふわ'), ('ココ', 'ここ', '小さくて可愛い'), ('マシュマロ', 'ましゅまろ', 'ふわふわで甘い'), ('ピノ', 'ぴの', '小さな粒'), ('モカ', 'もか', '温かみのある'), ('ラテ', 'らて', '優しい'), ('コロン', 'ころん', '丸くて可愛い'), ('シフォン', 'しふぉん', '軽やか'), ('パフ', 'ぱふ', 'ふわり'), ('メル', 'める', '優しい響き')],
        'pomeranian': [('モコ', 'もこ', 'ふわふわ'), ('ポン', 'ぽん', '小さくて軽やか'), ('コタロウ', 'こたろう', '愛される'), ('ピノ', 'ぴの', '小さくて可愛い'), ('モカ', 'もか', '甘い'), ('ラテ', 'らて', '優しい'), ('チビ', 'ちび', '小さくて可愛い'), ('マロン', 'まろん', 'ふわふわ'), ('コロン', 'ころん', '丸い'), ('アン', 'あん', 'あんこみたいに愛しい')],
        'mini-dachshund': [('ソーセージ', 'そーせーじ', '胴長をかわいく'), ('レオ', 'れお', '勇敢'), ('クッキー', 'くっきー', '甘い雰囲気'), ('チョコ', 'ちょこ', '茶色い毛にぴったり'), ('ハナ', 'はな', '可愛らしい'), ('コタロウ', 'こたろう', '親しみやすい'), ('グー', 'ぐー', '短くてかっこいい'), ('リク', 'りく', '落ち着いた'), ('メイ', 'めい', '明るい'), ('ルーク', 'るーく', '小さくても強い')],
        'yorkshire-terrier': [('ティアラ', 'てぃあら', '気品がある'), ('リリー', 'りりー', '華やか'), ('ココ', 'ここ', '小さくて可愛い'), ('モモ', 'もも', '甘くて可愛い'), ('ピノ', 'ぴの', '小さな宝石'), ('ラテ', 'らて', '優しい'), ('ベラ', 'べら', '美しい'), ('ミルク', 'みるく', '優しい響き'), ('リボン', 'りぼん', '可愛い'), ('シフォン', 'しふぉん', '軽やかで華やか')],
        'papillon': [('チョウ', 'ちょう', '蝶のような耳'), ('ソラ', 'そら', '空のように自由'), ('ピピ', 'ぴぴ', '小さくて可愛い'), ('リリー', 'りりー', '華やか'), ('ミミ', 'みみ', '大きな耳'), ('ココ', 'ここ', '親しみやすい'), ('ベル', 'べる', '軽やかな響き'), ('ラテ', 'らて', '優しい'), ('ルナ', 'るな', '月のように')],
        'shetland-sheepdog': [('ソラ', 'そら', '爽やかで清らか'), ('ルナ', 'るな', '月のように美しい'), ('レオ', 'れお', '賢く力強い'), ('リク', 'りく', '大地のような落ち着き'), ('サクラ', 'さくら', '日本の風景に合う'), ('ハク', 'はく', '白くて清らか'), ('メイ', 'めい', '明るい'), ('ベン', 'べん', '知的'), ('リリー', 'りりー', '優雅'), ('コタロウ', 'こたろう', '忠実で親しみやすい')],
        'pug': [('パグ', 'ぱぐ', 'そのままで可愛い'), ('ブー', 'ぶー', 'ぶくぶくの顔'), ('コタロウ', 'こたろう', '親しみやすい'), ('モカ', 'もか', '甘い雰囲気'), ('チョコ', 'ちょこ', '茶色い毛にぴったり'), ('マロン', 'まろん', '丸くて可愛い'), ('スー', 'すー', 'いびきみたいに'), ('ハナ', 'はな', 'つぶれた鼻'), ('モモ', 'もも', '桃のよう'), ('タロー', 'たろう', 'どっしり可愛い')],
        'french-bulldog': [('フク', 'ふく', '福を呼ぶ'), ('レオ', 'れお', '小さな獅子'), ('ブルー', 'ぶるー', 'フレブルのイメージカラー'), ('コタロウ', 'こたろう', '親しみやすい'), ('ソラ', 'そら', 'おおらか'), ('モカ', 'もか', '甘い雰囲気'), ('ビーン', 'びーん', '小さな豆'), ('ハナ', 'はな', '可愛い'), ('マロン', 'まろん', '丸っとした姿'), ('ジャック', 'じゃっく', '男らしい')],
        'border-collie': [('ハク', 'はく', '白くて賢い'), ('レオ', 'れお', 'リーダー的存在'), ('ソラ', 'そら', '広い草原を思わせる'), ('ベル', 'べる', '動きが美しい'), ('リク', 'りく', '大地'), ('エース', 'えーす', '一番'), ('ルナ', 'るな', '月夜に映える'), ('スカイ', 'すかい', '広い空のように'), ('コタロウ', 'こたろう', '忠実'), ('ジーナ', 'じーな', '女王のような美しさ')],
        'welsh-corgi': [('コタロウ', 'こたろう', '短足に愛着'), ('ソラ', 'そら', '明るい'), ('モカ', 'もか', '甘い雰囲気'), ('ハナ', 'はな', '可愛らしい'), ('リク', 'りく', '落ち着いた'), ('マロン', 'まろん', '丸いお尻'), ('レオ', 'れお', '勇敢'), ('メイ', 'めい', '明るい'), ('ココ', 'ここ', '親しみやすい'), ('バター', 'ばたー', 'バター犬で有名')],
        'golden-retriever': [('ソラ', 'そら', '明るく爽やか'), ('レオ', 'れお', '頼もしい'), ('ハク', 'はく', '黄金の輝き'), ('マロン', 'まろん', 'ゴールデンの毛色'), ('リク', 'りく', '大地のように穏やか'), ('ベル', 'べる', '優しい響き'), ('コタロウ', 'こたろう', '家族の一員'), ('ルカ', 'るか', '人懐っこい'), ('モカ', 'もか', '温かみのある'), ('メイ', 'めい', '陽だまりのような')],
        'beagle': [('ビーグル', 'びーぐる', 'そのままで愛される'), ('ロック', 'ろっく', '頑丈'), ('スヌーピー', 'すぬーぴー', 'ビーグルの代名詞'), ('ハナ', 'はな', '嗅覚の良さから'), ('ソラ', 'そら', '明るい'), ('コタロウ', 'こたろう', '親しみやすい'), ('リク', 'りく', '落ち着いた'), ('チョコ', 'ちょこ', '三毛の子に'), ('チャーリー', 'ちゃーりー', '陽気'), ('バディ', 'ばでぃ', '相棒')],
        'miniature-schnauzer': [('シュナ', 'しゅな', '親しみやすい'), ('ソラ', 'そら', '爽やか'), ('レオ', 'れお', '勇ましい'), ('ハク', 'はく', 'あごひげが白い'), ('コタロウ', 'こたろう', '忠実'), ('ルカ', 'るか', '賢い'), ('モカ', 'もか', '甘い雰囲気'), ('ベル', 'べる', '優しい'), ('クッキー', 'くっきー', 'あごひげがかわいい'), ('メイ', 'めい', '明るい')],
        'doberman': [('レオ', 'れお', '王のような風格'), ('ハク', 'はく', '清廉でかっこいい'), ('ソラ', 'そら', '大きな空'), ('リク', 'りく', '地に足がついた'), ('ケン', 'けん', '武士のような'), ('マックス', 'まっくす', '最大の'), ('エース', 'えーす', '一番'), ('コウ', 'こう', '鋼のような強さ'), ('ベル', 'べる', '優しさも持つ'), ('ルーク', 'るーく', 'かっこいい')],
        'rottweiler': [('レオ', 'れお', '勇猛な獅子'), ('クロ', 'くろ', '力強い'), ('ケン', 'けん', '武士'), ('マックス', 'まっくす', '最も強い'), ('ソラ', 'そら', '心の広さ'), ('リク', 'りく', '大地'), ('エース', 'えーす', '頼れる'), ('コタロウ', 'こたろう', '忠誠心'), ('ハク', 'はく', 'どこかに白い模様'), ('タイガ', 'たいが', '虎のように')],
        'great-pyrenees': [('ユキ', 'ゆき', '白い雪のような'), ('ソラ', 'そら', '大きな空'), ('ハク', 'はく', '白く清らか'), ('シロ', 'しろ', '真っ白'), ('リク', 'りく', '山のような大きさ'), ('ベル', 'べる', '優しい守護者'), ('ソル', 'そる', '太陽'), ('ムーン', 'むーん', '月夜に映える'), ('マウンテン', 'まうんてん', '山のような大きさ'), ('ピレ', 'ぴれ', 'ピレニーズの愛称')],
        # cat breeds
        'mix': [('ソラ', 'そら', '自由な空'), ('ミケ', 'みけ', '三毛猫の愛称'), ('クロ', 'くろ', '黒猫にぴったり'), ('シロ', 'しろ', '白猫に'), ('タマ', 'たま', '昔ながらの猫の名前'), ('ハナ', 'はな', '可愛らしい'), ('モカ', 'もか', '甘い雰囲気'), ('サクラ', 'さくら', '日本の猫らしさ'), ('ソラマメ', 'そらまめ', 'ユニークで愛らしい'), ('マロン', 'まろん', '丸くて可愛い')],
        'siamese': [('ルナ', 'るな', '月のように神秘'), ('サファイア', 'さふぁいあ', 'ブルーの瞳'), ('メイ', 'めい', '明るく優雅'), ('チャイ', 'ちゃい', 'お茶のような温かみ'), ('ユキ', 'ゆき', '白い被毛'), ('コバルト', 'こばると', '目の色'), ('シア', 'しあ', 'シャムの短縮'), ('ミント', 'みんと', 'すっきり爽やか'), ('月（ルナ）', 'つき', 'クールビューティ'), ('サクラ', 'さくら', '華やか')],
        'abyssinian': [('ソラ', 'そら', '野性的で自由'), ('レオ', 'れお', '小さな獅子'), ('ココ', 'ここ', '活発'), ('メイ', 'めい', '輝く'), ('ミミ', 'みみ', '大きな耳'), ('ジン', 'じん', 'すばしっこい'), ('ルー', 'るー', '軽やか'), ('ベル', 'べる', '動きが美しい'), ('マヤ', 'まや', '神秘'), ('ジャスミン', 'やすみん', '優雅な')],
        'exotic-shorthair': [('モカ', 'もか', '甘くて優しい'), ('マロン', 'まろん', '丸い顔にぴったり'), ('モモ', 'もも', '桃のように可愛い'), ('ココ', 'ここ', '親しみやすい'), ('ハナ', 'はな', 'つぶれた鼻が可愛い'), ('ミルク', 'みるく', '優しい'), ('プリン', 'ぷりん', 'ぷにぷに'), ('マシュマロ', 'ましゅまろ', '柔らかい'), ('チョコ', 'ちょこ', '甘い雰囲気'), ('ピノ', 'ぴの', '小さくて可愛い')],
        'ragdoll': [('ラグ', 'らぐ', 'ラグドールの愛称'), ('ユキ', 'ゆき', '白くて綺麗'), ('ルナ', 'るな', '月のような美しさ'), ('モカ', 'もか', '温かみのある'), ('ベル', 'べる', '抱っこすると鳴る'), ('ソラ', 'そら', '穏やかな空'), ('ミルク', 'みるく', '白い被毛'), ('ラテ', 'らて', '優しい'), ('メイ', 'めい', '優しい光'), ('シフォン', 'しふぉん', '軽やかで優しい')],
        'persian': [('シルク', 'しるく', '絹のような毛'), ('ユキ', 'ゆき', '雪のように白い'), ('モカ', 'もか', '甘い'), ('ベル', 'べる', '気品がある'), ('リリー', 'りりー', '優雅'), ('マロン', 'まろん', 'ふわふわ'), ('ラテ', 'らて', '優しい響き'), ('ルナ', 'るな', '神秘的'), ('ミルク', 'みるく', '優しい'), ('ピーチ', 'ぴーち', '柔らかな雰囲気')],
        'maine-coon': [('ソラ', 'そら', '大きな体と空'), ('レオ', 'れお', '森の王'), ('ハク', 'はく', '凛々しい'), ('マウンテン', 'まうんてん', '大きな体'), ('ベル', 'べる', '優しい巨人'), ('リク', 'りく', 'たくましい'), ('ルカ', 'るか', '賢い'), ('タイガ', 'たいが', '虎のような縞模様'), ('ユキ', 'ゆき', '冬の毛並み'), ('コタロウ', 'こたろう', '貫禄がある')],
        'sphynx': [('イブ', 'いぶ', '宇宙人のような愛らしさ'), ('ルナ', 'るな', '神秘'), ('ソラ', 'そら', 'しわしわの空'), ('ミミ', 'みみ', '大きな耳'), ('ココ', 'ここ', 'なめらかな肌'), ('ピノ', 'ぴの', 'ユニーク'), ('マーブル', 'まーぶる', '大理石のような肌'), ('バルー', 'ばるー', '風船みたい'), ('エイリアン', 'えいりあん', '愛称として'), ('モカ', 'もか', '温かい肌')],
        'russian-blue': [('ソラ', 'そら', '灰色の空'), ('ルナ', 'るな', '月の光'), ('ミスト', 'みすと', '霧のような'), ('シルバー', 'しるばー', '銀色の被毛'), ('ベル', 'べる', '優しい'), ('ブルー', 'ぶるー', 'ブルーグレーの毛'), ('ユキ', 'ゆき', '神秘的な白'), ('ルー', 'るー', 'シンプルでかっこいい'), ('スカイ', 'すかい', '灰色がかった空'), ('メイ', 'めい', '静かな輝き')],
        'american-shorthair': [('ソラ', 'そら', '自由で明るい'), ('タマ', 'たま', 'アメリカ版たま'), ('クロ', 'くろ', 'トラ猫に'), ('ミケ', 'みけ', '三毛猫'), ('ハナ', 'はな', '可愛い'), ('コタロウ', 'こたろう', '親しみやすい'), ('レオ', 'れお', '小さな獅子'), ('マロン', 'まろん', '丸い顔'), ('シロ', 'しろ', '白猫に'), ('ブッチ', 'ぶっち', 'どっしり可愛い')],
    }
    return pool.get(slug, [('ソラ', 'そら', '爽やか'), ('レオ', 'れお', 'かっこいい'), ('ハナ', 'はな', '可愛い')])


def _faq_questions(breed, parent):
    generic = [
        (f'{breed}の名前はいつ決めれば良い？', f'お迎えの1週間前までには決めておきましょう。迎えた初日から名前で呼ぶことで、{breed}との絆づくりがスムーズに始められます。'),
        (f'{breed}に合う名前の選び方のコツは？', '2音節で、はっきりした母音で終わる名前が呼びやすく、ペットも聞き取りやすいと言われています。実際に何度か呼んでみて、響きの良さを確かめてみてください。'),
        (f'{breed}に人気の名前の傾向はある？', '短くて呼びやすい名前が全般的に人気です。食べ物や自然に由来する名前も多く、その年の流行や飼い主の趣味によって選ばれる傾向があります。'),
    ]
    return generic


def _breadcrumb_json(items):
    parts = []
    for i, (name, url) in enumerate(items, start=2):
        if url:
            parts.append(f'{{"@type":"ListItem","position":{i},"name":"{name}","item":"https://sippomi.com{url}"}}')
        else:
            parts.append(f'{{"@type":"ListItem","position":{i},"name":"{name}"}}')
    return ', '.join(parts)


def _faq_json(qs):
    items = []
    for q, a in qs[:3]:
        items.append(f'{{"@type":"Question","name":"{q}","acceptedAnswer":{{"@type":"Answer","text":"{a}"}}}}')
    return f'{{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{",".join(items)}]}}'


def gen_cat_night_crying():
    """Generate the journal-cat-night-crying.html article."""
    slug = 'cat-night-crying'
    title = '猫の夜泣き対策（原因と改善方法）'
    desc = '猫の夜泣きで眠れない方へ。夜泣きの原因を種類別に解説し、効果的な対策と生活リズムの整え方を紹介します。'
    
    content = HEADER
    content += f'''  <title>{title} — シッポミ</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="https://sippomi.com/journal-cat-night-crying">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="https://sippomi.com/journal-cat-night-crying">
  <meta property="og:image" content="https://sippomi.com/ogp.webp">
  <meta property="og:site_name" content="シッポミ">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <link rel="stylesheet" href="/src/styles/global.css">
  <script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Article",
      "headline": "{title}",
      "description": "{desc}",
      "author": {{"@type":"Organization","name":"シッポミ"}},
      "publisher": {{"@type":"Organization","name":"シッポミ","logo":{{"@type":"ImageObject","url":"https://sippomi.com/sippomi-mark.svg"}}}},
      "mainEntityOfPage": "https://sippomi.com/journal-cat-night-crying",
      "datePublished": "2026-05-28",
      "dateModified": "2026-05-28",
      "inLanguage": "ja",
      "image": "https://sippomi.com/images/journal/journal-cat-night-crying.webp"
    }},
    {{
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{"@type":"ListItem","position":1,"name":"シッポミ","item":"https://sippomi.com/"}},
        {{"@type":"ListItem","position":2,"name":"お迎えガイド","item":"https://sippomi.com/welcome-prep"}},
        {{"@type":"ListItem","position":3,"name":"{title}","item":"https://sippomi.com/journal-cat-night-crying"}}
      ]
    }}
  ]
}}</script>
</head>
<body>
  <header class="page-header">
    <div class="page-header__inner">
      <a href="/" class="page-header__logo">
        <div class="page-header__logo-icon" aria-hidden="true">
          <img src="/sippomi-mark.svg" alt="" class="page-header__logo-mark" width="38" height="38" loading="lazy" decoding="async">
        </div>
        <div>
          <span class="page-header__logo-text">シッポミ</span>
          <span class="page-header__logo-sub">Sippomi</span>
        </div>
      </a>
      <nav class="page-header__nav" aria-label="サイトナビゲーション">
        <a href="/#stepSpecies" class="page-header__nav-link">名前を決める</a>
        <a href="/welcome-prep" class="page-header__nav-link">お迎えガイド</a>
        <a href="/starter-set" class="page-header__nav-link">商品</a>
        <a href="/#faqSection" class="page-header__faq-link">FAQ</a>
      </nav>
    </div>
  </header>
  <main class="page-main">
  <section class="section guide-hero">
    <nav aria-label="パンくずリスト">
      <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="/"><span itemprop="name">シッポミ</span></a>
          <meta itemprop="position" content="1">
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="/welcome-prep"><span itemprop="name">お迎えガイド</span></a>
          <meta itemprop="position" content="2">
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <span itemprop="name">猫の夜泣き対策</span>
          <meta itemprop="position" content="3">
        </li>
      </ol>
    </nav>
    <span class="journal-chip">Cat Care</span>
    <h1 class="journal-title">夜鳴く理由がわかれば、<br>対策の方向も見えてくる。</h1>
    <p class="journal-intro">{desc}</p>
  </section>
  <section class="section">
    <div class="journal-layout">
      <nav class="page-toc" aria-label="目次">
        <p class="page-toc__title">目次</p>
        <ol class="page-toc__list"></ol>
      </nav>
      <div class="journal-content">
        <article class="journal-prose">
          <h2>1. 猫が夜に鳴く理由を知る</h2>
          <p>猫が夜に鳴く理由はさまざまです。子猫の頃は寂しさや不安から鳴くことが多く、成猫になると要求やストレス、高齢猫では認知機能の低下が原因になることもあります。夜泣きを改善するには、まず「なぜ鳴いているのか」を見極めるのが第一歩です。</p>
          <p>子猫の場合、新しい環境に慣れず夜に寂しさを感じて鳴くことがよくあります。これは自然な反応で、時間とともに落ち着くことがほとんどです。成猫の場合は、遊び足りない、ご飯が欲しい、外の猫の気配に反応しているなど、明確な要求があるケースが目立ちます。</p>
          <h2>2. 生活リズムを整える</h2>
          <p>猫は薄明薄暮性の動物で、本来は明け方と夕暮れに活動的になります。しかし室内で飼われている猫は、飼い主の生活リズムに合わせやすい性質も持っています。夜泣き対策では、日中にしっかり遊んでエネルギーを消費させることが効果的です。</p>
          <p>寝る前の15〜20分、キャットダンスやレーザーポインターなどでたっぷり遊び、その後にご飯をあげると、「食べる→眠くなる」という自然なサイクルを作れます。特に子猫は遊びと休息のメリハリが大切で、夜間に騒ぐ場合は昼間の活動量が不足していることが多いです。</p>
          <div class="journal-callout">
            <p class="journal-callout__title">夜泣き対策の基本</p>
            <p>就寝前に遊ぶ、ご飯をあげる、トイレを清潔に保つ。この3つを習慣にするだけで、夜泣きが減ることが多いです。</p>
          </div>
          <h2>3. 環境を見直す</h2>
          <p>猫が夜に落ち着かない理由として、トイレの汚れや室温、外の刺激が考えられます。トイレは常に清潔に保ち、寝る前にも確認しましょう。また、夜間に窓から外の光や音が入る場合は、遮光カーテンを使うなどして刺激を減らす工夫が有効です。</p>
          <p>多頭飼いの場合は、猫同士の夜間のトラブルが原因になることもあります。それぞれの猫に休める場所を確保し、逃げられる経路を用意しておくと安心です。高齢猫の夜泣きは認知機能の低下が疑われるため、動物病院での相談をおすすめします。</p>
          <div class="journal-reference">
            <h3>参考情報</h3>
            <ul class="journal-reference-list">
              <li><a href="/journal-cat-scratching">猫の爪とぎ対策</a></li>
              <li><a href="/journal-cat-toilet-fixes">猫のトイレ失敗を減らす</a></li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
  <section class="section journal-next">
    <h2>次に読む</h2>
    <div class="journal-card-grid">
      <a href="/journal-cat-scratching" class="journal-card-link">
        <span class="journal-card-link__tag">Cat Care</span>
        <h3>猫の爪とぎ対策</h3>
        <p>夜泣きと同様、ストレスが原因になることが多い問題です。</p>
      </a>
      <a href="/journal-cat-toilet-fixes" class="journal-card-link">
        <span class="journal-card-link__tag">Cat Care</span>
        <h3>猫のトイレ失敗を減らす</h3>
        <p>環境の見直しで改善できる猫の困りごとです。</p>
      </a>
      <a href="/journal-home-safety" class="journal-card-link">
        <span class="journal-card-link__tag">Safety</span>
        <h3>猫のための部屋づくり</h3>
        <p>夜間の安全な環境を整えるヒントがあります。</p>
      </a>
    </div>
  </section>
  <section class="section faq-section" aria-labelledby="faq-heading">
    <h2 class="faq-section__title">よくある質問</h2>
    <div class="faq-list">
      <details class="faq-item" name="faq-night-cry">
        <summary class="faq-item__question">猫の夜泣きは病気が原因のこともある？</summary>
        <div class="faq-item__answer"><p>はい。特に高齢猫の場合は、認知機能の低下や甲状腺機能亢進症、高血圧などの病気が原因で夜に鳴くことがあります。今までと違う鳴き方をする、日中も元気がない、体重が減っているなどの症状がある場合は、動物病院で相談しましょう。</p></div>
      </details>
      <details class="faq-item" name="faq-night-cry">
        <summary class="faq-item__question">夜泣きする猫に構いすぎてもいい？</summary>
        <div class="faq-item__answer"><p>鳴くたびに構うと、「鳴けば構ってもらえる」と学習してしまうことがあります。構う前にまず鳴いている理由を観察し、要求鳴きの場合は無視して静かにした時に褒める方法が効果的です。ただし体調不良の可能性がある時は別です。</p></div>
      </details>
      <details class="faq-item" name="faq-night-cry">
        <summary class="faq-item__question">去勢・避妊手術で夜泣きは治る？</summary>
        <div class="faq-item__answer"><p>発情期の鳴き（特にメス猫の発情鳴き）は、避妊手術によって改善することが多いです。ただしすべての夜泣きが発情によるものとは限らないため、手術後も続く場合は別の原因を探りましょう。</p></div>
      </details>
    </div>
  </section>
  <section class="section related-articles" aria-labelledby="relatedHeading-journal-cat-night-crying">
    <h2 class="related-articles__title">あわせて読みたい</h2>
    <div class="related-articles__grid" id="relatedArticles-journal-cat-night-crying"></div>
  </section>
  </main>
  <footer class="page-footer">
    <div class="page-footer__inner">
      <a href="/" class="footer-logo"><div class="footer-logo-icon" aria-hidden="true"><img src="/sippomi-mark.svg" alt="" class="footer-logo-mark" width="32" height="32" loading="lazy" decoding="async"></div><span class="footer-logo-text">シッポミ</span></a>
      <p class="footer-note">名前が決まる、その瞬間から。シッポミは、はじめてのペット暮らしに寄り添います。</p>
      <nav class="footer-links"><a href="/welcome-prep">お迎えガイド</a><a href="/dog-names">犬の名前</a><a href="/cat-names">猫の名前</a></nav>
      <p class="footer-copy">&copy; 2026 シッポミ</p>
    </div>
  </footer>
  <script type="module" src="/src/site-visuals.js"></script>
  <script type="module" src="/src/analytics.js"></script>
  <script type="module">
  import { renderRelatedArticles } from '/src/journal-links.js';
  renderRelatedArticles('journal-cat-night-crying');
  </script>
  <script type="module" src="/src/journal-toc.js"></script>
</body>
</html>'''
    return content


# ── MAIN ──
def main():
    created = []
    link_entries = []

    # 1. Generate missing dog breed pages
    for slug, (name_jp, desc, related) in DOG_BREEDS.items():
        filename = f'dog-names-{slug}.html'
        filepath = os.path.join(ROOT, filename)
        if os.path.exists(filepath):
            continue
        content = gen_breed_page(
            filename=filename,
            breed_name_jp=name_jp,
            description=desc,
            slug=f'dog-breed-{slug}',
            related_slugs=related,
            parent_slug='dog-names',
            parent_name='犬の名前',
            parent_title='犬の名前を探す'
        )
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        created.append(filename)
        link_entries.append(f"  'dog-breed-{slug}': {{\n    title: '{name_jp}の名前',\n    description: '{desc}',\n    tag: 'Dog Breed',\n    slug: 'dog-breed-{slug}',\n    related: {related}\n  }}")

    # 2. Generate cat breed pages
    for slug, (name_jp, desc, related) in CAT_BREEDS.items():
        filename = f'cat-names-{slug}.html'
        filepath = os.path.join(ROOT, filename)
        if os.path.exists(filepath):
            continue
        content = gen_breed_page(
            filename=filename,
            breed_name_jp=name_jp,
            description=desc,
            slug=f'cat-breed-{slug}',
            related_slugs=related,
            parent_slug='cat-names',
            parent_name='猫の名前',
            parent_title='猫の名前を探す'
        )
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        created.append(filename)
        link_entries.append(f"  'cat-breed-{slug}': {{\n    title: '{name_jp}の名前',\n    description: '{desc}',\n    tag: 'Cat Breed',\n    slug: 'cat-breed-{slug}',\n    related: {related}\n  }}")

    # 3. Generate small animal pages
    for slug, (name_jp, desc, related) in SMALL_ANIMALS.items():
        filename = f'{slug}-names.html'
        filepath = os.path.join(ROOT, filename)
        if os.path.exists(filepath):
            continue
        content = gen_breed_page(
            filename=filename,
            breed_name_jp=name_jp,
            description=desc,
            slug=f'small-{slug}',
            related_slugs=related,
            parent_slug='rabbit-names',
            parent_name='その他のペットの名前',
            parent_title='うさぎの名前を探す'
        )
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        created.append(filename)
        link_entries.append(f"  'small-{slug}': {{\n    title: '{name_jp}の名前',\n    description: '{desc}',\n    tag: 'Small Pet',\n    slug: 'small-{slug}',\n    related: {related}\n  }}")

    # 4. Generate journal-cat-night-crying.html
    night_file = os.path.join(ROOT, 'journal-cat-night-crying.html')
    if not os.path.exists(night_file):
        content = gen_cat_night_crying()
        with open(night_file, 'w', encoding='utf-8') as f:
            f.write(content)
        created.append('journal-cat-night-crying.html')

    print(f"Created {len(created)} new files:")
    for f in created:
        print(f"  ✅ {f}")
    print()
    print(f"Total created: {len(created)}")
    
    if link_entries:
        print()
        print("=== Add these entries to journal-links.js (before the closing `};`) ===")
        for entry in link_entries:
            print(',')
            print(entry)


if __name__ == '__main__':
    main()
