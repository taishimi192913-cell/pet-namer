import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { secondaryReadingIfAny } from '../../../../packages/recommendation-core/index.js';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import type { AnimatedCardStyle, SwipeCandidate } from '../types';
import { toPercent } from '../session';
import { ScorePill } from './ScorePill';

// gptimage2.0 generated card texture
const cardTexture = require('../../assets/images-generated/card_bg_texture.png');

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

  return (
    <Animated.View style={[theme.apply(styles.card, 'card'), animatedStyle]}>
      {/* gptimage2.0 subtle texture overlay */}
      <Image
        source={cardTexture}
        style={[StyleSheet.absoluteFill, { opacity: 0.07, borderRadius: 30 }]}
        resizeMode="repeat"
      />
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackLike, likeOverlayStyle]}
      >
        <Text style={styles.swipeFeedbackText}>LIKE</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.swipeFeedbackOverlay, styles.swipeFeedbackPass, passOverlayStyle]}
      >
        <Text style={styles.swipeFeedbackText}>PASS</Text>
      </Animated.View>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>{candidate.recommendationLabel}</Text>
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
      </View>

      <View style={styles.scoreGrid}>
        <ScorePill label="初期条件" value={toPercent(candidate.scores.initialFit)} />
        <ScorePill label="学習" value={toPercent(candidate.scores.learnedPreference)} />
        <ScorePill label="新鮮さ" value={toPercent(candidate.scores.diversityBoost)} />
      </View>
    </Animated.View>
  );
}
