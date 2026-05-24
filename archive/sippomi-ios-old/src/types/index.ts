import { type StyleProp, type ViewStyle } from 'react-native';
import { createEmptyPreferenceProfile } from '../../../../packages/recommendation-core/index.js';

export type SwipeAction = 'like' | 'pass' | 'hold';
export type RootStackParamList = {
  Intro: undefined;
  Form: undefined;
  Swipe: undefined;
  Results: undefined;
};

export type PetName = {
  name: string;
  reading?: string;
  meaning: string;
  species: string[];
  gender: string;
  vibe: string[];
  color: string[];
  length?: string;
  theme?: string[];
};

export type FiltersState = {
  species: string[];
  gender: string[];
  color: string[];
  vibe: string[];
  length: string[];
  theme: string[];
};

export type SwipeCandidate = {
  key: string;
  item: PetName;
  reasonParts: string[];
  recommendationLabel: string;
  scores: {
    initialFit: number;
    learnedPreference: number;
    diversityBoost: number;
    total: number;
  };
};

export type SwipeRecord = {
  action: SwipeAction;
  candidate: SwipeCandidate;
};

export type PreferenceProfile = ReturnType<typeof createEmptyPreferenceProfile>;
export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';
export type AnimatedCardStyle = StyleProp<ViewStyle>;
