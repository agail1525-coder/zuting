"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { fetchTrips, type Trip, type TripStatus } from "@/lib/api";

const STATUS_STYLE: Record<
  TripStatus,
  { color: string; bgColor: string }
> = {
  DRAFT: { color: "text-temple-400", bgColor: "bg-temple-600/10 border-temple-600/20" },
  PLANNING: { color: "text-incense", bgColor: "bg-incense/10 border-incense/20" },
  SUBMITTED: { color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20" },
  CONFIRMED: { color: "text-jade", bgColor: "bg-jade/10 border-jade/20" },
  PAID: { color: "text-green-400", bgColor: "bg-green-400/10 border-green-400/20" },
  PREPARING: { color: "text-amber-400", bgColor: "bg-amber-400/10 border-amber-400/20" },
  IN_PROGRESS: { color: "text-gold", bgColor: "bg-gold/10 border-gold/20" },
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
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">
            {t("trips.pageTitle")}
          </h1>
          <p className="text-temple-400 mt-1 text-sm">
            {t("trips.pageSubtitle")}
          </p>
        </div>
        <Link
          href="/trips/create"
          className="px-5 py-2.5 bg-gold text-temple-900 font-semibold rounded-full text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          + {t("trips.createNew")}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TAB_KEYS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-temple-400 hover:text-temple-200 border border-transparent hover:border-temple-700"
            }`}
          >
            {t(tab.i18nKey)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-temple-500">
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
            className="px-4 py-2 bg-gold/20 text-gold rounded-full text-sm hover:bg-gold/30 transition-colors"
          >
            {t("trips.retry")}
          </button>
        </div>
      )}

      {/* Trip Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const sc = STATUS_STYLE[trip.status] ?? {
              color: "text-temple-400",
              bgColor: "bg-temple-600/10 border-temple-600/20",
            };
            const statusLabel = t(`trip.status.${trip.status}`);
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
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-temple-400">
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
          <p>{t("trips.empty")}</p>
        </div>
      )}
    </div>
  );
}
