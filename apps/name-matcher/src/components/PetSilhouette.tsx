import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';

const speciesTone: Record<string, string> = {
  犬: '#D4788F',
  猫: '#4A353A',
  うさぎ: '#F0A1B5',
  ハムスター: '#C49A7C',
  鳥: '#8CAB9A',
  爬虫類: '#6E9E73',
  魚: '#5B9FC7',
  小動物: '#B88770',
};

const darkSpeciesTone: Record<string, string> = {
  犬: '#E894A5',
  猫: '#C5B5BB',
  うさぎ: '#F0A1B5',
  ハムスター: '#D4A88A',
  鳥: '#9DC0AB',
  爬虫類: '#95C99A',
  魚: '#80BCE0',
  小動物: '#D0A08A',
};

// Secondary tone (for inner ear, shading, accents)
const speciesAccent: Record<string, string> = {
  犬: '#BF6A7E',
  猫: '#6B555B',
  うさぎ: '#E2889E',
  ハムスター: '#B08060',
  鳥: '#749082',
  爬虫類: '#517F56',
  魚: '#3F7FA5',
  小動物: '#9B6F58',
};

const darkSpeciesAccent: Record<string, string> = {
  犬: '#D47A90',
  猫: '#A89298',
  うさぎ: '#E2889E',
  ハムスター: '#C09070',
  鳥: '#85A894',
  爬虫類: '#74A878',
  魚: '#6CAFD2',
  小動物: '#B88A72',
};

