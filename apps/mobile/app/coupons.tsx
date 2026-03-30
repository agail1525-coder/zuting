import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const [available, setAvailable] = useState<CouponItem[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCouponItem[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<UserCouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

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
      // refresh both tabs
      load('available');
      load('mine');
    } catch (err) { Alert.alert('提示', '领取失败，请重试'); } finally {
      setClaimingId(null);
    }
  };

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

  const currentData: CouponItem[] | UserCouponItem[] =
    activeTab === 'available' ? available : activeTab === 'mine' ? myCoupons : usedCoupons;

  return (
    <View style={s.container}>
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
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingView}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : currentData.length === 0 ? (
        <View style={s.emptyView}>
          <Ionicons name="pricetag-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>暂无优惠券</Text>
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
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#0066FF', fontWeight: '700' },
  listContent: { padding: 16 },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
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
});
