"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import HolySiteCard from "@/components/HolySiteCard";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  error?: boolean;
}

export default function HolySitesClient({ religions, holySites, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const filtered = filter
    ? holySites.filter((s) => s.religionId === filter)
    : holySites;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.allHolySites")}
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
            {t("section.allHolySites")}
          </h1>
          <p className="text-gray-500 text-lg">
            {filtered.length} {t("stats.holySites")}
          </p>
        </div>

        {/* View mode toggle + filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <FilterBar
            religions={religions}
            selectedId={filter}
            onChange={setFilter}
          />
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === "grid"
                  ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
                viewMode === "map"
                  ? "bg-[#0066FF]/10 text-[#0066FF] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {t("holySites.mapView") || "地图模式"}
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((site) => (
                <HolySiteCard key={site.id} site={site} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="text-4xl block mb-4">🕌</span>
                <p className="text-gray-500">{t("common.noResults") || "暂无数据"}</p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <WorldMapDynamic
              holySites={filtered}
              religions={religions}
              height="600px"
              interactive
            />
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
