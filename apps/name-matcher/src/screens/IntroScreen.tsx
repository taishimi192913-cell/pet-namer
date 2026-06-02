import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { PetSilhouette } from '../components/PetSilhouette';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import { tokens } from '../designTokens';
import { canRenderSvg } from '../nativeCapabilities';

// ── Animated floating element ──
interface FloatProps {
  cxPct: number; cyPct: number; r: number; color: string;
  opacity: number; duration: number; delay: number;
  driftX?: number; driftY?: number; reduceMotion: boolean;
}

function FloatOrb({ cxPct, cyPct, r, color, opacity, duration, delay, driftX = 8, driftY = -10, reduceMotion }: FloatProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => {
      tx.value = withRepeat(withTiming(driftX, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
      ty.value = withRepeat(withTiming(driftY, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) }), -1, true);
      scale.value = withRepeat(withTiming(1.15, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, [tx, ty, scale, duration, delay, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={{ position: 'absolute', left: `${cxPct}%`, top: `${cyPct}%` }} pointerEvents="none">
      <Animated.View style={animStyle}>
        <View style={{
          width: r * 2, height: r * 2, borderRadius: r,
          backgroundColor: color, opacity,
          marginLeft: -r, marginTop: -r,
        }} />
      </Animated.View>
    </View>
  );
}

// ── Animated entrance for key elements ──
function FadeInUp({ children, delay: d, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    }, d ?? 200);
    return () => clearTimeout(t);
  }, [opacity, translateY, d]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const theme = useThemeMode();
  const rm = useReducedMotion();

  return (
    <ScreenSafeArea edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: tokens.colors.petalWhite }}>

        {/* ── Premium Gradient Background ── */}
        {canRenderSvg() && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <SvgRadialGradient id="introGlow" cx="0.5" cy="0.1" r="0.8">
                  <Stop offset="0" stopColor={tokens.colors.softPink} stopOpacity="0.15" />
                  <Stop offset="0.5" stopColor={tokens.colors.roseQuartz} stopOpacity="0.08" />
                  <Stop offset="1" stopColor={tokens.colors.petalWhite} stopOpacity="0" />
                </SvgRadialGradient>
                <SvgLinearGradient id="introBgGrad2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={tokens.colors.softPetal} stopOpacity="1" />
                  <Stop offset="0.3" stopColor={tokens.colors.petalWhite} stopOpacity="1" />
                  <Stop offset="0.7" stopColor={tokens.colors.roseQuartz} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={tokens.colors.softPink} stopOpacity="0.08" />
                </SvgLinearGradient>
                <SvgLinearGradient id="introAccent" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={tokens.colors.softPink} stopOpacity="0" />
                  <Stop offset="0.5" stopColor={tokens.colors.softPink} stopOpacity="0.06" />
                  <Stop offset="1" stopColor={tokens.colors.softPink} stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#introBgGrad2)" />
              <Rect width="100%" height="100%" fill="url(#introGlow)" />
              <Rect width="100%" height="100%" fill="url(#introAccent)" />
              {/* Subtle scan-line-like decorative arcs */}
              <Circle cx="50%" cy="20%" r="45%" fill="none" stroke={tokens.colors.softPink} strokeOpacity="0.04" strokeWidth="1" />
              <Circle cx="50%" cy="20%" r="55%" fill="none" stroke={tokens.colors.roseQuartz} strokeOpacity="0.03" strokeWidth="1" />
            </Svg>
          </View>
        )}

        {/* ── Animated Floating Orbs ── */}
        <FloatOrb cxPct={88} cyPct={12} r={140} color={tokens.colors.softPink} opacity={0.08} duration={22000} delay={0} driftX={10} driftY={-12} reduceMotion={rm} />
        <FloatOrb cxPct={12} cyPct={65} r={100} color={tokens.colors.roseQuartz} opacity={0.06} duration={26000} delay={2000} driftX={-8} driftY={10} reduceMotion={rm} />
        <FloatOrb cxPct={55} cyPct={78} r={70} color={tokens.colors.softPink} opacity={0.05} duration={20000} delay={4000} reduceMotion={rm} />
        <FloatOrb cxPct={90} cyPct={50} r={50} color={tokens.colors.cornflower} opacity={0.04} duration={28000} delay={1000} reduceMotion={rm} />

        {/* ── Main Content ── */}
        <View style={styles.introShell}>
          <View style={styles.introBackdrop}>
            <View style={styles.introBlobLarge} />
            <View style={styles.introBlobSmall} />
          </View>

          <View style={styles.introContent}>
            {/* Brand header */}
            <FadeInUp delay={200}>
              <Text style={styles.introBrandLabel}>しっぽみ</Text>
            </FadeInUp>

            <FadeInUp delay={400}>
              <Text style={styles.introTagline}>
                その子に、{'\n'}ぴったりの名前を。
              </Text>
            </FadeInUp>

            <FadeInUp delay={600}>
              <Text style={styles.introSubtext}>
                スワイプで出会う、新しい名前探し。
              </Text>
            </FadeInUp>

            {/* Premium Glass Card */}
            <FadeInUp delay={800}>
              <View style={styles.introGlassCard}>
                {/* Pet silhouettes row */}
                <View style={styles.introPetRow}>
                  <View style={[styles.introPetBubble, rm ? null : { marginTop: -6 }]}>
                    <PetSilhouette species="猫" size={44} />
                  </View>
                  <View style={[styles.introPetBubble, styles.introPetBubbleCenter]}>
                    <PetSilhouette species="犬" size={54} />
                  </View>
                  <View style={[styles.introPetBubble, rm ? null : { marginTop: -4 }]}>
                    <PetSilhouette species="うさぎ" size={44} />
                  </View>
                </View>

                {/* Feature bullets */}
                <View style={styles.introFeatureRow}>
                  <View style={styles.introFeatureDot} />
                  <Text style={styles.introFeatureText}>種類を選んで、スワイプ</Text>
                </View>
                <View style={styles.introFeatureRow}>
                  <View style={styles.introFeatureDot} />
                  <Text style={styles.introFeatureText}>好みを学習して自動提案</Text>
                </View>
                <View style={styles.introFeatureRow}>
                  <View style={styles.introFeatureDot} />
                  <Text style={styles.introFeatureText}>ぴったりの名前が見つかる</Text>
                </View>
              </View>
            </FadeInUp>
          </View>

          {/* ── Bottom CTA ── */}
          <FadeInUp delay={1200}>
            <View style={styles.introFooter}>
              <Pressable
                style={styles.introCtaButton}
                onPress={onStart}
                accessibilityLabel="診断をはじめる"
                accessibilityRole="button"
              >
                <View style={styles.introCtaInner}>
                  <Text style={styles.introCtaText}>診断をはじめる</Text>
                  <Ionicons name="arrow-forward" size={18} color={tokens.colors.petalWhite} />
                </View>
              </Pressable>
              <Text style={styles.introFooterNote}>1万件以上の名前データベースから</Text>
            </View>
          </FadeInUp>
        </View>
      </View>
    </ScreenSafeArea>
  );
}
