"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import SealCard from "@/components/SealCard";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import type { Seal, SealSeries } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const seriesOrder: SealSeries[] = [
  "CHUYIN",
  "ZHONGYIN",
  "YINGUOYIN",
  "CHENGDAOYIN",
  "GUIYUANYIN",
];

const SERIES_STYLE: Record<string, { icon: string; color: string; bgActive: string }> = {
  CHUYIN:      { icon: "🌱", color: "blue",    bgActive: "bg-blue-500 text-white shadow-lg shadow-blue-500/20" },
  ZHONGYIN:    { icon: "🌊", color: "emerald", bgActive: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" },
  YINGUOYIN:   { icon: "🔮", color: "amber",   bgActive: "bg-amber-500 text-white shadow-lg shadow-amber-500/20" },
  CHENGDAOYIN: { icon: "💎", color: "purple",  bgActive: "bg-purple-500 text-white shadow-lg shadow-purple-500/20" },
  GUIYUANYIN:  { icon: "🌕", color: "rose",    bgActive: "bg-rose-500 text-white shadow-lg shadow-rose-500/20" },
};

// Difficulty level by series — no new API needed, derived from series position
const SERIES_DIFFICULTY: Record<SealSeries, "beginner" | "intermediate" | "advanced"> = {
  CHUYIN:      "beginner",
  ZHONGYIN:    "beginner",
  YINGUOYIN:   "intermediate",
  CHENGDAOYIN: "advanced",
  GUIYUANYIN:  "advanced",
};

function useSeriesMeta(t: (key: string) => string) {
  return {
    CHUYIN:      { ...SERIES_STYLE.CHUYIN, label: t("seals.series.chuyin"), desc: t("seals.series.chuyinDesc") },
    ZHONGYIN:    { ...SERIES_STYLE.ZHONGYIN, label: t("seals.series.zhongyin"), desc: t("seals.series.zhongyinDesc") },
    YINGUOYIN:   { ...SERIES_STYLE.YINGUOYIN, label: t("seals.series.yinguoyin"), desc: t("seals.series.yinguoyinDesc") },
    CHENGDAOYIN: { ...SERIES_STYLE.CHENGDAOYIN, label: t("seals.series.chengdaoyin"), desc: t("seals.series.chengdaoyinDesc") },
    GUIYUANYIN:  { ...SERIES_STYLE.GUIYUANYIN, label: t("seals.series.guiyuanyin"), desc: t("seals.series.guiyuanyinDesc") },
  };
}

const SERIES_DOT_COLORS: Record<string, string> = {
  CHUYIN: "bg-blue-400", ZHONGYIN: "bg-emerald-400", YINGUOYIN: "bg-amber-400",
  CHENGDAOYIN: "bg-purple-400", GUIYUANYIN: "bg-rose-400",
};

const SERIES_RING_COLORS: Record<string, string> = {
  CHUYIN: "ring-blue-400", ZHONGYIN: "ring-emerald-400", YINGUOYIN: "ring-amber-400",
  CHENGDAOYIN: "ring-purple-400", GUIYUANYIN: "ring-rose-400",
};

const SERIES_GRADIENT: Record<string, string> = {
  CHUYIN: "from-blue-500 to-cyan-500",
  ZHONGYIN: "from-emerald-500 to-teal-500",
  YINGUOYIN: "from-amber-500 to-orange-500",
  CHENGDAOYIN: "from-purple-500 to-violet-500",
  GUIYUANYIN: "from-rose-500 to-pink-500",
};

// Difficulty badge styles
const DIFFICULTY_STYLE: Record<"beginner" | "intermediate" | "advanced", { bg: string; text: string; icon: string }> = {
  beginner:     { bg: "bg-green-100",  text: "text-green-700",  icon: "🌱" },
  intermediate: { bg: "bg-amber-100",  text: "text-amber-700",  icon: "🔥" },
  advanced:     { bg: "bg-purple-100", text: "text-purple-700", icon: "💎" },
};

function useSortOptions(t: (key: string) => string) {
  return [
    { value: "default", label: t("seals.sort.default") },
    { value: "name-asc", label: t("seals.sort.nameAsc") },
    { value: "name-desc", label: t("seals.sort.nameDesc") },
    { value: "series", label: t("seals.sort.series") },
    { value: "difficulty-asc", label: t("seals.sort.difficultyAsc") },
    { value: "difficulty-desc", label: t("seals.sort.difficultyDesc") },
  ];
}

// Day-of-week seal rotation — purely client-side, no API
function getDailySeal(seals: Seal[]): Seal | null {
  if (!seals.length) return null;
  const dayOfYear = Math.floor(Date.now() / 86400000);
  return seals[dayOfYear % seals.length];
}

const DIFFICULTY_ORDER: Record<"beginner" | "intermediate" | "advanced", number> = {
  beginner: 0, intermediate: 1, advanced: 2,
};

interface Props {
  seals: Seal[];
  error?: boolean;
}

/* ─── Difficulty Badge ─── */
function DifficultyBadge({ series, t }: { series: SealSeries; t: (key: string) => string }) {
  const level = SERIES_DIFFICULTY[series];
  const style = DIFFICULTY_STYLE[level];
  const labelKey = `seals.difficulty.${level}` as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span>{style.icon}</span>
      {t(labelKey)}
    </span>
  );
}

