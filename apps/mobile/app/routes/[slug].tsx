import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { api, Route, ItineraryDay } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: '禅宗路线',
  BUDDHIST: '佛教圣地',
  TAOIST: '道教寻根',
  CHRISTIAN: '基督文化',
  ISLAMIC: '伊斯兰文化',
  CROSS_CULTURAL: '跨文化融合',
  HINDU: '印度教',
  JEWISH: '犹太教',
  CULTURAL_HERITAGE: '文化遗产',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '轻松',
  MODERATE: '适中',
  CHALLENGING: '挑战',
};

export default function RouteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getRouteBySlug(slug)
      .then(setRoute)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingView />;
  if (error || !route) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: '路线详情' }} />
        <Text style={styles.errorText}>路线不存在或加载失败</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>返回</Text>
        </Pressable>
      </View>
    );
  }

  const price = (route.priceFrom / 100).toLocaleString();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: route.title, headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badges}>
          <Text style={styles.categoryBadge}>
            {CATEGORY_LABELS[route.category] ?? route.category}
          </Text>
          <Text style={styles.difficultyBadge}>
            {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
          </Text>
        </View>
        <Text style={styles.title}>{route.title}</Text>
        <Text style={styles.subtitle}>{route.subtitle}</Text>
        <Text style={styles.titleEn}>{route.titleEn}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>📅 {route.duration}天{route.nights}晚</Text>
          <Text style={styles.metaItem}>🌤 {route.season}</Text>
          <Text style={styles.metaItem}>👥 {route.groupSize}</Text>
          {route.rating && (
            <Text style={styles.metaItem}>★ {route.rating.toFixed(1)} ({route.reviewCount}评)</Text>
          )}
        </View>
      </View>

      {/* Price Card */}
      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>起价</Text>
        <Text style={styles.priceValue}>¥{price}<Text style={styles.priceUnit}>/人</Text></Text>
        <Pressable
          style={({ pressed }) => [styles.consultButton, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color={colors.backgroundDark} />
          <Text style={styles.consultButtonText}>AI规划师咨询</Text>
        </Pressable>
        <Text style={styles.bookCount}>已有 {route.bookCount} 人预订</Text>
      </View>

      {/* Highlights */}
      <View style={styles.highlightsRow}>
        {route.highlights.map((h) => (
          <View key={h} style={styles.highlightChip}>
            <Text style={styles.highlightText}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>路线介绍</Text>
        <Text style={styles.descriptionText}>{route.description}</Text>
      </View>

      {/* Itinerary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>逐日行程</Text>
        {(route.itinerary as ItineraryDay[]).map((day) => (
          <View key={day.day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayCircle}>
                <Text style={styles.dayNumber}>{day.day}</Text>
              </View>
              <Text style={styles.dayTitle}>Day {day.day}: {day.title}</Text>
            </View>
            {day.activities && day.activities.length > 0 && (
              <View style={styles.activitiesRow}>
                {day.activities.map((act, i) => (
                  <Text key={i} style={styles.activityTag}>{act}</Text>
                ))}
              </View>
            )}
            {day.meals && day.meals.length > 0 && (
              <Text style={styles.dayMeta}>🍽 {day.meals.join(' | ')}</Text>
            )}
            {day.accommodation && (
              <Text style={styles.dayMeta}>🏨 {day.accommodation}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Included / Excluded */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>费用包含</Text>
        {route.included.map((item, i) => (
          <Text key={i} style={styles.listItem}>✓ {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>费用不含</Text>
        {route.excluded.map((item, i) => (
          <Text key={i} style={styles.listItemExcluded}>✗ {item}</Text>
        ))}
      </View>

      {/* Tips */}
      {route.tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>出行贴士</Text>
          {route.tips.map((tip, i) => (
            <Text key={i} style={styles.tipItem}>💡 {tip}</Text>
          ))}
        </View>
      )}

      {/* Bottom CTA */}
      <Pressable
        style={({ pressed }) => [styles.bottomCta, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/(tabs)/chat')}
      >
        <Text style={styles.bottomCtaText}>🤖 让AI规划师为你定制行程</Text>
      </Pressable>

      <View style={{ height: spacing.xxl }} />
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
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
  },
  backButtonText: {
    color: colors.backgroundDark,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    color: colors.gold,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  titleEn: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metaItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  priceCard: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.gold,
    marginTop: spacing.xs,
  },
  priceUnit: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.textMuted,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  consultButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  bookCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  highlightChip: {
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.15)',
  },
  highlightText: {
    color: colors.gold,
    fontSize: fontSize.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  dayCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    color: colors.backgroundDark,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  dayTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  activityTag: {
    fontSize: fontSize.xs,
    color: '#93C5FD',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  dayMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listItem: {
    fontSize: fontSize.md,
    color: '#4ADE80',
    marginBottom: spacing.xs,
  },
  listItemExcluded: {
    fontSize: fontSize.md,
    color: '#F87171',
    marginBottom: spacing.xs,
  },
  tipsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0, 102, 255, 0.03)',
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  tipItem: {
    fontSize: fontSize.md,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  bottomCta: {
    backgroundColor: colors.gold,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  bottomCtaText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
