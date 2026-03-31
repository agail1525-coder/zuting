"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import MobileNav from "@/components/MobileNav";
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

function Countdown({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono text-red-500 font-semibold">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

const TRUST_BADGES = [
  { icon: "🔒", label: "SSL加密" },
  { icon: "🛡️", label: "安全支付" },
  { icon: "✅", label: "退款保障" },
  { icon: "📞", label: "7×24客服" },
];

const ADD_ONS = [
  { id: "insurance", icon: "🛡️", name: "旅行保险", desc: "行程取消/延误/医疗全覆盖", price: 9900 },
  { id: "transfer", icon: "🚗", name: "接送机服务", desc: "专车接送，无缝衔接", price: 19900 },
  { id: "guide", icon: "🎧", name: "专属导览", desc: "AI语音导览+真人讲解", price: 4900 },
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId") ?? "";
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Steps
  const [step, setStep] = useState(1);
  const STEPS = [
    { num: 1, label: t("checkout.stepReview") || "确认行程" },
    { num: 2, label: t("checkout.stepPayment") || "选择支付" },
    { num: 3, label: t("checkout.stepConfirm") || "确认下单" },
  ];

  const PAYMENT_METHODS: { key: PaymentGateway; label: string; icon: string; desc: string }[] = [
    { key: "wechat", label: t("payment.wechat"), icon: "💚", desc: "微信扫码支付" },
    { key: "alipay", label: t("payment.alipay"), icon: "🔵", desc: "支付宝快捷支付" },
    { key: "stripe", label: t("payment.stripe"), icon: "💳", desc: "Visa/Mastercard/银联" },
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

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  // Traveler info
  const [travelerName, setTravelerName] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [travelerNote, setTravelerNote] = useState("");

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
        // Pre-fill traveler name from user
        if (user.nickname) setTravelerName(user.nickname);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId, user, t]);

  const addOnTotal = Array.from(selectedAddOns).reduce((sum, id) => {
    const addon = ADD_ONS.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);

  const rawTotal = trip?.totalBudget ?? 0;
  const totalCents = rawTotal * 100;
  const discountCents = couponDiscount + promotionDiscount;
  const finalCents = Math.max(0, totalCents - discountCents + addOnTotal);

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
        setCouponError(result.reason ?? t("checkout.couponInvalid"));
      }
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : t("checkout.verifyError"));
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

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!trip) return;
    setError("");
    setSubmitting(true);
    try {
      const finalAmount = Math.max(
        0,
        (trip.totalBudget ?? 0) - couponDiscount / 100 - promotionDiscount / 100 + addOnTotal / 100
      );
      const order = await createOrder({
        tripId,
        totalAmount: finalAmount,
        paymentMethod: gateway,
        couponCode: couponValid ? couponCode : undefined,
        promotionId: selectedPromotion || undefined,
      });
      await createPayment(order.id, gateway);
      toast.success(t("checkout.orderCreated") || "订单创建成功");
      router.push(`/checkout/result?orderId=${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("checkout.submitError"));
      setError(err instanceof Error ? err.message : t("checkout.submitError"));
    } finally {
      setSubmitting(false);
    }
  }, [trip, tripId, gateway, couponValid, couponCode, couponDiscount, promotionDiscount, addOnTotal, selectedPromotion, router, t]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!tripId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-700 mb-4">{t("checkout.missingTrip")}</h1>
        <Link href="/trips" className="text-[#0066FF] hover:underline">
          {t("checkout.backToTrips")}
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
          {t("checkout.backToTrip")}
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar: Back + Countdown */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/trips/${tripId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("checkout.backToTrip")}
          </Link>
          {countdown > 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("checkout.checkoutTimeout")} <Countdown seconds={countdown} />
            </div>
          ) : (
            <span className="text-sm text-red-500">{t("checkout.sessionExpired")}</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s.num
                      ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-[#0066FF]" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? "bg-[#0066FF]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {step === 1 && (t("checkout.stepReview") || "确认行程信息")}
          {step === 2 && (t("checkout.stepPayment") || "选择支付方式")}
          {step === 3 && (t("checkout.stepConfirm") || "确认并支付")}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm max-w-4xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column (3/5) — Step content */}
          <div className="lg:col-span-3 space-y-5">

            {/* === STEP 1: Review === */}
            {step === 1 && (
              <>
                {/* Trip Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🏛 {t("checkout.tripSummaryTitle")}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("checkout.tripName")}</span>
                      <span className="text-gray-900 font-medium">{trip.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("checkout.travelDate")}</span>
                      <span className="text-gray-700">
                        {trip.startDate ?? t("checkout.pending")} ~ {trip.endDate ?? t("checkout.pending")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("checkout.travelers")}</span>
                      <span className="text-gray-700">{trip.persons ?? 1} {t("checkout.persons")}</span>
                    </div>
                  </div>
                  {trip.sites && trip.sites.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">
                        {t("checkout.holySites")} ({trip.sites.length} {t("checkout.sites")})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trip.sites.map((ts) => (
                          <span
                            key={ts.id}
                            className="px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700 border border-blue-100"
                          >
                            {ts.site?.name ?? `#${ts.order}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Traveler Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    👤 旅客信息
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">联系人姓名</label>
                      <input
                        type="text"
                        value={travelerName}
                        onChange={(e) => setTravelerName(e.target.value)}
                        placeholder="请输入出行人姓名"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">联系电话</label>
                      <input
                        type="tel"
                        value={travelerPhone}
                        onChange={(e) => setTravelerPhone(e.target.value)}
                        placeholder="请输入手机号码"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">备注 (可选)</label>
                      <textarea
                        value={travelerNote}
                        onChange={(e) => setTravelerNote(e.target.value)}
                        placeholder="特殊需求、饮食禁忌等..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Add-on Services (对标Expedia/Trip.com) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    ✨ 增值服务
                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">推荐</span>
                  </h2>
                  <div className="space-y-3">
                    {ADD_ONS.map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedAddOns.has(addon.id)
                            ? "bg-[#0066FF]/5 border-[#0066FF]/40"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddOns.has(addon.id)}
                          onChange={() => toggleAddOn(addon.id)}
                          className="mt-0.5 accent-[#0066FF]"
                        />
                        <span className="text-xl">{addon.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                            <span className="text-sm font-semibold text-[#0066FF]">¥{(addon.price / 100).toFixed(0)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{addon.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cancellation Policy (对标Booking.com) */}
                <div className="bg-green-50/50 rounded-2xl border border-green-200/50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">📋</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">取消政策</h3>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          出发前7天以上免费取消
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          出发前3-7天取消收取30%费用
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          出发前3天内不可取消
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-[#0066FF] text-white font-bold text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
                >
                  下一步：选择支付方式 →
                </button>
              </>
            )}

            {/* === STEP 2: Payment === */}
            {step === 2 && (
              <>
                {/* Coupon */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🎫 {t("checkout.couponCode")}
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
                      placeholder={t("checkout.couponPlaceholder")}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                    />
                    <button
                      onClick={handleVerifyCoupon}
                      disabled={couponVerifying || !couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] text-sm font-semibold hover:bg-[#0066FF]/20 transition-colors disabled:opacity-40"
                    >
                      {couponVerifying ? t("checkout.verifying") : t("checkout.verify")}
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
                      {t("checkout.couponValidMsg", { amount: (couponDiscount / 100).toFixed(2) })}
                    </p>
                  )}
                  <div className="mt-3">
                    <Link href="/coupons" className="text-xs text-[#0066FF] hover:underline">
                      {t("checkout.viewMyCoupons")}
                    </Link>
                  </div>
                </div>

                {/* Promotions */}
                {promotions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      🔥 {t("checkout.availablePromotions")}
                    </h2>
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
                                ? t("checkout.percentDiscount", { value: promo.discountValue })
                                : t("checkout.fixedDiscount", { value: (promo.discountValue / 100).toFixed(0) })}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <Link href="/promotions" className="text-xs text-[#0066FF] hover:underline mt-3 block">
                      {t("checkout.viewAllPromotions")}
                    </Link>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    💳 {t("checkout.paymentMethod")}
                  </h2>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.key}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          gateway === method.key
                            ? "bg-[#0066FF]/5 border-[#0066FF]/40 shadow-sm"
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
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            gateway === method.key ? "border-[#0066FF]" : "border-gray-300"
                          }`}
                        >
                          {gateway === method.key && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                          )}
                        </div>
                        <span className="text-xl">{method.icon}</span>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${gateway === method.key ? "text-[#0066FF]" : "text-gray-700"}`}>
                            {method.label}
                          </span>
                          <p className="text-xs text-gray-400">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trust badges inline */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {TRUST_BADGES.map((badge) => (
                    <div key={badge.label} className="flex items-center gap-1 text-xs text-gray-400">
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    ← 返回上一步
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] py-3.5 rounded-2xl bg-[#0066FF] text-white font-bold text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
                  >
                    下一步：确认订单 →
                  </button>
                </div>
              </>
            )}

            {/* === STEP 3: Confirm === */}
            {step === 3 && (
              <>
                {/* Order Review Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">📝 订单确认</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">行程</span>
                      <span className="text-gray-900 font-medium">{trip.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">日期</span>
                      <span className="text-gray-700">{trip.startDate ?? "待定"} ~ {trip.endDate ?? "待定"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">人数</span>
                      <span className="text-gray-700">{trip.persons ?? 1}人</span>
                    </div>
                    {travelerName && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">联系人</span>
                        <span className="text-gray-700">{travelerName}</span>
                      </div>
                    )}
                    {travelerPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">电话</span>
                        <span className="text-gray-700">{travelerPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">支付方式</span>
                      <span className="text-gray-700">
                        {PAYMENT_METHODS.find((m) => m.key === gateway)?.icon}{" "}
                        {PAYMENT_METHODS.find((m) => m.key === gateway)?.label}
                      </span>
                    </div>
                  </div>

                  {selectedAddOns.size > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">增值服务</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(selectedAddOns).map((id) => {
                          const addon = ADD_ONS.find((a) => a.id === id);
                          if (!addon) return null;
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-full bg-purple-50 text-xs text-purple-700 border border-purple-100">
                              {addon.icon} {addon.name} ¥{(addon.price / 100).toFixed(0)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {travelerNote && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">备注</p>
                      <p className="text-sm text-gray-600">{travelerNote}</p>
                    </div>
                  )}
                </div>

                {/* Guarantee section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
                  <h3 className="text-sm font-semibold mb-3">🛡️ 预订保障</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400">✓</span> 价格保障，买贵退差
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400">✓</span> 随时退改，灵活安排
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400">✓</span> 真实评价，透明可信
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400">✓</span> 全程客服，安心出行
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    ← 修改支付
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || countdown <= 0}
                    className="flex-[2] py-4 rounded-2xl bg-[#0066FF] text-white font-bold text-base hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("checkout.processing")}
                      </span>
                    ) : (
                      `${t("checkout.confirmPay")} ¥${(finalCents / 100).toFixed(2)}`
                    )}
                  </button>
                </div>

                <p className="text-center text-gray-400 text-xs">
                  {t("checkout.agreementText")}
                </p>
              </>
            )}
          </div>

          {/* Right Column (2/5) — Sticky Order Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-5">
              {/* Price Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  {t("checkout.priceBreakdown")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("checkout.originalPrice")}</span>
                    <span className="text-gray-700">¥{rawTotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("checkout.couponDiscountLabel")}</span>
                      <span className="text-green-600">-¥{(couponDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("checkout.promotionDiscount")}</span>
                      <span className="text-green-600">-¥{(promotionDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {addOnTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">增值服务</span>
                      <span className="text-gray-700">+¥{(addOnTotal / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                    <span className="font-semibold text-gray-900">
                      {t("checkout.totalDue")}
                    </span>
                    <div className="text-right">
                      {(discountCents > 0 || addOnTotal > 0) && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          ¥{rawTotal.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-red-500">
                        ¥{(finalCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {discountCents > 0 && (
                    <p className="text-xs text-green-600 text-right">
                      已省 ¥{(discountCents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Mini trip card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
                    🏛
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{trip.title}</p>
                    <p className="text-xs text-gray-400">
                      {trip.sites?.length ?? 0} 个圣地 · {trip.persons ?? 1}人
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust badges card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="grid grid-cols-2 gap-3">
                  {TRUST_BADGES.map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-base">{badge.icon}</span>
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <div className="text-center text-xs text-gray-400 space-y-1">
                <p>遇到问题？</p>
                <Link href="/chat" className="text-[#0066FF] hover:underline">
                  联系在线客服 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
