import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLOR_OPTIONS,
  GENDER_OPTIONS,
  LENGTH_OPTIONS,
  THEME_OPTIONS,
  TONE_OPTIONS,
  VIBE_OPTIONS,
} from '../../../../packages/recommendation-core/index.js';
import { Chip } from './Chip';
import { Section } from './Section';
import { styles } from '../styles';
import { toggleValue } from '../session';
import { useThemeMode } from '../theme';
import { tokens } from '../designTokens';
import type { FiltersState } from '../types';

interface FilterSheetProps {
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  onClose: () => void;
}

interface ChipGroup {
  title: string;
  body?: string;
  options: string[];
  key: keyof FiltersState;
  single?: boolean;
}

function renderChipGroup(
  section: ChipGroup,
  filters: FiltersState,
  onChange: (next: FiltersState) => void,
) {
  const isActive = (value: string) => {
    const arr = filters[section.key];
    return Array.isArray(arr) && arr.includes(value);
  };
  const onPress = (value: string) => {
    onChange({
      ...filters,
      [section.key]: toggleValue(
        (filters[section.key] as string[]) || [],
        value,
        section.single,
      ),
    });
  };

  return (
    <Section key={section.key} title={section.title} body={section?.body}>
      <View style={styles.chipWrap}>
        {section.options.map((option) => (
          <Chip
            key={option}
            label={option}
            active={isActive(option)}
            onPress={() => onPress(option)}
          />
        ))}
      </View>
    </Section>
  );
}

export function FilterSheet({ filters, onFiltersChange, onClose }: FilterSheetProps) {
  const theme = useThemeMode();

  const sections: ChipGroup[] = [
    { title: '性別', body: 'どちらでも可', key: 'gender', single: true,
      options: GENDER_OPTIONS.map((o: {value: string; label: string}) => o.value) },
    { title: '色イメージ', body: '見た目から想像する雰囲気', key: 'color',
      options: COLOR_OPTIONS },
    { title: '雰囲気', body: '名前全体のイメージ', key: 'vibe',
      options: VIBE_OPTIONS },
    { title: '文字数', key: 'length',
      options: LENGTH_OPTIONS.map((o: {value: string; label: string}) => o.value) },
    { title: 'テーマ', key: 'theme',
      options: THEME_OPTIONS },
    { title: '名前の響き', body: 'やわらかい・かたい・さわやか など', key: 'tone',
      options: TONE_OPTIONS },
  ];

  return (
    <View style={styles.modalDock}>
      <Pressable
        style={styles.modalBackdropPressable}
        onPress={onClose}
        accessibilityLabel="フィルターを閉じる"
        accessibilityRole="button"
      />
      <View style={[styles.nameModalCard, theme.isDark ? { backgroundColor: '#2D1F24' } : null, { maxHeight: '80%' }]}>
        <View style={styles.modalHandle} />
        <View style={styles.filterSheetHeader}>
          <Text style={[styles.filterSheetTitle, theme.isDark ? { color: '#F5EDF0' } : null]}>フィルター設定</Text>
          <Pressable
            style={styles.filterSheetCloseBtn}
            onPress={onClose}
            accessibilityLabel="閉じる"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={tokens.colors.textAccentDark} />
          </Pressable>
        </View>
        <ScrollView style={styles.filterSheetScroll} showsVerticalScrollIndicator={false}>
          {sections.map((section) => renderChipGroup(section, filters, onFiltersChange))}
        </ScrollView>
      </View>
    </View>
  );
}
