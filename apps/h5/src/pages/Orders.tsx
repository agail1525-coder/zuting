import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { fetchOrders, cancelOrder, refundOrder, type OrderDetail } from "@/lib/api";
import { toast } from "@/lib/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const TABS = ["all", "pending", "paid", "completed", "cancelled", "refunding", "refunded"];

const statusMap: Record<string, string> = {
  all: "", pending: "PENDING", paid: "PAID", completed: "COMPLETED",
  cancelled: "CANCELLED", refunding: "REFUNDING", refunded: "REFUNDED",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", PAID: "bg-green-100 text-green-700",
  COMPLETED: "bg-purple-100 text-purple-700", CANCELLED: "bg-red-100 text-red-600",
  REFUNDING: "bg-orange-100 text-orange-700", REFUNDED: "bg-gray-100 text-gray-500",
};

export default function Orders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    const status = statusMap[tab] || undefined;
    fetchOrders({ status, limit: 50 })
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleCancel = async (id: string) => {
    setActing(id);
    try {
      const updated = await cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      toast.success(t("orders.cancelSuccess"));
    } catch { toast.error(t("orders.actionFailed")); }
    finally { setActing(null); }
  };

  const handleRefund = async (id: string) => {
    setActing(id);
    try {
      const updated = await refundOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      toast.success(t("orders.refundSuccess"));
    } catch { toast.error(t("orders.actionFailed")); }
    finally { setActing(null); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title={t("orders.pageTitle")} />
        <EmptyState icon="🔒" message={t("auth.login")} action={{ label: t("auth.loginSubmit"), onClick: () => (window.location.href = "/login") }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("orders.pageTitle")} />

      {/* Tabs */}
      <div className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                tab === tb ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(`orders.tab.${tb}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" message={t("orders.empty")} />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-400">{order.orderNo}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{order.trip?.title || t("orders.associatedTrip")}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {t(`order.status.${order.status}`)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">¥{order.totalAmount}</span>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={acting === order.id}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-full disabled:opacity-50"
                    >
                      {t("orders.cancelOrder")}
                    </button>
                  )}
                  {order.status === "PAID" && (
                    <button
                      onClick={() => handleRefund(order.id)}
                      disabled={acting === order.id}
                      className="px-3 py-1.5 text-xs border border-orange-200 text-orange-600 rounded-full disabled:opacity-50"
                    >
                      {t("orders.requestRefund")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
