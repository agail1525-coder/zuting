import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HolySite } from '../lib/api';
import { colors, fontSize, borderRadius, spacing } from '../lib/theme';

interface HolySiteCardProps {
  site: HolySite;
  compact?: boolean;
}

export function HolySiteCard({ site, compact }: HolySiteCardProps) {
  const router = useRouter();
  const name = (site as any).name ?? site.nameZh;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/holy-sites/[id]', params: { id: site.id } })}
    >
      {site.imageUrl ? (
        <Image source={{ uri: site.imageUrl }} style={[styles.image, compact && styles.imageCompact]} />
      ) : (
        <View style={[styles.imagePlaceholder, compact && styles.imageCompact]}>
          <Ionicons name="location" size={compact ? 24 : 36} color={colors.gold} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.nameEn} numberOfLines={1}>{site.nameEn}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {site.city ? `${site.city}, ${site.country}` : site.country}
          </Text>
        </View>
        {!compact && site.description && (
          <Text style={styles.description} numberOfLines={2}>{site.description}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  cardCompact: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: 140,
  },
  imageCompact: {
    height: 100,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(0, 102, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  nameEn: {
    color: colors.textMuted,
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  location: {
    color: colors.textMuted,
    fontSize: 11,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
});
