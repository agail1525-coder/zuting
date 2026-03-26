"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import type { Religion, Teaching } from "@/lib/api";

interface Props {
  religions: Religion[];
  teachings: Teaching[];
}

export default function TeachingsClient({ religions, teachings }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? teachings.filter((td) => td.religionId === filter)
    : teachings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          {t("section.allTeachings")}
        </h1>
        <p className="text-temple-400 text-lg">
          {filtered.length} {t("stats.teachings")}
        </p>
      </div>

      <div className="mb-8">
        <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((teaching) => (
          <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
            <div className="card-glow rounded-xl p-6 bg-temple-800/50 group cursor-pointer h-full flex flex-col">
              <h3 className="font-serif font-bold text-white group-hover:text-gold transition-colors mb-3">
                {teaching.name}
              </h3>
              <p className="text-temple-300 text-sm font-serif leading-relaxed line-clamp-4 flex-1">
                {teaching.originalText}
              </p>
              {teaching.sourceText && (
                <p className="text-temple-500 text-xs mt-3">— {teaching.sourceText}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
