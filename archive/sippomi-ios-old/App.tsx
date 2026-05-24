import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  applySwipeFeedback,
  favoriteKeyForItem,
  summarizePreferenceProfile,
} from '../../packages/recommendation-core/index.js';
import { NameDetailModal } from './src/components/NameDetailModal';
import { ScreenSafeArea } from './src/components/ScreenSafeArea';
import { SwipeCard } from './src/components/SwipeCard';
import { FormScreen } from './src/screens/FormScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import {
  CARD_OUT_DISTANCE,
  DEFAULT_FILTERS,
  SWIPE_TRIGGER,
  createSession,
  hydrateQueue,
} from './src/session';
import {
  loadFavoriteCandidates,
  loadPersistedSession,
  saveFavoriteCandidate,
  savePersistedSession,
} from './src/persistence';
import { styles } from './src/styles';
import { useThemeMode } from './src/theme';
import { canRenderNativeStack } from './src/nativeCapabilities';
import type { RootStackParamList, SwipeAction, SwipeCandidate } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
type AppRouteName = keyof RootStackParamList;
type AppNavigation = {
  navigate: (screen: AppRouteName) => void;
  goBack: () => void;
};

function AppContent() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [session, setSession] = useState(() => createSession(DEFAULT_FILTERS));
  const [detailCandidate, setDetailCandidate] = useState<SwipeCandidate | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [fallbackRoute, setFallbackRoute] = useState<AppRouteName>('Intro');
  const theme = useThemeMode();

  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const persisted = await loadPersistedSession();
      const localFavorites = await loadFavoriteCandidates();

      if (!mounted) return;

      if (persisted) {
        setFilters(persisted.filters);
        setSession({
          filters: persisted.filters,
          preference: persisted.preference,
          queue: persisted.queue,
          swipes: persisted.swipes,
          saved: [
            ...persisted.saved,
            ...localFavorites.filter((candidate) => (
              !persisted.saved.some((entry) => entry.key === candidate.key)
            )),
          ],
          seenKeys: new Set(persisted.seenKeys),
        });
      } else if (localFavorites.length) {
        setSession((current) => ({
          ...current,
          saved: localFavorites,
        }));
      }

      setIsHydrated(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    void savePersistedSession({
      filters,
      preference: session.preference,
      queue: session.queue,
      swipes: session.swipes,
      saved: session.saved,
      seenKeys: [...session.seenKeys],
    });
  }, [filters, isHydrated, session]);

  function resetCardPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
    }).start();
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

  function runSwipe(action: SwipeAction, navigation: AppNavigation) {
    const current = session.queue[0];
    if (!current) {
      navigation.navigate('Results');
      return;
    }

    triggerHaptics(action);

    const nextPreference = applySwipeFeedback(session.preference, current.item, action);
    const nextSwipes = [...session.swipes, { action, candidate: current }];
    const nextSaved = action === 'like'
      ? [current, ...session.saved.filter((entry) => entry.key !== current.key)]
      : session.saved;
    if (action === 'like') {
      void saveFavoriteCandidate(current);
    }

    const nextSeen = new Set(session.seenKeys);
    nextSeen.add(favoriteKeyForItem(current.item));

    let nextQueue = session.queue.slice(1);
    nextQueue = hydrateQueue(filters, nextPreference, nextQueue, nextSeen, nextSwipes);

    setSession({
      filters,
      preference: nextPreference,
      swipes: nextSwipes,
      saved: nextSaved,
      queue: nextQueue,
      seenKeys: nextSeen,
    });

    position.setValue({ x: 0, y: 0 });

    if (!nextQueue.length || nextSwipes.length >= 18) {
      navigation.navigate('Results');
    }
  }

  function animateOut(action: Exclude<SwipeAction, 'hold'>, navigation: AppNavigation) {
    Animated.timing(position, {
      toValue: { x: action === 'like' ? CARD_OUT_DISTANCE : -CARD_OUT_DISTANCE, y: 30 },
      duration: 180,
      useNativeDriver: true,
    }).start(() => runSwipe(action, navigation));
  }

  const detailModal = (
    <NameDetailModal
      candidate={detailCandidate}
      visible={!!detailCandidate}
      onClose={() => setDetailCandidate(null)}
    />
  );

  function IntroRoute({ navigation }: { navigation: AppNavigation }) {
    return (
      <>
        <IntroScreen onStart={() => navigation.navigate('Form')} />
        {detailModal}
      </>
    );
  }

  function FormRoute({ navigation }: { navigation: AppNavigation }) {
    return (
      <>
        <FormScreen
          filters={filters}
          onFiltersChange={setFilters}
          onBack={() => navigation.goBack()}
          onStart={() => {
            const nextSession = createSession(filters);
            setSession(nextSession);
            navigation.navigate('Swipe');
          }}
        />
        {detailModal}
      </>
    );
  }

  function ResultsRoute({ navigation }: { navigation: AppNavigation }) {
    return (
      <>
        <ResultsScreen
          filters={filters}
          swipes={session.swipes}
          preference={session.preference}
          saved={session.saved}
          onOpenDetails={setDetailCandidate}
          onBack={() => navigation.goBack()}
          onResume={() => navigation.navigate('Swipe')}
          onRestart={() => {
            setFilters(DEFAULT_FILTERS);
            setSession(createSession(DEFAULT_FILTERS));
            navigation.navigate('Form');
          }}
        />
        {detailModal}
      </>
    );
  }

  function SwipeRoute({ navigation }: { navigation: AppNavigation }) {
    const scopedPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => (
        Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8
      ),
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.25 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_TRIGGER) {
          animateOut('like', navigation);
          return;
        }
        if (gestureState.dx < -SWIPE_TRIGGER) {
          animateOut('pass', navigation);
          return;
        }
        resetCardPosition();
      },
    });

    const current = session.queue[0];
    const next = session.queue[1];
    const third = session.queue[2];
    const summary = summarizePreferenceProfile(session.preference);
    const rotation = position.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-12deg', '0deg', '12deg'],
    });
    const likeOverlayOpacity = position.x.interpolate({
      inputRange: [0, SWIPE_TRIGGER],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const passOverlayOpacity = position.x.interpolate({
      inputRange: [-SWIPE_TRIGGER, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style={theme.statusBarStyle} />
        <View style={styles.swipeShell}>
          <View style={styles.swipeHeader}>
            <View>
              <Text style={styles.eyebrow}>Swipe Mode</Text>
              <Text style={theme.apply(styles.swipeTitle, 'swipeTitle')}>Like / Pass で好みを学習中</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Results')}>
              <View style={styles.textButtonRow}>
                <Ionicons name="share-outline" size={17} color={theme.colors.iconAccent} />
                <Text style={styles.textButton}>結果へ</Text>
              </View>
            </Pressable>
          </View>

          <View style={theme.apply(styles.insightCard, 'insightCard')}>
            <Text style={theme.apply(styles.insightTitle, 'insightTitle')}>現在の傾向</Text>
            <Text style={theme.apply(styles.insightBody, 'insightBody')}>{summary.headline}</Text>
            <Text style={theme.apply(styles.insightMeta, 'insightMeta')}>
              {session.swipes.length} 件スワイプ済み / Like {session.preference.likes} 件 / Pass {session.preference.passes} 件
            </Text>
          </View>

          <View style={styles.deck}>
            {third ? (
              <View style={[theme.apply(styles.card, 'card'), theme.apply(styles.cardGhost, 'cardGhost'), styles.cardGhostBack]}>
                <Text style={styles.cardGhostText}>{third.item.name}</Text>
              </View>
            ) : null}
            {next ? (
              <View style={[theme.apply(styles.card, 'card'), theme.apply(styles.cardGhost, 'cardGhost'), styles.cardGhostMiddle]}>
                <Text style={styles.cardGhostText}>{next.item.name}</Text>
              </View>
            ) : null}
            {current ? (
              <View {...scopedPanResponder.panHandlers}>
                <SwipeCard
                  candidate={current}
                  likeOverlayOpacity={likeOverlayOpacity}
                  passOverlayOpacity={passOverlayOpacity}
                  onOpenDetails={setDetailCandidate}
                  animatedStyle={[
                    {
                      transform: [
                        { translateX: position.x },
                        { translateY: position.y },
                        { rotate: rotation },
                      ],
                    },
                  ]}
                />
              </View>
            ) : (
              <View style={[theme.apply(styles.card, 'card'), styles.emptyCard]}>
                <Text style={theme.apply(styles.emptyCardTitle, 'emptyCardTitle')}>候補を出し切りました</Text>
                <Text style={theme.apply(styles.emptyCardBody, 'emptyCardBody')}>結果画面でまとめを確認できます。</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, styles.actionPass]} onPress={() => animateOut('pass', navigation)}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="close" size={18} color={theme.colors.icon} />
                <Text style={theme.apply(styles.actionButtonText, 'actionButtonText')}>Pass</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionHold]} onPress={() => runSwipe('hold', navigation)}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="bookmark" size={18} color={theme.colors.icon} />
                <Text style={theme.apply(styles.actionButtonText, 'actionButtonText')}>Hold</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionLike]} onPress={() => animateOut('like', navigation)}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="heart" size={18} color={theme.colors.icon} />
                <Text style={theme.apply(styles.actionButtonText, 'actionButtonText')}>Like</Text>
              </View>
            </Pressable>
          </View>
        </View>
        {detailModal}
      </ScreenSafeArea>
    );
  }

  const fallbackNavigation: AppNavigation = {
    navigate: setFallbackRoute,
    goBack: () => setFallbackRoute((currentRoute) => {
      if (currentRoute === 'Results') return 'Swipe';
      if (currentRoute === 'Swipe') return 'Form';
      if (currentRoute === 'Form') return 'Intro';
      return 'Intro';
    }),
  };

  if (!canRenderNativeStack()) {
    if (fallbackRoute === 'Form') return <FormRoute navigation={fallbackNavigation} />;
    if (fallbackRoute === 'Swipe') return <SwipeRoute navigation={fallbackNavigation} />;
    if (fallbackRoute === 'Results') return <ResultsRoute navigation={fallbackNavigation} />;
    return <IntroRoute navigation={fallbackNavigation} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Intro">
          {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Intro'>) => (
            <IntroRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Form">
          {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Form'>) => (
            <FormRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Swipe">
          {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Swipe'>) => (
            <SwipeRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Results">
          {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) => (
            <ResultsRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return <AppContent />;
}
