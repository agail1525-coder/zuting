import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, type Trip, type TripStatus } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';

const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  DRAFT: { label: '草稿', color: '#6B7280', icon: 'document-text' },
  PLANNING: { label: '计划中', color: '#6366F1', icon: 'create' },
  SUBMITTED: { label: '已提交', color: '#8B5CF6', icon: 'send' },
  CONFIRMED: { label: '已确认', color: '#22C55E', icon: 'checkmark-circle' },
  PAID: { label: '已付款', color: '#10B981', icon: 'card' },
  PREPARING: { label: '准备中', color: '#F97316', icon: 'construct' },
  IN_PROGRESS: { label: '进行中', color: '#F59E0B', icon: 'walk' },
  COMPLETED: { label: '已完成', color: '#0066FF', icon: 'trophy' },
  REVIEWING: { label: '评价中', color: '#EC4899', icon: 'star' },
  CANCELLED: { label: '已取消', color: '#9CA3AF', icon: 'close-circle' },
  REFUNDING: { label: '退款中', color: '#EF4444', icon: 'time' },
  REFUNDED: { label: '已退款', color: '#9CA3AF', icon: 'return-down-back' },
};

const FILTER_OPTIONS: { key: TripStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'DRAFT', label: '草稿' },
  { key: 'PLANNING', label: '计划中' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'IN_PROGRESS', label: '进行中' },
  { key: 'COMPLETED', label: '已完成' },
];

export default function TripsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : '加载行程失败');
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
        <Text style={styles.emptyText}>请先登录</Text>
        <Text style={styles.emptySubtext}>登录后即可查看和管理您的朝圣行程</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.filterChip,
              filter === option.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(option.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === option.key && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Loading state */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={[styles.emptySubtext, { marginTop: spacing.md }]}>加载行程中...</Text>
        </View>
      ) : error ? (
        /* Error state */
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>加载失败</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchTrips}>
            <Ionicons name="refresh" size={16} color={colors.gold} />
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </View>
      ) : (
        /* Trip list */
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.DRAFT;
            const sitesCount = item.sites.length;
            return (
              <Animated.View entering={FadeInDown.duration(300).delay(index * 100)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.tripCard,
                    pressed && styles.tripCardPressed,
                  ]}
                  onPress={() => router.push(`/trips/${item.id}`)}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripHeaderText}>
                      <Text style={styles.tripTitle}>{item.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}15` }]}>
                        <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>
                          {statusCfg.label}
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
                      <Text style={styles.tripMetaText}>{sitesCount} 个圣地</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.tripMetaText}>{item.persons} 人</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyEmoji}>🗺️</Text>
              <Text style={styles.emptyText}>还没有行程</Text>
              <Text style={styles.emptySubtext}>开始规划你的朝圣之旅</Text>
            </View>
          }
        />
      )}

      {/* Floating add button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/trips/create')}
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
  filterBar: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
});
