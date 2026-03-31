import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CouponItem,
  UserCouponItem,
  fetchAvailableCoupons,
  fetchMyCoupons,
  claimCoupon,
} from '../src/lib/api';

const formatPrice = (amount: number) => (amount / 100).toFixed(2);

const TABS = [
  { key: 'available', label: '可领取' },
  { key: 'mine', label: '我的券' },
  { key: 'used', label: '已使用' },
] as const;

type TabKey = typeof TABS[number]['key'];

const TYPE_COLORS: Record<string, string> = {
  FIXED: '#0066FF',
  PERCENTAGE: '#EF4444',
  CASHBACK: '#F59E0B',
};

const TYPE_LABELS: Record<string, string> = {
  FIXED: '满减',
  PERCENTAGE: '折扣',
  CASHBACK: '返现',
};

export default function CouponsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const [available, setAvailable] = useState<CouponItem[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCouponItem[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<UserCouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      if (tab === 'available') {
        const res = await fetchAvailableCoupons();
        setAvailable(res.items ?? []);
      } else if (tab === 'mine') {
        const res = await fetchMyCoupons('ACTIVE');
        setMyCoupons(res.items ?? []);
      } else {
        const res = await fetchMyCoupons('USED');
        setUsedCoupons(res.items ?? []);
      }
    } catch { Alert.alert('提示', '加载优惠券失败'); } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  const handleClaim = async (couponId: string) => {
    setClaimingId(couponId);
    try {
      await claimCoupon(couponId);
      load('available');
      load('mine');
    } catch { Alert.alert('提示', '领取失败，请重试'); } finally {
      setClaimingId(null);
    }
  };

  // Wallet overview stats
  const walletStats = useMemo(() => {
    const totalFaceValue = myCoupons.reduce((sum, uc) => {
      const c = uc.coupon;
      return sum + (c.type === 'FIXED' ? c.value : 0);
    }, 0);
    const now = Date.now();
    const expiringSoon = myCoupons.filter(uc => {
      const diff = new Date(uc.coupon.endAt).getTime() - now;
      return diff > 0 && diff < 7 * 24 * 3600000;
    }).length;
    return {
      myCount: myCoupons.length,
      totalFaceValue,
      expiringSoon,
    };
  }, [myCoupons]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    available: available.length,
    mine: myCoupons.length,
    used: usedCoupons.length,
  }), [available.length, myCoupons.length, usedCoupons.length]);

  // Current raw data
  const currentRaw: (CouponItem | UserCouponItem)[] =
    activeTab === 'available' ? available : activeTab === 'mine' ? myCoupons : usedCoupons;

  // Filtered data
  const currentData = useMemo(() => {
    if (!search.trim()) return currentRaw;
    const q = search.trim().toLowerCase();
    return currentRaw.filter(item => {
      if (activeTab === 'available') {
        const c = item as CouponItem;
        return c.name.toLowerCase().includes(q);
      } else {
        const uc = item as UserCouponItem;
        return uc.coupon.name.toLowerCase().includes(q);
      }
    });
  }, [currentRaw, search, activeTab]);

  const renderAvailableCoupon = ({ item }: { item: CouponItem }) => {
    const accentColor = TYPE_COLORS[item.type] ?? '#0066FF';
    return (
      <View style={s.couponCard}>
        <View style={[s.couponAccent, { backgroundColor: accentColor }]} />
        <View style={s.couponLeft}>
          <Text style={s.couponAmount}>
            {item.type === 'PERCENTAGE'
              ? `${Math.round((1 - item.value) * 10)}折`
              : `¥${formatPrice(item.value)}`
            }
          </Text>
          <Text style={s.couponMin}>
            {item.minAmount ? `满¥${formatPrice(item.minAmount)}可用` : '无门槛'}
          </Text>
        </View>
        <View style={s.couponMiddle}>
          <Text style={s.couponName}>{item.name}</Text>
          <View style={[s.typeBadge, { backgroundColor: accentColor + '18' }]}>
            <Text style={[s.typeBadgeText, { color: accentColor }]}>
              {TYPE_LABELS[item.type] ?? item.type}
            </Text>
          </View>
          <Text style={s.couponExpiry}>有效至 {item.endAt.slice(0, 10)}</Text>
        </View>
        <Pressable
          style={[s.claimBtn, claimingId === item.id && { opacity: 0.6 }]}
          onPress={() => handleClaim(item.id)}
          disabled={claimingId === item.id}
        >
          {claimingId === item.id
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={s.claimBtnText}>领取</Text>
          }
        </Pressable>
      </View>
    );
  };

  const renderUserCoupon = ({ item }: { item: UserCouponItem }) => {
    const c = item.coupon;
    const accentColor = TYPE_COLORS[c.type] ?? '#0066FF';
    const isUsed = item.status === 'USED' || item.status === 'EXPIRED';
    return (
      <View style={[s.couponCard, isUsed && s.couponCardUsed]}>
        <View style={[s.couponAccent, { backgroundColor: isUsed ? '#D1D5DB' : accentColor }]} />
        <View style={s.couponLeft}>
          <Text style={[s.couponAmount, isUsed && s.couponAmountUsed]}>
            {c.type === 'PERCENTAGE'
              ? `${Math.round((1 - c.value) * 10)}折`
              : `¥${formatPrice(c.value)}`
            }
          </Text>
          <Text style={s.couponMin}>
            {c.minAmount ? `满¥${formatPrice(c.minAmount)}可用` : '无门槛'}
          </Text>
        </View>
        <View style={s.couponMiddle}>
          <Text style={[s.couponName, isUsed && { color: '#9CA3AF' }]}>{c.name}</Text>
          <Text style={s.couponExpiry}>有效至 {c.endAt.slice(0, 10)}</Text>
        </View>
        <View style={s.statusBadgeContainer}>
          <Text style={[s.statusBadgeText, isUsed && s.statusBadgeUsed]}>
            {item.status === 'USED' ? '已使用' : item.status === 'EXPIRED' ? '已过期' : '可使用'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Wallet Overview Card */}
      <View style={s.walletCard}>
        <View style={s.walletItem}>
          <Text style={s.walletNumber}>{walletStats.myCount}</Text>
          <Text style={s.walletLabel}>可用券</Text>
        </View>
        <View style={s.walletDivider} />
        <View style={s.walletItem}>
          <Text style={s.walletNumber}>¥{formatPrice(walletStats.totalFaceValue)}</Text>
          <Text style={s.walletLabel}>券面总值</Text>
        </View>
        <View style={s.walletDivider} />
        <View style={s.walletItem}>
          <Text style={[s.walletNumber, walletStats.expiringSoon > 0 && { color: '#F59E0B' }]}>
            {walletStats.expiringSoon}
          </Text>
          <Text style={s.walletLabel}>即将过期</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[s.tabItem, activeTab === tab.key && s.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
              {tab.label}
            </Text>
            {tabCounts[tab.key] > 0 && (
              <View style={[s.tabBadge, activeTab === tab.key && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeText, activeTab === tab.key && s.tabBadgeTextActive]}>
                  {tabCounts[tab.key]}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Search Input */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="搜索优惠券..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : currentData.length === 0 ? (
        <View style={s.emptyView}>
          <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
          {search.trim() ? (
            <>
              <Text style={s.emptyText}>未找到"{search}"相关优惠券</Text>
              <Text style={s.emptySubText}>换个关键词试试</Text>
            </>
          ) : (
            <>
              <Text style={s.emptyText}>暂无优惠券</Text>
              <Text style={s.emptySubText}>去领取优惠券吧</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={currentData as CouponItem[]}
          keyExtractor={item => item.id}
          renderItem={
            activeTab === 'available'
              ? renderAvailableCoupon
              : ({ item }) => renderUserCoupon({ item: item as unknown as UserCouponItem })
          }
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            <View style={s.bottomCTA}>
              <Text style={s.ctaTitle}>发现更多优惠</Text>
              <Text style={s.ctaSubtitle}>促销活动 · 限时折扣 · 专属特惠</Text>
              <View style={s.ctaButtons}>
                <Pressable style={s.ctaBtn} onPress={() => router.push('/promotions' as any)}>
                  <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
                  <Text style={s.ctaBtnText}>查看促销</Text>
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

  walletCard: {
    flexDirection: 'row',
    backgroundColor: '#1D4ED8',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  walletItem: { flex: 1, alignItems: 'center' },
  walletNumber: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  walletLabel: { fontSize: 11, color: '#BFDBFE', marginTop: 3 },
  walletDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#0066FF' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
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
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  listContent: { padding: 16 },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },

  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  couponCardUsed: { opacity: 0.7 },
  couponAccent: { width: 6, alignSelf: 'stretch' },
  couponLeft: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  couponAmount: { fontSize: 22, fontWeight: '900', color: '#EF4444' },
  couponAmountUsed: { color: '#9CA3AF' },
  couponMin: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  couponMiddle: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, gap: 4 },
  couponName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  couponExpiry: { fontSize: 11, color: '#9CA3AF' },
  claimBtn: {
    backgroundColor: '#0066FF',
    marginRight: 14,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  claimBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  statusBadgeContainer: { marginRight: 14 },
  statusBadgeText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
  statusBadgeUsed: { color: '#9CA3AF' },

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
