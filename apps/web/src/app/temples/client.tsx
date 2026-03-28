"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import TempleCard from "@/components/TempleCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, Temple } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

interface Props {
  religions: Religion[];
  temples: Temple[];
  error?: boolean;
}

export default function TemplesClient({ religions, temples, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? temples.filter((t) => t.religionId === filter)
    : temples;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
            {t("section.allTemples")}
          </h1>
          <p className="text-gray-500 text-lg">
            {filtered.length} {t("stats.temples")}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((temple) => (
            <TempleCard key={temple.id} temple={temple} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">🏛</span>
            <p className="text-gray-500">{t("common.noResults") || "暂无数据"}</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
