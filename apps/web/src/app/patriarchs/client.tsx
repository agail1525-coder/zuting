"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the first 4-digit year from a dates string like "563 BCE – 483 BCE" */
function parseEraYear(dates: string | null): number | null {
  if (!dates) return null;
  const isBce = /bce|bc|公元前/i.test(dates);
  const m = dates.match(/\d{3,4}/);
  if (!m) return null;
  const yr = parseInt(m[0], 10);
  return isBce ? -yr : yr;
}

type EraKey = "all" | "ancient" | "earlyCommon" | "medieval" | "earlyModern" | "modern";

function getEraKey(year: number | null): Exclude<EraKey, "all"> {
  if (year === null) return "modern"; // unknown → bucket as modern for display
  if (year < 0) return "ancient";
  if (year <= 600) return "earlyCommon";
  if (year <= 1400) return "medieval";
  if (year <= 1800) return "earlyModern";
  return "modern";
}

const ERA_ORDER: Exclude<EraKey, "all">[] = [
  "ancient",
  "earlyCommon",
  "medieval",
  "earlyModern",
  "modern",
];

const ERA_COLORS: Record<Exclude<EraKey, "all">, string> = {
  ancient: "bg-amber-900/30 border-amber-700/50 text-amber-300",
  earlyCommon: "bg-emerald-900/30 border-emerald-700/50 text-emerald-300",
  medieval: "bg-blue-900/30 border-blue-700/50 text-blue-300",
  earlyModern: "bg-purple-900/30 border-purple-700/50 text-purple-300",
  modern: "bg-rose-900/30 border-rose-700/50 text-rose-300",
};

const ERA_DOT_COLORS: Record<Exclude<EraKey, "all">, string> = {
  ancient: "bg-amber-400",
  earlyCommon: "bg-emerald-400",
  medieval: "bg-blue-400",
  earlyModern: "bg-purple-400",
  modern: "bg-rose-400",
};

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

function useSortOptions(t: (key: string) => string) {
  return [
    { value: "name-asc", label: t("patriarchs.sort.nameAsc") },
    { value: "name-desc", label: t("patriarchs.sort.nameDesc") },
    { value: "newest", label: t("patriarchs.sort.newest") },
    { value: "religion", label: t("patriarchs.sort.religion") },
    { value: "era-asc", label: t("patriarchs.sort.eraAsc") },
    { value: "era-desc", label: t("patriarchs.sort.eraDesc") },
  ];
}

const PAGE_SIZE = 16;

// ---------------------------------------------------------------------------
// Compare Modal
// ---------------------------------------------------------------------------

interface CompareField {
  label: string;
  valueA: string;
  valueB: string;
}

