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
        <View style={theme.apply(styles.heroCard, 'heroCard')}>
          <View style={styles.heroSilhouetteRow}>
            <View style={[styles.heroSilhouetteBubble, styles.heroSilhouetteBubbleLarge]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <PetSilhouette species="犬" size={86} />
            </View>
            <View style={styles.heroSilhouetteBubble} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <PetSilhouette species="猫" size={72} />
            </View>
            <View style={styles.heroSilhouetteBubble} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <PetSilhouette species="うさぎ" size={72} />
            </View>
          </View>
          <Text style={styles.eyebrow}>Sippomi iOS</Text>
          <Text style={theme.apply(styles.heroTitle, 'heroTitle')}>条件を答えて、スワイプで名前の好みを育てる。</Text>
          <Text style={theme.apply(styles.heroBody, 'heroBody')}>
            Step 1-4 の回答をもとに候補を出し、Like / Pass を重ねるほどあなたの好みが見えてくる構成です。
          </Text>
          <View style={styles.heroBullets}>
            <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>1. 種類・性別・色・雰囲気を入力</Text>
            <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>2. マッチングアプリ風に左右スワイプ</Text>
            <Text style={theme.apply(styles.heroBullet, 'heroBullet')}>3. 好み傾向と候補上位をまとめて確認</Text>
          </View>
          <Pressable
            style={styles.primaryButton}
            onPress={onStart}
            accessibilityLabel="診断をはじめる"
            accessibilityRole="button"
          >
            <View style={styles.buttonContent}>
              <Ionicons name="heart" size={18} color={theme.colors.iconOnPrimary} />
              <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>診断をはじめる</Text>
            </View>
          </Pressable>
        </View>
      </View>
      </ImageBackground>
    </ScreenSafeArea>
  );
}
