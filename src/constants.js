export const SPECIES_OPTIONS = [
  { value: '犬', label: '犬', icon: '犬' },
  { value: '猫', label: '猫', icon: '猫' },
  { value: 'うさぎ', label: 'うさぎ', icon: '兎' },
  { value: 'ハムスター', label: 'ハムスター', icon: '小' },
  { value: '鳥', label: '鳥', icon: '鳥' },
];

/** UI・フィルタ用の正規ラベル（データ側の旧表記は canonicalVibe で寄せる） */
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

export const CALL_STYLE_OPTIONS = [
  'やわらかい響き',
  'キリッと響く',
  '呼びやすい短さ',
  '気品のある響き',
  '音の余韻がきれい',
];

export const OWNER_LIFESTYLE_OPTIONS = [
  'カフェ・おうち時間',
  '自然・散歩',
  '本・映画・アート',
  '和の暮らし',
  '旅・アクティブ',
];

export const WISH_OPTIONS = [
  'やさしさ',
  '健やかさ',
  '強さ',
  '幸運',
  '知性',
];

export const UNIQUENESS_OPTIONS = [
  'みんなに親しみやすい',
  'ほどよくかぶりにくい',
  'かなり個性的',
];

export const SCENE_OPTIONS = [
  '朝の光みたい',
  '静かな夜みたい',
  '季節を感じる',
  'ぬくもり重視',
  '凛とした空気',
];

export const FILTER_SUMMARY_LABELS = {
  species: '種類',
  vibe: '雰囲気',
  gender: '性別',
  color: '毛色',
  length: '長さ',
  theme: '世界観',
  callStyle: '呼びやすさ',
  ownerLifestyle: '暮らし',
  wish: '願い',
  uniqueness: 'かぶりにくさ',
  scene: '印象',
};

export const SCORE_LABELS = [
  { min: 80, label: 'ぴったり' },
  { min: 55, label: 'よく合う' },
  { min: 0, label: '合うかも' },
];

/** ワードクラウド表示の初期件数（画面内で一覧しやすい幅） */
export const INITIAL_RESULT_COUNT = 20;
export const LOAD_MORE_COUNT = 20;

/** おすすめ度マップに載せる最大件数（これ以上は折りたたみ一覧へ） */
export const WORDCLOUD_MAP_MAX = 20;

/** 「ほかの候補」1ページあたり（スマホで誤タップしにくい行リスト用） */
export const OVERFLOW_LIST_PAGE_SIZE = 20;

/** names.json 側の旧タグ → 正規ラベル */
export const VIBE_LEGACY_TO_CANONICAL = {
  ふわふわ系: 'ふわふわ',
  スイーツ系: 'かわいい',
  自然派: '自然',
  レトロ: '和風',
};

export function canonicalVibe(v) {
  return VIBE_LEGACY_TO_CANONICAL[v] || v;
}

/** URL クエリの旧値 → 正規値（プリセット用） */
export const VIBE_URL_ALIASES = {
  ふわふわ系: 'ふわふわ',
  スイーツ系: 'かわいい',
  自然派: '自然',
  レトロ: '和風',
};
