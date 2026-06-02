// Sippomi Design Token System
// 参照: AGENTS.md §A.3 iOS カラーパレット / Shopify/restyle pattern
// ダークモード背景: #2D1F24 (AGENTS.md §A.3 末尾)
export const tokens = {
  colors: {
    // --- §A.3 パレット 完全一致 ---
    softPink:       '#F0A1B5' as const,
    rose:            '#D4788F' as const,
    warmMauve:       '#4A353A' as const,
    cornflower:      '#5B9BD5' as const,
    warmIvory:       '#FAF5F0' as const,
    softPetal:       '#FDF8F4' as const,
    petalWhite:      '#FEFAF7' as const,
    roseQuartz:      '#F0E2E0' as const,
    deepMauve:       '#5C444A' as const,
    mutedMauve:      '#6D555A' as const,
    lightPink:       '#FCE8EE' as const,
    visiblePink:     '#F5CED8' as const,
    passSurface:     '#F3B8B8' as const,
    holdSurface:     '#E8D5C4' as const,
    likeSurface:     '#B8DFCA' as const,
    disabled:        '#E0D5D8' as const,
    muted:           '#8C7A80' as const,
    textMutedWarm:   '#9C8A90' as const,
    textAccentDark:  '#7B4D5B' as const,
    cardGhost:       '#F2E5E8' as const,
    ghostText:       '#D8C5CA' as const,
    borderSoft:      '#F4E8EB' as const,
    selectedSurface: '#F9E0E8' as const,
    gold:            '#D9A441' as const,
    silver:          '#B8B8B8' as const,
    bronze:          '#B87845' as const,
    modalHandle:     '#E5CDD3' as const,
    // --- 旧 palette との互換用 ---
    softBlush:       '#F8DFE5' as const,
    // --- 種別カラー ---
    speciesDog:      '#E8A87C' as const,    // 犬: テラコッタオレンジ
    speciesCat:      '#F0A1B5' as const,    // 猫: ソフトピンク
    speciesRabbit:   '#B8DFCA' as const,    // うさぎ: ミントグリーン
    speciesHamster:  '#F5CED8' as const,    // ハムスター: ピンク
    speciesBird:     '#A8D8EA' as const,    // 鳥: スカイブルー
    speciesReptile:  '#A4C639' as const,    // 爬虫類: ライム
    speciesFish:     '#5B9BD5' as const,    // 魚: コーンフラワーブルー
    speciesSmall:    '#E8D5C4' as const,    // 小動物: ベージュ

    // --- ダークモード ---
    dark: {
      background: '#2D1F24' as const,       // AGENTS.md §A.3 末尾
      card:       '#3A2A30' as const,
      chip:       '#46363C' as const,
      accent:     '#59444B' as const,
      textPrimary: '#F5EDF0' as const,
      textSecondary: '#C5B5BB' as const,
      textTertiary: '#B0A0A6' as const,
      border:     '#504046' as const,
      accentPink: '#F0A1B5' as const,
    },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const,
  radius: { sm: 12, md: 18, lg: 24, xl: 36, full: 999 } as const,
  shadow: {
    sm: { shadowColor: '#8c4a22', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: {width:0, height:6}, elevation: 4 },
    md: { shadowColor: '#8c4a22', shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: {width:0, height:12}, elevation: 12 },
    lg: { shadowColor: '#3D2C2A', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: {width:0, height:-8}, elevation: 18 },
  },
  typography: {
    caption:  { fontSize: 12, lineHeight: 16 } as const,
    body:     { fontSize: 15, lineHeight: 24 } as const,
    subhead:  { fontSize: 17, lineHeight: 24 } as const,
    title:    { fontSize: 24, lineHeight: 32 } as const,
    hero:     { fontSize: 34, lineHeight: 44 } as const,
  },
};
