"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import type { Route, PaginatedRoutes } from "@/lib/api";
import { fetchRoutes } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

function getCategories(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.category.all"), icon: "🌏" },
    { value: "ZEN", label: t("routes.category.zen"), icon: "🏯" },
    { value: "BUDDHIST", label: t("routes.category.buddhist"), icon: "☸️" },
    { value: "TAOIST", label: t("routes.category.taoist"), icon: "☯️" },
    { value: "CHRISTIAN", label: t("routes.category.christian"), icon: "✝️" },
    { value: "ISLAMIC", label: t("routes.category.islamic"), icon: "☪️" },
    { value: "CROSS_CULTURAL", label: t("routes.category.crossCultural"), icon: "🌐" },
    { value: "HINDU", label: t("routes.category.hindu"), icon: "🕉️" },
  ];
}

function getDifficulties(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.difficulty.all") },
    { value: "EASY", label: t("routes.difficulty.easy") },
    { value: "MODERATE", label: t("routes.difficulty.moderate") },
    { value: "CHALLENGING", label: t("routes.difficulty.challenging") },
  ];
}

function getDurationFilters(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.duration.all") },
    { value: "1-3", label: t("routes.duration.short") },
    { value: "4-7", label: t("routes.duration.medium") },
    { value: "8+", label: t("routes.duration.long") },
  ];
}

function getSortOptions(t: (key: string) => string) {
  return [
    { value: "createdAt", label: t("routes.sort.newest") },
    { value: "price", label: t("routes.sort.priceLow") },
    { value: "price_desc", label: t("routes.sort.priceHigh") },
    { value: "rating", label: t("routes.sort.topRated") },
    { value: "duration", label: t("routes.sort.durationShort") },
    { value: "popular", label: t("routes.sort.popular") },
  ];
}

function getDifficultyLabels(t: (key: string) => string): Record<string, string> {
  return {
    EASY: t("routes.difficulty.easy"),
    MODERATE: t("routes.difficulty.moderate"),
    CHALLENGING: t("routes.difficulty.challenging"),
  };
}

function getTrustBadges(t: (key: string) => string) {
  return [
    { icon: "🛡️", text: t("routes.trust.freeCancel") },
    { icon: "💰", text: t("routes.trust.bestPrice") },
    { icon: "⚡", text: t("routes.trust.instantConfirm") },
    { icon: "👨‍🏫", text: t("routes.trust.proGuide") },
    { icon: "📱", text: t("routes.trust.eTicket") },
  ];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  ZEN:            { bg: "bg-stone-100",   text: "text-stone-700" },
  BUDDHIST:       { bg: "bg-amber-50",    text: "text-amber-700" },
  TAOIST:         { bg: "bg-emerald-50",  text: "text-emerald-700" },
  CHRISTIAN:      { bg: "bg-blue-50",     text: "text-blue-700" },
  ISLAMIC:        { bg: "bg-green-50",    text: "text-green-700" },
  CROSS_CULTURAL: { bg: "bg-violet-50",   text: "text-violet-700" },
  HINDU:          { bg: "bg-orange-50",   text: "text-orange-700" },
  JEWISH:         { bg: "bg-indigo-50",   text: "text-indigo-700" },
  CULTURAL_HERITAGE: { bg: "bg-teal-50",  text: "text-teal-700" },
};

