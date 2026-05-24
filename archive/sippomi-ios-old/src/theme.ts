import {
  Appearance,
  NativeModules,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  useColorScheme,
} from 'react-native';

export const darkPalette = {
  background: '#1E1A22',
  card: '#2D2520',
  text: '#F5F0EB',
  muted: '#CDBFB5',
  line: '#4A3A34',
  chip: '#3A302C',
  accentSoft: '#45352C',
};

export const darkStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: darkPalette.background,
  },
  heroCard: {
    backgroundColor: darkPalette.card,
    shadowColor: '#000000',
  },
  heroTitle: {
    color: darkPalette.text,
  },
  heroBody: {
    color: darkPalette.muted,
  },
  heroBullet: {
    color: darkPalette.text,
  },
  formTitle: {
    color: darkPalette.text,
  },
  formBody: {
    color: darkPalette.muted,
  },
  section: {
    backgroundColor: darkPalette.card,
  },
  sectionTitle: {
    color: darkPalette.text,
  },
  sectionBody: {
    color: darkPalette.muted,
  },
  chip: {
    backgroundColor: darkPalette.chip,
    borderColor: darkPalette.line,
  },
  chipText: {
    color: darkPalette.text,
  },
  primaryButtonText: {
    color: '#FFFAF4',
  },
  secondaryButton: {
    backgroundColor: darkPalette.card,
    borderColor: darkPalette.line,
  },
  secondaryButtonText: {
    color: darkPalette.text,
  },
  iconButton: {
    backgroundColor: darkPalette.card,
    borderColor: darkPalette.line,
  },
  iconButtonMuted: {
    backgroundColor: darkPalette.accentSoft,
  },
  speciesCard: {
    backgroundColor: darkPalette.chip,
    borderColor: darkPalette.line,
  },
  speciesCardActive: {
    backgroundColor: darkPalette.accentSoft,
  },
  speciesCardText: {
    color: darkPalette.text,
  },
  swipeTitle: {
    color: darkPalette.text,
  },
  insightCard: {
    backgroundColor: darkPalette.card,
  },
  insightTitle: {
    color: darkPalette.text,
  },
  insightBody: {
    color: darkPalette.muted,
  },
  insightMeta: {
    color: '#A99A91',
  },
  card: {
    backgroundColor: darkPalette.card,
    shadowColor: '#000000',
  },
  cardGhost: {
    backgroundColor: '#241E1B',
  },
  cardScore: {
    color: darkPalette.text,
  },
  cardName: {
    color: darkPalette.text,
  },
  cardReading: {
    color: darkPalette.muted,
  },
  cardMeaning: {
    color: darkPalette.muted,
  },
  metaChip: {
    backgroundColor: '#45352C',
  },
  scorePill: {
    backgroundColor: '#3A302C',
  },
  scorePillValue: {
    color: darkPalette.text,
  },
  actionButtonText: {
    color: darkPalette.text,
  },
  summaryCard: {
    backgroundColor: darkPalette.card,
  },
  summaryTitle: {
    color: darkPalette.text,
  },
  summaryLine: {
    color: darkPalette.muted,
  },
  resultsLead: {
    color: darkPalette.muted,
  },
  resultRowRanked: {
    backgroundColor: '#3A302C',
  },
  resultRowName: {
    color: darkPalette.text,
  },
  resultRowBody: {
    color: darkPalette.muted,
  },
  emptyCardTitle: {
    color: darkPalette.text,
  },
  emptyCardBody: {
    color: darkPalette.muted,
  },
  nameModalCard: {
    backgroundColor: darkPalette.card,
  },
  nameModalTitle: {
    color: darkPalette.text,
  },
  nameModalReading: {
    color: darkPalette.muted,
  },
  nameModalMeaning: {
    color: darkPalette.muted,
  },
  nameModalReasonCard: {
    backgroundColor: '#3A302C',
    borderColor: darkPalette.line,
  },
  nameModalSectionTitle: {
    color: darkPalette.text,
  },
  nameModalReasonText: {
    color: darkPalette.muted,
  },
  preferenceChartTitle: {
    color: darkPalette.text,
  },
  preferenceChart: {
    borderTopColor: darkPalette.line,
  },
  preferenceChartLabel: {
    color: '#A99A91',
  },
  preferenceChartTrait: {
    color: darkPalette.text,
  },
  nameModalTag: {
    backgroundColor: darkPalette.accentSoft,
  },
  nameModalTagText: {
    color: darkPalette.text,
  },
  nameModalScoreText: {
    backgroundColor: darkPalette.accentSoft,
    color: darkPalette.text,
  },
  modalCloseButtonText: {
    color: '#FFFAF4',
  },
  resultRowAction: {
    color: '#F9A66C',
  },
  resultRowActionPill: {
    backgroundColor: darkPalette.accentSoft,
  },
});

