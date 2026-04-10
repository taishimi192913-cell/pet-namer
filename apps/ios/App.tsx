import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import namesData from './src/data/names.json';
import {
  COLOR_OPTIONS,
  GENDER_OPTIONS,
  LENGTH_OPTIONS,
  SPECIES_OPTIONS,
  SWIPE_QUEUE_DEFAULT,
  SWIPE_REPLENISH_THRESHOLD,
  THEME_OPTIONS,
  VIBE_OPTIONS,
  applySwipeFeedback,
  buildSwipeQueue,
  createEmptyPreferenceProfile,
  favoriteKeyForItem,
  secondaryReadingIfAny,
  summarizePreferenceProfile,
  topLikedNames,
} from '../../packages/recommendation-core/index.js';

type SwipeAction = 'like' | 'pass' | 'hold';
type Stage = 'intro' | 'form' | 'swipe' | 'results';

type PetName = {
  name: string;
  reading?: string;
  meaning: string;
  species: string[];
  gender: string;
  vibe: string[];
  color: string[];
  length?: string;
  theme?: string[];
};

type FiltersState = {
  species: string[];
  gender: string[];
  color: string[];
  vibe: string[];
  length: string[];
  theme: string[];
};

type SwipeCandidate = {
  key: string;
  item: PetName;
  reasonParts: string[];
  recommendationLabel: string;
  scores: {
    initialFit: number;
    learnedPreference: number;
    diversityBoost: number;
    total: number;
  };
};

type SwipeRecord = {
  action: SwipeAction;
  candidate: SwipeCandidate;
};

type PreferenceProfile = ReturnType<typeof createEmptyPreferenceProfile>;

const ALL_NAMES = namesData as PetName[];
const SWIPE_TRIGGER = 110;
const CARD_OUT_DISTANCE = 440;

const DEFAULT_FILTERS: FiltersState = {
  species: [],
  gender: ['どちらでも'],
  color: [],
  vibe: [],
  length: [],
  theme: [],
};

