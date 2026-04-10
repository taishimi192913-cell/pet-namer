import { SCORE_LABELS, canonicalVibe } from './constants.js';

const SORTED_SCORE_LABELS = [...SCORE_LABELS].sort((a, b) => b.min - a.min);
const CATEGORY_WEIGHTS = {
  species: 14,
  gender: 8,
  vibe: 16,
  color: 8,
  length: 7,
  theme: 10,
  callStyle: 10,
  ownerLifestyle: 8,
  wish: 12,
  uniqueness: 6,
  scene: 9,
};
const SCORE_BASE = 12;
const SCORE_SPAN = 80;
const POPULARITY_WEIGHT = 4;
const LENGTH_DETAIL_WEIGHT = 2;
const MIN_RESULT_COUNT = 20;
const RELAXED_RESULT_CAP = 20;
const DIVERSE_HEAD_LIMIT = 48;
const DIVERSITY_PENALTY = 3.2;
const GENERIC_ARRAY_CATEGORIES = ['theme', 'callStyle', 'ownerLifestyle', 'wish', 'uniqueness', 'scene'];
const LENGTH_TARGETS = {
  2: { center: 2, span: 2 },
  3: { center: 3, span: 2 },
  '4+': { center: 4, span: 4 },
};
const CATEGORY_TIERS = {
  species: 'protected',
  length: 'protected',
  vibe: 'core',
  gender: 'core',
  color: 'core',
  theme: 'core',
  callStyle: 'nuance',
  ownerLifestyle: 'nuance',
  wish: 'nuance',
  uniqueness: 'nuance',
  scene: 'nuance',
};
const POPULARITY_REGEX = /(?:(\d{4})年[^。]*?)?(\d+)位/g;

