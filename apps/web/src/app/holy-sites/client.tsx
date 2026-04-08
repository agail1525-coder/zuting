"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import HolySiteCard from "@/components/HolySiteCard";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite, Route } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";
import OptimizedImage from "@/components/OptimizedImage";

const PAGE_SIZE = 12;

/* ── Continent classification by lat/lng ── */
type ContinentKey = "asia" | "europe" | "middleEast" | "africa" | "americas";

function classifyContinent(lat: number, lng: number): ContinentKey {
  // Middle East check first (overlaps with Asia/Africa)
  if (lat >= 15 && lat <= 42 && lng >= 25 && lng <= 65) return "middleEast";
  if (lat >= -10 && lat <= 55 && lng >= 60 && lng <= 150) return "asia";
  if (lat >= 35 && lat <= 70 && lng >= -25 && lng <= 45) return "europe";
  if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) return "africa";
  if (lat >= -55 && lat <= 70 && lng >= -170 && lng <= -30) return "americas";
  // Default to Asia for edge cases
  return "asia";
}

const CONTINENT_KEYS: ContinentKey[] = ["asia", "europe", "middleEast", "africa", "americas"];

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  featuredRoutes?: Route[];
  error?: boolean;
}

/* Skeleton loader for grid cards */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function HolySitesClient({ religions, holySites, featuredRoutes = [], error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [continentFilter, setContinentFilter] = useState<ContinentKey | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('zuting_recently_viewed') || '[]');
      const siteIds = stored
        .filter((r: { type: string }) => r.type === 'holy-sites')
        .map((r: { id: string }) => r.id)
        .slice(0, 4);
      setRecentlyViewed(siteIds);
    } catch { /* ignore */ }
  }, []);

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareSites = useMemo(
    () => holySites.filter((s) => compareList.includes(s.id)),
    [holySites, compareList]
  );

  const recentSites = useMemo(
    () => recentlyViewed.map((id) => holySites.find((s) => s.id === id)).filter(Boolean) as HolySite[],
    [holySites, recentlyViewed]
  );

  const SORT_OPTIONS = useMemo(() => [
    { value: "name-asc", label: t("holySites.sort.nameAsc") },
    { value: "name-desc", label: t("holySites.sort.nameDesc") },
    { value: "country", label: t("holySites.sort.country") },
    { value: "rating", label: t("holySites.sort.rating") },
    { value: "reviews", label: t("holySites.sort.reviews") },
  ], [t]);

  // Stats
  const stats = useMemo(() => {
    const countryCount = new Set(holySites.map((s) => s.country)).size;
    const religionCount = new Set(holySites.map((s) => s.religionId)).size;
    return { total: holySites.length, countries: countryCount, religions: religionCount };
  }, [holySites]);

  // Continent map
  const continentMap = useMemo(() => {
    const map: Record<ContinentKey, HolySite[]> = {
      asia: [], europe: [], middleEast: [], africa: [], americas: [],
    };
    holySites.forEach((s) => {
      const c = classifyContinent(s.latitude, s.longitude);
      map[c].push(s);
    });
    return map;
  }, [holySites]);

  // Faith categories with counts
  const faithCategories = useMemo(() => {
    const all = { id: null as string | null, name: t("common.all") || "All", symbol: "\uD83C\uDF0F", count: holySites.length };
    const items = religions.map((r) => ({
      id: r.id as string | null,
      name: r.name,
      symbol: r.symbol || "\uD83D\uDE4F",
      count: holySites.filter((s) => s.religionId === r.id).length,
    }));
    return [all, ...items];
  }, [religions, holySites, t]);

  // Featured top 3 by reviewCount
  const featured = useMemo(() => {
    return [...holySites]
      .filter((s) => s.reviewStats?.reviewCount)
      .sort((a, b) => (b.reviewStats?.reviewCount ?? 0) - (a.reviewStats?.reviewCount ?? 0))
      .slice(0, 3);
  }, [holySites]);

  const filtered = useMemo(() => {
    let result = holySites;
    if (filter) result = result.filter((s) => s.religionId === filter);
    if (countryFilter) result = result.filter((s) => s.country === countryFilter);
    if (continentFilter) {
      result = result.filter((s) => classifyContinent(s.latitude, s.longitude) === continentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "country") return a.country.localeCompare(b.country);
      if (sort === "rating") return (b.reviewStats?.averageRating ?? 0) - (a.reviewStats?.averageRating ?? 0);
      if (sort === "reviews") return (b.reviewStats?.reviewCount ?? 0) - (a.reviewStats?.reviewCount ?? 0);
      return 0;
    });
    return result;
  }, [holySites, filter, countryFilter, continentFilter, search, sort]);

  const hasActiveFilters = !!(filter || countryFilter || continentFilter || search);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allHolySites")}</h1>
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

        {/* ══════ Hero Banner ══════ */}
        <div className="bg-gradient-to-b from-[#0066FF]/8 to-transparent rounded-3xl p-8 md:p-12 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3 text-center">
            {t("holySites.heroTitle")}
          </h1>
          <p className="text-gray-500 text-lg text-center mb-6">
            {t("holySites.heroSubtitle")}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              🏛️ {t("holySites.sitesCount").replace("{{count}}", String(stats.total))}
            </span>
            <span className="flex items-center gap-1">
              🌍 {t("holySites.countriesCount").replace("{{count}}", String(stats.countries))}
            </span>
            <span className="flex items-center gap-1">
              🙏 {t("holySites.faithsCount").replace("{{count}}", String(stats.religions))}
            </span>
          </div>
          {/* Embedded search */}
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Search holy sites"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder={t("holySites.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
            />
          </div>
        </div>

        {/* ══════ Featured Routes — Top Prominence ══════ */}
        {featuredRoutes.length > 0 && (
          <div id="routes" className="mb-10">
            <div className="flex items-center justify-between mb-5 px-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">HOT</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t("holySites.routes.title")}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{t("holySites.routes.subtitle")}</p>
                </div>
              </div>
              <Link
                href="/holy-sites#routes"
                className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium transition-colors whitespace-nowrap"
              >
                {t("holySites.routes.viewAll")} →
              </Link>
            </div>
            {/* Short centered blue band — cards overflow equally above and below for layered depth */}
            <div className="relative py-12 md:py-14">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 md:h-36 bg-gradient-to-b from-[#0066FF]/8 via-[#0066FF]/12 to-[#0066FF]/8 rounded-2xl border border-[#0066FF]/15 shadow-[0_4px_20px_-8px_rgba(0,102,255,0.25)]" aria-hidden="true" />
            <div className="relative flex gap-5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {featuredRoutes.map((route) => {
                const price = route.priceFrom ? (route.priceFrom / 100).toLocaleString() : null;
                const siteNames = (route.sites || []).slice(0, 4).map((s: { site?: { name?: string }; siteName?: string }) => s.site?.name || s.siteName || "");
                return (
                  <Link
                    key={route.id}
                    href={`/holy-sites/routes/${route.slug}`}
                    className="group flex-none w-[300px] md:w-[340px] snap-start"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#0066FF]/30 transition-all duration-300">
                      <div className="relative h-44 overflow-hidden">
                        {route.coverImage ? (
                          <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-4xl">🗺️</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                          {route.duration}{t("holySites.routes.days")} · {(route.sites || []).length}{t("holySites.routes.stops")}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-bold text-base line-clamp-1">{route.title}</h3>
                          {route.subtitle && <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{route.subtitle}</p>}
                        </div>
                      </div>
                      {siteNames.length > 0 && (
                        <div className="px-4 pt-3 flex items-center gap-1 overflow-hidden">
                          {siteNames.map((name: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 shrink-0">
                              <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#0066FF]" : i === siteNames.length - 1 ? "bg-emerald-500" : "bg-gray-300"}`} />
                              <span className="text-xs text-gray-500 whitespace-nowrap">{name}</span>
                              {i < siteNames.length - 1 && <span className="text-gray-300 text-xs">—</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          {price && <span className="text-[#0066FF] font-bold text-lg">¥{price}<span className="text-xs text-gray-400 font-normal">/人</span></span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {route.rating && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-[#0066FF] rounded font-medium">
                              ★ {Number(route.rating).toFixed(1)}
                            </span>
                          )}
                          {route.bookCount ? <span>{route.bookCount}人出发</span> : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* ══════ Photo Mosaic Header (Airbnb-style) ══════ */}
        {!hasActiveFilters && holySites.length >= 5 && (
          <div className="grid grid-cols-4 grid-rows-2 gap-1 h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
            <div className="col-span-2 row-span-2 relative">
              {holySites[0].imageUrl ? (
                <OptimizedImage src={holySites[0].imageUrl} alt={holySites[0].name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-6xl opacity-30">{holySites[0].religion?.symbol || "🏛"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-lg">{holySites[0].name}</h3>
                <p className="text-white/80 text-sm">{holySites[0].country}</p>
              </div>
            </div>
            {holySites.slice(1, 5).map((site) => (
              <div key={site.id} className="relative overflow-hidden">
                {site.imageUrl ? (
                  <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-3xl opacity-30">{site.religion?.symbol || "🏛"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2 left-2">
                  <p className="text-white text-xs font-medium drop-shadow-md">{site.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ Faith Category Slider (Airbnb-style) ══════ */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {faithCategories.map((r) => (
            <button
              key={r.id ?? "all"}
              onClick={() => { setFilter(r.id); setVisibleCount(PAGE_SIZE); }}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl min-w-[80px] transition-all border ${
                filter === r.id
                  ? "bg-[#0066FF]/10 border-[#0066FF]/30 text-[#0066FF] shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{r.symbol}</span>
              <span className="text-xs font-medium truncate max-w-[72px]">{r.name}</span>
              <span className="text-[10px] text-gray-400">{r.count}</span>
            </button>
          ))}
        </div>

        {/* ══════ Continent Quick Filter ══════ */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setContinentFilter(null); setVisibleCount(PAGE_SIZE); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              continentFilter === null
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            🌏 {t("holySites.continent.all")}
          </button>
          {CONTINENT_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => { setContinentFilter(continentFilter === key ? null : key); setVisibleCount(PAGE_SIZE); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                continentFilter === key
                  ? "bg-[#0066FF] text-white shadow-sm"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {t(`holySites.continent.${key}`)} ({continentMap[key].length})
            </button>
          ))}
        </div>

        {/* ══════ Toolbar + View toggle ══════ */}
        <div className="mb-8 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
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
                placeholder={t("holySites.searchPlaceholder")}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                <button
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === "grid" ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {t("holySites.gridView")}
                </button>
                <button
                  aria-label="Map view"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === "map" ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {t("holySites.mapView")}
                </button>
              </div>
              {/* Compare toggle (Kayak-style) */}
              <button
                aria-label="Toggle compare mode"
                onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareList([]); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  compareMode
                    ? "bg-[#0066FF] text-white border-[#0066FF] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {compareMode ? t("holySites.compareExit") : t("holySites.compare")}
              </button>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">
                  {t("holySites.foundResults").replace("{{count}}", String(filtered.length))}
                </span>
                <button
                  onClick={() => { setFilter(null); setCountryFilter(null); setContinentFilter(null); setSearch(""); }}
                  className="text-[#0066FF] hover:underline text-xs"
                >
                  {t("holySites.clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>

        {viewMode === "grid" ? (
          <>
            {/* ══════ Recently Viewed (Airbnb-style) ══════ */}
            {!hasActiveFilters && recentSites.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("holySites.recentlyViewed")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recentSites.map((site) => (
                    <Link key={site.id} href={`/holy-sites/${site.id}`} className="group">
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="h-28 relative overflow-hidden">
                          {site.imageUrl ? (
                            <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-3xl opacity-30">{site.religion?.symbol || "🏛"}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0066FF] transition-colors">{site.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{site.country}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ Featured Section (only when no filters) ══════ */}
            {!hasActiveFilters && featured.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("holySites.featured")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featured.map((site) => (
                    <Link key={site.id} href={`/holy-sites/${site.id}`} className="group">
                      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                        <div className="h-48 relative overflow-hidden">
                          {site.imageUrl ? (
                            <img
                              src={site.imageUrl}
                              alt={site.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-5xl opacity-30">{site.religion?.symbol || "🏛"}</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            {site.reviewStats?.averageRating && (
                              <span className="px-2 py-1 rounded-md bg-[#0066FF] text-white text-xs font-bold shadow-sm">
                                ★ {site.reviewStats.averageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-bold text-lg">{site.name}</h3>
                            <p className="text-white/80 text-sm">{site.country}</p>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between text-sm text-gray-500">
                          <span>{site.religion?.name}</span>
                          {site.reviewStats?.reviewCount ? (
                            <span>{site.reviewStats.reviewCount} {t("holySites.reviews")}</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ Grid ══════ */}
            {/* Compare info bar */}
            {compareMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  {t("holySites.compareMode")} — {t("holySites.compareSelected").replace("{{count}}", String(compareList.length))}
                </span>
                {compareList.length >= 2 && (
                  <button
                    onClick={() => {
                      const el = document.getElementById("compare-panel");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-1.5 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0052CC] transition-colors"
                  >
                    {t("holySites.compareNow")}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visibleCount).map((site) => (
                <HolySiteCard
                  key={site.id}
                  site={site}
                  compareMode={compareMode}
                  isCompared={compareList.includes(site.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="text-gray-500 text-lg">{t("holySites.emptyTitle")}</p>
                <p className="text-gray-400 text-sm mt-1">{t("holySites.emptyHint")}</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilter(null); setCountryFilter(null); setContinentFilter(null); setSearch(""); }}
                    className="mt-3 text-sm text-[#0066FF] hover:underline"
                  >
                    {t("holySites.clearFilters")}
                  </button>
                )}
              </div>
            )}

            {/* Load more */}
            {visibleCount < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {t("holySites.loadMore")} ({t("holySites.remaining").replace("{{count}}", String(filtered.length - visibleCount))})
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  {t("holySites.showing")
                    .replace("{{shown}}", String(Math.min(visibleCount, filtered.length)))
                    .replace("{{total}}", String(filtered.length))}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <WorldMapDynamic holySites={filtered} religions={religions} height="600px" interactive />
          </div>
        )}

        {/* ══════ Comparison Panel (Kayak-style) ══════ */}
        {compareMode && compareList.length >= 2 && (
          <div id="compare-panel" className="mt-8 mb-8 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{t("holySites.compareTitle")}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-4 w-36 text-gray-400 font-normal"></th>
                    {compareSites.map((site) => (
                      <th key={site.id} className="p-4 text-center min-w-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-20 h-20 rounded-xl overflow-hidden relative">
                            {site.imageUrl ? (
                              <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">{site.religion?.symbol || "🏛"}</div>
                            )}
                          </div>
                          <span className="font-bold text-gray-900">{site.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareRating")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center">
                        {site.reviewStats?.averageRating ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0066FF]/10 text-[#0066FF] rounded-md font-bold">
                            ★ {site.reviewStats.averageRating.toFixed(1)}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareReviews")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center text-gray-700">
                        {site.reviewStats?.reviewCount ?? 0}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareCountry")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center text-gray-700">{site.country}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareFaith")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center">
                        <span style={{ color: site.religion?.color ?? '#0066FF' }}>{site.religion?.symbol} {site.religion?.name}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.comparePrice")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center text-gray-700">
                        {site.ticketPrice != null ? (site.ticketPrice === "0" || site.ticketPrice === "免费" ? t("holySites.free") : site.ticketPrice) : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareDuration")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center text-gray-700">
                        {site.visitDuration || <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-4 text-gray-500 font-medium">{t("holySites.compareSeason")}</td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center text-gray-700">
                        {site.bestSeason || <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-4"></td>
                    {compareSites.map((site) => (
                      <td key={site.id} className="p-4 text-center">
                        <Link
                          href={`/holy-sites/${site.id}`}
                          className="inline-flex px-4 py-2 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0052CC] transition-colors"
                        >
                          {t("holySites.compareView")}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════ Bottom CTA ══════ */}
        <div className="mt-12 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-8 border border-[#0066FF]/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">{t("holySites.ctaTitle")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("holySites.ctaDesc")}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/chat"
                className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
              >
                {t("holySites.ctaAI")}
              </Link>
              <Link
                href="/holy-sites#routes"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200 text-sm"
              >
                {t("holySites.ctaRoutes")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
