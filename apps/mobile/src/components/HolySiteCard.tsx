import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HolySite } from '../lib/api';
import { colors, fontSize, borderRadius, spacing } from '../lib/theme';

interface HolySiteCardProps {
  site: HolySite;
}

export function HolySiteCard({ site }: HolySiteCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/holy-sites/[id]', params: { id: site.id } })}
    >
      {site.imageUrl ? (
        <Image source={{ uri: site.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.gradientBg}>
          <Ionicons name="location" size={32} color={colors.gold} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.nameZh} numberOfLines={1}>
          {site.nameZh}
        </Text>
        <Text style={styles.nameEn} numberOfLines={1}>
          {site.nameEn}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
          <Text style={styles.country}>{site.country}</Text>
          {site.city && <Text style={styles.city}>· {site.city}</Text>}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {site.description}
        </Text>
      </View>
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
  },
  cardPressed: {
    opacity: 0.8,
  },
  image: {
    width: 80,
    height: '100%',
    minHeight: 80,
  },
  gradientBg: {
    width: 80,
    backgroundColor: 'rgba(212, 168, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  country: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  city: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 4,
    lineHeight: 18,
  },
});
