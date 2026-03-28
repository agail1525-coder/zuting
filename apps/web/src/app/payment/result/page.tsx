"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchOrder, type OrderDetail } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

type ResultState = "loading" | "success" | "pending" | "failed";

const MAX_POLLS = 10;
const POLL_INTERVAL = 3000;

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<ResultState>("loading");
  const [error, setError] = useState("");
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const pollOrder = useCallback(async () => {
    if (!orderId) {
      setError(t("paymentResult.missingOrder"));
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
      if (status === "CANCELLED" || status === "REFUNDED") {
        setState("failed");
        return;
      }

      // Still pending
      setState("pending");
      pollCount.current += 1;
      if (pollCount.current < MAX_POLLS) {
        pollTimer.current = setTimeout(pollOrder, POLL_INTERVAL);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("paymentResult.queryFailed"));
      setState("failed");
    }
  }, [orderId]);

  useEffect(() => {
    pollOrder();
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [pollOrder]);

  // Loading
  if (state === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-temple-400 text-sm font-serif">{t("paymentResult.querying")}</p>
        </div>
      </div>
    );
  }

  // Success
  if (state === "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
            {/* Green checkmark */}
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-serif font-bold text-gradient-gold mb-2">
              {t("paymentResult.successTitle")}
            </h1>
            <p className="text-temple-400 text-sm mb-6">
              {t("paymentResult.successSubtitle")}
            </p>

            {order && (
              <div className="space-y-2 text-sm mb-8 text-left bg-temple-700/30 rounded-xl p-4 border border-temple-700/50">
                <div className="flex justify-between">
                  <span className="text-temple-400">{t("paymentResult.orderNo")}</span>
                  <span className="text-temple-200 font-mono text-xs">
                    {order.orderNo}
                  </span>
                </div>
                {order.trip?.title && (
                  <div className="flex justify-between">
                    <span className="text-temple-400">{t("paymentResult.trip")}</span>
                    <span className="text-temple-200">
                      {order.trip.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-temple-400">{t("paymentResult.amount")}</span>
                  <span className="text-gold font-semibold">
                    ¥{(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href={order?.tripId ? `/trips/${order.tripId}` : "/trips"}
                className="block w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors text-center"
              >
                {t("paymentResult.viewTrip")}
              </Link>
              <Link
                href="/orders"
                className="block text-temple-400 text-sm hover:text-gold transition-colors"
              >
                {t("paymentResult.viewAllOrders")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending
  if (state === "pending") {
    const reachedMax = pollCount.current >= MAX_POLLS;
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
            {!reachedMax ? (
              <div className="w-16 h-16 border-3 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-6" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}

            <h1 className="text-2xl font-serif font-bold text-temple-100 mb-2">
              {t("paymentResult.pendingTitle")}
            </h1>
            <p className="text-temple-400 text-sm mb-6">
              {reachedMax
                ? t("paymentResult.pendingTimeout")
                : t("paymentResult.pendingConfirming")}
            </p>

            {order && (
              <div className="text-sm text-temple-500 mb-6">
                {t("paymentResult.orderNo")}: {order.orderNo}
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors text-center"
              >
                {t("paymentResult.viewMyOrders")}
              </Link>
              <Link
                href="/"
                className="block text-temple-400 text-sm hover:text-gold transition-colors"
              >
                {t("paymentResult.backHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          {/* Red X */}
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-serif font-bold text-temple-100 mb-2">
            {t("paymentResult.failedTitle")}
          </h1>
          <p className="text-temple-400 text-sm mb-2">
            {error || t("paymentResult.failedDefault")}
          </p>

          {order && (
            <div className="text-sm text-temple-500 mb-6">
              {t("paymentResult.orderNo")}: {order.orderNo}
            </div>
          )}

          <div className="space-y-3 mt-6">
            {order?.tripId && (
              <Link
                href={`/trips/${order.tripId}/checkout`}
                className="block w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors text-center"
              >
                {t("paymentResult.retryPayment")}
              </Link>
            )}
            <Link
              href="/orders"
              className="block w-full py-3 rounded-xl bg-temple-700/40 border border-temple-600/30 text-temple-200 font-semibold hover:bg-temple-700/60 transition-colors text-center"
            >
              {t("paymentResult.viewOrders")}
            </Link>
            <Link
              href="/"
              className="block text-temple-400 text-sm hover:text-gold transition-colors"
            >
              {t("paymentResult.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
