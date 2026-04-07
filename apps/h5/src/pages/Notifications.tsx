import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const TYPE_ICONS: Record<string, string> = {
  SYSTEM: "🔔", ORDER: "📦", TRIP: "🗺️", COMMUNITY: "💬",
  PROMOTION: "🎉", REVIEW: "⭐", MEMBERSHIP: "👑",
};

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchNotifications()
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(t("notifications.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTap = async (n: Notification) => {
    if (!n.read) {
      await markNotificationAsRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title={t("notifications.title")} />
        <EmptyState icon="🔒" message={t("auth.login")} action={{ label: t("auth.loginSubmit"), onClick: () => (window.location.href = "/login") }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t("notifications.title")}
        right={
          unreadCount > 0 ? (
            <button onClick={handleMarkAll} className="text-[var(--color-primary)] text-xs whitespace-nowrap">
              {t("notifications.markAllRead")}
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon="🔔" message={t("notifications.empty")} />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => handleTap(n)}
              className={`px-4 py-3.5 flex gap-3 active:bg-gray-50 ${n.read ? "opacity-60" : ""}`}
            >
              <span className="text-lg mt-0.5">{TYPE_ICONS[n.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
