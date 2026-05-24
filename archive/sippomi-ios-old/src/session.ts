import namesData from './data/names.json';
import type { FiltersState, PetName, PreferenceProfile, SwipeCandidate, SwipeRecord } from './types';
import {
  SWIPE_QUEUE_DEFAULT,
  SWIPE_REPLENISH_THRESHOLD,
  buildSwipeQueue,
  createEmptyPreferenceProfile,
} from '../../../packages/recommendation-core/index.js';

export const ALL_NAMES = namesData as PetName[];
export const SWIPE_TRIGGER = 110;
export const CARD_OUT_DISTANCE = 440;

export const DEFAULT_FILTERS: FiltersState = {
  species: [],
  gender: ['どちらでも'],
  color: [],
  vibe: [],
  length: [],
  theme: [],
};

export function toggleValue(values: string[], value: string, single = false) {
  if (single) {
    return values.includes(value) ? [] : [value];
  }

  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function createSession(filters: FiltersState) {
  const preference = createEmptyPreferenceProfile();
  const queue = buildSwipeQueue(ALL_NAMES, filters, preference, new Set(), {
    limit: SWIPE_QUEUE_DEFAULT,
  }) as SwipeCandidate[];

  return {
    filters,
    preference,
    queue,
    swipes: [] as SwipeRecord[],
    saved: [] as SwipeCandidate[],
    seenKeys: new Set(queue.map((candidate) => candidate.key)),
  };
}

export function hydrateQueue(
  filters: FiltersState,
  preference: PreferenceProfile,
  existingQueue: SwipeCandidate[],
  seenKeys: Set<string>,
  swipes: SwipeRecord[],
) {
  if (existingQueue.length >= SWIPE_REPLENISH_THRESHOLD) {
    return existingQueue;
  }

  const recentTraits = swipes
    .slice(-5)
    .flatMap((record) => [
      ...record.candidate.item.vibe,
      ...(record.candidate.item.theme || []),
      ...(record.candidate.item.color || []),
    ]);

  const refill = buildSwipeQueue(ALL_NAMES, filters, preference, seenKeys, {
    limit: SWIPE_QUEUE_DEFAULT,
    recentTraits,
  }) as SwipeCandidate[];

  const merged = [...existingQueue];
  refill.forEach((candidate) => {
    if (!merged.some((entry) => entry.key === candidate.key)) {
      merged.push(candidate);
    }
  });
  merged.forEach((candidate) => seenKeys.add(candidate.key));
  return merged;
}

export function toPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