function scoreLabelForScore(score) {
  return SORTED_SCORE_LABELS.find((row) => score >= row.min)?.label
    ?? SORTED_SCORE_LABELS[SORTED_SCORE_LABELS.length - 1].label;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function uniqueValues(values = [], mapFn = (value) => value) {
  return [...new Set(values.map((value) => mapFn(value)).filter(Boolean))];
}

function overlapMetrics(itemValues, selectedSet, mapFn = (value) => value) {
  if (!selectedSet || selectedSet.size === 0) {
    return {
      active: false,
      matched: 0,
      selectedCount: 0,
      itemCount: 0,
      coverage: 0,
      precision: 0,
      jaccard: 0,
    };
  }

  const selectedValues = uniqueValues([...selectedSet], mapFn);
  const itemSet = new Set(uniqueValues(itemValues, mapFn));
  let matched = 0;

  for (const value of selectedValues) {
    if (itemSet.has(value)) matched += 1;
  }

  const selectedCount = selectedValues.length;
  const itemCount = itemSet.size;
  const unionCount = new Set([...selectedValues, ...itemSet]).size;

  return {
    active: true,
    matched,
    selectedCount,
    itemCount,
    coverage: selectedCount > 0 ? matched / selectedCount : 0,
    precision: itemCount > 0 ? matched / itemCount : 0,
    jaccard: unionCount > 0 ? matched / unionCount : 0,
  };
}

function countTextUnits(value = '') {
  return Array.from(String(value).replace(/[\s・]/g, '')).length;
}

function estimateNameLength(item) {
  return Math.max(countTextUnits(item.name), countTextUnits(item.reading));
}

function matchesLengthBucket(item, selectedSet) {
  if (!selectedSet?.size) return true;
  const actualLength = estimateNameLength(item);
  for (const selectedLength of selectedSet) {
    if (selectedLength === '4+' && actualLength >= 4) return true;
    if (selectedLength === '3' && actualLength === 3) return true;
    if (selectedLength === '2' && actualLength <= 2) return true;
  }
  return false;
}

function scoreLengthCloseness(actualLength, selectedLength) {
  const target = LENGTH_TARGETS[selectedLength];
  if (!target) return 0.5;
  return clamp(1 - (Math.abs(actualLength - target.center) / target.span));
}

function getLengthDetailSignal(item, selectedSet) {
  const actualLength = estimateNameLength(item);
  if (!selectedSet || selectedSet.size === 0) {
    return {
      value: clamp(1 - (Math.abs(actualLength - 3) / 3)),
      actualLength,
      mode: 'default',
    };
  }

  let best = 0;

  for (const selectedLength of selectedSet) {
    best = Math.max(best, scoreLengthCloseness(actualLength, selectedLength));
  }

  return { value: best, actualLength, mode: 'selected' };
}

function getPopularitySignal(meaning = '') {
  const matches = [...String(meaning).matchAll(POPULARITY_REGEX)];

  if (matches.length === 0) {
    return {
      value: 0.44,
      present: false,
      bestRank: null,
      bestYear: null,
    };
  }

  const currentYear = new Date().getFullYear();
  let best = null;

  for (const match of matches) {
    const year = match[1] ? Number(match[1]) : null;
    const rank = Number(match[2]);
    if (!Number.isFinite(rank) || rank <= 0) continue;

    const cappedRank = Math.min(rank, 20);
    const rankScore = 1 - ((cappedRank - 1) / 19);
    const age = year ? Math.max(0, currentYear - year) : null;
    const yearWeight = year
      ? 0.76 + (Math.max(0, 5 - Math.min(age, 5)) / 5) * 0.24
      : 0.82;
    const value = clamp(rankScore * yearWeight);

    if (!best || value > best.value || (value === best.value && rank < best.bestRank)) {
      best = {
        value,
        present: true,
        bestRank: rank,
        bestYear: year,
      };
    }
  }

  return best ?? {
    value: 0.44,
    present: false,
    bestRank: null,
    bestYear: null,
  };
}

function buildComponent(key, weight, value, extra = {}) {
  return {
    key,
    weight,
    value,
    points: weight * value,
    ...extra,
  };
}

function scoreGenericArrayComponent(key, itemValues, activeFilters, mapFn = (value) => value) {
  if (!activeFilters[key]?.size) return null;

  const metrics = overlapMetrics(itemValues, activeFilters[key], mapFn);
  const value = metrics.matched === 0
    ? 0
    : clamp((metrics.coverage * 0.68) + (metrics.precision * 0.2) + (metrics.jaccard * 0.12));

  return buildComponent(key, CATEGORY_WEIGHTS[key], value, {
    ...metrics,
    itemValues: uniqueValues(itemValues, mapFn),
  });
}

function scoreSpeciesComponent(item, activeFilters) {
  if (!activeFilters.species?.size) return null;
  const metrics = overlapMetrics(item.species, activeFilters.species);
  const value = metrics.matched === 0
    ? 0
    : clamp((metrics.coverage * 0.64) + (metrics.precision * 0.36));
  return buildComponent('species', CATEGORY_WEIGHTS.species, value, metrics);
}

function scoreGenderComponent(item, activeFilters) {
  if (!activeFilters.gender?.size) return null;

  let value = 0;
  if (activeFilters.gender.has('どちらでも')) {
    value = item.gender === 'どちらでも' ? 0.94 : 0.9;
  } else if (item.gender === 'どちらでも') {
    value = 0.76;
  } else if (activeFilters.gender.has(item.gender)) {
    value = 1;
  }

  return buildComponent('gender', CATEGORY_WEIGHTS.gender, value, {
    itemValue: item.gender,
    selected: [...activeFilters.gender],
  });
}

function scoreVibeComponent(item, activeFilters) {
  if (!activeFilters.vibe?.size) return null;

  const metrics = overlapMetrics(item.vibe, activeFilters.vibe, canonicalVibe);
  const overlapBonus = metrics.matched > 1
    ? Math.min(0.08, (metrics.matched - 1) * 0.04)
    : 0;
  const value = metrics.matched === 0
    ? 0
    : clamp(
      (metrics.coverage * 0.66)
      + (metrics.precision * 0.22)
      + (metrics.jaccard * 0.12)
      + overlapBonus,
    );

  return buildComponent('vibe', CATEGORY_WEIGHTS.vibe, value, {
    ...metrics,
    itemValues: uniqueValues(item.vibe, canonicalVibe),
  });
}

function scoreColorComponent(item, activeFilters) {
  if (!activeFilters.color?.size) return null;

  const hasUnknown = item.color.includes('なし');
  const knownColors = item.color.filter((value) => value !== 'なし');
  const metrics = overlapMetrics(knownColors, activeFilters.color);
  let value = 0;

  if (metrics.matched > 0) {
    value = clamp(
      (metrics.coverage * 0.62)
      + (metrics.precision * 0.22)
      + (hasUnknown ? 0.1 : 0.16),
    );
  } else if (hasUnknown) {
    value = 0.38;
  }

  return buildComponent('color', CATEGORY_WEIGHTS.color, value, {
    ...metrics,
    hasUnknown,
    itemValues: knownColors,
  });
}

function scoreLengthComponent(item, activeFilters) {
  if (!activeFilters.length?.size) return null;

  const detail = getLengthDetailSignal(item, activeFilters.length);
  const exactBucket = matchesLengthBucket(item, activeFilters.length);
  const value = exactBucket
    ? clamp(0.74 + (detail.value * 0.26))
    : clamp(detail.value * 0.3);

  return buildComponent('length', CATEGORY_WEIGHTS.length, value, {
    itemValue: item.length,
    selected: [...activeFilters.length],
    detailValue: detail.value,
    actualLength: detail.actualLength,
  });
}

function scoreThemeComponent(item, activeFilters) {
  return scoreGenericArrayComponent('theme', item.theme, activeFilters);
}

function scoreCallStyleComponent(item, activeFilters) {
  return scoreGenericArrayComponent('callStyle', item.callStyle, activeFilters);
}

function scoreOwnerLifestyleComponent(item, activeFilters) {
  return scoreGenericArrayComponent('ownerLifestyle', item.ownerLifestyle, activeFilters);
}

function scoreWishComponent(item, activeFilters) {
  return scoreGenericArrayComponent('wish', item.wish, activeFilters);
}

function scoreUniquenessComponent(item, activeFilters) {
  return scoreGenericArrayComponent('uniqueness', item.uniqueness, activeFilters);
}

function scoreSceneComponent(item, activeFilters) {
  return scoreGenericArrayComponent('scene', item.scene, activeFilters);
}

function itemKey(item) {
  return `${item.name}::${item.reading || ''}`;
}

function getSelectedCategories(activeFilters) {
  return Object.entries(activeFilters)
    .filter(([, selected]) => selected?.size > 0)
    .map(([category]) => category);
}

function categorySatisfied(item, activeFilters, category) {
  const selected = activeFilters[category];
  if (!selected?.size) return true;

  if (category === 'species') {
    return item.species.some((value) => selected.has(value));
  }

  if (category === 'gender') {
    if (selected.has('どちらでも') || item.gender === 'どちらでも') return true;
    return selected.has(item.gender);
  }

  if (category === 'color') {
    const knownColors = (item.color || []).filter((value) => value !== 'なし');
    return knownColors.some((value) => selected.has(value));
  }

  if (category === 'vibe') {
    return (item.vibe || []).some((value) => selected.has(canonicalVibe(value)));
  }

  if (category === 'length') {
    return matchesLengthBucket(item, selected);
  }

  if (category === 'theme') {
    return (item.theme || []).some((value) => selected.has(value));
  }

  if (GENERIC_ARRAY_CATEGORIES.includes(category)) {
    return (item[category] || []).some((value) => selected.has(value));
  }

  return (item[category] || []).some((value) => selected.has(value));
}

function buildBranchProfile(item, activeFilters) {
  const selectedCategories = getSelectedCategories(activeFilters);
  const matchedCategories = [];
  const unmatchedCategories = [];

  for (const category of selectedCategories) {
    if (categorySatisfied(item, activeFilters, category)) {
      matchedCategories.push(category);
    } else {
      unmatchedCategories.push(category);
    }
  }

  const countByTier = (tier) => matchedCategories.filter((category) => CATEGORY_TIERS[category] === tier).length;
  const selectedByTier = (tier) => selectedCategories.filter((category) => CATEGORY_TIERS[category] === tier).length;

  return {
    selectedCategories,
    matchedCategories,
    unmatchedCategories,
    protectedMatched: countByTier('protected'),
    coreMatched: countByTier('core'),
    nuanceMatched: countByTier('nuance'),
    protectedSelected: selectedByTier('protected'),
    coreSelected: selectedByTier('core'),
    nuanceSelected: selectedByTier('nuance'),
  };
}

function buildThresholdPlans(activeFilters) {
  const selectedCategories = getSelectedCategories(activeFilters);
  const protectedSelected = selectedCategories.filter((category) => CATEGORY_TIERS[category] === 'protected');
  const coreSelected = selectedCategories.filter((category) => CATEGORY_TIERS[category] === 'core');
  const nuanceSelected = selectedCategories.filter((category) => CATEGORY_TIERS[category] === 'nuance');
  const plans = [];

  for (let coreRequired = coreSelected.length; coreRequired >= 0; coreRequired -= 1) {
    for (let nuanceRequired = nuanceSelected.length; nuanceRequired >= 0; nuanceRequired -= 1) {
      plans.push({
        protectedRequired: protectedSelected.length,
        coreRequired,
        nuanceRequired,
        droppedProtected: [],
        penalty: ((coreSelected.length - coreRequired) * 8) + ((nuanceSelected.length - nuanceRequired) * 3),
      });
    }
  }

  if (protectedSelected.includes('length')) {
    for (let coreRequired = coreSelected.length; coreRequired >= 0; coreRequired -= 1) {
      for (let nuanceRequired = nuanceSelected.length; nuanceRequired >= 0; nuanceRequired -= 1) {
        plans.push({
          protectedRequired: protectedSelected.length - 1,
          coreRequired,
          nuanceRequired,
          droppedProtected: ['length'],
          penalty: 28 + ((coreSelected.length - coreRequired) * 8) + ((nuanceSelected.length - nuanceRequired) * 3),
        });
      }
    }
  }

  return plans.sort((a, b) => a.penalty - b.penalty || b.coreRequired - a.coreRequired || b.nuanceRequired - a.nuanceRequired);
}

function matchesThresholdPlan(profile, plan) {
  return (
    profile.protectedMatched >= plan.protectedRequired
    && profile.coreMatched >= plan.coreRequired
    && profile.nuanceMatched >= plan.nuanceRequired
  );
}

function buildDiversityProfile(item) {
  const readingChars = Array.from(String(item.reading || item.name || ''));
  return {
    vibe: uniqueValues(item.vibe, canonicalVibe),
    theme: uniqueValues(item.theme),
    color: uniqueValues((item.color || []).filter((value) => value !== 'なし')),
    callStyle: uniqueValues(item.callStyle),
    ownerLifestyle: uniqueValues(item.ownerLifestyle),
    wish: uniqueValues(item.wish),
    uniqueness: uniqueValues(item.uniqueness),
    scene: uniqueValues(item.scene),
    length: item.length || '',
    gender: item.gender || '',
    head: readingChars[0] || '',
    tail: readingChars[readingChars.length - 1] || '',
  };
}

function overlapRatio(valuesA, valuesB) {
  if (!valuesA.length || !valuesB.length) return 0;
  const setA = new Set(valuesA);
  let matched = 0;
  for (const value of valuesB) {
    if (setA.has(value)) matched += 1;
  }
  const union = new Set([...valuesA, ...valuesB]).size;
  return union > 0 ? matched / union : 0;
}

function candidateSimilarity(left, right) {
  const a = left._profile;
  const b = right._profile;
  let score = 0;
  score += overlapRatio(a.vibe, b.vibe) * 0.25;
  score += overlapRatio(a.theme, b.theme) * 0.12;
  score += overlapRatio(a.color, b.color) * 0.08;
  score += overlapRatio(a.callStyle, b.callStyle) * 0.12;
  score += overlapRatio(a.ownerLifestyle, b.ownerLifestyle) * 0.1;
  score += overlapRatio(a.wish, b.wish) * 0.1;
  score += overlapRatio(a.uniqueness, b.uniqueness) * 0.08;
  score += overlapRatio(a.scene, b.scene) * 0.09;
  if (a.length && a.length === b.length) score += 0.1;
  if (a.gender && b.gender && a.gender === b.gender && a.gender !== 'どちらでも') score += 0.08;
  if (a.head && a.head === b.head) score += 0.1;
  if (a.tail && a.tail === b.tail) score += 0.06;
  return clamp(score, 0, 1);
}

function sortCandidates(items) {
  return [...items].sort((a, b) => {
    const scoreA = a.match.query?.effectiveScore ?? a.match.rawScore ?? -1;
    const scoreB = b.match.query?.effectiveScore ?? b.match.rawScore ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.match.score !== a.match.score) return b.match.score - a.match.score;
    return a.name.localeCompare(b.name, 'ja');
  });
}