function toggleValue(values: string[], value: string, single = false) {
  if (single) {
    return values.includes(value) ? [] : [value];
  }

  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function createSession(filters: FiltersState) {
  const preference = createEmptyPreferenceProfile();
  const queue = buildSwipeQueue(ALL_NAMES, filters, preference, new Set(), {
    limit: SWIPE_QUEUE_DEFAULT,
  }) as SwipeCandidate[];

  return {
    filters,
    preference,
    queue,
    swipes: [] as SwipeRecord[],
    saved: [] as SwipeCandidate[],
    seenKeys: new Set(queue.map((candidate) => candidate.key)),
  };
}

function hydrateQueue(
  filters: FiltersState,
  preference: PreferenceProfile,
  existingQueue: SwipeCandidate[],
  seenKeys: Set<string>,
  swipes: SwipeRecord[],
) {
  if (existingQueue.length >= SWIPE_REPLENISH_THRESHOLD) {
    return existingQueue;
  }

  const recentTraits = swipes
    .slice(-5)
    .flatMap((record) => [
      ...record.candidate.item.vibe,
      ...(record.candidate.item.theme || []),
      ...(record.candidate.item.color || []),
    ]);

  const refill = buildSwipeQueue(ALL_NAMES, filters, preference, seenKeys, {
    limit: SWIPE_QUEUE_DEFAULT,
    recentTraits,
  }) as SwipeCandidate[];

  const merged = [...existingQueue];
  refill.forEach((candidate) => {
    if (!merged.some((entry) => entry.key === candidate.key)) {
      merged.push(candidate);
    }
  });
  merged.forEach((candidate) => seenKeys.add(candidate.key));
  return merged;
}

function toPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scorePill}>
      <Text style={styles.scorePillLabel}>{label}</Text>
      <Text style={styles.scorePillValue}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
      {children}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : null,
        pressed ? styles.chipPressed : null,
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.introShell}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Sippomi iOS</Text>
          <Text style={styles.heroTitle}>条件を答えて、スワイプで名前の好みを育てる。</Text>
          <Text style={styles.heroBody}>
            Step 1-4 の回答をもとに候補を出し、Like / Pass を重ねるほどあなたの好みが見えてくる構成です。
          </Text>
          <View style={styles.heroBullets}>
            <Text style={styles.heroBullet}>1. 種類・性別・色・雰囲気を入力</Text>
            <Text style={styles.heroBullet}>2. マッチングアプリ風に左右スワイプ</Text>
            <Text style={styles.heroBullet}>3. 好み傾向と候補上位をまとめて確認</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={onStart}>
            <Text style={styles.primaryButtonText}>診断をはじめる</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FormScreen({
  filters,
  onFiltersChange,
  onStart,
}: {
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  onStart: () => void;
}) {
  const selectedSpeciesText = filters.species.length ? filters.species.join('・') : '未選択';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.formScrollContent}>
        <View style={styles.formHeader}>
          <Text style={styles.eyebrow}>Step 1-4</Text>
          <Text style={styles.formTitle}>まずはペットの条件を教えてください</Text>
          <Text style={styles.formBody}>
            必須は種類だけです。ほかはスキップできるので、ざっくりでも大丈夫です。
          </Text>
        </View>

        <Section title="Step 1. ペットの種類" body={`現在: ${selectedSpeciesText}`}>
          <View style={styles.chipWrap}>
            {SPECIES_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={`${option.icon} ${option.label}`}
                active={filters.species.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  species: toggleValue(filters.species, option.value, true),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 2. 性別" body="最初は broad に出したいので、既定値は『どちらでも』にしています。">
          <View style={styles.chipWrap}>
            {GENDER_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={filters.gender.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  gender: toggleValue(filters.gender, option.value, true),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 2. 色イメージ" body="白、黒、茶色など、見た目から想像する雰囲気を足せます。">
          <View style={styles.chipWrap}>
            {COLOR_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.color.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  color: toggleValue(filters.color, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 3. 雰囲気" body="かわいい、和風、上品などを複数選べます。">
          <View style={styles.chipWrap}>
            {VIBE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.vibe.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  vibe: toggleValue(filters.vibe, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 4. 文字数">
          <View style={styles.chipWrap}>
            {LENGTH_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={filters.length.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  length: toggleValue(filters.length, option.value),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 4. テーマ">
          <View style={styles.chipWrap}>
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.theme.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  theme: toggleValue(filters.theme, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Pressable
          style={[styles.primaryButton, !filters.species.length ? styles.primaryButtonDisabled : null]}
          onPress={onStart}
          disabled={!filters.species.length}
        >
          <Text style={styles.primaryButtonText}>スワイプ診断へ進む</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SwipeCard({
  candidate,
  animatedStyle,
}: {
  candidate: SwipeCandidate;
  animatedStyle?: any;
}) {
  const reading = secondaryReadingIfAny(candidate.item.name, candidate.item.reading);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>{candidate.recommendationLabel}</Text>
        <Text style={styles.cardScore}>{Math.round(candidate.scores.total * 100)}%</Text>
      </View>

      <Text style={styles.cardName}>{candidate.item.name}</Text>
      {reading ? <Text style={styles.cardReading}>{reading}</Text> : null}
      <Text style={styles.cardMeaning}>{candidate.item.meaning}</Text>

      <View style={styles.metaWrap}>
        {candidate.reasonParts.map((part) => (
          <View key={part} style={styles.metaChip}>
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

function ResultsScreen({
  filters,
  swipes,
  preference,
  saved,
  onRestart,
  onResume,
}: {
  filters: FiltersState;
  swipes: SwipeRecord[];
  preference: PreferenceProfile;
  saved: SwipeCandidate[];
  onRestart: () => void;
  onResume: () => void;
}) {
  const summary = summarizePreferenceProfile(preference);
  const liked = topLikedNames(swipes, 10) as SwipeRecord[];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.resultsContent}>
        <Text style={styles.eyebrow}>Results</Text>
        <Text style={styles.formTitle}>好みの輪郭が見えてきました</Text>
        <Text style={styles.resultsLead}>{summary.headline}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>今回の条件</Text>
          <Text style={styles.summaryLine}>種類: {filters.species.join(' / ')}</Text>
          <Text style={styles.summaryLine}>性別: {filters.gender.join(' / ')}</Text>
          <Text style={styles.summaryLine}>色: {filters.color.length ? filters.color.join(' / ') : '指定なし'}</Text>
          <Text style={styles.summaryLine}>雰囲気: {filters.vibe.length ? filters.vibe.join(' / ') : '指定なし'}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>学習サマリー</Text>
          {summary.bullets.length ? (
            summary.bullets.map((line) => (
              <Text key={line} style={styles.summaryLine}>{line}</Text>
            ))
          ) : (
            <Text style={styles.summaryLine}>まだ学習量が少ないため、傾向は薄めです。</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Like した候補</Text>
          {liked.length ? (
            liked.map((record) => (
              <View key={record.candidate.key} style={styles.resultRow}>
                <View style={styles.resultRowText}>
                  <Text style={styles.resultRowName}>{record.candidate.item.name}</Text>
                  <Text style={styles.resultRowBody}>{record.candidate.item.meaning}</Text>
                </View>
                <Text style={styles.resultRowAction}>LIKE</Text>
              </View>
            ))
          ) : (
            <Text style={styles.summaryLine}>まだ Like した名前はありません。</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>保存候補</Text>
          {saved.length ? (
            saved.slice(0, 8).map((candidate) => (
              <View key={candidate.key} style={styles.resultRow}>
                <View style={styles.resultRowText}>
                  <Text style={styles.resultRowName}>{candidate.item.name}</Text>
                  <Text style={styles.resultRowBody}>{candidate.reasonParts.join(' / ') || candidate.item.meaning}</Text>
                </View>
                <Text style={styles.resultRowAction}>SAVE</Text>
              </View>
            ))
          ) : (
            <Text style={styles.summaryLine}>気になった候補を保存していく導線はこの後 Supabase 連携に広げられます。</Text>
          )}
        </View>

        <Pressable style={styles.secondaryButton} onPress={onResume}>
          <Text style={styles.secondaryButtonText}>もう少しスワイプする</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onRestart}>
          <Text style={styles.primaryButtonText}>条件入力からやり直す</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>('intro');
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [session, setSession] = useState(() => createSession(DEFAULT_FILTERS));

  const position = useRef(new Animated.ValueXY()).current;

  function resetCardPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
    }).start();
  }

  function runSwipe(action: SwipeAction) {
    const current = session.queue[0];
    if (!current) {
      setStage('results');
      return;
    }

    const nextPreference = applySwipeFeedback(session.preference, current.item, action);
    const nextSwipes = [...session.swipes, { action, candidate: current }];
    const nextSaved = action === 'like'
      ? [current, ...session.saved.filter((entry) => entry.key !== current.key)]
      : session.saved;

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
      setStage('results');
    }
  }

  function animateOut(action: Exclude<SwipeAction, 'hold'>) {
    Animated.timing(position, {
      toValue: { x: action === 'like' ? CARD_OUT_DISTANCE : -CARD_OUT_DISTANCE, y: 30 },
      duration: 180,
      useNativeDriver: true,
    }).start(() => runSwipe(action));
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => (
        Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8
      ),
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.25 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_TRIGGER) {
          animateOut('like');
          return;
        }
        if (gestureState.dx < -SWIPE_TRIGGER) {
          animateOut('pass');
          return;
        }
        resetCardPosition();
      },
    }),
  ).current;

  if (stage === 'intro') {
    return <IntroScreen onStart={() => setStage('form')} />;
  }

  if (stage === 'form') {
    return (
      <FormScreen
        filters={filters}
        onFiltersChange={setFilters}
        onStart={() => {
          const nextSession = createSession(filters);
          setSession(nextSession);
          setStage('swipe');
        }}
      />
    );
  }

  if (stage === 'results') {
    return (
      <ResultsScreen
        filters={filters}
        swipes={session.swipes}
        preference={session.preference}
        saved={session.saved}
        onResume={() => setStage('swipe')}
        onRestart={() => {
          setFilters(DEFAULT_FILTERS);
          setSession(createSession(DEFAULT_FILTERS));
          setStage('form');
        }}
      />
    );
  }

  const current = session.queue[0];
  const next = session.queue[1];
  const third = session.queue[2];
  const summary = summarizePreferenceProfile(session.preference);
  const rotation = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.swipeShell}>
        <View style={styles.swipeHeader}>
          <View>
            <Text style={styles.eyebrow}>Swipe Mode</Text>
            <Text style={styles.swipeTitle}>Like / Pass で好みを学習中</Text>
          </View>
          <Pressable onPress={() => setStage('results')}>
            <Text style={styles.textButton}>結果へ</Text>
          </Pressable>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>現在の傾向</Text>
          <Text style={styles.insightBody}>{summary.headline}</Text>
          <Text style={styles.insightMeta}>
            {session.swipes.length} 件スワイプ済み / Like {session.preference.likes} 件 / Pass {session.preference.passes} 件
          </Text>
        </View>

        <View style={styles.deck}>
          {third ? (
            <View style={[styles.card, styles.cardGhost, styles.cardGhostBack]}>
              <Text style={styles.cardGhostText}>{third.item.name}</Text>
            </View>
          ) : null}
          {next ? (
            <View style={[styles.card, styles.cardGhost, styles.cardGhostMiddle]}>
              <Text style={styles.cardGhostText}>{next.item.name}</Text>
            </View>
          ) : null}
          {current ? (
            <View {...panResponder.panHandlers}>
              <SwipeCard
                candidate={current}
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
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyCardTitle}>候補を出し切りました</Text>
              <Text style={styles.emptyCardBody}>結果画面でまとめを確認できます。</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionButton, styles.actionPass]} onPress={() => animateOut('pass')}>
            <Text style={styles.actionButtonText}>Pass</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionHold]} onPress={() => runSwipe('hold')}>
            <Text style={styles.actionButtonText}>Hold</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionLike]} onPress={() => animateOut('like')}>
            <Text style={styles.actionButtonText}>Like</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f1e8',
  },
  introShell: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#fffaf4',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#8c4a22',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#b26b43',
    fontWeight: '700',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 42,
    color: '#2d2520',
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 26,
    color: '#5f5246',
  },
  heroBullets: {
    marginTop: 20,
    gap: 10,
  },
  heroBullet: {
    fontSize: 15,
    color: '#2d2520',
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#f07d5a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    backgroundColor: '#d9c6b8',
  },
  primaryButtonText: {
    color: '#fffaf4',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: '#fffaf4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ead8ca',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#7b553d',
    fontSize: 16,
    fontWeight: '700',
  },
  formScrollContent: {
    padding: 20,
    paddingBottom: 34,
  },
  formHeader: {
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#2d2520',
    fontWeight: '800',
  },
  formBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: '#6a5e53',
  },
  section: {
    marginTop: 18,
    backgroundColor: '#fffaf4',
    padding: 18,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2d2520',
    fontWeight: '700',
  },
  sectionBody: {
    marginTop: 8,
    color: '#7c6d62',
    lineHeight: 21,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ead8ca',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: '#f07d5a',
    borderColor: '#f07d5a',
  },
  chipPressed: {
    opacity: 0.82,
  },
  chipText: {
    color: '#4d4036',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fffaf4',
  },
  swipeShell: {
    flex: 1,
    padding: 18,
  },
  swipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swipeTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: '#2d2520',
    fontWeight: '800',
  },
  textButton: {
    color: '#b26b43',
    fontWeight: '700',
  },
  insightCard: {
    marginTop: 16,
    backgroundColor: '#fffaf4',
    borderRadius: 24,
    padding: 18,
  },
  insightTitle: {
    color: '#2d2520',
    fontWeight: '700',
    fontSize: 17,
  },
  insightBody: {
    marginTop: 8,
    color: '#5f5246',
    lineHeight: 22,
  },
  insightMeta: {
    marginTop: 10,
    color: '#9a8576',
    fontSize: 13,
  },
  deck: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fffaf4',
    borderRadius: 32,
    padding: 24,
    minHeight: 420,
    shadowColor: '#8c4a22',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cardGhost: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 420,
    backgroundColor: '#fdf2e8',
  },
  cardGhostMiddle: {
    top: 20,
    transform: [{ scale: 0.96 }],
  },
  cardGhostBack: {
    top: 36,
    transform: [{ scale: 0.92 }],
  },
  cardGhostText: {
    marginTop: 12,
    color: '#cfbaa8',
    fontWeight: '700',
    fontSize: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#b26b43',
    fontWeight: '700',
    fontSize: 13,
  },
  cardScore: {
    color: '#2d2520',
    fontWeight: '800',
    fontSize: 18,
  },
  cardName: {
    marginTop: 26,
    fontSize: 38,
    color: '#2d2520',
    fontWeight: '800',
  },
  cardReading: {
    marginTop: 6,
    fontSize: 16,
    color: '#8c7b6f',
  },
  cardMeaning: {
    marginTop: 16,
    color: '#5f5246',
    fontSize: 16,
    lineHeight: 25,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  metaChip: {
    backgroundColor: '#f9e1d3',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metaChipText: {
    color: '#8f593b',
    fontWeight: '600',
    fontSize: 13,
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  scorePill: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  scorePillLabel: {
    color: '#977e6e',
    fontSize: 12,
  },
  scorePillValue: {
    marginTop: 6,
    color: '#2d2520',
    fontSize: 18,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionPass: {
    backgroundColor: '#f2d1d1',
  },
  actionHold: {
    backgroundColor: '#efe6d7',
  },
  actionLike: {
    backgroundColor: '#cfe9d8',
  },
  actionButtonText: {
    color: '#2d2520',
    fontWeight: '700',
    fontSize: 16,
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: '#fffaf4',
    borderRadius: 24,
    padding: 18,
  },
  summaryTitle: {
    color: '#2d2520',
    fontWeight: '800',
    fontSize: 18,
  },
  summaryLine: {
    marginTop: 10,
    color: '#5f5246',
    lineHeight: 22,
  },
  resultsContent: {
    padding: 20,
    paddingBottom: 34,
  },
  resultsLead: {
    marginTop: 10,
    color: '#5f5246',
    lineHeight: 24,
    fontSize: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1e4d7',
  },
  resultRowText: {
    flex: 1,
  },
  resultRowName: {
    color: '#2d2520',
    fontWeight: '700',
    fontSize: 16,
  },
  resultRowBody: {
    marginTop: 6,
    color: '#6d5e53',
    lineHeight: 21,
  },
  resultRowAction: {
    color: '#b26b43',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: {
    fontSize: 24,
    color: '#2d2520',
    fontWeight: '800',
  },
  emptyCardBody: {
    marginTop: 12,
    color: '#6d5e53',
  },
});
