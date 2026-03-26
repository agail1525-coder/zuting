import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '../lib/theme';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  const allChips: FilterChip[] = [{ id: '__all__', label: '全部' }, ...chips];

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allChips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected =
            item.id === '__all__' ? selected === null : selected === item.id;
          return (
            <Pressable
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() =>
                onSelect(item.id === '__all__' ? null : item.id)
              }
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  chipTextSelected: {
    color: colors.backgroundDark,
    fontWeight: '600',
  },
});
