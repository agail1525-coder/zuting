"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  { value: "religion", label: "按信仰" },
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

  // Stats
  const stats = useMemo(() => ({
    total: patriarchs.length,
    religions: new Set(patriarchs.map((p) => p.religionId)).size,
    withImage: patriarchs.filter((p) => p.imageUrl).length,
  }), [patriarchs]);

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
          (p.dates ?? "").toLowerCase().includes(q) ||
          (p.biography ?? "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "religion") return (a.religion?.name ?? "").localeCompare(b.religion?.name ?? "", "zh");
      return 0;
    });
    return result;
  }, [patriarchs, filter, search, sort]);

  const hasActiveFilters = !!(filter || search);

  // Featured patriarch (first with image and biography)
  const featured = useMemo(() => {
    if (filter || search) return null;
    return patriarchs.find((p) => p.imageUrl && p.biography);
  }, [patriarchs, filter, search]);

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
        {/* Header with stats */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">{t("section.allPatriarchs")}</h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.patriarchsSubtitle") || "探索各信仰先贤圣者"}</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-400">
            <span>🧘 {stats.total} 位先贤</span>
            <span>🙏 {stats.religions} 大信仰</span>
          </div>
        </div>

        {/* Featured patriarch (对标TripAdvisor精选) */}
        {featured && (
          <Link href={`/patriarchs/${featured.id}`} className="block mb-8 group">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 right-4 text-[100px] opacity-5">
                {featured.religion?.symbol ?? "🧘"}
              </div>
              <div className="flex flex-col md:flex-row">
                {featured.imageUrl && (
                  <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                    <img src={featured.imageUrl} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/80 hidden md:block" />
                  </div>
                )}
                <div className="p-6 md:p-8 flex-1 relative">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium mb-3 border border-white/10">
                    ✨ 每日精选
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-white group-hover:text-[#66A3FF] transition-colors">
                    {featured.name}
                  </h2>
                  {featured.title && (
                    <p className="text-white/60 text-sm mt-1">{featured.title}</p>
                  )}
                  <p className="text-white/50 text-sm mt-3 line-clamp-2">{featured.biography}</p>
                  {featured.religion && (
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-lg">{featured.religion.symbol}</span>
                      <span className="text-sm text-white/40">{featured.religion.name}</span>
                      {featured.dates && (
                        <span className="text-sm text-white/30">· {featured.dates}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

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
            placeholder="搜索先贤名称、称号、年代、生平..."
          />
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">找到 {filtered.length} 位先贤</span>
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.slice(0, visibleCount).map((p) => (
            <PatriarchCard key={p.id} patriarch={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-500 text-lg">{t("common.noResults") || "暂无匹配结果"}</p>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
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
              加载更多 ({filtered.length - visibleCount} 位)
            </button>
            <p className="text-xs text-gray-400 mt-2">已展示 {Math.min(visibleCount, filtered.length)} / {filtered.length}</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-3xl block mb-3">📚</span>
            <h2 className="text-xl font-bold text-white">深入了解先贤智慧</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              探索各信仰传承的祖训与教义，让千年智慧指引你的朝圣之旅
            </p>
            <div className="flex gap-3 justify-center mt-5">
              <Link
                href="/teachings"
                className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                浏览祖训 →
              </Link>
              <Link
                href="/chat"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
              >
                ✨ AI讲解先贤
              </Link>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
