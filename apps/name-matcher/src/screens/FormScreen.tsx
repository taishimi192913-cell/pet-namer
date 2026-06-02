import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SPECIES_OPTIONS } from '../../../../packages/recommendation-core/index.js';
import { PetSilhouette } from '../components/PetSilhouette';
import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { styles } from '../styles';
import { useThemeMode } from '../theme';
import { tokens } from '../designTokens';
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

  return (
    <ScreenSafeArea style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <View style={styles.quickFormShell}>
        {/* Top bar with back button */}
        <View style={[styles.screenHeaderRow, { marginBottom: 8 }]}>
          {onBack ? (
            <Pressable
              style={theme.apply(styles.iconButton, 'iconButton')}
              onPress={onBack}
              accessibilityLabel="戻る"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.icon} />
            </Pressable>
          ) : null}
        </View>

        {/* Scrollable content: title + species grid */}
        <ScrollView
          style={styles.quickFormBody}
          contentContainerStyle={styles.quickFormBodyInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Title area */}
          <Text style={styles.eyebrow}>しっぽみ</Text>
          <Text style={theme.apply(styles.quickFormTitle, 'quickFormTitle')}>
            ペットの種類を選んで{'\n'}スワイプを始めよう
          </Text>
          <Text style={theme.apply(styles.quickFormHint, 'quickFormHint')}>
            あとで条件を追加・変更できます
          </Text>

          {/* Species grid - single selection */}
          <View style={styles.quickFormSpeciesGrid}>
            {SPECIES_OPTIONS.map((option) => {
              const active = filters.species.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.quickFormSpeciesCard,
                    active && styles.quickFormSpeciesCardActive,
                  ]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onFiltersChange({
                      ...filters,
                      species: active ? [] : [option.value],
                    });
                  }}
                  accessibilityLabel={`${option.label}${active ? '、選択中' : ''}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={styles.quickFormSpeciesSilhouette}>
                    <PetSilhouette species={option.value} size={48} />
                  </View>
                  <Text style={[
                    styles.quickFormSpeciesLabel,
                    active && styles.quickFormSpeciesLabelActive,
                  ]}>
                    {option.label}
                  </Text>
                  {active && (
                    <View style={styles.quickFormSpeciesCheck}>
                      <Ionicons name="checkmark-circle" size={22} color={tokens.colors.cornflower} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Fixed bottom button */}
        <View style={styles.quickFormFooter}>
          <Pressable
            style={[
              styles.primaryButton,
              !filters.species.length && styles.primaryButtonDisabled,
              { marginTop: 0, width: '100%' },
            ]}
            onPress={() => {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onStart();
            }}
            disabled={!filters.species.length}
            accessibilityLabel="スワイプ診断を始める"
            accessibilityRole="button"
            accessibilityState={{ disabled: !filters.species.length }}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="sparkles" size={18} color={theme.colors.iconOnPrimary} />
              <Text style={theme.apply(styles.primaryButtonText, 'primaryButtonText')}>
                スワイプ診断を始める
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScreenSafeArea>
  );
}
