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
import { useTranslation } from '../src/lib/i18n';
import { PromotionItem, fetchPromotions } from '../src/lib/api';

const formatPrice = (amount: number) => (amount / 100).toFixed(2);

function getTimeLeft(endAt: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return t('promotions.ended');
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return t('promotions.endsInDays', { days });
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const PROMO_TYPE_KEYS = ['', 'FLASH_SALE', 'EARLY_BIRD', 'LIMITED_TIME'] as const;

type PromoTypeKey = typeof PROMO_TYPE_KEYS[number];

const TYPE_BADGE_COLORS: Record<string, string> = {
  FLASH_SALE: '#EF4444',
  EARLY_BIRD: '#F59E0B',
  LIMITED_TIME: '#8B5CF6',
  DEFAULT: '#3264ff',
};

const TYPE_BADGE_KEYS: Record<string, string> = {
  FLASH_SALE: 'promotions.badgeFlashSale',
  EARLY_BIRD: 'promotions.badgeEarlyBird',
  LIMITED_TIME: 'promotions.badgeLimitedTime',
};

const TYPE_TAB_KEYS: Record<string, string> = {
  FLASH_SALE: 'promotions.typeFlashSale',
  EARLY_BIRD: 'promotions.typeEarlyBird',
  LIMITED_TIME: 'promotions.typeLimitedTime',
};

export default function PromotionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const PROMO_TYPES = PROMO_TYPE_KEYS.map(key => ({
    key: key as PromoTypeKey,
    label: key === '' ? t('promotions.filterAll') : t(TYPE_TAB_KEYS[key] as any),
  }));

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
    for (const key of PROMO_TYPE_KEYS.slice(1)) {
      counts[key] = items.filter(i => i.type === key).length;
    }
    return counts;
  }, [items]);

  // Has active flash sales
  const hasFlashSales = useMemo(
    () => items.some(i => i.type === 'FLASH_SALE' && getTimeLeft(i.endAt, t) !== t('promotions.ended')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, tick, t]
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
    const timeLeft = getTimeLeft(item.endAt, t);
    const isEnded = timeLeft === t('promotions.ended');

    return (
      <View style={[s.card, isEnded && s.cardEnded]}>
        {/* Header */}
        <View style={s.cardHeader}>
          <View style={[s.typeBadge, { backgroundColor: badgeColor }]}>
            <Text style={s.typeBadgeText}>{t(TYPE_BADGE_KEYS[item.type] as any) ?? item.type}</Text>
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
                ? t('promotions.discountOff', { value: Math.round((1 - item.discountValue) * 10) })
                : t('promotions.saveMoney', { amount: formatPrice(item.discountValue) })
              }
            </Text>
          </View>
          {item.minAmount != null && (
            <Text style={s.minAmountText}>{t('promotions.minAmount', { amount: formatPrice(item.minAmount) })}</Text>
          )}
        </View>

        {/* Quota Bar */}
        {item.totalQuota > 0 && (
          <View style={s.quotaRow}>
            <View style={s.quotaBar}>
              <View style={[s.quotaFill, { width: `${Math.min(percentUsed * 100, 100)}%` as `${number}%`, backgroundColor: badgeColor }]} />
            </View>
            <Text style={s.quotaText}>{t('promotions.remaining', { count: remaining })}</Text>
          </View>
        )}

        {/* Footer: countdown */}
        <View style={s.cardFooter}>
          <Ionicons name="time-outline" size={14} color={isFlashSale(item) && !isEnded ? '#EF4444' : '#9CA3AF'} />
          <Text style={[s.timeLeft, isFlashSale(item) && !isEnded && s.timeLeftFlash]}>
            {isEnded ? t('promotions.eventEnded') : `${t('promotions.timeRemaining')}: ${timeLeft}`}
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
          <Text style={s.flashBannerText}>{t('promotions.flashBannerText')}</Text>
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
        {PROMO_TYPES.map(pt => (
          <Pressable
            key={pt.key}
            style={[s.tabItem, activeType === pt.key && s.tabItemActive]}
            onPress={() => setActiveType(pt.key)}
          >
            <Text style={[s.tabText, activeType === pt.key && s.tabTextActive]}>
              {pt.label}
            </Text>
            {tabCounts[pt.key] > 0 && (
              <View style={[s.tabBadge, activeType === pt.key && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeText, activeType === pt.key && s.tabBadgeTextActive]}>
                  {tabCounts[pt.key]}
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
          placeholder={t('promotions.searchPlaceholder')}
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
            <Text style={s.statLabel}>{t('promotions.statAll')}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#EF4444' }]}>{stats.flashCount}</Text>
            <Text style={s.statLabel}>{t('promotions.statFlash')}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#F59E0B' }]}>{stats.expiringCount}</Text>
            <Text style={s.statLabel}>{t('promotions.statExpiring')}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator size="large" color="#3264ff" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyView}>
          <Ionicons name="gift-outline" size={48} color="#D1D5DB" />
          {search.trim() ? (
            <>
              <Text style={s.emptyText}>{t('promotions.searchNotFound', { keyword: search })}</Text>
              <Text style={s.emptySubText}>{t('promotions.tryOtherKeyword')}</Text>
            </>
          ) : (
            <>
              <Text style={s.emptyText}>{t('promotions.noPromotions')}</Text>
              <Text style={s.emptySubText}>{t('promotions.checkBackLater')}</Text>
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
              <Text style={s.ctaTitle}>{t('promotions.discoverMore')}</Text>
              <Text style={s.ctaSubtitle}>{t('promotions.discoverMoreSubtitle')}</Text>
              <View style={s.ctaButtons}>
                <Pressable style={s.ctaBtn} onPress={() => router.push('/coupons' as any)}>
                  <Ionicons name="pricetag-outline" size={16} color="#FFFFFF" />
                  <Text style={s.ctaBtnText}>{t('promotions.viewCoupons')}</Text>
                </Pressable>
                <Pressable style={[s.ctaBtn, s.ctaBtnOutline]} onPress={() => router.push('/routes')}>
                  <Ionicons name="map-outline" size={16} color="#D4A855" />
                  <Text style={[s.ctaBtnText, { color: '#D4A855' }]}>{t('promotions.browseRoutes')}</Text>
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
  tabItemActive: { borderBottomColor: '#3264ff' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#3264ff', fontWeight: '700' },
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
  tabBadgeTextActive: { color: '#3264ff' },

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
  statNumber: { fontSize: 20, fontWeight: '800', color: '#3264ff' },
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
    backgroundColor: '#3264ff',
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