/* ─── Seal Detail Modal ─── */
function SealDetailModal({ seal, onClose, t }: { seal: Seal; onClose: () => void; t: (key: string) => string }) {
  const SERIES_META = useSeriesMeta(t);
  const meta = SERIES_META[seal.series];
  const dotColor = SERIES_DOT_COLORS[seal.series] || "bg-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[80px] opacity-5">{meta?.icon || "🙏"}</div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm text-white/60">{meta?.label}</span>
            <DifficultyBadge series={seal.series} t={t} />
          </div>
          <span className="text-4xl font-serif font-bold text-white/30 block mb-1">
            {String(seal.id).padStart(2, "0")}
          </span>
          <h2 className="text-2xl font-serif font-bold">{seal.name}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Poem */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("seals.modal.poem")}</h3>
            <blockquote className="text-gray-800 font-serif text-lg leading-relaxed border-l-4 border-gray-200 pl-4 whitespace-pre-line">
              {seal.poem}
            </blockquote>
          </div>

          {/* Essence */}
          {seal.essence && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("seals.modal.essence")}</h3>
              <p className="text-gray-700 leading-relaxed">{seal.essence}</p>
            </div>
          )}

          {/* Practice */}
          {seal.practice && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
                🧘 {t("seals.modal.practice")}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{seal.practice}</p>
            </div>
          )}

          {/* Vow */}
          {seal.vow && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-1.5">
                🙏 {t("seals.modal.vow")}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{seal.vow}</p>
            </div>
          )}

          {/* Meditation Timer CTA */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-indigo-700 mb-0.5">{t("seals.modal.meditationTitle")}</p>
                <p className="text-xs text-indigo-500 mb-2">{t("seals.modal.meditationDesc")}</p>
                <Link
                  href={`/chat?q=${encodeURIComponent(t("seals.modal.meditationQuery").replace("{name}", seal.name))}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline transition-colors"
                  onClick={onClose}
                >
                  {t("seals.modal.meditationCta")} →
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <Link
              href={`/seals/${seal.id}`}
              className="flex-1 text-center px-4 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl hover:bg-[#0052CC] transition-colors text-sm"
            >
              {t("seals.modal.viewDetail")}
            </Link>
            <ShareButton
              title={`${t("seals.unit")} ${seal.id} · ${seal.name}`}
              description={seal.poem}
              url={typeof window !== "undefined" ? `${window.location.origin}/seals/${seal.id}` : ""}
              entityType="HOLY_SITE"
              entityId={String(seal.id)}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Daily Seal Banner ─── */
function DailySealBanner({ seal, onOpen, t }: { seal: Seal; onOpen: () => void; t: (key: string) => string }) {
  const gradient = SERIES_GRADIENT[seal.series] || "from-blue-500 to-purple-500";
  const icon = SERIES_STYLE[seal.series]?.icon || "🙏";
  const dotColor = SERIES_DOT_COLORS[seal.series] || "bg-gray-400";

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-5 mb-8 text-white relative overflow-hidden shadow-lg`}>
      {/* Background decoration */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[120px] opacity-10 select-none">{icon}</div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex items-start gap-4">
        {/* Left: label */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">{icon}</div>
          <span className="text-[10px] uppercase tracking-wide text-white/70 font-semibold">{t("seals.daily.label")}</span>
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold bg-white/20 rounded-full px-2 py-0.5`}>
              {t("seals.unit")} {String(seal.id).padStart(2, "0")}
            </span>
            <DifficultyBadge series={seal.series} t={t} />
          </div>
          <h3 className="text-lg font-serif font-bold mb-1">{seal.name}</h3>
          <p className="text-white/80 text-sm font-serif line-clamp-2 leading-relaxed">{seal.poem}</p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
            >
              🔍 {t("seals.daily.explore")}
            </button>
            <Link
              href={`/seals/${seal.id}`}
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors font-medium"
            >
              {t("seals.daily.fullPage")} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Series Journey Map ─── */
function SeriesJourneyMap({
  seriesStats,
  filter,
  onSelectSeries,
  t,
}: {
  seriesStats: { series: SealSeries; count: number; meta: { icon: string; label: string; desc: string } }[];
  filter: SealSeries | null;
  onSelectSeries: (s: SealSeries | null) => void;
  t: (key: string) => string;
}) {
  const totalSeals = seriesStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🗺️</span> {t("seals.progressOverview")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{totalSeals}/30 {t("seals.unitCount")}</span>
        </div>
      </div>

      {/* Segmented progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-5 flex gap-0.5">
        {seriesStats.map((stat) => (
          <button
            key={stat.series}
            onClick={() => onSelectSeries(filter === stat.series ? null : stat.series)}
            className={`h-full transition-all ${SERIES_DOT_COLORS[stat.series] || "bg-gray-300"} ${
              filter === stat.series ? "opacity-100 ring-2 ring-offset-1 ring-gray-400" : "opacity-80 hover:opacity-100"
            }`}
            style={{ width: `${(stat.count / 30) * 100}%` }}
            title={`${stat.meta.label}: ${stat.count}`}
          />
        ))}
      </div>

      {/* Series path — horizontal journey map */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-rose-200 hidden sm:block" />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {seriesStats.map((stat, idx) => {
            const isActive = filter === stat.series;
            const level = SERIES_DIFFICULTY[stat.series];
            const diffStyle = DIFFICULTY_STYLE[level];
            // Achievement: series fully loaded (we compare count to seals in series — for demo: 6 seals per series)
            const isComplete = stat.count >= 6;

            return (
              <button
                key={stat.series}
                onClick={() => onSelectSeries(filter === stat.series ? null : stat.series)}
                className={`relative text-left rounded-xl p-3 border transition-all group ${
                  isActive
                    ? `${SERIES_RING_COLORS[stat.series]} ring-2 bg-white shadow-md`
                    : "border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm"
                }`}
              >
                {/* Step indicator */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-500 flex items-center justify-center shadow-sm">
                  {idx + 1}
                </div>

                {/* Achievement badge */}
                {isComplete && (
                  <div className="absolute -top-1 -left-1">
                    <span className="text-base" title={t("seals.achievement.seriesComplete").replace("{series}", stat.meta.label)}>🏅</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{stat.meta.icon}</span>
                  <span className="font-bold text-gray-900 text-xs leading-tight">{stat.meta.label}</span>
                </div>

                {/* Difficulty micro-badge */}
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${diffStyle.bg} ${diffStyle.text} mb-1.5`}>
                  {diffStyle.icon} {t(`seals.difficulty.${level}`)}
                </span>

                <p className="text-xs text-gray-400 line-clamp-1">{stat.meta.desc}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">{stat.count} {t("seals.unitCount")}</span>
                  {/* Mini progress dots */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(stat.count, 6) }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${SERIES_DOT_COLORS[stat.series]}`} />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Journey path label */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>←</span>
          <span>{t("seals.journey.start")}</span>
          <div className="flex-1 border-t border-dashed border-gray-200 max-w-xs" />
          <span>{t("seals.journey.end")}</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SealsClient({ seals, error }: Props) {
  const { t, locale } = useTranslation();
  const SERIES_META = useSeriesMeta(t);
  const SORT_OPTIONS = useSortOptions(t);
  const [filter, setFilter] = useState<SealSeries | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "roadmap">("grid");
  const [showDailyBanner, setShowDailyBanner] = useState(true);

  const dailySeal = useMemo(() => getDailySeal(seals), [seals]);

  const filtered = useMemo(() => {
    let result = seals;
    if (filter) result = result.filter((s) => s.series === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.poem.toLowerCase().includes(q) ||
          (s.essence ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name, locale));
    if (sort === "name-desc") result = [...result].sort((a, b) => b.name.localeCompare(a.name, locale));
    if (sort === "difficulty-asc") {
      result = [...result].sort(
        (a, b) => DIFFICULTY_ORDER[SERIES_DIFFICULTY[a.series]] - DIFFICULTY_ORDER[SERIES_DIFFICULTY[b.series]]
      );
    }
    if (sort === "difficulty-desc") {
      result = [...result].sort(
        (a, b) => DIFFICULTY_ORDER[SERIES_DIFFICULTY[b.series]] - DIFFICULTY_ORDER[SERIES_DIFFICULTY[a.series]]
      );
    }
    return result;
  }, [seals, filter, search, sort, locale]);

  // Group by series
  const displayGroups = useMemo(() => {
    return seriesOrder
      .map((series) => ({
        series,
        meta: SERIES_META[series],
        seals: filtered.filter((s) => s.series === series),
      }))
      .filter((g) => !filter || g.series === filter);
  }, [filtered, filter, SERIES_META]);

  // Series stats for progress
  const seriesStats = useMemo(() => {
    return seriesOrder.map((series) => {
      const count = seals.filter((s) => s.series === series).length;
      return { series, count, meta: SERIES_META[series] };
    });
  }, [seals, SERIES_META]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.thirtySeals")}
            </h1>
          </div>
          <DataLoadError />
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">
            {t("section.thirtySeals")}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t("seals.subtitle")}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {t("seals.statsLine").replace("{total}", String(seals.length)).replace("{series}", String(seriesOrder.length))}
          </p>
          {/* Difficulty legend */}
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <span className="text-xs text-gray-400">{t("seals.difficulty.legend")}:</span>
            {(["beginner", "intermediate", "advanced"] as const).map((level) => {
              const s = DIFFICULTY_STYLE[level];
              return (
                <span key={level} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                  {s.icon} {t(`seals.difficulty.${level}`)}
                </span>
              );
            })}
          </div>
        </div>

        {/* ══════ Daily Seal Recommendation (对标TripAdvisor "Today's Pick") ══════ */}
        {showDailyBanner && dailySeal && (
          <div className="relative">
            <button
              onClick={() => setShowDailyBanner(false)}
              className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs transition-colors"
              aria-label={t("seals.daily.dismiss")}
            >
              ✕
            </button>
            <DailySealBanner
              seal={dailySeal}
              onOpen={() => setSelectedSeal(dailySeal)}
              t={t}
            />
          </div>
        )}

        {/* ══════ Series Journey Map (对标Duolingo学习路径+TripAdvisor成就系统) ══════ */}
        <SeriesJourneyMap
          seriesStats={seriesStats}
          filter={filter}
          onSelectSeries={setFilter}
          t={t}
        />

        {/* ══════ Toolbar: Search + Sort + View Toggle ══════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("seals.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "grid" ? "bg-[#0066FF] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title={t("seals.viewGrid")}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode("roadmap")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "roadmap" ? "bg-[#0066FF] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title={t("seals.viewRoadmap")}
              >
                ⟶
              </button>
            </div>
          </div>
          {/* Active filter summary */}
          {(filter || search) && (
            <div className="mt-3 flex items-center gap-2 text-sm flex-wrap">
              <span className="text-gray-400">{t("seals.foundCount").replace("{count}", String(filtered.length))}</span>
              {filter && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_STYLE[SERIES_DIFFICULTY[filter]].bg} ${DIFFICULTY_STYLE[SERIES_DIFFICULTY[filter]].text}`}>
                  {SERIES_META[filter].icon} {SERIES_META[filter].label}
                </span>
              )}
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                {t("seals.clearFilters")}
              </button>
            </div>
          )}
        </div>

        {/* ══════ Series Filter Pills ══════ */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === null
                ? "bg-[#0066FF] text-white font-semibold shadow-lg shadow-blue-500/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {t("filter.all")} ({seals.length})
          </button>
          {seriesOrder.map((series) => {
            const meta = SERIES_META[series];
            const count = seals.filter((s) => s.series === series).length;
            return (
              <button
                key={series}
                onClick={() => setFilter(filter === series ? null : series)}
                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                  filter === series
                    ? meta.bgActive
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{meta.icon}</span>
                {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ══════ Grid View ══════ */}
        {viewMode === "grid" && displayGroups.map(
          (group) =>
            group.seals.length > 0 && (
              <div key={group.series} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif font-bold text-gray-700 flex items-center gap-3">
                    <span className="text-xl">{group.meta.icon}</span>
                    {group.meta.label}
                    <span className="text-sm font-normal text-gray-400">({group.seals.length} {t("seals.unitCount")})</span>
                    <DifficultyBadge series={group.series} t={t} />
                  </h2>
                  <p className="text-sm text-gray-400 hidden sm:block">{group.meta.desc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.seals.map((seal) => (
                    <div key={seal.id} onClick={() => setSelectedSeal(seal)} className="cursor-pointer">
                      <SealCard seal={seal} />
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {/* ══════ Roadmap View (修行路线图 — 对标Duolingo学习路径) ══════ */}
        {viewMode === "roadmap" && (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

            {displayGroups.map((group, gi) =>
              group.seals.length > 0 && (
                <div key={group.series} className="mb-12">
                  {/* Series milestone */}
                  <div className="relative flex items-center justify-center mb-6">
                    <div className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 ${
                      SERIES_RING_COLORS[group.series]?.replace("ring-", "border-") || "border-gray-300"
                    } shadow-md`}>
                      <span className="text-xl">{group.meta.icon}</span>
                      <span className="font-bold text-gray-900">{group.meta.label}</span>
                      <span className="text-xs text-gray-400">({group.seals.length})</span>
                      <DifficultyBadge series={group.series} t={t} />
                    </div>
                  </div>

                  {/* Seal nodes */}
                  <div className="space-y-4">
                    {group.seals.map((seal, si) => {
                      const isLeft = si % 2 === 0;
                      return (
                        <div key={seal.id} className="relative flex items-center">
                          {/* Timeline dot */}
                          <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
                            <div className={`w-4 h-4 rounded-full ${SERIES_DOT_COLORS[seal.series]} ring-4 ring-white shadow-sm`} />
                          </div>

                          {/* Content card — alternating sides on desktop */}
                          <div className={`ml-14 sm:ml-0 sm:w-[45%] ${isLeft ? "sm:mr-auto sm:pr-8" : "sm:ml-auto sm:pl-8"}`}>
                            <button
                              onClick={() => setSelectedSeal(seal)}
                              className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0066FF]/20 transition-all group"
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-lg font-serif font-bold text-gray-300">
                                  {String(seal.id).padStart(2, "0")}
                                </span>
                                <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                                  {seal.name}
                                </h3>
                              </div>
                              <p className="text-gray-500 text-sm font-serif line-clamp-2 leading-relaxed">{seal.poem}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <DifficultyBadge series={seal.series} t={t} />
                                <span className="text-xs text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity">
                                  {t("seals.clickToView")}
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-500 text-lg">{t("common.noResults")}</p>
            {(filter || search) && (
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                {t("seals.clearFilters")}
              </button>
            )}
          </div>
        )}

        {/* ══════ Achievement & Series Completion Summary ══════ */}
        {!filter && !search && (
          <div className="mt-10 mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏅</span>
              <h3 className="font-bold text-amber-900">{t("seals.achievement.title")}</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">{t("seals.achievement.desc")}</p>
            <div className="flex flex-wrap gap-3">
              {seriesStats.map((stat) => {
                const isComplete = stat.count >= 6;
                return (
                  <div
                    key={stat.series}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                      isComplete
                        ? `bg-gradient-to-r ${SERIES_GRADIENT[stat.series]} text-white border-transparent shadow-sm`
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    <span>{stat.meta.icon}</span>
                    <span className="font-medium">{stat.meta.label}</span>
                    {isComplete && <span className="ml-1">🏅</span>}
                    {!isComplete && <span className="text-xs text-gray-400">{stat.count}/6</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-amber-600 mt-3">
              {t("seals.achievement.hint")}
            </p>
          </div>
        )}

        {/* ══════ Journey CTA ══════ */}
        <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#D4A855]/10 rounded-full blur-3xl" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#0066FF]/10 rounded-full blur-2xl" />
          <div className="relative">
            <span className="text-4xl block mb-3">🪷</span>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">{t("seals.cta.title")}</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              {t("seals.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/chat?q=${encodeURIComponent(t("seals.cta.aiQuery"))}`}
                className="px-6 py-3 bg-[#D4A855] hover:bg-[#C09A4A] text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                {t("seals.cta.aiPlan")}
              </Link>
              <Link
                href="/holy-sites#routes"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
              >
                {t("seals.cta.browseRoutes")}
              </Link>
              {/* Meditation CTA */}
              <Link
                href={`/chat?q=${encodeURIComponent(t("seals.cta.meditationQuery"))}`}
                className="px-6 py-3 bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors border border-indigo-500/30"
              >
                ⏱️ {t("seals.cta.meditation")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSeal && (
        <SealDetailModal seal={selectedSeal} onClose={() => setSelectedSeal(null)} t={t} />
      )}

      <MobileNav />
    </div>
  );
}
