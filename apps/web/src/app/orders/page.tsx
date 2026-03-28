"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchOrders,
  fetchOrder,
  cancelOrder,
  refundOrder,
  type OrderDetail,
} from "@/lib/api";

const STATUS_STYLE: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  PENDING: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  PAID: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  CANCELLED: { color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" },
  REFUNDING: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  REFUNDED: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  COMPLETED: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const DEFAULT_STYLE = { color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" };

function getStatusStyle(status: string) {
  const upper = status?.toUpperCase() || "";
  return STATUS_STYLE[upper] || DEFAULT_STYLE;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(cents: number | null | undefined) {
  return `¥${((cents ?? 0) / 100).toFixed(2)}`;
}

const PAYMENT_METHOD_I18N: Record<string, string> = {
  wechat: "orders.paymentWechat",
  alipay: "orders.paymentAlipay",
  stripe: "orders.paymentStripe",
  bank_transfer: "orders.paymentBankTransfer",
};

// --- Confirmation Modal ---
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {loading ? t("orders.processing") : t("orders.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Order Detail Drawer ---
function OrderDrawer({
  order,
  onClose,
  onAction,
}: {
  order: OrderDetail | null;
  onClose: () => void;
  onAction: () => void;
}) {
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    type: "cancel" | "refund";
  } | null>(null);

  if (!order) return null;

  const sc = getStatusStyle(order.status);
  const statusLabel = t(`order.status.${order.status?.toUpperCase() || "PENDING"}`);
  const upperStatus = order.status?.toUpperCase() || "";
  const canCancel = upperStatus === "PENDING";
  const canRefund = upperStatus === "PAID";

  const handleAction = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    setActionError("");
    try {
      if (confirmModal.type === "cancel") {
        await cancelOrder(order.id);
      } else {
        await refundOrder(order.id);
      }
      setConfirmModal(null);
      onAction();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t("orders.actionFailed")
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Status timeline events
  const timelineEvents: Array<{
    label: string;
    time: string | null;
    done: boolean;
  }> = [
    { label: t("orders.timeline.created"), time: order.createdAt, done: true },
    {
      label: t("orders.timeline.paid"),
      time: order.paidAt,
      done: !!order.paidAt,
    },
  ];
  if (order.cancelledAt) {
    timelineEvents.push({
      label: t("orders.timeline.cancelled"),
      time: order.cancelledAt,
      done: true,
    });
  }
  if (order.refundedAt) {
    timelineEvents.push({
      label: t("orders.timeline.refunded"),
      time: order.refundedAt,
      done: true,
    });
  }
  if (upperStatus === "REFUNDING") {
    timelineEvents.push({ label: t("orders.timeline.refunding"), time: null, done: false });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-gray-200 overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-900">
              {t("orders.drawerTitle")}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${sc.color} ${sc.bg} ${sc.border}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Order Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <InfoRow label={t("orders.orderNo")} value={order.orderNo} mono />
              <InfoRow label={t("orders.totalAmount")} value={formatAmount(order.totalAmount)} highlight />
              {order.paidAmount != null && (
                <InfoRow
                  label={t("orders.paidAmount")}
                  value={formatAmount(order.paidAmount)}
                />
              )}
              <InfoRow
                label={t("orders.paymentMethod")}
                value={
                  order.paymentMethod
                    ? t(PAYMENT_METHOD_I18N[order.paymentMethod] || order.paymentMethod)
                    : t("orders.paymentNotSelected")
                }
              />
              <InfoRow
                label={t("orders.createdTime")}
                value={formatDateTime(order.createdAt)}
              />
              {order.paidAt && (
                <InfoRow
                  label={t("orders.paidTime")}
                  value={formatDateTime(order.paidAt)}
                />
              )}
              {order.cancelledAt && (
                <InfoRow
                  label={t("orders.cancelledTime")}
                  value={formatDateTime(order.cancelledAt)}
                />
              )}
              {order.refundedAt && (
                <InfoRow
                  label={t("orders.refundedTime")}
                  value={formatDateTime(order.refundedAt)}
                />
              )}
            </div>
          </div>

          {/* Associated Trip */}
          {order.trip && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                {t("orders.associatedTrip")}
              </h3>
              <Link
                href={`/trips/${order.trip.id}`}
                className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-[#0066FF]/10"
              >
                <p className="text-gray-900 font-medium">
                  {order.trip.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("orders.statusLabel")}: {t(`order.status.${order.trip.status?.toUpperCase() || "PENDING"}`)}
                </p>
                {Array.isArray(order.trip.sites) &&
                  order.trip.sites.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t("orders.routePrefix")}:{" "}
                      {order.trip.sites
                        .map((s) => s.site.name)
                        .join(" → ")}
                    </p>
                  )}
              </Link>
            </div>
          )}

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              {t("orders.statusTimeline")}
            </h3>
            <div className="space-y-0">
              {timelineEvents.map((evt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        evt.done
                          ? "bg-[#0066FF]"
                          : "bg-gray-200 border border-gray-300"
                      }`}
                    />
                    {i < timelineEvents.length - 1 && (
                      <div className="w-px h-6 bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm ${
                        evt.done ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {evt.label}
                    </p>
                    {evt.time && (
                      <p className="text-xs text-gray-400">
                        {formatDateTime(evt.time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Error */}
          {actionError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {actionError}
            </div>
          )}

          {/* Action Buttons */}
          {(canCancel || canRefund) && (
            <div className="space-y-3">
              {canCancel && (
                <button
                  onClick={() => setConfirmModal({ type: "cancel" })}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {t("orders.cancelOrder")}
                </button>
              )}
              {canRefund && (
                <button
                  onClick={() => setConfirmModal({ type: "refund" })}
                  className="w-full py-3 rounded-xl text-sm font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors"
                >
                  {t("orders.requestRefund")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmModal}
        title={
          confirmModal?.type === "cancel" ? t("orders.confirmCancel") : t("orders.confirmRefund")
        }
        message={
          confirmModal?.type === "cancel"
            ? t("orders.cancelMessage")
            : t("orders.refundMessage")
        }
        onConfirm={handleAction}
        onCancel={() => {
          setConfirmModal(null);
          setActionError("");
        }}
        loading={actionLoading}
      />
    </>
  );
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span
        className={`text-sm ${
          highlight
            ? "text-[#0066FF] font-bold"
            : mono
              ? "text-gray-600 font-mono"
              : "text-gray-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// --- Main Page ---
export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({ limit: 50 });
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("orders.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user, loadOrders]);

  const openDetail = async (orderId: string) => {
    setDrawerLoading(true);
    try {
      const detail = await fetchOrder(orderId);
      setSelectedOrder(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("orders.detailLoadFailed"));
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDrawerAction = () => {
    setSelectedOrder(null);
    loadOrders();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">📋</div>
        <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
          {t("orders.pageTitle")}
        </h1>
        <p className="text-gray-500 text-sm mt-2">{t("orders.pageSubtitle")}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && orders.length === 0 && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">🏛</div>
          <h2 className="text-xl font-serif text-gray-700 mb-3">{t("orders.empty")}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {t("orders.emptyHint")}
          </p>
          <Link
            href="/trips"
            className="inline-block px-6 py-3 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] font-semibold hover:bg-[#0066FF]/20 transition-colors"
          >
            {t("orders.browseTrips")}
          </Link>
        </div>
      )}

      {/* Drawer loading overlay */}
      {drawerLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = getStatusStyle(order.status);
            const orderStatusLabel = t(`order.status.${order.status?.toUpperCase() || "PENDING"}`);
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {order.trip?.title || `${t("orders.orderPrefix")} ${order.orderNo}`}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      {order.orderNo}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-medium border ${sc.color} ${sc.bg} ${sc.border}`}
                  >
                    {orderStatusLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#0066FF]">
                    {formatAmount(order.totalAmount)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                    <button
                      onClick={() => openDetail(order.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors"
                    >
                      {t("orders.viewDetail")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAction={handleDrawerAction}
      />
    </div>
  );
}
