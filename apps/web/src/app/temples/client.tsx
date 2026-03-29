"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import TempleCard from "@/components/TempleCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, Temple } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const SORT_OPTIONS = [
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "country", label: "按国家" },
];

const PAGE_SIZE = 12;

interface Props {
  religions: Religion[];
  temples: Temple[];
  error?: boolean;
}

export default function TemplesClient({ religions, temples, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = temples;
    if (filter) result = result.filter((t) => t.religionId === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.nameEn ?? "").toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "country") return a.country.localeCompare(b.country);
      return 0;
    });
    return result;
  }, [temples, filter, search, sort]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allTemples")}</h1>
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">{t("section.allTemples")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.templesSubtitle") || "探索全球宗教祖庭"}</p>
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
            placeholder="搜索祖庭名称、国家..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, visibleCount).map((temple) => (
            <TempleCard key={temple.id} temple={temple} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">🏛</span>
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
