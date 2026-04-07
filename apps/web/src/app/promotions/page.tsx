"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { fetchPromotions, type PromotionItem } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";

type TabKey = "all" | "FLASH_SALE" | "EARLY_BIRD" | "DISCOUNT";

function formatDate(dateStr: string, locale = "zh-CN"): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountdown(endAt: string) {
  const calc = () => Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
  const [seconds, setSeconds] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(timer);
  }, [endAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { seconds, d, h, m, s, expired: seconds === 0 };
}

function CountdownBadge({ endAt }: { endAt: string }) {
  const { d, h, m, s, expired } = useCountdown(endAt);
  const { t } = useTranslation();
  if (expired) return <span className="text-xs text-gray-400 font-mono">{t("promotions.ended")}</span>;
  return (
    <span className="text-xs font-mono text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
      {d > 0 ? `${d}d ` : ""}
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const color = pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-orange-400" : "bg-[#0066FF]";
  return (
    <div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {t("promotions.grabbed", { used: String(used), total: String(total), remaining: String(Math.max(0, total - used)) })}
      </p>
    </div>
  );
}

interface PromoCardProps {
  promo: PromotionItem;
}

function FlashSaleCard({ promo }: PromoCardProps) {
  const { t } = useTranslation();
  const { expired } = useCountdown(promo.endAt);
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        expired ? "opacity-60" : ""
      }`}
    >
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-red-500 to-orange-400 flex items-center justify-center">
          <span className="text-4xl">⚡</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
            {t("promotions.flashSaleTag")}
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-red-500">
            {promo.discountType === "PERCENT"
              ? t("promotions.percentOff", { value: promo.discountValue })
              : t("promotions.amountOff", { value: (promo.discountValue / 100).toFixed(0) })}
          </span>
          {promo.minAmount != null && (
            <span className="text-xs text-gray-400">{t("promotions.minSpend", { min: (promo.minAmount / 100).toFixed(0) })}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">{t("promotions.endsIn")}</span>
          <CountdownBadge endAt={promo.endAt} />
        </div>
        {promo.totalQuota > 0 && (
          <QuotaBar used={promo.usedQuota} total={promo.totalQuota} />
        )}
      </div>
    </div>
  );
}

function DiscountCard({ promo }: PromoCardProps) {
  const { t, locale } = useTranslation();
  const endDate = formatDate(promo.endAt, locale);
  const nowMs = Date.now();
  const endMs = new Date(promo.endAt).getTime();
  const remainDays = Math.max(0, Math.ceil((endMs - nowMs) / 86400000));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-[#0066FF] to-purple-500 flex items-center justify-center">
          <span className="text-4xl">🏷️</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded-full">
            {t("promotions.limitedTimeTag")}
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-[#0066FF]">
            {promo.discountType === "PERCENT"
              ? t("promotions.percentOff", { value: promo.discountValue })
              : t("promotions.amountOff", { value: (promo.discountValue / 100).toFixed(0) })}
          </span>
          {promo.minAmount != null && (
            <span className="text-xs text-gray-400 line-through">
              {t("promotions.originalPrice")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{t("promotions.deadline", { date: endDate })}</span>
          {remainDays <= 3 && remainDays > 0 && (
            <span className="text-orange-500 font-medium">{t("promotions.daysLeft", { days: remainDays })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function EarlyBirdCard({ promo }: PromoCardProps) {
  const { t, locale } = useTranslation();
  const saving = promo.discountType === "FIXED"
    ? `¥${(promo.discountValue / 100).toFixed(0)}`
    : `${promo.discountValue}%`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
          <span className="text-4xl">🌅</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
            {t("promotions.earlyBirdTag")}
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-3">
          <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm8.5 1H10V5.5a1 1 0 011-1h1a1 1 0 011 1V6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-green-700">
            {t("promotions.bookEarlySave", { saving })}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {t("promotions.eventDeadline", { date: formatDate(promo.endAt, locale) })}
        </div>
        {promo.totalQuota > 0 && (
          <div className="mt-2">
            <QuotaBar used={promo.usedQuota} total={promo.totalQuota} />
          </div>
        )}
      </div>
    </div>
  );
}

function PromoCard({ promo }: PromoCardProps) {
  const type = promo.type?.toUpperCase();
  if (type === "FLASH_SALE") return <FlashSaleCard promo={promo} />;
  if (type === "EARLY_BIRD") return <EarlyBirdCard promo={promo} />;
  return <DiscountCard promo={promo} />;
}

export default function PromotionsPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "all", label: t("promotions.tabAll"), icon: "🎯" },
    { key: "FLASH_SALE", label: t("promotions.tabFlashSale"), icon: "⚡" },
    { key: "EARLY_BIRD", label: t("promotions.tabEarlyBird"), icon: "🌅" },
    { key: "DISCOUNT", label: t("promotions.tabDiscount"), icon: "🏷️" },
  ];

  const load = useCallback(async (type: TabKey) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPromotions(type === "all" ? undefined : type, 1);
      setPromotions(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("promotions.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  // Client-side search
  const displayPromos = useMemo(() => {
    if (!searchQuery.trim()) return promotions;
    const q = searchQuery.toLowerCase();
    return promotions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [promotions, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const flash = promotions.filter((p) => p.type?.toUpperCase() === "FLASH_SALE").length;
    const earlyBird = promotions.filter((p) => p.type?.toUpperCase() === "EARLY_BIRD").length;
    const expiring = promotions.filter((p) => {
      const diff = new Date(p.endAt).getTime() - Date.now();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    }).length;
    return { total: promotions.length, flash, earlyBird, expiring };
  }, [promotions]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: promotions.length };
    promotions.forEach((p) => {
      const type = p.type?.toUpperCase() ?? "DISCOUNT";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [promotions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#0066FF] mb-2">
            {t("nav.deals")}
          </h1>
          <p className="text-gray-500 text-sm">{t("promotions.subtitle")}</p>
          {promotions.length > 0 && (
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span>🎯 {t("promotions.statsTotal", { count: String(stats.total) })}</span>
              {stats.flash > 0 && <span>⚡ {t("promotions.statsFlash", { count: String(stats.flash) })}</span>}
              {stats.expiring > 0 && (
                <span className="text-orange-500">🔥 {t("promotions.statsExpiring", { count: String(stats.expiring) })}</span>
              )}
            </div>
          )}
        </div>

        {/* Flash sale banner (对标Priceline/Agoda) */}
        {stats.flash > 0 && activeTab === "all" && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-orange-400 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">⚡</span>
                  <h2 className="text-lg font-bold">{t("promotions.flashSaleBanner")}</h2>
                </div>
                <p className="text-white/80 text-sm">{t("promotions.flashSaleBannerDesc", { count: String(stats.flash) })}</p>
              </div>
              <button
                onClick={() => setActiveTab("FLASH_SALE")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors border border-white/30"
              >
                {t("promotions.viewAll")}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("promotions.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          </div>
        </div>

        {/* Tabs with counts */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const count = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-[#0066FF] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#0066FF]/40 hover:text-[#0066FF]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-xs ${activeTab === tab.key ? "text-white/70" : "text-gray-400"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{t("promotions.loading")}</p>
          </div>
        ) : displayPromos.length === 0 ? (
          <>
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              </div>
              <p className="font-medium text-gray-900 mb-1">
                {searchQuery ? t("promotions.noSearchResult") : t("promotions.noActivePromo")}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery ? "" : t("promotions.comingSoon")}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="mt-3 text-sm text-[#0066FF] hover:underline">{t("promotions.clearSearch")}</button>
              )}
            </div>

            {/* How to save */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t("promotions.savingTips")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: t("promotions.tipNotifyTitle"), desc: t("promotions.tipNotifyDesc") },
                  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: t("promotions.tipFavoriteTitle"), desc: t("promotions.tipFavoriteDesc") },
                  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: t("promotions.tipInviteTitle"), desc: t("promotions.tipInviteDesc") },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 hero-bg rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">{t("promotions.dontMiss")}</h2>
              <p className="text-blue-100 mb-5">{t("promotions.dontMissDesc")}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/coupons" className="px-6 py-3 bg-white text-[#0066FF] font-bold rounded-xl hover:bg-blue-50 transition-colors">{t("promotions.getCoupons")}</Link>
                <Link href="/holy-sites#routes" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">{t("promotions.browseRoutes")}</Link>
              </div>
            </div>
          </>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayPromos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && promotions.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-3xl" />
            <div className="relative">
              <span className="text-3xl block mb-3">🎁</span>
              <h2 className="text-xl font-bold text-white">{t("promotions.moreDeals")}</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                {t("promotions.moreDealsDesc")}
              </p>
              <div className="flex gap-3 justify-center mt-5">
                <Link
                  href="/coupons"
                  className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {t("promotions.getCouponsArrow")}
                </Link>
                <Link
                  href="/holy-sites#routes"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
                >
                  {t("promotions.browseRoutes")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
