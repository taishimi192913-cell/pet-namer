const RAKUTEN_SETS = {
  starterSet: {
    eyebrow: 'Rakuten guide',
    title: '最初の30日に必要なものを、カテゴリ別に探す',
    lead: '買いすぎを防ぐため、最初に使う頻度が高いものから順番に並べています。',
    items: [
      { label: 'キャリー・クレート', keyword: 'ペット キャリー 犬 猫', reason: '通院・帰宅初日・避難で共通して使う土台' },
      { label: 'トイレ用品', keyword: '猫 トイレ 犬 トイレトレー', reason: '初日から必要になり、失敗の予防にもつながる' },
      { label: '食器・給水器', keyword: 'ペット 食器 給水器 犬 猫', reason: '毎日洗いやすく、倒れにくいものを選びたい' },
      { label: 'ベッド・サークル', keyword: 'ペット ベッド サークル 犬 猫', reason: '落ち着ける小さな居場所を先に用意する' },
    ],
  },
  firstShopping: {
    eyebrow: 'Rakuten picks',
    title: '最初の買い物で比較したいカテゴリ',
    lead: '商品名ではなく、最初の1週間に必要になる役割から探せるようにしています。',
    items: [
      { label: 'キャリーケース', keyword: 'ペット キャリー 犬 猫', reason: 'お迎え当日・通院・避難で使う優先度の高い道具' },
      { label: '食器と給水器', keyword: 'ペット 食器 給水器', reason: '毎日使うので洗いやすさと安定感を確認' },
      { label: 'トイレ用品', keyword: '犬 トイレトレー 猫 トイレ', reason: '犬猫で必要な形が違うため、種類別に比較' },
    ],
  },
  catToilet: {
    eyebrow: 'Rakuten picks',
    title: '猫トイレの見直しで比較したいカテゴリ',
    lead: '場所・砂・本体を切り分けた後に、必要なものだけを確認できます。',
    items: [
      { label: '猫トイレ本体', keyword: '猫 トイレ 本体', reason: '入口の高さ、深さ、フード有無を比較' },
      { label: '猫砂', keyword: '猫砂 飛び散りにくい 消臭', reason: '感触と消臭力の両方を確認' },
      { label: 'トイレマット・消臭', keyword: '猫 トイレ マット 消臭', reason: '掃除の続けやすさを整える' },
    ],
  },
  fastEating: {
    eyebrow: 'Rakuten picks',
    title: '早食い対策で比較したいカテゴリ',
    lead: '受診が必要なサインがない場合に、食べ方を穏やかにする選択肢です。',
    items: [
      { label: '早食い防止ボウル', keyword: '犬 猫 早食い防止 ボウル', reason: '一口量を自然に減らしやすい' },
      { label: 'ノーズワークマット', keyword: '犬 ノーズワークマット 早食い', reason: '退屈対策と食事ペース調整を兼ねる' },
      { label: '知育フィーダー', keyword: 'ペット 知育 フィーダー', reason: '少量ずつ考えながら食べる形に変える' },
    ],
  },
  homeSafety: {
    eyebrow: 'Rakuten picks',
    title: '部屋づくりと安全対策で比較したいカテゴリ',
    lead: '玄関・窓・コードまわりなど、事故につながりやすい場所から整えます。',
    items: [
      { label: 'ペットゲート', keyword: 'ペットゲート 犬 猫 玄関', reason: '飛び出しや入ってほしくない場所を防ぐ' },
      { label: '窓・網戸ストッパー', keyword: '猫 脱走防止 窓 ストッパー', reason: '猫の窓・ベランダ対策に使いやすい' },
      { label: 'コードカバー', keyword: 'ペット コードカバー 噛み 防止', reason: '感電や誤飲につながる場所を先に守る' },
    ],
  },
  bousai: {
    eyebrow: 'Rakuten picks',
    title: 'ペット防災で比較したいカテゴリ',
    lead: '災害時だけでなく、通院・移動・留守番でも使えるものを優先します。',
    items: [
      { label: 'ペット防災セット', keyword: 'ペット 防災セット 犬 猫', reason: '最低限の備えをまとめて確認' },
      { label: '折りたたみ食器', keyword: 'ペット 折りたたみ 食器 防災', reason: '避難先や移動中の食事・水分補給に使える' },
      { label: '防臭袋・トイレ用品', keyword: 'ペット 防臭袋 トイレ 防災', reason: '避難時のにおいと衛生管理を支える' },
    ],
  },
};

