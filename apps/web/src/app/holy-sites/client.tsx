"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import HolySiteCard from "@/components/HolySiteCard";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const SORT_OPTIONS = [
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "country", label: "按国家" },
];

const PAGE_SIZE = 12;

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  error?: boolean;
}

export default function HolySitesClient({ religions, holySites, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = holySites;
    if (filter) result = result.filter((s) => s.religionId === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "country") return a.country.localeCompare(b.country);
      return 0;
    });
    return result;
  }, [holySites, filter, search, sort]);

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
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allHolySites")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.holySitesSubtitle") || "探索全球宗教文化圣地"}</p>
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
                placeholder="搜索圣地名称、国家..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visibleCount).map((site) => (
                <HolySiteCard key={site.id} site={site} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-4xl block mb-4">🕌</span>
                <p className="text-gray-500">{t("common.noResults") || "暂无数据"}</p>
              </div>
            )}
            {visibleCount < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  加载更多 ({filtered.length - visibleCount} 条)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <WorldMapDynamic holySites={filtered} religions={religions} height="600px" interactive />
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
