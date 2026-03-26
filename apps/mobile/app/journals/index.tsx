import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, Journal } from '../../src/lib/api';

const MOOD_COLORS: Record<string, string> = {
  '平静': '#6366F1',
  '感动': '#EC4899',
  '感悟': '#F59E0B',
  '宁静': '#22C55E',
  '震撼': '#EF4444',
};

export default function JournalsScreen() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      api.getJournals({ limit: '50' })
        .then((res) => {
          if (!cancelled) {
            setJournals(Array.isArray(res.data) ? res.data : []);
            setTotal(res.total ?? 0);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>加载日志中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>加载失败</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (journals.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyEmoji}>📖</Text>
        <Text style={styles.emptyTitle}>还没有朝圣日志</Text>
        <Text style={styles.emptySubtitle}>去创建第一篇吧</Text>
        <Pressable
          style={({ pressed }) => [styles.fab, styles.fabInline, pressed && styles.fabPressed]}
        >
          <Ionicons name="create" size={24} color={colors.backgroundDark} />
          <Text style={styles.fabText}>写日记</Text>
        </Pressable>
      </View>
    );
  }

  const totalWords = journals.reduce((sum, j) => sum + (j.content?.length ?? 0), 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>📖</Text>
            <Text style={styles.headerTitle}>朝圣日记</Text>
            <Text style={styles.headerSubtitle}>
              记录每一段修行与朝圣的感悟
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>篇日记</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {totalWords.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>总字数</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const moodColor = (item.mood && MOOD_COLORS[item.mood]) || colors.gold;
          const excerpt = item.content?.slice(0, 120) ?? '';
          const dateStr = item.createdAt ? item.createdAt.slice(0, 10) : '';
          return (
            <Animated.View entering={FadeInDown.duration(300).delay(index * 80)}>
              <Pressable
                style={({ pressed }) => [
                  styles.journalCard,
                  pressed && styles.journalCardPressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>📝</Text>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardDate}>{dateStr}</Text>
                      {item.trip && (
                        <>
                          <Text style={styles.cardMetaDot}>·</Text>
                          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                          <Text style={styles.cardSite}>{item.trip.title}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  {item.mood && (
                    <View style={[styles.moodTag, { backgroundColor: `${moodColor}20` }]}>
                      <Text style={[styles.moodText, { color: moodColor }]}>{item.mood}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardExcerpt} numberOfLines={3}>
                  {excerpt}{excerpt.length >= 120 ? '...' : ''}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardWordCount}>{item.content?.length ?? 0} 字</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {/* Floating write button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="create" size={24} color={colors.backgroundDark} />
        <Text style={styles.fabText}>写日记</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  errorDetail: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  fabInline: {
    position: 'relative',
    bottom: undefined,
    right: undefined,
  },
  list: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  journalCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  journalCardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  cardMetaDot: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  cardSite: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  moodTag: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  moodText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  cardExcerpt: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cardWordCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
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
  fabText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
