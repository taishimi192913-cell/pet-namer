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
import { styles } from '../styles';
import { tokens } from '../designTokens';
import { canRenderSvg } from '../nativeCapabilities';

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <ScreenSafeArea edges={['top', 'bottom']}>
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
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
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
            position: 'absolute',
            top: 40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: 80,
            backgroundColor: tokens.colors.softBlush,
            opacity: 0.3,
            transform: [{ rotate: '-20deg' }],
          }} />
          <View style={{
            position: 'absolute',
            bottom: 120,
            left: -50,
            width: 160,
            height: 160,
            borderRadius: 60,
            backgroundColor: tokens.colors.selectedSurface,
            opacity: 0.25,
            transform: [{ rotate: '30deg' }],
          }} />
          <View style={{
            position: 'absolute',
            bottom: 220,
            right: 30,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: tokens.colors.lightPink,
            opacity: 0.12,
          }} />
        </View>

        {/* ── Main Content ──
             Layout: brand centered, CTA pinned to bottom.
             Using absolute positioning for reliability.
        */}
        <View style={styles.welcomeShell}>
          {/* Brand area — vertically centered */}
          <View style={styles.welcomeBrandArea}>
            <View style={styles.welcomeLogoRow}>
              <Text style={styles.welcomeLogoText}>しっぽみ</Text>
            </View>
            <Text style={styles.welcomeTagline}>
              その子に、ぴったりの{'\n'}名前を。
            </Text>
            <Text style={styles.welcomeSub}>
              スワイプして、名前を探す新しいカタチ。
            </Text>
          </View>

          {/* CTA — pinned to bottom */}
          <View style={styles.welcomeActions}>
            <Pressable
              style={styles.welcomeCta}
              onPress={onStart}
              accessibilityLabel="診断をはじめる"
              accessibilityRole="button"
            >
              <Text style={styles.welcomeCtaText}>診断をはじめる</Text>
              <Ionicons name="arrow-forward" size={18} color={tokens.colors.softPetal} style={{ marginLeft: 6, marginTop: 1 }} />
            </Pressable>

            <Pressable
              onPress={() => {}}
              accessibilityLabel="ログイン"
              accessibilityRole="button"
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={styles.welcomeSignIn}>ログインはこちら</Text>
            </Pressable>

            <Text style={styles.welcomeTerms}>
              診断をはじめることで、利用規約とプライバシーポリシーに同意したものとみなします。
            </Text>
          </View>
        </View>
      </View>
    </ScreenSafeArea>
  );
}
