import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Patriarch } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function PatriarchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [patriarch, setPatriarch] = useState<Patriarch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const patriarchs = await api.getPatriarchs();
        const found = patriarchs.find((p) => p.id === id);
        if (found) {
          setPatriarch(found);
          navigation.setOptions({ title: found.nameZh });
        }
      } catch (err) {
        console.error('Failed to fetch patriarch detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading || !patriarch) return <LoadingView />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={64} color={colors.gold} />
        </View>
        <Text style={styles.heroTitle}>{patriarch.nameZh}</Text>
        <Text style={styles.heroSubtitle}>{patriarch.nameEn}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{patriarch.title}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{patriarch.era}</Text>
          </View>
        </View>
      </View>

      <View style={styles.biographyCard}>
        <Text style={styles.sectionTitle}>传记</Text>
        <Text style={styles.biographyText}>{patriarch.biography}</Text>
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
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundCard,
    borderWidth: 3,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  badge: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.goldLight,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  biographyCard: {
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
  biographyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 26,
  },
});
