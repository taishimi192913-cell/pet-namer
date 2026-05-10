import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text } from 'react-native';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

export function Chip({
  label,
  active,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useThemeMode();
  const scale = useRef(new Animated.Value(active ? 1.03 : 1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: active ? 1.03 : 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        theme.isDark ? theme.apply({}, 'chip') : null,
        active ? styles.chipActive : null,
        pressed ? styles.chipPressed : null,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={[theme.apply(styles.chipText, 'chipText'), active ? styles.chipTextActive : null]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
