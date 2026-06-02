import React from 'react';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';
import { tokens } from '../designTokens';

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
          {/* Primary dot pattern — soft, organic */}
          <Pattern id="dotPattern" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <Circle cx="6" cy="6" r="1.6" fill={theme.colors.dot} opacity={theme.isDark ? '0.11' : '0.09'} />
            <Circle cx="30" cy="22" r="1.0" fill={theme.colors.dot} opacity={theme.isDark ? '0.07' : '0.05'} />
            <Circle cx="42" cy="38" r="1.4" fill={theme.colors.dot} opacity={theme.isDark ? '0.09' : '0.07'} />
            <Path
              d="M22 14 C26 18 26 24 22 28 C18 24 18 18 22 14 Z"
              fill={theme.colors.dot}
              opacity={theme.isDark ? '0.04' : '0.04'}
            />
          </Pattern>
          {/* Secondary wave — subtle horizontal movement feel */}
          <Pattern id="wavePattern" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
            <Path
              d="M0 40 C30 32 60 48 90 40 S120 40 120 40"
              fill="none"
              stroke={tokens.colors.softPink}
              strokeWidth="0.6"
              opacity={theme.isDark ? '0.04' : '0.05'}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dotPattern)" />
        <Rect width="100%" height="100%" fill="url(#wavePattern)" />
      </Svg>
    </View>
  );
}