function hashString(value) {
  let hash = 2166136261;
  for (const ch of String(value)) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function querySignature(activeFilters, seed = 0) {
  const parts = Object.entries(activeFilters)
    .map(([key, selected]) => `${key}:${[...(selected || new Set())].sort().join(',')}`)
    .sort();
  parts.push(`seed:${seed}`);
  return parts.join('|');
}

function explorationOffset(item, signature) {
  const raw = hashString(`${signature}::${itemKey(item)}`);
  const normalized = (raw % 1000) / 1000;
  return (normalized - 0.5) * 1.35;
}

function varyTopWindow(items, signature) {
  if (items.length <= 1) return items;

  const scoreFor = (item) => item.match.query?.effectiveScore ?? item.match.rawScore ?? -1;
  const topScore = scoreFor(items[0]);
  const window = [];
  let index = 0;

  while (index < items.length && index < 8) {
    const score = scoreFor(items[index]);
    if ((topScore - score) > 2.4) break;
    window.push(items[index]);
    index += 1;
  }

  if (window.length <= 1) return items;

  const head = [...window].sort((left, right) => {
    const hashLeft = hashString(`${signature}::window::${itemKey(left)}`);
    const hashRight = hashString(`${signature}::window::${itemKey(right)}`);
    return hashLeft - hashRight;
  });

  return [...head, ...items.slice(window.length)];
}

function diversifyCandidates(items) {
  if (items.length <= 2) return items;

  const ranked = sortCandidates(items).map((item) => ({
    ...item,
    _profile: buildDiversityProfile(item),
  }));
  const headLimit = Math.min(DIVERSE_HEAD_LIMIT, ranked.length);
  const pool = ranked.slice(0, headLimit);
  const tail = ranked.slice(headLimit);
  const picked = [];

  while (pool.length > 0) {
    let bestIndex = 0;
    let bestValue = -Infinity;

    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index];
      const base = candidate.match.query?.effectiveScore ?? candidate.match.rawScore ?? -1;
      const redundancy = picked.length
        ? Math.max(...picked.map((item) => candidateSimilarity(candidate, item)))
        : 0;
      const diversified = base - (redundancy * DIVERSITY_PENALTY);

      if (diversified > bestValue) {
        bestValue = diversified;
        bestIndex = index;
      }
    }

    const [next] = pool.splice(bestIndex, 1);
    picked.push(next);
  }

  return [...picked, ...tail].map(({ _profile, ...item }) => item);
}

