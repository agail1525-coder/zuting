import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, HolySite } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function HolySiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [site, setSite] = useState<HolySite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        setError(null);
        const found = await api.getHolySiteById(id);
        setSite(found);
        navigation.setOptions({ title: found.nameZh });
      } catch (err) {
        console.error('Failed to fetch holy site detail:', err);
        setError('加载圣地详情失败');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !site) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gold} />
        <Text style={styles.errorText}>{error ?? '圣地不存在'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Gradient hero placeholder */}
      <View style={styles.hero}>
        <Ionicons name="location" size={64} color={colors.gold} />
        <Text style={styles.heroTitle}>{site.nameZh}</Text>
        <Text style={styles.heroSubtitle}>{site.nameEn}</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoRow}>
        <InfoCard
          icon="globe-outline"
          label="国家"
          value={site.country}
        />
        {site.city && (
          <InfoCard icon="business-outline" label="城市" value={site.city} />
        )}
      </View>

      <View style={styles.infoRow}>
        <InfoCard
          icon="navigate-outline"
          label="坐标"
          value={`${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`}
        />
        <InfoCard
          icon="time-outline"
          label="UTC偏移"
          value={`UTC${site.utcOffset >= 0 ? '+' : ''}${site.utcOffset}`}
        />
      </View>

      {/* Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>介绍</Text>
        <Text style={styles.descriptionText}>{site.description}</Text>
      </View>
    </ScrollView>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={20} color={colors.gold} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
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
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
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
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
    textAlign: 'center',
  },
  descriptionCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
