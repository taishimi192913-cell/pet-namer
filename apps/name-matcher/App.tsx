import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { NameDetailModal } from './src/components/NameDetailModal';
import { ScreenSafeArea } from './src/components/ScreenSafeArea';
import { FormScreen } from './src/screens/FormScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SwipeScreen, type SessionState } from './src/screens/SwipeScreen';
import {
  DEFAULT_FILTERS,
  createEmptySession,
  createSession,
  hydrateQueue,
} from './src/session';
import {
  loadFavoriteCandidates,
  loadPersistedSession,
  savePersistedSession,
} from './src/persistence';
import { styles } from './src/styles';
import { useThemeMode } from './src/theme';
import { canRenderNativeStack } from './src/nativeCapabilities';
import type { FiltersState, RootStackParamList, SwipeCandidate } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
type AppRouteName = keyof RootStackParamList;
type AppNavigation = {
  navigate: (screen: AppRouteName) => void;
  goBack: () => void;
};

function AppContent() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [session, setSession] = useState<SessionState>(() => createEmptySession(DEFAULT_FILTERS));
  const [detailCandidate, setDetailCandidate] = useState<SwipeCandidate | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [hydrationAttempt, setHydrationAttempt] = useState(0);
  const [fallbackRoute, setFallbackRoute] = useState<AppRouteName>('Intro');
  const theme = useThemeMode();

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      setHydrationError(null);
      setIsHydrated(false);

      try {
        const persisted = await loadPersistedSession();
        const localFavorites = await loadFavoriteCandidates();

        if (!mounted) return;

        if (persisted) {
          const seenKeys = new Set(persisted.seenKeys);
          const queue = await hydrateQueue(
            persisted.filters,
            persisted.preference,
            persisted.queue,
            seenKeys,
            persisted.swipes,
          );

          if (!mounted) return;

          setFilters(persisted.filters);
          setSession({
            filters: persisted.filters,
            preference: persisted.preference,
            queue,
            swipes: persisted.swipes,
            saved: [
              ...persisted.saved,
              ...localFavorites.filter((candidate) => (
                !persisted.saved.some((entry) => entry.key === candidate.key)
              )),
            ],
            seenKeys,
          });
        } else if (localFavorites.length) {
          setSession((current) => ({
            ...current,
            saved: localFavorites,
          }));
        }

        setIsHydrated(true);
      } catch (error) {
        console.error('Failed to hydrate persisted session', error);
        if (!mounted) return;
        setHydrationError('保存済みデータを読み込めませんでした。再試行できます。');
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [hydrationAttempt]);

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

  // Rebuild queue when filters change (e.g. from SwipeScreen FilterSheet)
  const prevFiltersRef = useRef<FiltersState>(filters);
  useEffect(() => {
    if (!isHydrated || session.swipes.length === 0) return;
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;
    // Only rebuild if species or significant filters changed
    const speciesChanged =
      prev.species.join() !== filters.species.join();
    const vibeChanged = prev.vibe.length !== filters.vibe.length ||
      prev.vibe.some((v, i) => v !== filters.vibe[i]);
    if (!speciesChanged && !vibeChanged) return;

    setSession((current) => {
      void hydrateQueue(
        filters,
        current.preference,
        current.queue.slice(0, Math.min(current.queue.length, 3)),
        current.seenKeys,
        current.swipes,
      ).then((queue) => {
        setSession((prev) => ({ ...prev, queue }));
      });
      return current;
    });
  }, [filters, isHydrated, session.swipes]);

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

  async function prepareSwipeSession(nextFilters: typeof DEFAULT_FILTERS, navigate: () => void) {
    setIsPreparingSession(true);
    setHydrationError(null);
    try {
      const nextSession = await createSession(nextFilters);
      setSession(nextSession);
      navigate();
    } catch (error) {
      console.error('Failed to prepare swipe session', error);
      Alert.alert('名前データを読み込めませんでした', '少し時間をおいて、もう一度お試しください。');
    } finally {
      setIsPreparingSession(false);
    }
  }

  function FormRoute({ navigation }: { navigation: AppNavigation }) {
    return (
      <>
        <FormScreen
          filters={filters}
          onFiltersChange={setFilters}
          onBack={() => navigation.goBack()}
          onStart={() => void prepareSwipeSession(filters, () => navigation.navigate('Swipe'))}
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
            setSession(createEmptySession(DEFAULT_FILTERS));
            navigation.navigate('Form');
          }}
        />
        {detailModal}
      </>
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

  if (!isHydrated) {
    return (
      <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style={theme.statusBarStyle} />
        <View
          style={styles.loadingShell}
          accessibilityLabel={hydrationError ? '読み込みエラー' : '読み込み中'}
        >
          <View style={styles.loadingLogo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Ionicons name="paw" size={34} color={theme.colors.iconAccent} />
          </View>
          {hydrationError ? (
            <>
              <Text style={theme.apply(styles.loadingErrorText, 'loadingErrorText')}>{hydrationError}</Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => setHydrationAttempt((attempt) => attempt + 1)}
                accessibilityLabel="保存済みデータの読み込みを再試行"
                accessibilityRole="button"
              >
                <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>再試行</Text>
              </Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator color={theme.colors.iconAccent} />
              <Text style={theme.apply(styles.loadingText, 'loadingText')}>
                読み込み中...
              </Text>
            </>
          )}
        </View>
      </ScreenSafeArea>
    );
  }

  if (!canRenderNativeStack()) {
    if (fallbackRoute === 'Form') return <FormRoute navigation={fallbackNavigation} />;
    if (fallbackRoute === 'Swipe') return <SwipeScreen filters={filters} onFiltersChange={setFilters} session={session} onSessionChange={setSession} detailCandidate={detailCandidate} onOpenDetails={setDetailCandidate} navigation={fallbackNavigation as unknown as { navigate: (screen: string) => void; goBack: () => void }} />;
    if (fallbackRoute === 'Results') return <ResultsRoute navigation={fallbackNavigation} />;
    return <IntroRoute navigation={fallbackNavigation} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Intro" options={{ animation: 'fade' }}>
            {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Intro'>) => (
              <IntroRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Form" options={{
            animation: 'slide_from_right',
            animationDuration: 280,
          }}>
            {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Form'>) => (
              <FormRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Swipe" options={{
            animation: 'fade_from_bottom',
            animationDuration: 350,
          }}>
            {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Swipe'>) => (
              <SwipeScreen
                filters={filters}
                onFiltersChange={setFilters}
                session={session}
                onSessionChange={setSession}
                detailCandidate={detailCandidate}
                onOpenDetails={setDetailCandidate}
                navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Results" options={{
            animation: 'slide_from_bottom',
            animationDuration: 350,
          }}>
            {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) => (
              <ResultsRoute navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      {isPreparingSession && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#2D1F24', borderRadius: 16, padding: 24, alignItems: 'center' }}>
              <ActivityIndicator color="#F0A1B5" size="large" />
              <Text style={{ color: '#F5EDF0', marginTop: 12, fontSize: 14 }}>名前データを準備中...</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContent />
    </GestureHandlerRootView>
  );
}
