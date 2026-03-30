"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/api";
import MobileNav from "@/components/MobileNav";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notifications.time.justNow");
  if (minutes < 60) return t("notifications.time.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.time.hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("notifications.time.daysAgo", { n: days });
  return new Date(dateStr).toLocaleDateString();
}

function typeIcon(type: string): string {
  switch (type) {
    case "TRIP_STATUS":
      return "🗺";
    case "PAYMENT":
      return "💰";
    case "REFUND":
      return "💳";
    case "REVIEW":
      return "⭐";
    case "SYSTEM":
      return "📢";
    default:
      return "🔔";
  }
}

function typeLabel(type: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    TRIP_STATUS: "notifications.type.trip",
    PAYMENT: "notifications.type.payment",
    REFUND: "notifications.type.refund",
    REVIEW: "notifications.type.review",
    SYSTEM: "notifications.type.system",
  };
  return t(map[type] ?? "notifications.type.default");
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const limit = 20;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchNotifications(page, limit, filter === "unread");
      setNotifications(res.data);
      setTotal(res.total);
    } catch {
      setError(t("notifications.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [user, page, filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      showToast(t("notifications.error.markReadFailed"));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      showToast(t("notifications.error.markAllReadFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => t - 1);
    } catch {
      showToast(t("notifications.error.deleteFailed"));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{t("notifications.loginRequired")}</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-[#0066FF]/10 text-[#0066FF] rounded-lg hover:bg-[#0066FF]/20 transition-colors"
        >
          {t("notifications.goLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
          {t("notifications.title")}
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
            >
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            filter === "all"
              ? "bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30"
              : "text-gray-500 hover:text-[#0066FF] hover:bg-[#0066FF]/5"
          }`}
        >
          {t("notifications.filterAll")}
        </button>
        <button
          onClick={() => {
            setFilter("unread");
            setPage(1);
          }}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            filter === "unread"
              ? "bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30"
              : "text-gray-500 hover:text-[#0066FF] hover:bg-[#0066FF]/5"
          }`}
        >
          {t("notifications.filterUnread")}
        </button>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-red-500/90 text-white text-sm rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-4">&#x26A0;&#xFE0F;</span>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); loadNotifications(); }}
            className="px-4 py-2 bg-[#0066FF]/10 text-[#0066FF] rounded-lg hover:bg-[#0066FF]/20 transition-colors"
          >
            {t("notifications.retry")}
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-4">🔔</span>
          <p className="text-gray-500">
            {filter === "unread" ? t("notifications.emptyUnread") : t("notifications.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`relative p-4 rounded-xl border transition-colors ${
                n.read
                  ? "border-gray-100 bg-white"
                  : "border-[#0066FF]/20 bg-[#0066FF]/[0.03]"
              }`}
            >
              <div className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">
                  {typeIcon(n.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF]/70">
                          {typeLabel(n.type, t)}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          n.read
                            ? "text-gray-600"
                            : "text-gray-900 font-medium"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {n.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {timeAgo(n.createdAt, t)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1.5 text-gray-500 hover:text-[#0066FF] transition-colors rounded-lg hover:bg-[#0066FF]/10"
                          title={t("notifications.markRead")}
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        title={t("notifications.delete")}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {n.link && (
                <Link
                  href={n.link}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`${t("notifications.view")}: ${n.title}`}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).closest("button")
                    ) {
                      e.preventDefault();
                    }
                    if (!n.read) handleMarkRead(n.id);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("notifications.prevPage")}
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("notifications.nextPage")}
          </button>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
