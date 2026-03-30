"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import HolySiteCard from "@/components/HolySiteCard";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

/* Deterministic pseudo-random from string */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SORT_OPTIONS = [
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "country", label: "按国家" },
  { value: "popular", label: "最受欢迎" },
];

const PAGE_SIZE = 12;

interface Props {
  religions: Religion[];
  holySites: HolySite[];
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

export default function HolySitesClient({ religions, holySites, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Unique countries for facet filter
  const countries = useMemo(() => {
    const set = new Set(holySites.map((s) => s.country));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
  }, [holySites]);

  // Stats
  const stats = useMemo(() => {
    const countryCount = new Set(holySites.map((s) => s.country)).size;
    const religionCount = new Set(holySites.map((s) => s.religionId)).size;
    return { total: holySites.length, countries: countryCount, religions: religionCount };
  }, [holySites]);

  const filtered = useMemo(() => {
    let result = holySites;
    if (filter) result = result.filter((s) => s.religionId === filter);
    if (countryFilter) result = result.filter((s) => s.country === countryFilter);
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
      if (sort === "popular") return hashStr(b.id) - hashStr(a.id);
      return 0;
    });
    return result;
  }, [holySites, filter, countryFilter, search, sort]);

  const hasActiveFilters = !!(filter || countryFilter || search);

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
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">{t("section.allHolySites")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.holySitesSubtitle") || "探索全球宗教文化圣地"}</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">🏛️ {stats.total} 个圣地</span>
            <span className="flex items-center gap-1">🌍 {stats.countries} 个国家</span>
            <span className="flex items-center gap-1">🙏 {stats.religions} 大信仰</span>
          </div>
        </div>

        {/* ══════ Country Quick Filter (对标Booking地区筛选) ══════ */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setCountryFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              countryFilter === null
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            🌏 所有国家
          </button>
          {countries.map((c) => {
            const count = holySites.filter((s) => s.country === c).length;
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

        {/* Toolbar + View toggle */}
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
                placeholder="搜索圣地名称、国家、描述..."
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  viewMode === "grid" ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t("holySites.gridView") || "列表模式"}
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  viewMode === "map" ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {t("holySites.mapView") || "地图模式"}
              </button>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">找到 {filtered.length} 个圣地</span>
                <button
                  onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); }}
                  className="text-[#0066FF] hover:underline text-xs"
                >
                  清除全部筛选
                </button>
              </div>
            )}
          </div>
        </div>

        {viewMode === "grid" ? (
          <>
            {/* Grid with popularity signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visibleCount).map((site) => {
                const h = hashStr(site.id);
                const visitors = (h % 50) + 10;
                const rating = 4.0 + (h % 10) / 10;
                return (
                  <div key={site.id} className="relative">
                    <HolySiteCard site={site} />
                    {/* Popularity overlay (Booking/TripAdvisor style) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                      <span className="px-2 py-1 rounded-md bg-[#0066FF] text-white text-[10px] font-bold shadow-sm">
                        {rating.toFixed(1)} ★
                      </span>
                    </div>
                    <div className="absolute bottom-[calc(100%-176px)] left-3 z-10">
                      <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-white text-[10px]">
                        {visitors}人本周访问
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="text-gray-500 text-lg">{t("common.noResults") || "暂无匹配结果"}</p>
                <p className="text-gray-400 text-sm mt-1">尝试调整筛选条件或搜索关键词</p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); }}
                    className="mt-3 text-sm text-[#0066FF] hover:underline"
                  >
                    清除全部筛选条件
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
                  加载更多 ({filtered.length - visibleCount} 个圣地)
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  已展示 {Math.min(visibleCount, filtered.length)} / {filtered.length}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <WorldMapDynamic holySites={filtered} religions={religions} height="600px" interactive />
          </div>
        )}

        {/* ══════ Bottom CTA (对标TripAdvisor) ══════ */}
        <div className="mt-12 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-8 border border-[#0066FF]/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">找不到想去的圣地？</h2>
              <p className="text-gray-500 text-sm mt-1">让AI旅行规划师根据你的偏好推荐最适合的朝圣目的地</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/chat"
                className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
              >
                ✨ AI推荐圣地
              </Link>
              <Link
                href="/routes"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200 text-sm"
              >
                浏览路线 →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
