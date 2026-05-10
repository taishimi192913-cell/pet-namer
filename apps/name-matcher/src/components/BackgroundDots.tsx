import React from 'react';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';

export function BackgroundDots() {
  const theme = useThemeMode();

  if (!canRenderSvg()) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <Circle cx="4" cy="4" r="1.4" fill={theme.colors.dot} opacity={theme.isDark ? '0.16' : '0.11'} />
            <Path
              d="M18 6 C22 10 22 15 18 19 C14 15 14 10 18 6 Z"
              fill={theme.colors.dot}
              opacity={theme.isDark ? '0.05' : '0.06'}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}
