import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Seal } from '../lib/api';
import { colors, fontSize, borderRadius, spacing, seriesColors } from '../lib/theme';

interface SealCardProps {
  seal: Seal;
}

export function SealCard({ seal }: SealCardProps) {
  const router = useRouter();
  const seriesColor = seriesColors[seal.series] || colors.gold;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/seals/[id]', params: { id: seal.id } })}
    >
      <View style={[styles.numberBadge, { backgroundColor: seriesColor }]}>
        <Text style={styles.numberText}>{seal.number}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.nameZh}>{(seal as any).name ?? seal.nameZh}</Text>
        <Text style={styles.nameEn} numberOfLines={1}>
          {seal.nameEn}
        </Text>
        <Text style={styles.poem} numberOfLines={2}>
          {(seal as any).poem ?? (seal as any).verse ?? ''}
        </Text>
      </View>
      <View style={[styles.seriesIndicator, { backgroundColor: seriesColor }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.8,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  numberText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  nameZh: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  nameEn: {
    color: colors.goldLight,
    fontSize: fontSize.sm,
  },
  poem: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 4,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  seriesIndicator: {
    width: 4,
    alignSelf: 'stretch',
  },
});
