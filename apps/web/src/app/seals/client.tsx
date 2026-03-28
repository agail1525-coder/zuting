"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import SealCard from "@/components/SealCard";
import MobileNav from "@/components/MobileNav";
import type { Seal, SealSeries } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const seriesOrder: SealSeries[] = [
  "CHUYIN",
  "ZHONGYIN",
  "YINGUOYIN",
  "CHENGDAOYIN",
  "GUIYUANYIN",
];

const seriesButtonColors: Record<string, string> = {
  CHUYIN: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
  ZHONGYIN: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
  YINGUOYIN: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
  CHENGDAOYIN: "bg-purple-500 text-white shadow-lg shadow-purple-500/20",
  GUIYUANYIN: "bg-rose-500 text-white shadow-lg shadow-rose-500/20",
};

interface Props {
  seals: Seal[];
  error?: boolean;
}

export default function SealsClient({ seals, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SealSeries | null>(null);

  const filtered = filter ? seals.filter((s) => s.series === filter) : seals;

  // Group by series for display
  const grouped = seriesOrder.map((series) => ({
    series,
    name: t(`seal.series.${series}`),
    seals: filtered.filter((s) => s.series === series),
  }));

  const displayGroups = filter
    ? grouped.filter((g) => g.series === filter)
    : grouped;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
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
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
            {t("section.thirtySeals")}
          </h1>
          <p className="text-temple-400 text-lg">
            {filtered.length} {t("stats.seals")}
          </p>
        </div>

        {/* Series filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === null
                ? "bg-gold text-temple-900 font-semibold shadow-lg shadow-gold/20"
                : "bg-temple-800/60 text-temple-300 hover:bg-temple-700/60 border border-temple-600/50"
            }`}
          >
            {t("filter.all")}
          </button>
          {seriesOrder.map((series) => (
            <button
              key={series}
              onClick={() => setFilter(series)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === series
                  ? seriesButtonColors[series]
                  : "bg-temple-800/60 text-temple-300 hover:bg-temple-700/60 border border-temple-600/50"
              }`}
            >
              {t(`seal.series.${series}`)}
            </button>
          ))}
        </div>

        {/* Grouped display */}
        {displayGroups.map(
          (group) =>
            group.seals.length > 0 && (
              <div key={group.series} className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-temple-200 mb-6 flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      {
                        CHUYIN: "bg-blue-400",
                        ZHONGYIN: "bg-emerald-400",
                        YINGUOYIN: "bg-amber-400",
                        CHENGDAOYIN: "bg-purple-400",
                        GUIYUANYIN: "bg-rose-400",
                      }[group.series]
                    }`}
                  />
                  {group.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.seals.map((seal) => (
                    <SealCard key={seal.id} seal={seal} />
                  ))}
                </div>
              </div>
            )
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">🙏</span>
            <p className="text-temple-400">{t("common.noResults") || "暂无数据"}</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
