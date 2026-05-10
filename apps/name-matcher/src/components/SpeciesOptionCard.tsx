import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { PetSilhouette } from './PetSilhouette';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

export function SpeciesOptionCard({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useThemeMode();
  const scale = useRef(new Animated.Value(active ? 1.05 : 1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: active ? 1.05 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.speciesCardPressable}
      accessibilityLabel={`ペットの種類: ${label}${active ? '、選択中' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.speciesCard,
            theme.isDark ? theme.apply({}, 'speciesCard') : null,
            active ? styles.speciesCardActive : null,
            active && theme.isDark ? theme.apply({}, 'speciesCardActive') : null,
            pressed ? styles.speciesCardPressed : null,
            { transform: [{ scale }] },
          ]}
        >
          <View style={styles.speciesSilhouetteWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <PetSilhouette species={value} size={70} muted={!active} />
          </View>
          <Text style={[theme.apply(styles.speciesCardText, 'speciesCardText'), active ? styles.speciesCardTextActive : null]}>
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}