function CompareModal({
  a,
  b,
  onClose,
  t,
}: {
  a: Patriarch;
  b: Patriarch;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const unknown = t("patriarchs.compare.unknown");
  const fields: CompareField[] = [
    {
      label: t("patriarchs.compare.field.name"),
      valueA: a.name + (a.nameEn ? ` / ${a.nameEn}` : ""),
      valueB: b.name + (b.nameEn ? ` / ${b.nameEn}` : ""),
    },
    {
      label: t("patriarchs.compare.field.title"),
      valueA: a.title ?? unknown,
      valueB: b.title ?? unknown,
    },
    {
      label: t("patriarchs.compare.field.dates"),
      valueA: a.dates ?? unknown,
      valueB: b.dates ?? unknown,
    },
    {
      label: t("patriarchs.compare.field.religion"),
      valueA: a.religion?.name ?? unknown,
      valueB: b.religion?.name ?? unknown,
    },
    {
      label: t("patriarchs.compare.field.teaching"),
      valueA: a.coreTeaching ?? unknown,
      valueB: b.coreTeaching ?? unknown,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white">{t("patriarchs.compare.modal.title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1 border border-gray-700 rounded-lg"
          >
            {t("patriarchs.compare.modal.close")}
          </button>
        </div>

        {/* Profile headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-6 pb-0">
          <div className="text-center">
            {a.imageUrl ? (
              <img src={a.imageUrl} alt={a.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-2 ring-[#0066FF]/50" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2 text-2xl">
                {a.religion?.symbol ?? "🧘"}
              </div>
            )}
            <p className="font-bold text-white text-sm">{a.name}</p>
            <p className="text-gray-400 text-xs">{a.religion?.name ?? ""}</p>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-[#0066FF] font-bold text-lg">{t("patriarchs.compare.modal.vs")}</span>
          </div>
          <div className="text-center">
            {b.imageUrl ? (
              <img src={b.imageUrl} alt={b.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-2 ring-purple-500/50" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2 text-2xl">
                {b.religion?.symbol ?? "🧘"}
              </div>
            )}
            <p className="font-bold text-white text-sm">{b.name}</p>
            <p className="text-gray-400 text-xs">{b.religion?.name ?? ""}</p>
          </div>
        </div>

        {/* Fields table */}
        <div className="p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
              <div className="bg-gray-800/50 rounded-xl p-3 text-sm text-gray-200 min-h-[3rem] flex items-center">{f.valueA}</div>
              <div className="flex items-center justify-center pt-1">
                <span className="text-gray-600 text-xs font-medium text-center w-16">{f.label}</span>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-sm text-gray-200 min-h-[3rem] flex items-center">{f.valueB}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 p-6 pt-0">
          <Link
            href={`/patriarchs/${a.id}`}
            className="py-2 bg-[#0066FF]/20 hover:bg-[#0066FF]/30 text-[#66A3FF] text-center text-sm font-medium rounded-xl transition-colors border border-[#0066FF]/30"
          >
            {t("patriarchs.compare.viewProfile")} →
          </Link>
          <Link
            href={`/patriarchs/${b.id}`}
            className="py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-center text-sm font-medium rounded-xl transition-colors border border-purple-500/30"
          >
            {t("patriarchs.compare.viewProfile")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quote of the Day
// ---------------------------------------------------------------------------

function QuoteOfDay({ patriarch, t }: { patriarch: Patriarch; t: (k: string) => string }) {
  const quote = patriarch.coreTeaching;
  if (!quote) return null;
  return (
    <div className="mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-6 -left-3 text-[120px] text-white/4 font-serif leading-none select-none">"</div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0066FF]/15 border border-[#0066FF]/30 rounded-full text-xs font-medium text-[#66A3FF]">
            ✨ {t("patriarchs.quoteOfDay")}
          </span>
        </div>
        <blockquote className="text-gray-200 text-base md:text-lg leading-relaxed italic font-light line-clamp-3">
          "{quote}"
        </blockquote>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {patriarch.imageUrl && (
              <img src={patriarch.imageUrl} alt={patriarch.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-600" />
            )}
            <div>
              <p className="text-sm text-gray-300 font-medium">
                {t("patriarchs.quoteFrom").replace("{name}", patriarch.name)}
              </p>
              {patriarch.religion && (
                <p className="text-xs text-gray-500">{patriarch.religion.symbol} {patriarch.religion.name}</p>
              )}
            </div>
          </div>
          <Link
            href={`/patriarchs/${patriarch.id}`}
            className="text-xs text-[#66A3FF] hover:text-[#0066FF] transition-colors border border-[#0066FF]/30 px-3 py-1.5 rounded-lg hover:bg-[#0066FF]/10"
          >
            {t("patriarchs.quoteViewBio")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline View
// ---------------------------------------------------------------------------

function TimelineView({
  patriarchs,
  compareSelected,
  compareMode,
  onToggleCompare,
  t,
}: {
  patriarchs: Patriarch[];
  compareSelected: string[];
  compareMode: boolean;
  onToggleCompare: (id: string) => void;
  t: (k: string) => string;
}) {
  const grouped = useMemo(() => {
    const map = new Map<Exclude<EraKey, "all">, Patriarch[]>();
    ERA_ORDER.forEach((e) => map.set(e, []));
    for (const p of patriarchs) {
      const yr = parseEraYear(p.dates);
      const era = getEraKey(yr);
      map.get(era)!.push(p);
    }
    return map;
  }, [patriarchs]);

  return (
    <div className="space-y-8">
      {ERA_ORDER.map((era) => {
        const group = grouped.get(era) ?? [];
        if (group.length === 0) return null;
        return (
          <div key={era}>
            {/* Era label */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${ERA_COLORS[era]}`}>
                <span className={`w-2 h-2 rounded-full ${ERA_DOT_COLORS[era]}`} />
                {t(`patriarchs.era.${era}`)}
              </span>
              <div className="flex-1 h-px bg-gray-700/50" />
              <span className="text-xs text-gray-500">{group.length}</span>
            </div>
            {/* Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-4 border-l-2 border-gray-700/30">
              {group.map((p) => (
                <TimelinePatriarchCard
                  key={p.id}
                  patriarch={p}
                  compareMode={compareMode}
                  isSelected={compareSelected.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                  t={t}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelinePatriarchCard({
  patriarch,
  compareMode,
  isSelected,
  onToggleCompare,
  t,
}: {
  patriarch: Patriarch;
  compareMode: boolean;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  t: (k: string) => string;
}) {
  const yr = parseEraYear(patriarch.dates);
  const era = getEraKey(yr);
  const dotColor = ERA_DOT_COLORS[era];

  if (compareMode) {
    return (
      <button
        onClick={() => onToggleCompare(patriarch.id)}
        className={`w-full text-left p-4 rounded-xl border transition-all ${
          isSelected
            ? "border-[#0066FF] bg-[#0066FF]/10 ring-2 ring-[#0066FF]/40"
            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
        }`}
      >
        <div className="flex items-center gap-3">
          {patriarch.imageUrl ? (
            <img src={patriarch.imageUrl} alt={patriarch.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
              {patriarch.religion?.symbol ?? "🧘"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{patriarch.name}</p>
            <p className="text-xs text-gray-400 truncate">{patriarch.dates ?? ""}</p>
          </div>
          {isSelected && (
            <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-xs">✓</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <Link href={`/patriarchs/${patriarch.id}`} className="block group">
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800 transition-all">
        <div className="flex items-center gap-3 mb-2">
          {patriarch.imageUrl ? (
            <img src={patriarch.imageUrl} alt={patriarch.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 group-hover:ring-2 group-hover:ring-[#0066FF]/50 transition-all" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
              {patriarch.religion?.symbol ?? "🧘"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white group-hover:text-[#66A3FF] transition-colors truncate">{patriarch.name}</p>
            {patriarch.title && <p className="text-xs text-gray-400 truncate">{patriarch.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="text-xs text-gray-500 truncate">{patriarch.dates ?? ""}</span>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Related Patriarchs
// ---------------------------------------------------------------------------

function RelatedPatriarchs({
  current,
  allPatriarchs,
  t,
}: {
  current: Patriarch | null;
  allPatriarchs: Patriarch[];
  t: (k: string) => string;
}) {
  if (!current) return null;
  const related = allPatriarchs
    .filter((p) => p.id !== current.id && p.religionId === current.religionId)
    .slice(0, 4);
  if (related.length === 0) return null;

  return (
    <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base font-semibold text-white">{t("patriarchs.related.title")}</span>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        {t("patriarchs.related.subtitle").replace("{name}", current.name)}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {related.map((p) => (
          <Link key={p.id} href={`/patriarchs/${p.id}`} className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600 transition-all text-center">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-[#0066FF]/50 transition-all" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                {p.religion?.symbol ?? "🧘"}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-[#66A3FF] transition-colors leading-tight">{p.name}</p>
              {p.religion && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("patriarchs.related.sameReligion").replace("{religion}", p.religion.name)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  religions: Religion[];
  patriarchs: Patriarch[];
  error?: boolean;
}

export default function PatriarchsClient({ religions, patriarchs, error }: Props) {
  const { t } = useTranslation();
  const SORT_OPTIONS = useSortOptions(t);

  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [eraFilter, setEraFilter] = useState<EraKey>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: patriarchs.length,
    religions: new Set(patriarchs.map((p) => p.religionId)).size,
    withBio: patriarchs.filter((p) => p.biography && p.biography.length > 20).length,
    eras: new Set(patriarchs.map((p) => getEraKey(parseEraYear(p.dates)))).size,
  }), [patriarchs]);

  // Daily featured — deterministic by day-of-year
  const featured = useMemo(() => {
    if (filter || search) return null;
    const withContent = patriarchs.filter((p) => p.imageUrl && p.biography && p.coreTeaching);
    if (withContent.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / 86400000);
    return withContent[dayOfYear % withContent.length] ?? withContent[0];
  }, [patriarchs, filter, search]);

  // Quote of Day patriarch — different from featured
  const quotePatriarch = useMemo(() => {
    const withTeaching = patriarchs.filter((p) => p.coreTeaching && p.coreTeaching.length > 30);
    if (withTeaching.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / 86400000) + 7;
    return withTeaching[dayOfYear % withTeaching.length] ?? withTeaching[0];
  }, [patriarchs]);

  const filtered = useMemo(() => {
    let result = patriarchs;
    if (filter) result = result.filter((p) => p.religionId === filter);
    if (eraFilter !== "all") {
      result = result.filter((p) => getEraKey(parseEraYear(p.dates)) === eraFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameEn ?? "").toLowerCase().includes(q) ||
          (p.title ?? "").toLowerCase().includes(q) ||
          (p.dates ?? "").toLowerCase().includes(q) ||
          (p.biography ?? "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "religion") return (a.religion?.name ?? "").localeCompare(b.religion?.name ?? "", "zh");
      if (sort === "era-asc") return (parseEraYear(a.dates) ?? 9999) - (parseEraYear(b.dates) ?? 9999);
      if (sort === "era-desc") return (parseEraYear(b.dates) ?? 9999) - (parseEraYear(a.dates) ?? 9999);
      return 0;
    });
    return result;
  }, [patriarchs, filter, search, sort, eraFilter]);

  const hasActiveFilters = !!(filter || search || eraFilter !== "all");

  const handleToggleCompare = useCallback((id: string) => {
    setCompareSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }, []);

  const compareA = patriarchs.find((p) => p.id === compareSelected[0]);
  const compareB = patriarchs.find((p) => p.id === compareSelected[1]);

  const ERA_KEYS: EraKey[] = ["all", "ancient", "earlyCommon", "medieval", "earlyModern", "modern"];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allPatriarchs")}</h1>
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

        {/* ── Header with stats ──────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">{t("section.allPatriarchs")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.patriarchsSubtitle")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">🧘 <strong className="text-gray-300">{stats.total}</strong> {t("patriarchs.unitPatriarch")}</span>
            <span className="flex items-center gap-1">🙏 <strong className="text-gray-300">{stats.religions}</strong> {t("patriarchs.unitReligion")}</span>
            <span className="flex items-center gap-1">📜 <strong className="text-gray-300">{stats.withBio}</strong> {t("patriarchs.stats.withBio")}</span>
            <span className="flex items-center gap-1">🕰️ <strong className="text-gray-300">{stats.eras}</strong> {t("patriarchs.stats.eras")}</span>
          </div>
        </div>

        {/* ── Quote of the Day ───────────────────────────────────────────── */}
        {!filter && !search && quotePatriarch && (
          <QuoteOfDay patriarch={quotePatriarch} t={t} />
        )}

        {/* ── Featured patriarch (daily hero) ───────────────────────────── */}
        {featured && (
          <Link href={`/patriarchs/${featured.id}`} className="block mb-8 group">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 right-4 text-[100px] opacity-5 select-none">
                {featured.religion?.symbol ?? "🧘"}
              </div>
              <div className="flex flex-col md:flex-row">
                {featured.imageUrl && (
                  <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                    <img src={featured.imageUrl} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/80 hidden md:block" />
                  </div>
                )}
                <div className="p-6 md:p-8 flex-1 relative">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium mb-3 border border-white/10">
                    ✨ {t("patriarchs.dailyFeatured")}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-white group-hover:text-[#66A3FF] transition-colors">
                    {featured.name}
                  </h2>
                  {featured.title && (
                    <p className="text-white/60 text-sm mt-1">{featured.title}</p>
                  )}
                  <p className="text-white/50 text-sm mt-3 line-clamp-2">{featured.biography}</p>
                  {featured.religion && (
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-lg">{featured.religion.symbol}</span>
                      <span className="text-sm text-white/40">{featured.religion.name}</span>
                      {featured.dates && (
                        <span className="text-sm text-white/30">· {featured.dates}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Era filter bar ─────────────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("patriarchs.eraFilter")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ERA_KEYS.map((era) => {
              const count = era === "all"
                ? patriarchs.length
                : patriarchs.filter((p) => getEraKey(parseEraYear(p.dates)) === era).length;
              if (count === 0 && era !== "all") return null;
              const isActive = eraFilter === era;
              const colorClass = era === "all"
                ? isActive ? "bg-[#0066FF] text-white border-[#0066FF]" : "text-gray-300 border-gray-600 hover:border-gray-400"
                : isActive
                  ? ERA_COLORS[era as Exclude<EraKey, "all">].replace("/30", "/60")
                  : "text-gray-400 border-gray-700 hover:border-gray-500";
              return (
                <button
                  key={era}
                  onClick={() => { setEraFilter(era); setVisibleCount(PAGE_SIZE); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${colorClass}`}
                >
                  {t(`patriarchs.era.${era}`)}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Toolbar + View / Compare mode toggles ─────────────────────── */}
        <div className="mb-8">
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
            placeholder={t("patriarchs.searchPlaceholder")}
          />

          {/* Secondary toolbar row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">{t("patriarchs.foundCount").replace("{count}", String(filtered.length))}</span>
                <button
                  onClick={() => { setFilter(null); setSearch(""); setEraFilter("all"); }}
                  className="text-[#0066FF] hover:underline text-xs"
                >
                  {t("patriarchs.clearFilters")}
                </button>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-[#0066FF] text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  ☰ {t("patriarchs.view.grid")}
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "timeline" ? "bg-[#0066FF] text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  ↔ {t("patriarchs.view.timeline")}
                </button>
              </div>

              {/* Compare mode toggle */}
              <button
                onClick={() => {
                  setCompareMode((prev) => !prev);
                  if (compareMode) { setCompareSelected([]); setShowCompareModal(false); }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  compareMode
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                }`}
              >
                ⚖️ {compareMode ? t("patriarchs.compareMode.active") : t("patriarchs.compareMode")}
              </button>
            </div>
          </div>

          {/* Compare mode hints & action */}
          {compareMode && (
            <div className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-purple-900/20 border border-purple-700/40 rounded-xl text-sm">
              <span className="text-purple-300 text-xs">{t("patriarchs.compareMode.hint")}</span>
              <span className="ml-auto text-purple-200 text-xs font-medium">
                {t("patriarchs.compare.selectHint").replace("{count}", String(compareSelected.length))}
              </span>
              {compareSelected.length === 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {t("patriarchs.compare.button")}
                </button>
              )}
              {compareSelected.length > 0 && (
                <button
                  onClick={() => setCompareSelected([])}
                  className="text-purple-400 hover:text-purple-200 text-xs transition-colors"
                >
                  {t("patriarchs.compare.clear")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Content: Grid or Timeline ──────────────────────────────────── */}
        {viewMode === "timeline" ? (
          <TimelineView
            patriarchs={filtered}
            compareSelected={compareSelected}
            compareMode={compareMode}
            onToggleCompare={handleToggleCompare}
            t={t}
          />
        ) : compareMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.slice(0, visibleCount).map((p) => {
              const isSelected = compareSelected.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleToggleCompare(p.id)}
                  className={`text-left w-full rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/30"
                      : "border-transparent hover:border-gray-600"
                  }`}
                >
                  <PatriarchCard patriarch={p} />
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.slice(0, visibleCount).map((p) => (
              <PatriarchCard key={p.id} patriarch={p} />
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-500 text-lg">{t("common.noResults")}</p>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilter(null); setSearch(""); setEraFilter("all"); }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                {t("patriarchs.clearFilters")}
              </button>
            )}
          </div>
        )}

        {/* ── Load more ──────────────────────────────────────────────────── */}
        {viewMode === "grid" && !compareMode && visibleCount < filtered.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {t("patriarchs.loadMore").replace("{count}", String(filtered.length - visibleCount))}
            </button>
            <p className="text-xs text-gray-400 mt-2">{t("patriarchs.showingCount").replace("{shown}", String(Math.min(visibleCount, filtered.length))).replace("{total}", String(filtered.length))}</p>
          </div>
        )}

        {/* ── Related Patriarchs (based on featured) ─────────────────────── */}
        {!filter && !search && eraFilter === "all" && (
          <RelatedPatriarchs current={featured} allPatriarchs={patriarchs} t={t} />
        )}

        {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-3xl block mb-3">📚</span>
            <h2 className="text-xl font-bold text-white">{t("patriarchs.cta.title")}</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              {t("patriarchs.cta.subtitle")}
            </p>
            <div className="flex gap-3 justify-center mt-5 flex-wrap">
              <Link
                href="/zen-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                ☸ 曹洞宗传承法脉
              </Link>
              <Link
                href="/pure-land-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                🪷 净土宗十三祖
              </Link>
              <Link
                href="/vinaya-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                📜 律宗祖师传承
              </Link>
              <Link
                href="/tiantai-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                🏔️ 天台宗祖师传承
              </Link>
              <Link
                href="/huayan-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                🌸 华严宗祖师传承
              </Link>
              <Link
                href="/faxiang-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                🔮 法相宗祖师传承
              </Link>
              <Link
                href="/esoteric-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                🔱 密宗祖师传承
              </Link>
              <Link
                href="/sanlun-patriarchs"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                💠 三论宗祖师传承
              </Link>
              <Link
                href="/islam-patriarchs"
                className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                ☪ 伊斯兰教先贤传承
              </Link>
              <Link
                href="/christian-patriarchs"
                className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                ✝ 基督教先贤传承
              </Link>
              <Link
                href="/teachings"
                className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {t("patriarchs.cta.browseTeachings")}
              </Link>
              <Link
                href="/chat"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
              >
                {t("patriarchs.cta.aiExplain")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compare Modal ────────────────────────────────────────────────── */}
      {showCompareModal && compareA && compareB && (
        <CompareModal
          a={compareA}
          b={compareB}
          onClose={() => setShowCompareModal(false)}
          t={t}
        />
      )}

      <MobileNav />
    </div>
  );
}