function withQueryMeta(item, plan, effectiveScore) {
  const profile = item.match.branchProfile || buildBranchProfile(item, plan.activeFilters);
  const relaxedCategories = profile.unmatchedCategories;
  return {
    ...item,
    match: {
      ...item.match,
      branchProfile: profile,
      query: {
        tier: plan.penalty === 0 ? 'strict' : plan.droppedProtected?.length ? 'fallback-protected' : 'fallback',
        relaxedCategories,
        matchedCategories: profile.matchedCategories,
        effectiveScore,
      },
    },
  };
}

function hasActiveFilters(activeFilters) {
  return Object.values(activeFilters).some((selected) => selected?.size > 0);
}

export function matchesFilters(item, activeFilters) {
  return getSelectedCategories(activeFilters).every((category) => {
    if (category === 'color' && (item.color || []).includes('なし')) {
      return true;
    }
    return categorySatisfied(item, activeFilters, category);
  });
}

export function scoreMatch(item, activeFilters) {
  const components = [
    scoreSpeciesComponent(item, activeFilters),
    scoreGenderComponent(item, activeFilters),
    scoreVibeComponent(item, activeFilters),
    scoreColorComponent(item, activeFilters),
    scoreLengthComponent(item, activeFilters),
    scoreThemeComponent(item, activeFilters),
    scoreCallStyleComponent(item, activeFilters),
    scoreOwnerLifestyleComponent(item, activeFilters),
    scoreWishComponent(item, activeFilters),
    scoreUniquenessComponent(item, activeFilters),
    scoreSceneComponent(item, activeFilters),
  ].filter(Boolean);

  if (components.length === 0) {
    return { score: null, label: null, breakdown: null, rawScore: null };
  }

  const activeWeight = components.reduce((sum, component) => sum + component.weight, 0);
  const weightedPoints = components.reduce((sum, component) => sum + component.points, 0);
  const baseRatio = activeWeight > 0 ? weightedPoints / activeWeight : 0;
  const popularity = getPopularitySignal(item.meaning);
  const lengthDetail = activeFilters.length?.size
    ? getLengthDetailSignal(item, activeFilters.length)
    : getLengthDetailSignal(item);

  const rawScore = clamp(
    SCORE_BASE
      + (baseRatio * SCORE_SPAN)
      + (popularity.value * POPULARITY_WEIGHT)
      + (lengthDetail.value * LENGTH_DETAIL_WEIGHT),
    0,
    99,
  );
  const score = Math.min(99, Math.round(rawScore));
  const label = scoreLabelForScore(score);

  return {
    score,
    label,
    rawScore,
    breakdown: {
      baseRatio,
      rawScore,
      weightedPoints,
      activeWeight,
      components: Object.fromEntries(components.map((component) => [component.key, component])),
      tieBreakers: {
        popularity: {
          weight: POPULARITY_WEIGHT,
          ...popularity,
          points: popularity.value * POPULARITY_WEIGHT,
        },
        lengthDetail: {
          weight: LENGTH_DETAIL_WEIGHT,
          mode: lengthDetail.mode,
          value: lengthDetail.value,
          actualLength: lengthDetail.actualLength,
          points: lengthDetail.value * LENGTH_DETAIL_WEIGHT,
        },
      },
    },
  };
}

