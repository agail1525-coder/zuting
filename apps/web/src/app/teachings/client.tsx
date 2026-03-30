"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import MobileNav from "@/components/MobileNav";
import type { Religion, Teaching } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "source-asc", label: "按出处" },
  { value: "religion", label: "按信仰" },
];

const PAGE_SIZE = 12;

interface Props {
  religions: Religion[];
  teachings: Teaching[];
  error?: boolean;
}

export default function TeachingsClient({ religions, teachings, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = teachings;
    if (filter) result = result.filter((td) => td.religionId === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (td) =>
          td.name.toLowerCase().includes(q) ||
          (td.originalText ?? "").toLowerCase().includes(q) ||
          (td.sourceText ?? "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "source-asc") return (a.sourceText ?? "").localeCompare(b.sourceText ?? "", "zh");
      if (sort === "religion") return (a.religion?.name ?? "").localeCompare(b.religion?.name ?? "", "zh");
      return 0;
    });
    return result;
  }, [teachings, filter, search, sort]);

  // Featured teaching (first one or random)
  const featured = teachings.length > 0 ? teachings[0] : null;

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
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
            {t("section.allTeachings")}
          </h1>
          <p className="text-gray-500 text-lg">
            {t("encyclopedia.teachingsSubtitle") || "聆听千年智慧之声"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            共 {teachings.length} 条祖训 · 涵盖 {religions.length} 大信仰体系
          </p>
        </div>

        {/* Featured Teaching */}
        {featured && !filter && !search && (
          <Link href={`/teachings/${featured.id}`} className="block mb-8 group">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[120px] opacity-5">
                {RELIGION_ICONS[featured.religion?.name ?? ""] ?? "📜"}
              </div>
              <div className="relative">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium mb-4 border border-white/10">
                  ✨ 每日精选
                </span>
                <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-[#66A3FF] transition-colors">
                  {featured.name}
                </h2>
                <blockquote className="text-white/70 font-serif text-lg leading-relaxed line-clamp-3 border-l-2 border-white/20 pl-4">
                  {featured.originalText}
                </blockquote>
                {featured.religion && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-lg">
                      {featured.religion.symbol ?? RELIGION_ICONS[featured.religion.name] ?? "🙏"}
                    </span>
                    <span className="text-sm text-white/50">{featured.religion.name}</span>
                    {featured.sourceText && (
                      <span className="text-sm text-white/30">· {featured.sourceText}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Toolbar */}
        <div className="mb-8">
          <EncyclopediaToolbar
            religions={religions}
            selectedReligionId={filter}
            onReligionChange={setFilter}
            searchQuery={search}
            onSearchChange={(q) => {
              setSearch(q);
              setVisibleCount(PAGE_SIZE);
            }}
            sortValue={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
            resultCount={filtered.length}
            placeholder="搜索经文名称、原文、出处..."
          />
        </div>

        {/* Teaching Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.slice(0, visibleCount).map((teaching) => {
            const religionName = teaching.religion?.name ?? "";
            const religionIcon = teaching.religion?.symbol ?? RELIGION_ICONS[religionName] ?? "📜";
            const religionColor = teaching.religion?.color ?? "#0066FF";

            return (
              <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                <div className="shadow-sm border border-gray-100 rounded-xl bg-white group cursor-pointer h-full flex hover:shadow-md hover:border-[#0066FF]/20 transition-all overflow-hidden">
                  {/* Left accent with religion icon */}
                  <div
                    className="w-16 flex-shrink-0 flex flex-col items-center justify-center gap-2"
                    style={{ backgroundColor: `${religionColor}10` }}
                  >
                    <span className="text-2xl">{religionIcon}</span>
                    <span
                      className="text-[10px] font-medium writing-vertical-rl"
                      style={{ color: religionColor, writingMode: "vertical-rl" }}
                    >
                      {religionName}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-2">
                      {teaching.name}
                    </h3>
                    <blockquote className="text-gray-600 text-sm font-serif leading-relaxed line-clamp-3 flex-1 border-l-2 border-gray-200 pl-3">
                      {teaching.originalText}
                    </blockquote>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      {teaching.sourceText ? (
                        <span className="text-gray-400 text-xs">— {teaching.sourceText}</span>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity">
                        深入阅读 →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">📜</span>
            <p className="text-gray-500">{t("common.noResults") || "暂无数据"}</p>
            {(filter || search) && (
              <button
                onClick={() => {
                  setFilter(null);
                  setSearch("");
                }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}

        {/* Load more */}
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
