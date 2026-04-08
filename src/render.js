import { copyNameToClipboard, getLINEShareURL, getXShareURL } from './share.js';
import { secondaryReadingIfAny } from './reading-display.js';

function createFavoriteButton(item, options = {}, variant = 'card') {
  if (typeof options.onToggleFavorite !== 'function') return null;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = variant === 'spotlight'
    ? 'share-btn share-btn--favorite'
    : 'name-card__btn name-card__btn--favorite';

  const isFavorite = Boolean(options.isFavorite);
  const label = isFavorite ? '★ 保存済み' : '☆ 保存';
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

export function createSpeciesCards(options, selectedSet, onSelect) {
  const wrap = document.createElement('div');
  wrap.className = 'species-grid';
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'species-card';
    btn.dataset.value = opt.value;
    if (selectedSet.has(opt.value)) btn.classList.add('is-active');
    const icon = document.createElement('span');
    icon.className = 'species-card__icon';
    icon.textContent = opt.icon;
    const label = document.createElement('span');
    label.className = 'species-card__label';
    label.textContent = opt.label;
    btn.append(icon, label);
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
  btnX.textContent = '𝕏 でシェア';
  btnX.addEventListener('click', () => {
    window.open(getXShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const btnLine = document.createElement('button');
  btnLine.type = 'button';
  btnLine.className = 'share-btn share-btn--line';
  btnLine.textContent = 'LINE でシェア';
  btnLine.addEventListener('click', () => {
    window.open(getLINEShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const btnCopy = document.createElement('button');
  btnCopy.type = 'button';
  btnCopy.className = 'share-btn share-btn--copy';
  btnCopy.textContent = '名前をコピー';
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
  copyBtn.textContent = '📋';
  copyBtn.addEventListener('click', async () => {
    try {
      await copyNameToClipboard(item.name);
      copyBtn.textContent = '✓';
      copyBtn.classList.add('copied');
      window.setTimeout(() => {
        copyBtn.textContent = '📋';
        copyBtn.classList.remove('copied');
      }, 1600);
    } catch {
      copyBtn.textContent = '✓';
      window.setTimeout(() => {
        copyBtn.textContent = '📋';
      }, 1600);
    }
  });

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'name-card__btn name-card__btn--share';
  shareBtn.setAttribute('aria-label', `${item.name}をXでシェア`);
  shareBtn.title = 'Xでシェア';
  shareBtn.textContent = '↗';
  shareBtn.addEventListener('click', () => {
    window.open(getXShareURL(item.name, item.reading), '_blank', 'noopener,noreferrer');
  });

  const favoriteBtn = createFavoriteButton(item, options, 'card');
  if (favoriteBtn) {
    actions.append(favoriteBtn);
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

export function renderResults(container, results, visibleCount, onLoadMore, options = {}) {
  container.replaceChildren();

  const { items, total } = results;
  if (total === 0 || items.length === 0) {
    const p = document.createElement('p');
    p.className = 'result-empty';
    p.textContent = '条件に合う名前が見つかりませんでした。条件を少し広げてみてください。';
    container.appendChild(p);
    return;
  }

  const showCount = Math.min(visibleCount, items.length);
  container.appendChild(createSpotlight(items[0], {
    ...options,
    isFavorite: options.savedKeys?.has?.(options.favoriteKeyForItem?.(items[0]) || '') || false,
  }));

  for (let i = 1; i < showCount; i += 1) {
    container.appendChild(createNameCard(items[i], {
      ...options,
      isFavorite: options.savedKeys?.has?.(options.favoriteKeyForItem?.(items[i]) || '') || false,
    }));
  }

  const remaining = items.length - showCount;
  if (remaining > 0 && typeof onLoadMore === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-load-more';
    btn.textContent = `もっと見る（残り ${remaining} 件）`;
    btn.addEventListener('click', onLoadMore);
    container.appendChild(btn);
  }
}
