"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchTrips,
  fetchCultivationMine,
  type Trip,
  type TripStatus,
  type CultivationMineResponse,
} from "@/lib/api";

/* ── Constants ────────────────────────────────────────────── */

type TripModule = "all" | "personal" | "family" | "enterprise";

const MODULE_COLORS: Record<Exclude<TripModule, "all">, { border: string; bg: string; text: string; gradient: string; light: string }> = {
  personal:   { border: "border-l-indigo-500",  bg: "bg-indigo-50",  text: "text-indigo-600",  gradient: "from-indigo-500 to-indigo-600",  light: "bg-indigo-500/10" },
  family:     { border: "border-l-amber-500",   bg: "bg-amber-50",   text: "text-amber-600",   gradient: "from-amber-500 to-amber-600",   light: "bg-amber-500/10" },
  enterprise: { border: "border-l-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600", light: "bg-emerald-500/10" },
};

const MODULE_ICONS: Record<Exclude<TripModule, "all">, string> = {
  personal: "🧘",
  family: "👨‍👩‍👧‍👦",
  enterprise: "🏢",
};

const STATUS_STYLE: Record<TripStatus, { color: string; bgColor: string }> = {
  DRAFT:       { color: "text-gray-500",    bgColor: "bg-gray-100 border-gray-200" },
  PLANNING:    { color: "text-orange-500",  bgColor: "bg-orange-50 border-orange-200" },
  SUBMITTED:   { color: "text-blue-400",    bgColor: "bg-blue-400/10 border-blue-400/20" },
  CONFIRMED:   { color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  PAID:        { color: "text-green-400",   bgColor: "bg-green-400/10 border-green-400/20" },
  PREPARING:   { color: "text-amber-400",   bgColor: "bg-amber-400/10 border-amber-400/20" },
  IN_PROGRESS: { color: "text-[#3264ff]",   bgColor: "bg-[#3264ff]/10 border-[#3264ff]/20" },
  COMPLETED:   { color: "text-emerald-400", bgColor: "bg-emerald-400/10 border-emerald-400/20" },
  REVIEWING:   { color: "text-purple-400",  bgColor: "bg-purple-400/10 border-purple-400/20" },
  CANCELLED:   { color: "text-red-400",     bgColor: "bg-red-400/10 border-red-400/20" },
  REFUNDING:   { color: "text-orange-400",  bgColor: "bg-orange-400/10 border-orange-400/20" },
  REFUNDED:    { color: "text-gray-400",    bgColor: "bg-gray-400/10 border-gray-400/20" },
};

const STATUS_PROGRESS: Record<TripStatus, number> = {
  DRAFT: 10, PLANNING: 25, SUBMITTED: 40, CONFIRMED: 50, PAID: 60,
  PREPARING: 70, IN_PROGRESS: 85, COMPLETED: 100, REVIEWING: 95,
  CANCELLED: 0, REFUNDING: 0, REFUNDED: 0,
};

const STATUS_PROGRESS_COLOR: Record<TripStatus, string> = {
  DRAFT: "bg-gray-400", PLANNING: "bg-orange-400", SUBMITTED: "bg-blue-400",
  CONFIRMED: "bg-emerald-500", PAID: "bg-green-500", PREPARING: "bg-amber-400",
  IN_PROGRESS: "bg-[#3264ff]", COMPLETED: "bg-emerald-500", REVIEWING: "bg-purple-400",
  CANCELLED: "bg-gray-300", REFUNDING: "bg-orange-300", REFUNDED: "bg-gray-300",
};

const STATUS_TAB_KEYS: Array<{ key: "all" | TripStatus; i18nKey: string }> = [
  { key: "all",         i18nKey: "trips.tab.all" },
  { key: "PLANNING",    i18nKey: "trips.tab.planning" },
  { key: "CONFIRMED",   i18nKey: "trips.tab.confirmed" },
  { key: "IN_PROGRESS", i18nKey: "trips.tab.inProgress" },
  { key: "COMPLETED",   i18nKey: "trips.tab.completed" },
];

type ViewMode = "list" | "calendar";

/* ── Helpers ──────────────────────────────────────────────── */

function classifyTrip(trip: Trip): Exclude<TripModule, "all"> {
  const p = trip.persons ?? 1;
  if (p <= 1) return "personal";
  if (p <= 8) return "family";
  return "enterprise";
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

function getCountdownDays(startDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getMonthName(month: number): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month] ?? "";
}

function getTripsForMonth(trips: Trip[], year: number, month: number): Trip[] {
  return trips.filter((trip) => {
    if (!trip.startDate) return false;
    const d = new Date(trip.startDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/* ── Page Component ───────────────────────────────────────── */

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [activeModule, setActiveModule] = useState<TripModule>("all");
  const [activeTab, setActiveTab] = useState<"all" | TripStatus>("all");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [cultivation, setCultivation] = useState<CultivationMineResponse | null>(null);

  /* ── Derived data ── */

  // Module-filtered trips
  const moduleTrips = useMemo(() => {
    if (activeModule === "all") return trips;
    return trips.filter((tr) => classifyTrip(tr) === activeModule);
  }, [trips, activeModule]);

  // Status-filtered (within module)
  const statusFilteredTrips = useMemo(() => {
    if (activeTab === "all") return moduleTrips;
    return moduleTrips.filter((tr) => tr.status === activeTab);
  }, [moduleTrips, activeTab]);

  // Search filter
  const displayTrips = useMemo(() => {
    if (!searchQuery.trim()) return statusFilteredTrips;
    const q = searchQuery.toLowerCase();
    return statusFilteredTrips.filter(
      (trip) =>
        trip.title.toLowerCase().includes(q) ||
        trip.sites.some((s) => s.site?.name?.toLowerCase().includes(q))
    );
  }, [statusFilteredTrips, searchQuery]);

  // Module counts
  const moduleCounts = useMemo(() => ({
    all: trips.length,
    personal: trips.filter((tr) => classifyTrip(tr) === "personal").length,
    family: trips.filter((tr) => classifyTrip(tr) === "family").length,
    enterprise: trips.filter((tr) => classifyTrip(tr) === "enterprise").length,
  }), [trips]);

  // Stats for current module
  const tripStats = useMemo(() => {
    const src = moduleTrips;
    const statusCounts: Record<string, number> = {};
    src.forEach((tr) => { statusCounts[tr.status] = (statusCounts[tr.status] || 0) + 1; });
    const totalBudget = src.reduce((sum, tr) => sum + (tr.totalBudget ?? 0), 0);
    const totalSites = src.reduce((sum, tr) => sum + tr.sites.length, 0);
    return { total: src.length, statusCounts, totalBudget, totalSites };
  }, [moduleTrips]);

  // Upcoming trip
  const upcomingTrip = useMemo(() => {
    const activeStatuses: TripStatus[] = ["PLANNING", "CONFIRMED", "PAID", "PREPARING"];
    const candidates = moduleTrips
      .filter((tr) => activeStatuses.includes(tr.status) && tr.startDate)
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());
    return candidates[0] ?? null;
  }, [moduleTrips]);

  const countdownDays = useMemo(() => {
    if (!upcomingTrip) return null;
    return getCountdownDays(upcomingTrip.startDate);
  }, [upcomingTrip]);

  // Calendar
  const calendarMonthTrips = useMemo(
    () => getTripsForMonth(moduleTrips, calendarYear, calendarMonth),
    [moduleTrips, calendarYear, calendarMonth]
  );
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [calendarYear, calendarMonth]);

  /* ── Effects ── */

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/trips");
    }
  }, [authLoading, user, router]);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrips({ limit: 100 });
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!user) return;
    loadTrips();
    fetchCultivationMine()
      .then(setCultivation)
      .catch(() => setCultivation({ hasAccess: false, role: "NONE", expiresAt: null, application: null }));
  }, [user, loadTrips]);

  /* ── Auth guard ── */

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3264ff]/30 border-t-[#3264ff] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("common.loading")}</p>
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

      {/* ═══════ Grand Hero ═══════ */}
      <div className="relative bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc] text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-40px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-30px] left-[-20px] w-40 h-40 rounded-full bg-white/5" />

        <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 relative z-10">
          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-3">
            {t("trips.trilogy.badge")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
            {t("trips.trilogy.title")}
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mb-8">
            {t("trips.trilogy.subtitle")}
          </p>

          {/* 3 Module Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["personal", "family", "enterprise"] as const).map((mod) => {
              const mc = MODULE_COLORS[mod];
              return (
                <button
                  key={mod}
                  onClick={() => { setActiveModule(mod); setActiveTab("all"); }}
                  className={`text-left rounded-2xl p-5 transition-all backdrop-blur-sm border ${
                    activeModule === mod
                      ? "bg-white/20 border-white/40 shadow-lg shadow-white/10"
                      : "bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{MODULE_ICONS[mod]}</span>
                    <span className="font-bold text-lg">{t(`trips.module.${mod}`)}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    {t(`trips.module.${mod}.subtitle`)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{moduleCounts[mod]}</span>
                    <span className="text-white/50 text-sm">{t("trips.module.tripCount")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ Main Content ═══════ */}
      <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-20">

        {/* Module Tab Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex items-center gap-1 overflow-x-auto">
          {(["all", "personal", "family", "enterprise"] as TripModule[]).map((mod) => (
            <button
              key={mod}
              onClick={() => { setActiveModule(mod); setActiveTab("all"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeModule === mod
                  ? mod === "all"
                    ? "bg-[#3264ff] text-white shadow-md shadow-[#3264ff]/20"
                    : `bg-gradient-to-r ${MODULE_COLORS[mod].gradient} text-white shadow-md`
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {mod !== "all" && <span className="text-base">{MODULE_ICONS[mod]}</span>}
              {t(`trips.module.${mod}`)}
              <span className={`text-xs ${activeModule === mod ? "text-white/70" : "text-gray-400"}`}>
                ({moduleCounts[mod]})
              </span>
            </button>
          ))}

          <div className="flex-1" />

          {/* View toggle + Create */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                title={t("trips.viewList")}
                className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-[#3264ff]/10 text-[#3264ff]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                title={t("trips.viewCalendar")}
                className={`px-3 py-2 transition-colors ${viewMode === "calendar" ? "bg-[#3264ff]/10 text-[#3264ff]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <Link
              href="/trips/create"
              className="px-5 py-2.5 bg-[#3264ff] text-white font-semibold rounded-xl text-sm hover:bg-[#1e4dcc] transition-colors shadow-lg shadow-[#3264ff]/20"
            >
              + {t("trips.createNew")}
            </Link>
          </div>
        </div>

        {/* ═══════ 修行圈 Gateway Card (M37) ═══════ */}
        {cultivation && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-amber-200/60 bg-gradient-to-br from-[#1a1410] via-[#2a1f15] to-[#1a1410] text-white shadow-lg">
            <div className="p-6 flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                ☸
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-amber-100">圆满之路 · 修行圈</h3>
                  {cultivation.hasAccess && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      {cultivation.role}
                    </span>
                  )}
                </div>
                <p className="text-amber-100/70 text-sm leading-relaxed mb-3">
                  {cultivation.hasAccess
                    ? "禅宗为主线 · 12文化融通 · 七境界×十牛图，开启你的圆满日修。"
                    : cultivation.application?.status === "PENDING"
                    ? "你的申请正在审核中，通过后即可开启修行系统。"
                    : cultivation.application?.status === "REJECTED"
                    ? "上次申请未通过，可在 30 天后重新提交。"
                    : "需要管理员授权或导师邀请才能进入。提交申请或使用邀请码开启你的圆满之路。"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cultivation.hasAccess ? (
                    <Link
                      href="/trips/cultivation"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                    >
                      进入修行罗盘 →
                    </Link>
                  ) : (
                    <Link
                      href="/trips/cultivation/apply"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                    >
                      {cultivation.application?.status === "PENDING" ? "查看申请进度" : "申请 / 兑换邀请码"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module Inspiration Banner */}
        {activeModule !== "all" && (
          <div className={`rounded-2xl p-6 mb-6 border ${MODULE_COLORS[activeModule].bg} border-${activeModule === "personal" ? "indigo" : activeModule === "family" ? "amber" : "emerald"}-200/50`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{MODULE_ICONS[activeModule]}</span>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${MODULE_COLORS[activeModule].text} mb-1`}>
                  {t(`trips.module.${activeModule}`)}
                </h2>
                <p className={`${MODULE_COLORS[activeModule].text} opacity-70 text-sm mb-2`}>
                  {t(`trips.module.${activeModule}.subtitle`)}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(`trips.module.${activeModule}.description`)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Banner */}
        {upcomingTrip && countdownDays !== null && countdownDays > 0 && countdownDays <= 30 && (
          <Link
            href={`/trips/${upcomingTrip.id}`}
            className="block mb-6 rounded-2xl bg-gradient-to-r from-[#3264ff] to-[#4a7aff] text-white p-5 shadow-lg shadow-[#3264ff]/20 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">{t("trips.countdown.nextTrip")}</p>
                <p className="font-bold text-xl leading-tight">{upcomingTrip.title}</p>
                <p className="text-sm text-white/70 mt-1">
                  {formatDate(upcomingTrip.startDate)}
                  {upcomingTrip.endDate ? ` ~ ${formatDate(upcomingTrip.endDate)}` : ""}
                </p>
              </div>
              <div className="text-center shrink-0 ml-6">
                <div className="text-5xl font-bold leading-none">{countdownDays}</div>
                <div className="text-xs text-white/80 mt-1">{t("trips.countdown.daysLeft")}</div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Dashboard */}
        {moduleTrips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#3264ff]">{tripStats.total}</p>
              <p className="text-xs text-gray-500 mt-1">{t("trips.stats.total")}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{tripStats.statusCounts["COMPLETED"] || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t("trips.stats.completed")}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#3264ff]">{tripStats.statusCounts["IN_PROGRESS"] || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t("trips.stats.active")}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{tripStats.totalSites}</p>
              <p className="text-xs text-gray-500 mt-1">{t("trips.stats.sitesVisited")}</p>
            </div>
          </div>
        )}

        {/* Budget Summary */}
        {moduleTrips.length > 0 && tripStats.totalBudget > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{t("trips.budget.totalLabel")}</p>
              <p className="font-bold text-gray-900 text-xl">
                ¥{tripStats.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">{t("trips.budget.avgPerTrip")}</p>
              <p className="text-sm font-semibold text-gray-700">
                ¥{Math.round(tripStats.totalBudget / (moduleTrips.filter(tr => tr.totalBudget).length || 1)).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {STATUS_TAB_KEYS.map((tab) => {
            const count = tab.key === "all" ? moduleTrips.length : moduleTrips.filter(tr => tr.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === tab.key
                    ? "bg-[#3264ff]/10 text-[#3264ff] border border-[#3264ff]/30 font-medium"
                    : "text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200"
                }`}
              >
                {t(tab.i18nKey)}
                {count > 0 && (
                  <span className={`text-xs ${activeTab === tab.key ? "text-[#3264ff]/60" : "text-gray-400"}`}>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3264ff]/30 focus:border-[#3264ff] shadow-sm"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3264ff]/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#3264ff]/30 border-t-[#3264ff] rounded-full animate-spin" />
            </div>
            <p className="text-gray-500">{t("trips.loading")}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadTrips}
              className="px-5 py-2.5 bg-[#3264ff]/10 text-[#3264ff] rounded-xl text-sm font-medium hover:bg-[#3264ff]/20 transition-colors"
            >
              {t("trips.retry")}
            </button>
          </div>
        )}

        {/* Calendar View */}
        {!loading && !error && viewMode === "calendar" && moduleTrips.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevCalendarMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h3 className="font-bold text-gray-900 text-lg">{calendarYear} {t(`trips.calendar.months.${getMonthName(calendarMonth)}`)}</h3>
              <button onClick={nextCalendarMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: calendarDays.firstDay }, (_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: calendarDays.daysInMonth }, (_, i) => {
                const day = i + 1;
                const today = new Date();
                const isToday = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth && today.getDate() === day;
                const tripOnDay = moduleTrips.find((tr) => {
                  if (!tr.startDate) return false;
                  const d = new Date(tr.startDate);
                  return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth && d.getDate() === day;
                });
                return (
                  <div key={day} className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${isToday ? "bg-[#3264ff] text-white" : "text-gray-700 hover:bg-gray-100"} ${tripOnDay ? "font-bold" : ""}`}>
                      {day}
                    </div>
                    {tripOnDay && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${STATUS_PROGRESS_COLOR[tripOnDay.status]}`} />}
                  </div>
                );
              })}
            </div>
            {calendarMonthTrips.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium mb-2">{t("trips.calendar.tripsThisMonth")}</p>
                {calendarMonthTrips.map((tr) => {
                  const sc = STATUS_STYLE[tr.status];
                  const mod = classifyTrip(tr);
                  return (
                    <Link key={tr.id} href={`/trips/${tr.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full ${STATUS_PROGRESS_COLOR[tr.status]} shrink-0`} />
                      <span className="text-base">{MODULE_ICONS[mod]}</span>
                      <span className="flex-1 text-sm text-gray-800 font-medium truncate">{tr.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.bgColor} ${sc.color}`}>{formatDate(tr.startDate)}</span>
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

        {/* ═══════ Trip Cards — Elevated List View ═══════ */}
        {!loading && !error && viewMode === "list" && displayTrips.length > 0 && (
          <div className="space-y-4">
            {displayTrips.map((trip, i) => {
              const sc = STATUS_STYLE[trip.status] ?? { color: "text-gray-500", bgColor: "bg-gray-100 border-gray-200" };
              const statusLabel = t(`trip.status.${trip.status}`);
              const progress = STATUS_PROGRESS[trip.status];
              const progressColor = STATUS_PROGRESS_COLOR[trip.status];
              const tripCountdown = getCountdownDays(trip.startDate);
              const showCountdown = tripCountdown !== null && tripCountdown > 0 && tripCountdown <= 60 && !["COMPLETED", "CANCELLED", "REFUNDING", "REFUNDED"].includes(trip.status);
              const mod = classifyTrip(trip);
              const mc = MODULE_COLORS[mod];

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className={`block rounded-2xl bg-white shadow-sm border border-gray-100 border-l-4 ${mc.border} hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-in-up overflow-hidden`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Cover Image — Larger */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                        {trip.sites[0]?.site?.imageUrl ? (
                          <img src={trip.sites[0].site.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <span className="text-3xl">{MODULE_ICONS[mod]}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Module Tag + Status */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${mc.light} ${mc.text}`}>
                            {MODULE_ICONS[mod]} {t(`trips.module.${mod}`)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${sc.bgColor} ${sc.color}`}>
                            {statusLabel}
                          </span>
                          {showCountdown && (
                            <span className="text-xs bg-[#3264ff]/10 text-[#3264ff] font-semibold px-2 py-0.5 rounded-full">
                              {t("trips.countdown.chipDays", { days: tripCountdown })}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate mb-1">
                          {trip.title}
                        </h3>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {trip.sites.length} {t("trips.siteCount")}
                          </span>
                          {trip.persons && trip.persons > 1 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {trip.persons}{t("trips.personUnit")}
                            </span>
                          )}
                          {(trip.startDate || trip.endDate) && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                            </span>
                          )}
                          {trip.totalBudget && trip.totalBudget > 0 ? (
                            <span className="text-amber-600 font-semibold">¥{trip.totalBudget.toLocaleString()}</span>
                          ) : null}
                        </div>

                        {/* Site Tags */}
                        {trip.sites.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {trip.sites.slice(0, 4).map((s) => (
                              <span key={s.id} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100">
                                {s.site?.name || t("trips.unknownSite")}
                              </span>
                            ))}
                            {trip.sites.length > 4 && (
                              <span className="px-2.5 py-1 text-gray-400 text-xs">+{trip.sites.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Progress Bar */}
                        {!["CANCELLED", "REFUNDING", "REFUNDED"].includes(trip.status) && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">{t("trips.progress.label")}</span>
                              <span className="text-xs font-semibold text-gray-600">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-end gap-2 shrink-0 mt-2">
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {trip.status === "DRAFT" && (
                          <span className="text-xs text-[#3264ff] font-medium whitespace-nowrap">{t("trips.continueEditing")}</span>
                        )}
                        {trip.status === "CONFIRMED" && (
                          <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">{t("trips.goToPay")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ═══════ Empty States ═══════ */}

        {/* Module-specific empty (has trips globally but none in this module) */}
        {!loading && !error && trips.length > 0 && moduleTrips.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-20 h-20 mx-auto mb-5 rounded-full ${activeModule !== "all" ? MODULE_COLORS[activeModule as Exclude<TripModule, "all">].light : "bg-[#3264ff]/10"} flex items-center justify-center`}>
              <span className="text-4xl">{activeModule !== "all" ? MODULE_ICONS[activeModule as Exclude<TripModule, "all">] : "🏛"}</span>
            </div>
            <h3 className="text-gray-700 font-bold text-xl mb-2">
              {activeModule !== "all" ? t(`trips.module.${activeModule}.empty`) : t("trips.empty.title")}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {activeModule !== "all" ? t(`trips.module.${activeModule}.emptyHint`) : t("trips.empty.subtitle")}
            </p>
            <Link
              href="/trips/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3264ff] text-white font-semibold rounded-xl text-sm hover:bg-[#1e4dcc] transition-colors shadow-lg shadow-[#3264ff]/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("trips.createNew")}
            </Link>
          </div>
        )}

        {/* Global empty — no trips at all */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#3264ff]/10 to-indigo-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#3264ff]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-2xl mb-2">{t("trips.empty.title")}</h3>
            <p className="text-gray-500 text-base mb-2">{t("trips.empty.subtitle")}</p>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">{t("trips.trilogy.subtitle")}</p>

            {/* 3 Module Intro Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {(["personal", "family", "enterprise"] as const).map((mod) => {
                const mc = MODULE_COLORS[mod];
                return (
                  <div key={mod} className={`rounded-2xl p-5 ${mc.bg} border border-${mod === "personal" ? "indigo" : mod === "family" ? "amber" : "emerald"}-200/50 text-left`}>
                    <span className="text-3xl mb-3 block">{MODULE_ICONS[mod]}</span>
                    <h4 className={`font-bold ${mc.text} mb-1`}>{t(`trips.module.${mod}`)}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{t(`trips.module.${mod}.subtitle`)}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/trips/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#3264ff] text-white font-bold rounded-xl text-sm hover:bg-[#1e4dcc] transition-colors shadow-lg shadow-[#3264ff]/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("trips.createNew")}
              </Link>
              <Link
                href="/holy-sites#routes"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-[#3264ff] hover:text-[#3264ff] transition-colors"
              >
                {t("trips.browseRoutes")}
              </Link>
            </div>
          </div>
        )}

        {/* Search empty */}
        {!loading && !error && moduleTrips.length > 0 && displayTrips.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">{t("trips.searchEmpty")}</p>
            <button onClick={() => setSearchQuery("")} className="text-sm text-[#3264ff] hover:underline font-medium">
              {t("trips.clearSearch")}
            </button>
          </div>
        )}

      </div>
      <MobileNav />
    </div>
  );
}
