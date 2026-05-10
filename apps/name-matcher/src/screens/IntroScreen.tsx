import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { PetSilhouette } from '../components/PetSilhouette';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

// gptimage2.0 generated splash background
const splashBg = require('../../assets/images-generated/splash_bg.png');

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const theme = useThemeMode();

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <ImageBackground
        source={splashBg}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.18 }}
        resizeMode="cover"
      >
      <View style={styles.introShell}>
        <View style={styles.introBackdrop} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.introBlobLarge} />
          <View style={styles.introBlobSmall} />
        </View>
        <View style={styles.introContent}>
          <View style={theme.apply(styles.heroCard, 'heroCard')}>
            <View style={[styles.heroSilhouetteRow, { marginBottom: 8 }]}>
              <View style={styles.heroSilhouetteBubble} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species="猫" size={78} />
              </View>
              <View style={[styles.heroSilhouetteBubble, styles.heroSilhouetteBubbleLarge]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species="犬" size={90} />
              </View>
              <View style={styles.heroSilhouetteBubble} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species="うさぎ" size={78} />
              </View>
            </View>
            <View style={[styles.heroSilhouetteRow, { marginBottom: 28, marginTop: -4 }]}>
              <View style={styles.heroSilhouetteBubble} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species="ハムスター" size={78} />
              </View>
            </View>
            <Text style={styles.eyebrow}>しっぽみ</Text>
            <Text style={theme.apply(styles.heroTitle, 'heroTitle')}>その子に、ぴったりの名前を。</Text>
            <Text style={theme.apply(styles.heroBody, 'heroBody')}>
              性格や雰囲気から、スワイプで出会う名前探し。
            </Text>
            <View style={styles.heroBullets}>
              <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>1. 条件は軽く選ぶだけ</Text>
              <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>2. 気になる名前を Like / Hold</Text>
              <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>3. 最後に相性の高い候補を確認</Text>
            </View>
            <Pressable
              style={styles.primaryButton}
              onPress={onStart}
              accessibilityLabel="診断をはじめる"
              accessibilityRole="button"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.iconOnPrimary} />
                <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>診断をはじめる</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
      </ImageBackground>
    </ScreenSafeArea>
  );
}
