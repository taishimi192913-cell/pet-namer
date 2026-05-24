import React from 'react';
import { SafeAreaView, type StyleProp, View, type ViewStyle } from 'react-native';
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
  const Container = useNativeSafeArea ? SafeAreaView : View;

  return (
    <Container
      style={[
        style,
        theme.isDark ? { backgroundColor: '#1E1A22' } : null,
      ]}
    >
      {showDots ? <BackgroundDots /> : null}
      {children}
    </Container>
  );
}
