"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";

export default function PricesPage() {
  const { t } = useTranslation();

  const TABS = [
    { label: t("prices.hub.calendar"), href: "/prices/calendar", desc: t("prices.hub.calendarDesc"), icon: "📅" },
    { label: t("prices.hub.compare"), href: "/prices/compare", desc: t("prices.hub.compareDesc"), icon: "⚖️" },
    { label: t("prices.hub.alerts"), href: "/prices/alerts", desc: t("prices.hub.alertsDesc"), icon: "🔔" },
    { label: t("prices.hub.trend"), href: "/prices/trend", desc: t("prices.hub.trendDesc"), icon: "📈" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("prices.hub.title")}</h1>
          <p className="text-gray-500 text-lg">
            {t("prices.hub.subtitle")}
          </p>
        </div>
      </section>

      {/* Tab Cards */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-[#0066FF]/40 transition-all"
            >
              <div className="text-4xl mb-4">{tab.icon}</div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-2">
                {tab.label}
              </h2>
              <p className="text-gray-500 text-sm">{tab.desc}</p>
              <div className="mt-4 text-[#0066FF] text-sm font-medium flex items-center gap-1">
                {t("prices.hub.viewNow")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick tips */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">{t("prices.hub.tipsTitle")}</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2"><span className="text-blue-400">·</span><span dangerouslySetInnerHTML={{ __html: t("prices.hub.tip1") }} /></li>
            <li className="flex gap-2"><span className="text-blue-400">·</span><span dangerouslySetInnerHTML={{ __html: t("prices.hub.tip2") }} /></li>
            <li className="flex gap-2"><span className="text-blue-400">·</span><span dangerouslySetInnerHTML={{ __html: t("prices.hub.tip3") }} /></li>
            <li className="flex gap-2"><span className="text-blue-400">·</span><span dangerouslySetInnerHTML={{ __html: t("prices.hub.tip4") }} /></li>
          </ul>
        </div>
      </section>
      <MobileNav />
    </main>
  );
}
