import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [activeType, setActiveType] = useState<PromoTypeKey>('');
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
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
      {/* Type Tabs */}
      <View style={s.tabBar}>
        {PROMO_TYPES.map(t => (
          <Pressable
            key={t.key}
            style={[s.tabItem, activeType === t.key && s.tabItemActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[s.tabText, activeType === t.key && s.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : items.length === 0 ? (
        <View style={s.emptyView}>
          <Ionicons name="gift-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>暂无促销活动</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          extraData={tick}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#0066FF' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#0066FF', fontWeight: '700' },
  listContent: { padding: 16 },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
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
});
