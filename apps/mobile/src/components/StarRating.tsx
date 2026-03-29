import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RATING_LABELS: Record<number, string> = {
  1: '很差',
  2: '较差',
  3: '一般',
  4: '满意',
  5: '极好',
};

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 24, readonly = false }: StarRatingProps) {
  const label = value > 0 ? RATING_LABELS[value] : '';

  return (
    <View style={styles.wrapper}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={!readonly && onChange ? () => onChange(star) : undefined}
            disabled={readonly || !onChange}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <Text style={[styles.star, { fontSize: size, color: star <= value ? '#F5A623' : '#D1D5DB' }]}>
              {star <= value ? '\u2605' : '\u2606'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 4 },
  starsRow: { flexDirection: 'row', gap: 4 },
  star: { lineHeight: undefined },
  label: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
