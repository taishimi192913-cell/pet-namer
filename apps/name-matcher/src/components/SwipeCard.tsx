import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { secondaryReadingIfAny } from '../../../../packages/recommendation-core/index.js';
import { styles } from '../styles';
import { tokens } from '../designTokens';
import { useThemeMode } from '../theme';
import type { AnimatedCardStyle, SwipeCandidate } from '../types';
import { toPercent } from '../session';
import { ScorePill } from './ScorePill';

// gptimage2.0 generated card texture
const cardTexture = require('../../assets/images-generated/card_bg_texture.png');

const SPECIES_ACCENT: Record<string, string> = {
  '犬': tokens.colors.speciesDog,
  '猫': tokens.colors.speciesCat,
  'うさぎ': tokens.colors.speciesRabbit,
  'ハムスター': tokens.colors.speciesHamster,
  '鳥': tokens.colors.speciesBird,
  '爬虫類': tokens.colors.speciesReptile,
  '魚': tokens.colors.speciesFish,
  '小動物': tokens.colors.speciesSmall,
};

function primarySpecies(item: { species: string[] }): string | undefined {
  return item.species[0];
}

function toneLabel(value: string): string {
  const map: Record<string, string> = {
    'やわらかい': 'やわらか',
    'かたい': 'かたい',
    'さわやか': 'さわやか',
    'あたたかい': 'あたたか',
    'ほのぼの': 'ほのぼの',
  };
  return map[value] || value;
}

export function SwipeCard({
  candidate,
  animatedStyle,
  likeOverlayStyle,
  passOverlayStyle,
  onOpenDetails,
}: {
  candidate: SwipeCandidate;
  animatedStyle?: AnimatedCardStyle;
  likeOverlayStyle?: StyleProp<ViewStyle>;
  passOverlayStyle?: StyleProp<ViewStyle>;
  onOpenDetails?: (candidate: SwipeCandidate) => void;
}) {
  const theme = useThemeMode();
  const reading = secondaryReadingIfAny(candidate.item.name, candidate.item.reading);
  const species = primarySpecies(candidate.item);
  const accentColor = species ? SPECIES_ACCENT[species] || tokens.colors.softPink : tokens.colors.softPink;

  const textureStyle = useMemo(() => ({ opacity: 0.07, borderRadius: 30 }), []);
  const accentBarStyle = useMemo(() => ({ backgroundColor: accentColor }), [accentColor]);
  const pillBgStyle = useMemo(() => ({ backgroundColor: accentColor + '30' }), [accentColor]);
  const pillTextStyle = useMemo(() => ({ color: accentColor }), [accentColor]);

  return (
    <Animated.View style={[theme.apply(styles.card, 'card'), animatedStyle]}>
      {/* gptimage2.0 subtle texture overlay */}
      <Image
        source={cardTexture}
        style={[StyleSheet.absoluteFill, textureStyle]}
        resizeMode="repeat"
      />
      {/* Species color accent bar at top */}
      <View style={[styles.cardAccentBar, accentBarStyle]} />

      {/* Stamp-style overlays with gradient border + rotated text */}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackLike, styles.swipeFeedbackLikeBorder, likeOverlayStyle]}
      >
        <Text style={styles.swipeFeedbackLikeStamp}>LIKE</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackPass, styles.swipeFeedbackPassBorder, passOverlayStyle]}
      >
        <Text style={styles.swipeFeedbackPassStamp}>PASS</Text>
      </Animated.View>

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {species ? (
            <View style={[styles.cardSpeciesPill, pillBgStyle]}>
              <Text style={[styles.cardSpeciesPillText, pillTextStyle]}>{species}</Text>
            </View>
          ) : null}
          <Text style={styles.cardLabel}>{candidate.recommendationLabel}</Text>
        </View>
        <Text style={theme.apply(styles.cardScore, 'cardScore')}>{Math.round(candidate.scores.total * 100)}%</Text>
      </View>

      <Pressable
        onPress={() => onOpenDetails?.(candidate)}
        accessibilityLabel={`名前の詳細を見る: ${candidate.item.name}`}
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={theme.apply(styles.cardName, 'cardName')}>{candidate.item.name}</Text>
      </Pressable>
      {reading ? <Text style={theme.apply(styles.cardReading, 'cardReading')}>{reading}</Text> : null}
      <Text style={theme.apply(styles.cardMeaning, 'cardMeaning')}>{candidate.item.meaning}</Text>

      <View style={styles.metaWrap}>
        {candidate.reasonParts.map((part) => (
          <View key={part} style={theme.apply(styles.metaChip, 'metaChip')}>
            <Text style={styles.metaChipText}>{part}</Text>
          </View>
        ))}
        {candidate.item.tone?.map((t) => (
          <View key={t} style={theme.apply(styles.toneChip, 'toneChip')}>
            <Text style={styles.toneChipText}>{toneLabel(t)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.scoreGrid}>
        <ScorePill label="初期条件" value={toPercent(candidate.scores.initialFit)} />
        <ScorePill label="学習" value={toPercent(candidate.scores.learnedPreference)} />
        <ScorePill label="新鮮さ" value={toPercent(candidate.scores.diversityBoost)} />
      </View>
    </Animated.View>
  );
}
