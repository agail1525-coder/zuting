"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

interface Props {
  religions: Religion[];
  patriarchs: Patriarch[];
  error?: boolean;
}

export default function PatriarchsClient({ religions, patriarchs, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? patriarchs.filter((p) => p.religionId === filter)
    : patriarchs;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
              {t("section.allPatriarchs")}
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
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
            {t("section.allPatriarchs")}
          </h1>
          <p className="text-temple-400 text-lg">
            {filtered.length} {t("stats.patriarchs")}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <PatriarchCard key={p.id} patriarch={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">👤</span>
            <p className="text-temple-400">{t("common.noResults") || "暂无数据"}</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
