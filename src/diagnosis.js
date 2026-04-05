import { SCORE_LABELS, canonicalVibe } from './constants.js';

const SORTED_SCORE_LABELS = [...SCORE_LABELS].sort((a, b) => b.min - a.min);

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
    const matchedCount = item.theme.filter(t => activeFilters.theme.has(t)).length;
    parts.push(matchedCount > 0 ? 1 : 0);
  }

  if (activeCategories === 0) {
    return { score: null, label: null };
  }

  const sum = parts.reduce((a, b) => a + b, 0);
  let score = Math.floor((sum / activeCategories) * 100);
  score = Math.min(99, score);

  const label = scoreLabelForScore(score);

  return { score, label };
}

export function getResults(allNames, activeFilters) {
  const items = allNames
    .filter((item) => matchesFilters(item, activeFilters))
    .map((item) => {
      const m = scoreMatch(item, activeFilters);
      return { ...item, match: m };
    })
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

export function getPopularNames(allNames, species, limit = 10) {
  return allNames
    .filter((item) => item.species.includes(species))
    .sort((a, b) => b.vibe.length - a.vibe.length || a.name.localeCompare(b.name, 'ja'))
    .slice(0, limit);
}