export function PetSilhouette({
  species,
  size = 88,
  muted = false,
}: {
  species: string;
  size?: number;
  muted?: boolean;
}) {
  const theme = useThemeMode();
  const toneMap = theme.isDark ? darkSpeciesTone : speciesTone;
  const accentMap = theme.isDark ? darkSpeciesAccent : speciesAccent;
  const fill = muted ? theme.colors.silhouetteMuted : toneMap[species] || '#E07A5F';
  const fillAccent = muted ? theme.colors.silhouetteMuted : accentMap[species] || '#C06070';
  const stroke = fill;
  const surface = theme.colors.silhouetteSurface;
  const ink = theme.colors.silhouetteInk;
  const opacity = muted ? 0.58 : 1;

  if (!canRenderSvg()) {
    return (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
          opacity: muted ? 0.58 : 0.95,
        }}
      />
    );
  }

  const sw = stroke === fillAccent ? 2.5 : 2.8;

  if (species === '猫') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <RadialGradient id="catGlow" cx="48" cy="55" r="30" fx="48" fy="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.45" />
            <Stop offset="1" stopColor={surface} stopOpacity="0.08" />
          </RadialGradient>
        </Defs>
        <Circle cx="48" cy="55" r="30" fill="url(#catGlow)" />
        {/* Tail - elegant curve behind body */}
        <Path d="M66 68 C86 66 90 50 82 38 C78 32 74 30 70 30" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M66 68 C86 66 90 50 82 38" fill="none" stroke={fillAccent} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
        {/* Body - graceful sitting cat */}
        <Path d="M30 46 C16 56 16 82 36 86 C54 90 70 86 76 72 C82 58 74 44 66 40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        {/* Chest fluff */}
        <Path d="M40 58 C44 64 52 64 56 58" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" opacity="0.55" />
        {/* Ears - elegant pointed */}
        <Path d="M28 38 L35 16 L48 36" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} strokeLinejoin="round" opacity="0.5" />
        <Path d="M68 38 L61 16 L48 36" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} strokeLinejoin="round" opacity="0.5" />
        <Path d="M30 36 L35 20 L44 35" fill="none" stroke={fillAccent} strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
        <Path d="M66 36 L61 20 L52 35" fill="none" stroke={fillAccent} strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
        {/* Front paws */}
        <Path d="M36 84 C34 90 32 90 34 90" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" />
        <Path d="M44 86 C42 92 40 92 42 92" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" />
        <Path d="M60 84 C58 90 56 90 58 90" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" opacity="0.6" />
        {/* Eyes - expressive almond */}
        <Ellipse cx="40" cy="50" rx="3.5" ry="3.8" fill={ink} opacity="0.85" />
        <Ellipse cx="56" cy="50" rx="3.5" ry="3.8" fill={ink} opacity="0.85" />
        <Circle cx="41" cy="49" r="1.2" fill={surface} opacity="0.9" />
        <Circle cx="57" cy="49" r="1.2" fill={surface} opacity="0.9" />
        {/* Nose */}
        <Path d="M46 56 L48 58 L50 56" fill="none" stroke={fillAccent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mouth */}
        <Path d="M43 60 C45 63 47 62 48 63 C49 62 51 63 53 60" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        {/* Whiskers */}
        <Path d="M34 55 L20 53 M34 57 L19 58 M34 59 L20 63" fill="none" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
        <Path d="M62 55 L76 53 M62 57 L77 58 M62 59 L76 63" fill="none" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      </Svg>
    );
  }

  if (species === 'うさぎ') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <RadialGradient id="rabGlow" cx="48" cy="58" r="28" fx="48" fy="52" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.45" />
            <Stop offset="1" stopColor={surface} stopOpacity="0.08" />
          </RadialGradient>
        </Defs>
        <Circle cx="48" cy="58" r="29" fill="url(#rabGlow)" />
        {/* Ears - tall, with elegant inner detail */}
        <Ellipse cx="37" cy="20" rx="8" ry="25" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" transform="rotate(-12 37 20)" />
        <Ellipse cx="59" cy="20" rx="8" ry="25" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" transform="rotate(12 59 20)" />
        <Ellipse cx="37" cy="20" rx="3.5" ry="17" fill={fillAccent} opacity="0.25" transform="rotate(-12 37 20)" />
        <Ellipse cx="59" cy="20" rx="3.5" ry="17" fill={fillAccent} opacity="0.25" transform="rotate(12 59 20)" />
        {/* Body - round, plump */}
        <Circle cx="48" cy="60" r="26" fill={surface} opacity="0.25" />
        <Circle cx="48" cy="60" r="26" fill="none" stroke={stroke} strokeWidth={sw} />
        {/* Cheek fluff */}
        <Path d="M26 56 C22 58 22 64 26 66" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" opacity="0.6" />
        <Path d="M70 56 C74 58 74 64 70 66" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" opacity="0.6" />
        {/* Tail - cute round puff */}
        <Circle cx="48" cy="84" r="8" fill={surface} opacity="0.4" />
        <Circle cx="48" cy="84" r="8" fill="none" stroke={stroke} strokeWidth={sw - 0.5} />
        {/* Front paws */}
        <Ellipse cx="36" cy="82" rx="6" ry="4" fill={surface} stroke={stroke} strokeWidth="1" opacity="0.5" />
        <Ellipse cx="60" cy="82" rx="6" ry="4" fill={surface} stroke={stroke} strokeWidth="1" opacity="0.5" />
        {/* Eyes - gentle and round */}
        <Circle cx="40" cy="53" r="3.2" fill={ink} opacity="0.8" />
        <Circle cx="56" cy="53" r="3.2" fill={ink} opacity="0.8" />
        <Circle cx="41" cy="52" r="1.2" fill={surface} opacity="0.9" />
        <Circle cx="57" cy="52" r="1.2" fill={surface} opacity="0.9" />
        {/* Nose - tiny triangle */}
        <Path d="M46 61 L48 63 L50 61 Z" fill={fillAccent} opacity="0.7" />
        {/* Mouth - Y shape */}
        <Path d="M48 63 L48 65 M44 64 L48 65 L52 64" fill="none" stroke={stroke} strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
        {/* Whiskers */}
        <Path d="M33 58 L24 56 M33 60 L23 61 M33 62 L24 66" fill="none" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
        <Path d="M63 58 L72 56 M63 60 L73 61 M63 62 L72 66" fill="none" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
      </Svg>
    );
  }

  if (species === '鳥') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <RadialGradient id="birdGlow" cx="42" cy="54" r="26" fx="42" fy="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.45" />
            <Stop offset="1" stopColor={surface} stopOpacity="0.06" />
          </RadialGradient>
        </Defs>
        <Circle cx="42" cy="54" r="28" fill="url(#birdGlow)" />
        {/* Tail feathers - elegant fan */}
        <Path d="M20 52 C15 48 10 52 8 58" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
        <Path d="M22 56 C16 56 12 62 10 68" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
        <Path d="M24 60 C18 64 14 70 13 76" fill="none" stroke={stroke} strokeWidth={sw - 0.5} strokeLinecap="round" opacity="0.7" />
        {/* Body - round and plump */}
        <Ellipse cx="42" cy="56" rx="26" ry="20" fill={surface} opacity="0.25" />
        <Ellipse cx="42" cy="56" rx="26" ry="20" fill="none" stroke={stroke} strokeWidth={sw} />
        {/* Belly highlight */}
        <Ellipse cx="42" cy="60" rx="16" ry="11" fill={surface} opacity="0.25" />
        {/* Wing - detailed */}
        <Path d="M60 42 C70 38 80 42 82 48 C84 54 76 58 66 56" fill={surface} stroke={fillAccent} strokeWidth="2.2" strokeLinejoin="round" opacity="0.7" />
        <Path d="M64 46 C70 44 76 48 76 52" fill="none" stroke={fillAccent} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <Path d="M62 50 C68 50 72 54 72 56" fill="none" stroke={fillAccent} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        {/* Beak - small triangle */}
        <Path d="M64 44 L70 48 L64 50 Z" fill={surface} stroke={fillAccent} strokeWidth="1" strokeLinejoin="round" opacity="0.8" />
        {/* Eye */}
        <Circle cx="56" cy="46" r="2.8" fill={ink} opacity="0.85" />
        <Circle cx="57" cy="45" r="1" fill={surface} opacity="0.9" />
        {/* Head crest */}
        <Path d="M50 38 C52 32 56 28 60 30" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <Path d="M46 36 C46 30 48 26 52 24" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        {/* Feet */}
        <Path d="M34 74 L32 82 M34 74 L36 82 M34 74 L34 84" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
        <Path d="M50 74 L48 82 M50 74 L52 82 M50 74 L50 84" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      </Svg>
    );
  }

  if (species === 'ハムスター') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <RadialGradient id="hamGlow" cx="48" cy="54" r="30" fx="48" fy="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.45" />
            <Stop offset="1" stopColor={surface} stopOpacity="0.06" />
          </RadialGradient>
        </Defs>
        <Circle cx="48" cy="54" r="31" fill="url(#hamGlow)" />
        {/* Ears - small, round */}
        <Circle cx="30" cy="34" r="10" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" />
        <Circle cx="66" cy="34" r="10" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" />
        <Circle cx="30" cy="34" r="5" fill={fillAccent} opacity="0.22" />
        <Circle cx="66" cy="34" r="5" fill={fillAccent} opacity="0.22" />
        {/* Body - round chubby */}
        <Circle cx="48" cy="55" r="30" fill={surface} opacity="0.22" />
        <Circle cx="48" cy="55" r="30" fill="none" stroke={stroke} strokeWidth={sw} />
        {/* Cheek pouches - iconic hamster feature */}
        <Ellipse cx="36" cy="56" rx="12" ry="10" fill={surface} opacity="0.3" />
        <Ellipse cx="60" cy="56" rx="12" ry="10" fill={surface} opacity="0.3" />
        <Ellipse cx="36" cy="56" rx="12" ry="10" fill="none" stroke={stroke} strokeWidth={sw - 0.8} opacity="0.5" />
        <Ellipse cx="60" cy="56" rx="12" ry="10" fill="none" stroke={stroke} strokeWidth={sw - 0.8} opacity="0.5" />
        {/* Eyes - tiny and cute */}
        <Circle cx="40" cy="48" r="2.8" fill={ink} opacity="0.85" />
        <Circle cx="56" cy="48" r="2.8" fill={ink} opacity="0.85" />
        <Circle cx="41" cy="47" r="1" fill={surface} opacity="0.9" />
        <Circle cx="57" cy="47" r="1" fill={surface} opacity="0.9" />
        {/* Nose */}
        <Ellipse cx="48" cy="56" rx="3" ry="2.2" fill={fillAccent} opacity="0.6" />
        {/* Mouth */}
        <Path d="M44 59 C46 60 48 59 48 60 C48 59 50 60 52 59" fill="none" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        {/* Whiskers - short */}
        <Path d="M32 54 L24 52 M32 56 L23 56 M32 58 L24 60" fill="none" stroke={stroke} strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
        <Path d="M64 54 L72 52 M64 56 L73 56 M64 58 L72 60" fill="none" stroke={stroke} strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
        {/* Front paws - tiny */}
        <Ellipse cx="36" cy="78" rx="5" ry="3.5" fill={surface} stroke={stroke} strokeWidth="0.8" opacity="0.45" />
        <Ellipse cx="60" cy="78" rx="5" ry="3.5" fill={surface} stroke={stroke} strokeWidth="0.8" opacity="0.45" />
        {/* Back paws */}
        <Path d="M48 82 C46 86 44 87 42 86" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <Path d="M48 82 C50 86 52 87 54 86" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </Svg>
    );
  }

  if (species === '爬虫類') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <LinearGradient id="reptileBack" x1="16" y1="34" x2="82" y2="68" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.55" />
            <Stop offset="0.5" stopColor={fill} stopOpacity="0.26" />
            <Stop offset="1" stopColor={fillAccent} stopOpacity="0.28" />
          </LinearGradient>
          <RadialGradient id="reptileEye" cx="61" cy="40" r="7" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="1" />
            <Stop offset="1" stopColor={ink} stopOpacity="0.85" />
          </RadialGradient>
        </Defs>
        <Path d="M18 58 C24 38 46 28 68 36 C80 40 86 50 82 60 C78 70 60 70 46 66 C36 64 26 66 18 58 Z" fill="url(#reptileBack)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <Path d="M24 60 C14 64 10 72 12 80" fill="none" stroke={stroke} strokeWidth={sw - 0.4} strokeLinecap="round" />
        <Path d="M30 63 C24 72 22 78 24 84 M56 67 C52 74 50 80 52 86" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        <Path d="M38 37 L42 30 L46 38 L50 31 L54 40 L58 34 L62 42" fill="none" stroke={fillAccent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <Circle cx="62" cy="43" r="5.5" fill="url(#reptileEye)" />
        <Path d="M63 39 L63 47" stroke={ink} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
        <Path d="M72 51 C76 50 78 52 80 54" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <Circle cx="34" cy="50" r="2.5" fill={fillAccent} opacity="0.36" />
        <Circle cx="45" cy="46" r="2" fill={fillAccent} opacity="0.3" />
        <Circle cx="54" cy="54" r="2.3" fill={fillAccent} opacity="0.28" />
        <Circle cx="66" cy="58" r="1.8" fill={fillAccent} opacity="0.24" />
      </Svg>
    );
  }

  if (species === '魚') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <LinearGradient id="fishBody" x1="18" y1="48" x2="76" y2="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.7" />
            <Stop offset="0.45" stopColor={fill} stopOpacity="0.42" />
            <Stop offset="1" stopColor={fillAccent} stopOpacity="0.36" />
          </LinearGradient>
          <RadialGradient id="fishScaleGlow" cx="42" cy="48" r="24" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.42" />
            <Stop offset="1" stopColor={surface} stopOpacity="0.04" />
          </RadialGradient>
        </Defs>
        <Path d="M18 48 C28 28 58 28 76 48 C58 68 28 68 18 48 Z" fill="url(#fishBody)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <Path d="M74 48 L90 34 C88 44 88 52 90 62 Z" fill={surface} stroke={stroke} strokeWidth={sw - 0.4} strokeLinejoin="round" opacity="0.6" />
        <Path d="M44 33 C48 22 58 20 62 34" fill={surface} stroke={fillAccent} strokeWidth="1.5" opacity="0.5" />
        <Path d="M44 63 C48 74 58 76 62 62" fill={surface} stroke={fillAccent} strokeWidth="1.5" opacity="0.42" />
        <Ellipse cx="42" cy="48" rx="22" ry="15" fill="url(#fishScaleGlow)" />
        <Path d="M34 38 C38 42 38 46 34 50 M43 37 C47 42 47 48 43 53 M52 39 C56 43 56 48 52 54" fill="none" stroke={surface} strokeWidth="1" strokeLinecap="round" opacity="0.38" />
        <Circle cx="30" cy="44" r="3.2" fill={ink} opacity="0.82" />
        <Circle cx="31" cy="43" r="1.1" fill={surface} opacity="0.95" />
        <Path d="M20 51 C24 55 29 55 33 52" fill="none" stroke={fillAccent} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      </Svg>
    );
  }

  if (species === '小動物') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
        <Defs>
          <RadialGradient id="smallPetGlow" cx="48" cy="54" r="31" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={surface} stopOpacity="0.48" />
            <Stop offset="1" stopColor={fill} stopOpacity="0.08" />
          </RadialGradient>
        </Defs>
        <Circle cx="48" cy="54" r="31" fill="url(#smallPetGlow)" />
        <Path d="M24 38 C16 32 14 22 20 18 C28 12 36 24 34 36" fill={surface} stroke={stroke} strokeWidth={sw - 0.4} opacity="0.55" />
        <Path d="M72 38 C80 32 82 22 76 18 C68 12 60 24 62 36" fill={surface} stroke={stroke} strokeWidth={sw - 0.4} opacity="0.55" />
        <Ellipse cx="48" cy="57" rx="30" ry="28" fill={surface} opacity="0.22" />
        <Ellipse cx="48" cy="57" rx="30" ry="28" fill="none" stroke={stroke} strokeWidth={sw} />
        <Path d="M32 48 C36 44 42 44 45 49 M51 49 C54 44 60 44 64 48" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.42" />
        <Circle cx="39" cy="52" r="3" fill={ink} opacity="0.82" />
        <Circle cx="57" cy="52" r="3" fill={ink} opacity="0.82" />
        <Circle cx="40" cy="51" r="1" fill={surface} opacity="0.92" />
        <Circle cx="58" cy="51" r="1" fill={surface} opacity="0.92" />
        <Ellipse cx="48" cy="61" rx="3.4" ry="2.5" fill={fillAccent} opacity="0.62" />
        <Path d="M48 63 C45 66 42 66 40 64 M48 63 C51 66 54 66 56 64" fill="none" stroke={stroke} strokeWidth="0.9" strokeLinecap="round" opacity="0.42" />
        <Path d="M30 60 L20 58 M30 63 L19 64 M66 60 L76 58 M66 63 L77 64" fill="none" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" opacity="0.32" />
        <Ellipse cx="36" cy="80" rx="6" ry="4" fill={surface} stroke={stroke} strokeWidth="0.9" opacity="0.45" />
        <Ellipse cx="60" cy="80" rx="6" ry="4" fill={surface} stroke={stroke} strokeWidth="0.9" opacity="0.45" />
      </Svg>
    );
  }

  if (species === '犬') {
    return (
    <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
      <Defs>
        <RadialGradient id="dogGlow" cx="48" cy="56" r="32" fx="48" fy="50" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={surface} stopOpacity="0.5" />
          <Stop offset="1" stopColor={surface} stopOpacity="0.06" />
        </RadialGradient>
      </Defs>
      <Circle cx="48" cy="56" r="34" fill="url(#dogGlow)" />
      {/* Tail - happy curve */}
      <Path d="M72 50 C88 44 90 30 84 24 C80 20 76 22 76 26" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M84 24 C82 22 78 24 76 28" fill="none" stroke={fillAccent} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Ears - floppy and warm */}
      <Ellipse cx="34" cy="34" rx="13" ry="17" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" transform="rotate(-20 34 34)" />
      <Ellipse cx="62" cy="34" rx="13" ry="17" fill={surface} stroke={stroke} strokeWidth={sw - 0.3} opacity="0.55" transform="rotate(20 62 34)" />
      <Ellipse cx="34" cy="34" rx="6" ry="10" fill={fillAccent} opacity="0.2" transform="rotate(-20 34 34)" />
      <Ellipse cx="62" cy="34" rx="6" ry="10" fill={fillAccent} opacity="0.2" transform="rotate(20 62 34)" />
      {/* Head/Body - round */}
      <Ellipse cx="48" cy="58" rx="33" ry="26" fill={surface} opacity="0.2" />
      <Ellipse cx="48" cy="58" rx="33" ry="26" fill="none" stroke={stroke} strokeWidth={sw} />
      {/* Snout */}
      <Ellipse cx="48" cy="52" rx="14" ry="9" fill={surface} opacity="0.35" />
      <Ellipse cx="48" cy="52" rx="14" ry="9" fill="none" stroke={stroke} strokeWidth={sw - 0.5} opacity="0.6" />
      {/* Nose */}
      <Ellipse cx="48" cy="48" rx="4.5" ry="3.5" fill={fillAccent} opacity="0.65" />
      {/* Eyes - warm */}
      <Circle cx="38" cy="44" r="3" fill={ink} opacity="0.85" />
      <Circle cx="58" cy="44" r="3" fill={ink} opacity="0.85" />
      <Circle cx="39" cy="43" r="1.1" fill={surface} opacity="0.9" />
      <Circle cx="59" cy="43" r="1.1" fill={surface} opacity="0.9" />
      {/* Mouth - happy */}
      <Path d="M42 56 C44 59 47 58 48 60 C49 58 52 59 54 56" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      {/* Tongue hint */}
      <Path d="M45 58 C46 62 48 62 48 60" fill={fillAccent} stroke={fillAccent} strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      {/* Front paws */}
      <Path d="M32 80 C30 86 28 88 30 88" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
      <Path d="M40 82 C38 88 36 90 38 90" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
      <Path d="M56 82 C54 88 52 90 54 90" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
      <Path d="M64 80 C62 86 60 88 62 88" fill="none" stroke={stroke} strokeWidth={sw - 0.3} strokeLinecap="round" />
      {/* Body fur texture lines */}
      <Path d="M52 70 C54 74 56 76 58 76" fill="none" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
      <Path d="M56 68 C60 72 60 74 60 76" fill="none" stroke={stroke} strokeWidth="0.7" strokeLinecap="round" opacity="0.25" />
      {/* Eyebrows */}
      <Path d="M34 40 C36 38 40 38 42 40" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <Path d="M62 40 C60 38 56 38 54 40" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden opacity={opacity}>
      <Circle cx="48" cy="48" r="30" fill={surface} stroke={stroke} strokeWidth={sw} opacity="0.8" />
      <Path d="M34 50 C38 45 44 44 48 48 C52 44 58 45 62 50" fill="none" stroke={fillAccent} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      <Circle cx="39" cy="45" r="3" fill={ink} opacity="0.8" />
      <Circle cx="57" cy="45" r="3" fill={ink} opacity="0.8" />
    </Svg>
  );
}
