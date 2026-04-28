import './styles/global.css';
import './landing-effects.js';
import {
  CALL_STYLE_OPTIONS,
  COLOR_OPTIONS,
  FILTER_SUMMARY_LABELS,
  GENDER_OPTIONS,
  INITIAL_RESULT_COUNT,
  LOAD_MORE_COUNT,
  LENGTH_OPTIONS,
  OWNER_LIFESTYLE_OPTIONS,
  OVERFLOW_LIST_PAGE_SIZE,
  SCENE_OPTIONS,
  SPECIES_OPTIONS,
  THEME_OPTIONS,
  UNIQUENESS_OPTIONS,
  VIBE_OPTIONS,
  VIBE_URL_ALIASES,
  WISH_OPTIONS,
} from './constants.js';
import { getResults } from './diagnosis.js';
import { enrichNamesDatabase } from './name-enrichment.js';
import { diagnoseSurnameFit } from './surname-diagnosis.js';
import {
  createChips,
  createNameStoryPanel,
  createNameCard,
  createSpeciesCards,
  renderResults,
} from './render.js';
import { secondaryReadingIfAny } from './reading-display.js';
import {
  favoriteKeyForItem,
  getFavoriteRecords,
  getPlatformSnapshot,
  initPlatform,
  openAuthPanel,
  subscribePlatform,
  toggleFavorite,
} from './auth.js';

const state = {
  species: new Set(),
  gender: new Set(),
  vibe: new Set(),
  color: new Set(),
  length: new Set(),
  theme: new Set(),
  callStyle: new Set(),
  ownerLifestyle: new Set(),
  wish: new Set(),
  uniqueness: new Set(),
  scene: new Set(),
  visibleCount: INITIAL_RESULT_COUNT,
  results: null,
  overflowListPage: 0,
  diagnosisSeed: 0,
  selectedResultKey: null,
  surname: '',
  surnameReading: '',
};

let allNames = [];
let platformSnapshot = getPlatformSnapshot();

/** 名鑑 JSON の名前 → 画像（ランキング行のサムネ用） */
const celebThumbByName = new Map();

const trendingList = document.getElementById('trendingList');
const trendingStoryHost = document.getElementById('trendingStoryHost');
const trendingSection = document.getElementById('trendingSection');
const trendingTabs = document.querySelectorAll('.trending-tab');
const celebGrid = document.getElementById('celebGrid');
const celebSection = document.getElementById('celebSection');
const celebSearchInput = document.getElementById('celebSearchInput');
const celebEntityTypeSelect = document.getElementById('celebEntityTypeSelect');
const celebOwnerCategorySelect = document.getElementById('celebOwnerCategorySelect');
const celebSpeciesSelect = document.getElementById('celebSpeciesSelect');
const celebBreedSelect = document.getElementById('celebBreedSelect');
const celebResultCount = document.getElementById('celebResultCount');

/** ペット名鑑は初期は畳み、足跡ボタンで展開 */
let celebPanelRevealed = false;
let celebEntries = [];
const celebFilters = {
  search: '',
  entityType: '',
  ownerCategory: '',
  species: '',
  breed: '',
};

/** 名鑑画像：Wikimedia / Unsplash / Pexels の https のみ（静的 JSON・改ざん防止用） */
const CELEB_IMAGE_HOSTS = new Set([
  'upload.wikimedia.org',
  'images.unsplash.com',
  'images.pexels.com',
]);

