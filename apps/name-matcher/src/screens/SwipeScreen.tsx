import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import {
  applySwipeFeedback,
  favoriteKeyForItem,
  summarizePreferenceProfile,
} from '../../../../packages/recommendation-core/index.js';
import { NameDetailModal } from '../components/NameDetailModal';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { SwipeCard } from '../components/SwipeCard';
import {
  CARD_OUT_DISTANCE,
  SWIPE_TRIGGER,
  hydrateQueue,
} from '../session';
import { saveFavoriteCandidate } from '../persistence';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import type { SwipeAction, SwipeCandidate, FiltersState } from '../types';
import type { PreferenceProfile, SwipeRecord } from '../types';

export interface SessionState {
  filters: FiltersState;
  preference: PreferenceProfile;
  queue: SwipeCandidate[];
  swipes: SwipeRecord[];
  saved: SwipeCandidate[];
  seenKeys: Set<string>;
}

interface SwipeScreenProps {
  filters: FiltersState;
  session: SessionState;
  onSessionChange: (session: SessionState) => void;
  detailCandidate: SwipeCandidate | null;
  onOpenDetails: (candidate: SwipeCandidate | null) => void;
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

function triggerHaptics(action: SwipeAction) {
  if (action === 'like') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }
  if (action === 'pass') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

function ActionButton({
  label,
  iconName,
  style,
  onPress,
  iconColor,
}: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  style: object;
  onPress: () => void;
  iconColor: string;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      style={{ flex: 1 }}
      animate={{ scale: pressed ? 0.96 : 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <Pressable
        style={[styles.actionButton, style]}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <View style={styles.actionButtonContent}>
          <Ionicons name={iconName} size={20} color={iconColor} />
          <Text style={styles.actionButtonText}>{label}</Text>
        </View>
      </Pressable>
    </MotiView>
  );
}

export function SwipeScreen({
  filters,
  session,
  onSessionChange,
  detailCandidate,
  onOpenDetails,
  navigation,
}: SwipeScreenProps) {
  const theme = useThemeMode();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  const current = session.queue[0];
  const next = session.queue[1];
  const third = session.queue[2];

  const runSwipe = useCallback(
    (action: SwipeAction) => {
      const top = session.queue[0];
      if (!top) {
        navigation.navigate('Results');
        return;
      }

      triggerHaptics(action);

      const nextPreference = applySwipeFeedback(session.preference, top.item, action);
      const nextSwipes: SwipeRecord[] = [...session.swipes, { action, candidate: top }];
      const nextSaved =
        action === 'like'
          ? [top, ...session.saved.filter((entry) => entry.key !== top.key)]
          : session.saved;
      if (action === 'like') {
        void saveFavoriteCandidate(top);
      }

      const nextSeen = new Set(session.seenKeys);
      nextSeen.add(favoriteKeyForItem(top.item));

      let nextQueue = session.queue.slice(1);
      nextQueue = hydrateQueue(filters, nextPreference, nextQueue, nextSeen, nextSwipes);

      onSessionChange({
        filters,
        preference: nextPreference,
        swipes: nextSwipes,
        saved: nextSaved,
        queue: nextQueue,
        seenKeys: nextSeen,
      });

      translateX.value = 0;
      translateY.value = 0;

      if (!nextQueue.length || nextSwipes.length >= 18) {
        navigation.navigate('Results');
      }
    },
    [filters, session, onSessionChange, navigation, translateX, translateY],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_TRIGGER) {
        translateX.value = withTiming(CARD_OUT_DISTANCE, { duration: 180 }, () =>
          runOnJS(runSwipe)('like'),
        );
      } else if (e.translationX < -SWIPE_TRIGGER) {
        translateX.value = withTiming(-CARD_OUT_DISTANCE, { duration: 180 }, () =>
          runOnJS(runSwipe)('pass'),
        );
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(translateX.value, [-200, 0, 200], [-12, 0, 12], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_TRIGGER], [0, 1], Extrapolation.CLAMP),
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_TRIGGER, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const summary = summarizePreferenceProfile(session.preference);

  const detailModal = (
    <NameDetailModal
      candidate={detailCandidate}
      visible={!!detailCandidate}
      onClose={() => onOpenDetails(null)}
    />
  );

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <View style={styles.swipeShell}>
        <View style={styles.swipeHeader}>
          <View>
            <Text style={styles.eyebrow}>Swipe Mode</Text>
            <Text style={theme.apply(styles.swipeTitle, 'swipeTitle')}>
              Like / Pass で好みを学習中
            </Text>
          </View>
          <Pressable
            style={theme.apply(styles.resultsPill, 'resultsPill')}
            onPress={() => navigation.navigate('Results')}
            accessibilityLabel="結果画面へ移動"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="stats-chart" size={16} color={theme.colors.iconAccent} />
            <Text style={theme.apply(styles.resultsPillText, 'resultsPillText')}>
              結果を見る ({session.preference.likes})
            </Text>
          </Pressable>
        </View>

        <View style={theme.apply(styles.insightCard, 'insightCard')}>
          <Text style={theme.apply(styles.insightTitle, 'insightTitle')}>現在の傾向</Text>
          <Text style={theme.apply(styles.insightBody, 'insightBody')}>{summary.headline}</Text>
          <Text style={theme.apply(styles.insightMeta, 'insightMeta')}>
            {session.swipes.length} 件スワイプ済み / Like {session.preference.likes} 件 / Pass{' '}
            {session.preference.passes} 件
          </Text>
        </View>

        <View style={styles.deck}>
          {third ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhostBack,
              ]}
            >
              <Text style={styles.cardGhostText}>{third.item.name}</Text>
            </MotiView>
          ) : null}
          {next ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhostMiddle,
              ]}
            >
              <Text style={styles.cardGhostText}>{next.item.name}</Text>
            </MotiView>
          ) : null}
          {current ? (
            <GestureDetector gesture={panGesture}>
              <MotiView
                from={{ opacity: 0, scale: 0.92, translateY: 24 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
              >
                <Animated.View style={cardAnimatedStyle}>
                  <SwipeCard
                    candidate={current}
                    likeOverlayStyle={likeOverlayStyle}
                    passOverlayStyle={passOverlayStyle}
                    onOpenDetails={onOpenDetails}
                  />
                </Animated.View>
              </MotiView>
            </GestureDetector>
          ) : (
            <View style={[theme.apply(styles.card, 'card'), styles.emptyCard]}>
              <Text style={theme.apply(styles.emptyCardTitle, 'emptyCardTitle')}>
                候補を出し切りました
              </Text>
              <Text style={theme.apply(styles.emptyCardBody, 'emptyCardBody')}>
                結果画面でまとめを確認できます。
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <ActionButton
            label="Pass"
            iconName="close"
            style={styles.actionPass}
            iconColor={theme.colors.iconOnPastel}
            onPress={() => {
              translateX.value = withTiming(-CARD_OUT_DISTANCE, { duration: 180 }, () =>
                runOnJS(runSwipe)('pass'),
              );
            }}
          />
          <ActionButton
            label="Hold"
            iconName="bookmark"
            style={styles.actionHold}
            iconColor={theme.colors.iconOnPastel}
            onPress={() => runSwipe('hold')}
          />
          <ActionButton
            label="Like"
            iconName="heart"
            style={styles.actionLike}
            iconColor={theme.colors.iconOnPastel}
            onPress={() => {
              translateX.value = withTiming(CARD_OUT_DISTANCE, { duration: 180 }, () =>
                runOnJS(runSwipe)('like'),
              );
            }}
          />
        </View>
      </View>
      {detailModal}
    </ScreenSafeArea>
  );
}
