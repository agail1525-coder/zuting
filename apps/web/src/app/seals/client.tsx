"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import SealCard from "@/components/SealCard";
import type { Seal, SealSeries } from "@/lib/api";

const seriesOrder: SealSeries[] = [
  "CHUYIN",
  "ZHONGYIN",
  "YINGUOYIN",
  "CHENGDAOYIN",
  "GUIYUANYIN",
];

const seriesButtonColors: Record<string, string> = {
  CHUYIN: "bg-blue-500 text-white",
  ZHONGYIN: "bg-emerald-500 text-white",
  YINGUOYIN: "bg-amber-500 text-white",
  CHENGDAOYIN: "bg-purple-500 text-white",
  GUIYUANYIN: "bg-rose-500 text-white",
};

interface Props {
  seals: Seal[];
}

export default function SealsClient({ seals }: Props) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
              ? "bg-gold text-temple-900 font-semibold"
              : "bg-temple-800 text-temple-300 hover:bg-temple-700 border border-temple-600"
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
                : "bg-temple-800 text-temple-300 hover:bg-temple-700 border border-temple-600"
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
    </div>
  );
}
