import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeOut,
} from 'react-native-reanimated';
import type { EntryAnimationsValues } from 'react-native-reanimated';
import {
  applySwipeFeedback,
  favoriteKeyForItem,
  summarizePreferenceProfile,
} from '../../../../packages/recommendation-core/index.js';
import { FilterSheet } from '../components/FilterSheet';
import { NameDetailModal } from '../components/NameDetailModal';
import { PetSilhouette } from '../components/PetSilhouette';
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
import { tokens } from '../designTokens';
import type { SwipeAction, SwipeCandidate, FiltersState, UndoSnapshot } from '../types';
import { SWIPE_RESULTS_THRESHOLD } from '../types';
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
  onFiltersChange: (next: FiltersState) => void;
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
  size = 24,
  circle = false,
}: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  style: object;
  onPress: () => void;
  iconColor: string;
  size?: number;
  circle?: boolean;
}) {
  const animScale = useSharedValue(1);

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(animScale.value, { damping: 15 }) }],
  }));

  if (circle) {
    return (
      <Animated.View style={btnAnimatedStyle}>
        <Pressable
          style={[styles.circleActionButton, style]}
          onPressIn={() => { animScale.value = 0.88; }}
          onPressOut={() => { animScale.value = 1; }}
          onPress={onPress}
          accessibilityLabel={label}
          accessibilityRole="button"
        >
          <Ionicons name={iconName} size={size} color={iconColor} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={btnAnimatedStyle}>
      <Pressable
        style={[styles.actionButton, style]}
        onPressIn={() => { animScale.value = 0.92; }}
        onPressOut={() => { animScale.value = 1; }}
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <View style={styles.actionButtonContent}>
          <Ionicons name={iconName} size={20} color={iconColor} />
          <Text style={styles.actionButtonText}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const enteringFadeIn = (targetValues: EntryAnimationsValues) => {
  'worklet';
  const animations = {
    opacity: withTiming(1, { duration: 250 }),
    transform: [
      { scale: withSpring(1, { damping: 14 }) },
      { translateY: withSpring(0, { damping: 14 }) },
    ],
  };
  const initialValues = {
    opacity: 0,
    transform: [{ scale: 0.95 }, { translateY: 16 }],
  };
  return { animations, initialValues };
};

function triggerThresholdHaptics() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function SwipeScreen({
  filters,
  onFiltersChange,
  session,
  onSessionChange,
  detailCandidate,
  onOpenDetails,
  navigation,
}: SwipeScreenProps) {
  const theme = useThemeMode();
  const hasShownHint = useRef(false);
  const [showFirstHint, setShowFirstHint] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const hasThresholdHaptics = useSharedValue(false);

  // Show first-swipe hint on mount if no swipes yet
  useEffect(() => {
    if (!hasShownHint.current && session.swipes.length === 0 && session.queue.length > 0) {
      hasShownHint.current = true;
      setShowFirstHint(true);
      const timer = setTimeout(() => setShowFirstHint(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [session.swipes.length, session.queue.length]);

  const current = session.queue[0];
  const next = session.queue[1];
  const third = session.queue[2];
  const fourth = session.queue[3];
  const fifth = session.queue[4];

  const progress = session.swipes.length;
  const progressPct = Math.min((progress / SWIPE_RESULTS_THRESHOLD) * 100, 100);

  const runSwipe = useCallback(
    async (action: SwipeAction) => {
      const top = session.queue[0];
      if (!top) {
        navigation.navigate('Results');
        return;
      }

      triggerHaptics(action);

      setUndoSnapshot({
        candidate: top,
        previousPreference: session.preference,
        previousSwipesLength: session.swipes.length,
      });

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
      nextQueue = await hydrateQueue(filters, nextPreference, nextQueue, nextSeen, nextSwipes);

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
      hasThresholdHaptics.value = false;

      if (nextSwipes.length >= SWIPE_RESULTS_THRESHOLD) {
        navigation.navigate('Results');
      }
    },
    [filters, session, onSessionChange, navigation, translateX, translateY, hasThresholdHaptics],
  );

  const handleUndo = useCallback(() => {
    const snap = undoSnapshot;
    if (!snap) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const prevSwipes = session.swipes.slice(0, snap.previousSwipesLength);
    const prevSaved = session.saved.filter((entry) => entry.key !== snap.candidate.key);
    const restoredQueue = [snap.candidate, ...session.queue];

    onSessionChange({
      filters,
      preference: snap.previousPreference,
      swipes: prevSwipes,
      saved: prevSaved,
      queue: restoredQueue,
      seenKeys: session.seenKeys,
    });
    setUndoSnapshot(null);
  }, [undoSnapshot, session, filters, onSessionChange]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // Bottom-pivot: shift card down proportionally to horizontal drag magnitude
      translateY.value = e.translationY * 0.2 + Math.abs(e.translationX) * 0.12;
      // Trigger haptics once when crossing threshold during drag
      if (!hasThresholdHaptics.value && Math.abs(e.translationX) > SWIPE_TRIGGER) {
        hasThresholdHaptics.value = true;
        runOnJS(triggerThresholdHaptics)();
      }
    })
    .onEnd((e) => {
      hasThresholdHaptics.value = false;
      if (e.translationX > SWIPE_TRIGGER || e.velocityX > 400) {
        translateX.value = withTiming(CARD_OUT_DISTANCE, { duration: 250 }, () =>
          runOnJS(runSwipe)('like'),
        );
      } else if (e.translationX < -SWIPE_TRIGGER || e.velocityX < -400) {
        translateX.value = withTiming(-CARD_OUT_DISTANCE, { duration: 250 }, () =>
          runOnJS(runSwipe)('pass'),
        );
      } else {
        // Spring back with Tinder-like snap
        translateX.value = withSpring(0, { damping: 20, stiffness: 350 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 350 });
      }
    });

  // Tinder-style: rotation feels more natural with slightly wider range
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(translateX.value, [-250, 0, 250], [-12, 0, 12], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [SWIPE_TRIGGER * 0.3, SWIPE_TRIGGER], [0, 1], Extrapolation.CLAMP),
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_TRIGGER, -SWIPE_TRIGGER * 0.3], [1, 0], Extrapolation.CLAMP),
  }));

  const summary = summarizePreferenceProfile(session.preference);

  const handleMidShare = useCallback(async () => {
    const topSwipes = session.swipes
      .filter((s) => s.action === 'like')
      .slice(-5);
    const topNames = topSwipes.map((s) => s.candidate.item.name).join('、') || 'まだありません';
    const speciesText = filters.species.join('、') || '未選択';
    const vibeText = filters.vibe.length ? filters.vibe.join('・') : '指定なし';

    const shareLines = [
      `しっぽみ 診断の途中経過`,
      ``,
      `条件: ${speciesText} / ${vibeText}`,
      `傾向: ${summary.headline}`,
      ``,
      `スワイプ: ${session.swipes.length}件 / Like: ${session.preference.likes}件`,
      `最近のLike: ${topNames}`,
      ``,
      `https://sippomi.com`,
    ].join('\n');

    try {
      await Share.share({ message: shareLines });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }, [session, filters, summary.headline]);

  const detailModal = (
    <NameDetailModal
      candidate={detailCandidate}
      visible={!!detailCandidate}
      onClose={() => onOpenDetails(null)}
    />
  );

  const activeFilterCount = (
    (filters.gender.some((g) => g !== 'どちらでも') ? 1 : 0) +
    filters.color.length +
    filters.vibe.length +
    filters.length.length +
    filters.theme.length +
    (filters.tone?.length ?? 0)
  );

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <View style={styles.swipeShell}>
        {/* Slim header with filter + results */}
        <View style={[styles.swipeHeader, styles.swipeHeaderSlim]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={styles.filterBarButton}
              onPress={() => setShowFilterSheet(true)}
              accessibilityLabel="フィルター設定を開く"
              accessibilityRole="button"
            >
              <Ionicons name="options" size={14} color={theme.colors.iconOnPastel} />
              <Text style={styles.filterBarButtonText}>
                フィルター{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </Pressable>
            <Pressable
              style={[theme.apply(styles.iconButtonMuted, 'iconButtonMuted'), { width: 36, height: 36, borderRadius: 18 }]}
              onPress={handleMidShare}
              accessibilityLabel="途中経過を共有"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={15} color={theme.colors.iconAccent} />
            </Pressable>
          </View>
          <Pressable
            style={[styles.resultsPill, { paddingVertical: 6, paddingHorizontal: 12 }]}
            onPress={() => navigation.navigate('Results')}
            accessibilityLabel="結果画面へ移動"
            accessibilityRole="button"
          >
            <Ionicons name="stats-chart" size={14} color={theme.colors.iconAccent} />
            <Text style={[theme.apply(styles.resultsPillText, 'resultsPillText'), { fontSize: 12 }]}>
              {session.preference.likes}
            </Text>
          </Pressable>
        </View>

        {/* Subtle progress bar integrated under header */}
        <View style={styles.swipeProgressWrap} accessibilityLabel={`スワイプ進捗 ${progress}/${SWIPE_RESULTS_THRESHOLD}`}>
          <View style={theme.apply(styles.swipeProgressTrack, 'swipeProgressTrack')}>
            <View style={[styles.swipeProgressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Undo pill - shown briefly after each swipe */}
        {undoSnapshot ? (
          <Animated.View exiting={FadeOut.duration(200)} style={{ alignSelf: 'center', marginBottom: 4 }}>
            <Pressable
              onPress={handleUndo}
              style={theme.apply(styles.undoButton, 'undoButton')}
              accessibilityLabel="直前のスワイプを取り消す"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-undo" size={14} color={theme.colors.iconAccent} />
              <Text style={theme.apply(styles.undoButtonText, 'undoButtonText')}>
                もとに戻す
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Card deck - takes the majority of the screen */}
        <View style={styles.deck}>
          {fifth ? (
            <Animated.View
              entering={enteringFadeIn}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhost5,
              ]}
            >
              <Text style={styles.cardGhostText}>{fifth.item.name}</Text>
            </Animated.View>
          ) : null}
          {fourth ? (
            <Animated.View
              entering={enteringFadeIn}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhost4,
              ]}
            >
              <Text style={styles.cardGhostText}>{fourth.item.name}</Text>
            </Animated.View>
          ) : null}
          {third ? (
            <Animated.View
              entering={enteringFadeIn}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhost3,
              ]}
            >
              <Text style={styles.cardGhostText}>{third.item.name}</Text>
            </Animated.View>
          ) : null}
          {next ? (
            <Animated.View
              entering={enteringFadeIn}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                theme.apply(styles.card, 'card'),
                theme.apply(styles.cardGhost, 'cardGhost'),
                styles.cardGhost2,
              ]}
            >
              <Text style={styles.cardGhostText}>{next.item.name}</Text>
            </Animated.View>
          ) : null}
          {current ? (
            <GestureDetector gesture={panGesture}>
              <Animated.View
                entering={enteringFadeIn}
                collapsable={false}
                style={styles.cardGestureTarget}
              >
                <Animated.View style={cardAnimatedStyle}>
                  <View style={styles.activeSwipeCardLayer}>
                    <SwipeCard
                      candidate={current}
                      likeOverlayStyle={likeOverlayStyle}
                      passOverlayStyle={passOverlayStyle}
                      onOpenDetails={onOpenDetails}
                    />
                  </View>
                </Animated.View>
                {/* First swipe hint */}
                {showFirstHint ? (
                  <Animated.View style={styles.firstSwipeHint} entering={enteringFadeIn} exiting={FadeOut.duration(400)} pointerEvents="none">
                    <View style={theme.apply(styles.firstSwipeHintBubble, 'firstSwipeHintBubble')}>
                      <Ionicons name="arrow-forward" size={16} color={tokens.colors.softPetal} />
                      <Text style={styles.firstSwipeHintText}>左右にスワイプで診断スタート！</Text>
                    </View>
                  </Animated.View>
                ) : null}
              </Animated.View>
            </GestureDetector>
          ) : (
            <View style={[theme.apply(styles.card, 'card'), styles.emptyCard]}>
              <View style={{ alignItems: 'center', marginBottom: 16 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species={filters.species[0] || '犬'} size={72} muted />
              </View>
              <Text style={theme.apply(styles.emptyCardTitle, 'emptyCardTitle')}>
                候補を出し切りました
              </Text>
              <Text style={theme.apply(styles.emptyCardBody, 'emptyCardBody')}>
                結果画面でまとめを確認できます。
              </Text>
              <Pressable
                style={[theme.apply(styles.secondaryButton, 'secondaryButton'), { marginTop: 16 }]}
                onPress={() => navigation.navigate('Results')}
                accessibilityLabel="結果画面へ移動"
                accessibilityRole="button"
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="stats-chart" size={18} color={theme.colors.iconSecondary} />
                  <Text style={theme.apply(styles.secondaryButtonText, 'secondaryButtonText')}>結果を見る</Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {/* Tinder-style circular action buttons */}
        <View style={styles.circleActionsRow}>
          <ActionButton
            label="戻す"
            iconName="refresh"
            style={styles.circleActionUndo}
            iconColor={tokens.colors.warmMauve}
            size={22}
            circle
            onPress={handleUndo}
          />
          <ActionButton
            label="Pass"
            iconName="close"
            style={styles.circleActionPass}
            iconColor={tokens.colors.softPetal}
            size={28}
            circle
            onPress={() => {
              translateX.value = withTiming(-CARD_OUT_DISTANCE, { duration: 250 }, () =>
                runOnJS(runSwipe)('pass'),
              );
            }}
          />
          <ActionButton
            label="Hold"
            iconName="bookmark"
            style={styles.circleActionHold}
            iconColor={tokens.colors.warmMauve}
            size={22}
            circle
            onPress={() => runSwipe('hold')}
          />
          <ActionButton
            label="Like"
            iconName="heart"
            style={styles.circleActionLike}
            iconColor={tokens.colors.softPetal}
            size={28}
            circle
            onPress={() => {
              translateX.value = withTiming(CARD_OUT_DISTANCE, { duration: 250 }, () =>
                runOnJS(runSwipe)('like'),
              );
            }}
          />
          <ActionButton
            label="詳細"
            iconName="information-circle"
            style={styles.circleActionInfo}
            iconColor={tokens.colors.warmMauve}
            size={22}
            circle
            onPress={() => current && onOpenDetails(current)}
          />
        </View>
      </View>

      {/* Filter Sheet Modal */}
      {showFilterSheet && (
        <FilterSheet
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={() => setShowFilterSheet(false)}
        />
      )}

      {detailModal}
    </ScreenSafeArea>
  );
}