type ViewDarkStyleKey =
  | 'safeArea'
  | 'heroCard'
  | 'section'
  | 'chip'
  | 'secondaryButton'
  | 'iconButton'
  | 'iconButtonMuted'
  | 'speciesCard'
  | 'speciesCardActive'
  | 'insightCard'
  | 'card'
  | 'cardGhost'
  | 'metaChip'
  | 'scorePill'
  | 'summaryCard'
  | 'resultRowRanked'
  | 'nameModalCard'
  | 'nameModalReasonCard'
  | 'preferenceChart'
  | 'nameModalTag'
  | 'resultRowActionPill';

type TextDarkStyleKey =
  | 'heroTitle'
  | 'heroBody'
  | 'heroBullet'
  | 'formTitle'
  | 'formBody'
  | 'sectionTitle'
  | 'sectionBody'
  | 'chipText'
  | 'primaryButtonText'
  | 'secondaryButtonText'
  | 'speciesCardText'
  | 'swipeTitle'
  | 'insightTitle'
  | 'insightBody'
  | 'insightMeta'
  | 'cardScore'
  | 'cardName'
  | 'cardReading'
  | 'cardMeaning'
  | 'scorePillValue'
  | 'actionButtonText'
  | 'summaryTitle'
  | 'summaryLine'
  | 'resultsLead'
  | 'resultRowName'
  | 'resultRowBody'
  | 'emptyCardTitle'
  | 'emptyCardBody'
  | 'nameModalTitle'
  | 'nameModalReading'
  | 'nameModalMeaning'
  | 'nameModalSectionTitle'
  | 'nameModalReasonText'
  | 'nameModalTagText'
  | 'nameModalScoreText'
  | 'modalCloseButtonText'
  | 'preferenceChartTitle'
  | 'preferenceChartLabel'
  | 'preferenceChartTrait'
  | 'resultRowAction';

export function useThemeMode() {
  const scheme = useColorScheme();
  const appearanceScheme = Appearance.getColorScheme();
  const iosInterfaceStyle = NativeModules.SettingsManager?.settings?.AppleInterfaceStyle;
  const isDark =
    scheme === 'dark' ||
    appearanceScheme === 'dark' ||
    iosInterfaceStyle === 'Dark';

  function apply(base: StyleProp<ViewStyle>, key: ViewDarkStyleKey): StyleProp<ViewStyle>;
  function apply(base: StyleProp<TextStyle>, key: TextDarkStyleKey): StyleProp<TextStyle>;
  function apply(
    base: StyleProp<ViewStyle> | StyleProp<TextStyle>,
    key: ViewDarkStyleKey | TextDarkStyleKey,
  ) {
    return isDark ? [base, darkStyles[key]] : base;
  }

  return {
    apply,
    colors: {
      icon: isDark ? darkPalette.text : '#3D2C2A',
      iconAccent: isDark ? '#F9A66C' : '#E07A5F',
      iconOnPrimary: '#FFFAF4',
      iconSecondary: isDark ? darkPalette.text : '#7B553D',
      chartTrack: isDark ? darkPalette.line : '#F4E1D3',
      dot: isDark ? '#F9A66C' : '#E07A5F',
      silhouetteSurface: isDark ? darkPalette.background : '#FFF8F0',
      silhouetteInk: isDark ? darkPalette.text : '#3D2C2A',
      silhouetteMuted: isDark ? '#7A6255' : '#D8B69B',
    },
    isDark,
    statusBarStyle: isDark ? 'light' as const : 'dark' as const,
  };
}
