"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import DataLoadError from "@/components/DataLoadError";
import type { Religion, HolySite, Temple, Patriarch } from "@/lib/api";

interface ReligionStat extends Religion {
  siteCount: number;
  templeCount: number;
  patriarchCount: number;
}

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  error: boolean;
}

export default function ReligionsClient({ religions, holySites, temples, patriarchs, error }: Props) {
  const { t } = useTranslation();

  const religionStats: ReligionStat[] = religions.map((r) => ({
    ...r,
    siteCount: holySites.filter((s) => s.religionId === r.id).length,
    templeCount: temples.filter((tp) => tp.religionId === r.id).length,
    patriarchCount: patriarchs.filter((p) => p.religionId === r.id).length,
  }));

  const totalSites = holySites.length;
  const totalTemples = temples.length;
  const totalPatriarchs = patriarchs.length;
  const totalCountries = [...new Set(holySites.map((s) => s.country).filter(Boolean))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-bg text-white pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">Twelve Great Faiths</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("religions.heroTitle")}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("religions.heroDesc")}
          </p>
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div>
              <p className="text-3xl font-bold">{religions.length}</p>
              <p className="text-blue-200 text-sm">{t("religions.statFaiths")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalSites}</p>
              <p className="text-blue-200 text-sm">{t("religions.statSites")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalTemples}</p>
              <p className="text-blue-200 text-sm">{t("religions.statTemples")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalPatriarchs}</p>
              <p className="text-blue-200 text-sm">{t("religions.statPatriarchs")}</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalCountries}</p>
              <p className="text-blue-200 text-sm">{t("religions.statCountries")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 -mt-10 relative z-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureCulture")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureCultureDesc")}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureNetwork")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureNetworkDesc", { countries: String(totalCountries), sites: String(totalSites) })}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t("religions.featureRoutes")}</h3>
              <p className="text-sm text-gray-500">{t("religions.featureRoutesDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Religion Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("religions.exploreTitle")}</h2>
            <p className="text-gray-500 text-sm mt-1">{t("religions.exploreDesc")}</p>
          </div>
          <Link href="/map" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium flex items-center gap-1">
            {t("religions.mapBrowse")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {error ? (
          <DataLoadError />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {religionStats.map((r) => (
              <Link key={r.id} href={`/religions/${r.slug}`}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
                  {r.symbol && (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {r.symbol}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">{r.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {r.siteCount > 0 && <span>{t("religions.countSites", { count: String(r.siteCount) })}</span>}
                    {r.templeCount > 0 && <span>{t("religions.countTemples", { count: String(r.templeCount) })}</span>}
                    {r.patriarchCount > 0 && <span>{t("religions.countPatriarchs", { count: String(r.patriarchCount) })}</span>}
                  </div>
                  <div
                    className="w-8 h-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: r.color || "#0066FF" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Religion Detail Table */}
      {religions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("religions.overviewTitle")}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-4 font-semibold text-gray-700">{t("religions.colFaith")}</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colSites")}</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colTemples")}</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">{t("religions.colPatriarchs")}</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {religionStats.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{r.symbol}</span>
                          <div>
                            <p className="font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-[#0066FF] font-medium text-xs">
                          {r.siteCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-medium text-xs">
                          {r.templeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium text-xs">
                          {r.patriarchCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/religions/${r.slug}`} className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium">
                          {t("religions.explore")} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ / Knowledge Section */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("religions.faqTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: t("religions.faq1Q"), a: t("religions.faq1A") },
            { q: t("religions.faq2Q"), a: t("religions.faq2A") },
            { q: t("religions.faq3Q"), a: t("religions.faq3A") },
            { q: t("religions.faq4Q"), a: t("religions.faq4A") },
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
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("religions.ctaTitle")}</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            {t("religions.ctaDesc")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/routes" className="px-8 py-3 bg-white text-[#0066FF] rounded-xl font-bold hover:bg-blue-50 transition-colors">
              {t("religions.ctaBrowseRoutes")}
            </Link>
            <Link href="/chat" className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
              {t("religions.ctaAiPlan")}
            </Link>
          </div>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
