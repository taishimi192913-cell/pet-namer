import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { secondaryReadingIfAny } from '../../../../packages/recommendation-core/index.js';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import type { AnimatedCardStyle, SwipeCandidate } from '../types';
import { toPercent } from '../session';
import { ScorePill } from './ScorePill';

export function SwipeCard({
  candidate,
  animatedStyle,
  likeOverlayOpacity,
  passOverlayOpacity,
  onOpenDetails,
}: {
  candidate: SwipeCandidate;
  animatedStyle?: AnimatedCardStyle;
  likeOverlayOpacity?: Animated.AnimatedInterpolation<string | number>;
  passOverlayOpacity?: Animated.AnimatedInterpolation<string | number>;
  onOpenDetails?: (candidate: SwipeCandidate) => void;
}) {
  const theme = useThemeMode();
  const reading = secondaryReadingIfAny(candidate.item.name, candidate.item.reading);

  return (
    <Animated.View style={[theme.apply(styles.card, 'card'), animatedStyle]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackLike, { opacity: likeOverlayOpacity || 0 }]}
      >
        <Text style={styles.swipeFeedbackText}>LIKE</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackPass, { opacity: passOverlayOpacity || 0 }]}
      >
        <Text style={styles.swipeFeedbackText}>PASS</Text>
      </Animated.View>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>{candidate.recommendationLabel}</Text>
        <Text style={theme.apply(styles.cardScore, 'cardScore')}>{Math.round(candidate.scores.total * 100)}%</Text>
      </View>

      <Pressable onPress={() => onOpenDetails?.(candidate)}>
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
      </View>

      <View style={styles.scoreGrid}>
        <ScorePill label="初期条件" value={toPercent(candidate.scores.initialFit)} />
        <ScorePill label="学習" value={toPercent(candidate.scores.learnedPreference)} />
        <ScorePill label="新鮮さ" value={toPercent(candidate.scores.diversityBoost)} />
      </View>
    </Animated.View>
  );
}
