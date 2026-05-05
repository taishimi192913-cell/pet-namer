import { copyNameToClipboard, getLINEShareURL, getXShareURL } from './share.js';
import { secondaryReadingIfAny } from './reading-display.js';
import { OVERFLOW_LIST_PAGE_SIZE, WORDCLOUD_MAP_MAX } from './constants.js';

function createFavoriteButton(item, options = {}, variant = 'card') {
  if (typeof options.onToggleFavorite !== 'function') return null;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = variant === 'spotlight'
    ? 'share-btn share-btn--favorite'
    : 'name-card__btn name-card__btn--favorite';

  const isFavorite = Boolean(options.isFavorite);
  const label = isFavorite ? '保存済み' : '保存';
  button.textContent = label;
  button.setAttribute('aria-label', `${item.name}を${isFavorite ? 'お気に入り解除' : 'お気に入り保存'}`);
  button.title = isFavorite ? 'お気に入りから外す' : 'お気に入りに保存';

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await options.onToggleFavorite(item);
    } finally {
      button.disabled = false;
    }
  });

  return button;
}

function createSurnameCheckButton(item, options = {}, variant = 'card') {
  if (typeof options.onCheckSurname !== 'function') return null;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = variant === 'spotlight'
    ? 'share-btn share-btn--surname'
    : 'name-card__btn name-card__btn--surname';
  button.textContent = '苗字と診断';
  button.setAttribute('aria-label', `${item.name}を苗字との相性で確認`);
  button.title = '苗字との相性を見る';
  button.addEventListener('click', () => {
    options.onCheckSurname(item);
  });
  return button;
}

export function createSpeciesCards(options, selectedSet, onSelect) {
  const wrap = document.createElement('div');
  wrap.className = 'species-grid';
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'species-card';
    btn.dataset.value = opt.value;
    if (selectedSet.has(opt.value)) btn.classList.add('is-active');
    const label = document.createElement('span');
    label.className = 'species-card__label';
    label.textContent = opt.label;
    if (opt.icon) {
      const icon = document.createElement('span');
      icon.className = 'species-card__icon';
      icon.textContent = opt.icon;
      btn.append(icon, label);
    } else {
      btn.append(label);
    }
    btn.addEventListener('click', () => onSelect(opt.value));
    wrap.appendChild(btn);
  }
  return wrap;
}

export function createChips(items, activeSet, onToggle) {
  const wrap = document.createElement('div');
  wrap.className = 'chips';
  for (const raw of items) {
    const value = typeof raw === 'string' ? raw : raw.value;
    const label = typeof raw === 'string' ? raw : raw.label;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.value = value;
    btn.textContent = label;
    if (activeSet.has(value)) {
      btn.classList.add('active', 'is-active');
    }
    btn.setAttribute('aria-pressed', activeSet.has(value) ? 'true' : 'false');
    btn.addEventListener('click', () => onToggle(value));
    wrap.appendChild(btn);
  }
  return wrap;
}

