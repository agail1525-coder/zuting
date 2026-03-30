"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import SealCard from "@/components/SealCard";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import type { Seal, SealSeries } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

const seriesOrder: SealSeries[] = [
  "CHUYIN",
  "ZHONGYIN",
  "YINGUOYIN",
  "CHENGDAOYIN",
  "GUIYUANYIN",
];

const SERIES_META: Record<string, { label: string; icon: string; color: string; bgActive: string; desc: string }> = {
  CHUYIN:      { label: "初印系", icon: "🌱", color: "blue",    bgActive: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",    desc: "发心起步，种下觉悟之因" },
  ZHONGYIN:    { label: "中印系", icon: "🌊", color: "emerald", bgActive: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20", desc: "修行渐深，智慧初现" },
  YINGUOYIN:   { label: "印果印", icon: "🔮", color: "amber",   bgActive: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",   desc: "因果分明，行证并进" },
  CHENGDAOYIN: { label: "成道印", icon: "💎", color: "purple",  bgActive: "bg-purple-500 text-white shadow-lg shadow-purple-500/20",  desc: "悟道证果，明心见性" },
  GUIYUANYIN:  { label: "归源印", icon: "🌕", color: "rose",    bgActive: "bg-rose-500 text-white shadow-lg shadow-rose-500/20",      desc: "返本归源，圆满究竟" },
};

const SERIES_DOT_COLORS: Record<string, string> = {
  CHUYIN: "bg-blue-400", ZHONGYIN: "bg-emerald-400", YINGUOYIN: "bg-amber-400",
  CHENGDAOYIN: "bg-purple-400", GUIYUANYIN: "bg-rose-400",
};

const SERIES_RING_COLORS: Record<string, string> = {
  CHUYIN: "ring-blue-400", ZHONGYIN: "ring-emerald-400", YINGUOYIN: "ring-amber-400",
  CHENGDAOYIN: "ring-purple-400", GUIYUANYIN: "ring-rose-400",
};

const SORT_OPTIONS = [
  { value: "default", label: "默认排序" },
  { value: "name-asc", label: "名称 A→Z" },
  { value: "name-desc", label: "名称 Z→A" },
  { value: "series", label: "按系列" },
];

interface Props {
  seals: Seal[];
  error?: boolean;
}

/* Seal Detail Modal */
function SealDetailModal({ seal, onClose }: { seal: Seal; onClose: () => void }) {
  const meta = SERIES_META[seal.series];
  const dotColor = SERIES_DOT_COLORS[seal.series] || "bg-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[80px] opacity-5">{meta?.icon || "🙏"}</div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm text-white/60">{meta?.label}</span>
          </div>
          <span className="text-4xl font-serif font-bold text-white/30 block mb-1">
            {String(seal.id).padStart(2, "0")}
          </span>
          <h2 className="text-2xl font-serif font-bold">{seal.name}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Poem */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">偈颂</h3>
            <blockquote className="text-gray-800 font-serif text-lg leading-relaxed border-l-3 border-gray-200 pl-4 whitespace-pre-line">
              {seal.poem}
            </blockquote>
          </div>

          {/* Essence */}
          {seal.essence && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">要义</h3>
              <p className="text-gray-700 leading-relaxed">{seal.essence}</p>
            </div>
          )}

          {/* Practice */}
          {seal.practice && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
                🧘 修行法门
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{seal.practice}</p>
            </div>
          )}

          {/* Vow */}
          {seal.vow && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-1.5">
                🙏 大愿
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{seal.vow}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <Link
              href={`/seals/${seal.id}`}
              className="flex-1 text-center px-4 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl hover:bg-[#0052CC] transition-colors text-sm"
            >
              查看详情页
            </Link>
            <ShareButton
              title={`第${seal.id}印 · ${seal.name}`}
              description={seal.poem}
              url={typeof window !== "undefined" ? `${window.location.origin}/seals/${seal.id}` : ""}
              entityType="HOLY_SITE"
              entityId={String(seal.id)}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SealsClient({ seals, error }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SealSeries | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "roadmap">("grid");

  const filtered = useMemo(() => {
    let result = seals;
    if (filter) result = result.filter((s) => s.series === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.poem.toLowerCase().includes(q) ||
          (s.essence ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name, "zh"));
    if (sort === "name-desc") result = [...result].sort((a, b) => b.name.localeCompare(a.name, "zh"));
    return result;
  }, [seals, filter, search, sort]);

  // Group by series
  const displayGroups = useMemo(() => {
    return seriesOrder
      .map((series) => ({
        series,
        meta: SERIES_META[series],
        seals: filtered.filter((s) => s.series === series),
      }))
      .filter((g) => !filter || g.series === filter);
  }, [filtered, filter]);

  // Series stats for progress
  const seriesStats = useMemo(() => {
    return seriesOrder.map((series) => {
      const count = seals.filter((s) => s.series === series).length;
      return { series, count, meta: SERIES_META[series] };
    });
  }, [seals]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.thirtySeals")}
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-3">
            {t("section.thirtySeals")}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            曹溪愿命三十印 — 从发心到归源，修行的完整地图
          </p>
          <p className="text-sm text-gray-400 mt-2">
            共 {seals.length} 印 · {seriesOrder.length} 大系列
          </p>
        </div>

        {/* ══════ Progress Overview (对标Duolingo/TripAdvisor成就系统) ══════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🗺️</span> 修行全景
            </h2>
            <span className="text-sm text-gray-400">{seals.length}/30 印</span>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-5 flex">
            {seriesStats.map((stat) => (
              <div
                key={stat.series}
                className={`h-full ${SERIES_DOT_COLORS[stat.series]?.replace("bg-", "bg-") || "bg-gray-300"}`}
                style={{ width: `${(stat.count / 30) * 100}%` }}
                title={`${stat.meta.label}: ${stat.count}印`}
              />
            ))}
          </div>
          {/* Series overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {seriesStats.map((stat) => (
              <button
                key={stat.series}
                onClick={() => setFilter(filter === stat.series ? null : stat.series)}
                className={`text-left rounded-xl p-3 border transition-all ${
                  filter === stat.series
                    ? `${SERIES_RING_COLORS[stat.series]} ring-2 bg-white shadow-md`
                    : "border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{stat.meta.icon}</span>
                  <span className="font-bold text-gray-900 text-sm">{stat.meta.label}</span>
                </div>
                <p className="text-xs text-gray-400">{stat.count} 印</p>
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{stat.meta.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ══════ Toolbar: Search + Sort + View Toggle ══════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索印名、偈颂、要义..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "grid" ? "bg-[#0066FF] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="网格视图"
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode("roadmap")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "roadmap" ? "bg-[#0066FF] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="路线图视图"
              >
                ⟶
              </button>
            </div>
          </div>
          {/* Active filter summary */}
          {(filter || search) && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">找到 {filtered.length} 印</span>
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* ══════ Series Filter Pills ══════ */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === null
                ? "bg-[#0066FF] text-white font-semibold shadow-lg shadow-blue-500/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {t("filter.all")} ({seals.length})
          </button>
          {seriesOrder.map((series) => {
            const meta = SERIES_META[series];
            const count = seals.filter((s) => s.series === series).length;
            return (
              <button
                key={series}
                onClick={() => setFilter(filter === series ? null : series)}
                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                  filter === series
                    ? meta.bgActive
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{meta.icon}</span>
                {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ══════ Grid View ══════ */}
        {viewMode === "grid" && displayGroups.map(
          (group) =>
            group.seals.length > 0 && (
              <div key={group.series} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif font-bold text-gray-700 flex items-center gap-3">
                    <span className="text-xl">{group.meta.icon}</span>
                    {group.meta.label}
                    <span className="text-sm font-normal text-gray-400">({group.seals.length}印)</span>
                  </h2>
                  <p className="text-sm text-gray-400 hidden sm:block">{group.meta.desc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.seals.map((seal) => (
                    <div key={seal.id} onClick={() => setSelectedSeal(seal)} className="cursor-pointer">
                      <SealCard seal={seal} />
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {/* ══════ Roadmap View (修行路线图 — 对标Duolingo学习路径) ══════ */}
        {viewMode === "roadmap" && (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

            {displayGroups.map((group, gi) =>
              group.seals.length > 0 && (
                <div key={group.series} className="mb-12">
                  {/* Series milestone */}
                  <div className="relative flex items-center justify-center mb-6">
                    <div className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 ${
                      SERIES_RING_COLORS[group.series]?.replace("ring-", "border-") || "border-gray-300"
                    } shadow-md`}>
                      <span className="text-xl">{group.meta.icon}</span>
                      <span className="font-bold text-gray-900">{group.meta.label}</span>
                      <span className="text-xs text-gray-400">({group.seals.length})</span>
                    </div>
                  </div>

                  {/* Seal nodes */}
                  <div className="space-y-4">
                    {group.seals.map((seal, si) => {
                      const isLeft = si % 2 === 0;
                      return (
                        <div key={seal.id} className="relative flex items-center">
                          {/* Timeline dot */}
                          <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
                            <div className={`w-4 h-4 rounded-full ${SERIES_DOT_COLORS[seal.series]} ring-4 ring-white shadow-sm`} />
                          </div>

                          {/* Content card — alternating sides on desktop */}
                          <div className={`ml-14 sm:ml-0 sm:w-[45%] ${isLeft ? "sm:mr-auto sm:pr-8" : "sm:ml-auto sm:pl-8"}`}>
                            <button
                              onClick={() => setSelectedSeal(seal)}
                              className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0066FF]/20 transition-all group"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-serif font-bold text-gray-300">
                                  {String(seal.id).padStart(2, "0")}
                                </span>
                                <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                                  {seal.name}
                                </h3>
                              </div>
                              <p className="text-gray-500 text-sm font-serif line-clamp-2 leading-relaxed">{seal.poem}</p>
                              <span className="text-xs text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity mt-1 inline-block">
                                点击查看详情 →
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-500 text-lg">{t("common.noResults") || "暂无匹配结果"}</p>
            {(filter || search) && (
              <button
                onClick={() => { setFilter(null); setSearch(""); }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}

        {/* ══════ Journey CTA ══════ */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#D4A855]/10 rounded-full blur-3xl" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#0066FF]/10 rounded-full blur-2xl" />
          <div className="relative">
            <span className="text-4xl block mb-3">🪷</span>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">开启你的三十印修行之旅</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              三十印是从发心到归源的完整修行地图。走过祖庭，领悟每一印的智慧，在行走中觉醒。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/chat?q=请帮我规划一条三十印修行路线"
                className="px-6 py-3 bg-[#D4A855] hover:bg-[#C09A4A] text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                ✨ AI规划三十印路线
              </Link>
              <Link
                href="/routes"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
              >
                浏览朝圣路线 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSeal && (
        <SealDetailModal seal={selectedSeal} onClose={() => setSelectedSeal(null)} />
      )}

      <MobileNav />
    </div>
  );
}
