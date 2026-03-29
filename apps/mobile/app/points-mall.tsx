import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import {
  fetchMyMembership,
  fetchPointsProducts,
  exchangeProduct,
  type PointsProductItem,
  type MembershipData,
} from '../src/lib/api';

const PRIMARY = '#0066FF';
const GOLD = '#D4A855';

const CATEGORIES = ['全部', '优惠券', '实物礼品', '旅行增值', '会员权益'];

export default function PointsMallScreen() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [products, setProducts] = useState<PointsProductItem[]>([]);
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exchanging, setExchanging] = useState<string | null>(null);

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
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>暂无商品</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.productRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

  emptyText: { fontSize: fontSize.lg, color: colors.textMuted },
});
