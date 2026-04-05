import './styles/global.css';
import './landing-effects.js';
import {
  COLOR_OPTIONS,
  GENDER_OPTIONS,
  INITIAL_RESULT_COUNT,
  LOAD_MORE_COUNT,
  SPECIES_OPTIONS,
  VIBE_OPTIONS,
  VIBE_URL_ALIASES,
} from './constants.js';
import { getResults } from './diagnosis.js';
import {
  createChips,
  createSpeciesCards,
  renderResults,
} from './render.js';
import { secondaryReadingIfAny } from './reading-display.js';

const state = {
  species: new Set(),
  gender: new Set(),
  vibe: new Set(),
  color: new Set(),
  visibleCount: INITIAL_RESULT_COUNT,
  results: null,
};

let allNames = [];

/** 名鑑 JSON の名前 → 画像（ランキング行のサムネ用） */
const celebThumbByName = new Map();

const trendingList = document.getElementById('trendingList');
const trendingSection = document.getElementById('trendingSection');
const trendingTabs = document.querySelectorAll('.trending-tab');
const celebGrid = document.getElementById('celebGrid');
const celebSection = document.getElementById('celebSection');

/** ペット名鑑は初期は畳み、足跡ボタンで展開 */
let celebPanelRevealed = false;

/** Wikimedia の https 画像のみ許可（静的 JSON 用） */
function safeWikimediaImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:') return null;
    if (u.hostname.toLowerCase() !== 'upload.wikimedia.org') return null;
    return u.href;
  } catch {
    return null;
  }
}

function syncCelebPanelVisibility() {
  if (!celebSection) return;
  const panel = document.getElementById('celebListPanel');
  const revealBtn = document.getElementById('celebRevealBtn');
  if (celebPanelRevealed) {
    celebSection.classList.add('celeb-section--panel-revealed');
    panel?.removeAttribute('aria-hidden');
    revealBtn?.setAttribute('aria-expanded', 'true');
  } else {
    celebSection.classList.remove('celeb-section--panel-revealed');
    panel?.setAttribute('aria-hidden', 'true');
    revealBtn?.setAttribute('aria-expanded', 'false');
  }
}

function revealCelebPanel() {
  celebPanelRevealed = true;
  syncCelebPanelVisibility();
  document.getElementById('celebListPanel')?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
}

/** 狭いビューポートではランキング一覧を畳み、タブタップで全表示 */
const MOBILE_TRENDING_MQ = window.matchMedia('(max-width: 900px)');
let trendingRankingRevealed = false;

function syncTrendingListVisibility() {
  if (!trendingSection) return;
  const panel = document.getElementById('trendingListPanel');
  if (!MOBILE_TRENDING_MQ.matches) {
    trendingSection.classList.add('trending-section--list-revealed');
    panel?.removeAttribute('aria-hidden');
    ensureDesktopTrendingHasContent();
    return;
  }
  if (trendingRankingRevealed) {
    trendingSection.classList.add('trending-section--list-revealed');
    panel?.removeAttribute('aria-hidden');
  } else {
    trendingSection.classList.remove('trending-section--list-revealed');
    panel?.setAttribute('aria-hidden', 'true');
  }
}

