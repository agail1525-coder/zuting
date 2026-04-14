import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, OrderDetail } from '../src/lib/api';

const formatPrice = (amount: number) => (amount / 100).toFixed(2);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PAID: { label: '支付成功', color: '#22C55E' },
  PENDING: { label: '支付处理中', color: '#F59E0B' },
  CANCELLED: { label: '支付取消', color: '#EF4444' },
  REFUNDING: { label: '退款中', color: '#EF4444' },
  REFUNDED: { label: '已退款', color: '#9CA3AF' },
};

export default function PaymentResultScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const data = await api.getOrderById(orderId);
      setOrder(data);
      if (data.status !== 'PENDING') {
        // Stop polling once we have a final status
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch {
      // silent — keep polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 3 seconds while order is pending
    intervalRef.current = setInterval(() => {
      setPollCount(c => c + 1);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  // Trigger re-fetch on poll tick
  useEffect(() => {
    if (pollCount > 0) fetchOrder();
  }, [pollCount]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3264ff" />
        <Text style={s.loadingText}>查询订单状态...</Text>
      </View>
    );
  }

  const status = order?.status ?? 'PENDING';
  const info = STATUS_MAP[status] ?? { label: status, color: '#9CA3AF' };
  const isPaid = status === 'PAID';
  const isPending = status === 'PENDING';
  const isFailed = status === 'CANCELLED';

  return (
    <View style={s.container}>
      <View style={s.resultCard}>
        {isPending ? (
          <ActivityIndicator size={64} color="#F59E0B" />
        ) : isPaid ? (
          <View style={[s.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
          </View>
        ) : (
          <View style={[s.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={64} color="#EF4444" />
          </View>
        )}

        <Text style={[s.statusText, { color: info.color }]}>{info.label}</Text>

        {order && (
          <View style={s.orderInfo}>
            <InfoRow label="订单号" value={order.orderNo} />
            {order.trip && <InfoRow label="行程" value={order.trip.title} />}
            <InfoRow label="支付金额" value={`¥${formatPrice(order.paidAmount ?? order.totalAmount)}`} />
            {order.paidAt && (
              <InfoRow label="支付时间" value={order.paidAt.slice(0, 16).replace('T', ' ')} />
            )}
          </View>
        )}
      </View>

      <View style={s.actions}>
        {isPaid && (
          <Pressable
            style={s.primaryBtn}
            onPress={() => router.push('/orders/index' as never)}
          >
            <Text style={s.primaryBtnText}>查看订单</Text>
          </Pressable>
        )}
        {isFailed && (
          <Pressable
            style={s.primaryBtn}
            onPress={() => router.back()}
          >
            <Text style={s.primaryBtnText}>重新支付</Text>
          </Pressable>
        )}
        <Pressable
          style={s.secondaryBtn}
          onPress={() => router.replace('/(tabs)/' as never)}
        >
          <Text style={s.secondaryBtnText}>返回首页</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  center: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#6B7280', fontSize: 14 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  orderInfo: { width: '100%' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', maxWidth: '60%', textAlign: 'right' },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#3264ff',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: { color: '#374151', fontSize: 16 },
});
