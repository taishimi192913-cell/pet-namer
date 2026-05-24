const PRESETS = [
  {
    name: 'dog',
    tokens: ['dog'],
    primary: '#0071e3',
    secondary: '#e0ceaa',
    accent: '#6e6e73',
    motif: 'map',
    animal: 'dog',
  },
  {
    name: 'cat',
    tokens: ['cat'],
    primary: '#7f0019',
    secondary: '#e0ceaa',
    accent: '#6e6e73',
    motif: 'room',
    animal: 'cat',
  },
  {
    name: 'emergency',
    tokens: ['bousai', 'emergency'],
    primary: '#7f0019',
    secondary: '#6e6e73',
    accent: '#e0ceaa',
    motif: 'kit',
    animal: 'dog',
  },
  {
    name: 'outings',
    tokens: ['outings', 'walk', 'kanto'],
    primary: '#0071e3',
    secondary: '#e0ceaa',
    accent: '#e0ceaa',
    motif: 'map',
    animal: 'dog',
  },
  {
    name: 'home',
    tokens: ['home', 'cage', 'toilet', 'alone', 'days', 'welcome'],
    primary: '#e0ceaa',
    secondary: '#6e6e73',
    accent: '#0071e3',
    motif: 'room',
    animal: 'cat',
  },
  {
    name: 'care',
    tokens: ['vaccine', 'summer', 'fast-eating', 'cost'],
    primary: '#0071e3',
    secondary: '#e0ceaa',
    accent: '#6e6e73',
    motif: 'care',
    animal: 'dog',
  },
  {
    name: 'shopping',
    tokens: ['shopping', 'starter', 'checklist'],
    primary: '#0071e3',
    secondary: '#e0ceaa',
    accent: '#7f0019',
    motif: 'objects',
    animal: 'cat',
  },
];

const DEFAULT_PRESET = {
  name: 'default',
  tokens: ['default'],
  primary: '#0071e3',
  secondary: '#e0ceaa',
  accent: '#6e6e73',
  motif: 'objects',
  animal: 'cat',
};

export function getArticleScenePreset(source = '') {
  const normalized = String(source).toLowerCase();
  return PRESETS.find((preset) => preset.tokens.some((token) => normalized.includes(token))) ?? DEFAULT_PRESET;
}
