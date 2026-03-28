"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/api";

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

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count } = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail for unauthenticated
    }
  }, [user]);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications(1, 10);
      setNotifications(res.data);
    } catch {
      setError("加载通知失败");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      setError("标记已读失败");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      setError("全部标记已读失败");
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-[#0066FF] transition-colors rounded-lg hover:bg-[#0066FF]/5"
        aria-label={`通知${unreadCount > 0 ? ` (${unreadCount}条未读)` : ""}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
              >
                全部标为已读
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {error && (
              <div className="px-4 py-2 bg-red-500/10 text-red-400 text-xs text-center">
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
              </div>
            ) : !error && notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                暂无通知
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !n.read ? "bg-[#0066FF]/[0.03]" : ""
                  }`}
                  onClick={() => {
                    if (!n.read) handleMarkRead(n.id);
                  }}
                >
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">
                      {typeIcon(n.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            n.read
                              ? "text-gray-600"
                              : "text-gray-900 font-medium"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0066FF] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {n.content}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 text-center">
            <Link
              href="/notifications"
              className="text-xs text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
              onClick={() => setOpen(false)}
            >
              查看全部通知
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
