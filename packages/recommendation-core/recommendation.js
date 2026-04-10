import {
  SCORE_LABELS,
  SWIPE_QUEUE_DEFAULT,
  canonicalVibe,
} from './constants.js';
import { scorePreferenceMatch } from './learning.js';

const SORTED_SCORE_LABELS = [...SCORE_LABELS].sort((a, b) => b.min - a.min);

function normalizeSelectionArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function favoriteKeyForItem(item) {
  const species = normalizeSelectionArray(item.species).slice().sort().join('|');
  return `${item.name}::${item.reading || ''}::${species}`;
}

export function createActiveFilters(answers = {}) {
  return {
    species: new Set(normalizeSelectionArray(answers.species)),
    gender: new Set(normalizeSelectionArray(answers.gender)),
    vibe: new Set(normalizeSelectionArray(answers.vibe).map(canonicalVibe)),
    color: new Set(normalizeSelectionArray(answers.color)),
    length: new Set(normalizeSelectionArray(answers.length)),
    theme: new Set(normalizeSelectionArray(answers.theme)),
  };
}

function scoreLabelForScore(score) {
  return SORTED_SCORE_LABELS.find((row) => score >= row.min)?.label
    ?? SORTED_SCORE_LABELS[SORTED_SCORE_LABELS.length - 1].label;
}

export function matchesFilters(item, activeFilters) {
  for (const [category, selected] of Object.entries(activeFilters)) {
    if (selected.size === 0) continue;

    if (category === 'gender') {
      if (item.gender === 'どちらでも' || selected.has('どちらでも')) continue;
      if (!selected.has(item.gender)) return false;
      continue;
    }

    if (category === 'color') {
      if (item.color.includes('なし')) continue;
      if (!item.color.some((value) => selected.has(value))) return false;
      continue;
    }

    if (category === 'vibe') {
      if (!item.vibe.some((v) => selected.has(canonicalVibe(v)))) return false;
      continue;
    }

    if (category === 'length') {
      if (!selected.has(item.length)) return false;
      continue;
    }

    if (category === 'theme') {
      if (!item.theme.some((v) => selected.has(v))) return false;
      continue;
    }

    if (!item[category].some((value) => selected.has(value))) return false;
  }

  return true;
}

export function scoreMatch(item, activeFilters) {
  let activeCategories = 0;
  const parts = [];

  if (activeFilters.species?.size > 0) {
    activeCategories += 1;
    const ok = item.species.some((s) => activeFilters.species.has(s));
    parts.push(ok ? 1 : 0);
  }

  if (activeFilters.gender?.size > 0) {
    activeCategories += 1;
    let g = 0;
    if (activeFilters.gender.has('どちらでも') || item.gender === 'どちらでも') {
      g = 1;
    } else if (activeFilters.gender.has(item.gender)) {
      g = 1;
    }
    parts.push(g);
  }

  if (activeFilters.vibe?.size > 0) {
    activeCategories += 1;
    const selectedList = [...activeFilters.vibe];
    let matchedCount = 0;
    for (const sel of selectedList) {
      if (item.vibe.some((iv) => canonicalVibe(iv) === sel)) matchedCount += 1;
    }
    let ratio = selectedList.length ? matchedCount / selectedList.length : 0;
    if (matchedCount >= 2) {
      ratio = Math.min(1, ratio * 1.15);
    }
    parts.push(ratio);
  }

  if (activeFilters.color?.size > 0) {
    activeCategories += 1;
    let c = 0;
    if (item.color.includes('なし')) {
      c = 0.5;
    } else if (item.color.some((value) => activeFilters.color.has(value))) {
      c = 1;
    } else {
      c = 0;
    }
    parts.push(c);
  }

  if (activeFilters.length?.size > 0) {
    activeCategories += 1;
    parts.push(activeFilters.length.has(item.length) ? 1 : 0);
  }

  if (activeFilters.theme?.size > 0) {
    activeCategories += 1;
    const matchedCount = item.theme.filter((t) => activeFilters.theme.has(t)).length;
    parts.push(matchedCount > 0 ? 1 : 0);
  }

  if (activeCategories === 0) {
    return { score: null, label: null };
  }

  const sum = parts.reduce((a, b) => a + b, 0);
  let score = Math.floor((sum / activeCategories) * 100);
  score = Math.min(99, score);

  return { score, label: scoreLabelForScore(score) };
}

export function getResults(allNames, activeFilters) {
  const items = allNames
    .filter((item) => matchesFilters(item, activeFilters))
    .map((item) => ({ ...item, match: scoreMatch(item, activeFilters) }))
    .sort((a, b) => {
      if (a.match.score === null && b.match.score === null) {
        return a.name.localeCompare(b.name, 'ja');
      }
      if (a.match.score === null) return 1;
      if (b.match.score === null) return -1;
      if (b.match.score !== a.match.score) return b.match.score - a.match.score;
      return a.name.localeCompare(b.name, 'ja');
    });

  return { items, total: items.length };
}

