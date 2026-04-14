import React, { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {
  fetchMyMembership,
  fetchPointsProducts,
  exchangeProduct,
  type PointsProductItem,
  type MembershipData,
} from '../src/lib/api';

const PRIMARY = '#3264ff';
const GOLD = '#D4A855';

const CATEGORIES = ['全部', '优惠券', '实物礼品', '旅行增值', '会员权益'];

export default function PointsMallScreen() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [products, setProducts] = useState<PointsProductItem[]>([]);
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exchanging, setExchanging] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (cat: string) => {
    try {
      const catParam = cat === '全部' ? undefined : cat;
      const [mem, prods] = await Promise.allSettled([
        fetchMyMembership(),
        fetchPointsProducts(catParam),
      ]);
      if (mem.status === 'fulfilled') setMembership(mem.value);
      if (prods.status === 'fulfilled') setProducts(prods.value.items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { void load(category); }, [load, category]);

  const onRefresh = () => { setRefreshing(true); void load(category); };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setLoading(true);
  };

  const handleExchange = (product: PointsProductItem) => {
    const myPoints = membership?.points ?? 0;
    if (myPoints < product.pointsCost) {
      Alert.alert('积分不足', `兑换此商品需要 ${product.pointsCost} 积分，您当前有 ${myPoints} 积分`);
      return;
    }
    Alert.alert(
      '确认兑换',
      `确认使用 ${product.pointsCost} 积分兑换「${product.name}」？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认兑换',
          onPress: async () => {
            setExchanging(product.id);
            try {
              await exchangeProduct(product.id);
              Alert.alert('兑换成功', `「${product.name}」已成功兑换！`);
              void load(category);
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : '兑换失败，请稍后重试';
              Alert.alert('兑换失败', msg);
            } finally {
              setExchanging(null);
            }
          },
        },
      ]
    );
  };

  // Stats
  const stats = useMemo(() => {
    const inStock = products.filter(p => p.stock > 0).length;
    const cheapest = products.length > 0
      ? Math.min(...products.map(p => p.pointsCost))
      : 0;
    return { total: products.length, inStock, cheapest };
  }, [products]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <View style={styles.container}>
      {/* Points Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="diamond" size={20} color={GOLD} />
          <Text style={styles.headerPoints}>{(membership?.points ?? 0).toLocaleString()} 积分</Text>
        </View>
        <Text style={styles.headerHint}>
          {membership?.levelName ?? '普通会员'}
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索商品名称..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category Filter */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.categoryTab, category === item && styles.categoryTabActive]}
            onPress={() => handleCategoryChange(item)}
          >
            <Text style={[styles.categoryTabText, category === item && styles.categoryTabTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Product Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
          {search.trim() ? (
            <>
              <Text style={styles.emptyText}>未找到"{search}"相关商品</Text>
              <Text style={styles.emptySubText}>换个关键词试试</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyText}>暂无商品</Text>
              <Text style={styles.emptySubText}>请稍后再来</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.productRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>全部商品</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#22C55E' }]}>{stats.inStock}</Text>
                <Text style={styles.statLabel}>有货在售</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: GOLD }]}>{stats.cheapest.toLocaleString()}</Text>
                <Text style={styles.statLabel}>最低积分</Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.bottomCTA}>
              <Ionicons name="diamond-outline" size={24} color={GOLD} />
              <Text style={styles.ctaTitle}>赚取更多积分</Text>
              <Text style={styles.ctaSubtitle}>签到、消费、参与活动均可获得积分</Text>
              <Pressable style={styles.ctaBtn} onPress={() => router.push('/membership' as any)}>
                <Text style={styles.ctaBtnText}>赚取更多积分 →</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.productImagePlaceholder]}>
                  <Ionicons name="gift" size={32} color={GOLD} />
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                {item.stock > 0 && item.stock <= 20 && (
                  <Text style={styles.stockWarning}>仅剩 {item.stock} 件</Text>
                )}
              </View>
              <Pressable
                style={[
                  styles.exchangeBtn,
                  (item.stock === 0 || (membership?.points ?? 0) < item.pointsCost) && styles.exchangeBtnDisabled,
                  exchanging === item.id && styles.exchangeBtnLoading,
                ]}
                onPress={() => handleExchange(item)}
                disabled={item.stock === 0 || exchanging === item.id}
              >
                {exchanging === item.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="diamond" size={12} color="#FFFFFF" />
                    <Text style={styles.exchangeBtnText}>
                      {item.stock === 0 ? '已售罄' : `${item.pointsCost.toLocaleString()} 积分`}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCardSolid,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerPoints: { fontSize: fontSize.xl, fontWeight: '800', color: GOLD },
  headerHint: { fontSize: fontSize.sm, color: colors.textMuted },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  categoryList: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  categoryTabActive: { backgroundColor: PRIMARY },
  categoryTabText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  categoryTabTextActive: { color: '#FFFFFF', fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },

  productGrid: { padding: spacing.sm, paddingBottom: spacing.xxl },
  productRow: { gap: spacing.sm },

  productCard: {
    flex: 1,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: spacing.sm,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1.4,
    backgroundColor: '#F9FAFB',
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { padding: spacing.sm, flex: 1 },
  productName: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  productDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  stockWarning: { fontSize: fontSize.xs, color: colors.error, marginTop: 4 },

  exchangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: GOLD,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  exchangeBtnDisabled: { backgroundColor: '#E5E7EB' },
  exchangeBtnLoading: { opacity: 0.7 },
  exchangeBtnText: { fontSize: fontSize.xs, fontWeight: '700', color: '#FFFFFF' },

  emptyText: { fontSize: fontSize.lg, color: colors.textMuted, fontWeight: '600' },
  emptySubText: { fontSize: fontSize.sm, color: colors.textMuted },

  bottomCTA: {
    marginTop: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  ctaSubtitle: { fontSize: 13, color: '#94A3B8' },
  ctaBtn: {
    marginTop: 10,
    backgroundColor: GOLD,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
