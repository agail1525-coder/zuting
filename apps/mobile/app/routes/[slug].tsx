import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { api, Route, ItineraryDay } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { useTranslation } from '../../src/lib/i18n';
import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Category / Difficulty i18n key maps
// ---------------------------------------------------------------------------

const CATEGORY_KEYS: Record<string, string> = {
  ZEN: 'route.category.zen',
  BUDDHIST: 'route.category.buddhist',
  TAOIST: 'route.category.taoist',
  CHRISTIAN: 'route.category.christian',
  ISLAMIC: 'route.category.islamic',
  CROSS_CULTURAL: 'route.category.crossCultural',
  HINDU: 'route.category.hindu',
  JEWISH: 'route.category.jewish',
  CULTURAL_HERITAGE: 'route.category.culturalHeritage',
};

const DIFFICULTY_KEYS: Record<string, string> = {
  EASY: 'route.difficulty.easy',
  MODERATE: 'route.difficulty.moderate',
  CHALLENGING: 'route.difficulty.challenging',
};

// ---------------------------------------------------------------------------
// Cancellation policy color config
// ---------------------------------------------------------------------------

const CANCELLATION_ITEMS = [
  { key: 'route.cancellationFullRefund14', color: '#16A34A', bg: '#F0FDF4' },
  { key: 'route.cancellationRefund80', color: '#D97706', bg: '#FFFBEB' },
  { key: 'route.cancellationRefund50', color: '#D97706', bg: '#FFFBEB' },
  { key: 'route.cancellationNoRefund3', color: '#DC2626', bg: '#FEF2F2' },
];

// ---------------------------------------------------------------------------
// "Know Before You Go" helpers
// ---------------------------------------------------------------------------

function getEtiquetteKey(category: string): string {
  const map: Record<string, string> = {
    ZEN: 'route.kbygEtiquetteZen',
    BUDDHIST: 'route.kbygEtiquetteBuddhist',
    TAOIST: 'route.kbygEtiquetteTaoist',
    CHRISTIAN: 'route.kbygEtiquetteChristian',
    ISLAMIC: 'route.kbygEtiquetteIslamic',
  };
  return map[category] ?? 'route.kbygEtiquetteDefault';
}

function getFitnessKey(difficulty: string): string {
  const map: Record<string, string> = {
    EASY: 'route.kbygFitnessEasy',
    MODERATE: 'route.kbygFitnessModerate',
    CHALLENGING: 'route.kbygFitnessChallenging',
  };
  return map[difficulty] ?? 'route.kbygFitnessEasy';
}

// ---------------------------------------------------------------------------
// "Who Is This Route For" config
// ---------------------------------------------------------------------------

const WHO_FOR_ITEMS = [
  { icon: '🙏', key: 'route.forBeginners', descKey: 'route.forBeginnersDesc' },
  { icon: '🕯️', key: 'route.forDevotees', descKey: 'route.forDevoteesDesc' },
  { icon: '🏛️', key: 'route.forCulture', descKey: 'route.forCultureDesc' },
  { icon: '📸', key: 'route.forPhotography', descKey: 'route.forPhotographyDesc' },
  { icon: '👨‍👩‍👧', key: 'route.forFamily', descKey: 'route.forFamilyDesc' },
  { icon: '🧘', key: 'route.forSolo', descKey: 'route.forSoloDesc' },
];

