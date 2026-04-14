import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, type Trip, type TripStatus, type CultivationMineResponse } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { useTranslation } from '../../src/lib/i18n';

const STATUS_ICON_COLOR: Record<TripStatus, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  DRAFT: { color: '#6B7280', icon: 'document-text' },
  PLANNING: { color: '#6366F1', icon: 'create' },
  SUBMITTED: { color: '#8B5CF6', icon: 'send' },
  CONFIRMED: { color: '#22C55E', icon: 'checkmark-circle' },
  PAID: { color: '#10B981', icon: 'card' },
  PREPARING: { color: '#F97316', icon: 'construct' },
  IN_PROGRESS: { color: '#F59E0B', icon: 'walk' },
  COMPLETED: { color: '#3264ff', icon: 'trophy' },
  REVIEWING: { color: '#EC4899', icon: 'star' },
  CANCELLED: { color: '#9CA3AF', icon: 'close-circle' },
  REFUNDING: { color: '#EF4444', icon: 'time' },
  REFUNDED: { color: '#9CA3AF', icon: 'return-down-back' },
};

const STATUS_LABEL_KEYS: Record<TripStatus, string> = {
  DRAFT: 'trips.status.draft',
  PLANNING: 'trips.status.planning',
  SUBMITTED: 'trips.status.submitted',
  CONFIRMED: 'trips.status.confirmed',
  PAID: 'trips.status.paid',
  PREPARING: 'trips.status.preparing',
  IN_PROGRESS: 'trips.status.inProgress',
  COMPLETED: 'trips.status.completed',
  REVIEWING: 'trips.status.reviewing',
  CANCELLED: 'trips.status.cancelled',
  REFUNDING: 'trips.status.refunding',
  REFUNDED: 'trips.status.refunded',
};

