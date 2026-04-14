import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, OrderDetail } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { useTranslation } from '../../src/lib/i18n';

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'orders.status.pending',
  PAID: 'orders.status.paid',
  CANCELLED: 'orders.status.cancelled',
  REFUNDING: 'orders.status.refunding',
  REFUNDED: 'orders.status.refunded',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PAID: '#22C55E',
  CANCELLED: '#9CA3AF',
  REFUNDING: '#EF4444',
  REFUNDED: '#6B7280',
};

const FILTER_KEYS = ['all', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED'];

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await api.getOrders(params as Record<string, string>);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const renderOrder = ({ item }: { item: OrderDetail }) => {
    const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
    return (
      <View style={s.orderCard}>
        <View style={s.orderHeader}>
          <Text style={s.orderNo}>{t('orders.orderNo')}: {item.orderNo}</Text>
          <Text style={[s.statusBadge, { color: statusColor, borderColor: statusColor }]}>
            {t(STATUS_LABEL_KEYS[item.status] ?? 'orders.status.pending')}
          </Text>
        </View>
        {item.trip && <Text style={s.tripTitle}>{item.trip.title}</Text>}
        <View style={s.orderMeta}>
          <Text style={s.amount}>¥{((item.totalAmount ?? 0) / 100).toFixed(2)}</Text>
          <Text style={s.date}>{item.createdAt?.slice(0, 10) ?? ''}</Text>
        </View>
        {item.status === 'PENDING' && (
          <Pressable
            style={s.cancelBtn}
            onPress={async () => {
              try {
                await api.cancelOrder(item.id);
                loadOrders();
              } catch { Alert.alert(t('orders.notice'), t('orders.cancelFailed')); }
            }}
          >
            <Text style={s.cancelBtnText}>{t('orders.cancelOrder')}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Filters */}
      <View style={s.filterRow}>
        {FILTER_KEYS.map(f => (
          <Pressable
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === 'all' ? t('orders.filter.all') : t(STATUS_LABEL_KEYS[f] ?? '')}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <LoadingView />
      ) : orders.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>{t('orders.noOrders')}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#3264ff', borderColor: '#3264ff' },
  filterText: { fontSize: 13, color: '#6B7280' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  orderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNo: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: {
    fontSize: 12, fontWeight: '600',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
  },
  tripTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  date: { fontSize: 12, color: '#9CA3AF' },
  cancelBtn: {
    marginTop: 12, alignSelf: 'flex-end',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#EF4444',
  },
  cancelBtnText: { fontSize: 13, color: '#EF4444' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
