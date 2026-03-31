"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect, useCallback, useRef } from "react";
import MobileNav from "@/components/MobileNav";
import DataLoadError from "@/components/DataLoadError";
import type { Religion, HolySite, Temple, Patriarch } from "@/lib/api";

// ─── Static enrichment data ──────────────────────────────────────────────────
const RELIGION_ERA: Record<string, "ancient" | "medieval" | "modern"> = {
  buddhism: "ancient",
  taoism: "ancient",
  hinduism: "ancient",
  judaism: "ancient",
  confucianism: "ancient",
  shinto: "ancient",
  christianity: "medieval",
  islam: "medieval",
  tibetan_buddhism: "medieval",
  sikhism: "medieval",
  indigenous: "ancient",
  bahai: "modern",
};

const RELIGION_FOLLOWERS: Record<string, string> = {
  buddhism: "5.2亿",
  taoism: "3亿",
  hinduism: "12亿",
  judaism: "1500万",
  confucianism: "6亿",
  shinto: "1亿",
  christianity: "24亿",
  islam: "19亿",
  tibetan_buddhism: "2000万",
  sikhism: "3000万",
  indigenous: "3亿",
  bahai: "800万",
};
const RELIGION_FOLLOWERS_EN: Record<string, string> = {
  buddhism: "520M",
  taoism: "300M",
  hinduism: "1.2B",
  judaism: "15M",
  confucianism: "600M",
  shinto: "100M",
  christianity: "2.4B",
  islam: "1.9B",
  tibetan_buddhism: "20M",
  sikhism: "30M",
  indigenous: "300M",
  bahai: "8M",
};

// Continent bounding boxes [minLon, maxLon, minLat, maxLat]
const CONTINENT_BOXES: Array<{
  id: string;
  labelZh: string;
  labelEn: string;
  x: number; // SVG x (0-1000)
  y: number; // SVG y (0-500)
  w: number;
  h: number;
  color: string;
}> = [
  { id: "na", labelZh: "北美洲", labelEn: "N. America", x: 50, y: 60, w: 180, h: 180, color: "#e8f4fd" },
  { id: "sa", labelZh: "南美洲", labelEn: "S. America", x: 160, y: 250, w: 130, h: 190, color: "#f0fdf4" },
  { id: "eu", labelZh: "欧洲", labelEn: "Europe", x: 430, y: 30, w: 120, h: 130, color: "#fef9ec" },
  { id: "af", labelZh: "非洲", labelEn: "Africa", x: 430, y: 165, w: 150, h: 240, color: "#fff7ed" },
  { id: "as", labelZh: "亚洲", labelEn: "Asia", x: 555, y: 20, w: 300, h: 270, color: "#fdf4ff" },
  { id: "oc", labelZh: "大洋洲", labelEn: "Oceania", x: 700, y: 300, w: 200, h: 150, color: "#ecfeff" },
];

// Map lat/lon → approximate SVG x,y (0-1000 x, 0-500 y)
function latLonToSVG(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

// ─── Quiz data ────────────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  {
    keyQ: "religions.quizQ1",
    keyOpts: ["religions.quizQ1O1", "religions.quizQ1O2", "religions.quizQ1O3", "religions.quizQ1O4"],
    scores: [
      { buddhism: 2, taoism: 1, hinduism: 1 },
      { christianity: 2, judaism: 1, bahai: 1 },
      { islam: 2, sikhism: 1 },
      { confucianism: 2, shinto: 1, indigenous: 1 },
    ],
  },
  {
    keyQ: "religions.quizQ2",
    keyOpts: ["religions.quizQ2O1", "religions.quizQ2O2", "religions.quizQ2O3", "religions.quizQ2O4"],
    scores: [
      { hinduism: 2, buddhism: 1 },
      { taoism: 2, shinto: 1, indigenous: 1 },
      { christianity: 2, judaism: 1 },
      { islam: 2, sikhism: 1, bahai: 1 },
    ],
  },
  {
    keyQ: "religions.quizQ3",
    keyOpts: ["religions.quizQ3O1", "religions.quizQ3O2", "religions.quizQ3O3", "religions.quizQ3O4"],
    scores: [
      { confucianism: 2, taoism: 1 },
      { buddhism: 2, tibetan_buddhism: 2 },
      { bahai: 2, sikhism: 1 },
      { indigenous: 2, shinto: 1 },
    ],
  },
];

