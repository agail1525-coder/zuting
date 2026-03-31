import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { Merchant, fetchMerchants } from '../src/lib/api';

const TYPES = [
  { key: '', label: '全部' },
  { key: 'TEMPLE', label: '寺庙' },
  { key: 'GUIDE', label: '导游' },
  { key: 'HOTEL', label: '住宿' },
  { key: 'TRANSPORT', label: '交通' },
];

const TYPE_LABELS: Record<string, string> = {
  TEMPLE: '寺庙',
  GUIDE: '导游',
  HOTEL: '住宿',
  TRANSPORT: '交通',
};

export default function MerchantsScreen() {
  const router = useRouter();
  const [activeType, setActiveType] = useState('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async (type: string, p: number) => {
    try {
      setLoading(true);
      const res = await fetchMerchants(type || undefined, p);
      if (p === 1) {
        setMerchants(res.items);
      } else {
        setMerchants(prev => [...prev, ...res.items]);
      }
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load merchants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(activeType, 1);
  }, [activeType, load]);

  const handleLoadMore = () => {
    if (!loading && merchants.length < total) {
      const next = page + 1;
      setPage(next);
      load(activeType, next);
    }
  };

  // Client-side search filtering
  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return merchants;
    const q = searchQuery.toLowerCase().trim();
    return merchants.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.address && m.address.toLowerCase().includes(q)) ||
      (TYPE_LABELS[m.type] ?? m.type).toLowerCase().includes(q)
    );
  }, [merchants, searchQuery]);

  // Stats computed from data
  const stats = useMemo(() => {
    const avgRating = merchants.length > 0
      ? merchants.reduce((sum, m) => sum + m.rating, 0) / merchants.length
      : 0;
    const typeCounts: Record<string, number> = {};
    merchants.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });
    return {
      total: total,
      avgRating,
      typeCounts,
      displayTotal: merchants.length,
    };
  }, [merchants, total]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { '': merchants.length };
    merchants.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return counts;
  }, [merchants]);

  const isSearchEmpty = searchQuery.trim().length > 0 && filteredMerchants.length === 0;

  const renderItem = ({ item, index }: { item: Merchant; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/merchants/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="storefront" size={28} color={colors.gold} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{TYPE_LABELS[item.type] ?? item.type}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
        {item.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索商家名称、地址..."
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
          <Ionicons name="storefront" size={16} color={colors.gold} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>商家</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.avgRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>均分</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="business" size={16} color="#6366F1" />
          <Text style={styles.statValue}>{Object.keys(stats.typeCounts).length}</Text>
          <Text style={styles.statLabel}>类型</Text>
        </View>
      </View>

      {/* Type filter chips with counts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {TYPES.map(t => (
          <Pressable
            key={t.key}
            style={[styles.chip, activeType === t.key && styles.chipActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[styles.chipText, activeType === t.key && styles.chipTextActive]}>
              {t.label}
              {tabCounts[t.key] !== undefined ? ` (${tabCounts[t.key]})` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMerchants}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={searchQuery ? undefined : handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.gold} />
            </View>
          ) : isSearchEmpty ? (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>未找到相关商家</Text>
              <Text style={styles.emptySubtext}>
                没有匹配"{searchQuery}"的商家，请尝试其他关键词
              </Text>
              <Pressable style={styles.clearBtn} onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle-outline" size={16} color={colors.gold} />
                <Text style={styles.clearBtnText}>清除搜索</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>暂无商家</Text>
              <Text style={styles.emptySubtext}>当前分类下还没有商家入驻</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && merchants.length > 0 ? (
            <ActivityIndicator style={{ padding: spacing.md }} color={colors.gold} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  chipRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    color: colors.gold,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingLeft: 48 + spacing.md,
  },
  addressText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  clearBtn: {
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
  clearBtnText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
