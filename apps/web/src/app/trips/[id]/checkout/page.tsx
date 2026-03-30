"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchTrip,
  verifyCoupon,
  createOrder,
  createPayment,
  type TripDetail,
} from "@/lib/api";
import MobileNav from "@/components/MobileNav";

type PaymentGateway = "wechat" | "alipay" | "stripe";

export default function CheckoutPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const PAYMENT_METHODS: { key: PaymentGateway; label: string; icon: string }[] = [
    { key: "wechat", label: t("payment.wechat"), icon: "💚" },
    { key: "alipay", label: t("payment.alipay"), icon: "🔵" },
    { key: "stripe", label: t("payment.stripe"), icon: "💳" },
  ];

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState<PaymentGateway>("wechat");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponVerifying, setCouponVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const loadTrip = async () => {
      try {
        const data = await fetchTrip(tripId);
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [tripId, user]);

  const totalAmount = trip?.totalBudget ?? 0;

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponVerifying(true);
    try {
      const data = await verifyCoupon(couponCode.trim(), totalAmount);
      setCouponDiscount(data.discount ?? 0);
    } catch (err) {
      setCouponDiscount(0);
      setCouponError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setCouponVerifying(false);
    }
  };

  const handleSubmitOrder = async () => {
    setError("");
    setSubmitting(true);
    try {
      const finalAmount = Math.max(0, totalAmount - couponDiscount);

      // Step 1: Create order
      const order = await createOrder({
        tripId,
        totalAmount: finalAmount,
      });

      // Step 2: Create payment
      await createPayment(order.id, gateway);

      // Redirect to payment result
      router.push(`/payment/result?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-serif">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error && !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-2xl font-serif text-gray-700 mb-4">{error}</h1>
        <Link
          href={`/trips/${tripId}`}
          className="text-[#0066FF] hover:text-[#0052CC] transition-colors"
        >
          {t("checkout.backToTrip")}
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  const discountAmount = couponDiscount;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href={`/trips/${tripId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {t("checkout.backToTrip")}
      </Link>

      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🧾</div>
        <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
          {t("checkout.title")}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {t("checkout.subtitle")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Trip Summary */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("checkout.tripSummary")}
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

        {/* Sites */}
        {trip.sites && trip.sites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              {t("checkout.holySites")} ({trip.sites.length} {t("checkout.sites")})
            </p>
            <div className="flex flex-wrap gap-2">
              {trip.sites.map((tripSite) => (
                <span
                  key={tripSite.id || tripSite.order}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700"
                >
                  {tripSite.site?.name || `${t("checkout.holySites")} ${tripSite.order}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {(trip.contactName || trip.contactPhone) && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
            {t("checkout.contactInfo")}
          </h2>
          <div className="space-y-3">
            {trip.contactName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.contactPerson")}</span>
                <span className="text-gray-700">{trip.contactName}</span>
              </div>
            )}
            {trip.contactPhone && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.contactPhone")}</span>
                <span className="text-gray-700">{trip.contactPhone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("checkout.paymentMethod")}
        </h2>
        <div className="space-y-3">
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
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  gateway === method.key
                    ? "border-[#0066FF]"
                    : "border-gray-400"
                }`}
              >
                {gateway === method.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                )}
              </div>
              <span className="text-lg">{method.icon}</span>
              <span
                className={`text-sm font-medium ${
                  gateway === method.key
                    ? "text-[#0066FF]"
                    : "text-gray-700"
                }`}
              >
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Coupon Code */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("checkout.couponCode")}
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponError("");
              setCouponDiscount(0);
            }}
            placeholder={t("checkout.couponPlaceholder")}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
          />
          <button
            onClick={handleVerifyCoupon}
            disabled={couponVerifying || !couponCode.trim()}
            className="px-5 py-3 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] font-semibold text-sm hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {couponVerifying ? t("checkout.verifying") : t("checkout.verify")}
          </button>
        </div>
        {couponError && (
          <p className="text-red-400 text-xs mt-2">{couponError}</p>
        )}
        {couponDiscount > 0 && (
          <p className="text-green-400 text-xs mt-2">
            {t("checkout.couponValid")} ¥{couponDiscount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("checkout.priceBreakdown")}
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("checkout.tripFee")}</span>
            <span className="text-gray-700">
              ¥{totalAmount.toFixed(2)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("checkout.couponDiscount")}</span>
              <span className="text-green-400">
                -¥{discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-gray-700 font-semibold">{t("checkout.totalDue")}</span>
            <span className="text-xl font-bold text-[#0066FF]">
              ¥{finalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmitOrder}
        disabled={submitting}
        className="w-full py-4 rounded-2xl bg-[#0066FF] text-white font-bold text-lg hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("checkout.processing")}
          </span>
        ) : (
          `${t("checkout.confirmPay")} ¥${finalAmount.toFixed(2)}`
        )}
      </button>

      <p className="text-center text-gray-400 text-xs mt-4">
        {t("checkout.agreementText")}
      </p>
      <MobileNav />
    </div>
  );
}
