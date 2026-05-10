import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';

const speciesTone: Record<string, string> = {
  犬: '#D4788F',
  猫: '#4A353A',
  うさぎ: '#F0A1B5',
  ハムスター: '#C49A7C',
  鳥: '#8CAB9A',
};

const darkSpeciesTone: Record<string, string> = {
  犬: '#E894A5',
  猫: '#C5B5BB',
  うさぎ: '#F0A1B5',
  ハムスター: '#D4A88A',
  鳥: '#9DC0AB',
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
  const fill = muted ? theme.colors.silhouetteMuted : toneMap[species] || '#E07A5F';
  const stroke = fill;
  const surface = theme.colors.silhouetteSurface;
  const ink = theme.colors.silhouetteInk;

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

  if (species === '猫') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden>
        <Circle cx="48" cy="52" r="27" fill={surface} opacity="0.34" />
        <Path d="M31 32 L37 14 L46 30" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <Path d="M37 20 L37 14 L40 18" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
        <Path d="M65 32 L59 14 L50 30" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <Path d="M59 20 L59 14 L56 18" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
        <Path d="M27 37 C19 47 18 65 30 76 C43 88 58 86 69 74 C79 62 77 44 69 36" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <Path d="M28 56 C16 52 10 72 26 74" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <Path d="M26 62 C20 66 18 72 26 74" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <Path d="M40 72 L36 82" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M48 74 L48 84" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M56 72 L60 82" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Circle cx="39" cy="49" r="2.5" fill={ink} opacity="0.65" />
        <Circle cx="57" cy="49" r="2.5" fill={ink} opacity="0.65" />
        <Path d="M38 59 C41 62 45 62 48 59" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </Svg>
    );
  }

  if (species === 'うさぎ') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden>
        <Ellipse cx="36" cy="22" rx="8" ry="26" fill={surface} opacity="0.36" transform="rotate(-10 36 22)" />
        <Ellipse cx="60" cy="22" rx="8" ry="26" fill={surface} opacity="0.36" transform="rotate(10 60 22)" />
        <Ellipse cx="36" cy="22" rx="8" ry="26" fill="none" stroke={stroke} strokeWidth="3" transform="rotate(-10 36 22)" />
        <Ellipse cx="60" cy="22" rx="8" ry="26" fill="none" stroke={stroke} strokeWidth="3" transform="rotate(10 60 22)" />
        <Ellipse cx="36" cy="22" rx="3" ry="18" fill={surface} opacity="0.6" transform="rotate(-10 36 22)" />
        <Ellipse cx="60" cy="22" rx="3" ry="18" fill={surface} opacity="0.6" transform="rotate(10 60 22)" />
        <Circle cx="48" cy="58" r="28" fill={surface} opacity="0.32" />
        <Circle cx="48" cy="58" r="28" fill="none" stroke={stroke} strokeWidth="3" />
        <Circle cx="48" cy="82" r="7" fill={surface} opacity="0.5" />
        <Circle cx="48" cy="82" r="7" fill="none" stroke={stroke} strokeWidth="2" />
        <Circle cx="39" cy="52" r="2.5" fill={ink} opacity="0.65" />
        <Circle cx="57" cy="52" r="2.5" fill={ink} opacity="0.65" />
        <Path d="M42 63 C45 67 51 67 54 63" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M40 44 L44 48" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M56 44 L52 48" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </Svg>
    );
  }

  if (species === '鳥') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden>
        <Ellipse cx="46" cy="56" rx="26" ry="20" fill={surface} opacity="0.34" />
        <Ellipse cx="46" cy="56" rx="26" ry="20" fill="none" stroke={stroke} strokeWidth="3" />
        <Path d="M62 44 L86 50 L63 58 L62 44 Z" fill="none" stroke={theme.colors.iconAccent} strokeWidth="3" strokeLinejoin="round" />
        <Path d="M72 50 L82 48 L78 55" fill="none" stroke={theme.colors.iconAccent} strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
        <Path d="M68 53 L80 56" fill="none" stroke={theme.colors.iconAccent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <Path d="M34 48 C16 43 14 68 34 70" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.72" />
        <Path d="M28 60 L24 72" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M32 62 L28 74" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M36 64 L32 76" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Circle cx="56" cy="45" r="2.5" fill={ink} opacity="0.75" />
        <Path d="M54 58 C56 53 60 50 63 47" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      </Svg>
    );
  }

  if (species === 'ハムスター') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden>
        <Circle cx="31" cy="33" r="10" fill={surface} opacity="0.35" />
        <Circle cx="65" cy="33" r="10" fill={surface} opacity="0.35" />
        <Circle cx="31" cy="33" r="10" fill="none" stroke={stroke} strokeWidth="3" />
        <Circle cx="65" cy="33" r="10" fill="none" stroke={stroke} strokeWidth="3" />
        <Circle cx="48" cy="54" r="29" fill={surface} opacity="0.32" />
        <Circle cx="48" cy="54" r="29" fill="none" stroke={stroke} strokeWidth="3" />
        <Ellipse cx="40" cy="58" rx="9" ry="10" fill={surface} opacity="0.4" />
        <Ellipse cx="56" cy="58" rx="9" ry="10" fill={surface} opacity="0.4" />
        <Circle cx="39" cy="50" r="2.5" fill={ink} opacity="0.7" />
        <Circle cx="57" cy="50" r="2.5" fill={ink} opacity="0.7" />
        <Path d="M42 62 C45 66 51 66 54 62" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M35 70 L31 80" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M61 70 L65 80" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <Path d="M40 72 C43 74 45 74 44 68" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <Path d="M56 72 C53 74 51 74 52 68" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityElementsHidden>
      <Ellipse cx="38" cy="32" rx="14" ry="18" fill={surface} opacity="0.4" transform="rotate(-15 38 32)" />
      <Ellipse cx="58" cy="32" rx="14" ry="18" fill={surface} opacity="0.4" transform="rotate(15 58 32)" />
      <Ellipse cx="38" cy="32" rx="14" ry="18" fill="none" stroke={stroke} strokeWidth="3" transform="rotate(-15 38 32)" />
      <Ellipse cx="58" cy="32" rx="14" ry="18" fill="none" stroke={stroke} strokeWidth="3" transform="rotate(15 58 32)" />
      <Path d="M30 34 C26 44 24 50 28 54" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Path d="M66 34 C70 44 72 50 68 54" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Ellipse cx="48" cy="58" rx="32" ry="26" fill={surface} opacity="0.32" />
      <Ellipse cx="48" cy="58" rx="32" ry="26" fill="none" stroke={stroke} strokeWidth="3" />
      <Path d="M74 52 C92 50 90 35 78 32" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <Path d="M80 38 C86 42 82 48 76 44" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Rect x="36" y="48" width="24" height="14" rx="7" fill={surface} opacity="0.52" />
      <Circle cx="40" cy="44" r="2.5" fill={ink} opacity="0.7" />
      <Circle cx="56" cy="44" r="2.5" fill={ink} opacity="0.7" />
      <Ellipse cx="48" cy="62" rx="6" ry="4" fill={ink} opacity="0.45" />
      <Path d="M40 74 L38 84" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M56 74 L58 84" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M42 72 C44 76 46 76 48 72" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <Path d="M54 72 C52 76 50 76 48 72" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}
