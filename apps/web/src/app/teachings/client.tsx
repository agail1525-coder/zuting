"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import FilterBar from "@/components/FilterBar";
import MobileNav from "@/components/MobileNav";
import type { Religion, Teaching } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

interface Props {
  religions: Religion[];
  teachings: Teaching[];
  error?: boolean;
}

export default function TeachingsClient({ religions, teachings, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? teachings.filter((td) => td.religionId === filter)
    : teachings;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.allTeachings")}
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
            {t("section.allTeachings")}
          </h1>
          <p className="text-gray-500 text-lg">
            {filtered.length} {t("stats.teachings")}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar religions={religions} selectedId={filter} onChange={setFilter} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((teaching) => (
            <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
              <div className="shadow-sm border border-gray-100 rounded-xl p-6 bg-white group cursor-pointer h-full flex flex-col hover:shadow-md transition-all">
                <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-3">
                  {teaching.name}
                </h3>
                <p className="text-gray-600 text-sm font-serif leading-relaxed line-clamp-4 flex-1">
                  {teaching.originalText}
                </p>
                {teaching.sourceText && (
                  <p className="text-gray-400 text-xs mt-3">— {teaching.sourceText}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">📜</span>
            <p className="text-gray-500">{t("common.noResults") || "暂无数据"}</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