export default function RouteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    if (!slug) return;
    api.getRouteBySlug(slug)
      .then(setRoute)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (loading) return <LoadingView />;
  if (error || !route) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: t('route.detail') }} />
        <Text style={styles.errorText}>{t('route.loadError')}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const price = ((route.priceFrom ?? 0) / 100).toLocaleString(locale);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: route.title, headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {/* Hero with Cover Image */}
      <View style={styles.hero}>
        {route.coverImage ? (
          <Image source={{ uri: route.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#3264ff', '#003D99']} style={StyleSheet.absoluteFillObject} />
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroOverlay}>
          <View style={styles.badges}>
            <Text style={styles.categoryBadge}>
              {t(CATEGORY_KEYS[route.category] ?? 'route.category.default')}
            </Text>
            <Text style={styles.difficultyBadge}>
              {t(DIFFICULTY_KEYS[route.difficulty] ?? 'route.difficulty.default')}
            </Text>
          </View>
          <Text style={styles.title}>{route.title}</Text>
          <Text style={styles.subtitle}>{route.subtitle}</Text>
          <Text style={styles.titleEn}>{route.titleEn}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>📅 {route.duration}{t('route.days')}{route.nights}{t('route.nights')}</Text>
            <Text style={styles.metaItem}>🌤 {route.season}</Text>
            <Text style={styles.metaItem}>👥 {route.groupSize}</Text>
            {(route.rating ?? 0) > 0 && (
              <Text style={styles.metaItem}>★ {(route.rating ?? 0).toFixed(1)} ({route.reviewCount ?? 0}{t('route.reviews')})</Text>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Price Card */}
      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>{t('route.startingPrice')}</Text>
        <Text style={styles.priceValue}>¥{price}<Text style={styles.priceUnit}>{t('route.perPerson')}</Text></Text>
        <Pressable
          style={({ pressed }) => [styles.consultButton, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color={colors.backgroundDark} />
          <Text style={styles.consultButtonText}>{t('route.aiPlannerConsult')}</Text>
        </Pressable>
        <Text style={styles.bookCount}>{t('route.bookedCount').replace('{{count}}', String(route.bookCount ?? 0))}</Text>
      </View>

      {/* Highlights */}
      <View style={styles.highlightsRow}>
        {(Array.isArray(route.highlights) ? route.highlights : []).map((h) => (
          <View key={h} style={styles.highlightChip}>
            <Text style={styles.highlightText}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.description')}</Text>
        <Text style={styles.descriptionText}>{route.description}</Text>
      </View>

      {/* Who Is This Route For */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.whoIsThisFor')}</Text>
        <View style={styles.whoForGrid}>
          {WHO_FOR_ITEMS.map((item) => (
            <View key={item.key} style={styles.whoForCard}>
              <Text style={styles.whoForIcon}>{item.icon}</Text>
              <Text style={styles.whoForLabel}>{t(item.key)}</Text>
              <Text style={styles.whoForDesc}>{t(item.descKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Know Before You Go */}
      <View style={styles.kbygSection}>
        <Text style={styles.sectionTitle}>{t('route.knowBeforeYouGo')}</Text>

        {/* Etiquette */}
        <View style={styles.kbygCard}>
          <Text style={styles.kbygCardTitle}>🙏 {t('route.kbygEtiquette')}</Text>
          <Text style={styles.kbygCardText}>{t(getEtiquetteKey(route.category))}</Text>
        </View>

        {/* Fitness */}
        <View style={styles.kbygCard}>
          <Text style={styles.kbygCardTitle}>🏃 {t('route.kbygFitness')}</Text>
          <Text style={styles.kbygCardText}>{t(getFitnessKey(route.difficulty))}</Text>
        </View>

        {/* Packing */}
        <View style={styles.kbygCard}>
          <Text style={styles.kbygCardTitle}>🎒 {t('route.kbygPacking')}</Text>
          <Text style={styles.kbygCardText}>{t('route.kbygPackingItems')}</Text>
        </View>

        {/* Temple stay */}
        <View style={styles.kbygCard}>
          <Text style={styles.kbygCardTitle}>🏯 {t('route.kbygTemple')}</Text>
          <Text style={styles.kbygCardText}>{t('route.kbygTempleDesc')}</Text>
        </View>
      </View>

      {/* Itinerary (collapsible) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.dailyItinerary')}</Text>
        {(Array.isArray(route.itinerary) ? (route.itinerary as ItineraryDay[]) : []).map((day) => {
          const isOpen = expandedDays.has(day.day);
          return (
            <Pressable key={day.day} onPress={() => toggleDay(day.day)}>
              <View style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayCircle}>
                    <Text style={styles.dayNumber}>{day.day}</Text>
                  </View>
                  <Text style={styles.dayTitle}>Day {day.day}: {day.title}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                {isOpen && (
                  <View style={styles.dayContent}>
                    {Array.isArray(day.activities) && day.activities.length > 0 && (
                      <View style={styles.activitiesRow}>
                        {day.activities.map((act, i) => (
                          <Text key={i} style={styles.activityTag}>{act}</Text>
                        ))}
                      </View>
                    )}
                    {Array.isArray(day.meals) && day.meals.length > 0 && (
                      <Text style={styles.dayMeta}>🍽 {day.meals.join(' | ')}</Text>
                    )}
                    {day.accommodation && (
                      <Text style={styles.dayMeta}>🏨 {day.accommodation}</Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Included / Excluded */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.included')}</Text>
        {(Array.isArray(route.included) ? route.included : []).map((item, i) => (
          <Text key={i} style={styles.listItem}>✓ {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.excluded')}</Text>
        {(Array.isArray(route.excluded) ? route.excluded : []).map((item, i) => (
          <Text key={i} style={styles.listItemExcluded}>✗ {item}</Text>
        ))}
      </View>

      {/* Cancellation Policy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('route.cancellationPolicy')}</Text>
        {CANCELLATION_ITEMS.map((ci) => (
          <View key={ci.key} style={[styles.cancellationRow, { backgroundColor: ci.bg }]}>
            <View style={[styles.cancellationDot, { backgroundColor: ci.color }]} />
            <Text style={[styles.cancellationText, { color: ci.color }]}>{t(ci.key)}</Text>
          </View>
        ))}
        <Text style={styles.cancellationNote}>{t('route.cancellationForceNote')}</Text>
      </View>

      {/* Tips */}
      {(Array.isArray(route.tips) ? route.tips : []).length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>{t('route.travelTips')}</Text>
          {(route.tips ?? []).map((tip, i) => (
            <Text key={i} style={styles.tipItem}>💡 {tip}</Text>
          ))}
        </View>
      )}

      {/* Bottom CTA */}
      <View style={styles.ctaRow}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/trips/create' as never)}
        >
          <Ionicons name="calendar" size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>{t('route.bookNow')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ctaBtnOutline, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#3264ff" />
          <Text style={styles.ctaBtnOutlineText}>{t('route.aiPlanner')}</Text>
        </Pressable>
      </View>

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
    height: 280,
    position: 'relative' as const,
  },
  heroOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: 80,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  titleEn: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
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
    color: 'rgba(255,255,255,0.9)',
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
  // --- Who Is This Route For ---
  whoForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  whoForCard: {
    width: '48%' as unknown as number,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  whoForIcon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  whoForLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  whoForDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  // --- Know Before You Go ---
  kbygSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  kbygCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  kbygCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  kbygCardText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // --- Collapsible itinerary ---
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
  dayContent: {
    marginTop: spacing.sm,
    paddingLeft: 36,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  // --- Cancellation Policy ---
  cancellationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  cancellationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cancellationText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  cancellationNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
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
  ctaRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3264ff',
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  ctaBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#3264ff',
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaBtnOutlineText: {
    color: '#3264ff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