function buildRakutenSearchUrl(keyword) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
}

function isAllowedRakutenUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (
      host === 'rakuten.co.jp' ||
      host.endsWith('.rakuten.co.jp') ||
      host === 'a.r10.to'
    );
  } catch {
    return false;
  }
}

function getAllowedRakutenDirectUrl(item) {
  return [item.url, item.href].find((candidate) => (
    typeof candidate === 'string' && isAllowedRakutenUrl(candidate)
  ));
}

export function resolveRakutenItemHref(item) {
  const directUrl = getAllowedRakutenDirectUrl(item);

  if (directUrl) {
    return directUrl;
  }

  return buildRakutenSearchUrl(item.keyword);
}

function getRakutenUrlType(item) {
  return getAllowedRakutenDirectUrl(item)
    ? 'issued'
    : 'search_fallback';
}

function trackAffiliateClick(setName, item) {
  window.gtag?.('event', 'click_rakuten_affiliate', {
    event_category: 'affiliate',
    affiliate_provider: 'rakuten',
    affiliate_set: setName,
    affiliate_label: item.label,
    search_keyword: item.keyword,
    affiliate_url_type: getRakutenUrlType(item),
  });
}

function createAffiliateCard(setName, item) {
  const card = document.createElement('article');
  card.className = 'affiliate-card';

  const heading = document.createElement('h3');
  heading.className = 'affiliate-card__title';
  heading.textContent = item.label;

  const reason = document.createElement('p');
  reason.className = 'affiliate-card__reason';
  reason.textContent = item.reason;

  const link = document.createElement('a');
  link.className = 'affiliate-card__link';
  link.href = resolveRakutenItemHref(item);
  link.target = '_blank';
  link.rel = 'sponsored nofollow noopener';
  link.dataset.affiliateProvider = 'rakuten';
  link.dataset.affiliateSet = setName;
  link.dataset.affiliateLabel = item.label;
  link.textContent = '楽天市場で探す';
  link.addEventListener('click', () => trackAffiliateClick(setName, item));

  card.append(heading, reason, link);
  return card;
}

function renderAffiliatePanel(target) {
  const setName = target.dataset.affiliateSet;
  const set = RAKUTEN_SETS[setName];
  if (!set) return;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'affiliate-panel__eyebrow';
  eyebrow.textContent = set.eyebrow;

  const title = document.createElement('h2');
  title.className = 'affiliate-panel__title';
  title.textContent = target.dataset.affiliateTitle || set.title;

  const lead = document.createElement('p');
  lead.className = 'affiliate-panel__lead';
  lead.textContent = target.dataset.affiliateLead || set.lead;

  const grid = document.createElement('div');
  grid.className = 'affiliate-panel__grid';
  set.items.forEach((item) => grid.appendChild(createAffiliateCard(setName, item)));

  const note = document.createElement('p');
  note.className = 'affiliate-panel__note';
  note.textContent = '楽天市場の商品検索へ移動します。発行済みの楽天アフィリエイトURLがあるカテゴリは、この導線に差し替えて運用します。';

  target.classList.add('affiliate-panel--rendered');
  target.replaceChildren(eyebrow, title, lead, grid, note);
}

export function initAffiliatePanels() {
  document.querySelectorAll('[data-affiliate-set]').forEach(renderAffiliatePanel);
}
