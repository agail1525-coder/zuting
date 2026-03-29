"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const SORT_OPTIONS = [
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "newest", label: "最新添加" },
];

const PAGE_SIZE = 16;

interface Props {
  religions: Religion[];
  patriarchs: Patriarch[];
  error?: boolean;
}

export default function PatriarchsClient({ religions, patriarchs, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = patriarchs;
    if (filter) result = result.filter((p) => p.religionId === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameEn ?? "").toLowerCase().includes(q) ||
          (p.title ?? "").toLowerCase().includes(q) ||
          (p.dates ?? "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      return 0;
    });
    return result;
  }, [patriarchs, filter, search, sort]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allPatriarchs")}</h1>
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allPatriarchs")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.patriarchsSubtitle") || "探索各信仰先贤圣者"}</p>
        </div>

        <div className="mb-8">
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
            placeholder="搜索先贤名称、称号、年代..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.slice(0, visibleCount).map((p) => (
            <PatriarchCard key={p.id} patriarch={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">👤</span>
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
      </div>
      <MobileNav />
    </div>
  );
}
