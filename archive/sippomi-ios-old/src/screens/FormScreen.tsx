import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  COLOR_OPTIONS,
  GENDER_OPTIONS,
  LENGTH_OPTIONS,
  SPECIES_OPTIONS,
  THEME_OPTIONS,
  VIBE_OPTIONS,
} from '../../../../packages/recommendation-core/index.js';
import { Chip } from '../components/Chip';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { Section } from '../components/Section';
import { SpeciesOptionCard } from '../components/SpeciesOptionCard';
import { styles } from '../styles';
import { toggleValue } from '../session';
import { useThemeMode } from '../theme';
import type { FiltersState } from '../types';

export function FormScreen({
  filters,
  onFiltersChange,
  onStart,
  onBack,
}: {
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  onStart: () => void;
  onBack?: () => void;
}) {
  const theme = useThemeMode();
  const selectedSpeciesText = filters.species.length ? filters.species.join('・') : '未選択';

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView contentContainerStyle={styles.formScrollContent}>
        <View style={styles.formHeader}>
          <View style={styles.screenHeaderRow}>
            {onBack ? (
              <Pressable style={theme.apply(styles.iconButton, 'iconButton')} onPress={onBack}>
                <Ionicons name="arrow-back" size={20} color={theme.colors.icon} />
              </Pressable>
            ) : null}
            <View style={styles.screenHeaderTitle}>
              <Text style={styles.eyebrow}>Step 1-4</Text>
              <Text style={theme.apply(styles.formTitle, 'formTitle')}>まずはペットの条件を教えてください</Text>
            </View>
            <View style={theme.apply(styles.iconButtonMuted, 'iconButtonMuted')}>
              <Ionicons name="cog" size={20} color={theme.colors.iconAccent} />
            </View>
          </View>
          <Text style={theme.apply(styles.formBody, 'formBody')}>
            必須は種類だけです。ほかはスキップできるので、ざっくりでも大丈夫です。
          </Text>
        </View>

        <Section title="Step 1. ペットの種類" body={`現在: ${selectedSpeciesText}`}>
          <View style={styles.speciesGrid}>
            {SPECIES_OPTIONS.map((option) => (
              <SpeciesOptionCard
                key={option.value}
                label={option.label}
                value={option.value}
                active={filters.species.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  species: toggleValue(filters.species, option.value, true),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 2. 性別" body="最初は broad に出したいので、既定値は『どちらでも』にしています。">
          <View style={styles.chipWrap}>
            {GENDER_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={filters.gender.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  gender: toggleValue(filters.gender, option.value, true),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 2. 色イメージ" body="白、黒、茶色など、見た目から想像する雰囲気を足せます。">
          <View style={styles.chipWrap}>
            {COLOR_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.color.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  color: toggleValue(filters.color, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 3. 雰囲気" body="かわいい、和風、上品などを複数選べます。">
          <View style={styles.chipWrap}>
            {VIBE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.vibe.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  vibe: toggleValue(filters.vibe, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 4. 文字数">
          <View style={styles.chipWrap}>
            {LENGTH_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={filters.length.includes(option.value)}
                onPress={() => onFiltersChange({
                  ...filters,
                  length: toggleValue(filters.length, option.value),
                })}
              />
            ))}
          </View>
        </Section>

        <Section title="Step 4. テーマ">
          <View style={styles.chipWrap}>
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={filters.theme.includes(option)}
                onPress={() => onFiltersChange({
                  ...filters,
                  theme: toggleValue(filters.theme, option),
                })}
              />
            ))}
          </View>
        </Section>

        <Pressable
          style={[styles.primaryButton, !filters.species.length ? styles.primaryButtonDisabled : null]}
          onPress={onStart}
          disabled={!filters.species.length}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="heart" size={18} color={theme.colors.iconOnPrimary} />
            <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>スワイプ診断へ進む</Text>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenSafeArea>
  );
}
