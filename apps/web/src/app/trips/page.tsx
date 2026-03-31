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

// Progress percentage per status (Google Travel style)
const STATUS_PROGRESS: Record<TripStatus, number> = {
  DRAFT: 10,
  PLANNING: 25,
  SUBMITTED: 40,
  CONFIRMED: 50,
  PAID: 60,
  PREPARING: 70,
  IN_PROGRESS: 85,
  COMPLETED: 100,
  REVIEWING: 95,
  CANCELLED: 0,
  REFUNDING: 0,
  REFUNDED: 0,
};

// Progress bar color
const STATUS_PROGRESS_COLOR: Record<TripStatus, string> = {
  DRAFT: "bg-gray-400",
  PLANNING: "bg-orange-400",
  SUBMITTED: "bg-blue-400",
  CONFIRMED: "bg-emerald-500",
  PAID: "bg-green-500",
  PREPARING: "bg-amber-400",
  IN_PROGRESS: "bg-[#0066FF]",
  COMPLETED: "bg-emerald-500",
  REVIEWING: "bg-purple-400",
  CANCELLED: "bg-gray-300",
  REFUNDING: "bg-orange-300",
  REFUNDED: "bg-gray-300",
};

const TAB_KEYS: Array<{ key: "all" | TripStatus; i18nKey: string }> = [
  { key: "all", i18nKey: "trips.tab.all" },
  { key: "PLANNING", i18nKey: "trips.tab.planning" },
  { key: "CONFIRMED", i18nKey: "trips.tab.confirmed" },
  { key: "IN_PROGRESS", i18nKey: "trips.tab.inProgress" },
  { key: "COMPLETED", i18nKey: "trips.tab.completed" },
];

// View modes
type ViewMode = "list" | "calendar";

