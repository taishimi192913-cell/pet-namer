import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

export function ScorePill({ label, value }: { label: string; value: string }) {
  const theme = useThemeMode();

  return (
    <View style={theme.apply(styles.scorePill, 'scorePill')}>
      <Text style={styles.scorePillLabel}>{label}</Text>
      <Text style={theme.apply(styles.scorePillValue, 'scorePillValue')}>{value}</Text>
    </View>
  );
}