export function createSpotlight(item, options = {}) {
  const art = document.createElement('article');
  art.className = 'top-result result-card';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'top-result__label';
  eyebrow.textContent = 'いちおし候補';

  const nameEl = document.createElement('h3');
  nameEl.className = 'spotlight__name';
  nameEl.textContent = item.name;

  const readingSub = secondaryReadingIfAny(item.name, item.reading);

  const meaning = document.createElement('p');
  meaning.className = 'spotlight__meaning';
  meaning.textContent = item.meaning;

  const score = document.createElement('p');
  score.className = 'spotlight__score';
  if (item.match?.score != null) {
    score.textContent = `おすすめ度 ${item.match.score}%（${item.match.label}）`;
  } else {
    score.textContent = 'おすすめ度 —';
  }

  const tags = document.createElement('div');
  tags.className = 'top-result__tags';
  for (const v of item.vibe) {
    const t = document.createElement('span');
    t.className = 'spotlight-tag';
    t.textContent = v;
    tags.appendChild(t);
  }

  const actions = document.createElement('div');
  actions.className = 'spotlight__actions';

  const btnX = document.createElement('button');
  btnX.type = 'button';
  btnX.className = 'share-btn share-btn--x';
  btnX.textContent = 'Xで共有';
  btnX.addEventListener('click', () => {
    window.open(getXShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const btnLine = document.createElement('button');
  btnLine.type = 'button';
  btnLine.className = 'share-btn share-btn--line';
  btnLine.textContent = 'LINEで送る';
  btnLine.addEventListener('click', () => {
    window.open(getLINEShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const btnCopy = document.createElement('button');
  btnCopy.type = 'button';
  btnCopy.className = 'share-btn share-btn--copy';
  btnCopy.textContent = 'コピー';
  btnCopy.addEventListener('click', () => {
    copyNameToClipboard(item.name).catch(() => {});
  });

  const favoriteBtn = createFavoriteButton(item, options, 'spotlight');
  if (favoriteBtn) {
    actions.append(favoriteBtn);
  }
  actions.append(btnX, btnLine, btnCopy);

  art.append(eyebrow, nameEl);
  if (readingSub != null) {
    const reading = document.createElement('p');
    reading.className = 'spotlight__reading';
    reading.textContent = readingSub;
    art.appendChild(reading);
  }
  art.append(meaning, score, tags, actions);
  return art;
}

function getWebShareData(name, reading) {
  return {
    title: `シッポミで見つけた名前「${name}」`,
    text: `ペットの名前「${name}（${reading || ''}）」をシッポミで見つけました！`,
    url: 'https://sippomi.com/',
  };
}

export function createNameCard(item, options = {}) {
  const card = document.createElement('article');
  card.className = 'name-card result-card';

  const actions = document.createElement('div');
  actions.className = 'name-card__actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'name-card__btn name-card__btn--copy';
  copyBtn.setAttribute('aria-label', `${item.name}をコピー`);
  copyBtn.title = '名前をコピー';
  copyBtn.textContent = 'コピー';
  copyBtn.addEventListener('click', async () => {
    try {
      await copyNameToClipboard(item.name);
      copyBtn.textContent = '完了';
      copyBtn.classList.add('copied');
      window.setTimeout(() => {
        copyBtn.textContent = 'コピー';
        copyBtn.classList.remove('copied');
      }, 1600);
    } catch {
      copyBtn.textContent = '完了';
      window.setTimeout(() => {
        copyBtn.textContent = 'コピー';
      }, 1600);
    }
  });

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'name-card__btn name-card__btn--share';
  shareBtn.setAttribute('aria-label', `${item.name}をシェア`);
  shareBtn.title = 'シェア';
  shareBtn.textContent = '共有';
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share(getWebShareData(item.name, item.reading)).catch(() => {});
    } else {
      window.open(getXShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
    }
  });

  const favoriteBtn = createFavoriteButton(item, options, 'card');
  const surnameBtn = createSurnameCheckButton(item, options, 'card');
  if (favoriteBtn) {
    actions.append(favoriteBtn);
  }
  if (surnameBtn) {
    actions.append(surnameBtn);
  }
  actions.append(copyBtn, shareBtn);

  const meta = document.createElement('p');
  meta.className = 'name-card__meta';
  if (item.match?.score != null) {
    meta.textContent = `おすすめ度 ${item.match.score}%（${item.match.label}）`;
  } else {
    meta.textContent = 'おすすめ度 —';
  }

  const nameEl = document.createElement('h3');
  nameEl.className = 'name-card__name';
  nameEl.textContent = item.name;
  nameEl.title = item.meaning;

  const readingSub = secondaryReadingIfAny(item.name, item.reading);

  const meaning = document.createElement('p');
  meaning.className = 'name-card__meaning';
  meaning.textContent = item.meaning;

  const tagWrap = document.createElement('div');
  tagWrap.className = 'name-card__tags';
  for (const v of item.vibe) {
    const t = document.createElement('span');
    t.className = 'tag';
    t.textContent = v;
    tagWrap.appendChild(t);
  }

  card.append(actions, meta, nameEl);
  if (readingSub != null) {
    const reading = document.createElement('p');
    reading.className = 'name-card__reading';
    reading.textContent = readingSub;
    card.appendChild(reading);
  }
  card.append(meaning, tagWrap);
  return card;
}

/** 表示グループ内での順位（0始まり）で色分け — スコア幅が狭くても必ず差が出る */
function toneClassForRank(rankIndex, n) {
  if (n <= 0) return 'result-wordcloud__chip--tone-neutral';
  if (n === 1) return 'result-wordcloud__chip--tone-high';
  const topEnd = Math.ceil(n / 3);
  const midEnd = Math.ceil((2 * n) / 3);
  if (rankIndex < topEnd) return 'result-wordcloud__chip--tone-high';
  if (rankIndex < midEnd) return 'result-wordcloud__chip--tone-mid';
  return 'result-wordcloud__chip--tone-low';
}

function overflowRowTier(rankIndex, n) {
  if (n <= 0) return 'neutral';
  if (n === 1) return 'high';
  const topEnd = Math.ceil(n / 3);
  const midEnd = Math.ceil((2 * n) / 3);
  if (rankIndex < topEnd) return 'high';
  if (rankIndex < midEnd) return 'mid';
  return 'low';
}

function computeScoreFontRem(score, minScore, maxScore, nVisible) {
  const lo = 0.72;
  const baseHi = nVisible > 14 ? 1.48 : nVisible > 10 ? 1.72 : 2.05;
  if (score == null) return (lo + baseHi) / 2;
  if (maxScore === minScore) return (lo + baseHi) / 2;
  const t = (score - minScore) / (maxScore - minScore);
  return lo + t * (baseHi - lo);
}

function createResultGuidance(item) {
  const score = item.match?.score;
  const leadVibe = Array.isArray(item.vibe) && item.vibe.length > 0 ? item.vibe[0] : null;

  if (score != null && score >= 88) {
    return leadVibe
      ? `「${leadVibe}」な雰囲気を大切にしたい今の気分に、特に寄り添いやすい候補です。`
      : '今の条件にかなり近く、第一候補としてゆっくり眺めたい名前です。';
  }

  if (score != null && score >= 76) {
    return leadVibe
      ? `やわらかさと「${leadVibe}」のバランスがよく、呼びはじめの一声も自然に馴染みやすい候補です。`
      : '今の条件に心地よく重なる、安心感のある候補です。';
  }

  if (leadVibe) {
    return `少し視点を広げたいときにうれしい、「${leadVibe}」の魅力を持った候補です。`;
  }

  return '条件を少し広げながら見つけた、雰囲気のよい候補です。';
}

function countStoryUnits(value = '') {
  return Array.from(String(value).replace(/[\s・]/g, '')).length;
}

function buildOriginStory(item) {
  const baseMeaning = String(item.meaning || '').trim();
  if (!baseMeaning) {
    return `${item.name}は、呼んだときのやさしい印象を大切に選びたいときに手に取りやすい名前です。`;
  }

  if (/ギリシャ語|ラテン語|フランス語|イタリア語|英語|ハワイ語|スペイン語|ドイツ語/.test(baseMeaning)) {
    return `${baseMeaning}。海外語源のニュアンスがありつつ、日本語でも呼びやすく整っているので、親しみやすさと特別感のバランスが取りやすい名前です。`;
  }

  if (/空|海|風|花|月|星|雪|森/.test(baseMeaning)) {
    return `${baseMeaning}。自然の情景が思い浮かびやすく、名前を呼ぶたびにその子らしい空気感まで一緒に感じられるのが魅力です。`;
  }

  if (/宝石|真珠|琥珀|翡翠|サファイア|ルビー/.test(baseMeaning)) {
    return `${baseMeaning}。きらりとした印象があり、上品さや大切に迎えた特別感を込めたいときに似合います。`;
  }

  return `${baseMeaning}。意味のわかりやすさがあるので、家族の中でも自然に愛着が育ちやすい名前です。`;
}

function buildSoundStory(item) {
  const reading = String(item.reading || item.name || '').trim();
  const styles = Array.isArray(item.callStyle) ? item.callStyle.filter(Boolean) : [];
  const length = Math.max(countStoryUnits(item.name), countStoryUnits(reading));

  const intro = reading
    ? `響きは「${reading}」と口に出したときの流れが自然で`
    : '口に出したときの流れが自然で';

  if (styles.length >= 2) {
    return `${intro}、${styles.slice(0, 2).join('と')}をあわせ持っています。毎日の呼びかけでも言いやすく、写真や紹介文に書いたときも印象が整いやすいタイプです。`;
  }

  if (styles.length === 1) {
    return `${intro}、${styles[0]}のが特徴です。${length <= 2 ? '短く呼びやすいので、とっさに声をかける場面でも使いやすく、' : '長さにほどよい余韻があるので、'}家族の会話にすっと馴染みます。`;
  }

  return `${intro}、${length <= 2 ? '短く軽やかなテンポ' : 'やわらかな余韻'}があります。はじめて呼ぶ瞬間にも照れずに使いやすい、生活に馴染む名前です。`;
}

function buildLifestyleStory(item) {
  const wishes = Array.isArray(item.wish) ? item.wish.filter(Boolean) : [];
  const scenes = Array.isArray(item.scene) ? item.scene.filter(Boolean) : [];
  const lifestyles = Array.isArray(item.ownerLifestyle) ? item.ownerLifestyle.filter(Boolean) : [];
  const vibes = Array.isArray(item.vibe) ? item.vibe.filter(Boolean) : [];

  const wishText = wishes.length > 0 ? wishes[0] : 'やさしい日常';
  const sceneText = scenes.length > 0 ? scenes[0] : null;
  const lifestyleText = lifestyles.length > 0 ? lifestyles[0] : null;
  const vibeText = vibes.length > 0 ? vibes[0] : null;

  let sentence = `この名前には「${wishText}」のような願いを重ねやすく、`;
  if (sceneText) {
    sentence += `${sceneText}を思わせる空気があります。`;
  } else if (vibeText) {
    sentence += `全体として「${vibeText}」な印象にまとまりやすいです。`;
  } else {
    sentence += '毎日の暮らしの中でじわっと愛着が育つタイプです。';
  }

  if (lifestyleText) {
    sentence += ` ${lifestyleText}のような時間が好きな飼い主さんにも自然に似合います。`;
  } else {
    sentence += ' 初対面でも説明しやすく、家族や友人にも共有しやすい名前です。';
  }

  return sentence;
}

function buildDetailedNameStory(item) {
  return [
    { label: '由来', body: buildOriginStory(item) },
    { label: '響き', body: buildSoundStory(item) },
    { label: '暮らしの中での印象', body: buildLifestyleStory(item) },
  ];
}

export function createNameStoryPanel(item, options = {}) {
  const card = document.createElement('article');
  card.className = 'name-story-panel';

  const head = document.createElement('div');
  head.className = 'name-story-panel__head';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'name-story-panel__eyebrow';
  eyebrow.textContent = 'Name Story';

  const title = document.createElement('h3');
  title.className = 'name-story-panel__title';
  title.textContent = item.name;

  const readingSub = secondaryReadingIfAny(item.name, item.reading);
  if (readingSub != null) {
    const reading = document.createElement('p');
    reading.className = 'name-story-panel__reading';
    reading.textContent = `読み: ${readingSub}`;
    head.append(eyebrow, title, reading);
  } else {
    head.append(eyebrow, title);
  }

  const lead = document.createElement('p');
  lead.className = 'name-story-panel__lead';
  lead.textContent = item.meaning;
  head.appendChild(lead);

  const actions = document.createElement('div');
  actions.className = 'name-story-panel__actions';
  const favoriteBtn = createFavoriteButton(item, options, 'spotlight');
  if (favoriteBtn) actions.appendChild(favoriteBtn);
  const surnameBtn = createSurnameCheckButton(item, options, 'spotlight');
  if (surnameBtn) actions.appendChild(surnameBtn);
  if (actions.childElementCount) head.appendChild(actions);

  const tags = document.createElement('div');
  tags.className = 'name-story-panel__tags';
  for (const vibe of item.vibe || []) {
    const tag = document.createElement('span');
    tag.className = 'name-story-panel__tag';
    tag.textContent = vibe;
    tags.appendChild(tag);
  }

  const storyList = document.createElement('div');
  storyList.className = 'name-story-panel__list';
  for (const section of buildDetailedNameStory(item)) {
    const storyItem = document.createElement('section');
    storyItem.className = 'name-story-panel__section';

    const storyLabel = document.createElement('p');
    storyLabel.className = 'name-story-panel__section-label';
    storyLabel.textContent = section.label;

    const storyBody = document.createElement('p');
    storyBody.className = 'name-story-panel__section-body';
    storyBody.textContent = section.body;

    storyItem.append(storyLabel, storyBody);
    storyList.appendChild(storyItem);
  }

  card.appendChild(head);
  if (tags.childElementCount) card.appendChild(tags);
  card.appendChild(storyList);
  return card;
}

/** 詳細パネル（ワードクラウドで選んだ候補用・コンパクト） */
function createResultDetailStrip(item, options = {}) {
  const art = document.createElement('article');
  art.className = 'result-detail strip result-detail--immersive';

  const hero = document.createElement('div');
  hero.className = 'result-detail__hero';

  const intro = document.createElement('div');
  intro.className = 'result-detail__intro';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'result-detail__eyebrow';
  eyebrow.textContent = 'いまの条件で気になる名前';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'result-detail__titles result-detail__titles--hero';

  const nameEl = document.createElement('h3');
  nameEl.className = 'result-detail__name';
  nameEl.textContent = item.name;

  const readingSub = secondaryReadingIfAny(item.name, item.reading);

  const score = document.createElement('p');
  score.className = 'result-detail__score';
  if (item.match?.score != null) {
    score.textContent = `おすすめ度 ${item.match.score}%（${item.match.label}）`;
  } else {
    score.textContent = 'おすすめ度 —';
  }

  const guidance = document.createElement('p');
  guidance.className = 'result-detail__guidance';
  guidance.textContent = createResultGuidance(item);

  titleWrap.append(nameEl);
  if (readingSub != null) {
    const reading = document.createElement('p');
    reading.className = 'result-detail__reading';
    reading.textContent = readingSub;
    titleWrap.appendChild(reading);
  }
  titleWrap.append(score, guidance);

  const scorePanel = document.createElement('div');
  scorePanel.className = 'result-detail__score-panel';

  const scoreNumber = document.createElement('span');
  scoreNumber.className = 'result-detail__score-number';
  scoreNumber.textContent = item.match?.score != null ? `${item.match.score}` : '—';

  const scoreUnit = document.createElement('span');
  scoreUnit.className = 'result-detail__score-unit';
  scoreUnit.textContent = '%';

  const scoreLabel = document.createElement('span');
  scoreLabel.className = 'result-detail__score-label';
  scoreLabel.textContent = item.match?.label ? item.match.label : '相性をチェック中';

  const scoreCaption = document.createElement('span');
  scoreCaption.className = 'result-detail__score-caption';
  scoreCaption.textContent = 'いまの条件とのフィット感';

  scorePanel.append(scoreNumber, scoreUnit, scoreLabel, scoreCaption);

  intro.append(eyebrow, titleWrap);
  hero.append(intro, scorePanel);

  const meaningBlock = document.createElement('section');
  meaningBlock.className = 'result-detail__meaning-block';

  const meaningEyebrow = document.createElement('p');
  meaningEyebrow.className = 'result-detail__section-label';
  meaningEyebrow.textContent = 'Name Story';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'result-detail__icon-btn result-detail__icon-btn--copy';
  copyBtn.setAttribute('aria-label', `${item.name}をコピー`);
  copyBtn.title = 'コピー';
  copyBtn.textContent = 'コピー';
  copyBtn.addEventListener('click', () => {
    copyNameToClipboard(item.name).catch(() => {});
  });

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'result-detail__icon-btn result-detail__icon-btn--share';
  shareBtn.setAttribute('aria-label', 'Xでシェア');
  shareBtn.title = 'Xでシェア';
  shareBtn.textContent = 'Xでシェア';
  shareBtn.addEventListener('click', () => {
    window.open(getXShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const lineBtn = document.createElement('button');
  lineBtn.type = 'button';
  lineBtn.className = 'result-detail__icon-btn result-detail__icon-btn--line';
  lineBtn.setAttribute('aria-label', 'LINEでシェア');
  lineBtn.title = 'LINEでシェア';
  lineBtn.textContent = 'LINEで送る';
  lineBtn.addEventListener('click', () => {
    window.open(getLINEShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const favoriteBtn = createFavoriteButton(item, options, 'spotlight');
  if (favoriteBtn) {
    favoriteBtn.classList.add('result-detail__fav-btn');
  }
  const surnameBtn = createSurnameCheckButton(item, options, 'spotlight');
  if (surnameBtn) {
    surnameBtn.classList.add('result-detail__surname-btn');
  }

  const meaning = document.createElement('p');
  meaning.className = 'result-detail__meaning';
  meaning.textContent = item.meaning;

  const storyList = document.createElement('div');
  storyList.className = 'result-detail__story-list';
  for (const section of buildDetailedNameStory(item)) {
    const storyItem = document.createElement('div');
    storyItem.className = 'result-detail__story-item';

    const storyLabel = document.createElement('p');
    storyLabel.className = 'result-detail__story-label';
    storyLabel.textContent = section.label;

    const storyBody = document.createElement('p');
    storyBody.className = 'result-detail__story-body';
    storyBody.textContent = section.body;

    storyItem.append(storyLabel, storyBody);
    storyList.appendChild(storyItem);
  }
  meaningBlock.append(meaningEyebrow, meaning, storyList);

  const tagSection = document.createElement('section');
  tagSection.className = 'result-detail__tag-section';

  const tagEyebrow = document.createElement('p');
  tagEyebrow.className = 'result-detail__section-label';
  tagEyebrow.textContent = 'この名前の印象';

  const tags = document.createElement('div');
  tags.className = 'result-detail__tags';
  for (const v of item.vibe) {
    const t = document.createElement('span');
    t.className = 'result-detail__tag';
    t.textContent = v;
    tags.appendChild(t);
  }
  tagSection.append(tagEyebrow, tags);

  const actions = document.createElement('div');
  actions.className = 'result-detail__actions';

  if (favoriteBtn) actions.appendChild(favoriteBtn);
  if (surnameBtn) actions.appendChild(surnameBtn);

  const utility = document.createElement('div');
  utility.className = 'result-detail__utility';
  utility.append(copyBtn, shareBtn, lineBtn);
  actions.appendChild(utility);

  art.append(hero, meaningBlock, tagSection, actions);
  return art;
}

function createResultWordCloudBlock(mapItems, meta, onSelectIndex) {
  const { totalInView = mapItems.length } = meta || {};
  const scores = mapItems.map((it) => (it.match?.score != null ? it.match.score : 50));
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const n = mapItems.length;

  const wrap = document.createElement('div');
  wrap.className = 'result-wordcloud-block';

  const heading = document.createElement('div');
  heading.className = 'result-wordcloud-block__head';
  const h = document.createElement('p');
  h.className = 'result-wordcloud-block__title';
  h.textContent = '気になる名前をタップ';
  const sub = document.createElement('p');
  sub.className = 'result-wordcloud-block__sub';
  if (totalInView > WORDCLOUD_MAP_MAX) {
    sub.textContent = `まずは上位${WORDCLOUD_MAP_MAX}件から直感で選べます。表示中は${totalInView}件で、続きは下の一覧からゆっくり見比べられます。`;
  } else {
    sub.textContent = '大きい名前ほど、いま選んだ条件との相性が高めです。気になった候補をひとつタップしてください。';
  }

  const legend = document.createElement('p');
  legend.className = 'result-wordcloud-block__legend';
  legend.textContent =
    '青は特に相性が高い候補、緑はバランスがよい候補、橙は少し視点を広げたいときの候補です。';

  heading.append(h, sub, legend);

  const cloud = document.createElement('div');
  cloud.className = 'result-wordcloud';
  cloud.setAttribute('role', 'group');
  cloud.setAttribute('aria-label', 'おすすめ度に応じた候補名');

  const buttons = [];

  mapItems.forEach((item, index) => {
    const sc = item.match?.score;
    const fontRem = computeScoreFontRem(sc, minScore, maxScore, n);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `result-wordcloud__chip ${toneClassForRank(index, n)}`;
    btn.style.fontSize = `${fontRem}rem`;
    const labelParts =
      sc != null ? `${item.name}、おすすめ度${sc}パーセント` : `${item.name}、スコア未計測`;
    btn.setAttribute('aria-label', labelParts);
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = item.name;
    btn.addEventListener('click', () => onSelectIndex(index));
    buttons.push(btn);
    cloud.appendChild(btn);
  });

  wrap.append(heading, cloud);

  function setSelectedIndex(i) {
    buttons.forEach((b, j) => {
      const on = i >= 0 && j === i;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  return { wrap, setSelectedIndex, buttons };
}

export function renderResults(container, results, visibleCount, onLoadMore, options = {}) {
  container.replaceChildren();

  document.getElementById('resultWordcloudIntro')?.setAttribute('hidden', '');

  const { items, total } = results;
  if (total === 0 || items.length === 0) {
    const p = document.createElement('p');
    p.className = 'result-empty';
    p.textContent = '条件に合う名前が見つかりませんでした。条件を少し広げてみてください。';
    container.appendChild(p);
    return;
  }

  document.getElementById('resultWordcloudIntro')?.removeAttribute('hidden');

  const showCount = Math.min(visibleCount, items.length);
  const visibleItems = items.slice(0, showCount);
  const mapItems = visibleItems.slice(0, Math.min(WORDCLOUD_MAP_MAX, visibleItems.length));
  const overflowItems = visibleItems.slice(mapItems.length);

  const layout = document.createElement('div');
  layout.className = 'result-layout';

  const detailHost = document.createElement('div');
  detailHost.className = 'result-detail-host';

  const initialSelectedKey = typeof options.selectedKey === 'string' ? options.selectedKey : '';
  let selectedIndex = visibleItems.findIndex((item) => {
    const key = options.favoriteKeyForItem?.(item);
    return key && key === initialSelectedKey;
  });
  if (selectedIndex < 0) selectedIndex = 0;

  function syncDetail() {
    const item = visibleItems[selectedIndex];
    options.onSelectionChange?.(item);
    detailHost.replaceChildren(
      createResultDetailStrip(item, {
        ...options,
        isFavorite: options.savedKeys?.has?.(options.favoriteKeyForItem?.(item) || '') || false,
      }),
    );
  }

  const overflowButtons = [];

  let cloudState;

  function setMapAndOverflowSelection(globalIdx) {
    cloudState.setSelectedIndex(globalIdx < mapItems.length ? globalIdx : -1);
    overflowButtons.forEach(({ btn, idx }) => {
      const on = idx === globalIdx;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  cloudState = createResultWordCloudBlock(
    mapItems,
    { totalInView: visibleItems.length },
    (localIdx) => {
      selectedIndex = localIdx;
      setMapAndOverflowSelection(selectedIndex);
      syncDetail();
    },
  );

  let overflowHost = null;
  if (overflowItems.length > 0) {
    overflowHost = document.createElement('details');
    overflowHost.className = 'result-wordcloud-overflow';
    const sum = document.createElement('summary');
    sum.className = 'result-wordcloud-overflow__summary';
    const sumStrong = document.createElement('strong');
    sumStrong.textContent = String(overflowItems.length);
    const sumChev = document.createElement('span');
    sumChev.className = 'result-wordcloud-overflow__chev';
    sumChev.textContent = '▼';
    sumChev.setAttribute('aria-hidden', 'true');
    const sumText = document.createElement('span');
    sumText.className = 'result-wordcloud-overflow__summary-text';
    sumText.append(
      document.createTextNode('ほかの候補 '),
      sumStrong,
      document.createTextNode(' 件'),
    );
    sum.append(sumText, sumChev);

    const hint = document.createElement('p');
    hint.className = 'result-wordcloud-overflow__hint';
    hint.textContent =
      'もう少し見比べたいときの候補一覧です。気になる名前を選ぶと、すぐ上のカードが切り替わります。';

    const pageSize
      = typeof options.overflowListPageSize === 'number'
        ? options.overflowListPageSize
        : OVERFLOW_LIST_PAGE_SIZE;
    const rawPage = typeof options.overflowListPage === 'number' ? options.overflowListPage : 0;
    const pageCount = Math.max(1, Math.ceil(overflowItems.length / pageSize));
    const safePage = Math.min(Math.max(0, rawPage), pageCount - 1);
    const start = safePage * pageSize;
    const pageSlice = overflowItems.slice(start, start + pageSize);

    const toolbar = document.createElement('div');
    toolbar.className = 'result-overflow-toolbar';
    const range = document.createElement('p');
    range.className = 'result-overflow-toolbar__range';
    const from = overflowItems.length === 0 ? 0 : start + 1;
    const to = Math.min(start + pageSlice.length, overflowItems.length);
    range.textContent = `${from}–${to} / ${overflowItems.length}件`;

    const pagerBtns = document.createElement('div');
    pagerBtns.className = 'result-overflow-toolbar__btns';

    const btnPrev = document.createElement('button');
    btnPrev.type = 'button';
    btnPrev.className = 'btn-secondary result-overflow-toolbar__nav';
    btnPrev.textContent = '前のページ';
    btnPrev.disabled = safePage <= 0;
    btnPrev.addEventListener('click', () => {
      options.onOverflowListPageChange?.(safePage - 1);
    });

    const btnNext = document.createElement('button');
    btnNext.type = 'button';
    btnNext.className = 'btn-secondary result-overflow-toolbar__nav';
    btnNext.textContent = '次のページ';
    btnNext.disabled = start + pageSize >= overflowItems.length;
    btnNext.addEventListener('click', () => {
      options.onOverflowListPageChange?.(safePage + 1);
    });

    pagerBtns.append(btnPrev, btnNext);
    toolbar.append(range, pagerBtns);

    const list = document.createElement('div');
    list.className = 'result-overflow-list';
    list.setAttribute('role', 'group');
    list.setAttribute('aria-label', 'マップ外の候補一覧');

    const on = overflowItems.length;
    pageSlice.forEach((item, k) => {
      const rel = start + k;
      const globalIdx = mapItems.length + rel;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `result-overflow-row result-overflow-row--${overflowRowTier(rel, on)}`;
      const sc = item.match?.score;
      const labelParts
        = sc != null ? `${item.name}、おすすめ度${sc}パーセント` : `${item.name}、スコア未計測`;
      row.setAttribute('aria-label', labelParts);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'result-overflow-row__name';
      nameSpan.textContent = item.name;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'result-overflow-row__meta';
      if (sc != null) {
        metaSpan.textContent = `${sc}%`;
      } else {
        metaSpan.textContent = '—';
      }

      row.append(nameSpan, metaSpan);
      row.addEventListener('click', () => {
        selectedIndex = globalIdx;
        setMapAndOverflowSelection(selectedIndex);
        syncDetail();
      });
      overflowButtons.push({ btn: row, idx: globalIdx });
      list.appendChild(row);
    });

    overflowHost.append(sum, hint, toolbar, list);
  }

  setMapAndOverflowSelection(selectedIndex);
  syncDetail();

  layout.append(cloudState.wrap, detailHost);
  if (overflowHost) layout.appendChild(overflowHost);
  container.appendChild(layout);

  const remaining = items.length - showCount;
  if (remaining > 0) {
    const pager = document.createElement('div');
    pager.className = 'result-pagination';

    if (typeof onLoadMore === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-secondary result-pagination__btn btn-load-more';
      btn.textContent = `もっと見る（残り ${remaining} 件）`;
      btn.addEventListener('click', onLoadMore);
      pager.appendChild(btn);
    }

    if (typeof options.onShowAll === 'function') {
      const btnAll = document.createElement('button');
      btnAll.type = 'button';
      btnAll.className = 'btn-secondary result-pagination__btn btn-load-all';
      btnAll.textContent = `すべて読み込む（+${remaining} 件）`;
      btnAll.title =
        '候補をすべて展開します。おすすめ度マップは見やすさのため上位20件のみで、それ以外は下の「ほかの候補」から選べます。';
      btnAll.addEventListener('click', options.onShowAll);
      pager.appendChild(btnAll);
    }

    container.appendChild(pager);
  }
}
