"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import OptimizedImage from "@/components/OptimizedImage";
import { useTranslation } from "@/lib/i18n";
import { fetchHolySites, fetchRoutes, type HolySite, type Route } from "@/lib/api";

type RankType = "sites" | "routes";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingsClient() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<RankType>("sites");
  const [sites, setSites] = useState<HolySite[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (tab === "sites") {
      fetchHolySites()
        .then((data) => {
          const sorted = [...data].sort((a, b) => (b.name > a.name ? -1 : 1));
          setSites(sorted.slice(0, 20));
        })
        .catch(() => setError(t("rankings.loadError")))
        .finally(() => setLoading(false));
    } else {
      fetchRoutes({ sort: "rating", pageSize: 20 })
        .then((data) => setRoutes(data.items))
        .catch(() => setError(t("rankings.loadError")))
        .finally(() => setLoading(false));
    }
  }, [tab, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-b from-amber-50 to-gray-50 py-12 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            {t("rankings.title")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("rankings.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit mx-auto">
            {([
              { key: "sites" as RankType, label: t("rankings.bestSites") },
              { key: "routes" as RankType, label: t("rankings.bestRoutes") },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-[#0066FF] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-gray-500">{error}</p>
              <button
                onClick={() => { setLoading(true); setError(null); }}
                className="mt-4 px-4 py-2 bg-[#0066FF] text-white rounded-lg text-sm hover:bg-[#0052CC]"
              >
                {t("rankings.retry")}
              </button>
            </div>
          ) : (tab === "sites" && sites.length === 0) || (tab === "routes" && routes.length === 0) ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🏛️</p>
              <p className="text-gray-500">{t("rankings.empty")}</p>
            </div>
          ) : tab === "sites" ? (
            <div className="space-y-3">
              {sites.map((site, i) => (
                <Link
                  key={site.id}
                  href={`/holy-sites/${site.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 flex items-center justify-center text-xl font-bold shrink-0">
                    {i < 3 ? MEDALS[i] : (
                      <span className="text-gray-400 text-lg">#{i + 1}</span>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {site.imageUrl ? (
                      <OptimizedImage src={site.imageUrl} alt={site.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {site.religion?.symbol || "🕌"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-[#0066FF] transition-colors truncate">
                      {site.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {site.country} · {site.religion?.name}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route, i) => (
                <Link
                  key={route.id}
                  href={`/routes/${route.slug ?? route.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 flex items-center justify-center text-xl font-bold shrink-0">
                    {i < 3 ? MEDALS[i] : (
                      <span className="text-gray-400 text-lg">#{i + 1}</span>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    {route.coverImage ? (
                      <OptimizedImage src={route.coverImage} alt={route.title} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🛤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-[#0066FF] transition-colors truncate">
                      {route.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span>{route.duration}{t("rankings.days")}{route.nights}{t("rankings.nights")}</span>
                      {route.rating && (
                        <span className="text-amber-500">★ {route.rating.toFixed(1)}</span>
                      )}
                      <span>¥{(route.priceFrom / 100).toLocaleString()}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
