import React, { useCallback, useState, useMemo } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, Journal } from '../../src/lib/api';

const MOOD_COLORS: Record<string, string> = {
  '平静': '#6366F1',
  '感动': '#EC4899',
  '感悟': '#F59E0B',
  '宁静': '#22C55E',
  '震撼': '#EF4444',
};

const MOOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  '平静': 'water',
  '感动': 'heart',
  '感悟': 'bulb',
  '宁静': 'leaf',
  '震撼': 'flash',
};

const MOOD_OPTIONS = ['全部', '平静', '感动', '感悟', '宁静', '震撼'];

export default function JournalsScreen() {
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMood, setActiveMood] = useState('全部');

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

  // Client-side filtering: search + mood
  const filteredJournals = useMemo(() => {
    let result = journals;
    if (activeMood !== '全部') {
      result = result.filter(j => j.mood === activeMood);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        (j.content && j.content.toLowerCase().includes(q))
      );
    }
    return result;
  }, [journals, searchQuery, activeMood]);

  // Stats
  const stats = useMemo(() => {
    const totalWords = journals.reduce((sum, j) => sum + (j.content?.length ?? 0), 0);
    const moodCounts: Record<string, number> = {};
    journals.forEach(j => {
      if (j.mood) {
        moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
      }
    });
    const uniqueMoods = Object.keys(moodCounts).length;
    return { total, totalWords, moodCounts, uniqueMoods };
  }, [journals, total]);

  // Mood tab counts
  const moodTabCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': journals.length };
    journals.forEach(j => {
      if (j.mood) {
        counts[j.mood] = (counts[j.mood] || 0) + 1;
      }
    });
    return counts;
  }, [journals]);

  const isSearchEmpty = (searchQuery.trim().length > 0 || activeMood !== '全部') && filteredJournals.length === 0;

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
        <Text style={styles.emptySubtitle}>记录你的修行感悟和朝圣之旅</Text>
        <Pressable
          style={({ pressed }) => [styles.fab, styles.fabInline, pressed && styles.fabPressed]}
          onPress={() => router.push('/journals/create' as any)}
        >
          <Ionicons name="create" size={24} color={colors.backgroundDark} />
          <Text style={styles.fabText}>写日记</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredJournals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>📖</Text>
              <Text style={styles.headerTitle}>朝圣日记</Text>
              <Text style={styles.headerSubtitle}>
                记录每一段修行与朝圣的感悟
              </Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索日志标题、内容..."
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
                <Ionicons name="book" size={16} color={colors.gold} />
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>篇日记</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="text" size={16} color="#6366F1" />
                <Text style={styles.statValue}>{stats.totalWords.toLocaleString()}</Text>
                <Text style={styles.statLabel}>总字数</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="happy" size={16} color="#EC4899" />
                <Text style={styles.statValue}>{stats.uniqueMoods}</Text>
                <Text style={styles.statLabel}>种心情</Text>
              </View>
            </View>

            {/* Mood filter chips with counts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodChipRow}
            >
              {MOOD_OPTIONS.map(mood => {
                const isActive = activeMood === mood;
                const moodColor = mood === '全部' ? colors.gold : (MOOD_COLORS[mood] ?? colors.gold);
                const count = moodTabCounts[mood] ?? 0;
                return (
                  <Pressable
                    key={mood}
                    style={[
                      styles.moodChip,
                      isActive && { backgroundColor: `${moodColor}20`, borderColor: moodColor },
                    ]}
                    onPress={() => setActiveMood(mood)}
                  >
                    {mood !== '全部' && MOOD_ICONS[mood] && (
                      <Ionicons
                        name={MOOD_ICONS[mood]}
                        size={14}
                        color={isActive ? moodColor : colors.textMuted}
                      />
                    )}
                    <Text style={[
                      styles.moodChipText,
                      isActive && { color: moodColor, fontWeight: '700' },
                    ]}>
                      {mood} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
                onPress={() => router.push(`/journals/${item.id}` as any)}
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
        ListEmptyComponent={
          isSearchEmpty ? (
            <View style={styles.searchEmptyWrap}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.searchEmptyTitle}>未找到相关日志</Text>
              <Text style={styles.searchEmptySubtext}>
                {searchQuery.trim()
                  ? `没有匹配"${searchQuery}"的日志`
                  : `没有"${activeMood}"心情的日志`}
              </Text>
              <Pressable
                style={styles.clearFilterBtn}
                onPress={() => { setSearchQuery(''); setActiveMood('全部'); }}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.gold} />
                <Text style={styles.clearFilterText}>清除筛选</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          filteredJournals.length > 0 ? (
            <View style={styles.bottomCta}>
              <View style={styles.bottomCtaContent}>
                <Ionicons name="sparkles" size={20} color={colors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bottomCtaTitle}>记录更多感悟</Text>
                  <Text style={styles.bottomCtaSubtext}>每篇日志都是修行路上的珍贵印记</Text>
                </View>
              </View>
              <Pressable
                style={styles.bottomCtaBtn}
                onPress={() => router.push('/journals/create' as any)}
              >
                <Ionicons name="create" size={16} color="#FFFFFF" />
                <Text style={styles.bottomCtaBtnText}>写日记</Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      {/* Floating write button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/journals/create' as any)}
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
    textAlign: 'center',
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
  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
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
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  // Mood filter chips
  moodChipRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moodChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  // Search empty state
  searchEmptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  searchEmptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  searchEmptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  clearFilterBtn: {
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
  clearFilterText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Journal cards
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
  // Bottom CTA
  bottomCta: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bottomCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  bottomCtaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
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