function revealTrendingRanking() {
  trendingRankingRevealed = true;
  syncTrendingListVisibility();
  if (MOBILE_TRENDING_MQ.matches) {
    document.getElementById('trendingListPanel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }
}

function clearTrendingTabSelection() {
  trendingTabs.forEach((t) => {
    t.classList.remove('is-active');
    t.setAttribute('aria-selected', 'false');
  });
}

function setTrendingTabActive(tab) {
  trendingTabs.forEach((t) => {
    t.classList.remove('is-active');
    t.setAttribute('aria-selected', 'false');
  });
  tab.classList.add('is-active');
  tab.setAttribute('aria-selected', 'true');
}

/** デスクトップ幅で一覧が空のときは犬ランキングを表示（スマホ初期は空のまま） */
function ensureDesktopTrendingHasContent() {
  if (MOBILE_TRENDING_MQ.matches || !trendingList) return;
  if (trendingList.children.length > 0) return;
  renderTrending('犬');
  const dogTab = document.querySelector('.trending-tab[data-species="犬"]');
  if (dogTab) setTrendingTabActive(dogTab);
}

const selectionSummary = document.getElementById('selectionSummary');
const btnDiagnose = document.getElementById('btnDiagnose');
const resultSection = document.getElementById('resultSection');
const resultCount = document.getElementById('resultCount');
const resultContainer = document.getElementById('resultContainer');
const btnRetry = document.getElementById('btnRetry');
const faqToggle = document.getElementById('faqToggle');

const speciesGrid = document.getElementById('speciesGrid');
const vibeChips = document.getElementById('vibeChips');
const genderChips = document.getElementById('genderChips');
const colorChips = document.getElementById('colorChips');

function getActiveFilters() {
  return {
    species: state.species,
    gender: state.gender,
    vibe: state.vibe,
    color: state.color,
  };
}

function getSelectionSummary() {
  const labels = [];
  if (state.species.size) labels.push(`種類: ${[...state.species].join('・')}`);
  if (state.gender.size) labels.push(`性別: ${[...state.gender].join('・')}`);
  if (state.vibe.size) labels.push(`雰囲気: ${[...state.vibe].join('・')}`);
  if (state.color.size) labels.push(`毛色: ${[...state.color].join('・')}`);

  if (labels.length === 0) {
    return 'まだ何も決定していません。気になる条件を選んでから診断してください。';
  }

  return `現在の入力: ${labels.join(' / ')}`;
}

function normalizeVibeParam(value) {
  if (!value) return null;
  const aliased = VIBE_URL_ALIASES[value] || value;
  return VIBE_OPTIONS.includes(aliased) ? aliased : null;
}

function applyPresetFromURL() {
  const params = new URLSearchParams(window.location.search);
  const species = params.getAll('species');
  const gender = params.getAll('gender');
  const vibeRaw = params.getAll('vibe');
  const color = params.getAll('color');

  species.forEach((v) => {
    if (v) state.species.add(v);
  });
  gender.forEach((v) => {
    if (v) state.gender.add(v);
  });
  vibeRaw.forEach((v) => {
    const n = normalizeVibeParam(v);
    if (n) state.vibe.add(n);
  });
  color.forEach((v) => {
    if (v) state.color.add(v);
  });

  return (
    species.some(Boolean) ||
    gender.some(Boolean) ||
    vibeRaw.some(Boolean) ||
    color.some(Boolean)
  );
}

function renderDiagnosisForm() {
  if (speciesGrid) {
    const grid = createSpeciesCards(SPECIES_OPTIONS, state.species, (value) => {
      if (state.species.has(value)) state.species.delete(value);
      else state.species.add(value);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
    });
    speciesGrid.replaceChildren(...grid.children);
  }

  if (vibeChips) {
    const chips = createChips(VIBE_OPTIONS, state.vibe, (value) => {
      if (state.vibe.has(value)) state.vibe.delete(value);
      else state.vibe.add(value);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
    });
    vibeChips.replaceChildren(...chips.children);
  }

  if (genderChips) {
    const chips = createChips(GENDER_OPTIONS, state.gender, (value) => {
      if (state.gender.has(value)) state.gender.delete(value);
      else state.gender.add(value);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
    });
    genderChips.replaceChildren(...chips.children);
  }

  if (colorChips) {
    const chips = createChips(COLOR_OPTIONS, state.color, (value) => {
      if (state.color.has(value)) state.color.delete(value);
      else state.color.add(value);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
    });
    colorChips.replaceChildren(...chips.children);
  }
}

function runDiagnosis({ smoothScroll = true } = {}) {
  if (!resultContainer) return;

  const activeFilters = getActiveFilters();
  state.results = getResults(allNames, activeFilters);
  state.visibleCount = INITIAL_RESULT_COUNT;

  if (resultCount) {
    resultCount.textContent = `${state.results.total}件の候補`;
  }

  renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore);

  if (resultSection) {
    resultSection.hidden = false;
  }

  if (smoothScroll && resultSection) {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleLoadMore() {
  if (!state.results || !resultContainer) return;
  state.visibleCount += LOAD_MORE_COUNT;
  renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore);
}

function extractRankNum(meaning) {
  if (!meaning) return Infinity;
  const m = meaning.match(/(\d+)位/);
  return m ? parseInt(m[1], 10) : Infinity;
}

function renderTrending(species) {
  if (!trendingList) return;
  const ranked = allNames
    .filter((n) => n.species.includes(species) && /\d+位/.test(n.meaning))
    .sort((a, b) => extractRankNum(a.meaning) - extractRankNum(b.meaning))
    .slice(0, 10);

  trendingList.replaceChildren();
  ranked.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'trending-item';
    const thumb = celebThumbByName.get(item.name);
    const thumbHtml = thumb
      ? `<span class="trending-item__thumb-wrap"><img class="trending-item__thumb" src="${thumb.url}" alt="" width="40" height="40" loading="lazy" decoding="async" /></span>`
      : '';
    const readingSub = secondaryReadingIfAny(item.name, item.reading);
    const readingHtml =
      readingSub != null ? `<span class="trending-item__reading">（${readingSub}）</span>` : '';
    li.innerHTML = `
      <span class="trending-item__rank">${i + 1}</span>
      ${thumbHtml}
      <span class="trending-item__name">${item.name}</span>
      ${readingHtml}
      <span class="trending-item__meaning">${item.meaning.replace(/\s*\d{4}年[^。\n]*?(\d+位)[^。\n]*/g, '').trim()}</span>
      <button type="button" class="trending-item__btn" data-species="${species}" data-name="${item.name}">この名前で絞る →</button>
    `;
    const thumbImg = li.querySelector('.trending-item__thumb');
    if (thumbImg && thumb) thumbImg.alt = thumb.alt;
    li.querySelector('.trending-item__btn').addEventListener('click', () => {
      state.species.add(species);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
      document.getElementById('diagnosisPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    trendingList.appendChild(li);
  });
}

/** meaning の冒頭「○○の愛犬／愛猫」から飼い主（有名人）側を抽出 */
function extractOwnerFromMeaning(meaning) {
  if (!meaning) return '';
  const m = meaning.match(/^([^。\n]+?)の愛[犬猫]/);
  return m ? m[1].trim() : '';
}

/** 折りたたみ1行目：種類 · 有名人／作品などの文脈 */
function formatCelebSummaryMeta(c, primarySpecies, owner) {
  const sp = primarySpecies || 'ペット';
  if (owner) {
    const petType = primarySpecies === '犬' ? '愛犬' : primarySpecies === '猫' ? '愛猫' : 'ペット';
    return `${sp} · ${owner}の${petType}`;
  }
  const raw = (c.meaning || '').split(/[。．]/)[0]?.trim() || '';
  const short = raw.length > 42 ? `${raw.slice(0, 42)}…` : raw;
  return `${sp} · ${short}`;
}

const SPECIES_ICON_MAP = { 犬: '🐕', 猫: '🐈', うさぎ: '🐇', ハムスター: '🐹', 鳥: '🐦' };

/** フリー素材で「その個体」と特定できる写真がないときの説明（代用品種写真は掲載しない） */
const CELEB_PHOTO_MISSING_NOTE =
  'Wikimedia Commons などで、当該ペットそのものを示す再利用可能な写真が見つかりませんでした。別の個体の写真を載せると誤解を招くため掲載していません。実際の様子は公式の発信や報道でご確認ください。';

async function loadCelebPets() {
  if (!celebGrid) return;
  try {
    const res = await fetch(new URL('../data/celebrity-pets.json', import.meta.url).href);
    if (!res.ok) return;
    const celebs = await res.json();
    celebThumbByName.clear();
    celebs.forEach((c) => {
      const u = safeWikimediaImageUrl(c.imageUrl);
      if (u && typeof c.name === 'string') {
        celebThumbByName.set(c.name, {
          url: u,
          alt: typeof c.imageAlt === 'string' ? c.imageAlt : c.name,
        });
      }
    });
    celebGrid.replaceChildren();
    celebs.forEach((c) => {
      const speciesArr = Array.isArray(c.species) ? c.species : [c.species];
      const primarySpecies = speciesArr[0] ?? '';
      const speciesIcon = SPECIES_ICON_MAP[primarySpecies] ?? '✨';
      const owner = extractOwnerFromMeaning(c.meaning);
      const imgUrl = safeWikimediaImageUrl(c.imageUrl);
      const summaryMeta = formatCelebSummaryMeta(c, primarySpecies, owner);

      const details = document.createElement('details');
      details.className = 'celeb-card';
      details.dataset.celebName = c.name;

      const summary = document.createElement('summary');
      summary.className = 'celeb-card__summary';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'celeb-card__species-icon';
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.textContent = speciesIcon;

      const summaryText = document.createElement('div');
      summaryText.className = 'celeb-card__summary-text';

      const h3 = document.createElement('h3');
      h3.className = 'celeb-card__name celeb-card__name--summary';
      h3.textContent = c.name;

      const meta = document.createElement('p');
      meta.className = 'celeb-card__summary-meta';
      meta.textContent = summaryMeta;

      summaryText.append(h3, meta);

      const chevron = document.createElement('span');
      chevron.className = 'celeb-card__chevron';
      chevron.setAttribute('aria-hidden', 'true');

      summary.append(iconSpan, summaryText, chevron);
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'celeb-card__body';

      if (imgUrl) {
        const figure = document.createElement('figure');
        figure.className = 'celeb-card__figure';
        const img = document.createElement('img');
        img.className = 'celeb-card__img';
        img.src = imgUrl;
        img.alt = typeof c.imageAlt === 'string' ? c.imageAlt : '';
        img.loading = 'lazy';
        img.decoding = 'async';
        figure.appendChild(img);
        if (typeof c.imageCredit === 'string' && c.imageCredit.trim()) {
          const cap = document.createElement('figcaption');
          cap.className = 'celeb-card__credit';
          cap.textContent = c.imageCredit;
          figure.appendChild(cap);
        }
        body.appendChild(figure);
      } else {
        const missing = document.createElement('div');
        missing.className = 'celeb-card__photo-missing';
        const bigIcon = document.createElement('div');
        bigIcon.className = 'celeb-card__photo-missing-icon';
        bigIcon.textContent = speciesIcon;
        const note = document.createElement('p');
        note.className = 'celeb-card__photo-missing-text';
        note.textContent = CELEB_PHOTO_MISSING_NOTE;
        missing.append(bigIcon, note);
        body.appendChild(missing);
      }

      const readSub = secondaryReadingIfAny(c.name, c.reading);
      if (readSub != null) {
        const readingEl = document.createElement('p');
        readingEl.className = 'celeb-card__reading celeb-card__reading--body';
        readingEl.textContent = `読み：${readSub}`;
        body.appendChild(readingEl);
      }

      if (owner) {
        const ownerP = document.createElement('p');
        ownerP.className = 'celeb-card__owner';
        ownerP.textContent = `${owner}のペット`;
        body.appendChild(ownerP);
      }

      const note = document.createElement('p');
      note.className = 'celeb-card__note';
      note.textContent = c.meaning;
      body.appendChild(note);

      const vibes = document.createElement('div');
      vibes.className = 'celeb-card__vibes';
      (c.vibe ?? []).forEach((v) => {
        const span = document.createElement('span');
        span.className = 'celeb-card__vibe';
        span.textContent = v;
        vibes.appendChild(span);
      });
      body.appendChild(vibes);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'celeb-card__btn';
      btn.textContent = '似た名前を探す →';
      const validSpecies = ['犬', '猫', 'うさぎ', 'ハムスター', '鳥'];
      const targetSpecies = validSpecies.find((s) => speciesArr.includes(s));
      if (targetSpecies) {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          state.species.add(targetSpecies);
          (c.vibe ?? []).forEach((v) => state.vibe.add(v));
          renderDiagnosisForm();
          if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
          document.getElementById('stepSpecies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else {
        btn.style.display = 'none';
      }
      body.appendChild(btn);
      details.appendChild(body);
      celebGrid.appendChild(details);
    });
  } catch (e) {
    console.error('celebrity-pets', e);
  }
}

async function bootstrap() {
  try {
    const response = await fetch(new URL('../data/names.json', import.meta.url).href);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allNames = await response.json();
  } catch (e) {
    console.error('names-json', e);
    allNames = [];
  }

  // 有名人ペット名鑑（初期は畳む）。名鑑 JSON を先に読み、ランキング行のサムネに使う
  syncCelebPanelVisibility();
  await loadCelebPets();
  document.getElementById('celebRevealBtn')?.addEventListener('click', revealCelebPanel);
  document.getElementById('celebListClose')?.addEventListener('click', () => {
    celebPanelRevealed = false;
    syncCelebPanelVisibility();
    document.getElementById('celebHeading')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  // トレンドランキング：スマホは未選択・一覧なしから開始（犬が選ばれているように見えない）
  if (MOBILE_TRENDING_MQ.matches) {
    trendingList?.replaceChildren();
    clearTrendingTabSelection();
  } else {
    renderTrending('犬');
    const dogTab = document.querySelector('.trending-tab[data-species="犬"]');
    if (dogTab) setTrendingTabActive(dogTab);
  }
  syncTrendingListVisibility();
  MOBILE_TRENDING_MQ.addEventListener('change', syncTrendingListVisibility);
  let trendingResizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(trendingResizeTimer);
    trendingResizeTimer = window.setTimeout(syncTrendingListVisibility, 120);
  });
  trendingTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      revealTrendingRanking();
      setTrendingTabActive(tab);
      renderTrending(tab.dataset.species);
    });
  });

  document.getElementById('trendingListClose')?.addEventListener('click', () => {
    trendingRankingRevealed = false;
    syncTrendingListVisibility();
    document.getElementById('trendingHeading')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  const hasPreset = applyPresetFromURL();
  renderDiagnosisForm();
  if (selectionSummary) selectionSummary.textContent = getSelectionSummary();

  btnDiagnose?.addEventListener('click', () => {
    runDiagnosis();
  });

  btnRetry?.addEventListener('click', () => {
    document.getElementById('diagnosisPanel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  faqToggle?.addEventListener('click', () => {
    document.getElementById('faqSection')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  if (hasPreset) {
    runDiagnosis({ smoothScroll: false });
  }
}

bootstrap();