function formatDate(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

// Compute countdown days from today to startDate (Trip.com style)
function getCountdownDays(startDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// Get month name (3-letter)
function getMonthName(month: number): string {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[month] ?? "";
}

// Calendar cell: list trips that fall within a given year-month
function getTripsForMonth(trips: Trip[], year: number, month: number): Trip[] {
  return trips.filter((trip) => {
    if (!trip.startDate) return false;
    const d = new Date(trip.startDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  // Calendar state: which month is displayed
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

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
    trips.forEach((tr) => { statusCounts[tr.status] = (statusCounts[tr.status] || 0) + 1; });
    const totalBudget = trips.reduce((sum, tr) => sum + (tr.totalBudget ?? 0), 0);
    const totalSites = trips.reduce((sum, tr) => sum + tr.sites.length, 0);
    return { total: trips.length, statusCounts, totalBudget, totalSites };
  }, [trips]);

  // Upcoming trip (nearest startDate in the future, status not COMPLETED/CANCELLED etc)
  const upcomingTrip = useMemo(() => {
    const activeStatuses: TripStatus[] = ["PLANNING", "CONFIRMED", "PAID", "PREPARING"];
    const candidates = trips
      .filter((tr) => activeStatuses.includes(tr.status) && tr.startDate)
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());
    return candidates[0] ?? null;
  }, [trips]);

  const countdownDays = useMemo(() => {
    if (!upcomingTrip) return null;
    return getCountdownDays(upcomingTrip.startDate);
  }, [upcomingTrip]);

  // Calendar: trips in the viewed month
  const calendarMonthTrips = useMemo(
    () => getTripsForMonth(trips, calendarYear, calendarMonth),
    [trips, calendarYear, calendarMonth]
  );

  // Calendar grid: days in month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [calendarYear, calendarMonth]);

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
  }, [activeTab, t]);

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

  const prevCalendarMonth = () => {
    if (calendarMonth === 0) { setCalendarYear(y => y - 1); setCalendarMonth(11); }
    else setCalendarMonth(m => m - 1);
  };
  const nextCalendarMonth = () => {
    if (calendarMonth === 11) { setCalendarYear(y => y + 1); setCalendarMonth(0); }
    else setCalendarMonth(m => m + 1);
  };

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
              {trips.length > 0 && (
                <span className="ml-2 text-gray-400">
                  · {t("trips.totalCount", { count: trips.length })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                title={t("trips.viewList")}
                className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-[#0066FF]/10 text-[#0066FF]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                title={t("trips.viewCalendar")}
                className={`px-3 py-2 transition-colors ${viewMode === "calendar" ? "bg-[#0066FF]/10 text-[#0066FF]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <Link
              href="/trips/create"
              className="px-5 py-2.5 bg-[#0066FF] text-white font-semibold rounded-full text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
            >
              + {t("trips.createNew")}
            </Link>
          </div>
        </div>

        {/* Countdown Banner — Trip.com style */}
        {upcomingTrip && countdownDays !== null && countdownDays > 0 && countdownDays <= 30 && (
          <Link
            href={`/trips/${upcomingTrip.id}`}
            className="block mb-6 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#4D9FFF] text-white p-4 shadow-lg shadow-[#0066FF]/20 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">{t("trips.countdown.nextTrip")}</p>
                <p className="font-serif font-bold text-lg leading-tight">{upcomingTrip.title}</p>
                <p className="text-xs text-white/70 mt-1">
                  {formatDate(upcomingTrip.startDate)}
                  {upcomingTrip.endDate ? ` ~ ${formatDate(upcomingTrip.endDate)}` : ""}
                </p>
              </div>
              <div className="text-center shrink-0 ml-4">
                <div className="text-4xl font-bold leading-none">{countdownDays}</div>
                <div className="text-xs text-white/80 mt-1">{t("trips.countdown.daysLeft")}</div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Dashboard */}
        {trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#0066FF]">{trips.length}</p>
              <p className="text-xs text-gray-500">{t("trips.stats.total")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-emerald-600">{tripStats.statusCounts["COMPLETED"] || 0}</p>
              <p className="text-xs text-gray-500">{t("trips.stats.completed")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-[#0066FF]">{tripStats.statusCounts["IN_PROGRESS"] || 0}</p>
              <p className="text-xs text-gray-500">{t("trips.stats.active")}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">{tripStats.totalSites}</p>
              <p className="text-xs text-gray-500">{t("trips.stats.sitesVisited")}</p>
            </div>
          </div>
        )}

        {/* Budget summary — Expedia style */}
        {trips.length > 0 && tripStats.totalBudget > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{t("trips.budget.totalLabel")}</p>
              <p className="font-bold text-gray-900 text-lg">
                ¥{tripStats.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">
                {t("trips.budget.avgPerTrip")}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                ¥{Math.round(tripStats.totalBudget / trips.filter(tr => tr.totalBudget).length).toLocaleString()}
              </p>
            </div>
          </div>
        )}

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
              placeholder={t("trips.searchPlaceholder")}
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

        {/* Calendar View — Google Calendar style */}
        {!loading && !error && viewMode === "calendar" && trips.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevCalendarMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="font-semibold text-gray-900">
                {calendarYear} {t(`trips.calendar.months.${getMonthName(calendarMonth)}`)}
              </h3>
              <button
                onClick={nextCalendarMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: calendarDays.firstDay }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: calendarDays.daysInMonth }, (_, i) => {
                const day = i + 1;
                const today = new Date();
                const isToday =
                  today.getFullYear() === calendarYear &&
                  today.getMonth() === calendarMonth &&
                  today.getDate() === day;
                // Check if any trip starts on this day
                const tripOnDay = trips.find((tr) => {
                  if (!tr.startDate) return false;
                  const d = new Date(tr.startDate);
                  return (
                    d.getFullYear() === calendarYear &&
                    d.getMonth() === calendarMonth &&
                    d.getDate() === day
                  );
                });
                return (
                  <div key={day} className="relative flex flex-col items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                        ${isToday ? "bg-[#0066FF] text-white" : "text-gray-700 hover:bg-gray-100"}
                        ${tripOnDay ? "font-bold" : ""}
                      `}
                    >
                      {day}
                    </div>
                    {tripOnDay && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${STATUS_PROGRESS_COLOR[tripOnDay.status]}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trips in this month */}
            {calendarMonthTrips.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium mb-2">{t("trips.calendar.tripsThisMonth")}</p>
                {calendarMonthTrips.map((tr) => {
                  const sc = STATUS_STYLE[tr.status];
                  return (
                    <Link
                      key={tr.id}
                      href={`/trips/${tr.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full ${STATUS_PROGRESS_COLOR[tr.status]} shrink-0`} />
                      <span className="flex-1 text-sm text-gray-800 font-medium truncate">{tr.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.bgColor} ${sc.color}`}>
                        {formatDate(tr.startDate)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {calendarMonthTrips.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">{t("trips.calendar.noTripsThisMonth")}</p>
            )}
          </div>
        )}

        {/* Trip Cards — List View */}
        {!loading && !error && viewMode === "list" && (
          <div className="space-y-4">
            {displayTrips.map((trip, i) => {
              const sc = STATUS_STYLE[trip.status] ?? {
                color: "text-gray-500",
                bgColor: "bg-gray-100 border-gray-200",
              };
              const statusLabel = t(`trip.status.${trip.status}`);
              const progress = STATUS_PROGRESS[trip.status];
              const progressColor = STATUS_PROGRESS_COLOR[trip.status];
              const tripCountdown = getCountdownDays(trip.startDate);
              const showCountdown =
                tripCountdown !== null &&
                tripCountdown > 0 &&
                tripCountdown <= 60 &&
                !["COMPLETED", "CANCELLED", "REFUNDING", "REFUNDED"].includes(trip.status);

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Cover Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                      {trip.sites[0]?.site?.imageUrl ? (
                        <img src={trip.sites[0].site.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏛</div>
                      )}
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
                        {/* Budget — Expedia style inline */}
                        {trip.totalBudget && trip.totalBudget > 0 ? (
                          <span className="text-amber-600 font-medium">
                            ¥{trip.totalBudget.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      {/* Site Tags */}
                      {trip.sites.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {trip.sites.slice(0, 3).map((s) => (
                            <span key={s.id} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                              {s.site?.name || t("trips.unknownSite")}
                            </span>
                          ))}
                          {trip.sites.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">+{trip.sites.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Progress Bar — Google Travel style */}
                      {!["CANCELLED", "REFUNDING", "REFUNDED"].includes(trip.status) && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">{t("trips.progress.label")}</span>
                            <span className="text-xs font-medium text-gray-600">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow + Quick Actions + Countdown */}
                    <div className="flex flex-col items-end gap-1 shrink-0 mt-1">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                      {trip.status === "DRAFT" && (
                        <span className="text-xs text-[#0066FF] font-medium whitespace-nowrap">{t("trips.continueEditing")}</span>
                      )}
                      {trip.status === "CONFIRMED" && (
                        <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">{t("trips.goToPay")}</span>
                      )}
                      {/* Countdown chip — Trip.com style */}
                      {showCountdown && (
                        <span className="text-xs bg-[#0066FF]/10 text-[#0066FF] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t("trips.countdown.chipDays", { days: tripCountdown })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty — personalized recommendations */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#0066FF]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-serif font-semibold text-lg mb-2">{t("trips.empty.title")}</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{t("trips.empty.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/trips/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl text-sm hover:bg-[#0052CC] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("trips.createNew")}
              </Link>
              <Link
                href="/routes"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
              >
                {t("trips.browseRoutes")}
              </Link>
            </div>

            {/* Recommendation hints */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
              {[
                { icon: "🕌", titleKey: "trips.empty.rec1.title", descKey: "trips.empty.rec1.desc", href: "/holy-sites" },
                { icon: "🗺️", titleKey: "trips.empty.rec2.title", descKey: "trips.empty.rec2.desc", href: "/routes" },
                { icon: "✨", titleKey: "trips.empty.rec3.title", descKey: "trips.empty.rec3.desc", href: "/community" },
              ].map((rec) => (
                <Link
                  key={rec.href}
                  href={rec.href}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-[#0066FF]/30 hover:shadow-sm transition-all group"
                >
                  <div className="text-2xl mb-2">{rec.icon}</div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-[#0066FF] transition-colors">{t(rec.titleKey)}</p>
                  <p className="text-xs text-gray-400 mt-1">{t(rec.descKey)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search empty */}
        {!loading && !error && trips.length > 0 && displayTrips.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>{t("trips.searchEmpty")}</p>
            <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#0066FF] hover:underline">
              {t("trips.clearSearch")}
            </button>
          </div>
        )}

        {/* Tab empty state */}
        {!loading && !error && trips.length === 0 && activeTab !== "all" && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">{t("trips.empty")}</p>
          </div>
        )}

      </div>
      <MobileNav />
    </div>
  );
}
