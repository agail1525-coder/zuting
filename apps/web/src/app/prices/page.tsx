"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchRoutes } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

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
  }, []);

  const maxPrice = Math.max(...routes.map((r) => r.priceFrom), 1);

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

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero */}
      <section className="hero-bg text-white py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">Smart Travel Pricing</p>
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
        </div>
      </section>

      {/* Quick Price Overview (Kayak style) */}
      {routes.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-green-600">¥{Math.min(...routes.map((r) => r.priceFrom)).toLocaleString()}</p>
            <p className="text-xs text-gray-500">{t("prices.lowestPrice")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-gray-900">¥{Math.round(routes.reduce((s, r) => s + r.priceFrom, 0) / routes.length).toLocaleString()}</p>
            <p className="text-xs text-gray-500">{t("prices.avgPrice")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-2xl font-bold text-[#0066FF]">{routes.length}</p>
            <p className="text-xs text-gray-500">{t("prices.routeCount")}</p>
          </div>
        </div>
      )}

      {/* Tool Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10" style={routes.length > 0 ? { marginTop: '2rem' } : undefined}>
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

      {/* Popular Route Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("prices.popularRoutes")}</h2>
            <p className="text-gray-500 text-sm mt-1">{t("prices.popularRoutesDesc")}</p>
          </div>
          <Link href="/routes" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
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
            {routes.map((route) => (
              <Link
                key={route.slug}
                href={`/routes/${route.slug}`}
                className="group bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-[#0066FF]/20 transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-1">
                  {route.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  {route.duration > 0 && <span>{route.duration}{t("common.days")}</span>}
                  {route.difficulty && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{route.difficulty}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#0066FF]">
                    ¥{route.priceFrom?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">{t("prices.perPerson")}</span>
                </div>
                {/* Price Level Indicator (Skyscanner style) */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>{t("prices.priceLevel")}</span>
                    <span>{route.priceFrom <= maxPrice * 0.4 ? t("prices.levelLow") : route.priceFrom <= maxPrice * 0.7 ? t("prices.levelMid") : t("prices.levelHigh")}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(route.priceFrom / maxPrice) * 100}%`,
                        background: route.priceFrom <= maxPrice * 0.4 ? '#22c55e' : route.priceFrom <= maxPrice * 0.7 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {t("prices.viewTrend")}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">{t("prices.noData")}</p>
          </div>
        )}
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
