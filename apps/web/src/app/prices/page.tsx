"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchRoutes, fetchPackages, fetchPromotions, type PackageItem, type PromotionItem } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

interface RoutePrice {
  title: string;
  slug: string;
  priceFrom: number;
  duration: number;
  difficulty: string;
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetHour: number) {
  const getRemaining = useCallback(() => {
    const now = new Date();
    const end = new Date();
    end.setHours(targetHour, 0, 0, 0);
    if (end <= now) end.setDate(end.getDate() + 1);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [targetHour]);

  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [getRemaining]);
  return remaining;
}

// ─── Tiny inline sparkline (SVG) ─────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {/* last dot */}
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2"
        fill={color}
      />
    </svg>
  );
}

// Deterministic pseudo-random sparkline based on route slug
function getSparklineData(seed: string, base: number): number[] {
  const hash = Array.from(seed).reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  return Array.from({ length: 8 }, (_, i) => {
    const x = ((hash * (i + 3)) % 37) / 37;
    return Math.round(base * (0.85 + x * 0.3));
  });
}

export default function PricesPage() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<RoutePrice[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [promoTab, setPromoTab] = useState<"all" | "FLASH_SALE" | "EARLY_BIRD" | "DISCOUNT">("all");
  const [loading, setLoading] = useState(true);

  // Budget calculator state
  const [budgetPeople, setBudgetPeople] = useState(2);
  const [budgetDays, setBudgetDays] = useState(7);
  const [budgetStyle, setBudgetStyle] = useState<"eco" | "comfort" | "lux">("comfort");

  // Inline alert state
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  // Countdown: deal ends at 23:00
  const countdown = useCountdown(23);

  useEffect(() => {
    fetchRoutes()
      .then((data) => {
        const arr = Array.isArray(data) ? data : ((data as unknown as { items?: RoutePrice[] })?.items || []);
        setRoutes(
          arr.slice(0, 6).map((r: Record<string, unknown>) => ({
            title: (r.title as string) || "",
            slug: (r.slug as string) || "",
            priceFrom: (r.priceFrom as number) || 0,
            duration: (r.duration as number) || 0,
            difficulty: (r.difficulty as string) || "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchPackages({ page: 1 })
      .then((data) => setPackages(Array.isArray(data.items) ? data.items.slice(0, 6) : []))
      .catch(() => {});
    fetchPromotions(undefined, 1)
      .then((data) => setPromotions(Array.isArray(data.items) ? data.items : []))
      .catch(() => {});
  }, []);

  const filteredPromos = useMemo(() => {
    if (promoTab === "all") return promotions;
    return promotions.filter((p) => p.type?.toUpperCase() === promoTab);
  }, [promotions, promoTab]);

  const maxPrice = Math.max(...routes.map((r) => r.priceFrom), 1);
  const minPrice = routes.length > 0 ? Math.min(...routes.map((r) => r.priceFrom)) : 0;
  const avgPrice = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + r.priceFrom, 0) / routes.length) : 0;

  // ─── Budget calculation ───────────────────────────────────────────────────
  const STYLE_MULTIPLIERS = { eco: 1, comfort: 1.5, lux: 2.5 };
  const baseRoute = minPrice > 0 ? minPrice : 2800;
  const mul = STYLE_MULTIPLIERS[budgetStyle];
  const routeFee = baseRoute * budgetPeople;
  const hotel = Math.round(budgetDays * 280 * mul) * budgetPeople;
  const meals = Math.round(budgetDays * 120 * mul) * budgetPeople;
  const transport = Math.round(budgetDays * 80 * mul) * budgetPeople;
  const misc = Math.round(budgetDays * 60 * mul) * budgetPeople;
  const totalBudget = routeFee + hotel + meals + transport + misc;
  const perPersonBudget = Math.round(totalBudget / budgetPeople);

  const TOOLS = [
    {
      label: t("prices.hub.calendar"),
      href: "/prices/calendar",
      desc: t("prices.hub.calendarDesc"),
      icon: (
        <svg className="w-7 h-7 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-50",
    },
    {
      label: t("prices.hub.compare"),
      href: "/prices/compare",
      desc: t("prices.hub.compareDesc"),
      icon: (
        <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      color: "bg-green-50",
    },
    {
      label: t("prices.hub.alerts"),
      href: "/prices/alerts",
      desc: t("prices.hub.alertsDesc"),
      icon: (
        <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: "bg-amber-50",
    },
    {
      label: t("prices.hub.trend"),
      href: "/prices/trend",
      desc: t("prices.hub.trendDesc"),
      icon: (
        <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "bg-purple-50",
    },
  ];

  const SAVING_TIPS = [
    { title: t("prices.tip1.title"), desc: t("prices.tip1.desc"), stat: t("prices.tip1.stat") },
    { title: t("prices.tip2.title"), desc: t("prices.tip2.desc"), stat: t("prices.tip2.stat") },
    { title: t("prices.tip3.title"), desc: t("prices.tip3.desc"), stat: t("prices.tip3.stat") },
    { title: t("prices.tip4.title"), desc: t("prices.tip4.desc"), stat: t("prices.tip4.stat") },
  ];

  // Best-time-to-book score (deterministic based on today's date)
  const today = new Date();
  const month = today.getMonth(); // 0-indexed
  const LOW_MONTHS = [1, 5, 10]; // Feb, Jun, Nov
  const bookingScore = LOW_MONTHS.includes(month) ? 8.5 : month % 3 === 0 ? 6.2 : 7.1;
  const scoreColor = bookingScore >= 8 ? "text-green-600" : bookingScore >= 6.5 ? "text-amber-500" : "text-red-500";

  function handleAlertSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (alertEmail.trim()) setAlertSubscribed(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">

      {/* ── FEATURE 1: Deal of the Day Flash Banner (Priceline style) ─────── */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white pt-[4.5rem] pb-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {t("prices.deal.badge")}
            </span>
            <span className="font-bold text-sm md:text-base">{t("prices.deal.title")}</span>
            <span className="text-red-100 text-xs hidden sm:inline">{t("prices.deal.desc")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-red-100 text-xs">{t("prices.deal.endsIn")}</span>
              <span className="bg-white/20 font-mono font-bold px-1.5 py-0.5 rounded text-sm">
                {String(countdown.h).padStart(2, "0")}
              </span>
              <span className="text-red-100 text-xs">{t("prices.deal.hours")}</span>
              <span className="bg-white/20 font-mono font-bold px-1.5 py-0.5 rounded text-sm">
                {String(countdown.m).padStart(2, "0")}
              </span>
              <span className="text-red-100 text-xs">{t("prices.deal.minutes")}</span>
              <span className="bg-white/20 font-mono font-bold px-1.5 py-0.5 rounded text-sm">
                {String(countdown.s).padStart(2, "0")}
              </span>
              <span className="text-red-100 text-xs">{t("prices.deal.seconds")}</span>
            </div>
            <Link
              href="/promotions"
              className="bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              {t("prices.deal.seize")}
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero-bg text-white py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">{t("prices.hero.tagline")}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("prices.hub.title")}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t("prices.hub.subtitle")}</p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div>
              <p className="text-3xl font-bold">{routes.length > 0 ? `${routes.length}+` : "10+"}</p>
              <p className="text-blue-200 text-sm">{t("prices.stats.routes")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">7×24</p>
              <p className="text-blue-200 text-sm">{t("prices.stats.monitoring")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">30%</p>
              <p className="text-blue-200 text-sm">{t("prices.stats.maxSave")}</p>
            </div>
          </div>

          {/* ── FEATURE 2: Inline Price Alert Subscribe (Skyscanner bell style) ── */}
          <div className="mt-8 max-w-lg mx-auto bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
            {alertSubscribed ? (
              <div className="flex items-center gap-2 justify-center text-green-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{t("prices.alert.subscribed")}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3 justify-center">
                  <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-white font-bold text-sm">{t("prices.alert.inlineTitle")}</p>
                </div>
                <p className="text-blue-200 text-xs mb-3 text-center">{t("prices.alert.inlineDesc")}</p>
                <form onSubmit={handleAlertSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder={t("prices.alert.emailPlaceholder")}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 text-sm border border-white/30 focus:outline-none focus:border-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t("prices.alert.subscribe")}
                  </button>
                </form>
                <p className="text-blue-300 text-xs mt-2 text-center">{t("prices.alert.privacy")}</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick Price Overview (Kayak style) */}
      {routes.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-green-600">¥{minPrice.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{t("prices.lowestPrice")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-gray-900">¥{avgPrice.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{t("prices.avgPrice")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-[#0066FF]">{routes.length}</p>
            <p className="text-xs text-gray-500">{t("prices.routeCount")}</p>
          </div>
        </div>
      )}

      {/* Tool Cards */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                {tool.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-1">
                {tool.label}
              </h2>
              <p className="text-gray-500 text-sm line-clamp-2">{tool.desc}</p>
              <div className="mt-3 text-[#0066FF] text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {t("prices.useNow")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Promotions (merged from /promotions) ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("nav.deals")}</h2>
            <p className="text-gray-500 text-sm mt-1">{t("promotions.subtitle")}</p>
          </div>
          <Link href="/promotions" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
            {t("common.viewAll")} →
          </Link>
        </div>
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {([
            { key: "all" as const, label: t("promotions.tabAll"), icon: "🎯" },
            { key: "FLASH_SALE" as const, label: t("promotions.tabFlashSale"), icon: "⚡" },
            { key: "EARLY_BIRD" as const, label: t("promotions.tabEarlyBird"), icon: "🌅" },
            { key: "DISCOUNT" as const, label: t("promotions.tabDiscount"), icon: "🏷️" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPromoTab(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                promoTab === tab.key
                  ? "bg-[#0066FF] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#0066FF]/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {filteredPromos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPromos.slice(0, 8).map((promo) => {
              const typeUpper = promo.type?.toUpperCase();
              const tagColor = typeUpper === "FLASH_SALE" ? "bg-red-500" : typeUpper === "EARLY_BIRD" ? "bg-green-500" : "bg-[#0066FF]";
              const tagLabel = typeUpper === "FLASH_SALE" ? t("promotions.tabFlashSale") : typeUpper === "EARLY_BIRD" ? t("promotions.tabEarlyBird") : t("promotions.tabDiscount");
              const gradientBg = typeUpper === "FLASH_SALE" ? "from-red-500 to-orange-400" : typeUpper === "EARLY_BIRD" ? "from-green-500 to-teal-400" : "from-[#0066FF] to-purple-500";
              return (
                <div key={promo.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {promo.coverImage ? (
                    <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${promo.coverImage})` }} />
                  ) : (
                    <div className={`h-28 bg-gradient-to-r ${gradientBg} flex items-center justify-center`}>
                      <span className="text-3xl">{typeUpper === "FLASH_SALE" ? "⚡" : typeUpper === "EARLY_BIRD" ? "🌅" : "🏷️"}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{promo.name}</h3>
                      <span className={`shrink-0 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${tagColor}`}>{tagLabel}</span>
                    </div>
                    {promo.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{promo.description}</p>}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-red-500">
                        {promo.discountType === "PERCENT"
                          ? t("promotions.percentOff", { value: promo.discountValue })
                          : t("promotions.amountOff", { value: (promo.discountValue / 100).toFixed(0) })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 py-10 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎁</span>
            </div>
            <p className="font-medium text-gray-900 mb-1">{t("promotions.noActivePromo")}</p>
            <p className="text-sm text-gray-500">{t("promotions.comingSoon")}</p>
          </div>
        )}
      </section>

      {/* ── FEATURE 3: Best Time to Book (Kayak style) ───────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: score panel */}
            <div className="md:w-64 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-7 flex flex-col justify-center items-center text-center shrink-0">
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-2">{t("prices.bestTime.score")}</p>
              <p className={`text-6xl font-black mb-1 ${scoreColor.replace("text-", "text-")} text-white`}>
                {bookingScore.toFixed(1)}
              </p>
              <p className="text-blue-200 text-sm mb-4">{t("prices.bestTime.scoreUnit")}</p>
              {/* Score bar */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${(bookingScore / 10) * 100}%` }}
                />
              </div>
            </div>
            {/* Right: tips + recommendation */}
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t("prices.bestTime.title")}</h2>
              <p className="text-gray-500 text-sm mb-5">{t("prices.bestTime.subtitle")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {[
                  { icon: "📅", title: t("prices.bestTime.advanceBook"), desc: t("prices.bestTime.advanceBookDesc") },
                  { icon: "🌤️", title: t("prices.bestTime.avoidPeak"), desc: t("prices.bestTime.avoidPeakDesc") },
                  { icon: "✈️", title: t("prices.bestTime.weekday"), desc: t("prices.bestTime.weekdayDesc") },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-green-800 text-sm mb-0.5">{t("prices.bestTime.recommendation")}</p>
                  <p className="text-green-700 text-sm leading-relaxed">{t("prices.bestTime.recText")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Route Pricing — with sparklines + flexible-dates badge */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("prices.popularRoutes")}</h2>
            <p className="text-gray-500 text-sm mt-1">{t("prices.popularRoutesDesc")}</p>
          </div>
          <Link href="/holy-sites#routes" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
            {t("common.viewAll")}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4" />
                <div className="h-6 bg-gray-100 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : routes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => {
              const sparkData = getSparklineData(route.slug, route.priceFrom);
              const lastVal = sparkData[sparkData.length - 1];
              const prevVal = sparkData[sparkData.length - 2];
              const isDown = lastVal < prevVal;
              const sparkColor = isDown ? "#22c55e" : "#f59e0b";
              const hasFlexible = route.duration >= 7;

              return (
                <Link
                  key={route.slug}
                  href={`/holy-sites/routes/${route.slug}`}
                  className="group bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#0066FF]/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors flex-1 min-w-0 truncate">
                      {route.title}
                    </h3>
                    {/* ── FEATURE 4b: Flexible dates badge (Skyscanner style) ── */}
                    {hasFlexible && (
                      <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                        {t("prices.flexible.badge")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {route.duration > 0 && <span>{route.duration}{t("common.days")}</span>}
                    {route.difficulty && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{route.difficulty}</span>
                    )}
                    {hasFlexible && (
                      <span className="text-blue-500">{t("prices.flexible.hint")}</span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[#0066FF]">
                          ¥{route.priceFrom?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">{t("prices.perPerson")}</span>
                      </div>
                    </div>
                    {/* ── FEATURE 4a: Mini trend sparkline ── */}
                    <div className="flex flex-col items-end gap-1">
                      <Sparkline data={sparkData} color={sparkColor} />
                      <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isDown ? "text-green-600" : "text-amber-500"}`}>
                        {isDown ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                        {t("prices.viewTrend")}
                      </span>
                    </div>
                  </div>

                  {/* Price Level Indicator (Skyscanner style) */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>{t("prices.priceLevel")}</span>
                      <span>{route.priceFrom <= maxPrice * 0.4 ? t("prices.levelLow") : route.priceFrom <= maxPrice * 0.7 ? t("prices.levelMid") : t("prices.levelHigh")}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(route.priceFrom / maxPrice) * 100}%`,
                          background: route.priceFrom <= maxPrice * 0.4 ? "#22c55e" : route.priceFrom <= maxPrice * 0.7 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">{t("prices.noData")}</p>
          </div>
        )}
      </section>

      {/* ── FEATURE 5: Budget Calculator / Trip Cost Estimator (Expedia style) ── */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-5">
            <h2 className="text-xl font-bold text-white">{t("prices.budget.title")}</h2>
            <p className="text-indigo-200 text-sm mt-1">{t("prices.budget.subtitle")}</p>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* People */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("prices.budget.people")}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBudgetPeople(Math.max(1, budgetPeople - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-gray-900">{budgetPeople}</span>
                  <button
                    onClick={() => setBudgetPeople(Math.min(20, budgetPeople + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("prices.budget.days")}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBudgetDays(Math.max(1, budgetDays - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-gray-900">{budgetDays}</span>
                  <button
                    onClick={() => setBudgetDays(Math.min(60, budgetDays + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Style */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("prices.budget.style")}</label>
                <div className="flex gap-2">
                  {(["eco", "comfort", "lux"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBudgetStyle(s)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        budgetStyle === s
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      {t(`prices.budget.style${s.charAt(0).toUpperCase() + s.slice(1)}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  { label: t("prices.budget.routeFee"), value: routeFee },
                  { label: t("prices.budget.hotel"), value: hotel },
                  { label: t("prices.budget.meals"), value: meals },
                  { label: t("prices.budget.transport"), value: transport },
                  { label: t("prices.budget.misc"), value: misc },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">¥{item.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">{t("prices.budget.total")}</span>
                  <span className="text-xl font-black text-indigo-600">¥{totalBudget.toLocaleString()}</span>
                </div>
              </div>

              {/* Right: big per-person + CTA */}
              <div className="flex flex-col items-center justify-center bg-indigo-50 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-1">{t("prices.budget.perPerson")}</p>
                <p className="text-5xl font-black text-indigo-700 mb-1">¥{perPersonBudget.toLocaleString()}</p>
                <p className="text-gray-400 text-xs mb-5">× {budgetPeople} {t("prices.budget.people")}</p>
                <Link
                  href="/trips/create"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  {t("prices.budget.bookNow")}
                </Link>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-4">{t("prices.budget.note")}</p>
          </div>
        </div>
      </section>

      {/* Saving Tips */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("prices.savingTips")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAVING_TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-2xl font-bold text-[#0066FF] mb-2">{tip.stat}</div>
              <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-500">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Packages Section ── */}
      {packages.length > 0 && (
        <section id="packages" className="max-w-6xl mx-auto px-4 pb-14">
          <div className="bg-gradient-to-b from-[#0066FF]/5 to-transparent rounded-2xl p-6 md:p-8 border border-[#0066FF]/10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">{t("prices.packages.hotBadge")}</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t("prices.packages.title")}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{t("prices.packages.subtitle")}</p>
                </div>
              </div>
              <Link
                href="/prices/packages"
                className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium transition-colors whitespace-nowrap"
              >
                {t("prices.packages.viewAll")} →
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {packages.map((pkg) => {
                const price = `¥${((pkg.basePrice ?? 0) / 100).toLocaleString()}`;
                const memberPrice = pkg.memberPrice != null ? `¥${((pkg.memberPrice ?? 0) / 100).toLocaleString()}` : null;
                const INCLUDES_MAP: Record<string, { icon: string; label: string }> = {
                  transport: { icon: "🚌", label: t("prices.includes.transport") },
                  hotel: { icon: "🏨", label: t("prices.includes.hotel") },
                  meal: { icon: "🍽️", label: t("prices.includes.meal") },
                  guide: { icon: "🎙️", label: t("prices.includes.guide") },
                  insurance: { icon: "🛡️", label: t("prices.includes.insurance") },
                  ticket: { icon: "🎫", label: t("prices.includes.ticket") },
                };
                return (
                  <Link
                    key={pkg.id}
                    href={`/prices/packages/${pkg.id}`}
                    className="group flex-none w-[280px] md:w-[320px] snap-start"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#0066FF]/30 transition-all duration-300 h-full flex flex-col">
                      {/* Cover */}
                      <div className="relative h-40 overflow-hidden">
                        {pkg.coverImage ? (
                          <img src={pkg.coverImage} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-4xl">📦</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                          {pkg.duration}{t("prices.packages.dayUnit")} · {t("prices.packages.maxPersons", { count: pkg.maxPersons })}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-bold text-base line-clamp-1">{pkg.name}</h3>
                          {pkg.description && <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{pkg.description}</p>}
                        </div>
                      </div>
                      {/* Includes */}
                      <div className="px-4 pt-3 flex flex-wrap gap-2">
                        {Object.entries(pkg.includes || {}).map(([key, included]) => {
                          const info = INCLUDES_MAP[key];
                          if (!info || !included) return null;
                          return (
                            <span key={key} className="inline-flex items-center gap-0.5 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
                              <span>{info.icon}</span> {info.label}
                            </span>
                          );
                        })}
                      </div>
                      {/* Price */}
                      <div className="px-4 py-3 mt-auto flex items-end justify-between border-t border-gray-100">
                        <div>
                          {memberPrice && <p className="text-[#D4A855] text-xs font-semibold">{t("prices.packages.memberPriceFrom", { price: memberPrice })}</p>}
                          <p className={`font-bold ${memberPrice ? "text-gray-400 line-through text-sm" : "text-lg text-[#0066FF]"}`}>{t("prices.packages.priceFrom", { price })}</p>
                        </div>
                        <span className="px-3 py-1.5 bg-[#0066FF] text-white text-xs font-semibold rounded-lg">{t("prices.packages.bookNow")}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white border-t border-b border-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("prices.howItWorks")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t("prices.step1.title"), desc: t("prices.step1.desc") },
              { step: "02", title: t("prices.step2.title"), desc: t("prices.step2.desc") },
              { step: "03", title: t("prices.step3.title"), desc: t("prices.step3.desc") },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-[#0066FF]">{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("prices.faq")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: t("prices.faq1.q"), a: t("prices.faq1.a") },
            { q: t("prices.faq2.q"), a: t("prices.faq2.a") },
            { q: t("prices.faq3.q"), a: t("prices.faq3.a") },
            { q: t("prices.faq4.q"), a: t("prices.faq4.a") },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="hero-bg rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("prices.ctaTitle")}</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">{t("prices.ctaDesc")}</p>
          <Link href="/prices/alerts" className="inline-block px-8 py-3 bg-white text-[#0066FF] rounded-xl font-bold hover:bg-blue-50 transition-colors">
            {t("prices.ctaBtn")}
          </Link>
        </div>
      </section>

      <MobileNav />
    </main>
  );
}
