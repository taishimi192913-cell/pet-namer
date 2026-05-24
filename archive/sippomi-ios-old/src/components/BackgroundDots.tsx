import React from 'react';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';

export function BackgroundDots() {
  const theme = useThemeMode();

  if (!canRenderSvg()) {
    return null;
  }

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <Circle cx="3" cy="3" r="1.5" fill={theme.colors.dot} opacity={theme.isDark ? '0.18' : '0.12'} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  );
}
