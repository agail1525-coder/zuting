import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { api, Route, PaginatedRoutes } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: 'ZEN', label: '禅宗' },
  { value: 'BUDDHIST', label: '佛教文化' },
  { value: 'TAOIST', label: '道教文化' },
  { value: 'CHRISTIAN', label: '基督' },
  { value: 'ISLAMIC', label: '伊斯兰' },
  { value: 'CROSS_CULTURAL', label: '跨文化' },
  { value: 'HINDU', label: '印度文化' },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '轻松',
  MODERATE: '适中',
  CHALLENGING: '挑战',
};

export default function RoutesListScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (cat?: string) => {
    try {
      const c = cat ?? category;
      const data = await api.getRoutes({
        category: c || undefined,
        pageSize: '20',
      });
      setRoutes(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setLoading(true);
    fetchData(cat);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '文化路线', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {/* Category Filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.filterChip,
              category === item.value && styles.filterChipActive,
            ]}
            onPress={() => handleCategoryChange(item.value)}
          >
            <Text style={[
              styles.filterChipText,
              category === item.value && styles.filterChipTextActive,
            ]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {loading ? (
        <LoadingView />
      ) : routes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无路线</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          renderItem={({ item }) => {
            const price = (item.priceFrom / 100).toLocaleString();
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/routes/${item.slug}` as never)}
              >
                <View style={styles.cardImage}>
                  <Text style={styles.cardEmoji}>
                    {item.category === 'ZEN' ? '🏯' : item.category === 'BUDDHIST' ? '☸' : item.category === 'TAOIST' ? '☯' : item.category === 'CHRISTIAN' ? '⛪' : item.category === 'ISLAMIC' ? '🕌' : '🌏'}
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTags}>
                    <Text style={styles.cardTag}>{item.duration}天{item.nights}晚</Text>
                    <Text style={styles.cardTag}>{DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>¥{price}<Text style={styles.cardPriceUnit}>/人</Text></Text>
                    {item.rating && (
                      <Text style={styles.cardRating}>★ {item.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={
            <Text style={styles.totalText}>共 {total} 条路线</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  filterChipTextActive: {
    color: colors.backgroundDark,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardImage: {
    width: 100,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    opacity: 0.5,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardTags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardTag: {
    fontSize: fontSize.xs,
    color: colors.gold,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cardPrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#EF4444',
  },
  cardPriceUnit: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.textMuted,
  },
  cardRating: {
    fontSize: fontSize.sm,
    color: colors.gold,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  totalText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.sm,
    paddingVertical: spacing.lg,
  },
});
