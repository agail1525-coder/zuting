import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  api,
  Trip,
  PromotionItem,
  createOrder,
  payOrder,
  verifyCoupon,
  fetchPromotions,
} from '../src/lib/api';
import { LoadingView } from '../src/components/LoadingView';

const formatPrice = (amount: number) => (amount / 100).toFixed(2);

const PAYMENT_METHODS = [
  { id: 'WECHAT', label: '微信支付', icon: 'logo-wechat' as const },
  { id: 'ALIPAY', label: '支付宝', icon: 'card-outline' as const },
];

export default function CheckoutScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponVerifying, setCouponVerifying] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);

  // Promotions
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('WECHAT');

  useEffect(() => {
    if (!tripId) return;
    Promise.all([
      api.getTripById(tripId),
      fetchPromotions(),
    ])
      .then(([tripData, promoData]) => {
        setTrip(tripData);
        setPromotions(promoData.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <LoadingView />;
  if (!trip) {
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>行程不存在</Text>
      </View>
    );
  }

  const baseAmount = trip.totalBudget ?? 0;
  const promoDiscount = selectedPromotion
    ? (() => {
        const p = promotions.find(x => x.id === selectedPromotion);
        if (!p) return 0;
        if (p.discountType === 'PERCENTAGE') {
          const d = Math.floor(baseAmount * p.discountValue);
          return p.maxDiscount ? Math.min(d, p.maxDiscount) : d;
        }
        return Math.min(p.discountValue, baseAmount);
      })()
    : 0;
  const appliedCouponDiscount = couponDiscount ?? 0;
  const totalDiscount = appliedCouponDiscount + promoDiscount;
  const finalAmount = Math.max(0, baseAmount - totalDiscount);

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponVerifying(true);
    setCouponError(null);
    setCouponDiscount(null);
    setVerifiedCode(null);
    try {
      const res = await verifyCoupon(couponCode.trim(), baseAmount);
      if (res.valid && res.discount != null) {
        setCouponDiscount(res.discount);
        setVerifiedCode(couponCode.trim());
      } else {
        setCouponError(res.reason ?? '优惠券无效');
      }
    } catch {
      setCouponError('验证失败，请重试');
    } finally {
      setCouponVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!tripId) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        tripId,
        totalAmount: finalAmount,
        paymentMethod,
        couponCode: verifiedCode ?? undefined,
        promotionId: selectedPromotion ?? undefined,
      });
      const paid = await payOrder(order.id, {
        paidAmount: finalAmount,
        paymentMethod,
      });
      router.replace(`/payment-result?orderId=${paid.id}` as never);
    } catch (err) {
      Alert.alert('支付失败', err instanceof Error ? err.message : '请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Trip Summary */}
      <View style={s.card}>
        <Text style={s.cardTitle}>行程信息</Text>
        <Text style={s.tripTitle}>{trip.title}</Text>
        <View style={s.metaRow}>
          <Text style={s.metaText}>出行人数: {trip.persons} 人</Text>
          {trip.startDate && (
            <Text style={s.metaText}>出发: {trip.startDate.slice(0, 10)}</Text>
          )}
        </View>
      </View>

      {/* Coupon */}
      <View style={s.card}>
        <Text style={s.cardTitle}>优惠券</Text>
        <View style={s.couponRow}>
          <TextInput
            style={s.couponInput}
            value={couponCode}
            onChangeText={v => { setCouponCode(v); setCouponError(null); setCouponDiscount(null); setVerifiedCode(null); }}
            placeholder="输入优惠码"
            autoCapitalize="characters"
          />
          <Pressable
            style={[s.verifyBtn, couponVerifying && { opacity: 0.6 }]}
            onPress={handleVerifyCoupon}
            disabled={couponVerifying}
          >
            {couponVerifying
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={s.verifyBtnText}>验证</Text>
            }
          </Pressable>
        </View>
        {couponDiscount != null && (
          <Text style={s.couponSuccess}>
            优惠券有效，减免 ¥{formatPrice(couponDiscount)}
          </Text>
        )}
        {couponError && (
          <Text style={s.couponErrorText}>{couponError}</Text>
        )}
      </View>

      {/* Promotions */}
      {promotions.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>促销活动</Text>
          {promotions.map(p => {
            const selected = selectedPromotion === p.id;
            const remaining = p.totalQuota - p.usedQuota;
            return (
              <Pressable
                key={p.id}
                style={[s.promoItem, selected && s.promoItemSelected]}
                onPress={() => setSelectedPromotion(selected ? null : p.id)}
              >
                <View style={s.promoLeft}>
                  <Text style={[s.promoName, selected && s.promoNameSelected]}>{p.name}</Text>
                  {p.description && (
                    <Text style={s.promoDesc}>{p.description}</Text>
                  )}
                  <Text style={s.promoRemaining}>剩余名额: {remaining}</Text>
                </View>
                <View style={s.promoBadge}>
                  <Text style={s.promoBadgeText}>
                    {p.discountType === 'PERCENTAGE'
                      ? `${Math.round((1 - p.discountValue) * 10)}折`
                      : `减¥${formatPrice(p.discountValue)}`
                    }
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Payment Method */}
      <View style={s.card}>
        <Text style={s.cardTitle}>支付方式</Text>
        {PAYMENT_METHODS.map(m => (
          <Pressable
            key={m.id}
            style={[s.paymentItem, paymentMethod === m.id && s.paymentItemSelected]}
            onPress={() => setPaymentMethod(m.id)}
          >
            <Ionicons name={m.icon} size={22} color={paymentMethod === m.id ? '#0066FF' : '#6B7280'} />
            <Text style={[s.paymentLabel, paymentMethod === m.id && s.paymentLabelSelected]}>
              {m.label}
            </Text>
            {paymentMethod === m.id && (
              <Ionicons name="checkmark-circle" size={20} color="#0066FF" style={{ marginLeft: 'auto' }} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Price Breakdown */}
      <View style={s.card}>
        <Text style={s.cardTitle}>费用明细</Text>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>行程费用</Text>
          <Text style={s.priceValue}>¥{formatPrice(baseAmount)}</Text>
        </View>
        {appliedCouponDiscount > 0 && (
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>优惠券减免</Text>
            <Text style={s.discountValue}>-¥{formatPrice(appliedCouponDiscount)}</Text>
          </View>
        )}
        {promoDiscount > 0 && (
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>促销优惠</Text>
            <Text style={s.discountValue}>-¥{formatPrice(promoDiscount)}</Text>
          </View>
        )}
        <View style={[s.priceRow, s.totalRow]}>
          <Text style={s.totalLabel}>实付金额</Text>
          <Text style={s.totalValue}>¥{formatPrice(finalAmount)}</Text>
        </View>
      </View>

      {/* Submit */}
      <Pressable
        style={[s.submitBtn, submitting && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={s.submitBtnText}>立即支付 ¥{formatPrice(finalAmount)}</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  tripTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 13, color: '#6B7280' },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  verifyBtn: {
    backgroundColor: '#0066FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  verifyBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  couponSuccess: { color: '#22C55E', fontSize: 13, marginTop: 8 },
  couponErrorText: { color: '#EF4444', fontSize: 13, marginTop: 8 },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  promoItemSelected: { borderColor: '#0066FF', backgroundColor: '#EFF6FF' },
  promoLeft: { flex: 1 },
  promoName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  promoNameSelected: { color: '#0066FF' },
  promoDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  promoRemaining: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  promoBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  promoBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    gap: 10,
  },
  paymentItemSelected: { borderColor: '#0066FF', backgroundColor: '#EFF6FF' },
  paymentLabel: { fontSize: 15, color: '#374151' },
  paymentLabelSelected: { color: '#0066FF', fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, color: '#374151' },
  discountValue: { fontSize: 14, color: '#22C55E', fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#EF4444' },
  submitBtn: {
    backgroundColor: '#0066FF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
