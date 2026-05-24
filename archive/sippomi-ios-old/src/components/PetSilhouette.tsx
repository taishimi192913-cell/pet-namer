import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useThemeMode } from '../theme';
import { canRenderSvg } from '../nativeCapabilities';

const speciesTone: Record<string, string> = {
  犬: '#E07A5F',
  猫: '#3D2C2A',
  うさぎ: '#F9A66C',
  ハムスター: '#B9825D',
  鳥: '#6E8F7A',
};

const darkSpeciesTone: Record<string, string> = {
  犬: '#F59B79',
  猫: '#CDBFB5',
  うさぎ: '#F9A66C',
  ハムスター: '#D39B72',
  鳥: '#91B59C',
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
  const surface = theme.colors.silhouetteSurface;
  const ink = theme.colors.silhouetteInk;

  if (!canRenderSvg()) {
    return (
      <View
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
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx="48" cy="51" r="27" fill={fill} opacity="0.95" />
        <Path d="M27 33 L35 12 L47 30 Z" fill={fill} />
        <Path d="M69 33 L61 12 L49 30 Z" fill={fill} />
        <Path d="M24 58 C8 56 9 76 27 75" fill="none" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <Circle cx="39" cy="48" r="3" fill={surface} opacity="0.9" />
        <Circle cx="57" cy="48" r="3" fill={surface} opacity="0.9" />
      </Svg>
    );
  }

  if (species === 'うさぎ') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Ellipse cx="38" cy="24" rx="9" ry="24" fill={fill} transform="rotate(-12 38 24)" />
        <Ellipse cx="58" cy="24" rx="9" ry="24" fill={fill} transform="rotate(12 58 24)" />
        <Circle cx="48" cy="55" r="29" fill={fill} opacity="0.95" />
        <Ellipse cx="48" cy="66" rx="17" ry="10" fill={surface} opacity="0.42" />
        <Circle cx="39" cy="51" r="3" fill={ink} opacity="0.65" />
        <Circle cx="57" cy="51" r="3" fill={ink} opacity="0.65" />
      </Svg>
    );
  }

  if (species === '鳥') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Ellipse cx="46" cy="54" rx="28" ry="22" fill={fill} />
        <Path d="M63 42 L85 48 L64 57 Z" fill={theme.colors.iconAccent} />
        <Path d="M35 45 C18 41 16 65 36 67 C29 58 30 51 35 45 Z" fill={surface} opacity="0.35" />
        <Circle cx="57" cy="45" r="3" fill={ink} opacity="0.75" />
      </Svg>
    );
  }

  if (species === 'ハムスター') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx="33" cy="35" r="12" fill={fill} opacity="0.85" />
        <Circle cx="63" cy="35" r="12" fill={fill} opacity="0.85" />
        <Circle cx="48" cy="55" r="30" fill={fill} />
        <Ellipse cx="48" cy="65" rx="18" ry="11" fill={surface} opacity="0.45" />
        <Circle cx="39" cy="51" r="3" fill={ink} opacity="0.7" />
        <Circle cx="57" cy="51" r="3" fill={ink} opacity="0.7" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx="34" cy="34" r="11" fill={fill} />
      <Circle cx="62" cy="34" r="11" fill={fill} />
      <Ellipse cx="48" cy="56" rx="31" ry="25" fill={fill} opacity="0.96" />
      <Path d="M67 58 C84 55 86 36 72 31" fill="none" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      <Rect x="34" y="48" width="28" height="18" rx="9" fill={surface} opacity="0.38" />
      <Circle cx="39" cy="47" r="3" fill={ink} opacity="0.7" />
      <Circle cx="57" cy="47" r="3" fill={ink} opacity="0.7" />
    </Svg>
  );
}