const FILTER_KEYS: (TripStatus | 'all')[] = ['all', 'DRAFT', 'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const ACTIVE_STATUSES: TripStatus[] = ['PLANNING', 'SUBMITTED', 'CONFIRMED', 'PAID', 'PREPARING', 'IN_PROGRESS'];

export default function TripsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cultivation, setCultivation] = useState<CultivationMineResponse | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getCultivationMine()
      .then(setCultivation)
      .catch(() =>
        setCultivation({ hasAccess: false, role: 'NONE', expiresAt: null, application: null }),
      );
  }, [user]);

  const fetchTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        userId: user.id,
        limit: '50',
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      const result = await api.getTrips(params);
      setTrips(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trips.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTrips();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchTrips]);

  // Client-side search filtering
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const q = searchQuery.toLowerCase().trim();
    return trips.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q))
    );
  }, [trips, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const activeCount = trips.filter(t => ACTIVE_STATUSES.includes(t.status)).length;
    const completedCount = trips.filter(t => t.status === 'COMPLETED').length;
    const totalSites = trips.reduce((sum, t) => sum + (t.sites?.length ?? 0), 0);
    return {
      total: trips.length,
      active: activeCount,
      completed: completedCount,
      totalSites,
    };
  }, [trips]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: trips.length };
    trips.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [trips]);

  const isSearchEmpty = searchQuery.trim().length > 0 && filteredTrips.length === 0;

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>{t('trips.loginRequired')}</Text>
        <Text style={styles.emptySubtext}>{t('trips.loginHint')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('trips.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="compass" size={16} color={colors.gold} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>{t('trips.stat.total')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="walk" size={16} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>{t('trips.stat.active')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color="#22C55E" />
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>{t('trips.stat.completed')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="location" size={16} color="#6366F1" />
          <Text style={styles.statValue}>{stats.totalSites}</Text>
          <Text style={styles.statLabel}>{t('trips.stat.sites')}</Text>
        </View>
      </View>

      {/* Filter chips with counts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_KEYS.map((key) => (
          <Pressable
            key={key}
            style={[
              styles.filterChip,
              filter === key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === key && styles.filterTextActive,
              ]}
            >
              {key === 'all' ? t('trips.filter.all') : t(STATUS_LABEL_KEYS[key])}
              {tabCounts[key] !== undefined ? ` (${tabCounts[key]})` : ' (0)'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 修行圈 Gateway Card */}
      {cultivation && (
        <Pressable
          style={styles.cultivationCard}
          onPress={() =>
            router.push(
              cultivation.hasAccess
                ? ('/trips/cultivation' as any)
                : ('/trips/cultivation/apply' as any),
            )
          }
        >
          <Text style={styles.cultivationIcon}>☸</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.cultivationTitle}>圆满之路</Text>
              {cultivation.hasAccess && (
                <View style={styles.cultivationBadge}>
                  <Text style={styles.cultivationBadgeText}>{cultivation.role}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cultivationDesc} numberOfLines={1}>
              {cultivation.hasAccess
                ? '禅宗主线·12文化融通·七境界修行'
                : cultivation.application?.status === 'PENDING'
                ? '申请审核中...'
                : '申请加入修行圈'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D4A855" />
        </Pressable>
      )}

      {/* Loading state */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={[styles.emptySubtext, { marginTop: spacing.md }]}>{t('trips.loading')}</Text>
        </View>
      ) : error ? (
        /* Error state */
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t('trips.loadFailed')}</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchTrips}>
            <Ionicons name="refresh" size={16} color={colors.gold} />
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        /* Trip list */
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const statusCfg = STATUS_ICON_COLOR[item.status] ?? STATUS_ICON_COLOR.DRAFT;
            const sitesCount = item.sites?.length ?? 0;
            return (
              <Animated.View entering={FadeInDown.duration(300).delay(index * 100)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.tripCard,
                    pressed && styles.tripCardPressed,
                  ]}
                  onPress={() => router.push(`/trips/${item.id}` as any)}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripHeaderText}>
                      <Text style={styles.tripTitle}>{item.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}15` }]}>
                        <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>
                          {t(STATUS_LABEL_KEYS[item.status] ?? 'trips.status.draft')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.note ? (
                    <Text style={styles.tripDescription} numberOfLines={2}>
                      {item.note}
                    </Text>
                  ) : null}

                  <View style={styles.tripFooter}>
                    {item.startDate ? (
                      <View style={styles.tripMeta}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.tripMetaText}>
                          {item.startDate.slice(0, 10)}
                          {item.endDate ? ` ~ ${item.endDate.slice(0, 10)}` : ''}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.tripMeta}>
                      <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.tripMetaText}>{sitesCount} {t('trips.sites')}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.tripMetaText}>{item.persons ?? 0} {t('trips.persons')}</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            isSearchEmpty ? (
              <View style={styles.centerContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>{t('trips.searchEmpty')}</Text>
                <Text style={styles.emptySubtext}>
                  {t('trips.searchEmptyHint')}
                </Text>
                <Pressable style={styles.retryButton} onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle-outline" size={16} color={colors.gold} />
                  <Text style={styles.retryText}>{t('trips.clearSearch')}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyText}>{t('trips.noTrips')}</Text>
                <Text style={styles.emptySubtext}>{t('trips.noTripsHint')}</Text>
                <Pressable
                  style={styles.inlineCreateBtn}
                  onPress={() => router.push('/trips/create' as any)}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.inlineCreateBtnText}>{t('trips.createTrip')}</Text>
                </Pressable>
              </View>
            )
          }
          ListFooterComponent={
            !loading && filteredTrips.length > 0 ? (
              <View style={styles.bottomCta}>
                <Ionicons name="compass" size={20} color={colors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bottomCtaTitle}>{t('trips.discoverRoutes')}</Text>
                  <Text style={styles.bottomCtaSubtext}>{t('trips.discoverRoutesHint')}</Text>
                </View>
                <Pressable
                  style={styles.bottomCtaBtn}
                  onPress={() => router.push('/routes' as any)}
                >
                  <Text style={styles.bottomCtaBtnText}>{t('trips.browseRoutes')}</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      {/* Floating add button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/trips/create' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  filterBar: {
    maxHeight: 56,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderColor: colors.gold,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.gold,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  tripCardPressed: {
    opacity: 0.85,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  tripHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  tripTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  tripDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tripFooter: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripMetaText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  inlineCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  inlineCreateBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  retryText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Bottom CTA
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bottomCtaTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomCtaSubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  bottomCtaBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  bottomCtaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: colors.goldDark,
    transform: [{ scale: 0.95 }],
  },
  cultivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#1a1410',
    borderWidth: 1,
    borderColor: 'rgba(212,168,85,0.3)',
  },
  cultivationIcon: { fontSize: 28 },
  cultivationTitle: { color: '#D4A855', fontWeight: '700', fontSize: fontSize.md },
  cultivationDesc: { color: 'rgba(212,168,85,0.6)', fontSize: fontSize.xs, marginTop: 2 },
  cultivationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(212,168,85,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,85,0.3)',
  },
  cultivationBadgeText: { color: '#D4A855', fontSize: 10, fontWeight: '600' },
});
