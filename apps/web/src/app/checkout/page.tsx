"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchTrip,
  verifyCoupon,
  createOrder,
  createPayment,
  fetchPromotions,
  verifyPromotion,
  type TripDetail,
  type PromotionItem,
} from "@/lib/api";

type PaymentGateway = "wechat" | "alipay" | "stripe";

function formatPrice(amount: number): string {
  return `¥${(amount / 100).toFixed(2)}`;
}

function Countdown({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono text-red-500 font-semibold">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId") ?? "";
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const PAYMENT_METHODS: { key: PaymentGateway; label: string; icon: string }[] = [
    { key: "wechat", label: t("payment.wechat") || "微信支付", icon: "💚" },
    { key: "alipay", label: t("payment.alipay") || "支付宝", icon: "🔵" },
    { key: "stripe", label: t("payment.stripe") || "Stripe 国际卡", icon: "💳" },
  ];

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState<PaymentGateway>("wechat");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponVerifying, setCouponVerifying] = useState(false);

  // Promotion state
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");
  const [promotionDiscount, setPromotionDiscount] = useState(0);

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  // 15-min countdown (900 seconds)
  const [countdown, setCountdown] = useState(900);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!user || !tripId) return;
    const load = async () => {
      try {
        const [tripData, promoData] = await Promise.all([
          fetchTrip(tripId),
          fetchPromotions(undefined, 1).catch(() => ({ items: [], total: 0 })),
        ]);
        setTrip(tripData);
        setPromotions(promoData.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error") || "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId, user, t]);

  const totalAmount = (trip?.totalBudget ?? 0) * 100; // convert to cents for display

  const handleVerifyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponValid(false);
    setCouponDiscount(0);
    setCouponVerifying(true);
    try {
      const result = await verifyCoupon(couponCode.trim(), trip?.totalBudget ?? 0);
      if (result.valid) {
        setCouponDiscount((result.discount ?? 0) * 100);
        setCouponValid(true);
      } else {
        setCouponError(result.reason ?? (t("checkout.couponInvalid") || "优惠券无效"));
      }
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : t("common.error") || "验证失败");
    } finally {
      setCouponVerifying(false);
    }
  }, [couponCode, trip, t]);

  const handleSelectPromotion = useCallback(
    async (promoId: string) => {
      if (selectedPromotion === promoId) {
        setSelectedPromotion("");
        setPromotionDiscount(0);
        return;
      }
      setSelectedPromotion(promoId);
      try {
        const result = await verifyPromotion(promoId, trip?.totalBudget ?? 0);
        if (result.valid) {
          setPromotionDiscount((result.discount ?? 0) * 100);
        } else {
          setSelectedPromotion("");
          setPromotionDiscount(0);
        }
      } catch {
        setSelectedPromotion("");
        setPromotionDiscount(0);
      }
    },
    [selectedPromotion, trip]
  );

  const handleSubmit = useCallback(async () => {
    if (!trip) return;
    setError("");
    setSubmitting(true);
    try {
      const finalAmount = Math.max(
        0,
        (trip.totalBudget ?? 0) - couponDiscount / 100 - promotionDiscount / 100
      );
      const order = await createOrder({
        tripId,
        totalAmount: finalAmount,
        paymentMethod: gateway,
        couponCode: couponValid ? couponCode : undefined,
        promotionId: selectedPromotion || undefined,
      });
      await createPayment(order.id, gateway);
      router.push(`/checkout/result?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error") || "提交失败");
    } finally {
      setSubmitting(false);
    }
  }, [trip, tripId, gateway, couponValid, couponCode, couponDiscount, promotionDiscount, selectedPromotion, router, t]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("common.loading") || "加载中..."}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!tripId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-700 mb-4">缺少行程信息</h1>
        <Link href="/trips" className="text-[#0066FF] hover:underline">
          返回行程列表
        </Link>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-700 mb-4">{error}</h1>
        <Link href={`/trips/${tripId}`} className="text-[#0066FF] hover:underline">
          {t("checkout.backToTrip") || "返回行程"}
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  const rawTotal = trip.totalBudget ?? 0;
  const totalCents = rawTotal * 100;
  const discountCents = couponDiscount + promotionDiscount;
  const finalCents = Math.max(0, totalCents - discountCents);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back + Countdown */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("checkout.backToTrip") || "返回行程"}
        </Link>
        {countdown > 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            结账剩余时间 <Countdown seconds={countdown} />
          </div>
        ) : (
          <span className="text-sm text-red-500">结账会话已超时，请重新发起</span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {t("checkout.title") || "确认支付"}
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Trip Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">行程摘要</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.tripName") || "行程名称"}</span>
                <span className="text-gray-900 font-medium">{trip.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.travelDate") || "出行日期"}</span>
                <span className="text-gray-700">
                  {trip.startDate ?? "待定"} ~ {trip.endDate ?? "待定"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.travelers") || "出行人数"}</span>
                <span className="text-gray-700">{trip.persons ?? 1} 人</span>
              </div>
            </div>
            {trip.sites && trip.sites.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">
                  {t("checkout.holySites") || "朝圣圣地"} ({trip.sites.length} 处)
                </p>
                <div className="flex flex-wrap gap-2">
                  {trip.sites.map((ts) => (
                    <span
                      key={ts.id}
                      className="px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700 border border-blue-100"
                    >
                      {ts.site?.name ?? `圣地 ${ts.order}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {t("checkout.priceBreakdown") || "价格明细"}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">原价</span>
                <span className="text-gray-700">¥{rawTotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">优惠券折扣</span>
                  <span className="text-green-600">-¥{(couponDiscount / 100).toFixed(2)}</span>
                </div>
              )}
              {promotionDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">促销优惠</span>
                  <span className="text-green-600">-¥{(promotionDiscount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-semibold text-gray-900">
                  {t("checkout.totalDue") || "应付总价"}
                </span>
                <div className="text-right">
                  {discountCents > 0 && (
                    <span className="text-xs text-gray-400 line-through mr-2">
                      ¥{rawTotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-red-500">
                    ¥{(finalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Coupon Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {t("checkout.couponCode") || "优惠券"}
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError("");
                  setCouponValid(false);
                  setCouponDiscount(0);
                }}
                placeholder={t("checkout.couponPlaceholder") || "输入优惠券码"}
                className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
              <button
                onClick={handleVerifyCoupon}
                disabled={couponVerifying || !couponCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] text-sm font-semibold hover:bg-[#0066FF]/20 transition-colors disabled:opacity-40"
              >
                {couponVerifying ? "验证中..." : t("checkout.verify") || "验证"}
              </button>
            </div>
            {couponError && (
              <p className="text-red-500 text-xs mt-2">{couponError}</p>
            )}
            {couponValid && (
              <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                优惠券有效，节省 ¥{(couponDiscount / 100).toFixed(2)}
              </p>
            )}
            <div className="mt-3">
              <Link href="/coupons" className="text-xs text-[#0066FF] hover:underline">
                查看我的优惠券
              </Link>
            </div>
          </div>

          {/* Available Promotions */}
          {promotions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">可用促销活动</h2>
              <div className="space-y-3">
                {promotions.slice(0, 3).map((promo) => (
                  <label
                    key={promo.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPromotion === promo.id
                        ? "bg-[#0066FF]/5 border-[#0066FF]/40"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPromotion === promo.id}
                      onChange={() => handleSelectPromotion(promo.id)}
                      className="mt-0.5 accent-[#0066FF]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{promo.name}</p>
                      {promo.description && (
                        <p className="text-xs text-gray-500 truncate">{promo.description}</p>
                      )}
                      <p className="text-xs text-orange-500 mt-0.5">
                        {promo.discountType === "PERCENT"
                          ? `${promo.discountValue}% 折扣`
                          : `减 ¥${(promo.discountValue / 100).toFixed(0)}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <Link href="/promotions" className="text-xs text-[#0066FF] hover:underline mt-3 block">
                查看全部促销
              </Link>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {t("checkout.paymentMethod") || "支付方式"}
            </h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    gateway === method.key
                      ? "bg-[#0066FF]/5 border-[#0066FF]/40"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="gateway"
                    value={method.key}
                    checked={gateway === method.key}
                    onChange={() => setGateway(method.key)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      gateway === method.key ? "border-[#0066FF]" : "border-gray-400"
                    }`}
                  >
                    {gateway === method.key && (
                      <div className="w-2 h-2 rounded-full bg-[#0066FF]" />
                    )}
                  </div>
                  <span className="text-base">{method.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      gateway === method.key ? "text-[#0066FF]" : "text-gray-700"
                    }`}
                  >
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || countdown <= 0}
            className="w-full py-4 rounded-2xl bg-[#0066FF] text-white font-bold text-base hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("checkout.processing") || "处理中..."}
              </span>
            ) : (
              `${t("checkout.confirmPay") || "确认支付"} ¥${(finalCents / 100).toFixed(2)}`
            )}
          </button>

          <p className="text-center text-gray-400 text-xs">
            {t("checkout.agreementText") || "点击支付即表示您同意我们的服务条款和隐私政策"}
          </p>
        </div>
      </div>
    </div>
  );
}
