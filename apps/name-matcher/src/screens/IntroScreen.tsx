import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { tokens } from '../designTokens';
import { canRenderSvg } from '../nativeCapabilities';

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <ScreenSafeArea edges={['top', 'bottom']} showDots={false}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: tokens.colors.petalWhite }}>

        {/* ── Premium Gradient Background ── */}
        {canRenderSvg() && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <SvgLinearGradient id="welcomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={tokens.colors.softPetal} stopOpacity="1" />
                  <Stop offset="0.3" stopColor={tokens.colors.petalWhite} stopOpacity="1" />
                  <Stop offset="0.55" stopColor={tokens.colors.roseQuartz} stopOpacity="0.2" />
                  <Stop offset="0.75" stopColor={tokens.colors.softPink} stopOpacity="0.1" />
                  <Stop offset="1" stopColor={tokens.colors.softPetal} stopOpacity="0.85" />
                </SvgLinearGradient>
                <SvgRadialGradient id="welcomeGlow" cx="0.5" cy="0.12" r="0.7">
                  <Stop offset="0" stopColor={tokens.colors.softPink} stopOpacity="0.08" />
                  <Stop offset="0.6" stopColor={tokens.colors.roseQuartz} stopOpacity="0.03" />
                  <Stop offset="1" stopColor={tokens.colors.softPetal} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#welcomeGrad)" />
              <Rect width="100%" height="100%" fill="url(#welcomeGlow)" />
            </Svg>
          </View>
        )}

        {/* ── Decorative floating shapes ── */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
          <View style={{
            position: 'absolute', top: 40, right: -40,
            width: 200, height: 200, borderRadius: 80,
            backgroundColor: tokens.colors.softBlush, opacity: 0.3,
            transform: [{ rotate: '-20deg' }],
          }} />
          <View style={{
            position: 'absolute', bottom: 120, left: -50,
            width: 160, height: 160, borderRadius: 60,
            backgroundColor: tokens.colors.selectedSurface, opacity: 0.25,
            transform: [{ rotate: '30deg' }],
          }} />
          <View style={{
            position: 'absolute', bottom: 220, right: 30,
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: tokens.colors.lightPink, opacity: 0.12,
          }} />
        </View>

        {/*
          LAYOUT: flex column with grow spacers
          ┌─ SafeArea(top) ─┐
          │  flexGrow:2      │  ← pushes brand down toward center
          │  Brand area      │
          │  flexGrow:3      │  ← pushes CTA to bottom
          │  CTA footer      │
          └─ SafeArea(bottom) ┘
        */}
        <View style={{
          flex: 1,
          paddingHorizontal: 32,
          paddingTop: 12,
          paddingBottom: 12,
          justifyContent: 'space-between',
        }}>
          <View />

          <View style={{ alignItems: 'center' }}>
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                color: tokens.colors.warmMauve,
                letterSpacing: 2,
                textAlign: 'center',
              }}>
                しっぽみ
              </Text>
            </View>
            <Text style={{
              fontSize: 30,
              lineHeight: 40,
              color: tokens.colors.deepMauve,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              その子に、ぴったりの{'\n'}名前を。
            </Text>
            <Text style={{
              fontSize: 15,
              lineHeight: 22,
              color: tokens.colors.mutedMauve,
              textAlign: 'center',
              fontWeight: '400',
            }}>
              スワイプして、名前を探す新しいカタチ。
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.colors.cornflower,
                paddingVertical: 18,
                paddingHorizontal: 40,
                borderRadius: 999,
                minWidth: 260,
                shadowColor: '#295FB8',
                shadowOpacity: 0.2,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              }}
              onPress={onStart}
              accessibilityLabel="診断をはじめる"
              accessibilityRole="button"
            >
              <Text style={{
                color: tokens.colors.softPetal,
                fontSize: 17,
                fontWeight: '700',
                letterSpacing: 0.8,
              }}>
                診断をはじめる
              </Text>
              <Ionicons name="arrow-forward" size={18} color={tokens.colors.softPetal} style={{ marginLeft: 6, marginTop: 1 }} />
            </Pressable>

            <Pressable
              onPress={() => {}}
              accessibilityLabel="ログイン"
              accessibilityRole="button"
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{
                fontSize: 14,
                color: tokens.colors.rose,
                fontWeight: '600',
                textDecorationLine: 'underline',
              }}>
                ログインはこちら
              </Text>
            </Pressable>

            <Text style={{
              marginTop: 24,
              fontSize: 11,
              lineHeight: 16,
              color: tokens.colors.mutedMauve,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              診断をはじめることで、利用規約とプライバシーポリシーに同意したものとみなします。
            </Text>
          </View>
        </View>
      </View>
    </ScreenSafeArea>
  );
}