const CELEB_ENTITY_TYPE_LABELS = {
  celebrity: '有名人のペット',
  'famous-pet': '話題の有名ペット',
  character: '映画・物語で愛された子',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeCelebImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:') return null;
    if (!CELEB_IMAGE_HOSTS.has(u.hostname.toLowerCase())) return null;
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

/** ランキング一覧は初期は畳み、詳細ボタンで展開（全画面幅共通） */
let trendingRankingRevealed = false;

function syncTrendingListVisibility() {
  if (!trendingSection) return;
  const panel = document.getElementById('trendingListPanel');
  const revealBtn = document.getElementById('trendingRevealBtn');
  if (trendingRankingRevealed) {
    trendingSection.classList.add('trending-section--list-revealed');
    panel?.removeAttribute('aria-hidden');
    revealBtn?.setAttribute('aria-expanded', 'true');
  } else {
    trendingSection.classList.remove('trending-section--list-revealed');
    panel?.setAttribute('aria-hidden', 'true');
    revealBtn?.setAttribute('aria-expanded', 'false');
  }
}

function revealTrendingRanking() {
  let tab = document.querySelector('.trending-tab.is-active');
  if (!tab) {
    tab = document.querySelector('.trending-tab[data-species="犬"]');
    if (tab) {
      setTrendingTabActive(tab);
      renderTrending('犬');
    }
  } else {
    renderTrending(tab.dataset.species);
  }
  trendingRankingRevealed = true;
  syncTrendingListVisibility();
  document.getElementById('trendingListPanel')?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
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

const selectionSummary = document.getElementById('selectionSummary');
const btnDiagnose = document.getElementById('btnDiagnose');
const resultSection = document.getElementById('resultSection');
const resultCount = document.getElementById('resultCount');
const resultContainer = document.getElementById('resultContainer');
const btnRetry = document.getElementById('btnRetry');
const surnameCheckerSection = document.getElementById('surnameCheckerSection');
const surnameInput = document.getElementById('surnameInput');
const surnameReadingInput = document.getElementById('surnameReadingInput');
const surnameCheckerSelectedName = document.getElementById('surnameCheckerSelectedName');
const surnameCheckerSelectedReading = document.getElementById('surnameCheckerSelectedReading');
const surnameCheckerPreview = document.getElementById('surnameCheckerPreview');
const surnameCheckerPreviewReading = document.getElementById('surnameCheckerPreviewReading');
const surnameCheckerSummary = document.getElementById('surnameCheckerSummary');
const surnameCheckerBadgeScore = document.getElementById('surnameCheckerBadgeScore');
const surnameCheckerBadgeLabel = document.getElementById('surnameCheckerBadgeLabel');
const surnameCheckerInsights = document.getElementById('surnameCheckerInsights');
const surnameCheckerNote = document.getElementById('surnameCheckerNote');
const faqToggle = document.getElementById('faqToggle');
const savedFavoritesSection = document.getElementById('savedFavoritesSection');
const savedFavoritesSummary = document.getElementById('savedFavoritesSummary');
const savedFavoritesContainer = document.getElementById('savedFavoritesContainer');

const speciesGrid = document.getElementById('speciesGrid');
const vibeChips = document.getElementById('vibeChips');
const genderChips = document.getElementById('genderChips');
const colorChips = document.getElementById('colorChips');
const lengthChips = document.getElementById('lengthChips');
const themeChips = document.getElementById('themeChips');
const callStyleChips = document.getElementById('callStyleChips');
const ownerLifestyleChips = document.getElementById('ownerLifestyleChips');
const wishChips = document.getElementById('wishChips');
const uniquenessChips = document.getElementById('uniquenessChips');
const sceneChips = document.getElementById('sceneChips');

const SURNAME_STORAGE_KEY = 'sippomi.ownerSurname';
const SURNAME_READING_STORAGE_KEY = 'sippomi.ownerSurnameReading';

const FILTER_CHIP_GROUPS = [
  { key: 'vibe', element: vibeChips, options: VIBE_OPTIONS },
  { key: 'gender', element: genderChips, options: GENDER_OPTIONS },
  { key: 'color', element: colorChips, options: COLOR_OPTIONS },
  { key: 'length', element: lengthChips, options: LENGTH_OPTIONS },
  { key: 'theme', element: themeChips, options: THEME_OPTIONS },
  { key: 'callStyle', element: callStyleChips, options: CALL_STYLE_OPTIONS },
  { key: 'ownerLifestyle', element: ownerLifestyleChips, options: OWNER_LIFESTYLE_OPTIONS },
  { key: 'wish', element: wishChips, options: WISH_OPTIONS },
  { key: 'uniqueness', element: uniquenessChips, options: UNIQUENESS_OPTIONS },
  { key: 'scene', element: sceneChips, options: SCENE_OPTIONS },
];

function getActiveFilters() {
  return {
    species: state.species,
    gender: state.gender,
    vibe: state.vibe,
    color: state.color,
    length: state.length,
    theme: state.theme,
    callStyle: state.callStyle,
    ownerLifestyle: state.ownerLifestyle,
    wish: state.wish,
    uniqueness: state.uniqueness,
    scene: state.scene,
  };
}

function getSelectionSummary() {
  const labels = Object.entries(FILTER_SUMMARY_LABELS)
    .filter(([key]) => state[key]?.size)
    .map(([key, label]) => `${label}: ${[...state[key]].join('・')}`);

  if (labels.length === 0) {
    return 'まだ質問に答えていません。シッポミの10問で、この子らしさと飼い主さんの好みを少しずつ深めていきましょう。';
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
  const length = params.getAll('length');
  const theme = params.getAll('theme');

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
  length.forEach((v) => {
    if (v) state.length.add(v);
  });
  theme.forEach((v) => {
    if (v) state.theme.add(v);
  });

  return (
    species.some(Boolean) ||
    gender.some(Boolean) ||
    vibeRaw.some(Boolean) ||
    color.some(Boolean) ||
    length.some(Boolean) ||
    theme.some(Boolean)
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

  FILTER_CHIP_GROUPS.forEach(({ key, element, options }) => {
    if (!element) return;
    const chips = createChips(options, state[key], (value) => {
      if (state[key].has(value)) state[key].delete(value);
      else state[key].add(value);
      renderDiagnosisForm();
      if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
    });
    element.replaceChildren(...chips.children);
  });
}

function getItemByKey(key) {
  if (!key) return null;
  const favoriteRecords = getFavoriteRecords();
  return favoriteRecords.find((item) => favoriteKeyForItem(item) === key)
    || state.results?.items?.find((item) => favoriteKeyForItem(item) === key)
    || null;
}

function createSurnameInsightCard({ title, score, body }) {
  const card = document.createElement('article');
  card.className = 'surname-checker__insight';

  const heading = document.createElement('div');
  heading.className = 'surname-checker__insight-head';

  const titleEl = document.createElement('h3');
  titleEl.className = 'surname-checker__insight-title';
  titleEl.textContent = title;

  const scoreEl = document.createElement('p');
  scoreEl.className = 'surname-checker__insight-score';
  scoreEl.textContent = typeof score === 'number' ? `${score}%` : String(score);

  const bodyEl = document.createElement('p');
  bodyEl.className = 'surname-checker__insight-body';
  bodyEl.textContent = body;

  heading.append(titleEl, scoreEl);
  card.append(heading, bodyEl);
  return card;
}

function persistSurnameInputs() {
  try {
    window.localStorage.setItem(SURNAME_STORAGE_KEY, state.surname);
    window.localStorage.setItem(SURNAME_READING_STORAGE_KEY, state.surnameReading);
  } catch {
    // ignore storage failures
  }
}

function renderSurnameChecker({ scroll = false } = {}) {
  if (!surnameCheckerSection) return;

  const selectedItem = getItemByKey(state.selectedResultKey);
  if (!selectedItem) {
    surnameCheckerSection.hidden = true;
    return;
  }

  const diagnosis = diagnoseSurnameFit({
    surname: state.surname,
    surnameReading: state.surnameReading,
    petName: selectedItem.name,
    petReading: selectedItem.reading,
  });

  surnameCheckerSection.hidden = false;
  if (surnameCheckerSelectedName) surnameCheckerSelectedName.textContent = selectedItem.name;
  if (surnameCheckerSelectedReading) {
    const reading = secondaryReadingIfAny(selectedItem.name, selectedItem.reading);
    surnameCheckerSelectedReading.textContent = reading ? `読み: ${reading}` : '';
  }

  const hasSurname = Boolean(state.surname);
  if (!hasSurname) {
    if (surnameCheckerPreview) surnameCheckerPreview.textContent = selectedItem.name;
    if (surnameCheckerPreviewReading) {
      const reading = secondaryReadingIfAny(selectedItem.name, selectedItem.reading);
      surnameCheckerPreviewReading.textContent = reading ? `よみ: ${reading}` : '';
    }
    if (surnameCheckerSummary) {
      surnameCheckerSummary.textContent = '飼い主さんの苗字を入れると、呼びやすさ・長さのバランス・見た目のまとまりをまとめて見られます。';
    }
    if (surnameCheckerBadgeScore) surnameCheckerBadgeScore.textContent = '--';
    if (surnameCheckerBadgeLabel) surnameCheckerBadgeLabel.textContent = '苗字を入れて開始';
    if (surnameCheckerNote) {
      surnameCheckerNote.textContent = '苗字のふりがなも入れると、呼んだときの音のつながりまで診断できます。';
    }
    surnameCheckerInsights?.replaceChildren(
      ...[
        {
          title: '呼びやすさ',
          score: '--',
          body: '呼びかけたときの音の切れ目や、やさしく伸びる響きを見ます。',
        },
        {
          title: '長さのバランス',
          score: '--',
          body: '苗字と名前の長さ差が大きすぎないかを確かめます。',
        },
        {
          title: '見た目のまとまり',
          score: '--',
          body: '名札やSNSで並んだときに、文字の収まりが自然かを見ます。',
        },
        {
          title: '診断の信頼度',
          score: '--',
          body: '一般的な苗字データや入力されたふりがなと照らし合わせて、診断の確からしさを表示します。',
        },
      ].map((hint) => createSurnameInsightCard(hint)),
    );
    if (scroll) {
      surnameCheckerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  if (!diagnosis) {
    if (surnameCheckerPreview) surnameCheckerPreview.textContent = 'まずは気になる名前を選んでください';
    if (surnameCheckerPreviewReading) surnameCheckerPreviewReading.textContent = '';
    if (surnameCheckerSummary) surnameCheckerSummary.textContent = '診断結果から名前をひとつ選ぶと、苗字との相性をここで確認できます。';
    if (surnameCheckerBadgeScore) surnameCheckerBadgeScore.textContent = '--';
    if (surnameCheckerBadgeLabel) surnameCheckerBadgeLabel.textContent = '準備中';
    surnameCheckerInsights?.replaceChildren();
    return;
  }

  if (surnameCheckerPreview) surnameCheckerPreview.textContent = diagnosis.preview;
  if (surnameCheckerPreviewReading) {
    surnameCheckerPreviewReading.textContent = diagnosis.previewReading ? `よみ: ${diagnosis.previewReading}` : '';
  }
  if (surnameCheckerSummary) surnameCheckerSummary.textContent = diagnosis.summary;
  if (surnameCheckerBadgeScore) surnameCheckerBadgeScore.textContent = `${diagnosis.totalScore}`;
  if (surnameCheckerBadgeLabel) surnameCheckerBadgeLabel.textContent = diagnosis.label;
  if (surnameCheckerNote) {
    surnameCheckerNote.textContent = diagnosis.note || '苗字のふりがながあると、呼びやすさの診断がより正確になります。';
  }
  surnameCheckerInsights?.replaceChildren(
    ...diagnosis.hints.map((hint) => createSurnameInsightCard(hint)),
  );

  if (scroll) {
    surnameCheckerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleSurnameInputChange() {
  state.surname = surnameInput?.value.trim() || '';
  state.surnameReading = surnameReadingInput?.value.trim() || '';
  persistSurnameInputs();
  renderSurnameChecker();
}

function setSelectedNameForSurname(item, { scroll = false } = {}) {
  if (!item) return;
  state.selectedResultKey = favoriteKeyForItem(item);
  renderSurnameChecker({ scroll });
}

function getResultRenderOptions() {
  return {
    onToggleFavorite: handleFavoriteToggle,
    onSelectionChange: (item) => {
      setSelectedNameForSurname(item);
    },
    onCheckSurname: (item) => {
      setSelectedNameForSurname(item, { scroll: true });
    },
    savedKeys: platformSnapshot.savedKeys,
    favoriteKeyForItem,
    selectedKey: state.selectedResultKey,
    onShowAll: handleShowAll,
    overflowListPage: state.overflowListPage,
    overflowListPageSize: OVERFLOW_LIST_PAGE_SIZE,
    onOverflowListPageChange: (nextPage) => {
      state.overflowListPage = Math.max(0, nextPage);
      if (state.results && resultContainer) {
        renderResults(
          resultContainer,
          state.results,
          state.visibleCount,
          handleLoadMore,
          getResultRenderOptions(),
        );
      }
    },
  };
}

function runDiagnosis({ smoothScroll = true } = {}) {
  if (!resultContainer) return;

  document.body.classList.remove('results-showall');
  state.overflowListPage = 0;
  state.diagnosisSeed += 1;
  state.selectedResultKey = null;

  const activeFilters = getActiveFilters();
  state.results = getResults(allNames, activeFilters, { seed: state.diagnosisSeed });
  state.visibleCount = INITIAL_RESULT_COUNT;

  if (resultCount) {
    resultCount.textContent = `${state.results.total}件の候補`;
  }

  renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore, getResultRenderOptions());

  if (resultSection) {
    resultSection.hidden = false;
  }

  if (smoothScroll && resultSection) {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleLoadMore() {
  if (!state.results || !resultContainer) return;
  document.body.classList.remove('results-showall');
  state.visibleCount += LOAD_MORE_COUNT;
  state.overflowListPage = 0;
  renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore, getResultRenderOptions());
}

function handleShowAll() {
  if (!state.results || !resultContainer) return;
  document.body.classList.add('results-showall');
  state.visibleCount = state.results.items.length;
  state.overflowListPage = 0;
  renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore, getResultRenderOptions());

  // モバイルで「全画面っぽく」見せるため、折りたたみ一覧は最初から開く
  const overflow = resultContainer.querySelector('.result-wordcloud-overflow');
  if (overflow && overflow.tagName === 'DETAILS') {
    overflow.open = true;
  }
}

async function handleFavoriteToggle(item) {
  const result = await toggleFavorite(item);
  if (result.reason === 'login_required' || result.reason === 'turnstile_required') {
    openAuthPanel();
  }

  if (state.results && resultContainer) {
    renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore, getResultRenderOptions());
  }
  renderSavedFavorites();
  renderSurnameChecker();
}

function renderSavedFavorites() {
  if (!savedFavoritesContainer || !savedFavoritesSection || !savedFavoritesSummary) return;

  const favorites = getFavoriteRecords();
  if (!platformSnapshot.hasSupabaseAuth) {
    savedFavoritesSection.hidden = true;
    return;
  }

  if (!platformSnapshot.isLoggedIn) {
    savedFavoritesSection.hidden = false;
    savedFavoritesSummary.textContent = 'ログインすると、保存した名前をここに一覧表示できます。';
    savedFavoritesContainer.replaceChildren();
    return;
  }

  savedFavoritesSection.hidden = false;
  if (favorites.length === 0) {
    savedFavoritesSummary.textContent = 'まだ保存された名前はありません。結果カードの「保存」から追加できます。';
    const empty = document.createElement('p');
    empty.className = 'result-empty';
    empty.textContent = 'お気に入りに保存した名前がまだありません。';
    savedFavoritesContainer.replaceChildren(empty);
    return;
  }

  savedFavoritesSummary.textContent = `${favorites.length}件のお気に入りを保存しています。`;
  savedFavoritesContainer.replaceChildren(
    ...favorites.map((item) => createNameCard(item, {
      onToggleFavorite: handleFavoriteToggle,
      onCheckSurname: (target) => {
        setSelectedNameForSurname(target, { scroll: true });
      },
      isFavorite: true,
    })),
  );
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
      ? `<span class="trending-item__thumb-wrap"><img class="trending-item__thumb" src="${escapeHtml(thumb.url)}" alt="" width="40" height="40" loading="lazy" decoding="async" /></span>`
      : '';
    const readingSub = secondaryReadingIfAny(item.name, item.reading);
    const readingHtml =
      readingSub != null ? `<span class="trending-item__reading">（${escapeHtml(readingSub)}）</span>` : '';
    const meaningCleaned = String(item.meaning ?? '')
      .replace(/\s*\d{4}年[^。\n]*?(\d+位)[^。\n]*/g, '')
      .trim();
    li.innerHTML = `
      <span class="trending-item__rank">${i + 1}</span>
      ${thumbHtml}
      <span class="trending-item__name">${escapeHtml(item.name)}</span>
      ${readingHtml}
      <span class="trending-item__meaning">${escapeHtml(meaningCleaned)}</span>
      <button type="button" class="trending-item__btn" data-species="${escapeHtml(species)}" data-name="${escapeHtml(item.name)}">由来を詳しく見る →</button>
    `;
    const thumbImg = li.querySelector('.trending-item__thumb');
    if (thumbImg && thumb) thumbImg.alt = thumb.alt;
    li.querySelector('.trending-item__btn').addEventListener('click', () => {
      const storyPanel = createNameStoryPanel(item, {
        onToggleFavorite: handleFavoriteToggle,
        onCheckSurname: (target) => {
          setSelectedNameForSurname(target, { scroll: true });
        },
        savedKeys: platformSnapshot.savedKeys,
        favoriteKeyForItem,
        isFavorite: platformSnapshot.savedKeys?.has?.(favoriteKeyForItem(item) || '') || false,
      });
      trendingStoryHost?.replaceChildren(storyPanel);
      trendingStoryHost?.removeAttribute('hidden');
      trendingStoryHost?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    trendingList.appendChild(li);
  });
}

const SPECIES_ICON_MAP = { 犬: '犬', 猫: '猫', うさぎ: '兎', ハムスター: '小', 鳥: '鳥' };
function normalizeCelebRecord(raw) {
  const speciesArr = Array.isArray(raw.species) ? raw.species.filter(Boolean) : [raw.species].filter(Boolean);
  return {
    ...raw,
    species: speciesArr,
    petSpecies: raw.petSpecies || speciesArr[0] || '',
    imageUrl: safeCelebImageUrl(raw.imageUrl),
    ownerImageUrl: safeCelebImageUrl(raw.ownerImageUrl),
    ownerName: raw.ownerName || '',
    ownerCategory: raw.ownerCategory || '',
    ownerWork: raw.ownerWork || '',
    breed: raw.breed || '',
    entityType: raw.entityType || 'celebrity',
    summary: raw.summary || raw.meaning || '',
    story: raw.story || '',
    namingHint: raw.namingHint || '',
    tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],
    vibe: Array.isArray(raw.vibe) ? raw.vibe.filter(Boolean) : [],
  };
}

function optionValues(entries, key, mapFn = (value) => value) {
  return [...new Set(entries.map((entry) => mapFn(entry[key])).flat().filter(Boolean))];
}

function fillSelect(selectEl, values, labelMap = null) {
  if (!selectEl) return;
  const current = selectEl.value;
  selectEl.innerHTML = '<option value="">すべて</option>';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labelMap?.[value] || value;
    selectEl.appendChild(option);
  });
  if (values.includes(current)) {
    selectEl.value = current;
  }
}

function syncCelebFilterOptions(entries) {
  fillSelect(
    celebEntityTypeSelect,
    optionValues(entries, 'entityType'),
    CELEB_ENTITY_TYPE_LABELS,
  );
  fillSelect(celebOwnerCategorySelect, optionValues(entries, 'ownerCategory'));
  fillSelect(celebSpeciesSelect, optionValues(entries, 'petSpecies'));

  const breedSource = celebFilters.species
    ? entries.filter((entry) => entry.petSpecies === celebFilters.species)
    : entries;
  fillSelect(celebBreedSelect, optionValues(breedSource, 'breed'));
}

function normalizeSearch(value = '') {
  return String(value).trim().toLowerCase();
}

function matchesCelebFilters(entry) {
  if (celebFilters.entityType && entry.entityType !== celebFilters.entityType) return false;
  if (celebFilters.ownerCategory && entry.ownerCategory !== celebFilters.ownerCategory) return false;
  if (celebFilters.species && entry.petSpecies !== celebFilters.species) return false;
  if (celebFilters.breed && entry.breed !== celebFilters.breed) return false;

  const q = normalizeSearch(celebFilters.search);
  if (!q) return true;

  const haystack = [
    entry.name,
    entry.reading,
    entry.ownerName,
    entry.ownerCategory,
    entry.ownerWork,
    entry.breed,
    entry.summary,
    entry.story,
    ...(entry.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

function formatCelebSummaryMeta(entry) {
  const bits = [
    entry.petSpecies || 'ペット',
    CELEB_ENTITY_TYPE_LABELS[entry.entityType] || entry.entityType,
    entry.ownerCategory || null,
  ].filter(Boolean);
  return bits.join(' · ');
}

function createCelebMedia(entry, speciesIcon) {
  const media = document.createElement('div');
  media.className = 'celeb-card__media';

  const petFigure = document.createElement('figure');
  petFigure.className = 'celeb-card__figure';
  const petImg = document.createElement('img');
  petImg.className = 'celeb-card__img';
  petImg.src = entry.imageUrl;
  petImg.alt = typeof entry.imageAlt === 'string' ? entry.imageAlt : `${entry.name}の写真`;
  petImg.loading = 'lazy';
  petImg.decoding = 'async';
  petFigure.appendChild(petImg);
  if (typeof entry.imageCredit === 'string' && entry.imageCredit.trim()) {
    const cap = document.createElement('figcaption');
    cap.className = 'celeb-card__credit';
    cap.textContent = entry.imageCredit;
    petFigure.appendChild(cap);
  }
  media.appendChild(petFigure);

  const ownerCard = document.createElement('div');
  ownerCard.className = 'celeb-card__owner-card';
  if (entry.ownerImageUrl) {
    const ownerImg = document.createElement('img');
    ownerImg.className = 'celeb-card__owner-avatar';
    ownerImg.src = entry.ownerImageUrl;
    ownerImg.alt = entry.ownerImageAlt || `${entry.ownerName}の写真`;
    ownerImg.loading = 'lazy';
    ownerImg.decoding = 'async';
    ownerCard.appendChild(ownerImg);
  } else {
    const ownerFallback = document.createElement('div');
    ownerFallback.className = 'celeb-card__owner-fallback';
    ownerFallback.textContent = speciesIcon;
    ownerCard.appendChild(ownerFallback);
  }

  const ownerLabel = document.createElement('p');
  ownerLabel.className = 'celeb-card__owner-card-label';
  ownerLabel.textContent = 'Owner';
  const ownerName = document.createElement('p');
  ownerName.className = 'celeb-card__owner-card-name';
  ownerName.textContent = entry.ownerName;
  const ownerWork = document.createElement('p');
  ownerWork.className = 'celeb-card__owner-card-work';
  ownerWork.textContent = entry.ownerWork;
  ownerCard.append(ownerLabel, ownerName, ownerWork);
  media.appendChild(ownerCard);

  return media;
}

function renderCelebGrid(entries) {
  if (!celebGrid) return;
  celebGrid.replaceChildren();

  if (celebResultCount) {
    celebResultCount.textContent = `${entries.length}件の名鑑を表示中`;
  }

  if (entries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'celeb-empty';
    empty.textContent = '条件に合う子がまだ見つかりませんでした。検索語や犬種・飼い主の属性を少し広げてみてください。';
    celebGrid.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const speciesIcon = SPECIES_ICON_MAP[entry.petSpecies] ?? '名';
    const details = document.createElement('details');
    details.className = 'celeb-card';
    details.dataset.celebName = entry.name;

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
    h3.textContent = entry.name;

    const meta = document.createElement('p');
    meta.className = 'celeb-card__summary-meta';
    meta.textContent = formatCelebSummaryMeta(entry);

    summaryText.append(h3, meta);

    const chevron = document.createElement('span');
    chevron.className = 'celeb-card__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    summary.append(iconSpan, summaryText, chevron);
    details.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'celeb-card__body';
    body.appendChild(createCelebMedia(entry, speciesIcon));

    const readSub = secondaryReadingIfAny(entry.name, entry.reading);
    if (readSub != null) {
      const readingEl = document.createElement('p');
      readingEl.className = 'celeb-card__reading celeb-card__reading--body';
      readingEl.textContent = `読み：${readSub}`;
      body.appendChild(readingEl);
    }

    const ownerP = document.createElement('p');
    ownerP.className = 'celeb-card__owner';
    ownerP.textContent = `${entry.ownerName} · ${entry.ownerCategory}`;
    body.appendChild(ownerP);

    const breedMeta = document.createElement('p');
    breedMeta.className = 'celeb-card__breed';
    breedMeta.textContent = `${entry.petSpecies} / ${entry.breed}`;
    body.appendChild(breedMeta);

    const summaryP = document.createElement('p');
    summaryP.className = 'celeb-card__note';
    summaryP.textContent = entry.summary;
    body.appendChild(summaryP);

    const storyP = document.createElement('p');
    storyP.className = 'celeb-card__story';
    storyP.textContent = entry.story;
    body.appendChild(storyP);

    const hintP = document.createElement('p');
    hintP.className = 'celeb-card__hint';
    hintP.textContent = `名づけのヒント: ${entry.namingHint}`;
    body.appendChild(hintP);

    const vibes = document.createElement('div');
    vibes.className = 'celeb-card__vibes';
    [...(entry.tags || []), ...(entry.vibe || [])].slice(0, 5).forEach((value) => {
      const span = document.createElement('span');
      span.className = 'celeb-card__vibe';
      span.textContent = value;
      vibes.appendChild(span);
    });
    body.appendChild(vibes);

    const actions = document.createElement('div');
    actions.className = 'celeb-card__actions';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'celeb-card__btn';
    btn.textContent = '似た名前を診断する →';
    const validSpecies = ['犬', '猫', 'うさぎ', 'ハムスター', '鳥'];
    const targetSpecies = validSpecies.find((value) => entry.species.includes(value));
    if (targetSpecies) {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.species.add(targetSpecies);
        (entry.vibe ?? []).forEach((value) => state.vibe.add(value));
        renderDiagnosisForm();
        if (selectionSummary) selectionSummary.textContent = getSelectionSummary();
        document.getElementById('stepSpecies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      btn.disabled = true;
    }
    actions.appendChild(btn);

    if (entry.sourceUrl) {
      const sourceLink = document.createElement('a');
      sourceLink.className = 'celeb-card__source';
      sourceLink.href = entry.sourceUrl;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = '出典を見る';
      actions.appendChild(sourceLink);
    }

    body.appendChild(actions);
    details.appendChild(body);
    celebGrid.appendChild(details);
  });
}

function renderCelebDirectory() {
  syncCelebFilterOptions(celebEntries);
  renderCelebGrid(celebEntries.filter(matchesCelebFilters));
}

function bindCelebFilters() {
  celebSearchInput?.addEventListener('input', () => {
    celebFilters.search = celebSearchInput.value;
    renderCelebDirectory();
  });
  celebEntityTypeSelect?.addEventListener('change', () => {
    celebFilters.entityType = celebEntityTypeSelect.value;
    renderCelebDirectory();
  });
  celebOwnerCategorySelect?.addEventListener('change', () => {
    celebFilters.ownerCategory = celebOwnerCategorySelect.value;
    renderCelebDirectory();
  });
  celebSpeciesSelect?.addEventListener('change', () => {
    celebFilters.species = celebSpeciesSelect.value;
    if (celebFilters.breed) {
      const breedStillVisible = celebEntries.some((entry) => matchesCelebFilters({
        ...entry,
        breed: celebFilters.breed,
      }));
      if (!breedStillVisible) {
        celebFilters.breed = '';
        if (celebBreedSelect) celebBreedSelect.value = '';
      }
    }
    renderCelebDirectory();
  });
  celebBreedSelect?.addEventListener('change', () => {
    celebFilters.breed = celebBreedSelect.value;
    renderCelebDirectory();
  });
}

async function loadCelebPets() {
  if (!celebGrid) return;
  try {
    const res = await fetch(new URL('../data/celebrity-pets.json', import.meta.url).href);
    if (!res.ok) return;
    const celebs = (await res.json()).map(normalizeCelebRecord);
    celebEntries = celebs;
    celebThumbByName.clear();
    celebs.forEach((entry) => {
      if (entry.imageUrl && typeof entry.name === 'string') {
        celebThumbByName.set(entry.name, {
          url: entry.imageUrl,
          alt: typeof entry.imageAlt === 'string' ? entry.imageAlt : entry.name,
        });
      }
    });
    renderCelebDirectory();
  } catch (e) {
    console.error('celebrity-pets', e);
  }
}

async function bootstrap() {
  try {
    state.surname = window.localStorage.getItem(SURNAME_STORAGE_KEY) || '';
    state.surnameReading = window.localStorage.getItem(SURNAME_READING_STORAGE_KEY) || '';
  } catch {
    state.surname = '';
    state.surnameReading = '';
  }

  if (surnameInput) surnameInput.value = state.surname;
  if (surnameReadingInput) surnameReadingInput.value = state.surnameReading;
  surnameInput?.addEventListener('input', handleSurnameInputChange);
  surnameReadingInput?.addEventListener('input', handleSurnameInputChange);

  subscribePlatform((snapshot) => {
    platformSnapshot = snapshot;
    renderSavedFavorites();
    if (state.results && resultContainer) {
      renderResults(resultContainer, state.results, state.visibleCount, handleLoadMore, getResultRenderOptions());
    }
    renderSurnameChecker();
  });

  await initPlatform();
  bindCelebFilters();

  try {
    const response = await fetch(new URL('../data/names.json', import.meta.url).href);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allNames = enrichNamesDatabase(await response.json());
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

  // トレンドランキング：一覧は畳み。犬タブを初期選択してリストだけ先に描画（開く操作は別）
  trendingRankingRevealed = false;
  const dogTabInit = document.querySelector('.trending-tab[data-species="犬"]');
  if (dogTabInit) {
    setTrendingTabActive(dogTabInit);
    renderTrending('犬');
  } else {
    trendingList?.replaceChildren();
    clearTrendingTabSelection();
  }
  syncTrendingListVisibility();
  document.getElementById('trendingRevealBtn')?.addEventListener('click', revealTrendingRanking);
  trendingTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
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
    document.body.classList.remove('results-showall');
    state.overflowListPage = 0;
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

  renderSavedFavorites();
  renderSurnameChecker();
}

bootstrap();
