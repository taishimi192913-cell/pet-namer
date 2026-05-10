import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
  createSession,
} from './src/session';
import {
  loadFavoriteCandidates,
  loadPersistedSession,
  savePersistedSession,
} from './src/persistence';
import { styles } from './src/styles';
import { useThemeMode } from './src/theme';
import { canRenderNativeStack } from './src/nativeCapabilities';
import type { RootStackParamList, SwipeCandidate } from './src/types';

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
              <Text style={theme.apply(styles.loadingText, 'loadingText')}>読み込み中...</Text>
            </>
          )}
        </View>
      </ScreenSafeArea>
    );
  }

  if (!canRenderNativeStack()) {
    if (fallbackRoute === 'Form') return <FormRoute navigation={fallbackNavigation} />;
    if (fallbackRoute === 'Swipe') return <SwipeScreen filters={filters} session={session} onSessionChange={setSession} detailCandidate={detailCandidate} onOpenDetails={setDetailCandidate} navigation={fallbackNavigation as unknown as { navigate: (screen: string) => void; goBack: () => void }} />;
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
            <SwipeScreen
              filters={filters}
              session={session}
              onSessionChange={setSession}
              detailCandidate={detailCandidate}
              onOpenDetails={setDetailCandidate}
              navigation={{ navigate: navigation.navigate, goBack: navigation.goBack }}
            />
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContent />
    </GestureHandlerRootView>
  );
}
