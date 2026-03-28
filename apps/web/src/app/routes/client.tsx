"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import type { Route, PaginatedRoutes } from "@/lib/api";
import { fetchRoutes } from "@/lib/api";

const CATEGORIES = [
  { value: "", label: "全部路线" },
  { value: "ZEN", label: "禅宗路线" },
  { value: "BUDDHIST", label: "佛教圣地" },
  { value: "TAOIST", label: "道教寻根" },
  { value: "CHRISTIAN", label: "基督文化" },
  { value: "ISLAMIC", label: "伊斯兰文化" },
  { value: "CROSS_CULTURAL", label: "跨文化融合" },
  { value: "HINDU", label: "印度教" },
];

const DIFFICULTIES = [
  { value: "", label: "全部难度" },
  { value: "EASY", label: "轻松" },
  { value: "MODERATE", label: "适中" },
  { value: "CHALLENGING", label: "挑战" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "最新发布" },
  { value: "price", label: "价格低→高" },
  { value: "rating", label: "评分最高" },
  { value: "duration", label: "时长短→长" },
];

const CATEGORY_COLORS: Record<string, string> = {
  ZEN: "bg-stone-100 text-stone-700",
  BUDDHIST: "bg-amber-100 text-amber-700",
  TAOIST: "bg-emerald-100 text-emerald-700",
  CHRISTIAN: "bg-red-100 text-red-700",
  ISLAMIC: "bg-green-100 text-green-700",
  CROSS_CULTURAL: "bg-violet-100 text-violet-700",
  HINDU: "bg-orange-100 text-orange-700",
  JEWISH: "bg-blue-100 text-blue-700",
  CULTURAL_HERITAGE: "bg-teal-100 text-teal-700",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "轻松",
  MODERATE: "适中",
  CHALLENGING: "挑战",
};

function RouteCard({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();
  const categoryLabel = CATEGORIES.find((c) => c.value === route.category)?.label ?? route.category;

  return (
    <Link href={`/routes/${route.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-amber-200">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden">
          {route.coverImage ? (
            <img src={route.coverImage} alt={route.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {route.category === "ZEN" ? "🏯" : route.category === "BUDDHIST" ? "☸" : route.category === "TAOIST" ? "☯" : route.category === "CHRISTIAN" ? "⛪" : route.category === "ISLAMIC" ? "🕌" : "🌏"}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[route.category] ?? "bg-gray-100 text-gray-700"}`}>
              {categoryLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
              {route.duration}天{route.nights}晚
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
            {route.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{route.subtitle}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {route.highlights.slice(0, 3).map((h) => (
              <span key={h} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded">
                {h}
              </span>
            ))}
          </div>

          {/* Bottom: Price + Rating */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
            <div>
              <span className="text-xs text-gray-400">起价</span>
              <span className="text-lg font-bold text-red-600 ml-1">¥{price}</span>
              <span className="text-xs text-gray-400">/人</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {route.rating && (
                <span className="flex items-center gap-0.5">
                  <span className="text-amber-500">★</span> {route.rating.toFixed(1)}
                </span>
              )}
              <span className="text-xs">{DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface Props {
  initialData: PaginatedRoutes;
  error?: boolean;
}

export default function RoutesClient({ initialData, error }: Props) {
  const [routes, setRoutes] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [loading, setLoading] = useState(false);

  const handleFilter = async (newCategory?: string, newDifficulty?: string, newSort?: string) => {
    const cat = newCategory ?? category;
    const diff = newDifficulty ?? difficulty;
    const s = newSort ?? sort;
    setCategory(cat);
    setDifficulty(diff);
    setSort(s);
    setLoading(true);
    try {
      const data = await fetchRoutes({
        category: cat || undefined,
        difficulty: diff || undefined,
        sort: s,
        pageSize: 20,
      });
      setRoutes(data.items);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main className="pt-20 pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-b from-[#1E293B] to-[#334155] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold">深度文化路线</h1>
            <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
              精选{total}+条深度路线，跨越6大文化传统，带你走进全球最神圣的文化圣地
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
            {/* Category */}
            <select
              value={category}
              onChange={(e) => handleFilter(e.target.value, undefined, undefined)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={difficulty}
              onChange={(e) => handleFilter(undefined, e.target.value, undefined)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => handleFilter(undefined, undefined, e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 ml-auto"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Grid */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          {error && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">数据加载失败，请稍后重试</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!error && !loading && routes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">暂无符合条件的路线</p>
              <button onClick={() => handleFilter("", "", "createdAt")} className="mt-4 text-amber-600 hover:underline">
                清除筛选条件
              </button>
            </div>
          )}

          {!loading && routes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}

          {/* Total count */}
          {!loading && total > 0 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              共 {total} 条路线
            </p>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
