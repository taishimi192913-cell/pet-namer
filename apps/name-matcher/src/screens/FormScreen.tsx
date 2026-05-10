import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { PetSilhouette } from '../components/PetSilhouette';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { Section } from '../components/Section';
import { SpeciesOptionCard } from '../components/SpeciesOptionCard';
import { styles } from '../styles';
import { toggleValue } from '../session';
import { useThemeMode } from '../theme';
import type { FiltersState } from '../types';

const stepDotHitSlop = { top: 19, bottom: 19, left: 10, right: 10 };

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
  const [isSpeciesExpanded, setIsSpeciesExpanded] = useState(!filters.species.length);
  const selectedSpecies = SPECIES_OPTIONS.find((option) => option.value === filters.species[0]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    if (!filters.species.length) {
      setIsSpeciesExpanded(true);
    }
  }, [filters.species.length]);

  const genderSummary = filters.gender.length ? filters.gender.join('・') : 'どちらでも';
  const colorSummary = filters.color.length ? filters.color.join('・') : '未選択';
  const vibeSummary = filters.vibe.length ? filters.vibe.join('・') : '未選択';
  const lengthSummary = filters.length.length ? filters.length.join('・') : '未選択';
  const themeSummary = filters.theme.length ? filters.theme.join('・') : '未選択';

  function toggleStep(step: number) {
    setExpandedStep((prev) => (prev === step ? null : step));
  }

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView contentContainerStyle={styles.formScrollContent}>
        <View style={styles.formHeader}>
          <View style={styles.screenHeaderRow}>
            {onBack ? (
              <Pressable
                style={theme.apply(styles.iconButton, 'iconButton')}
                onPress={onBack}
                accessibilityLabel="条件入力へ戻る"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={20} color={theme.colors.icon} />
              </Pressable>
            ) : null}
            <View style={styles.screenHeaderTitle}>
              <Text style={styles.eyebrow}>Step 1-4</Text>
              <Text style={theme.apply(styles.formTitle, 'formTitle')}>まずはペットの条件を教えてください</Text>
            </View>
            <View
              style={theme.apply(styles.iconButtonMuted, 'iconButtonMuted')}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Ionicons name="cog" size={20} color={theme.colors.iconAccent} />
            </View>
          </View>
          <Text style={theme.apply(styles.formBody, 'formBody')}>
            必須は種類だけです。ほかはスキップできるので、ざっくりでも大丈夫です。
          </Text>
          <View style={styles.formStepDots} accessibilityLabel="入力カテゴリ 1 から 4">
            <View style={[styles.formStepDot, styles.formStepDotActive]} />
            <Pressable
              onPress={() => toggleStep(2)}
              accessibilityLabel="Step 2 性別・色イメージを開く"
              accessibilityRole="button"
              hitSlop={stepDotHitSlop}
            >
              <View style={[styles.formStepDot, expandedStep === 2 && styles.formStepDotActive]} />
            </Pressable>
            <Pressable
              onPress={() => toggleStep(3)}
              accessibilityLabel="Step 3 雰囲気を開く"
              accessibilityRole="button"
              hitSlop={stepDotHitSlop}
            >
              <View style={[styles.formStepDot, expandedStep === 3 && styles.formStepDotActive]} />
            </Pressable>
            <Pressable
              onPress={() => toggleStep(4)}
              accessibilityLabel="Step 4 文字数・テーマを開く"
              accessibilityRole="button"
              hitSlop={stepDotHitSlop}
            >
              <View style={[styles.formStepDot, expandedStep === 4 && styles.formStepDotActive]} />
            </Pressable>
          </View>
        </View>

        <Section title="Step 1. ペットの種類" body={`現在: ${selectedSpeciesText}`}>
          {isSpeciesExpanded ? (
            <View style={styles.speciesGrid}>
              {SPECIES_OPTIONS.map((option) => (
                <SpeciesOptionCard
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  active={filters.species.includes(option.value)}
                  onPress={() => {
                    onFiltersChange({
                      ...filters,
                      species: [option.value],
                    });
                    setIsSpeciesExpanded(false);
                  }}
                />
              ))}
            </View>
          ) : (
            <Pressable
              style={theme.apply(styles.selectedSpeciesSummary, 'selectedSpeciesSummary')}
              onPress={() => setIsSpeciesExpanded(true)}
              accessibilityLabel={`ペットの種類を変更する。現在は${selectedSpecies?.label ?? selectedSpeciesText}`}
              accessibilityRole="button"
            >
              <View style={styles.selectedSpeciesIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <PetSilhouette species={selectedSpecies?.value ?? filters.species[0]} size={42} />
              </View>
              <View style={styles.selectedSpeciesTextBlock}>
                <Text style={theme.apply(styles.selectedSpeciesLabel, 'selectedSpeciesLabel')}>選択中</Text>
                <Text style={theme.apply(styles.selectedSpeciesName, 'selectedSpeciesName')}>
                  {selectedSpecies?.label ?? selectedSpeciesText}
                </Text>
              </View>
              <View style={styles.selectedSpeciesChange}>
                <Text style={theme.apply(styles.selectedSpeciesChangeText, 'selectedSpeciesChangeText')}>変更</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.iconAccent} />
              </View>
            </Pressable>
          )}
        </Section>

        {/* Step 2: 性別 + 色イメージ (accordion) */}
        <Pressable
          style={theme.apply(styles.selectedSpeciesSummary, 'selectedSpeciesSummary')}
          onPress={() => toggleStep(2)}
          accessibilityLabel={`Step 2 性別・色イメージ。性別: ${genderSummary}、色: ${colorSummary}`}
          accessibilityRole="button"
        >
          <View style={styles.selectedSpeciesTextBlock}>
            <Text style={theme.apply(styles.selectedSpeciesLabel, 'selectedSpeciesLabel')}>Step 2</Text>
            <Text style={theme.apply(styles.selectedSpeciesName, 'selectedSpeciesName')}>
              性別: {genderSummary} / 色: {colorSummary}
            </Text>
          </View>
          <Ionicons name={expandedStep === 2 ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.iconAccent} />
        </Pressable>
        {expandedStep === 2 && (
          <>
            <Section title="性別" body="最初は broad に出したいので、既定値は『どちらでも』にしています。">
              <View style={styles.chipWrap}>
                {GENDER_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    active={filters.gender.includes(option.value)}
                    accessibilityLabel={`性別: ${option.label}${filters.gender.includes(option.value) ? '、選択中' : ''}`}
                    onPress={() => onFiltersChange({
                      ...filters,
                      gender: toggleValue(filters.gender, option.value, true),
                    })}
                  />
                ))}
              </View>
            </Section>
            <Section title="色イメージ" body="白、黒、茶色など、見た目から想像する雰囲気を足せます。">
              <View style={styles.chipWrap}>
                {COLOR_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    active={filters.color.includes(option)}
                    accessibilityLabel={`色イメージ: ${option}${filters.color.includes(option) ? '、選択中' : ''}`}
                    onPress={() => onFiltersChange({
                      ...filters,
                      color: toggleValue(filters.color, option),
                    })}
                  />
                ))}
              </View>
            </Section>
          </>
        )}

        {/* Step 3: 雰囲気 (accordion) */}
        <Pressable
          style={theme.apply(styles.selectedSpeciesSummary, 'selectedSpeciesSummary')}
          onPress={() => toggleStep(3)}
          accessibilityLabel={`Step 3 雰囲気。現在: ${vibeSummary}`}
          accessibilityRole="button"
        >
          <View style={styles.selectedSpeciesTextBlock}>
            <Text style={theme.apply(styles.selectedSpeciesLabel, 'selectedSpeciesLabel')}>Step 3</Text>
            <Text style={theme.apply(styles.selectedSpeciesName, 'selectedSpeciesName')}>
              雰囲気: {vibeSummary}
            </Text>
          </View>
          <Ionicons name={expandedStep === 3 ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.iconAccent} />
        </Pressable>
        {expandedStep === 3 && (
          <Section title="雰囲気" body="かわいい、和風、上品などを複数選べます。">
            <View style={styles.chipWrap}>
              {VIBE_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  active={filters.vibe.includes(option)}
                  accessibilityLabel={`雰囲気: ${option}${filters.vibe.includes(option) ? '、選択中' : ''}`}
                  onPress={() => onFiltersChange({
                    ...filters,
                    vibe: toggleValue(filters.vibe, option),
                  })}
                />
              ))}
            </View>
          </Section>
        )}

        {/* Step 4: 文字数 + テーマ (accordion) */}
        <Pressable
          style={theme.apply(styles.selectedSpeciesSummary, 'selectedSpeciesSummary')}
          onPress={() => toggleStep(4)}
          accessibilityLabel={`Step 4 文字数・テーマ。文字数: ${lengthSummary}、テーマ: ${themeSummary}`}
          accessibilityRole="button"
        >
          <View style={styles.selectedSpeciesTextBlock}>
            <Text style={theme.apply(styles.selectedSpeciesLabel, 'selectedSpeciesLabel')}>Step 4</Text>
            <Text style={theme.apply(styles.selectedSpeciesName, 'selectedSpeciesName')}>
              文字数: {lengthSummary} / テーマ: {themeSummary}
            </Text>
          </View>
          <Ionicons name={expandedStep === 4 ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.iconAccent} />
        </Pressable>
        {expandedStep === 4 && (
          <>
            <Section title="文字数">
              <View style={styles.chipWrap}>
                {LENGTH_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    active={filters.length.includes(option.value)}
                    accessibilityLabel={`文字数: ${option.label}${filters.length.includes(option.value) ? '、選択中' : ''}`}
                    onPress={() => onFiltersChange({
                      ...filters,
                      length: toggleValue(filters.length, option.value),
                    })}
                  />
                ))}
              </View>
            </Section>
            <Section title="テーマ">
              <View style={styles.chipWrap}>
                {THEME_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    active={filters.theme.includes(option)}
                    accessibilityLabel={`テーマ: ${option}${filters.theme.includes(option) ? '、選択中' : ''}`}
                    onPress={() => onFiltersChange({
                      ...filters,
                      theme: toggleValue(filters.theme, option),
                    })}
                  />
                ))}
              </View>
            </Section>
          </>
        )}

        <Pressable
          style={[styles.primaryButton, !filters.species.length ? styles.primaryButtonDisabled : null]}
          onPress={onStart}
          disabled={!filters.species.length}
          accessibilityLabel="条件を確定して名前のスワイプ診断へ進む"
          accessibilityRole="button"
          accessibilityState={{ disabled: !filters.species.length }}
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
