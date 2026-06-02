import React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SafeAreaEdge } from '../types';
import { useThemeMode } from '../theme';
import { BackgroundDots } from './BackgroundDots';

export function ScreenSafeArea({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  showDots = true,
  style,
}: {
  children: React.ReactNode;
  edges?: SafeAreaEdge[];
  showDots?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useThemeMode();
  const useNativeSafeArea = edges.includes('top') || edges.includes('bottom');
  const containerStyle = [
    { flex: 1 },
    style,
    theme.isDark ? { backgroundColor: '#1E1A22' } : null,
  ];

  if (useNativeSafeArea) {
    return (
      <SafeAreaView edges={edges} style={containerStyle}>
        {showDots ? <BackgroundDots /> : null}
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      {showDots ? <BackgroundDots /> : null}
      {children}
    </View>
  );
}