interface ReligionStat extends Religion {
  siteCount: number;
  templeCount: number;
  patriarchCount: number;
}

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  error: boolean;
}

// ─── Recently Viewed Hook ─────────────────────────────────────────────────────
function useRecentlyViewed() {
  const [viewed, setViewed] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zuting_religions_viewed");
      if (raw) setViewed(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, []);
  const addViewed = useCallback((slug: string) => {
    setViewed((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 4);
      try { localStorage.setItem("zuting_religions_viewed", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { viewed, addViewed };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ReligionCard({
  r,
  onView,
  compact = false,
}: {
  r: ReligionStat;
  onView?: (slug: string) => void;
  compact?: boolean;
}) {
  const { t, locale } = useTranslation();
  const eraKey = Object.entries(RELIGION_ERA).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k))?.[1];
  const followersZh = Object.entries(RELIGION_FOLLOWERS).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k))?.[1];
  const followersEn = Object.entries(RELIGION_FOLLOWERS_EN).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k))?.[1];
  const followers = locale === "zh-CN" ? followersZh : followersEn;

  return (
    <Link key={r.id} href={`/religions/${r.slug}`} onClick={() => onView?.(r.slug)}>
      <div
        className={`bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${compact ? "p-4 min-h-[150px]" : "p-6 min-h-[200px]"}`}
        style={{ borderTopColor: r.color || "#0066FF", borderTopWidth: 3 }}
      >
        {r.symbol && (
          <span className={`group-hover:scale-110 transition-transform duration-300 ${compact ? "text-3xl" : "text-4xl"}`}>
            {r.symbol}
          </span>
        )}
        <div>
          <h3 className={`font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors ${compact ? "text-base" : "text-lg"}`}>
            {r.name}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">{r.nameEn}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
          {r.siteCount > 0 && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {t("religions.countSites", { count: String(r.siteCount) })}
            </span>
          )}
          {r.templeCount > 0 && (
            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
              {t("religions.countTemples", { count: String(r.templeCount) })}
            </span>
          )}
        </div>
        {followers && (
          <p className="text-xs text-gray-400">
            {t("religions.followers")}: <span className="font-semibold text-gray-600">{followers}</span>
          </p>
        )}
        {eraKey && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              eraKey === "ancient"
                ? "bg-amber-50 text-amber-600"
                : eraKey === "medieval"
                ? "bg-purple-50 text-purple-600"
                : "bg-sky-50 text-sky-600"
            }`}
          >
            {t(`religions.era_${eraKey}`)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── World Map Section ────────────────────────────────────────────────────────
function WorldMapSection({ holySites, religionStats }: { holySites: HolySite[]; religionStats: ReligionStat[] }) {
  const { t } = useTranslation();
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);

  const dots = holySites
    .filter((s) => s.latitude && s.longitude)
    .map((s) => {
      const { x, y } = latLonToSVG(s.latitude, s.longitude);
      const religion = religionStats.find((r) => r.id === s.religionId);
      return { x, y, color: religion?.color || "#6b7280", name: s.name, religionName: religion?.name };
    });

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 pt-6 pb-3">
          <h2 className="text-xl font-bold text-gray-900">{t("religions.mapTitle")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("religions.mapSubtitle")}</p>
        </div>
        <div className="px-4 pb-4">
          <svg viewBox="0 0 1000 500" className="w-full rounded-xl bg-[#e8f0f8]" aria-label={t("religions.mapAriaLabel")}>
            {/* Ocean background */}
            <rect width="1000" height="500" fill="#dbeafe" rx="12" />
            {/* Continent shapes */}
            {CONTINENT_BOXES.map((c) => (
              <g key={c.id} onMouseEnter={() => setHoveredContinent(c.id)} onMouseLeave={() => setHoveredContinent(null)}>
                <rect
                  x={c.x} y={c.y} width={c.w} height={c.h}
                  rx={8}
                  fill={c.color}
                  stroke={hoveredContinent === c.id ? "#0066FF" : "#cbd5e1"}
                  strokeWidth={hoveredContinent === c.id ? 2 : 1}
                  className="transition-all duration-200"
                />
                <text
                  x={c.x + c.w / 2} y={c.y + c.h / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fill="#64748b" fontWeight="500"
                >
                  {c.labelZh}
                </text>
              </g>
            ))}
            {/* Site dots */}
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={d.x} cy={d.y} r={5}
                fill={d.color}
                stroke="white"
                strokeWidth={1.5}
                opacity={0.85}
                className="cursor-pointer hover:r-8 transition-all"
              >
                <title>{d.name}{d.religionName ? ` (${d.religionName})` : ""}</title>
              </circle>
            ))}
          </svg>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-2">
            {religionStats.filter((r) => r.siteCount > 0).map((r) => (
              <span key={r.id} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: r.color || "#6b7280" }} />
                {r.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Spotlight ────────────────────────────────────────────────────────
function FeaturedSpotlight({ religionStats, onView }: { religionStats: ReligionStat[]; onView: (slug: string) => void }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topReligions = religionStats
    .filter((r) => r.siteCount > 0)
    .sort((a, b) => b.siteCount + b.templeCount - (a.siteCount + a.templeCount))
    .slice(0, 5);

  const current = topReligions[idx];

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % topReligions.length);
  }, [topReligions.length]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  if (!current) return null;

  const followersKey = Object.keys(RELIGION_FOLLOWERS).find((k) =>
    current.slug?.includes(k) || current.nameEn?.toLowerCase().includes(k)
  );
  const followers = followersKey ? RELIGION_FOLLOWERS[followersKey] : null;
  const eraKey = Object.entries(RELIGION_ERA).find(([k]) => current.slug?.includes(k) || current.nameEn?.toLowerCase().includes(k))?.[1];

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("religions.spotlightTitle")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("religions.spotlightSubtitle")}</p>
        </div>
        <div className="flex gap-1.5">
          {topReligions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = setInterval(next, 5000); } }}
              className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-[#0066FF]" : "w-2 bg-gray-300"}`}
              aria-label={`${t("religions.spotlightGoto")} ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <Link href={`/religions/${current.slug}`} onClick={() => onView(current.slug)}>
        <div
          className="relative rounded-2xl overflow-hidden p-8 md:p-12 group cursor-pointer hover:shadow-xl transition-all duration-500"
          style={{
            background: current.color
              ? `linear-gradient(135deg, ${current.color}22 0%, ${current.color}44 100%)`
              : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            borderLeft: `6px solid ${current.color || "#0066FF"}`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="text-7xl md:text-8xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500 text-center md:text-left"
            >
              {current.symbol}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {eraKey && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    eraKey === "ancient" ? "bg-amber-100 text-amber-700" :
                    eraKey === "medieval" ? "bg-purple-100 text-purple-700" :
                    "bg-sky-100 text-sky-700"
                  }`}>
                    {t(`religions.era_${eraKey}`)}
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/70 text-gray-600 font-medium">
                  {t("religions.spotlightFeatured")}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                {current.name}
              </h3>
              <p className="text-gray-500 mt-1">{current.nameEn}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {current.siteCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-600">{current.siteCount} {t("religions.colSites")}</span>
                  </div>
                )}
                {current.templeCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-600">{current.templeCount} {t("religions.colTemples")}</span>
                  </div>
                )}
                {current.patriarchCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-gray-600">{current.patriarchCount} {t("religions.colPatriarchs")}</span>
                  </div>
                )}
                {followers && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-gray-600">{t("religions.followers")} {followers}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 hover:bg-white rounded-xl text-[#0066FF] font-semibold text-sm shadow-sm group-hover:shadow-md transition-all">
                {t("religions.explore")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
          {/* Auto-progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div
              key={idx}
              className="h-full bg-white/70 rounded-full"
              style={{ animation: "progressBar 5s linear forwards" }}
            />
          </div>
        </div>
      </Link>

      <style>{`
        @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </section>
  );
}

// ─── Era Timeline Filter ──────────────────────────────────────────────────────
function EraTimelineFilter({
  religionStats,
  onView,
}: {
  religionStats: ReligionStat[];
  onView: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const [activeEra, setActiveEra] = useState<"all" | "ancient" | "medieval" | "modern">("all");

  const eras: Array<{ id: "all" | "ancient" | "medieval" | "modern"; icon: string; color: string; dotColor: string }> = [
    { id: "all", icon: "✦", color: "bg-gray-100 text-gray-700 hover:bg-gray-200", dotColor: "#6b7280" },
    { id: "ancient", icon: "🏛️", color: "bg-amber-50 text-amber-700 hover:bg-amber-100", dotColor: "#d97706" },
    { id: "medieval", icon: "⚔️", color: "bg-purple-50 text-purple-700 hover:bg-purple-100", dotColor: "#7c3aed" },
    { id: "modern", icon: "✨", color: "bg-sky-50 text-sky-700 hover:bg-sky-100", dotColor: "#0284c7" },
  ];

  const filtered =
    activeEra === "all"
      ? religionStats
      : religionStats.filter((r) => {
          const eraKey = Object.entries(RELIGION_ERA).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k))?.[1];
          return eraKey === activeEra;
        });

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("religions.eraTitle")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("religions.eraSubtitle")}</p>
        </div>
        {/* Era filter pills */}
        <div className="hidden sm:flex gap-2">
          {eras.map((era) => (
            <button
              key={era.id}
              onClick={() => setActiveEra(era.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${era.color} ${activeEra === era.id ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
            >
              {era.icon} {t(`religions.era_${era.id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile era filter */}
      <div className="flex sm:hidden gap-2 mb-4 overflow-x-auto pb-1">
        {eras.map((era) => (
          <button
            key={era.id}
            onClick={() => setActiveEra(era.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${era.color} ${activeEra === era.id ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
          >
            {era.icon} {t(`religions.era_${era.id}`)}
          </button>
        ))}
      </div>

      {/* Timeline visual */}
      <div className="relative mb-6">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-purple-400 to-sky-400" />
        <div className="flex justify-between text-xs text-gray-400 px-2">
          <span>{t("religions.eraAncientDate")}</span>
          <span>{t("religions.eraMedievalDate")}</span>
          <span>{t("religions.eraModernDate")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((r) => (
          <ReligionCard key={r.id} r={r} onView={onView} />
        ))}
      </div>
    </section>
  );
}

// ─── Compare Tool ─────────────────────────────────────────────────────────────
function CompareReligions({ religionStats }: { religionStats: ReligionStat[] }) {
  const { t, locale } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareList = religionStats.filter((r) => selected.includes(r.id));

  const getFollowers = (r: ReligionStat) => {
    const key = Object.keys(RELIGION_FOLLOWERS).find((k) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k));
    return key ? (locale === "zh-CN" ? RELIGION_FOLLOWERS[key] : RELIGION_FOLLOWERS_EN[key]) : "—";
  };

  const getEra = (r: ReligionStat) => {
    const era = Object.entries(RELIGION_ERA).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k))?.[1];
    return era ? t(`religions.era_${era}`) : "—";
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("religions.compareTitle")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("religions.compareSubtitle")}</p>
        </div>
        {selected.length > 0 && (
          <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            {t("religions.compareClear")}
          </button>
        )}
      </div>

      {/* Selection chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {religionStats.map((r) => (
          <button
            key={r.id}
            onClick={() => toggle(r.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected.includes(r.id)
                ? "border-[#0066FF] bg-blue-50 text-[#0066FF] shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            } ${selected.length >= 3 && !selected.includes(r.id) ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={selected.length >= 3 && !selected.includes(r.id)}
          >
            <span>{r.symbol}</span>
            <span>{r.name}</span>
            {selected.includes(r.id) && (
              <span className="text-[#0066FF] text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Hint */}
      {selected.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
          {t("religions.compareHint")}
        </div>
      )}

      {/* Comparison table */}
      {compareList.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium w-32">{t("religions.compareMetric")}</th>
                {compareList.map((r) => (
                  <th key={r.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl">{r.symbol}</span>
                      <span className="font-bold text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-400">{r.nameEn}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { label: t("religions.colSites"), getValue: (r: ReligionStat) => r.siteCount },
                { label: t("religions.colTemples"), getValue: (r: ReligionStat) => r.templeCount },
                { label: t("religions.colPatriarchs"), getValue: (r: ReligionStat) => r.patriarchCount },
                { label: t("religions.followers"), getValue: (r: ReligionStat) => getFollowers(r) },
                { label: t("religions.compareEra"), getValue: (r: ReligionStat) => getEra(r) },
              ].map((row) => {
                const vals = compareList.map((r) => row.getValue(r));
                const numVals = vals.filter((v) => typeof v === "number") as number[];
                const maxVal = numVals.length > 0 ? Math.max(...numVals) : null;
                return (
                  <tr key={row.label} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-500 text-xs font-medium">{row.label}</td>
                    {compareList.map((r) => {
                      const val = row.getValue(r);
                      const isMax = typeof val === "number" && maxVal !== null && val === maxVal && maxVal > 0;
                      return (
                        <td key={r.id} className="px-4 py-3 text-center">
                          {typeof val === "number" ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-lg font-bold ${isMax ? "text-[#0066FF]" : "text-gray-700"}`}>{val}</span>
                              {isMax && <span className="text-xs text-[#0066FF]">★ {t("religions.compareBest")}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-600">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {compareList.map((r) => (
              <Link
                key={r.id}
                href={`/religions/${r.slug}`}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: r.color || "#0066FF" }}
              >
                {t("religions.exploreReligion", { name: r.name })}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function SpiritualQuiz({ religionStats }: { religionStats: ReligionStat[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ReligionStat | null>(null);

  const handleAnswer = (optionIdx: number) => {
    const stepData = QUIZ_STEPS[step];
    const bonus = stepData.scores[optionIdx] || {};
    const newScores = { ...scores };
    Object.entries(bonus).forEach(([k, v]) => {
      newScores[k] = (newScores[k] || 0) + (v as number);
    });
    setScores(newScores);

    if (step + 1 >= QUIZ_STEPS.length) {
      const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0]?.[0];
      const match = religionStats.find((r) => r.slug?.includes(top || "") || r.nameEn?.toLowerCase().includes(top || "")) || religionStats[0];
      setResult(match || null);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setScores({});
    setResult(null);
  };

  const currentStep = QUIZ_STEPS[step];

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      {!open ? (
        <div
          className="hero-bg rounded-2xl p-8 md:p-10 text-center text-white cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setOpen(true)}
        >
          <div className="text-4xl mb-3">🔮</div>
          <h2 className="text-2xl font-bold mb-2">{t("religions.quizTitle")}</h2>
          <p className="text-blue-100 mb-5 max-w-md mx-auto">{t("religions.quizSubtitle")}</p>
          <button className="px-6 py-3 bg-white text-[#0066FF] rounded-xl font-bold hover:bg-blue-50 transition-colors">
            {t("religions.quizStart")}
          </button>
        </div>
      ) : result ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="text-6xl mb-4">{result.symbol}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("religions.quizResultTitle")}</h2>
          <p className="text-gray-500 mb-1">{t("religions.quizResultDesc")}</p>
          <h3 className="text-3xl font-bold text-[#0066FF] mb-1" style={{ color: result.color || "#0066FF" }}>
            {result.name}
          </h3>
          <p className="text-gray-400 text-sm mb-6">{result.nameEn}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/religions/${result.slug}`}
              className="px-6 py-2.5 rounded-xl font-semibold text-white"
              style={{ backgroundColor: result.color || "#0066FF" }}
            >
              {t("religions.quizExplore")}
            </Link>
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t("religions.quizRetry")}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-500">
              {t("religions.quizProgress", { current: String(step + 1), total: String(QUIZ_STEPS.length) })}
            </span>
            <div className="flex gap-1.5">
              {QUIZ_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-[#0066FF]" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t(currentStep.keyQ)}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentStep.keyOpts.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-[#0066FF] hover:bg-blue-50 transition-all text-sm text-gray-700 font-medium"
              >
                {t(opt)}
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); reset(); }} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {t("religions.quizClose")}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Recently Viewed ──────────────────────────────────────────────────────────
function RecentlyViewedSection({ viewed, religionStats }: { viewed: string[]; religionStats: ReligionStat[] }) {
  const { t } = useTranslation();
  const viewedReligions = viewed.map((slug) => religionStats.find((r) => r.slug === slug)).filter(Boolean) as ReligionStat[];
  if (viewedReligions.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-base font-semibold text-gray-700">{t("religions.recentlyViewed")}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {viewedReligions.map((r) => (
          <Link
            key={r.id}
            href={`/religions/${r.slug}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 hover:border-[#0066FF] hover:shadow-sm transition-all text-sm"
          >
            <span className="text-xl">{r.symbol}</span>
            <span className="text-gray-700 font-medium">{r.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReligionsClient({ religions, holySites, temples, patriarchs, error }: Props) {
  const { t } = useTranslation();
  const { viewed, addViewed } = useRecentlyViewed();

  const religionStats: ReligionStat[] = religions.map((r) => ({
    ...r,
    siteCount: holySites.filter((s) => s.religionId === r.id).length,
    templeCount: temples.filter((tp) => tp.religionId === r.id).length,
    patriarchCount: patriarchs.filter((p) => p.religionId === r.id).length,
  }));

  const totalSites = holySites.length;
  const totalTemples = temples.length;
  const totalPatriarchs = patriarchs.length;
  const totalCountries = [...new Set(holySites.map((s) => s.country).filter(Boolean))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-bg text-white pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">
            {t("religions.heroSubtag")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("religions.heroTitle")}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("religions.heroDesc")}
          </p>
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div>
              <p className="text-3xl font-bold">{religions.length}</p>
              <p className="text-blue-200 text-sm">{t("religions.statFaiths")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalSites}</p>
              <p className="text-blue-200 text-sm">{t("religions.statSites")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalTemples}</p>
              <p className="text-blue-200 text-sm">{t("religions.statTemples")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalPatriarchs}</p>
              <p className="text-blue-200 text-sm">{t("religions.statPatriarchs")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalCountries}</p>
              <p className="text-blue-200 text-sm">{t("religions.statCountries")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 -mt-10 relative z-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureCulture")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureCultureDesc")}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureNetwork")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureNetworkDesc", { countries: String(totalCountries), sites: String(totalSites) })}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureRoutes")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureRoutesDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <DataLoadError />
        </div>
      ) : (
        <>
          {/* Recently Viewed */}
          <RecentlyViewedSection viewed={viewed} religionStats={religionStats} />

          {/* Featured Spotlight */}
          <FeaturedSpotlight religionStats={religionStats} onView={addViewed} />

          {/* World Map */}
          <WorldMapSection holySites={holySites} religionStats={religionStats} />

          {/* Era Timeline Filter + Grid */}
          <EraTimelineFilter religionStats={religionStats} onView={addViewed} />

          {/* All Religions quick grid header */}
          <section className="max-w-6xl mx-auto px-4 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t("religions.exploreTitle")}</h2>
                <p className="text-gray-500 text-sm mt-1">{t("religions.exploreDesc")}</p>
              </div>
              <Link href="/map" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium flex items-center gap-1">
                {t("religions.mapBrowse")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {religionStats.map((r) => (
                <ReligionCard key={r.id} r={r} onView={addViewed} />
              ))}
            </div>
          </section>

          {/* Compare Tool */}
          <CompareReligions religionStats={religionStats} />

          {/* Religion Detail Table */}
          {religions.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 py-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("religions.overviewTitle")}</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-4 font-semibold text-gray-700">{t("religions.colFaith")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colSites")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colTemples")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colPatriarchs")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.followers")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.compareEra")}</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {religionStats.map((r) => {
                        const followersKey = Object.keys(RELIGION_FOLLOWERS).find((k) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k));
                        const followersVal = followersKey ? RELIGION_FOLLOWERS[followersKey] : "—";
                        const eraEntry = Object.entries(RELIGION_ERA).find(([k]) => r.slug?.includes(k) || r.nameEn?.toLowerCase().includes(k));
                        const eraKey = eraEntry?.[1];
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{r.symbol}</span>
                                <div>
                                  <p className="font-medium text-gray-900">{r.name}</p>
                                  <p className="text-xs text-gray-400">{r.nameEn}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-[#0066FF] font-medium text-xs">{r.siteCount}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-medium text-xs">{r.templeCount}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium text-xs">{r.patriarchCount}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-xs text-gray-600">{followersVal}</td>
                            <td className="px-6 py-4 text-center">
                              {eraKey && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  eraKey === "ancient" ? "bg-amber-50 text-amber-600" :
                                  eraKey === "medieval" ? "bg-purple-50 text-purple-600" :
                                  "bg-sky-50 text-sky-600"
                                }`}>
                                  {t(`religions.era_${eraKey}`)}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/religions/${r.slug}`}
                                onClick={() => addViewed(r.slug)}
                                className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium"
                              >
                                {t("religions.explore")} →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Spiritual Quiz */}
          <SpiritualQuiz religionStats={religionStats} />
        </>
      )}

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t("religions.faqTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: t("religions.faq1Q"), a: t("religions.faq1A") },
            { q: t("religions.faq2Q"), a: t("religions.faq2A") },
            { q: t("religions.faq3Q"), a: t("religions.faq3A") },
            { q: t("religions.faq4Q"), a: t("religions.faq4A") },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="hero-bg rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("religions.ctaTitle")}</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">{t("religions.ctaDesc")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/routes" className="px-8 py-3 bg-white text-[#0066FF] rounded-xl font-bold hover:bg-blue-50 transition-colors">
              {t("religions.ctaBrowseRoutes")}
            </Link>
            <Link href="/chat" className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
              {t("religions.ctaAiPlan")}
            </Link>
          </div>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
