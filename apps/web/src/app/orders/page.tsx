"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
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
  COMPLETED: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const DEFAULT_STYLE = { color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" };

function getStatusStyle(status: string) {
  const upper = status?.toUpperCase() || "";
  return STATUS_STYLE[upper] || DEFAULT_STYLE;
}

function formatDate(dateStr: string, locale?: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale || undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null, locale?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(locale || undefined, {
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

type SortMode = "newest" | "oldest" | "amountDesc" | "amountAsc";

// --- Download invoice as plain-text receipt (no external libs) ---
function downloadInvoice(order: OrderDetail, t: (k: string) => string, locale?: string) {
  const lines = [
    "=".repeat(40),
    `  ${t("orders.invoiceTitle")}`,
    "=".repeat(40),
    `${t("orders.invoicePlatform")}: JOINUS.COM`,
    `${t("orders.invoiceOrderNo")}: ${order.orderNo}`,
    `${t("orders.invoiceStatus")}: ${order.status}`,
    `${t("orders.invoiceAmount")}: ${formatAmount(order.paidAmount ?? order.totalAmount)}`,
    `${t("orders.invoiceDate")}: ${formatDateTime(order.paidAt ?? order.createdAt, locale)}`,
    "-".repeat(40),
    `${t("orders.invoiceNote")}`,
    "=".repeat(40),
  ];
  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${order.orderNo}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

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

// --- Review Prompt Banner ---
function ReviewPromptBanner({
  order,
  onSkip,
}: {
  order: OrderDetail;
  onSkip: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg shrink-0">⭐</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-800">{t("orders.reviewPrompt.title")}</p>
          <p className="text-xs text-amber-600 truncate">{t("orders.reviewPrompt.desc")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/trips/${order.trip?.id ?? ""}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          {t("orders.reviewPrompt.cta")}
        </Link>
        <button
          onClick={() => onSkip(order.id)}
          className="text-xs text-amber-500 hover:text-amber-700 transition-colors"
        >
          {t("orders.reviewPrompt.skip")}
        </button>
      </div>
    </div>
  );
}

// --- Date Range Filter ---
function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  isActive,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  isActive: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${
          isActive
            ? "bg-[#0066FF]/10 border-[#0066FF]/30 text-[#0066FF]"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{isActive ? t("orders.dateFilter.active") : t("orders.dateFilter.label")}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-20 bg-white border border-gray-200 rounded-2xl p-4 shadow-xl w-72">
          <p className="text-sm font-medium text-gray-700 mb-3">{t("orders.dateFilter.label")}</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">{t("orders.dateFilter.from")}</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">{t("orders.dateFilter.to")}</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { onClear(); setOpen(false); }}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("orders.dateFilter.clear")}
            </button>
            <button
              onClick={() => { onApply(); setOpen(false); }}
              className="flex-1 py-2 text-sm text-white bg-[#0066FF] rounded-lg hover:bg-[#0055DD] transition-colors"
            >
              {t("orders.dateFilter.apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sort Selector ---
function SortSelector({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const { t } = useTranslation();
  const options: { value: SortMode; label: string }[] = [
    { value: "newest", label: t("orders.sort.newest") },
    { value: "oldest", label: t("orders.sort.oldest") },
    { value: "amountDesc", label: t("orders.sort.amountDesc") },
    { value: "amountAsc", label: t("orders.sort.amountAsc") },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 shrink-0">{t("orders.sortLabel")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] text-gray-700"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// --- Order Detail Drawer ---
function OrderDrawer({
  order,
  onClose,
  onAction,
  onSkipReview,
  skippedReviews,
}: {
  order: OrderDetail | null;
  onClose: () => void;
  onAction: () => void;
  onSkipReview: (id: string) => void;
  skippedReviews: Set<string>;
}) {
  const { t, locale } = useTranslation();
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
  const isCompleted = upperStatus === "COMPLETED";
  const isPaid = upperStatus === "PAID";
  const showReviewPrompt = isCompleted && !skippedReviews.has(order.id);

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
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${sc.color} ${sc.bg} ${sc.border}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Review Prompt (for completed orders) */}
          {showReviewPrompt && (
            <div className="mb-4">
              <ReviewPromptBanner order={order} onSkip={onSkipReview} />
            </div>
          )}

          {/* Quick Actions Row */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {/* Download Invoice (paid/completed/refunded orders) */}
            {(upperStatus === "PAID" || upperStatus === "COMPLETED" || upperStatus === "REFUNDED") && (
              <button
                onClick={() => downloadInvoice(order, t, locale)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t("orders.quickAction.invoice")}
              </button>
            )}
            {/* Write Review (completed) */}
            {isCompleted && order.trip?.id && (
              <Link
                href={`/trips/${order.trip.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <span>⭐</span>
                {t("orders.quickAction.review")}
              </Link>
            )}
            {/* Rebook (completed) */}
            {isCompleted && (
              <Link
                href="/holy-sites#routes"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
              >
                <span>🔄</span>
                {t("orders.quickAction.reorder")}
              </Link>
            )}
            {/* Contact Support (all statuses) */}
            <Link
              href="/messages"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t("orders.quickAction.contact")}
            </Link>
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
                value={formatDateTime(order.createdAt, locale)}
              />
              {order.paidAt && (
                <InfoRow
                  label={t("orders.paidTime")}
                  value={formatDateTime(order.paidAt, locale)}
                />
              )}
              {order.cancelledAt && (
                <InfoRow
                  label={t("orders.cancelledTime")}
                  value={formatDateTime(order.cancelledAt, locale)}
                />
              )}
              {order.refundedAt && (
                <InfoRow
                  label={t("orders.refundedTime")}
                  value={formatDateTime(order.refundedAt, locale)}
                />
              )}
            </div>
          </div>

          {/* Paid Nudge */}
          {isPaid && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600 flex items-center gap-2">
              <span className="text-base">✈️</span>
              <span>{t("orders.tripConfirmedNudge")}</span>
            </div>
          )}

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
                        .map((s) => s.site?.name ?? "")
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
                        {formatDateTime(evt.time, locale)}
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

function getStatusTabs(t: (key: string) => string) {
  return [
    { value: "", label: t("orders.tab.all"), icon: "📋" },
    { value: "PENDING", label: t("orders.tab.pending"), icon: "⏳" },
    { value: "PAID", label: t("orders.tab.paid"), icon: "✅" },
    { value: "COMPLETED", label: t("orders.tab.completed"), icon: "🎉" },
    { value: "CANCELLED", label: t("orders.tab.cancelled"), icon: "❌" },
    { value: "REFUNDING", label: t("orders.tab.refunding"), icon: "🔄" },
    { value: "REFUNDED", label: t("orders.tab.refunded"), icon: "💰" },
  ];
}

// --- Main Page ---
export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [skippedReviews, setSkippedReviews] = useState<Set<string>>(new Set());

  const STATUS_TABS = useMemo(() => getStatusTabs(t), [t]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Filtered + sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter) {
      result = result.filter((o) => (o.status?.toUpperCase() || "") === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          (o.trip?.title ?? "").toLowerCase().includes(q)
      );
    }

    if (appliedFrom) {
      const from = new Date(appliedFrom).getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() >= from);
    }

    if (appliedTo) {
      const to = new Date(appliedTo + "T23:59:59").getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() <= to);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortMode === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortMode === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortMode === "amountDesc") return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
      if (sortMode === "amountAsc") return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
      return 0;
    });

    return result;
  }, [orders, statusFilter, searchQuery, appliedFrom, appliedTo, sortMode]);

  // Order stats
  const orderStats = useMemo(() => {
    const total = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const key = o.status?.toUpperCase() || "PENDING";
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });
    const active = (statusCounts["PAID"] || 0) + (statusCounts["PENDING"] || 0);
    return { totalSpent: total, statusCounts, count: orders.length, active };
  }, [orders]);

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
  }, [t]);

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

  const handleSkipReview = (id: string) => {
    setSkippedReviews((prev) => new Set([...prev, id]));
  };

  const dateFilterActive = !!(appliedFrom || appliedTo);

  const clearAllFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
    setAppliedFrom("");
    setAppliedTo("");
    setFromDate("");
    setToDate("");
  };

  const hasAnyFilter = statusFilter || searchQuery || dateFilterActive;

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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📋</div>
          <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
            {t("orders.pageTitle")}
          </h1>
          <p className="text-gray-500 text-sm mt-2">{t("orders.pageSubtitle")}</p>
        </div>

        {/* ══════ Order Stats Summary — Booking style 4-card header ══════ */}
        {orders.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-[#0066FF]">{orderStats.count}</p>
              <p className="text-xs text-gray-400 mt-1">{t("orders.stats.totalOrders")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-lg font-bold text-[#0066FF]">{formatAmount(orderStats.totalSpent)}</p>
              <p className="text-xs text-gray-400 mt-1">{t("orders.stats.totalSpent")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-500">{orderStats.statusCounts["COMPLETED"] || 0}</p>
              <p className="text-xs text-gray-400 mt-1">{t("orders.stats.completed")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-500">{orderStats.active}</p>
              <p className="text-xs text-gray-400 mt-1">{t("orders.stats.active")}</p>
            </div>
          </div>
        )}

        {/* ══════ Status Tabs — Booking/Ctrip core pattern ══════ */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count = tab.value ? (orderStats.statusCounts[tab.value] || 0) : orders.length;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? "bg-[#0066FF] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                {count > 0 && (
                  <span className={`text-xs ${statusFilter === tab.value ? "text-white/70" : "text-gray-400"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════ Search + Filters Bar — Expedia style ══════ */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("orders.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
              />
            </div>
            {/* Date Range Filter */}
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
              onApply={() => { setAppliedFrom(fromDate); setAppliedTo(toDate); }}
              onClear={() => { setFromDate(""); setToDate(""); setAppliedFrom(""); setAppliedTo(""); }}
              isActive={dateFilterActive}
            />
          </div>

          {/* Sort + Filter summary row */}
          <div className="flex items-center justify-between">
            <SortSelector value={sortMode} onChange={setSortMode} />
            {hasAnyFilter && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-xs">{t("orders.foundCount").replace("{count}", String(filteredOrders.length))}</span>
                <button
                  onClick={clearAllFilters}
                  className="text-[#0066FF] hover:underline text-xs"
                >
                  {t("orders.clearFilter")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* ══════ Empty State — Airbnb style with suggested CTAs ══════ */}
        {!error && orders.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[#0066FF]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏛</span>
            </div>
            <h2 className="text-xl font-serif text-gray-800 mb-2">{t("orders.emptyTitle")}</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              {t("orders.emptySubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/holy-sites#routes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0055DD] transition-colors"
              >
                <span>🗺️</span> {t("orders.emptyCta1")}
              </Link>
              <Link
                href="/holy-sites"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                <span>✨</span> {t("orders.emptyCta2")}
              </Link>
            </div>
          </div>
        )}

        {/* Filtered empty */}
        {!error && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">{t("orders.noFilterResults")}</p>
            <button
              onClick={clearAllFilters}
              className="mt-3 text-sm text-[#0066FF] hover:underline"
            >
              {t("orders.clearFilter")}
            </button>
          </div>
        )}

        {/* Drawer loading overlay */}
        {drawerLoading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
          </div>
        )}

        {/* ══════ Orders List ══════ */}
        {filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const sc = getStatusStyle(order.status);
              const orderStatusLabel = t(`order.status.${order.status?.toUpperCase() || "PENDING"}`);
              const upperStatus = order.status?.toUpperCase() || "";
              const isPaid = upperStatus === "PAID";
              const isCompleted = upperStatus === "COMPLETED";
              const showReviewCard = isCompleted && !skippedReviews.has(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  {/* Title row */}
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

                  {/* Upcoming trip nudge for paid orders */}
                  {isPaid && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-600 flex items-center gap-1.5">
                      <span>✈️</span> {t("orders.tripConfirmedNudge")}
                    </div>
                  )}

                  {/* Review prompt for completed orders (inline card) */}
                  {showReviewCard && (
                    <div className="mb-3">
                      <ReviewPromptBanner order={order} onSkip={handleSkipReview} />
                    </div>
                  )}

                  {/* Trip route preview */}
                  {order.trip?.sites && order.trip.sites.length > 0 && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-gray-400 overflow-hidden">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">
                        {order.trip.sites.map((s) => s.site?.name ?? "").join(" → ")}
                      </span>
                    </div>
                  )}

                  {/* Footer row: amount + date + actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#0066FF]">
                        {formatAmount(order.totalAmount)}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDate(order.createdAt, locale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Download receipt for paid/completed */}
                      {(upperStatus === "PAID" || upperStatus === "COMPLETED") && (
                        <button
                          onClick={() => downloadInvoice(order, t, locale)}
                          title={t("orders.downloadInvoiceHint")}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                      {isCompleted && (
                        <Link
                          href="/holy-sites#routes"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          {t("orders.rebook")}
                        </Link>
                      )}
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
          onSkipReview={handleSkipReview}
          skippedReviews={skippedReviews}
        />
      </div>
      <MobileNav />
    </div>
  );
}
