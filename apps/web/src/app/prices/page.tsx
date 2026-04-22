"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchRoutes, fetchPackages, type PackageItem } from "@/lib/api";
import MobileNav from "@/components/MobileNav";
import PricePulseBar from "@/components/PricePulseBar";
import PriceHeroSearch from "@/components/PriceHeroSearch";
import PriceToolsGrid from "@/components/PriceToolsGrid";
import PriceTodayLow from "@/components/PriceTodayLow";
import PriceTopMovers from "@/components/PriceTopMovers";
import PriceFlashDeal from "@/components/PriceFlashDeal";
import PriceAlertInline from "@/components/PriceAlertInline";
import PriceBudgetEstimator from "@/components/PriceBudgetEstimator";
import PriceMethodology from "@/components/PriceMethodology";
import PriceSourceBadge from "@/components/PriceSourceBadge";

interface RoutePrice {
  title: string;
  slug: string;
  priceFrom: number;
  duration: number;
  difficulty: string;
}

export default function PricesPage() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<RoutePrice[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      .then((data) => setPackages(Array.isArray(data.items) ? data.items.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  const minPrice = routes.length > 0 ? Math.min(...routes.map((r) => r.priceFrom)) : 0;
  const maxPrice = Math.max(...routes.map((r) => r.priceFrom), 1);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* ═══════ 段一 · 控制台 (Control Panel) ═══════ */}
      <section className="pt-[4rem]">
        <PricePulseBar />
      </section>

      <PriceHeroSearch />

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <PriceToolsGrid />
      </div>

      {/* ═══════ 段二 · 洞察 (Insights) ═══════ */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="mb-5">
          <p className="text-[#F5D898] text-xs font-semibold tracking-[0.3em] uppercase mb-1.5">INSIGHTS · 价格洞察</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">今日价格风向</h2>
          <p className="text-gray-500 text-sm mt-1">基于最新 snapshot 自动生成,每小时 CRON 刷新</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── 左栏 2/3: 榜单 + 热门路线 ── */}
          <div className="lg:col-span-2 space-y-5">
            <PriceTodayLow />
            <PriceTopMovers />

            {/* Popular routes — kept from v2, simplified */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-[#3264ff]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{t("prices.popularRoutes")}</h3>
                    <p className="text-[11px] text-gray-400">起步价实时对齐 baseline 快照</p>
                  </div>
                </div>
                <Link href="/holy-sites#routes" className="text-xs text-[#3264ff] hover:underline font-medium">
                  {t("common.viewAll")} →
                </Link>
              </header>

              {loading ? (
                <ul className="divide-y divide-gray-50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="px-5 py-3.5 animate-pulse flex items-center gap-3">
                      <div className="flex-1"><div className="h-3.5 bg-gray-100 rounded w-2/3 mb-1.5" /><div className="h-2.5 bg-gray-100 rounded w-1/3" /></div>
                      <div className="h-5 bg-gray-100 rounded w-16" />
                    </li>
                  ))}
                </ul>
              ) : routes.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">{t("prices.noData")}</div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {routes.map((route) => {
                    const levelPct = (route.priceFrom / maxPrice) * 100;
                    const levelColor = route.priceFrom <= maxPrice * 0.4 ? "#22c55e" : route.priceFrom <= maxPrice * 0.7 ? "#f59e0b" : "#ef4444";
                    return (
                      <li key={route.slug}>
                        <Link href={`/holy-sites/routes/${route.slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{route.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {route.duration > 0 && <span className="text-[11px] text-gray-400">{route.duration}{t("common.days")}</span>}
                              {route.difficulty && <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{route.difficulty}</span>}
                              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                                <div className="h-full rounded-full transition-all" style={{ width: `${levelPct}%`, background: levelColor }} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-[#3264ff]">¥{route.priceFrom.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">{t("prices.perPerson")}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                <PriceSourceBadge source="baseline" sampleCount={routes.length} />
              </div>
            </section>
          </div>

          {/* ── 右栏 1/3: 闪购 + 告警 + 预算 ── */}
          <div className="space-y-5">
            <PriceFlashDeal />
            <PriceAlertInline />
            <PriceBudgetEstimator baseRoutePriceYuan={minPrice > 0 ? minPrice : 2800} />

            {/* Packages strip — simplified vertical list */}
            {packages.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600">📦</span>
                    <h3 className="font-bold text-gray-900 text-sm">{t("prices.packages.title")}</h3>
                  </div>
                  <Link href="/prices/packages" className="text-[11px] text-[#3264ff] hover:underline font-medium">
                    {t("common.viewAll")} →
                  </Link>
                </header>
                <ul className="divide-y divide-gray-50">
                  {packages.map((pkg) => {
                    const price = `¥${((pkg.basePrice ?? 0) / 100).toLocaleString()}`;
                    return (
                      <li key={pkg.id}>
                        <Link href={`/prices/packages/${pkg.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{pkg.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{pkg.duration}{t("prices.packages.dayUnit")} · {t("prices.packages.maxPersons", { count: pkg.maxPersons })}</p>
                          </div>
                          <span className="text-sm font-bold text-[#3264ff] shrink-0">{price}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ 段三 · 支撑 (Context) ═══════ */}
      <section className="mt-14 pt-12 pb-14 bg-white border-t border-gray-100">
        <PriceMethodology />
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 pt-6">
        <div className="hero-bg rounded-2xl p-8 md:p-10 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2">{t("prices.ctaTitle")}</h2>
          <p className="text-blue-100 text-sm mb-5 max-w-xl mx-auto">{t("prices.ctaDesc")}</p>
          <Link href="/prices/alerts" className="inline-block px-6 py-2.5 bg-white text-[#3264ff] rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">
            {t("prices.ctaBtn")}
          </Link>
        </div>
      </section>

      <MobileNav />
    </main>
  );
}
