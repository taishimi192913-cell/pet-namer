import { canonicalVibe } from './constants.js';

function cloneBucket(bucket = {}) {
  return { ...bucket };
}

function addToBucket(bucket, key, delta) {
  if (!key) return;
  bucket[key] = Number((bucket[key] || 0) + delta).toFixed(3);
  bucket[key] = Number(bucket[key]);
}

function addValues(bucket, values, delta) {
  values.forEach((value) => addToBucket(bucket, value, delta));
}

function topEntries(bucket, limit = 3) {
  return Object.entries(bucket)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function scoreValue(bucket, key) {
  if (!key) return 0;
  return bucket[key] || 0;
}

function normalize(rawScore, hasSignals) {
  if (!hasSignals) return 0.5;
  return Math.max(0, Math.min(1, (rawScore + 1.4) / 2.8));
}

export function createEmptyPreferenceProfile() {
  return {
    total: 0,
    likes: 0,
    passes: 0,
    holds: 0,
    categories: {
      vibe: {},
      color: {},
      gender: {},
      length: {},
      theme: {},
    },
  };
}

export function applySwipeFeedback(profile, item, action) {
  const next = {
    total: profile.total + 1,
    likes: profile.likes + (action === 'like' ? 1 : 0),
    passes: profile.passes + (action === 'pass' ? 1 : 0),
    holds: profile.holds + (action === 'hold' ? 1 : 0),
    categories: {
      vibe: cloneBucket(profile.categories.vibe),
      color: cloneBucket(profile.categories.color),
      gender: cloneBucket(profile.categories.gender),
      length: cloneBucket(profile.categories.length),
      theme: cloneBucket(profile.categories.theme),
    },
  };

  const delta = action === 'like' ? 1 : action === 'hold' ? 0.3 : -0.7;

  addValues(next.categories.vibe, (item.vibe || []).map(canonicalVibe), delta);
  addValues(next.categories.color, (item.color || []).filter((value) => value !== 'なし'), delta);
  addValues(next.categories.theme, item.theme || [], delta * 0.9);
  addValues(next.categories.length, item.length ? [item.length] : [], delta * 0.7);

  if (item.gender && item.gender !== 'どちらでも') {
    addToBucket(next.categories.gender, item.gender, delta * 0.7);
  }

  return next;
}

export function scorePreferenceMatch(item, profile) {
  const hasSignals = profile.total > 0;
  const vibeScores = (item.vibe || []).map((value) => scoreValue(profile.categories.vibe, canonicalVibe(value)));
  const colorScores = (item.color || [])
    .filter((value) => value !== 'なし')
    .map((value) => scoreValue(profile.categories.color, value));
  const themeScores = (item.theme || []).map((value) => scoreValue(profile.categories.theme, value));
  const lengthScores = item.length ? [scoreValue(profile.categories.length, item.length)] : [];
  const genderScores = item.gender && item.gender !== 'どちらでも'
    ? [scoreValue(profile.categories.gender, item.gender)]
    : [];

  const groups = [
    vibeScores,
    colorScores,
    themeScores,
    lengthScores,
    genderScores,
  ].filter((group) => group.length > 0);

  if (groups.length === 0) return hasSignals ? 0.5 : 0.4;

  const rawAverage = groups
    .map((group) => group.reduce((sum, value) => sum + value, 0) / group.length)
    .reduce((sum, value) => sum + value, 0) / groups.length;

  return normalize(rawAverage, hasSignals);
}

export function summarizePreferenceProfile(profile) {
  const vibe = topEntries(profile.categories.vibe);
  const color = topEntries(profile.categories.color);
  const length = topEntries(profile.categories.length, 1);
  const gender = topEntries(profile.categories.gender, 1);
  const theme = topEntries(profile.categories.theme, 2);

  const traits = [];
  if (vibe[0]) traits.push(vibe[0][0]);
  if (length[0]) traits.push(length[0][0] === '4+' ? '4文字以上' : `${length[0][0]}文字`);
  if (color[0]) traits.push(`${color[0][0]}系`);
  if (theme[0]) traits.push(theme[0][0]);
  if (gender[0]) traits.push(`${gender[0][0]}寄り`);

  const headline = traits.length
    ? `あなたは ${traits.slice(0, 3).join('・')} の名前に反応しやすいようです。`
    : 'まだ好み学習の材料が少ないので、もう少しスワイプすると傾向が見えてきます。';

  const bullets = [];
  if (vibe.length) bullets.push(`雰囲気: ${vibe.map(([label]) => label).join(' / ')}`);
  if (theme.length) bullets.push(`テーマ: ${theme.map(([label]) => label).join(' / ')}`);
  if (color.length) bullets.push(`色イメージ: ${color.map(([label]) => label).join(' / ')}`);
  if (length.length) bullets.push(`文字数: ${length.map(([label]) => (label === '4+' ? '4文字以上' : `${label}文字`)).join(' / ')}`);
  if (gender.length) bullets.push(`性別傾向: ${gender.map(([label]) => label).join(' / ')}`);

  return { headline, bullets };
}
