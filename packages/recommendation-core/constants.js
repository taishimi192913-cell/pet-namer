export const SPECIES_OPTIONS = [
  { value: '犬', label: '犬' },
  { value: '猫', label: '猫' },
  { value: 'うさぎ', label: 'うさぎ' },
  { value: 'ハムスター', label: 'ハムスター' },
  { value: '鳥', label: '鳥' },
];

export const VIBE_OPTIONS = [
  'かわいい',
  'かっこいい',
  '和風',
  '洋風',
  'ふわふわ',
  '上品',
  '個性的',
  '元気',
  '自然',
  '神秘的',
  '話題',
];

export const GENDER_OPTIONS = [
  { value: 'オス', label: 'オス' },
  { value: 'メス', label: 'メス' },
  { value: 'どちらでも', label: 'どちらでも' },
];

export const COLOR_OPTIONS = ['白', '黒', '茶色', '三毛'];

export const LENGTH_OPTIONS = [
  { value: '2', label: '2文字' },
  { value: '3', label: '3文字' },
  { value: '4+', label: '4文字以上' },
];

export const THEME_OPTIONS = [
  '自然・植物',
  '食べ物・スイーツ',
  '宝石・貴金属',
  '和風・古風',
  '洋風・モダン',
];

export const SCORE_LABELS = [
  { min: 80, label: 'ぴったり' },
  { min: 55, label: 'よく合う' },
  { min: 0, label: '合うかも' },
];

export const VIBE_LEGACY_TO_CANONICAL = {
  ふわふわ系: 'ふわふわ',
  スイーツ系: 'かわいい',
  自然派: '自然',
  レトロ: '和風',
};

export const VIBE_URL_ALIASES = {
  ふわふわ系: 'ふわふわ',
  スイーツ系: 'かわいい',
  自然派: '自然',
  レトロ: '和風',
};

export const SWIPE_QUEUE_DEFAULT = 24;
export const SWIPE_REPLENISH_THRESHOLD = 6;

export function canonicalVibe(v) {
  return VIBE_LEGACY_TO_CANONICAL[v] || v;
}
