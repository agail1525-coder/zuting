"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { fetchTrips, type Trip, type TripStatus } from "@/lib/api";

const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: {
    label: "草稿",
    color: "text-temple-400",
    bgColor: "bg-temple-600/10 border-temple-600/20",
  },
  PLANNING: {
    label: "规划中",
    color: "text-incense",
    bgColor: "bg-incense/10 border-incense/20",
  },
  SUBMITTED: {
    label: "已提交",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
  },
  CONFIRMED: {
    label: "已确认",
    color: "text-jade",
    bgColor: "bg-jade/10 border-jade/20",
  },
  PAID: {
    label: "已支付",
    color: "text-green-400",
    bgColor: "bg-green-400/10 border-green-400/20",
  },
  PREPARING: {
    label: "筹备中",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
  },
  IN_PROGRESS: {
    label: "朝圣中",
    color: "text-gold",
    bgColor: "bg-gold/10 border-gold/20",
  },
  COMPLETED: {
    label: "已完成",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10 border-emerald-400/20",
  },
  REVIEWING: {
    label: "评价中",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 border-purple-400/20",
  },
  CANCELLED: {
    label: "已取消",
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/20",
  },
  REFUNDING: {
    label: "退款中",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10 border-orange-400/20",
  },
  REFUNDED: {
    label: "已退款",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10 border-gray-400/20",
  },
};

const TABS: { key: "all" | TripStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "PLANNING", label: "规划中" },
  { key: "CONFIRMED", label: "已确认" },
  { key: "IN_PROGRESS", label: "朝圣中" },
  { key: "COMPLETED", label: "已完成" },
];

function formatDate(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<"all" | TripStatus>("all");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeTab === "all" ? {} : { status: activeTab };
      const res = await fetchTrips(params);
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">
            我的朝圣之旅
          </h1>
          <p className="text-temple-400 mt-1 text-sm">
            规划、记录您的每一次心灵旅程
          </p>
        </div>
        <Link
          href="/trips/create"
          className="px-5 py-2.5 bg-gold text-temple-900 font-semibold rounded-full text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          + 创建新行程
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-temple-400 hover:text-temple-200 border border-transparent hover:border-temple-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-temple-500">
          <div className="text-5xl mb-4 animate-pulse">🏛</div>
          <p>加载行程中...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-20 text-red-400">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="mb-4">{error}</p>
          <button
            onClick={loadTrips}
            className="px-4 py-2 bg-gold/20 text-gold rounded-full text-sm hover:bg-gold/30 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* Trip Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const sc = STATUS_CONFIG[trip.status] ?? {
              label: trip.status,
              color: "text-temple-400",
              bgColor: "bg-temple-600/10 border-temple-600/20",
            };
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block card-glow rounded-2xl bg-temple-800/50 p-5 hover:bg-temple-800/70 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Cover Emoji */}
                  <div className="w-14 h-14 rounded-xl bg-temple-700/50 border border-gold/10 flex items-center justify-center text-2xl shrink-0">
                    🏛
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-serif font-semibold text-temple-100 truncate">
                        {trip.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${sc.bgColor} ${sc.color} shrink-0`}
                      >
                        {sc.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-temple-400">
                      <span>{trip.sites.length} 个圣地</span>
                      {(trip.startDate || trip.endDate) && (
                        <span>
                          {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-temple-500 shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trips.length === 0 && (
        <div className="text-center py-20 text-temple-500">
          <div className="text-5xl mb-4">🏛</div>
          <p>暂无此状态的行程</p>
        </div>
      )}
    </div>
  );
}
