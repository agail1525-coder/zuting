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
  const services = (merchant.services || []) as Array<{ id: string; name?: string; price: number; coverImage?: string | null }>;
  const serviceCount = services.length;
  const minPrice = serviceCount > 0 ? Math.min(...services.map((s) => s.price)) : 0;
  const signatureService = services[0];
  const location = [merchant.province, merchant.city].filter(Boolean).join(" ");
  const isHot = merchant.totalOrders >= 1000;
  const isTopRated = merchant.rating >= 4.8;

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
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text} backdrop-blur-sm shadow-sm`}>
              {cfg.icon} {t(`merchant.type.${merchant.type}`)}
            </span>
          </div>
          {/* Top-right badges stack */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {isTopRated && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">★ {t("merchant.badge.topRated")}</span>
            )}
            {isHot && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm">🔥 {t("merchant.badge.hot")}</span>
            )}
          </div>
          {/* Price tag */}
          {minPrice > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-[#0066FF] text-sm font-bold shadow-md">
                {t("merchant.priceFrom", { price: Math.round(minPrice / 100) })}
              </span>
            </div>
          )}
          {merchant.status === "ACTIVE" && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-600/95 text-white flex items-center gap-1 backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {t("merchant.badge.verified")}
              </span>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{merchant.name}</h3>
          <div className="mt-1.5 flex items-center justify-between">
            <StarRating rating={merchant.rating} />
            <span className="text-[11px] text-gray-400">{merchant.totalOrders}+ {t("merchant.totalOrders")}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{merchant.description}</p>
          {/* Signature service line */}
          {signatureService?.name && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              <span className={`inline-block w-1 h-1 rounded-full ${cfg.text.replace("text-", "bg-")}`} />
              <span className="text-gray-400">{t("merchant.signatureService")}:</span>
              <span className="text-gray-700 font-medium line-clamp-1">{signatureService.name}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="line-clamp-1">{location}</span>
              {serviceCount > 0 && <span className="ml-auto text-gray-500">{t("merchant.servicesCount", { count: serviceCount })}</span>}
            </div>
          )}
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
  const totalOrdersAcrossAll = useMemo(
    () => initialMerchants.reduce((sum, m) => sum + (m.totalOrders || 0), 0),
    [initialMerchants],
  );

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

  // 吃喝玩乐 quick entry groups
  const quickGroups: Array<{ key: string; icon: string; label: string; desc: string; types: MerchantType[]; gradient: string }> = [
    { key: "eat",    icon: "🍜", label: t("merchant.quickEntry.eat"),    desc: t("merchant.quickEntry.eatDesc"),    types: ["RESTAURANT"], gradient: "from-orange-400 to-red-500" },
    { key: "stay",   icon: "🏯", label: t("merchant.quickEntry.stay"),   desc: t("merchant.quickEntry.stayDesc"),   types: ["HOTEL"], gradient: "from-purple-400 to-pink-500" },
    { key: "play",   icon: "🎋", label: t("merchant.quickEntry.play"),   desc: t("merchant.quickEntry.playDesc"),   types: ["CULTURAL_EXPERIENCE", "WELLNESS", "PHOTOGRAPHY"], gradient: "from-emerald-400 to-teal-500" },
    { key: "travel", icon: "🚗", label: t("merchant.quickEntry.travel"), desc: t("merchant.quickEntry.travelDesc"), types: ["GUIDE", "TRANSPORT", "TEMPLE_SERVICE", "SHOPPING"], gradient: "from-sky-400 to-blue-500" },
  ];
  const quickGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of quickGroups) {
      counts[g.key] = initialMerchants.filter((m) => g.types.includes(m.type as MerchantType)).length;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMerchants]);
  const handleQuickGroup = (types: MerchantType[]) => {
    // If single type, directly filter; else pick first available
    const first = types.find((tp) => (typeCounts[tp] || 0) > 0) || types[0];
    setActiveType(first);
    setVisibleCount(24);
    if (typeof window !== "undefined") window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ══════ Hero ══════ */}
      <section className="hero-bg pt-28 pb-20 md:pt-36 md:pb-24 relative overflow-hidden">
        {/* Decorative image mosaic */}
        <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400 to-red-500 blur-3xl" />
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t("merchant.hero.liveBadge")}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t("merchant.hero.eatDrinkPlay")}</h1>
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

      {/* ══════ 吃喝玩乐 Quick Entry ══════ */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {quickGroups.map((g) => (
            <button
              key={g.key}
              onClick={() => handleQuickGroup(g.types)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient} p-4 md:p-5 text-left text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all">{g.icon}</div>
              <div className="relative">
                <div className="text-3xl md:text-4xl mb-1">{g.icon}</div>
                <div className="text-lg md:text-xl font-bold">{g.label}</div>
                <div className="text-xs text-white/80 mt-0.5">{g.desc}</div>
                <div className="text-[11px] text-white/70 mt-2">{quickGroupCounts[g.key] || 0} {t("merchant.stats.partners")} →</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ══════ Category Navigation Bar ══════ */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm mt-8">
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
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {t("merchant.featured")}
                </h2>
                <p className="text-xs text-gray-400 mt-1">{t("merchant.featuredDesc")}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((m) => {
                const fCfg = getTypeConfig(m.type);
                const fMinPrice = m.services && m.services.length > 0 ? Math.min(...m.services.map((s: { price: number }) => s.price)) : 0;
                return (
                  <Link key={m.id} href={`/merchants/${m.id}`} className="group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
                    <div className="relative aspect-[16/10]">
                      {m.logo ? (
                        <OptimizedImage src={m.logo} alt={m.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${fCfg.gradient} flex items-center justify-center`}>
                          <span className="text-7xl opacity-80">{fCfg.icon}</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      {/* Top badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${fCfg.bg} ${fCfg.text} shadow-sm`}>
                          {fCfg.icon} {t(`merchant.type.${m.type}`)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">★ {t("merchant.badge.topRated")}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold shadow-sm">
                          {m.rating.toFixed(1)} ★
                        </span>
                      </div>
                      {/* Bottom content */}
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <h3 className="text-xl md:text-2xl font-bold mb-1 drop-shadow-md">{m.name}</h3>
                        <p className="text-sm text-white/90 line-clamp-2 mb-3 drop-shadow">{m.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/80">{m.totalOrders}+ {t("merchant.totalOrders")}</span>
                          {fMinPrice > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#0066FF] text-sm font-bold group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                              {t("merchant.priceFrom", { price: Math.round(fMinPrice / 100) })} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
        <section className="mt-16 mb-12 bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-gray-100 p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{t("merchant.trust.title")}</h3>
            <p className="text-xs text-gray-500 mt-1">{t("merchant.trust.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalOrdersAcrossAll.toLocaleString()}+</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.trust.bookings")}</div>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.trust.avgRating")}</div>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">7×24</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.trust.support")}</div>
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">100%</div>
              <div className="text-xs text-gray-500 mt-1">{t("merchant.trust.refund")}</div>
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
