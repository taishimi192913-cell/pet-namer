import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';
import type { PreferenceProfile } from '../types';

type ChartRow = {
  key: string;
  label: string;
  trait: string;
  value: number;
};

const labels: Record<string, string> = {
  vibe: '雰囲気',
  theme: 'テーマ',
  color: '色',
  length: '文字数',
  gender: '性別',
};

function topPositiveEntry(bucket: Record<string, number> = {}) {
  return Object.entries(bucket)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])[0];
}

function lengthLabel(value: string) {
  if (value === '4+') return '4文字以上';
  return `${value}文字`;
}

export function PreferenceChart({ preference }: { preference: PreferenceProfile }) {
  const theme = useThemeMode();
  const { width: windowWidth } = useWindowDimensions();
  const barWidth = Math.max(150, Math.min(240, windowWidth - 160));
  const rows = useMemo<ChartRow[]>(() => {
    const entries = Object.entries(preference.categories || {})
      .map(([key, bucket]) => {
        const top = topPositiveEntry(bucket as Record<string, number>);
        if (!top) return null;
        const trait = key === 'length' ? lengthLabel(top[0]) : top[0];
        return {
          key,
          label: labels[key] || key,
          trait,
          value: top[1],
        };
      })
      .filter(Boolean) as ChartRow[];

    const max = Math.max(...entries.map((entry) => entry.value), 1);
    return entries.map((entry) => ({
      ...entry,
      value: Math.max(0.08, entry.value / max),
    }));
  }, [preference]);

  const animated = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    animated.setValue(0);
    const listener = animated.addListener(({ value }) => setProgress(value));
    Animated.timing(animated, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    return () => {
      animated.removeListener(listener);
    };
  }, [animated, rows]);

  return (
    <View style={theme.apply(styles.preferenceChart, 'preferenceChart')}>
      <Text style={theme.apply(styles.preferenceChartTitle, 'preferenceChartTitle')}>好み傾向</Text>
      {rows.length ? (
        rows.map((row) => {
          const width = barWidth * row.value * progress;
          const bar = canRenderSvg() ? (
            <Svg width={barWidth} height={16}>
              <Rect x="0" y="3" width={barWidth} height={10} rx={5} fill={theme.colors.chartTrack} />
              <Rect x="0" y="3" width={width} height={10} rx={5} fill={theme.colors.iconAccent} />
            </Svg>
          ) : (
            <View style={[styles.preferenceChartTrack, { width: barWidth, backgroundColor: theme.colors.chartTrack }]}>
              <View style={[styles.preferenceChartFill, { width, backgroundColor: theme.colors.iconAccent }]} />
            </View>
          );

          return (
            <View key={row.key} style={styles.preferenceChartRow}>
              <View style={styles.preferenceChartLabelWrap}>
                <Text style={theme.apply(styles.preferenceChartLabel, 'preferenceChartLabel')}>{row.label}</Text>
                <Text style={theme.apply(styles.preferenceChartTrait, 'preferenceChartTrait')}>{row.trait}</Text>
              </View>
              {bar}
            </View>
          );
        })
      ) : (
        <Text style={theme.apply(styles.summaryLine, 'summaryLine')}>まだグラフ化できる好み傾向がありません。</Text>
      )}
    </View>
  );
}
