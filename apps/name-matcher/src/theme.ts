import {
  Appearance,
  NativeModules,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  useColorScheme,
} from 'react-native';
import { tokens } from './designTokens';

export const darkPalette = {
  background: tokens.colors.dark.background,
  card: tokens.colors.dark.card,
  text: tokens.colors.dark.textPrimary,
  muted: tokens.colors.dark.textSecondary,
  line: tokens.colors.dark.border,
  chip: tokens.colors.dark.chip,
  accentSoft: tokens.colors.dark.accent,
  cornflower: '#7DB8E8',
};

export const darkStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: darkPalette.background,
  },
  heroCard: {
    backgroundColor: darkPalette.card,
    borderColor: '#4B3B40',
    shadowColor: '#1A1115',
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
    borderColor: darkPalette.line,
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
    color: '#FBF5EA',
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
  selectedSpeciesSummary: {
    backgroundColor: darkPalette.accentSoft,
    borderColor: darkPalette.line,
  },
  selectedSpeciesLabel: {
    color: darkPalette.muted,
  },
  selectedSpeciesName: {
    color: darkPalette.text,
  },
  selectedSpeciesChangeText: {
    color: '#F0A1B5',
  },
  loadingText: {
    color: darkPalette.muted,
  },
  loadingErrorText: {
    color: darkPalette.muted,
  },
  swipeTitle: {
    color: darkPalette.text,
  },
  resultsPill: {
    backgroundColor: darkPalette.accentSoft,
    borderColor: darkPalette.line,
  },
  resultsPillText: {
    color: darkPalette.text,
  },
  insightCard: {
    backgroundColor: darkPalette.card,
    borderColor: darkPalette.line,
  },
  insightTitle: {
    color: darkPalette.text,
  },
  insightBody: {
    color: darkPalette.muted,
  },
  insightMeta: {
    color: '#B0A0A6',
  },
  card: {
    backgroundColor: darkPalette.card,
    shadowColor: '#1A1115',
  },
  cardGhost: {
    backgroundColor: '#3A2D33',
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
    backgroundColor: darkPalette.accentSoft,
    borderColor: darkPalette.line,
  },
  scorePill: {
    backgroundColor: darkPalette.chip,
    borderColor: darkPalette.line,
  },
  scorePillValue: {
    color: darkPalette.text,
  },
  actionButtonText: {
    color: '#FDF8F4',
  },
  summaryCard: {
    backgroundColor: darkPalette.card,
    borderColor: darkPalette.line,
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
    backgroundColor: darkPalette.chip,
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
    backgroundColor: darkPalette.chip,
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
    color: '#B0A0A6',
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
    color: '#FBF5EA',
  },
  resultRowAction: {
    color: '#F0A1B5',
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
  | 'selectedSpeciesSummary'
  | 'resultsPill'
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
  | 'selectedSpeciesLabel'
  | 'selectedSpeciesName'
  | 'selectedSpeciesChangeText'
  | 'loadingText'
  | 'loadingErrorText'
  | 'swipeTitle'
  | 'resultsPillText'
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

  const shadowBase = isDark
    ? {
        sm: { ...tokens.shadow.sm, shadowColor: '#1A1115' },
        md: { ...tokens.shadow.md, shadowColor: '#1A1115' },
        lg: { ...tokens.shadow.lg, shadowColor: '#1A1115' },
      }
    : tokens.shadow;

  return {
    apply,
    shadow: shadowBase,
    colors: {
      icon: isDark ? tokens.colors.dark.textPrimary : tokens.colors.warmMauve,
      iconAccent: isDark ? tokens.colors.softPink : tokens.colors.rose,
      iconOnPrimary: tokens.colors.softPetal,
      iconOnPastel: tokens.colors.warmMauve,
      iconSecondary: isDark ? tokens.colors.dark.textPrimary : tokens.colors.textAccentDark,
      chartTrack: isDark ? tokens.colors.dark.border : tokens.colors.softBlush,
      dot: isDark ? tokens.colors.softPink : tokens.colors.rose,
      silhouetteSurface: isDark ? tokens.colors.dark.background : tokens.colors.warmIvory,
      silhouetteInk: isDark ? tokens.colors.dark.textPrimary : tokens.colors.warmMauve,
      silhouetteMuted: isDark ? '#7A656B' : '#D8B6BE',
    },
    isDark,
    statusBarStyle: isDark ? 'light' as const : 'dark' as const,
  };
}
