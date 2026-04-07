import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import {
  fetchReligions,
  fetchHolySites,
  fetchFeaturedRoutes,
  fetchHomepageRecommendations,
  type Religion,
  type HolySite,
  type Route,
  type RecommendationItem,
} from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [religions, setReligions] = useState<Religion[]>([]);
  const [sites, setSites] = useState<HolySite[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [r, s, rt, rec] = await Promise.allSettled([
          fetchReligions(),
          fetchHolySites(),
          fetchFeaturedRoutes(6),
          fetchHomepageRecommendations(8),
        ]);
        if (cancelled) return;
        let anySuccess = false;
        if (r.status === "fulfilled") { setReligions(Array.isArray(r.value) ? r.value : []); anySuccess = true; }
        if (s.status === "fulfilled") { setSites((Array.isArray(s.value) ? s.value : []).slice(0, 8)); anySuccess = true; }
        if (rt.status === "fulfilled") { setRoutes(Array.isArray(rt.value) ? rt.value : []); anySuccess = true; }
        if (rec.status === "fulfilled") { setRecommendations(Array.isArray(rec.value?.items) ? rec.value.items : []); anySuccess = true; }
        if (!anySuccess) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorState message={t("common.error")} onRetry={() => window.location.reload()} />;

  return (
    <div className="pb-6">
      {/* Hero search */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0044CC] px-4 pt-10 pb-8 text-white">
        <h1 className="text-xl font-bold mb-1">{t("home.hero.title")}</h1>
        <p className="text-xs text-white/70 mb-5">{t("home.hero.subtitle")}</p>
        <div className="flex bg-white rounded-full overflow-hidden">
          <input
            className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
            placeholder={t("home.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 text-[#0066FF] font-medium text-sm"
          >
            {t("home.search")}
          </button>
        </div>
        {/* Stats */}
        <div className="flex justify-between mt-5 text-center">
          {[
            { n: "12", l: t("home.statTraditions") },
            { n: "60+", l: t("home.statSites") },
            { n: "10", l: t("home.statRoutes") },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-lg font-bold">{s.n}</div>
              <div className="text-[10px] text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured routes - horizontal scroll */}
      {routes.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-bold text-base text-gray-900">{t("home.featuredRoutes")}</h2>
            <Link to="/routes" className="text-xs text-[#0066FF]">{t("home.viewAll")}</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {routes.map((r) => (
              <Link
                key={r.id}
                to={`/routes/${r.slug}`}
                className="flex-shrink-0 w-56 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                {r.coverImage ? (
                  <img src={r.coverImage} alt={r.title} loading="lazy" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl">🗺️</div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{r.duration}{t("home.days")} · {r.difficulty}</p>
                  {r.priceFrom > 0 && (
                    <p className="text-sm font-bold text-[#FF6600] mt-1">¥{r.priceFrom.toLocaleString()}<span className="text-xs font-normal text-gray-400">{t("home.perPerson")}</span></p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Religion categories */}
      {religions.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="font-bold text-base text-gray-900 mb-3">{t("home.traditions")}</h2>
          <div className="grid grid-cols-4 gap-3">
            {religions.slice(0, 8).map((r) => (
              <Link
                key={r.id}
                to={`/religions/${r.slug}`}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: (r.color || "#0066FF") + "18" }}
                >
                  {r.symbol || "🕊️"}
                </div>
                <span className="text-xs text-gray-700 text-center line-clamp-1">{r.name}</span>
              </Link>
            ))}
          </div>
          {religions.length > 8 && (
            <Link to="/religions" className="block text-center text-xs text-[#0066FF] mt-3">{t("home.viewAll")}</Link>
          )}
        </section>
      )}

      {/* Popular holy sites */}
      {sites.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-gray-900">{t("home.popularDest")}</h2>
            <Link to="/holy-sites" className="text-xs text-[#0066FF]">{t("home.viewAll")}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sites.map((s) => (
              <Link key={s.id} to={`/holy-sites/${s.id}`} className="rounded-xl overflow-hidden bg-white shadow-sm">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} loading="lazy" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-2xl">⛩️</div>
                )}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{s.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{s.country}</p>
                  {s.reviewStats && s.reviewStats.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-[#FF8800]">★ {s.reviewStats.averageRating.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-400">({s.reviewStats.reviewCount})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="font-bold text-base text-gray-900 mb-3">{t("home.popularDestDesc")}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recommendations.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.type === "holy-site" ? `/holy-sites/${item.id}` : item.type === "temple" ? `/temples/${item.id}` : `/religions/${item.id}`}
                className="flex-shrink-0 w-36 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-xl">📍</div>
                )}
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.religionName}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Planning CTA */}
      <section className="mt-6 mx-4 bg-gradient-to-r from-[#0066FF] to-[#4488FF] rounded-xl p-4 text-white">
        <h3 className="font-bold text-sm mb-1">{t("home.aiPlanTitle")}</h3>
        <p className="text-xs text-white/80 mb-3">{t("home.aiDesc")}</p>
        <Link to="/chat" className="inline-block bg-white text-[#0066FF] text-xs font-semibold px-4 py-2 rounded-full">
          {t("home.startAI")}
        </Link>
      </section>
    </div>
  );
}
