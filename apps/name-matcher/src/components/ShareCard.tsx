import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PetSilhouette } from './PetSilhouette';
import { tokens } from '../designTokens';
import { useThemeMode } from '../theme';
import type { FiltersState } from '../types';

interface ShareCardProps {
  filters: FiltersState;
  topNames: string[];
  headline: string;
  swipesCount: number;
  likesCount: number;
  savedCount: number;
  isMidSwipe?: boolean;
}

export function ShareCard({
  filters, topNames, headline, swipesCount, likesCount, savedCount, isMidSwipe,
}: ShareCardProps) {
  const theme = useThemeMode();
  const d = theme.isDark;
  const species = filters.species[0] || '犬';
  const vibeText = filters.vibe.length ? filters.vibe.join('・') : '指定なし';
  const toneText = filters.tone.length ? filters.tone.join('・') : '指定なし';

  const bgColor = d ? tokens.colors.dark.card : tokens.colors.petalWhite;
  const borderColor = d ? tokens.colors.dark.border : tokens.colors.roseQuartz;
  const headerColor = d ? tokens.colors.dark.textPrimary : tokens.colors.warmMauve;
  const mutedColor = d ? tokens.colors.dark.textTertiary : tokens.colors.muted;
  const conditionBg = d ? tokens.colors.dark.chip : tokens.colors.softPetal;
  const conditionText = d ? tokens.colors.dark.textSecondary : tokens.colors.warmMauve;
  const headlineColor = d ? tokens.colors.dark.textPrimary : tokens.colors.deepMauve;
  const statBg = d ? tokens.colors.dark.accent : tokens.colors.warmIvory;
  const statNumColor = d ? tokens.colors.dark.textPrimary : tokens.colors.warmMauve;
  const pillDefaultBg = d ? tokens.colors.dark.accent : tokens.colors.roseQuartz;
  const iconBg = d ? tokens.colors.dark.accent : tokens.colors.softPetal;

  const namePills = useMemo(() => topNames.slice(0, 5).map((name, i) => ({
    key: name,
    bg: i === 0 ? tokens.colors.gold : i === 1 ? tokens.colors.silver : pillDefaultBg,
    textColor: i < 2 ? tokens.colors.petalWhite : (d ? tokens.colors.dark.textPrimary : tokens.colors.warmMauve),
    label: `${i + 1}. ${name}`,
  })), [topNames, pillDefaultBg, d]);

  return (
    <View style={[shareStyles.card, { backgroundColor: bgColor, borderColor }]}>
      {/* Header */}
      <View style={shareStyles.header}>
        <View style={[shareStyles.iconCircle, { backgroundColor: iconBg }]}>
          <PetSilhouette species={species} size={40} />
        </View>
        <View style={shareStyles.headerText}>
          <Text style={[shareStyles.brand, { color: mutedColor }]}>SHIPPOMI</Text>
          <Text style={[shareStyles.title, { color: headerColor }]}>
            {isMidSwipe ? '診断の途中経過' : '名前診断の結果'}
          </Text>
        </View>
      </View>

      {/* Conditions */}
      <View style={[shareStyles.conditionBox, { backgroundColor: conditionBg }]}>
        <Text style={[shareStyles.conditionLabel, { color: mutedColor }]}>条件</Text>
        <Text style={[shareStyles.conditionText, { color: conditionText }]}>
          種類: {filters.species.join(' / ')}  |  雰囲気: {vibeText}  |  響き: {toneText}
        </Text>
      </View>

      {/* Headline */}
      <Text style={[shareStyles.headline, { color: headlineColor }]}>{headline}</Text>

      {/* Top Names */}
      {namePills.length > 0 && (
        <View style={shareStyles.pillRow}>
          {namePills.map((p) => (
            <View key={p.key} style={[shareStyles.pill, { backgroundColor: p.bg }]}>
              <Text style={[shareStyles.pillText, { color: p.textColor }]}>{p.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={[shareStyles.statRow, { backgroundColor: statBg }]}>
        <View style={shareStyles.statItem}>
          <Text style={[shareStyles.statNum, { color: statNumColor }]}>{swipesCount}</Text>
          <Text style={[shareStyles.statLabel, { color: mutedColor }]}>スワイプ</Text>
        </View>
        <View style={shareStyles.statItem}>
          <Text style={[shareStyles.statNum, { color: d ? tokens.colors.dark.accentPink : tokens.colors.rose }]}>{likesCount}</Text>
          <Text style={[shareStyles.statLabel, { color: mutedColor }]}>Like</Text>
        </View>
        <View style={shareStyles.statItem}>
          <Text style={[shareStyles.statNum, { color: d ? tokens.colors.dark.accentPink : tokens.colors.cornflower }]}>{savedCount}</Text>
          <Text style={[shareStyles.statLabel, { color: mutedColor }]}>保存</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={[shareStyles.footer, { color: mutedColor }]}>
        sippomi.com  |  ペットの名前診断アプリ
      </Text>
    </View>
  );
}

const shareStyles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    marginBottom: tokens.spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.sm,
  },
  headerText: { flex: 1 },
  brand: { fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  conditionBox: {
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  conditionLabel: { fontSize: 11, marginBottom: 4 },
  conditionText: { fontSize: 13, lineHeight: 20 },
  headline: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: tokens.spacing.sm,
  },
  pill: {
    borderRadius: tokens.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10 },
  footer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
});
