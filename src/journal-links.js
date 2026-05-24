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
  }
};

function getRelatedArticles(slug) {
  const entry = journalLinks[slug];
  if (!entry) return [];

  return entry.related
    .map(relatedSlug => journalLinks[relatedSlug])
    .filter(Boolean);
}

function renderRelatedArticles(slug) {
  const container = document.getElementById(`relatedArticles-${slug}`);
  if (!container) return;

  const articles = getRelatedArticles(slug);
  if (articles.length === 0) return;

  container.innerHTML = articles.map(article => `
    <a href="/${article.slug}" class="related-articles__card">
      <span class="related-articles__card-tag">${article.tag}</span>
      <h3 class="related-articles__card-title">${article.title}</h3>
      <p class="related-articles__card-desc">${article.description}</p>
    </a>
  `).join('');
}

export { journalLinks, getRelatedArticles, renderRelatedArticles };
