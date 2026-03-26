"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

interface TripSite {
  id: string;
  order: number;
  holySite: {
    id: string;
    name: string;
    nameEn: string;
    country: string;
    emoji?: string;
  };
}

interface TripDetail {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  persons: number;
  totalBudget: number | null;
  contactName: string | null;
  contactPhone: string | null;
  note: string | null;
  status: string;
  sites: TripSite[];
}

type PaymentGateway = "wechat" | "alipay" | "stripe";

const PAYMENT_METHODS: { key: PaymentGateway; label: string; icon: string }[] = [
  { key: "wechat", label: "微信支付", icon: "💚" },
  { key: "alipay", label: "支付宝", icon: "🔵" },
  { key: "stripe", label: "Stripe", icon: "💳" },
];

export default function CheckoutPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
    const fetchTrip = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("行程加载失败");
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId, user]);

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponVerifying(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/coupons/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "优惠码无效");
      }
      const data = await res.json();
      setCouponDiscount(data.discount || 0);
    } catch (err) {
      setCouponDiscount(0);
      setCouponError(err instanceof Error ? err.message : "验证失败");
    } finally {
      setCouponVerifying(false);
    }
  };

  const handleSubmitOrder = async () => {
    setError("");
    setSubmitting(true);
    try {
      const token = getAccessToken();

      // Step 1: Create order
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tripId }),
      });
      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.message || "创建订单失败");
      }
      const order = await orderRes.json();

      // Step 2: Create payment
      const paymentRes = await fetch(`${API_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, gateway }),
      });
      if (!paymentRes.ok) {
        const data = await paymentRes.json();
        throw new Error(data.message || "创建支付失败");
      }

      // Redirect to payment result
      router.push(`/payment/result?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交订单失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error && !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">{error}</h1>
        <Link
          href={`/trips/${tripId}`}
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回行程详情
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  const totalAmount = trip.totalBudget || 0;
  const discountAmount = couponDiscount;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href={`/trips/${tripId}`}
        className="inline-flex items-center gap-1 text-sm text-temple-400 hover:text-gold transition-colors mb-6"
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
        返回行程详情
      </Link>

      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🧾</div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">
          订单确认
        </h1>
        <p className="text-temple-400 text-sm mt-2">
          请核实行程信息并完成支付
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Trip Summary */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          行程概要
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-temple-400">行程名称</span>
            <span className="text-temple-100 font-medium">{trip.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-temple-400">出行日期</span>
            <span className="text-temple-200">
              {trip.startDate} ~ {trip.endDate}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-temple-400">出行人数</span>
            <span className="text-temple-200">{trip.persons} 人</span>
          </div>
        </div>

        {/* Sites */}
        {trip.sites && trip.sites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-temple-700/50">
            <p className="text-sm text-temple-400 mb-2">
              朝圣圣地 ({trip.sites.length} 处)
            </p>
            <div className="flex flex-wrap gap-2">
              {trip.sites.map((site) => (
                <span
                  key={site.id || site.order}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-temple-700/40 border border-temple-600/30 text-xs text-temple-200"
                >
                  {site.holySite?.emoji && (
                    <span>{site.holySite.emoji}</span>
                  )}
                  {site.holySite?.name || `圣地 ${site.order}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {(trip.contactName || trip.contactPhone) && (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
            联系信息
          </h2>
          <div className="space-y-3">
            {trip.contactName && (
              <div className="flex justify-between text-sm">
                <span className="text-temple-400">联系人</span>
                <span className="text-temple-200">{trip.contactName}</span>
              </div>
            )}
            {trip.contactPhone && (
              <div className="flex justify-between text-sm">
                <span className="text-temple-400">联系电话</span>
                <span className="text-temple-200">{trip.contactPhone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          支付方式
        </h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.key}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                gateway === method.key
                  ? "bg-gold/10 border-gold/40"
                  : "bg-temple-700/30 border-temple-700/50 hover:border-temple-600"
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
                    ? "border-gold"
                    : "border-temple-500"
                }`}
              >
                {gateway === method.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                )}
              </div>
              <span className="text-lg">{method.icon}</span>
              <span
                className={`text-sm font-medium ${
                  gateway === method.key
                    ? "text-gold"
                    : "text-temple-200"
                }`}
              >
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Coupon Code */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          优惠码
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
            placeholder="输入优惠码（选填）"
            className="flex-1 px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
          />
          <button
            onClick={handleVerifyCoupon}
            disabled={couponVerifying || !couponCode.trim()}
            className="px-5 py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold text-sm hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {couponVerifying ? "验证中..." : "验证"}
          </button>
        </div>
        {couponError && (
          <p className="text-red-400 text-xs mt-2">{couponError}</p>
        )}
        {couponDiscount > 0 && (
          <p className="text-green-400 text-xs mt-2">
            优惠码有效，已减免 ¥{couponDiscount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          费用明细
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-temple-400">行程费用</span>
            <span className="text-temple-200">
              ¥{totalAmount.toFixed(2)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-temple-400">优惠减免</span>
              <span className="text-green-400">
                -¥{discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-temple-700/50 flex justify-between">
            <span className="text-temple-200 font-semibold">应付总额</span>
            <span className="text-xl font-bold text-gold">
              ¥{finalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmitOrder}
        disabled={submitting}
        className="w-full py-4 rounded-2xl bg-gold text-temple-900 font-bold text-lg hover:bg-gold-light transition-colors shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-temple-900/30 border-t-temple-900 rounded-full animate-spin" />
            处理中...
          </span>
        ) : (
          `确认支付 ¥${finalAmount.toFixed(2)}`
        )}
      </button>

      <p className="text-center text-temple-500 text-xs mt-4">
        提交订单即表示您同意《祖庭旅行服务协议》
      </p>
    </div>
  );
}
