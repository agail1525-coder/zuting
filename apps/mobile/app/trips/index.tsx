import React, { useState } from 'react';
import {
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

type TripStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface Trip {
  id: string;
  title: string;
  description: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  sitesCount: number;
  coverEmoji: string;
}

const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  planning: { label: '计划中', color: '#6366F1', icon: 'create' },
  confirmed: { label: '已确认', color: '#22C55E', icon: 'checkmark-circle' },
  in_progress: { label: '进行中', color: '#F59E0B', icon: 'walk' },
  completed: { label: '已完成', color: '#D4A855', icon: 'trophy' },
  cancelled: { label: '已取消', color: '#64748B', icon: 'close-circle' },
};

const FILTER_OPTIONS: { key: TripStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'planning', label: '计划中' },
  { key: 'confirmed', label: '已确认' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    title: '东亚佛教朝圣之旅',
    description: '从洛阳白马寺出发，途经少林寺，最终到达日本奈良东大寺',
    status: 'in_progress',
    startDate: '2026-04-01',
    endDate: '2026-04-14',
    sitesCount: 5,
    coverEmoji: '☸️',
  },
  {
    id: '2',
    title: '中东三教圣地巡礼',
    description: '探访耶路撒冷、伯利恒和伊斯坦布尔的宗教圣地',
    status: 'planning',
    startDate: '2026-06-15',
    endDate: '2026-06-25',
    sitesCount: 4,
    coverEmoji: '🕌',
  },
  {
    id: '3',
    title: '印度灵性觉醒之旅',
    description: '菩提伽耶禅修、瓦拉纳西恒河朝圣、阿姆利则金庙参访',
    status: 'completed',
    startDate: '2026-01-10',
    endDate: '2026-01-22',
    sitesCount: 6,
    coverEmoji: '🕉️',
  },
];

export default function TripsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');

  const filteredTrips =
    filter === 'all'
      ? MOCK_TRIPS
      : MOCK_TRIPS.filter((t) => t.status === filter);

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

      {/* Trip list */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const statusCfg = STATUS_CONFIG[item.status];
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
                  <Text style={styles.tripEmoji}>{item.coverEmoji}</Text>
                  <View style={styles.tripHeaderText}>
                    <Text style={styles.tripTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}20` }]}>
                      <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.tripDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.tripFooter}>
                  <View style={styles.tripMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.tripMetaText}>
                      {item.startDate} ~ {item.endDate}
                    </Text>
                  </View>
                  <View style={styles.tripMeta}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.tripMetaText}>{item.sitesCount} 个圣地</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyText}>暂无行程</Text>
            <Text style={styles.emptySubtext}>点击右下角按钮开始规划您的朝圣之旅</Text>
          </View>
        }
      />

      {/* Floating add button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          // Future: navigate to create trip screen
        }}
      >
        <Ionicons name="add" size={28} color={colors.backgroundDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
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
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  tripEmoji: {
    fontSize: 36,
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
    borderTopColor: colors.borderLight,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
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
