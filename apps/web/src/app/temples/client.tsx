"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import type { Religion, Temple } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
const MAX_COMPARE = 3;

type ViewMode = "grid" | "timeline" | "grouped";

// ─── Helper functions ─────────────────────────────────────────────────────────

function useSortOptions(t: (key: string) => string) {
  return [
    { value: "name-asc", label: t("temples.sort.nameAsc") },
    { value: "name-desc", label: t("temples.sort.nameDesc") },
    { value: "country", label: t("temples.sort.country") },
    { value: "founded", label: t("temples.sort.founded") },
    { value: "era-old", label: t("temples.sort.eraOld") },
    { value: "era-new", label: t("temples.sort.eraNew") },
  ];
}

/** Extract a 4-digit year from a founding date string. Returns NaN if not found. */
function extractYear(foundingDate: string | null): number {
  if (!foundingDate) return NaN;
  const m = foundingDate.match(/-?\d{1,4}/);
  return m ? parseInt(m[0], 10) : NaN;
}

/** Approximate age in years from the founding date */
function getAge(foundingDate: string | null): number | null {
  const year = extractYear(foundingDate);
  if (isNaN(year)) return null;
  return 2026 - year;
}

/** Classify a founding year into an era label key */
function getEraKey(foundingDate: string | null): string {
  const year = extractYear(foundingDate);
  if (isNaN(year)) return "temples.era.unknown";
  if (year < 0) return "temples.era.ancient";
  if (year < 500) return "temples.era.earlyHistory";
  if (year < 1200) return "temples.era.medieval";
  if (year < 1800) return "temples.era.lateHistory";
  return "temples.era.modern";
}

