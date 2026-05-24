import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { secondaryReadingIfAny } from '../../../../packages/recommendation-core/index.js';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import type { SwipeCandidate } from '../types';

function tagList(candidate: SwipeCandidate) {
  const item = candidate.item;
  return [
    ...item.species,
    item.gender,
    ...(item.vibe || []),
    ...(item.color || []).filter((value) => value !== 'なし'),
    ...(item.theme || []),
    item.length ? `${item.length === '4+' ? '4文字以上' : `${item.length}文字`}` : null,
  ].filter(Boolean) as string[];
}

export function NameDetailModal({
  candidate,
  visible,
  onClose,
}: {
  candidate: SwipeCandidate | null;
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useThemeMode();
  const slide = useRef(new Animated.Value(36)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      slide.setValue(36);
      fade.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, visible]);

  if (!candidate) return null;

  const reading = secondaryReadingIfAny(candidate.item.name, candidate.item.reading);
  const tags = tagList(candidate);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalBackdrop, { opacity: fade }]}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
      </Animated.View>
      <View style={styles.modalDock}>
        <Animated.View style={[theme.apply(styles.nameModalCard, 'nameModalCard'), { transform: [{ translateY: slide }] }]}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.nameModalContent}>
            <Text style={styles.modalEyebrow}>{candidate.recommendationLabel}</Text>
            <Text style={theme.apply(styles.nameModalTitle, 'nameModalTitle')}>{candidate.item.name}</Text>
            {reading ? <Text style={theme.apply(styles.nameModalReading, 'nameModalReading')}>{reading}</Text> : null}
            <Text style={theme.apply(styles.nameModalMeaning, 'nameModalMeaning')}>{candidate.item.meaning}</Text>

            <View style={styles.nameModalTagWrap}>
              {tags.map((tag) => (
                <View key={tag} style={theme.apply(styles.nameModalTag, 'nameModalTag')}>
                  <Text style={theme.apply(styles.nameModalTagText, 'nameModalTagText')}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={theme.apply(styles.nameModalReasonCard, 'nameModalReasonCard')}>
              <Text style={theme.apply(styles.nameModalSectionTitle, 'nameModalSectionTitle')}>おすすめ理由</Text>
              <Text style={theme.apply(styles.nameModalReasonText, 'nameModalReasonText')}>
                {candidate.reasonParts.length
                  ? `${candidate.reasonParts.join('、')} の条件に合いやすく、総合スコアは ${Math.round(candidate.scores.total * 100)}% です。初期条件・学習傾向・候補の新鮮さを合わせて、今の診断セッションで検討しやすい名前として表示しています。`
                  : `総合スコアは ${Math.round(candidate.scores.total * 100)}% です。意味や響き、現在の条件との相性を見ながら候補として残せます。`}
              </Text>
            </View>

            <View style={styles.nameModalScoreRow}>
              <Text style={theme.apply(styles.nameModalScoreText, 'nameModalScoreText')}>初期条件 {Math.round(candidate.scores.initialFit * 100)}%</Text>
              <Text style={theme.apply(styles.nameModalScoreText, 'nameModalScoreText')}>学習 {Math.round(candidate.scores.learnedPreference * 100)}%</Text>
              <Text style={theme.apply(styles.nameModalScoreText, 'nameModalScoreText')}>新鮮さ {Math.round(candidate.scores.diversityBoost * 100)}%</Text>
            </View>

            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={theme.apply(styles.modalCloseButtonText, 'modalCloseButtonText')}>閉じる</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
