"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchOrder, cancelOrder, type OrderDetail } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

type ResultState = "loading" | "success" | "failed" | "processing";

const MAX_POLLS = 20;
const POLL_INTERVAL = 3000;

export default function CheckoutResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<ResultState>("loading");
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const pollOrder = useCallback(async () => {
    if (!orderId) {
      setError(t("paymentResult.missingOrder") || "缺少订单ID");
      setState("failed");
      return;
    }
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
      const status = data.status?.toUpperCase();
      if (status === "PAID" || status === "COMPLETED") {
        setState("success");
        return;
      }
      if (status === "CANCELLED" || status === "REFUNDED" || status === "REFUNDING") {
        setState("failed");
        return;
      }
      // Still processing
      setState("processing");
      pollCount.current += 1;
      if (pollCount.current < MAX_POLLS) {
        pollTimer.current = setTimeout(pollOrder, POLL_INTERVAL);
      } else {
        // Timed out polling
        setState("failed");
        setError("支付确认超时，请前往订单页面查看状态");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("paymentResult.queryFailed") || "查询订单失败");
      setState("failed");
    }
  }, [orderId, t]);

  useEffect(() => {
    pollOrder();
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [pollOrder]);

  const handleCancelOrder = useCallback(async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消订单失败");
    } finally {
      setCancelling(false);
    }
  }, [orderId, router]);

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t("paymentResult.querying") || "查询支付状态..."}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("paymentResult.successTitle") || "支付成功"}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {t("paymentResult.successSubtitle") || "您的订单已确认，准备出发！"}
            </p>
            {order && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("paymentResult.orderNo") || "订单号"}</span>
                  <span className="text-gray-700 font-mono text-xs">{order.orderNo}</span>
                </div>
                {order.trip?.title && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("paymentResult.trip") || "行程"}</span>
                    <span className="text-gray-700">{order.trip.title}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("paymentResult.amount") || "支付金额"}</span>
                  <span className="text-[#0066FF] font-semibold">
                    ¥{(order.paidAmount ?? order.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">支付方式</span>
                    <span className="text-gray-700 capitalize">{order.paymentMethod}</span>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <Link
                href={order?.tripId ? `/trips/${order.tripId}` : "/trips"}
                className="block w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors"
              >
                {t("paymentResult.viewTrip") || "查看订单"}
              </Link>
              <Link
                href="/holy-sites"
                className="block w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                继续探索圣地
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (state === "processing") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 border-4 border-[#0066FF]/20 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("paymentResult.pendingTitle") || "支付处理中"}
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              {t("paymentResult.pendingConfirming") || "请稍候，正在确认支付..."}
            </p>
            <p className="text-gray-400 text-xs mb-6">
              已查询 {pollCount.current}/{MAX_POLLS} 次，请保持页面开启
            </p>
            {order && (
              <div className="text-sm text-gray-400 mb-6">
                {t("paymentResult.orderNo") || "订单号"}: {order.orderNo}
              </div>
            )}
            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors"
              >
                {t("paymentResult.viewMyOrders") || "查看我的订单"}
              </Link>
              <Link href="/" className="block text-gray-500 text-sm hover:text-[#0066FF] transition-colors">
                {t("paymentResult.backHome") || "返回首页"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("paymentResult.failedTitle") || "支付失败"}
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            {error || t("paymentResult.failedDefault") || "支付未成功，请重试"}
          </p>
          {order && (
            <div className="text-xs text-gray-400 mb-6">
              {t("paymentResult.orderNo") || "订单号"}: {order.orderNo}
            </div>
          )}
          <div className="space-y-3 mt-6">
            {order?.tripId && (
              <Link
                href={`/checkout?tripId=${order.tripId}`}
                className="block w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors"
              >
                {t("paymentResult.retryPayment") || "重新支付"}
              </Link>
            )}
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="block w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? "取消中..." : t("paymentResult.cancelOrder") || "取消订单"}
            </button>
            <Link href="/orders" className="block text-gray-500 text-sm hover:text-[#0066FF] transition-colors">
              {t("paymentResult.viewOrders") || "查看全部订单"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
