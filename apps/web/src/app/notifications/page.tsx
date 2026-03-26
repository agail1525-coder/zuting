"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
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

function typeLabel(type: string): string {
  switch (type) {
    case "TRIP_STATUS":
      return "行程";
    case "PAYMENT":
      return "支付";
    case "REFUND":
      return "退款";
    case "REVIEW":
      return "评价";
    case "SYSTEM":
      return "系统";
    default:
      return "通知";
  }
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const limit = 20;

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchNotifications(page, limit, filter === "unread");
      setNotifications(res.data);
      setTotal(res.total);
    } catch {
      setNotifications([]);
      setTotal(0);
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
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => t - 1);
    } catch {
      // ignore
    }
  };

  const totalPages = Math.ceil(total / limit);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-temple-300">请先登录查看通知</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">
          通知中心
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              全部已读
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
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-temple-400 hover:text-gold hover:bg-gold/5"
          }`}
        >
          全部
        </button>
        <button
          onClick={() => {
            setFilter("unread");
            setPage(1);
          }}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            filter === "unread"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-temple-400 hover:text-gold hover:bg-gold/5"
          }`}
        >
          未读
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-4">🔔</span>
          <p className="text-temple-400">
            {filter === "unread" ? "没有未读通知" : "暂无通知"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`relative p-4 rounded-xl border transition-colors ${
                n.read
                  ? "border-gold/5 bg-temple-800/50"
                  : "border-gold/20 bg-gold/[0.03]"
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold/70">
                          {typeLabel(n.type)}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-gold" />
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          n.read
                            ? "text-temple-300"
                            : "text-temple-100 font-medium"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-temple-400 mt-1">
                        {n.content}
                      </p>
                      <p className="text-xs text-temple-500 mt-2">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1.5 text-temple-400 hover:text-gold transition-colors rounded-lg hover:bg-gold/10"
                          title="标为已读"
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
                        className="p-1.5 text-temple-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        title="删除"
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
                  aria-label={`查看: ${n.title}`}
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
            className="px-3 py-1.5 text-sm rounded-lg border border-gold/20 text-temple-300 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-temple-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gold/20 text-temple-300 hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
