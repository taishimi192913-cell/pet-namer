const journalLinks = {
  'journal-first-days': {
    title: '子犬・子猫を迎えた初日から3日でやること',
    description: 'お迎え初日から3日間でやること。構いすぎないことの大切さ、家族との対面の仕方、体調観察の3つのポイント。',
    tag: 'First 72h',
    slug: 'journal-first-days',
    related: ['journal-home-safety', 'journal-first-shopping', 'journal-first-pet-checklist', 'journal-pet-vaccine-schedule', 'journal-dog-alone-training']
  },
  'journal-cat-cage-necessary': {
    title: '子猫にケージは必要？',
    description: '子猫にケージが必要か迷う人向けに、最初の1か月で役立つ場面、なくてもよいケース、置き方の考え方。',
    tag: 'Cat Setup',
    slug: 'journal-cat-cage-necessary',
    related: ['journal-cat-toilet-fixes', 'journal-pet-vaccine-schedule', 'journal-first-pet-checklist', 'journal-home-safety', 'journal-first-shopping']
  },
  'journal-cat-toilet-fixes': {
    title: '子猫・猫のトイレ失敗を減らすには？',
    description: '猫トイレの失敗、砂の飛び散り、におい問題を解説。置き場所、砂、本体の順に見直す方法。',
    tag: 'Cat Care',
    slug: 'journal-cat-toilet-fixes',
    related: ['journal-cat-cage-necessary', 'journal-first-shopping', 'journal-home-safety', 'journal-first-summer', 'journal-pet-fast-eating']
  },
  'journal-dog-alone-training': {
    title: '子犬の留守番はいつから？',
    description: '子犬を迎えて1か月ごろに悩みやすい夜泣き、留守番、見守りの考え方。長時間に慣れさせる前に整える環境。',
    tag: 'Routine',
    slug: 'journal-dog-alone-training',
    related: ['journal-first-days', 'journal-first-summer', 'journal-dog-walk-when', 'journal-home-safety', 'journal-first-shopping']
  },
  'journal-dog-walk-when': {
    title: '子犬の散歩はいつから？',
    description: 'ワクチン後の散歩デビュー、社会化の考え方、最初の外出で気をつけたいポイント。',
    tag: 'Dog Walk',
    slug: 'journal-dog-walk-when',
    related: ['journal-dog-alone-training', 'journal-first-summer', 'journal-pet-vaccine-schedule', 'journal-first-days', 'journal-home-safety']
  },
  'journal-first-pet-checklist': {
    title: '子犬・子猫のお迎え準備チェックリスト',
    description: 'お迎え1週間前、前日、初日、最初の1週間でやることを、犬と猫の違いも含めて整理。',
    tag: 'Checklist',
    slug: 'journal-first-pet-checklist',
    related: ['journal-first-pet-cost', 'journal-first-days', 'journal-home-safety', 'journal-first-shopping', 'journal-pet-vaccine-schedule']
  },
  'journal-first-pet-cost': {
    title: '初めて犬・猫を飼う費用はいくら？',
    description: '初期費用、毎月かかりやすいお金、病院代の考え方を最初の1年を見通しやすい形で整理。',
    tag: 'Budget',
    slug: 'journal-first-pet-cost',
    related: ['journal-first-shopping', 'journal-first-pet-checklist', 'journal-first-days', 'journal-pet-vaccine-schedule', 'journal-home-safety']
  },
  'journal-first-shopping': {
    title: '犬・猫のお迎えで最初に買うもの一覧',
    description: '初めて犬・猫を迎える方向け。最初に必要なもの・後回しにできるものを優先順位付きで解説。',
    tag: 'Shopping',
    slug: 'journal-first-shopping',
    related: ['journal-first-days', 'journal-first-pet-checklist', 'journal-first-pet-cost', 'journal-home-safety', 'journal-cat-cage-necessary']
  },
  'journal-first-summer': {
    title: '犬・猫の初めての夏対策',
    description: '室温管理、留守番、散歩、車移動の暑さ対策。冷感マットやネッククーラーなど必要な対策カテゴリ。',
    tag: 'Summer',
    slug: 'journal-first-summer',
    related: ['journal-dog-alone-training', 'journal-pet-bousai', 'journal-first-shopping', 'journal-home-safety', 'journal-kanto-pet-outings']
  },
  'journal-home-safety': {
    title: '猫の脱走防止・犬の安全対策',
    description: '猫の脱走防止・犬の安全対策・室内の危険物チェック。お迎え前に整えておくべき部屋づくりのポイント。',
    tag: 'Safety',
    slug: 'journal-home-safety',
    related: ['journal-first-shopping', 'journal-first-days', 'journal-first-pet-checklist', 'journal-cat-cage-necessary', 'journal-pet-bousai']
  },
  'journal-kanto-pet-outings': {
    title: '関東でペットと楽しめる観光地12選',
    description: '関東圏でペットと楽しめるおすすめ観光地。犬連れ・ペット連れで行きやすい公園、牧場、街歩き。',
    tag: 'Outing',
    slug: 'journal-kanto-pet-outings',
    related: ['journal-first-summer', 'journal-pet-bousai', 'journal-first-shopping', 'journal-dog-walk-when', 'journal-first-days']
  },
  'journal-pet-bousai': {
    title: '犬・猫の防災準備ガイド',
    description: '同行避難の前に家で決めておくこと。持ち出し袋だけでなく普段の暮らしから考える防災。',
    tag: 'Emergency',
    slug: 'journal-pet-bousai',
    related: ['journal-first-summer', 'journal-first-shopping', 'journal-home-safety', 'journal-first-days', 'journal-kanto-pet-outings']
  },
  'journal-pet-fast-eating': {
    title: '犬・猫の早食い防止',
    description: '吐き戻し・がっつき食いを減らす工夫。受診の目安と家でできる早食い防止策。',
    tag: 'Care',
    slug: 'journal-pet-fast-eating',
    related: ['journal-first-shopping', 'journal-cat-toilet-fixes', 'journal-dog-alone-training', 'journal-first-pet-checklist', 'journal-home-safety']
  },
  'journal-pet-vaccine-schedule': {
    title: '子犬・子猫のワクチンはいつ？',
    description: '最初の1年の通院スケジュール。犬と猫で違うポイントや、病院で確認したいこと。',
    tag: 'Vet Care',
    slug: 'journal-pet-vaccine-schedule',
    related: ['journal-dog-walk-when', 'journal-cat-cage-necessary', 'journal-first-pet-checklist', 'journal-first-days', 'journal-first-pet-cost']
  },
  'guide-first': {
    title: 'はじめてのペットお迎えガイド',
    description: 'はじめて犬や猫を迎える方向け。お迎え前から1年までの準備と暮らしのコツ。',
    tag: 'Guide',
    slug: 'guide-first',
    related: ['journal-first-pet-checklist', 'journal-first-days', 'journal-first-shopping', 'journal-first-pet-cost', 'journal-pet-vaccine-schedule']
  },
  'guide-dog': {
    title: '犬の飼い方ガイド',
    description: '子犬のお迎えからしつけ・健康まで。犬との暮らしに必要な情報をカテゴリ別にまとめました。',
    tag: 'Guide',
    slug: 'guide-dog',
    related: ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-first-summer', 'journal-pet-bousai', 'journal-first-days']
  },
  'guide-cat': {
    title: '猫の飼い方ガイド',
    description: '子猫のお迎えからトイレ・健康まで。猫との暮らしに必要な情報をカテゴリ別にまとめました。',
    tag: 'Guide',
    slug: 'guide-cat',
    related: ['journal-cat-cage-necessary', 'journal-cat-toilet-fixes', 'journal-home-safety', 'journal-first-summer', 'journal-pet-vaccine-schedule']
  },
  'journal-dog-heartworm': {
    title: '犬のフィラリア予防完全ガイド',
    description: '予防薬の種類や投与時期、感染した場合の症状・治療法をわかりやすく解説。予防しないリスクと獣医師の見解も紹介します。',
    tag: 'Vet Care',
    slug: 'journal-dog-heartworm',
    related: ['journal-pet-vaccine-schedule', 'journal-first-summer', 'journal-first-pet-cost', 'journal-dog-walk-when', 'journal-pet-fast-eating']
  },
  'journal-pet-insurance': {
    title: 'ペット保険の選び方比較ガイド',
    description: '犬・猫向けペット保険の比較ガイド。補償タイプ別の特徴、月額保険料の目安、動物病院での使い方、契約前に確認したいポイントを解説します。',
    tag: 'Budget',
    slug: 'journal-pet-insurance',
    related: ['journal-first-pet-cost', 'journal-pet-vaccine-schedule', 'journal-first-pet-checklist', 'journal-first-shopping', 'journal-first-days']
  },
  'journal-puppy-toilet-training': {
    title: '子犬のトイレトレーニング完全ガイド',
    description: '子犬のトイレトレーニングを成功させるためのステップを解説。サークルを使った方法、失敗した時の対処、褒めるタイミングなど初心者でも迷わないポイントをまとめました。',
    tag: 'Training',
    slug: 'journal-puppy-toilet-training',
    related: ['journal-first-days', 'journal-dog-alone-training', 'journal-cat-toilet-fixes', 'journal-first-pet-checklist', 'journal-home-safety']
  },
  'journal-dog-barking': {
    title: '犬の無駄吠え対策',
    description: '犬の無駄吠えの原因を種類別に解説。要求吠え・警戒吠え・分離不安など、原因に合わせたしつけ方と日常で使える対策をまとめました。',
    tag: 'Training',
    slug: 'journal-dog-barking',
    related: ['journal-dog-alone-training', 'journal-dog-walk-when', 'journal-first-days', 'journal-home-safety', 'journal-first-pet-checklist']
  },
  'journal-pet-heatstroke': {
    title: 'ペットの熱中症対策',
    description: '犬や猫の熱中症の初期症状、予防方法、そして万が一のときの応急処置手順をまとめました。夏場の温度管理や散歩の注意点も解説します。',
    tag: 'Health',
    slug: 'journal-pet-heatstroke',
    related: ['journal-first-summer', 'journal-pet-bousai', 'journal-dog-walk-when', 'journal-first-pet-cost', 'journal-pet-vaccine-schedule']
  },
  'journal-cat-scratching': {
    title: '猫の爪とぎ対策',
    description: '猫の爪とぎによる家具の被害を防ぎながら、猫のストレスを減らす方法を解説。爪とぎの心理、効果的な爪とぎの選び方・置き方まで。',
    tag: 'Cat Care',
    slug: 'journal-cat-scratching',
    related: ['journal-cat-toilet-fixes', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping', 'journal-pet-fast-eating']
  },
  'journal-dog-biting': {
    title: '犬の噛み癖直し方',
    description: '子犬の甘噛みから成犬の本気噛みまで、原因別のしつけ方と対処法を解説。噛む理由を理解して適切に治すステップを紹介。',
    tag: 'Training',
    slug: 'journal-dog-biting',
    related: ['journal-dog-alone-training', 'journal-dog-barking', 'journal-dog-walk-when', 'journal-first-days', 'journal-puppy-toilet-training']
  },
  'journal-pet-neuter': {
    title: 'ペットの避妊去勢手術',
    description: '犬・猫の避妊去勢手術の適切な時期、費用の目安、手術のメリット・デメリットを解説。手術後のケアや注意点もまとめました。',
    tag: 'Vet Care',
    slug: 'journal-pet-neuter',
    related: ['journal-pet-vaccine-schedule', 'journal-first-pet-cost', 'journal-first-pet-checklist', 'journal-pet-insurance', 'journal-first-days']
  },
  'dog-breed-labrador-retriever': {
    title: 'ラブラドール・レトリーバーの名前',
    description: 'ラブラドール・レトリーバーにぴったりの名前を10選紹介。人気の名前から、性格や見た目に合わせた名前まで。',
    tag: 'Dog Breed',
    slug: 'dog-breed-labrador-retriever',
    related: ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-dog-barking']
  },
  'dog-breed-shih-tzu': {
    title: 'シーズーの名前',
    description: 'シーズーにぴったりの名前を10選紹介。愛らしい見た目に合った名前や人気の名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-shih-tzu',
    related: ['journal-dog-alone-training', 'journal-dog-barking', 'journal-first-pet-checklist', 'journal-first-shopping', 'journal-pet-fast-eating']
  },
  'dog-breed-cavalier': {
    title: 'キャバリアの名前',
    description: 'キャバリア・キング・チャールズ・スパニエルにぴったりの名前を10選。優しい性格に合う名前や人気ランキング。',
    tag: 'Dog Breed',
    slug: 'dog-breed-cavalier',
    related: ['journal-first-days', 'journal-first-pet-checklist', 'journal-dog-walk-when', 'journal-home-safety', 'journal-first-summer']
  },
  'dog-breed-maltese': {
    title: 'マルチーズの名前',
    description: '白くてふわふわしたマルチーズにぴったりの名前を10選。優しい響きの名前や人気の名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-maltese',
    related: ['journal-dog-alone-training', 'journal-dog-barking', 'journal-first-shopping', 'journal-home-safety', 'journal-first-summer']
  },
  'dog-breed-bichon-frise': {
    title: 'ビションフリーゼの名前',
    description: '明るく活発なビションフリーゼにぴったりの名前を10選紹介。ふわふわの白い毛に合う名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-bichon-frise',
    related: ['journal-dog-walk-when', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-fast-eating', 'journal-first-summer']
  },
  'dog-breed-pomeranian': {
    title: 'ポメラニアンの名前',
    description: '小さくてふわふわしたポメラニアンにぴったりの名前を10選。可愛らしい響きの名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-pomeranian',
    related: ['journal-dog-alone-training', 'journal-dog-barking', 'journal-first-pet-checklist', 'journal-first-shopping', 'journal-dog-biting']
  },
  'dog-breed-mini-dachshund': {
    title: 'ミニチュアダックスフンドの名前',
    description: '胴長の愛らしいミニチュアダックスフンドにぴったりの名前を10選。人気ランキングも紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-mini-dachshund',
    related: ['journal-dog-walk-when', 'journal-dog-barking', 'journal-dog-biting', 'journal-first-days', 'journal-first-summer']
  },
  'dog-breed-yorkshire-terrier': {
    title: 'ヨークシャーテリアの名前',
    description: '小さくて華やかなヨークシャーテリアにぴったりの名前を10選。気品のある名前や可愛い名前を紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-yorkshire-terrier',
    related: ['journal-dog-alone-training', 'journal-puppy-toilet-training', 'journal-first-pet-checklist', 'journal-home-safety', 'journal-pet-fast-eating']
  },
  'dog-breed-papillon': {
    title: 'パピヨンの名前',
    description: '蝶のような耳が特徴のパピヨンにぴったりの名前を10選。賢くて活発な性格に合う名前を紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-papillon',
    related: ['journal-dog-walk-when', 'journal-dog-barking', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-heatstroke']
  },
  'dog-breed-shetland-sheepdog': {
    title: 'シェットランド・シープドッグの名前',
    description: '賢くて美しいシェルティにぴったりの名前を10選。凛々しい響きの名前や人気の名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-shetland-sheepdog',
    related: ['journal-dog-alone-training', 'journal-dog-walk-when', 'journal-first-summer', 'journal-home-safety', 'journal-pet-vaccine-schedule']
  },
  'dog-breed-pug': {
    title: 'パグの名前',
    description: '愛嬌のある顔と性格が魅力のパグにぴったりの名前を10選。丸くて可愛い名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-pug',
    related: ['journal-pet-heatstroke', 'journal-first-summer', 'journal-dog-barking', 'journal-pet-fast-eating', 'journal-first-days']
  },
  'dog-breed-french-bulldog': {
    title: 'フレンチブルドッグの名前',
    description: '個性的な見た目と穏やかな性格のフレブルにぴったりの名前を10選。おしゃれな名前を紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-french-bulldog',
    related: ['journal-dog-barking', 'journal-dog-biting', 'journal-pet-heatstroke', 'journal-first-summer', 'journal-puppy-toilet-training']
  },
  'dog-breed-border-collie': {
    title: 'ボーダーコリーの名前',
    description: '賢くて活発なボーダーコリーにぴったりの名前を10選。かっこいい名前や人気ランキングを紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-border-collie',
    related: ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-first-days', 'journal-pet-insurance', 'journal-dog-heartworm']
  },
  'dog-breed-welsh-corgi': {
    title: 'ウェルシュ・コーギーの名前',
    description: '短い足と大きな耳が可愛いコーギーにぴったりの名前を10選。親しみやすい名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-welsh-corgi',
    related: ['journal-dog-walk-when', 'journal-dog-barking', 'journal-first-days', 'journal-puppy-toilet-training', 'journal-pet-fast-eating']
  },
  'dog-breed-golden-retriever': {
    title: 'ゴールデン・レトリーバーの名前',
    description: '明るくて人懐っこいゴールデン・レトリーバーにぴったりの名前を10選。人気ランキングも紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-golden-retriever',
    related: ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-dog-biting', 'journal-puppy-toilet-training', 'journal-first-summer']
  },
  'dog-breed-beagle': {
    title: 'ビーグルの名前',
    description: '明るくて好奇心旺盛なビーグルにぴったりの名前を10選。元気いっぱいの名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-beagle',
    related: ['journal-dog-walk-when', 'journal-dog-alone-training', 'journal-dog-barking', 'journal-first-days', 'journal-pet-heatstroke']
  },
  'dog-breed-miniature-schnauzer': {
    title: 'ミニチュアシュナウザーの名前',
    description: 'ひげと眉毛が特徴的なミニチュアシュナウザーにぴったりの名前を10選。個性的な名前を紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-miniature-schnauzer',
    related: ['journal-dog-barking', 'journal-dog-alone-training', 'journal-puppy-toilet-training', 'journal-first-pet-checklist', 'journal-home-safety']
  },
  'dog-breed-doberman': {
    title: 'ドーベルマンの名前',
    description: 'かっこよくて賢いドーベルマンにぴったりの名前を10選。凛々しい響きの名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-doberman',
    related: ['journal-dog-walk-when', 'journal-dog-biting', 'journal-dog-heartworm', 'journal-pet-insurance', 'journal-pet-neuter']
  },
  'dog-breed-rottweiler': {
    title: 'ロットワイラーの名前',
    description: 'たくましい見た目と忠実な性格のロットワイラーにぴったりの名前を10選。力強い名前を集めました。',
    tag: 'Dog Breed',
    slug: 'dog-breed-rottweiler',
    related: ['journal-dog-biting', 'journal-dog-walk-when', 'journal-pet-neuter', 'journal-pet-insurance', 'journal-first-days']
  },
  'dog-breed-great-pyrenees': {
    title: 'グレート・ピレニーズの名前',
    description: '大きくて優しいグレート・ピレニーズにぴったりの名前を10選。清らかな響きの名前を紹介。',
    tag: 'Dog Breed',
    slug: 'dog-breed-great-pyrenees',
    related: ['journal-pet-heatstroke', 'journal-first-summer', 'journal-dog-walk-when', 'journal-home-safety', 'journal-pet-bousai']
  },
  'cat-breed-mix': {
    title: '雑種（ミックス）の名前',
    description: '個性豊かな雑種・ミックス猫にぴったりの名前を10選。ユニークで可愛い名前を集めました。',
    tag: 'Cat Breed',
    slug: 'cat-breed-mix',
    related: ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping']
  },
  'cat-breed-siamese': {
    title: 'シャム猫の名前',
    description: 'エレガントな見た目とおしゃべりな性格のシャム猫にぴったりの名前を10選。',
    tag: 'Cat Breed',
    slug: 'cat-breed-siamese',
    related: ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-home-safety', 'journal-first-summer', 'journal-cat-cage-necessary']
  },
  'cat-breed-abyssinian': {
    title: 'アビシニアンの名前',
    description: '活発で知的なアビシニアンにぴったりの名前を10選。野性的でかっこいい名前を紹介。',
    tag: 'Cat Breed',
    slug: 'cat-breed-abyssinian',
    related: ['journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping', 'journal-pet-fast-eating']
  },
  'cat-breed-exotic-shorthair': {
    title: 'エキゾチックショートヘアの名前',
    description: 'ペルシャに似た愛らしい顔立ちのエキゾチックショートヘアにぴったりの名前を10選。',
    tag: 'Cat Breed',
    slug: 'cat-breed-exotic-shorthair',
    related: ['journal-cat-toilet-fixes', 'journal-cat-cage-necessary', 'journal-first-shopping', 'journal-pet-fast-eating', 'journal-first-summer']
  },
  'cat-breed-ragdoll': {
    title: 'ラグドールの名前',
    description: '抱っこが好きな穏やかなラグドールにぴったりの名前を10選。優しい響きの名前を紹介。',
    tag: 'Cat Breed',
    slug: 'cat-breed-ragdoll',
    related: ['journal-cat-cage-necessary', 'journal-cat-scratching', 'journal-home-safety', 'journal-first-days', 'journal-pet-vaccine-schedule']
  },
  'cat-breed-persian': {
    title: 'ペルシャ猫の名前',
    description: '長く美しい被毛と優雅な雰囲気のペルシャ猫にぴったりの名前を10選。',
    tag: 'Cat Breed',
    slug: 'cat-breed-persian',
    related: ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-home-safety', 'journal-pet-fast-eating', 'journal-first-shopping']
  },
  'cat-breed-maine-coon': {
    title: 'メインクーンの名前',
    description: '大きな体と優しい性格のメインクーンにぴったりの名前を10選。風格のある名前を紹介。',
    tag: 'Cat Breed',
    slug: 'cat-breed-maine-coon',
    related: ['journal-cat-cage-necessary', 'journal-cat-scratching', 'journal-home-safety', 'journal-first-summer', 'journal-pet-vaccine-schedule']
  },
  'cat-breed-sphynx': {
    title: 'スフィンクスの名前',
    description: '個性的な見た目と愛情深いスフィンクスにぴったりの名前を10選。ユニークな名前を集めました。',
    tag: 'Cat Breed',
    slug: 'cat-breed-sphynx',
    related: ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-pet-heatstroke', 'journal-first-summer', 'journal-pet-fast-eating']
  },
  'cat-breed-russian-blue': {
    title: 'ロシアンブルーの名前',
    description: '神秘的なグレーの被毛と控えめな性格のロシアンブルーにぴったりの名前を10選。',
    tag: 'Cat Breed',
    slug: 'cat-breed-russian-blue',
    related: ['journal-cat-toilet-fixes', 'journal-cat-cage-necessary', 'journal-home-safety', 'journal-first-shopping', 'journal-cat-scratching']
  },
  'cat-breed-american-shorthair': {
    title: 'アメリカンショートヘアの名前',
    description: '丈夫でバランスの取れた体型のアメリカンショートヘアにぴったりの名前を10選。',
    tag: 'Cat Breed',
    slug: 'cat-breed-american-shorthair',
    related: ['journal-cat-toilet-fixes', 'journal-cat-scratching', 'journal-cat-cage-necessary', 'journal-pet-fast-eating', 'journal-first-summer']
  },
  'small-hamster': {
    title: 'ハムスターの名前',
    description: '小さくて愛らしいハムスターにぴったりの名前を10選。食べ物由来の可愛い名前を集めました。',
    tag: 'Small Pet',
    slug: 'small-hamster',
    related: ['journal-home-safety', 'journal-first-shopping', 'journal-first-pet-checklist', 'journal-pet-bousai', 'journal-pet-fast-eating']
  },
  'small-ferret': {
    title: 'フェレットの名前',
    description: 'いたずら好きで愛嬌のあるフェレットにぴったりの名前を10選。ユニークで可愛い名前を紹介。',
    tag: 'Small Pet',
    slug: 'small-ferret',
    related: ['journal-home-safety', 'journal-first-shopping', 'journal-pet-fast-eating', 'journal-first-summer', 'journal-pet-bousai']
  },
  'small-bird': {
    title: '鳥の名前',
    description: '色鮮やかな羽やおしゃべりな性格の鳥にぴったりの名前を10選。ユニークな名前を集めました。',
    tag: 'Small Pet',
    slug: 'small-bird',
    related: ['journal-home-safety', 'journal-first-shopping', 'journal-first-summer', 'journal-pet-bousai', 'journal-pet-fast-eating']
  },
  'small-reptile': {
    title: '爬虫類の名前',
    description: '爬虫類にぴったりの名前を10選。かっこいい見た目に合う名前やユニークな名前を紹介。',
    tag: 'Small Pet',
    slug: 'small-reptile',
    related: ['journal-home-safety', 'journal-first-shopping', 'journal-pet-bousai', 'journal-pet-heatstroke', 'journal-first-summer']
  },
  'journal-cat-night-crying': {
    title: '猫の夜泣き対策',
    description: '猫の夜泣きで眠れない方へ。夜泣きの原因を種類別に解説し、効果的な対策と生活リズムの整え方を紹介します。',
    tag: 'Cat Care',
    slug: 'journal-cat-night-crying',
    related: ['journal-cat-scratching', 'journal-cat-toilet-fixes', 'journal-home-safety', 'journal-cat-cage-necessary', 'journal-first-summer']
  }
};

function getRelatedArticles(slug) {
  const entry = journalLinks[slug];
  if (!entry) return [];

  return entry.related
    .map(relatedSlug => journalLinks[relatedSlug])
    .filter(Boolean);
}

const DIAGNOSIS_CTA = {
  title: '名前を決めてみませんか？',
  description: 'シッポミの無料診断で、あなたのペットにぴったりの名前を探せます。',
  tag: 'Diagnosis',
  slug: 'index.html#stepSpecies',
  href: '/#stepSpecies',
};

function renderRelatedArticles(slug) {
  const container = document.getElementById(`relatedArticles-${slug}`);
  if (!container) return;

  const articles = getRelatedArticles(slug);
  if (articles.length === 0) return;

  // 関連記事5件 + CTAカード
  const cards = articles.map(article => `
    <a href="/${article.slug}" class="related-articles__card">
      <span class="related-articles__card-tag">${article.tag}</span>
      <h3 class="related-articles__card-title">${article.title}</h3>
      <p class="related-articles__card-desc">${article.description}</p>
    </a>
  `).join('');

  const ctaCard = `
    <a href="${DIAGNOSIS_CTA.href}" class="related-articles__card related-articles__card--cta">
      <span class="related-articles__card-tag">${DIAGNOSIS_CTA.tag}</span>
      <h3 class="related-articles__card-title">${DIAGNOSIS_CTA.title}</h3>
      <p class="related-articles__card-desc">${DIAGNOSIS_CTA.description}</p>
    </a>
  `;

  container.innerHTML = cards + ctaCard;
}

export { journalLinks, getRelatedArticles, renderRelatedArticles };
