import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Temple } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function TempleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const temples = await api.getTemples();
        const found = temples.find((t) => t.id === id);
        if (found) {
          setTemple(found);
          navigation.setOptions({ title: found.nameZh });
        }
      } catch (err) {
        console.error('Failed to fetch temple detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading || !temple) return <LoadingView />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="business" size={64} color={colors.gold} />
        <Text style={styles.heroTitle}>{temple.nameZh}</Text>
        <Text style={styles.heroSubtitle}>{temple.nameEn}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Ionicons name="globe-outline" size={20} color={colors.gold} />
          <Text style={styles.infoLabel}>国家</Text>
          <Text style={styles.infoValue}>{temple.country}</Text>
        </View>
        {temple.city && (
          <View style={styles.infoCard}>
            <Ionicons name="business-outline" size={20} color={colors.gold} />
            <Text style={styles.infoLabel}>城市</Text>
            <Text style={styles.infoValue}>{temple.city}</Text>
          </View>
        )}
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>介绍</Text>
        <Text style={styles.descriptionText}>{temple.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: 'rgba(212, 168, 85, 0.08)',
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  descriptionCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: spacing.md,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 26,
  },
});
