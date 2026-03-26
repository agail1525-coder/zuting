"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import TempleCard from "@/components/TempleCard";
import type { Religion, Temple } from "@/lib/api";

interface Props {
  religions: Religion[];
  temples: Temple[];
}

export default function TemplesClient({ religions, temples }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? temples.filter((t) => t.religionId === filter)
    : temples;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          {t("section.allTemples")}
        </h1>
        <p className="text-temple-400 text-lg">
          {filtered.length} {t("stats.temples")}
        </p>
      </div>

      <div className="mb-8">
        <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((temple) => (
          <TempleCard key={temple.id} temple={temple} />
        ))}
      </div>
    </div>
  );
}
