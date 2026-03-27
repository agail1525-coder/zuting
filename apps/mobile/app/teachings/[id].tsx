import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Teaching } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function TeachingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        setError(null);
        const found = await api.getTeachingById(id);
        setTeaching(found);
        navigation.setOptions({ title: found.title });
      } catch (err) {
        console.error('Failed to fetch teaching detail:', err);
        setError('加载祖训详情失败');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !teaching) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gold} />
        <Text style={styles.errorText}>{error ?? '祖训不存在'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="book" size={64} color={colors.gold} />
        </View>
        <Text style={styles.heroTitle}>{teaching.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{teaching.source}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>原文</Text>
        <Text style={styles.originalText}>{teaching.originalText}</Text>
      </View>

      {teaching.religion && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>所属信仰</Text>
          <Text style={styles.religionText}>{teaching.religion.nameZh}</Text>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: 'rgba(212, 168, 85, 0.08)',
  },
  iconCircle: {
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
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  badge: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  badgeText: {
    color: colors.goldLight,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
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
  originalText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 28,
  },
  religionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
