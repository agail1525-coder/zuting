import React, { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { fetchPackages, type PackageItem } from '../src/lib/api';

const PRIMARY = '#0066FF';
const GOLD = '#D4A855';

const TYPE_TABS = [
  { key: '', label: '全部' },
  { key: 'PILGRIMAGE', label: '文化之旅' },
  { key: 'CULTURAL', label: '文化体验' },
  { key: 'MEDITATION', label: '修行静修' },
  { key: 'ADVENTURE', label: '探索探险' },
];

const TRUST_BADGES = [
  { icon: 'shield-checkmark-outline' as const, label: '官方认证' },
  { icon: 'refresh-outline' as const, label: '随时退改' },
  { icon: 'headset-outline' as const, label: '全程服务' },
  { icon: 'lock-closed-outline' as const, label: '安全保障' },
];

export default function PackagesScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const load = useCallback(async (t: string) => {
    try {
      const res = await fetchPackages({ type: t || undefined });
      setPackages(res.items);
      setTotal(res.total);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { void load(type); }, [load, type]);

  const onRefresh = () => { setRefreshing(true); void load(type); };

  const handleTypeChange = (t: string) => {
    setType(t);
    setLoading(true);
  };

  // Stats
  const stats = useMemo(() => {
    if (packages.length === 0) return { total: 0, minPrice: 0, maxPrice: 0 };
    const prices = packages.map(p => p.priceFrom);
    return {
      total: total,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [packages, total]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.trim().toLowerCase();
    return packages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? '').toLowerCase().includes(q)
    );
  }, [packages, search]);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索套餐名称..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Type Filter Tabs */}
      <FlatList
        data={TYPE_TABS}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tab, type === item.key && styles.tabActive]}
            onPress={() => handleTypeChange(item.key)}
          >
            <Text style={[styles.tabText, type === item.key && styles.tabTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
          {search.trim() ? (
            <>
              <Text style={styles.emptyText}>未找到"{search}"相关套餐</Text>
              <Text style={styles.emptySubText}>换个关键词试试</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyText}>暂无套餐</Text>
              <Text style={styles.emptySubText}>请稍后再来</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>全部套餐</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>¥{stats.minPrice.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>最低价起</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>¥{stats.maxPrice.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>最高价格</Text>
                </View>
              </View>

              {/* Trust Badges */}
              <View style={styles.trustRow}>
                {TRUST_BADGES.map((badge, idx) => (
                  <View key={idx} style={styles.trustBadge}>
                    <Ionicons name={badge.icon} size={18} color={PRIMARY} />
                    <Text style={styles.trustLabel}>{badge.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.resultCount}>共 {filtered.length} 个套餐</Text>
            </>
          }
          renderItem={({ item }) => (
            <PackageCard item={item} onPress={() => router.push(`/packages/${item.id}` as never)} />
          )}
        />
      )}
    </View>
  );
}

function PackageCard({ item, onPress }: { item: PackageItem; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="cube" size={40} color={GOLD} />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          {item.religion && (
            <View style={[styles.religionBadge, { backgroundColor: `${item.religion.color ?? PRIMARY}20` }]}>
              <Text style={[styles.religionBadgeText, { color: item.religion.color ?? PRIMARY }]}>
                {item.religion.name}
              </Text>
            </View>
          )}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        )}

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.duration}天{item.nights}晚</Text>
          </View>
          {item.rating !== null && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={GOLD} />
              <Text style={styles.metaText}>{item.rating.toFixed(1)} ({item.reviewCount})</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.bookCount} 人已预订</Text>
          </View>
        </View>

        {item.highlights.length > 0 && (
          <View style={styles.highlightsRow}>
            {item.highlights.slice(0, 3).map((h, idx) => (
              <View key={idx} style={styles.highlightTag}>
                <Text style={styles.highlightTagText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View>
            {item.originalPrice && item.originalPrice > item.priceFrom && (
              <Text style={styles.originalPrice}>¥{item.originalPrice.toLocaleString()}</Text>
            )}
            <Text style={styles.price}>
              <Text style={styles.priceFrom}>¥</Text>
              {item.priceFrom.toLocaleString()}
              <Text style={styles.priceSuffix}> 起/人</Text>
            </Text>
          </View>
          <View style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>查看详情</Text>
            <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  tabsList: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },

  list: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  resultCount: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },

  trustRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustBadge: { flex: 1, alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

  card: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 200, backgroundColor: '#F9FAFB' },
  cardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: spacing.md, gap: spacing.sm },

  cardTopRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  religionBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  religionBadgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F3F4F6',
  },
  typeBadgeText: { fontSize: fontSize.xs, color: colors.textMuted },

  cardTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary },

  cardMeta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.sm, color: colors.textSecondary },

  highlightsRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  highlightTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: `${PRIMARY}10`,
  },
  highlightTagText: { fontSize: fontSize.xs, color: PRIMARY },

  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  originalPrice: { fontSize: fontSize.sm, color: colors.textMuted, textDecorationLine: 'line-through' },
  price: { fontSize: fontSize.xl, fontWeight: '800', color: colors.error },
  priceFrom: { fontSize: fontSize.md },
  priceSuffix: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textMuted },

  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailBtnText: { fontSize: fontSize.md, color: PRIMARY, fontWeight: '600' },

  emptyText: { fontSize: fontSize.lg, color: colors.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: fontSize.sm, color: colors.textMuted },
});
