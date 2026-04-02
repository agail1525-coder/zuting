"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Merchant } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

/* ─── Merchant Type Config ─── */

const MERCHANT_TYPE_CONFIG = {
  RESTAURANT:          { icon: "🍜", bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200", gradient: "from-orange-400 to-amber-500" },
  HOTEL:               { icon: "🏨", bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200", gradient: "from-purple-400 to-indigo-500" },
  GUIDE:               { icon: "🧭", bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  gradient: "from-green-400 to-emerald-500" },
  TRANSPORT:           { icon: "🚌", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   gradient: "from-blue-400 to-cyan-500" },
  TEMPLE_SERVICE:      { icon: "🙏", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    gradient: "from-red-400 to-rose-500" },
  SHOPPING:            { icon: "🛍️", bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",   gradient: "from-pink-400 to-fuchsia-500" },
  PHOTOGRAPHY:         { icon: "📷", bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",    gradient: "from-sky-400 to-blue-500" },
  WELLNESS:            { icon: "🧘", bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",   gradient: "from-teal-400 to-cyan-500" },
  CULTURAL_EXPERIENCE: { icon: "🎭", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  gradient: "from-amber-400 to-yellow-500" },
} as const;

type MerchantType = keyof typeof MERCHANT_TYPE_CONFIG;
const ALL_TYPES = Object.keys(MERCHANT_TYPE_CONFIG) as MerchantType[];

function getTypeConfig(type: string) {
  return MERCHANT_TYPE_CONFIG[type as MerchantType] || MERCHANT_TYPE_CONFIG.GUIDE;
}

/* ─── Sub Components ─── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

function MerchantCard({ merchant, t }: { merchant: Merchant; t: (k: string, v?: Record<string, string | number>) => string }) {
  const cfg = getTypeConfig(merchant.type);
  const serviceCount = merchant.services?.length || 0;
  const minPrice = merchant.services && merchant.services.length > 0
    ? Math.min(...merchant.services.map((s: { price: number }) => s.price))
    : 0;
  const location = [merchant.province, merchant.city].filter(Boolean).join(" ");

  return (
    <Link href={`/merchants/${merchant.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Image / Gradient placeholder */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {merchant.logo ? (
            <OptimizedImage src={merchant.logo} alt={merchant.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
              <span className="text-5xl opacity-80">{cfg.icon}</span>
            </div>
          )}
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text} backdrop-blur-sm`}>
              {cfg.icon} {t(`merchant.type.${merchant.type}`)}
            </span>
          </div>
          {/* Trust badges */}
          {merchant.rating >= 4.5 && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{t("merchant.badge.topRated")}</span>
            </div>
          )}
          {merchant.status === "ACTIVE" && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-600 text-white flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {t("merchant.badge.verified")}
              </span>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{merchant.name}</h3>
          <div className="mt-1.5">
            <StarRating rating={merchant.rating} />
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{merchant.description}</p>
          {location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {serviceCount > 0 && <span>{t("merchant.servicesCount", { count: serviceCount })}</span>}
              <span>{merchant.totalOrders}+ {t("merchant.totalOrders")}</span>
            </div>
            {minPrice > 0 && (
              <span className="text-sm font-bold text-[#0066FF]">¥{Math.round(minPrice / 100)}<span className="text-xs font-normal text-gray-400">{t("home.perPerson")}</span></span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Category Section (Netflix-style horizontal scroll) ─── */

function CategorySection({ type, merchants, t }: { type: MerchantType; merchants: Merchant[]; t: (k: string, v?: Record<string, string | number>) => string }) {
  const cfg = getTypeConfig(type);
  if (merchants.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          {t(`merchant.type.${type}`)}
          <span className="text-sm font-normal text-gray-400">({merchants.length})</span>
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {merchants.slice(0, 8).map((m) => (
          <div key={m.id} className="min-w-[280px] max-w-[300px] snap-start flex-shrink-0">
            <MerchantCard merchant={m} t={t} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main Client Component ─── */

interface Props {
  initialMerchants: Merchant[];
  initialTotal: number;
}

export default function MerchantsClient({ initialMerchants, initialTotal }: Props) {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "orders" | "newest">("rating");
  const [visibleCount, setVisibleCount] = useState(24);

  // Stats
  const stats = useMemo(() => {
    const types = new Set(initialMerchants.map((m) => m.type));
    const avg = initialMerchants.length > 0
      ? initialMerchants.reduce((sum, m) => sum + m.rating, 0) / initialMerchants.length
      : 0;
    return { total: initialTotal, types: types.size, avgRating: avg };
  }, [initialMerchants, initialTotal]);

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of initialMerchants) {
      counts[m.type] = (counts[m.type] || 0) + 1;
    }
    return counts;
  }, [initialMerchants]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let list = [...initialMerchants];
    if (activeType) list = list.filter((m) => m.type === activeType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.address || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "orders") list.sort((a, b) => b.totalOrders - a.totalOrders);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [initialMerchants, activeType, search, sortBy]);

  // Featured (top rated, no filter active)
  const featured = useMemo(() => {
    if (activeType || search.trim()) return [];
    return initialMerchants
      .filter((m) => m.rating >= 4.5)
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 4);
  }, [initialMerchants, activeType, search]);

  // Grouped by type (for Netflix sections)
  const groupedByType = useMemo(() => {
    if (activeType || search.trim()) return [];
    const groups: { type: MerchantType; merchants: Merchant[] }[] = [];
    for (const type of ALL_TYPES) {
      const items = initialMerchants.filter((m) => m.type === type);
      if (items.length > 0) groups.push({ type, merchants: items });
    }
    return groups;
  }, [initialMerchants, activeType, search]);

  const showNetflix = !activeType && !search.trim();
  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ══════ Hero ══════ */}
      <section className="hero-bg pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t("merchant.title")}</h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">{t("merchant.subtitle")}</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative mb-10">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(24); }}
              placeholder={t("merchant.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 text-white/80">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{stats.total}+</div>
              <div className="text-xs mt-0.5">{t("merchant.stats.partners")}</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{stats.types}</div>
              <div className="text-xs mt-0.5">{t("merchant.stats.types")}</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</div>
              <div className="text-xs mt-0.5">{t("merchant.stats.avgRating")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Category Navigation Bar ══════ */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => { setActiveType(""); setVisibleCount(24); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeType ? "bg-[#0066FF] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t("merchant.allTypes")}
              <span className={`text-xs ${!activeType ? "text-white/70" : "text-gray-400"}`}>{initialMerchants.length}</span>
            </button>
            {ALL_TYPES.map((type) => {
              const cfg = getTypeConfig(type);
              const count = typeCounts[type] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => { setActiveType(type === activeType ? "" : type); setVisibleCount(24); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeType === type ? "bg-[#0066FF] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base">{cfg.icon}</span>
                  {t(`merchant.type.${type}`)}
                  <span className={`text-xs ${activeType === type ? "text-white/70" : "text-gray-400"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════ Main Content ══════ */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Featured Partners (only when no filter) */}
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {t("merchant.featured")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((m) => (
                <Link key={m.id} href={`/merchants/${m.id}`} className="group">
                  <div className="flex bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <div className="relative w-40 md:w-52 flex-shrink-0">
                      {m.logo ? (
                        <OptimizedImage src={m.logo} alt={m.name} fill className="object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getTypeConfig(m.type).gradient} flex items-center justify-center`}>
                          <span className="text-4xl">{getTypeConfig(m.type).icon}</span>
                        </div>
                      )}
                      {m.rating >= 4.8 && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{t("merchant.badge.topRated")}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors">{m.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${getTypeConfig(m.type).bg} ${getTypeConfig(m.type).text}`}>
                            {getTypeConfig(m.type).icon} {t(`merchant.type.${m.type}`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-[#0066FF] text-white text-xs font-bold">{m.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{m.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{m.totalOrders}+ {t("merchant.totalOrders")}</span>
                        {m.services && m.services.length > 0 && (
                          <span>{t("merchant.servicesCount", { count: m.services.length })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Netflix-style category sections (no filter active) */}
        {showNetflix && groupedByType.map(({ type, merchants }) => (
          <CategorySection key={type} type={type} merchants={merchants} t={t} />
        ))}

        {/* Filtered grid view (when filter or search active) */}
        {!showNetflix && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">{t("merchant.showingResults", { total: filtered.length })}</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
              >
                <option value="rating">{t("merchant.sort.rating")}</option>
                <option value="orders">{t("merchant.sort.orders")}</option>
                <option value="newest">{t("merchant.sort.newest")}</option>
              </select>
            </div>

            {visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {visible.map((m) => (
                  <MerchantCard key={m.id} merchant={m} t={t} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">{t("merchant.noResults")}</p>
              </div>
            )}

            {/* Load More */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {t("merchant.loadMore")} ({filtered.length - visibleCount} {t("merchant.stats.partners")})
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════ Trust Banner ══════ */}
        <section className="mt-16 mb-12 bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}+</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.badge.verified")} {t("merchant.stats.partners")}</div>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.types}</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.stats.types")}</div>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.stats.avgRating")}</div>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.responseRate")}</div>
            </div>
          </div>
        </section>

        {/* ══════ Become a Partner CTA ══════ */}
        <section className="hero-bg rounded-2xl p-8 md:p-12 text-center text-white mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("merchant.becomePartner")}</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">{t("merchant.partnerBenefits.title")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-semibold mb-1">{t("merchant.partnerBenefits.exposure")}</h3>
              <p className="text-sm text-white/60">{t("merchant.partnerBenefits.exposureDesc")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="font-semibold mb-1">{t("merchant.partnerBenefits.tools")}</h3>
              <p className="text-sm text-white/60">{t("merchant.partnerBenefits.toolsDesc")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl mb-3">🏅</div>
              <h3 className="font-semibold mb-1">{t("merchant.partnerBenefits.brand")}</h3>
              <p className="text-sm text-white/60">{t("merchant.partnerBenefits.brandDesc")}</p>
            </div>
          </div>
          <Link href="/merchants/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#0066FF] font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
            {t("merchant.register")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </section>
      </div>

      <MobileNav />
    </div>
  );
}