/** Era sort order */
const ERA_ORDER: Record<string, number> = {
  "temples.era.ancient": 0,
  "temples.era.earlyHistory": 1,
  "temples.era.medieval": 2,
  "temples.era.lateHistory": 3,
  "temples.era.modern": 4,
  "temples.era.unknown": 5,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TempleCardEnhancedProps {
  temple: Temple;
  religionMap: Record<string, Religion>;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  compareMode: boolean;
  t: (key: string) => string;
}

function TempleCardEnhanced({
  temple,
  religionMap,
  compareIds,
  onToggleCompare,
  compareMode,
  t,
}: TempleCardEnhancedProps) {
  const isSelected = compareIds.includes(temple.id);
  const age = getAge(temple.foundingDate);
  const religion = religionMap[temple.religionId];

  return (
    <div className={`relative group rounded-xl overflow-hidden shadow-sm border transition-all duration-300 h-full flex flex-col
      ${isSelected ? "border-[#0066FF] shadow-[#0066FF]/20 shadow-lg ring-2 ring-[#0066FF]/30" : "border-gray-100 hover:shadow-lg bg-white"}
    `}>
      {/* Image area */}
      <div className="h-44 relative overflow-hidden flex-shrink-0">
        {temple.imageUrl ? (
          <OptimizedImage
            src={temple.imageUrl}
            alt={temple.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
            <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">🏛</span>
          </div>
        )}

        {/* Era badge */}
        {temple.foundingDate && (
          <div className="absolute top-2 left-2">
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {temple.foundingDate}
            </span>
          </div>
        )}

        {/* Age badge */}
        {age !== null && age > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {t("temples.cardAge").replace("{years}", String(age))}
            </span>
          </div>
        )}

        {/* Religion color stripe */}
        {religion?.color && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: religion.color }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors leading-snug truncate">
              {temple.name}
            </h3>
            {temple.nameEn && (
              <p className="text-gray-400 text-xs mt-0.5 truncate">{temple.nameEn}</p>
            )}
          </div>
          {/* Compare toggle */}
          {compareMode && (
            <button
              onClick={() => onToggleCompare(temple.id)}
              title={isSelected ? t("temples.deselectCompare") : t("temples.selectToCompare")}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected ? "bg-[#0066FF] border-[#0066FF] text-white" : "border-gray-300 hover:border-[#0066FF] text-transparent hover:text-[#0066FF]"}
              `}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {temple.country}
          </span>
          {religion && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: religion.color ?? "#6b7280" }}
            >
              {religion.symbol ?? ""} {religion.name}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
          {temple.description}
        </p>

        {/* Action row */}
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-50">
          <Link
            href={`/temples/${temple.id}`}
            className="flex-1 text-center text-xs font-medium text-[#0066FF] hover:text-[#0052CC] py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {t("common.viewDetails")}
          </Link>
          <Link
            href={`/chat?q=${encodeURIComponent(t("temples.planVisitPrompt").replace("{name}", temple.name))}`}
            className="flex-1 text-center text-xs font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] py-1.5 rounded-lg transition-colors"
          >
            {t("temples.planVisit")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Card ────────────────────────────────────────────────────────────

interface TimelineCardProps {
  temple: Temple;
  religionMap: Record<string, Religion>;
  index: number;
  t: (key: string) => string;
}

function TimelineCard({ temple, religionMap, index, t }: TimelineCardProps) {
  const religion = religionMap[temple.religionId];
  const year = extractYear(temple.foundingDate);
  const isLeft = index % 2 === 0;

  return (
    <div className={`flex items-start gap-4 mb-6 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      {/* Card */}
      <div className="flex-1 max-w-sm">
        <Link href={`/temples/${temple.id}`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 group">
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                {temple.imageUrl ? (
                  <OptimizedImage
                    src={temple.imageUrl}
                    alt={temple.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl opacity-30">🏛</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors text-sm truncate">
                  {temple.name}
                </h3>
                {temple.nameEn && (
                  <p className="text-gray-400 text-xs truncate">{temple.nameEn}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{temple.country}</p>
                {religion && (
                  <span
                    className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: religion.color ?? "#6b7280" }}
                  >
                    {religion.symbol ?? ""} {religion.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0"
          style={{ backgroundColor: religion?.color ?? "#0066FF" }}
        >
          🏛
        </div>
        <div className="text-[10px] text-gray-400 mt-1 text-center whitespace-nowrap">
          {isNaN(year) ? t("temples.timeline.unknownDate") : `${Math.abs(year)} ${year < 0 ? t("temples.timeline.bce") : t("temples.timeline.ce")}`}
        </div>
      </div>

      {/* Spacer on opposite side */}
      <div className="flex-1 max-w-sm" />
    </div>
  );
}

// ─── Compare Panel ────────────────────────────────────────────────────────────

interface ComparePanelProps {
  temples: Temple[];
  compareIds: string[];
  religionMap: Record<string, Religion>;
  onClose: () => void;
  t: (key: string) => string;
}

function ComparePanel({ temples, compareIds, religionMap, onClose, t }: ComparePanelProps) {
  const selected = compareIds
    .map((id) => temples.find((tp) => tp.id === id))
    .filter((tp): tp is Temple => tp !== undefined);

  if (selected.length < 2) return null;

  const rows: Array<{ label: string; getValue: (tp: Temple) => string }> = [
    { label: t("temples.compare.name"), getValue: (tp) => tp.name },
    { label: t("temples.compare.country"), getValue: (tp) => tp.country },
    {
      label: t("temples.compare.religion"),
      getValue: (tp) => religionMap[tp.religionId]?.name ?? "—",
    },
    {
      label: t("temples.compare.founded"),
      getValue: (tp) => tp.foundingDate ?? t("temples.noFoundingDate"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">
            {t("temples.comparePanel.header").replace("{count}", String(selected.length))}
          </h3>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t("temples.compare.close")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-400 py-1 pr-4 w-28">—</th>
                {selected.map((tp) => (
                  <th key={tp.id} className="text-left py-1 px-2">
                    <Link
                      href={`/temples/${tp.id}`}
                      className="text-[#0066FF] hover:underline font-semibold text-xs"
                    >
                      {tp.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-gray-50">
                  <td className="text-xs text-gray-500 font-medium py-2 pr-4">{row.label}</td>
                  {selected.map((tp) => (
                    <td key={tp.id} className="text-xs text-gray-900 py-2 px-2">
                      {row.getValue(tp)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Visitor Tips Sidebar ─────────────────────────────────────────────────────

function VisitorTipsSidebar({ t }: { t: (key: string) => string }) {
  const tips = [
    {
      icon: "🌸",
      label: t("temples.visitTips.bestSeason"),
      value: t("temples.visitTips.bestSeasonVal"),
    },
    {
      icon: "👘",
      label: t("temples.visitTips.dresscode"),
      value: t("temples.visitTips.dresscodeVal"),
    },
    {
      icon: "🙏",
      label: t("temples.visitTips.etiquette"),
      value: t("temples.visitTips.etiquetteVal"),
    },
    {
      icon: "💴",
      label: t("temples.visitTips.localCurrency"),
      value: t("temples.visitTips.localCurrencyVal"),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
      <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
        <span>💡</span>
        {t("temples.visitTips.title")}
      </h3>
      <div className="space-y-3">
        {tips.map((tip) => (
          <div key={tip.label} className="flex gap-2">
            <span className="text-base flex-shrink-0 mt-0.5">{tip.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-700">{tip.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{tip.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Era Timeline Bar ─────────────────────────────────────────────────────────

interface EraTimelineBarProps {
  temples: Temple[];
  onEraClick: (eraKey: string) => void;
  activeEra: string | null;
  t: (key: string) => string;
}

function EraTimelineBar({ temples, onEraClick, activeEra, t }: EraTimelineBarProps) {
  const eraCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const temple of temples) {
      const key = getEraKey(temple.foundingDate);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [temples]);

  const eras = Object.entries(ERA_ORDER)
    .sort(([, a], [, b]) => a - b)
    .map(([key]) => key)
    .filter((key) => (eraCounts[key] ?? 0) > 0);

  if (eras.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {eras.map((eraKey) => {
        const count = eraCounts[eraKey] ?? 0;
        const isActive = activeEra === eraKey;
        return (
          <button
            key={eraKey}
            onClick={() => onEraClick(isActive ? "" : eraKey)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${isActive
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-600"
              }`}
          >
            🏺 {t(eraKey)} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  religions: Religion[];
  temples: Temple[];
  error?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TemplesClient({ religions, temples, error }: Props) {
  const { t, locale } = useTranslation();
  const SORT_OPTIONS = useSortOptions(t);

  // Filter & search state
  const [filter, setFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparePanel, setShowComparePanel] = useState(false);

  // Build religion lookup map
  const religionMap = useMemo(
    () => Object.fromEntries(religions.map((r) => [r.id, r])),
    [religions]
  );

  // Unique countries
  const countries = useMemo(() => {
    const set = new Set(temples.map((t) => t.country));
    return Array.from(set).sort((a, b) => a.localeCompare(b, locale));
  }, [temples, locale]);

  // Stats
  const stats = useMemo(() => ({
    total: temples.length,
    countries: new Set(temples.map((t) => t.country)).size,
    religions: new Set(temples.map((t) => t.religionId)).size,
  }), [temples]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let result = temples;
    if (filter) result = result.filter((t) => t.religionId === filter);
    if (countryFilter) result = result.filter((t) => t.country === countryFilter);
    if (eraFilter) result = result.filter((t) => getEraKey(t.foundingDate) === eraFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.nameEn ?? "").toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, locale);
      if (sort === "name-desc") return b.name.localeCompare(a.name, locale);
      if (sort === "country") return a.country.localeCompare(b.country, locale);
      if (sort === "founded" || sort === "era-old") {
        const ya = extractYear(a.foundingDate);
        const yb = extractYear(b.foundingDate);
        if (isNaN(ya) && isNaN(yb)) return 0;
        if (isNaN(ya)) return 1;
        if (isNaN(yb)) return -1;
        return ya - yb;
      }
      if (sort === "era-new") {
        const ya = extractYear(a.foundingDate);
        const yb = extractYear(b.foundingDate);
        if (isNaN(ya) && isNaN(yb)) return 0;
        if (isNaN(ya)) return 1;
        if (isNaN(yb)) return -1;
        return yb - ya;
      }
      return 0;
    });
    return result;
  }, [temples, filter, countryFilter, eraFilter, search, sort, locale]);

  const hasActiveFilters = !!(filter || countryFilter || search || eraFilter);

  // Compare toggle
  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        alert(t("temples.compare.maxReached"));
        return prev;
      }
      return [...prev, id];
    });
  }, [t]);

  const handleOpenComparePanel = () => {
    if (compareIds.length >= 2) setShowComparePanel(true);
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    setShowComparePanel(false);
    setCompareMode(false);
  };

  // Group by country (for grouped view)
  const groupedByCountry = useMemo(() => {
    const map: Record<string, Temple[]> = {};
    for (const temple of filtered) {
      if (!map[temple.country]) map[temple.country] = [];
      map[temple.country].push(temple);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, locale));
  }, [filtered, locale]);

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.allTemples")}
            </h1>
          </div>
          <DataLoadError />
        </div>
        <MobileNav />
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-32">

        {/* Header with stats */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">
            {t("section.allTemples")}
          </h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.templesSubtitle")}</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-400">
            <span>🏛 {stats.total} {t("temples.unitTemple")}</span>
            <span>🌍 {stats.countries} {t("temples.unitCountry")}</span>
            <span>🙏 {stats.religions} {t("temples.unitReligion")}</span>
          </div>
        </div>

        {/* Country quick filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={() => setCountryFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              countryFilter === null
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            🌏 {t("temples.allCountries")}
          </button>
          {countries.map((c) => {
            const count = temples.filter((t) => t.country === c).length;
            return (
              <button
                key={c}
                onClick={() => setCountryFilter(countryFilter === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  countryFilter === c
                    ? "bg-[#0066FF] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>

        {/* Era timeline filter bar */}
        <EraTimelineBar
          temples={temples}
          onEraClick={setEraFilter}
          activeEra={eraFilter || null}
          t={t}
        />

        {/* Toolbar + View mode selector + Compare mode */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            {/* View mode tabs */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 self-start sm:self-auto">
              {(
                [
                  { id: "grid" as ViewMode, icon: "⊞", label: t("temples.viewMode.grid") },
                  { id: "timeline" as ViewMode, icon: "⏱", label: t("temples.viewMode.timeline") },
                  { id: "grouped" as ViewMode, icon: "📍", label: t("temples.viewMode.grouped") },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode.id
                      ? "bg-[#0066FF] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>

            {/* Compare mode toggle */}
            <div className="flex items-center gap-2 ml-auto">
              {!compareMode ? (
                <button
                  onClick={() => setCompareMode(true)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-[#0066FF] hover:text-[#0066FF] transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t("temples.compareMode")}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {t("temples.compare.selected").replace("{count}", String(compareIds.length))}
                  </span>
                  {compareIds.length >= 2 && (
                    <button
                      onClick={handleOpenComparePanel}
                      className="px-3 py-1.5 text-xs font-medium bg-[#0066FF] text-white rounded-xl hover:bg-[#0052CC] transition-all"
                    >
                      {t("temples.compare.btn")}
                    </button>
                  )}
                  <button
                    onClick={handleClearCompare}
                    className="px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    {t("temples.compare.clear")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <EncyclopediaToolbar
            religions={religions}
            selectedReligionId={filter}
            onReligionChange={setFilter}
            searchQuery={search}
            onSearchChange={(q) => { setSearch(q); setVisibleCount(PAGE_SIZE); }}
            sortValue={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
            resultCount={filtered.length}
            placeholder={t("temples.searchPlaceholder")}
          />

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                {t("temples.foundCount").replace("{count}", String(filtered.length))}
              </span>
              <button
                onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); setEraFilter(""); }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                {t("temples.clearAllFilters")}
              </button>
            </div>
          )}
        </div>

        {/* Two-column layout: main content + tips sidebar */}
        <div className="flex gap-6">
          {/* Main content area */}
          <div className="flex-1 min-w-0">

            {/* ── Grid view ── */}
            {viewMode === "grid" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.slice(0, visibleCount).map((temple) => (
                    <TempleCardEnhanced
                      key={temple.id}
                      temple={temple}
                      religionMap={religionMap}
                      compareIds={compareIds}
                      onToggleCompare={handleToggleCompare}
                      compareMode={compareMode}
                      t={t}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ── Timeline view ── */}
            {viewMode === "timeline" && (
              <div className="relative">
                {/* Vertical spine */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 pointer-events-none" />
                <div className="space-y-2">
                  {filtered.slice(0, visibleCount).map((temple, index) => (
                    <TimelineCard
                      key={temple.id}
                      temple={temple}
                      religionMap={religionMap}
                      index={index}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Grouped view ── */}
            {viewMode === "grouped" && (
              <div className="space-y-8">
                {groupedByCountry.map(([country, group]) => (
                  <div key={country}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-base font-bold text-gray-800">
                        📍 {country}
                      </h2>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        {group.length} {t("temples.unitTemple")}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((temple) => (
                        <TempleCardEnhanced
                          key={temple.id}
                          temple={temple}
                          religionMap={religionMap}
                          compareIds={compareIds}
                          onToggleCompare={handleToggleCompare}
                          compareMode={compareMode}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="text-gray-500 text-lg">{t("common.noResults")}</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); setEraFilter(""); }}
                    className="mt-3 text-sm text-[#0066FF] hover:underline"
                  >
                    {t("temples.clearFilters")}
                  </button>
                )}
              </div>
            )}

            {/* Load more */}
            {viewMode !== "grouped" && visibleCount < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {t("temples.loadMore").replace("{count}", String(filtered.length - visibleCount))}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  {t("temples.showingCount")
                    .replace("{shown}", String(Math.min(visibleCount, filtered.length)))
                    .replace("{total}", String(filtered.length))}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar: Visitor Tips (hidden on mobile, shown md+) */}
          <aside className="hidden xl:block w-72 flex-shrink-0 space-y-6">
            <VisitorTipsSidebar t={t} />

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">🔗 {t("temples.quickNav.title")}</h3>
              <div className="space-y-2">
                <Link href="/holy-sites#routes" className="flex items-center justify-between text-xs text-gray-600 hover:text-[#0066FF] py-1 border-b border-gray-50 last:border-0">
                  <span>{t("temples.quickNav.routes")}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/patriarchs" className="flex items-center justify-between text-xs text-gray-600 hover:text-[#0066FF] py-1 border-b border-gray-50 last:border-0">
                  <span>{t("temples.quickNav.patriarchs")}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/chat" className="flex items-center justify-between text-xs text-gray-600 hover:text-[#0066FF] py-1 border-b border-gray-50 last:border-0">
                  <span>{t("temples.quickNav.aiPlanner")}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/map" className="flex items-center justify-between text-xs text-gray-600 hover:text-[#0066FF] py-1">
                  <span>{t("temples.quickNav.globalMap")}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-8 border border-[#0066FF]/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">{t("temples.cta.title")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("temples.cta.subtitle")}</p>
            </div>
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
            >
              {t("temples.cta.aiPlan")}
            </Link>
          </div>
        </div>
      </div>

      {/* Compare Panel (sticky bottom) */}
      {showComparePanel && compareIds.length >= 2 && (
        <ComparePanel
          temples={temples}
          compareIds={compareIds}
          religionMap={religionMap}
          onClose={() => setShowComparePanel(false)}
          t={t}
        />
      )}

      <MobileNav />
    </div>
  );
}
