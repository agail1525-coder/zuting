"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  { value: "founded", label: "建立时间" },
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
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Unique countries
  const countries = useMemo(() => {
    const set = new Set(temples.map((t) => t.country));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
  }, [temples]);

  // Stats
  const stats = useMemo(() => ({
    total: temples.length,
    countries: new Set(temples.map((t) => t.country)).size,
    religions: new Set(temples.map((t) => t.religionId)).size,
  }), [temples]);

  const filtered = useMemo(() => {
    let result = temples;
    if (filter) result = result.filter((t) => t.religionId === filter);
    if (countryFilter) result = result.filter((t) => t.country === countryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.nameEn ?? "").toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "country") return a.country.localeCompare(b.country);
      if (sort === "founded") return (a.foundingDate ?? "").localeCompare(b.foundingDate ?? "");
      return 0;
    });
    return result;
  }, [temples, filter, countryFilter, search, sort]);

  const hasActiveFilters = !!(filter || countryFilter || search);

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
        {/* Header with stats */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">{t("section.allTemples")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.templesSubtitle") || "探索全球宗教祖庭"}</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-400">
            <span>🏛 {stats.total} 座祖庭</span>
            <span>🌍 {stats.countries} 个国家</span>
            <span>🙏 {stats.religions} 大信仰</span>
          </div>
        </div>

        {/* Country quick filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setCountryFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              countryFilter === null
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            🌏 所有国家
          </button>
          {countries.map((c) => {
            const count = temples.filter((t) => t.country === c).length;
            return (
              <button
                key={c}
                onClick={() => setCountryFilter(countryFilter === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  countryFilter === c
                    ? "bg-[#0066FF] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
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
            placeholder="搜索祖庭名称、国家、描述..."
          />
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">找到 {filtered.length} 座祖庭</span>
              <button
                onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                清除全部筛选
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, visibleCount).map((temple) => (
            <TempleCard key={temple.id} temple={temple} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-500 text-lg">{t("common.noResults") || "暂无匹配结果"}</p>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilter(null); setCountryFilter(null); setSearch(""); }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}

        {visibleCount < filtered.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              加载更多 ({filtered.length - visibleCount} 座)
            </button>
            <p className="text-xs text-gray-400 mt-2">已展示 {Math.min(visibleCount, filtered.length)} / {filtered.length}</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-8 border border-[#0066FF]/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">想了解更多祖庭故事？</h2>
              <p className="text-gray-500 text-sm mt-1">让AI旅行规划师帮你规划包含这些祖庭的朝圣路线</p>
            </div>
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
            >
              ✨ AI规划祖庭路线
            </Link>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
