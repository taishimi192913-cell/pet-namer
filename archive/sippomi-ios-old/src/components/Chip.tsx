import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useThemeMode();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        theme.isDark ? theme.apply({}, 'chip') : null,
        active ? styles.chipActive : null,
        pressed ? styles.chipPressed : null,
      ]}
    >
      <Text style={[theme.apply(styles.chipText, 'chipText'), active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}