/* Skeleton card for loading state */
function RouteCardSkeleton() {
  return (
    <div className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden bg-white animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded w-16" />
          <div className="h-6 bg-gray-100 rounded w-16" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

function RouteCard({ route, t, categories, difficultyLabels }: { route: Route; t: (key: string) => string; categories: ReturnType<typeof getCategories>; difficultyLabels: Record<string, string> }) {
  const price = (route.priceFrom / 100).toLocaleString();
  const categoryLabel = categories.find((c) => c.value === route.category)?.label ?? route.category;
  const colors = CATEGORY_COLORS[route.category] ?? { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <Link href={`/routes/${route.slug}`} className="group block">
      <div className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          {route.coverImage ? (
            <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {categories.find((c) => c.value === route.category)?.icon ?? "🌏"}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Urgency / popularity badges */}
          {route.bookCount > 50 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg animate-pulse">
              {t("routes.badge.hot")}
            </div>
          )}
          {route.bookCount > 10 && route.bookCount <= 50 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500 text-white shadow">
              {t("routes.badge.weeklyBookings").replace("{count}", String(route.bookCount))}
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 ${colors.bg} ${colors.text}`}>
              {categoryLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-black/30 text-white border border-white/10">
              {t("routes.card.daysNights").replace("{days}", String(route.duration)).replace("{nights}", String(route.nights))}
            </span>
          </div>
          {/* Review count badge */}
          {route.reviewCount > 0 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px]">
              {t("routes.card.reviewCount").replace("{count}", String(route.reviewCount))}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
            {route.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{route.subtitle}</p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {route.highlights.slice(0, 3).map((h) => (
              <span key={h} className="px-2 py-0.5 text-xs bg-[#0066FF]/10 text-[#0066FF] rounded border border-[#0066FF]/20">
                {h}
              </span>
            ))}
            {route.highlights.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">
                +{route.highlights.length - 3}
              </span>
            )}
          </div>

          {/* Season + Group info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {route.season && <span>📅 {route.season}</span>}
            {route.groupSize && <span>👥 {route.groupSize}</span>}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-400">{t("routes.card.priceFrom")}</span>
              <span className="text-lg font-bold text-[#0066FF] ml-1">¥{price}</span>
              <span className="text-xs text-gray-400">{t("routes.card.perPerson")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {route.rating && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0066FF]/10 rounded text-[#0066FF] font-bold text-xs">
                  ★ {route.rating.toFixed(1)}
                </span>
              )}
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100">{difficultyLabels[route.difficulty] ?? route.difficulty}</span>
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
  const { t } = useTranslation();

  const categories = useMemo(() => getCategories(t), [t]);
  const difficulties = useMemo(() => getDifficulties(t), [t]);
  const durationFilters = useMemo(() => getDurationFilters(t), [t]);
  const sortOptions = useMemo(() => getSortOptions(t), [t]);
  const difficultyLabels = useMemo(() => getDifficultyLabels(t), [t]);
  const trustBadges = useMemo(() => getTrustBadges(t), [t]);

  const [routes, setRoutes] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 12;

  // Client-side filtering for search and duration (server handles category/difficulty/sort/page)
  const displayRoutes = useMemo(() => {
    let items = routes;
    // Client-side search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    // Client-side duration filter
    if (durationFilter === "1-3") items = items.filter((r) => r.duration <= 3);
    else if (durationFilter === "4-7") items = items.filter((r) => r.duration >= 4 && r.duration <= 7);
    else if (durationFilter === "8+") items = items.filter((r) => r.duration >= 8);
    return items;
  }, [routes, search, durationFilter]);

  // Price stats
  const priceStats = useMemo(() => {
    if (routes.length === 0) return null;
    const prices = routes.map((r) => r.priceFrom / 100);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [routes]);

  const loadRoutes = async (cat: string, diff: string, s: string, p: number) => {
    setLoading(true);
    try {
      const data = await fetchRoutes({
        category: cat || undefined,
        difficulty: diff || undefined,
        sort: s,
        page: p,
        pageSize: PAGE_SIZE,
      });
      setRoutes(data.items);
      setTotal(data.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (newCategory?: string, newDifficulty?: string, newSort?: string) => {
    const cat = newCategory ?? category;
    const diff = newDifficulty ?? difficulty;
    const s = newSort ?? sort;
    setCategory(cat);
    setDifficulty(diff);
    setSort(s);
    setPage(1);
    loadRoutes(cat, diff, s, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadRoutes(category, difficulty, sort, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setCategory("");
    setDifficulty("");
    setDurationFilter("");
    setSort("createdAt");
    setSearch("");
    setPage(1);
    loadRoutes("", "", "createdAt", 1);
  };

  const hasActiveFilters = !!(category || difficulty || durationFilter || search);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-24">
        {/* Hero */}
        <div className="bg-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-[#0066FF] font-bold">{t("routes.hero.title")}</span>
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              {t("routes.hero.subtitle").replace("{total}", String(total))}
            </p>
            {priceStats && (
              <p className="text-sm text-gray-400 mt-1">
                {t("routes.hero.priceRange").replace("{min}", priceStats.min.toLocaleString()).replace("{max}", priceStats.max.toLocaleString())}
              </p>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {trustBadges.map((b) => (
              <span key={b.text} className="flex items-center gap-1.5 text-sm text-gray-500">
                <span>{b.icon}</span>
                <span className="font-medium">{b.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => handleFilter(c.value, undefined, undefined)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  category === c.value
                    ? "bg-[#0066FF] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="shadow-sm border border-gray-100 bg-white rounded-2xl p-4">
            {/* Search input */}
            <div className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("routes.search.placeholder")}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={difficulty}
                onChange={(e) => handleFilter(undefined, e.target.value, undefined)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
              >
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
              >
                {durationFilters.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => handleFilter(undefined, undefined, e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 ml-auto"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-400">{t("routes.filter.found").replace("{count}", String(displayRoutes.length))}</span>
                <button onClick={clearAllFilters} className="text-[#0066FF] hover:underline text-xs">
                  {t("routes.filter.clearAll")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Route Grid */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          {error && (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3">😞</span>
              <p className="text-lg">{t("routes.error.loadFailed")}</p>
            </div>
          )}

          {/* Skeleton loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <RouteCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!error && !loading && displayRoutes.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-lg">{t("routes.empty.title")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("routes.empty.subtitle")}</p>
              <button onClick={clearAllFilters} className="mt-4 text-[#0066FF] hover:underline text-sm">
                {t("routes.empty.clearFilters")}
              </button>
            </div>
          )}

          {!loading && displayRoutes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRoutes.map((route) => (
                <RouteCard key={route.id} route={route} t={t} categories={categories} difficultyLabels={difficultyLabels} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t("routes.pagination.prev")}
              </button>
              {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === Math.ceil(total / PAGE_SIZE) || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-300 mx-1">...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? "bg-[#0066FF] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))
              }
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t("routes.pagination.next")}
              </button>
            </div>
          )}
          {!loading && total > 0 && (
            <p className="text-center text-sm text-gray-400 mt-4">
              {t("routes.pagination.info").replace("{page}", String(page)).replace("{total}", String(total))}
            </p>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-8 border border-[#0066FF]/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900">{t("routes.cta.title")}</h2>
                <p className="text-gray-500 text-sm mt-1">{t("routes.cta.subtitle")}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm"
                >
                  {t("routes.cta.aiCustomize")}
                </Link>
                <Link
                  href="/packages"
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200 text-sm"
                >
                  {t("routes.cta.browsePackages")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
