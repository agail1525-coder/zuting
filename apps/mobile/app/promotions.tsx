import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { PromotionItem, fetchPromotions } from '../src/lib/api';

const formatPrice = (amount: number) => (amount / 100).toFixed(2);

function getTimeLeft(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return '已结束';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}天后结束`;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const PROMO_TYPES = [
  { key: '', label: '全部' },
  { key: 'FLASH_SALE', label: '闪购' },
  { key: 'EARLY_BIRD', label: '早鸟价' },
  { key: 'LIMITED_TIME', label: '限时折扣' },
] as const;

type PromoTypeKey = typeof PROMO_TYPES[number]['key'];

const TYPE_BADGE_COLORS: Record<string, string> = {
  FLASH_SALE: '#EF4444',
  EARLY_BIRD: '#F59E0B',
  LIMITED_TIME: '#8B5CF6',
  DEFAULT: '#0066FF',
};

const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: '闪购',
  EARLY_BIRD: '早鸟',
  LIMITED_TIME: '限时',
};

export default function PromotionsScreen() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PromoTypeKey>('');
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (type: PromoTypeKey) => {
    setLoading(true);
    try {
      const res = await fetchPromotions(type || undefined);
      setItems(res.items ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeType);
  }, [activeType, load]);

  // Countdown tick
  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Computed stats
  const stats = useMemo(() => {
    const flashCount = items.filter(i => i.type === 'FLASH_SALE').length;
    const now = Date.now();
    const expiringCount = items.filter(i => {
      const diff = new Date(i.endAt).getTime() - now;
      return diff > 0 && diff < 24 * 3600000;
    }).length;
    return { total: items.length, flashCount, expiringCount };
  }, [items]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { '': items.length };
    for (const t of PROMO_TYPES.slice(1)) {
      counts[t.key] = items.filter(i => i.type === t.key).length;
    }
    return counts;
  }, [items]);

  // Has active flash sales
  const hasFlashSales = useMemo(
    () => items.some(i => i.type === 'FLASH_SALE' && getTimeLeft(i.endAt) !== '已结束'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, tick]
  );

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const isFlashSale = (item: PromotionItem) => item.type === 'FLASH_SALE';

  const renderItem = ({ item }: { item: PromotionItem }) => {
    const badgeColor = TYPE_BADGE_COLORS[item.type] ?? TYPE_BADGE_COLORS.DEFAULT;
    const remaining = item.totalQuota - item.usedQuota;
    const percentUsed = item.totalQuota > 0 ? item.usedQuota / item.totalQuota : 0;
    const timeLeft = getTimeLeft(item.endAt);
    const isEnded = timeLeft === '已结束';

    return (
      <View style={[s.card, isEnded && s.cardEnded]}>
        {/* Header */}
        <View style={s.cardHeader}>
          <View style={[s.typeBadge, { backgroundColor: badgeColor }]}>
            <Text style={s.typeBadgeText}>{TYPE_LABELS[item.type] ?? item.type}</Text>
          </View>
          <Text style={s.cardName}>{item.name}</Text>
        </View>

        {item.description && (
          <Text style={s.cardDesc}>{item.description}</Text>
        )}

        {/* Discount Display */}
        <View style={s.discountRow}>
          <View style={s.discountBadge}>
            <Text style={s.discountText}>
              {item.discountType === 'PERCENTAGE'
                ? `${Math.round((1 - item.discountValue) * 10)}折优惠`
                : `立减 ¥${formatPrice(item.discountValue)}`
              }
            </Text>
          </View>
          {item.minAmount != null && (
            <Text style={s.minAmountText}>满¥{formatPrice(item.minAmount)}可用</Text>
          )}
        </View>

        {/* Quota Bar */}
        {item.totalQuota > 0 && (
          <View style={s.quotaRow}>
            <View style={s.quotaBar}>
              <View style={[s.quotaFill, { width: `${Math.min(percentUsed * 100, 100)}%` as `${number}%`, backgroundColor: badgeColor }]} />
            </View>
            <Text style={s.quotaText}>剩余 {remaining} 份</Text>
          </View>
        )}

        {/* Footer: countdown */}
        <View style={s.cardFooter}>
          <Ionicons name="time-outline" size={14} color={isFlashSale(item) && !isEnded ? '#EF4444' : '#9CA3AF'} />
          <Text style={[s.timeLeft, isFlashSale(item) && !isEnded && s.timeLeftFlash]}>
            {isEnded ? '活动已结束' : `剩余时间: ${timeLeft}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Flash Sale Banner */}
      {hasFlashSales && (
        <View style={s.flashBanner}>
          <Ionicons name="flash" size={16} color="#FFFFFF" />
          <Text style={s.flashBannerText}>限时闪购进行中！抢先享受超值折扣</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </View>
      )}

      {/* Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabBarScroll}
        contentContainerStyle={s.tabBar}
      >
        {PROMO_TYPES.map(t => (
          <Pressable
            key={t.key}
            style={[s.tabItem, activeType === t.key && s.tabItemActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[s.tabText, activeType === t.key && s.tabTextActive]}>
              {t.label}
            </Text>
            {tabCounts[t.key] > 0 && (
              <View style={[s.tabBadge, activeType === t.key && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeText, activeType === t.key && s.tabBadgeTextActive]}>
                  {tabCounts[t.key]}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="搜索促销活动..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Stats Header */}
      {!loading && items.length > 0 && (
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNumber}>{stats.total}</Text>
            <Text style={s.statLabel}>全部活动</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#EF4444' }]}>{stats.flashCount}</Text>
            <Text style={s.statLabel}>闪购进行</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#F59E0B' }]}>{stats.expiringCount}</Text>
            <Text style={s.statLabel}>即将结束</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyView}>
          <Ionicons name="gift-outline" size={48} color="#D1D5DB" />
          {search.trim() ? (
            <>
              <Text style={s.emptyText}>未找到"{search}"相关活动</Text>
              <Text style={s.emptySubText}>换个关键词试试</Text>
            </>
          ) : (
            <>
              <Text style={s.emptyText}>暂无促销活动</Text>
              <Text style={s.emptySubText}>请稍后再来查看</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          extraData={tick}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            <View style={s.bottomCTA}>
              <Text style={s.ctaTitle}>更多优惠等你发现</Text>
              <Text style={s.ctaSubtitle}>领券出行，省更多</Text>
              <View style={s.ctaButtons}>
                <Pressable style={s.ctaBtn} onPress={() => router.push('/coupons' as any)}>
                  <Ionicons name="pricetag-outline" size={16} color="#FFFFFF" />
                  <Text style={s.ctaBtnText}>查看优惠券</Text>
                </Pressable>
                <Pressable style={[s.ctaBtn, s.ctaBtnOutline]} onPress={() => router.push('/routes')}>
                  <Ionicons name="map-outline" size={16} color="#D4A855" />
                  <Text style={[s.ctaBtnText, { color: '#D4A855' }]}>浏览路线</Text>
                </Pressable>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  flashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  flashBannerText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  tabBarScroll: { backgroundColor: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#0066FF' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#0066FF', fontWeight: '700' },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: '#DBEAFE' },
  tabBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '700' },
  tabBadgeTextActive: { color: '#0066FF' },

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

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#0066FF' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },

  listContent: { padding: 16 },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardEnded: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  cardDesc: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: { color: '#EF4444', fontSize: 15, fontWeight: '800' },
  minAmountText: { fontSize: 12, color: '#9CA3AF' },
  quotaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  quotaBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaFill: { height: '100%', borderRadius: 3 },
  quotaText: { fontSize: 12, color: '#6B7280', minWidth: 60, textAlign: 'right' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  timeLeft: { fontSize: 12, color: '#9CA3AF', fontVariant: ['tabular-nums'] },
  timeLeftFlash: { color: '#EF4444', fontWeight: '600' },

  bottomCTA: {
    marginTop: 24,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  ctaSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
  ctaButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0066FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4A855',
  },
  ctaBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
