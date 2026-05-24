import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  summarizePreferenceProfile,
  topLikedNames,
} from '../../../../packages/recommendation-core/index.js';
import { PreferenceChart } from '../components/PreferenceChart';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import type { FiltersState, PreferenceProfile, SwipeCandidate, SwipeRecord } from '../types';

export function ResultsScreen({
  filters,
  swipes,
  preference,
  saved,
  onRestart,
  onResume,
  onOpenDetails,
  onBack,
}: {
  filters: FiltersState;
  swipes: SwipeRecord[];
  preference: PreferenceProfile;
  saved: SwipeCandidate[];
  onRestart: () => void;
  onResume: () => void;
  onOpenDetails: (candidate: SwipeCandidate) => void;
  onBack?: () => void;
}) {
  const theme = useThemeMode();
  const summary = summarizePreferenceProfile(preference);
  const liked = (topLikedNames(swipes, 10) as SwipeRecord[])
    .slice()
    .sort((a, b) => b.candidate.scores.total - a.candidate.scores.total);

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView contentContainerStyle={styles.resultsContent}>
        <View style={styles.screenHeaderRow}>
          {onBack ? (
            <Pressable style={theme.apply(styles.iconButton, 'iconButton')} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.icon} />
            </Pressable>
          ) : null}
          <View style={styles.screenHeaderTitle}>
            <Text style={styles.eyebrow}>Results</Text>
            <Text style={theme.apply(styles.formTitle, 'formTitle')}>好みの輪郭が見えてきました</Text>
          </View>
          <View style={theme.apply(styles.iconButtonMuted, 'iconButtonMuted')}>
            <Ionicons name="share-outline" size={20} color={theme.colors.iconAccent} />
          </View>
        </View>
        <Text style={theme.apply(styles.resultsLead, 'resultsLead')}>{summary.headline}</Text>

        <View style={theme.apply(styles.summaryCard, 'summaryCard')}>
          <Text style={theme.apply(styles.summaryTitle, 'summaryTitle')}>今回の条件</Text>
          <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>種類: {filters.species.join(' / ')}</Text>
          <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>性別: {filters.gender.join(' / ')}</Text>
          <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>色: {filters.color.length ? filters.color.join(' / ') : '指定なし'}</Text>
          <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>雰囲気: {filters.vibe.length ? filters.vibe.join(' / ') : '指定なし'}</Text>
        </View>

        <View style={theme.apply(styles.summaryCard, 'summaryCard')}>
          <Text style={theme.apply(styles.summaryTitle, 'summaryTitle')}>学習サマリー</Text>
          {summary.bullets.length ? (
            summary.bullets.map((line) => (
              <Text key={line} style={theme.apply(styles.summaryLine, 'summaryLine')}>{line}</Text>
            ))
          ) : (
            <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>まだ学習量が少ないため、傾向は薄めです。</Text>
          )}
          <PreferenceChart preference={preference} />
        </View>

        <View style={theme.apply(styles.summaryCard, 'summaryCard')}>
          <Text style={theme.apply(styles.summaryTitle, 'summaryTitle')}>Like した候補</Text>
          {liked.length ? (
            liked.map((record, index) => (
              <View
                key={record.candidate.key}
                style={[
                  styles.resultRow,
                  index < 3 ? theme.apply(styles.resultRowRanked, 'resultRowRanked') : null,
                  index === 0 ? styles.resultRowGold : null,
                  index === 1 ? styles.resultRowSilver : null,
                  index === 2 ? styles.resultRowBronze : null,
                ]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    index === 0 ? styles.rankBadgeGold : null,
                    index === 1 ? styles.rankBadgeSilver : null,
                    index === 2 ? styles.rankBadgeBronze : null,
                  ]}
                >
                  <Text style={styles.rankBadgeText}>{index + 1}</Text>
                </View>
                <Pressable style={styles.resultRowText} onPress={() => onOpenDetails(record.candidate)}>
                  <Text style={theme.apply(styles.resultRowName, 'resultRowName')}>{record.candidate.item.name}</Text>
                  <Text style={theme.apply(styles.resultRowBody, 'resultRowBody')}>{record.candidate.item.meaning}</Text>
                </Pressable>
                <View style={theme.apply(styles.resultRowActionPill, 'resultRowActionPill')}>
                  <Ionicons name="heart" size={13} color={theme.colors.iconAccent} />
                  <Text style={theme.apply(styles.resultRowAction, 'resultRowAction')}>LIKE</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>まだ Like した名前はありません。</Text>
          )}
        </View>

        <View style={theme.apply(styles.summaryCard, 'summaryCard')}>
          <Text style={theme.apply(styles.summaryTitle, 'summaryTitle')}>保存候補</Text>
          {saved.length ? (
            saved.slice(0, 8).map((candidate) => (
              <View key={candidate.key} style={styles.resultRow}>
                <Pressable style={styles.resultRowText} onPress={() => onOpenDetails(candidate)}>
                  <Text style={theme.apply(styles.resultRowName, 'resultRowName')}>{candidate.item.name}</Text>
                  <Text style={theme.apply(styles.resultRowBody, 'resultRowBody')}>{candidate.reasonParts.join(' / ') || candidate.item.meaning}</Text>
                </Pressable>
                <View style={theme.apply(styles.resultRowActionPill, 'resultRowActionPill')}>
                  <Ionicons name="bookmark" size={13} color={theme.colors.iconAccent} />
                  <Text style={theme.apply(styles.resultRowAction, 'resultRowAction')}>SAVE</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>気になった候補を保存していく導線はこの後 Supabase 連携に広げられます。</Text>
          )}
        </View>

        <Pressable style={theme.apply(styles.secondaryButton, 'secondaryButton')} onPress={onResume}>
          <View style={styles.buttonContent}>
            <Ionicons name="heart" size={18} color={theme.colors.iconSecondary} />
            <Text style={theme.apply(styles.secondaryButtonText, 'secondaryButtonText')}>もう少しスワイプする</Text>
          </View>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onRestart}>
          <View style={styles.buttonContent}>
            <Ionicons name="arrow-back" size={18} color={theme.colors.iconOnPrimary} />
            <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>条件入力からやり直す</Text>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenSafeArea>
  );
}
