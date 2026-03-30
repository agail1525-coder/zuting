"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import { fetchTrips, type Trip, type TripStatus } from "@/lib/api";

const STATUS_STYLE: Record<
  TripStatus,
  { color: string; bgColor: string }
> = {
  DRAFT: { color: "text-gray-500", bgColor: "bg-gray-100 border-gray-200" },
  PLANNING: { color: "text-orange-500", bgColor: "bg-orange-50 border-orange-200" },
  SUBMITTED: { color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20" },
  CONFIRMED: { color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  PAID: { color: "text-green-400", bgColor: "bg-green-400/10 border-green-400/20" },
  PREPARING: { color: "text-amber-400", bgColor: "bg-amber-400/10 border-amber-400/20" },
  IN_PROGRESS: { color: "text-[#0066FF]", bgColor: "bg-[#0066FF]/10 border-[#0066FF]/20" },
  COMPLETED: { color: "text-emerald-400", bgColor: "bg-emerald-400/10 border-emerald-400/20" },
  REVIEWING: { color: "text-purple-400", bgColor: "bg-purple-400/10 border-purple-400/20" },
  CANCELLED: { color: "text-red-400", bgColor: "bg-red-400/10 border-red-400/20" },
  REFUNDING: { color: "text-orange-400", bgColor: "bg-orange-400/10 border-orange-400/20" },
  REFUNDED: { color: "text-gray-400", bgColor: "bg-gray-400/10 border-gray-400/20" },
};

const TAB_KEYS: Array<{ key: "all" | TripStatus; i18nKey: string }> = [
  { key: "all", i18nKey: "trips.tab.all" },
  { key: "PLANNING", i18nKey: "trips.tab.planning" },
  { key: "CONFIRMED", i18nKey: "trips.tab.confirmed" },
  { key: "IN_PROGRESS", i18nKey: "trips.tab.inProgress" },
  { key: "COMPLETED", i18nKey: "trips.tab.completed" },
];

function formatDate(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | TripStatus>("all");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side search filter
  const displayTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const q = searchQuery.toLowerCase();
    return trips.filter(
      (trip) =>
        trip.title.toLowerCase().includes(q) ||
        trip.sites.some((s) => s.site?.name?.toLowerCase().includes(q))
    );
  }, [trips, searchQuery]);

  // Stats
  const tripStats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    trips.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
    return { total: trips.length, statusCounts };
  }, [trips]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/trips");
    }
  }, [authLoading, user, router]);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeTab === "all" ? {} : { status: activeTab };
      const res = await fetchTrips(params);
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!user) return;
    loadTrips();
  }, [user, loadTrips]);

  if (authLoading) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0066FF]">
            {t("trips.pageTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("trips.pageSubtitle")}
            {trips.length > 0 && <span className="ml-2 text-gray-400">· 共 {trips.length} 个行程</span>}
          </p>
        </div>
        <Link
          href="/trips/create"
          className="px-5 py-2.5 bg-[#0066FF] text-white font-semibold rounded-full text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
        >
          + {t("trips.createNew")}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TAB_KEYS.map((tab) => {
          const count = tab.key === "all" ? trips.length : (tripStats.statusCounts[tab.key] || 0);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === tab.key
                  ? "bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30 font-medium"
                  : "text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200"
              }`}
            >
              {t(tab.i18nKey)}
              {count > 0 && (
                <span className={`text-xs ${activeTab === tab.key ? "text-[#0066FF]/60" : "text-gray-400"}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索行程名称或目的地..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4 animate-pulse">🏛</div>
          <p>{t("trips.loading")}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-20 text-red-400">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="mb-4">{error}</p>
          <button
            onClick={loadTrips}
            className="px-4 py-2 bg-[#0066FF]/10 text-[#0066FF] rounded-full text-sm hover:bg-[#0066FF]/20 transition-colors"
          >
            {t("trips.retry")}
          </button>
        </div>
      )}

      {/* Trip Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {displayTrips.map((trip, i) => {
            const sc = STATUS_STYLE[trip.status] ?? {
              color: "text-gray-500",
              bgColor: "bg-gray-100 border-gray-200",
            };
            const statusLabel = t(`trip.status.${trip.status}`);
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Cover Emoji */}
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl shrink-0">
                    🏛
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-serif font-semibold text-gray-900 truncate">
                        {trip.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${sc.bgColor} ${sc.color} shrink-0`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{trip.sites.length} {t("trips.siteCount")}</span>
                      {(trip.startDate || trip.endDate) && (
                        <span>
                          {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-gray-400 shrink-0 mt-1"
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
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🏛</div>
          <p>{t("trips.empty")}</p>
          <Link
            href="/routes"
            className="inline-block mt-4 px-6 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl text-sm hover:bg-[#0052CC] transition-colors"
          >
            浏览路线开始规划 →
          </Link>
        </div>
      )}

      {/* Search empty */}
      {!loading && !error && trips.length > 0 && displayTrips.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>没有找到匹配的行程</p>
          <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#0066FF] hover:underline">
            清除搜索
          </button>
        </div>
      )}
      </div>
      <MobileNav />
    </div>
  );
}
