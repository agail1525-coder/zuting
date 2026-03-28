"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import PatriarchCard from "@/components/PatriarchCard";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
            {t("section.allPatriarchs")}
          </h1>
        </div>
        <DataLoadError />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          {t("section.allPatriarchs")}
        </h1>
        <p className="text-temple-400 text-lg">
          {filtered.length} {t("stats.patriarchs")}
        </p>
      </div>

      <div className="mb-8">
        <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <PatriarchCard key={p.id} patriarch={p} />
        ))}
      </div>
    </div>
  );
}