function matchRatio(itemValues, selectedSet, mapFn = (value) => value) {
  if (!selectedSet || selectedSet.size === 0) return { matched: false, ratio: 0 };
  const selected = [...selectedSet];
  const matched = selected.filter((value) => itemValues.some((itemValue) => mapFn(itemValue) === value)).length;
  return { matched: matched > 0, ratio: matched / selected.length };
}

function scoreInitialFit(item, filters) {
  if (filters.species.size > 0 && !item.species.some((value) => filters.species.has(value))) {
    return 0;
  }

  let score = 0.4;
  let max = 0.4;

  if (filters.gender.size > 0) {
    max += 0.12;
    if (filters.gender.has('どちらでも') || item.gender === 'どちらでも' || filters.gender.has(item.gender)) {
      score += 0.12;
    }
  }

  if (filters.vibe.size > 0) {
    max += 0.22;
    const vibe = matchRatio(item.vibe, filters.vibe, canonicalVibe);
    score += vibe.ratio * 0.22;
  }

  if (filters.color.size > 0) {
    max += 0.12;
    if (item.color.includes('なし')) {
      score += 0.06;
    } else if (item.color.some((value) => filters.color.has(value))) {
      score += 0.12;
    }
  }

  if (filters.length.size > 0) {
    max += 0.07;
    if (filters.length.has(item.length)) score += 0.07;
  }

  if (filters.theme.size > 0) {
    max += 0.07;
    if (item.theme.some((value) => filters.theme.has(value))) score += 0.07;
  }

  return Math.max(0.05, Math.min(1, score / max));
}

function scoreDiversityBoost(item, recentKeys = []) {
  if (!recentKeys.length) return 0.55;
  const recentSet = new Set(recentKeys);
  const novelty = [
    ...(item.vibe || []).map(canonicalVibe),
    ...(item.theme || []),
    ...(item.color || []).filter((value) => value !== 'なし'),
  ].filter((value) => !recentSet.has(value)).length;
  return Math.min(1, 0.45 + novelty * 0.12);
}

function buildReasonParts(item, filters, preference) {
  const parts = [];

  if (filters.species.size > 0) {
    const matchedSpecies = item.species.filter((value) => filters.species.has(value));
    if (matchedSpecies.length) parts.push(`${matchedSpecies.join('・')}向け`);
  }

  const matchedVibes = item.vibe.filter((value) => filters.vibe.has(canonicalVibe(value)));
  if (matchedVibes.length) parts.push(`${matchedVibes.join('・')}の雰囲気`);

  if (filters.color.size > 0 && item.color.some((value) => filters.color.has(value))) {
    const matchedColors = item.color.filter((value) => filters.color.has(value));
    parts.push(`${matchedColors.join('・')}の色イメージ`);
  }

  if (filters.length.size > 0 && filters.length.has(item.length)) {
    parts.push(item.length === '4+' ? '4文字以上の長さ' : `${item.length}文字の短さ`);
  }

  if (preference.total > 0) {
    const likedVibe = (item.vibe || []).map(canonicalVibe)
      .find((value) => (preference.categories.vibe[value] || 0) > 0.5);
    if (likedVibe) parts.push(`最近よくLikeしている${likedVibe}系`);
  }

  return parts.slice(0, 3);
}

export function rankNamesForSwipe(allNames, answers, preference, options = {}) {
  const filters = createActiveFilters(answers);
  const recentTraits = options.recentTraits || [];

  return allNames
    .filter((item) => filters.species.size === 0 || item.species.some((value) => filters.species.has(value)))
    .map((item) => {
      const initialFit = scoreInitialFit(item, filters);
      const learnedPreference = scorePreferenceMatch(item, preference);
      const diversityBoost = scoreDiversityBoost(item, recentTraits);
      const total = (initialFit * 0.5) + (learnedPreference * 0.4) + (diversityBoost * 0.1);
      return {
        item,
        scores: {
          initialFit,
          learnedPreference,
          diversityBoost,
          total,
        },
        reasonParts: buildReasonParts(item, filters, preference),
      };
    })
    .sort((a, b) => {
      if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
      return a.item.name.localeCompare(b.item.name, 'ja');
    });
}

export function buildSwipeQueue(allNames, answers, preference, seenKeys = new Set(), options = {}) {
  const limit = options.limit || SWIPE_QUEUE_DEFAULT;
  const ranked = rankNamesForSwipe(allNames, answers, preference, options);
  const queue = [];
  let exploreEvery = 4;

  for (const candidate of ranked) {
    const key = favoriteKeyForItem(candidate.item);
    if (seenKeys.has(key)) continue;

    if (exploreEvery === 0) {
      exploreEvery = 4;
      continue;
    }

    queue.push({
      ...candidate,
      key,
      recommendationLabel: candidate.scores.total >= 0.78
        ? 'かなり相性が良さそう'
        : candidate.scores.total >= 0.62
          ? '試す価値あり'
          : '意外とハマるかも',
    });

    if (queue.length >= limit) break;
    exploreEvery -= 1;
  }

  return queue;
}

export function topLikedNames(swipes, limit = 10) {
  return swipes
    .filter((entry) => entry.action === 'like')
    .slice(-limit)
    .reverse();
}