export function getResults(allNames, activeFilters, options = {}) {
  const scoredItems = allNames.map((item) => ({
    ...item,
    match: scoreMatch(item, activeFilters),
  }));
  const signature = querySignature(activeFilters, options.seed ?? 0);

  if (!hasActiveFilters(activeFilters)) {
    const items = varyTopWindow(sortCandidates(
      scoredItems.map((item) => withQueryMeta(
        item,
        { penalty: 0, droppedProtected: [], activeFilters },
        (item.match.rawScore ?? -1) + explorationOffset(item, signature),
      )),
    ), signature).slice(0, MIN_RESULT_COUNT);
    return { items, total: items.length };
  }

  const scoredWithProfiles = scoredItems.map((item) => ({
    ...item,
    match: {
      ...item.match,
      branchProfile: buildBranchProfile(item, activeFilters),
    },
  }));
  const plans = buildThresholdPlans(activeFilters);
  const items = [];
  const seen = new Set();
  const relaxedTarget = RELAXED_RESULT_CAP;

  for (const plan of plans) {
    const tierItems = diversifyCandidates(
      sortCandidates(
        scoredWithProfiles
          .filter((item) => !seen.has(itemKey(item)) && matchesThresholdPlan(item.match.branchProfile, plan))
          .map((item) => withQueryMeta(
            item,
            { ...plan, activeFilters },
            (item.match.rawScore ?? -1)
              + (item.match.branchProfile.coreMatched * 1.9)
              + (item.match.branchProfile.nuanceMatched * 0.75)
              - plan.penalty
              + explorationOffset(item, signature),
          )),
      ),
    );

    for (const item of tierItems) {
      const key = itemKey(item);
      if (seen.has(key)) continue;
      items.push(item);
      seen.add(key);
      if (items.length >= relaxedTarget) break;
    }

    if (items.length >= relaxedTarget) break;
  }

  const finalItems = varyTopWindow(items, signature).slice(0, MIN_RESULT_COUNT);
  return { items: finalItems, total: finalItems.length };
}

export function getPopularNames(allNames, species, limit = 10) {
  return allNames
    .filter((item) => item.species.includes(species))
    .sort((a, b) => b.vibe.length - a.vibe.length || a.name.localeCompare(b.name, 'ja'))
    .slice(0, limit);
}
