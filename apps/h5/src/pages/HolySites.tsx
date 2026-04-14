import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import {
  fetchHolySites,
  fetchReligions,
  type HolySite,
  type Religion,
} from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function HolySites() {
  const { t } = useTranslation();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [sites, setSites] = useState<HolySite[]>([]);
  const [filterId, setFilterId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, s] = await Promise.all([
        fetchReligions(),
        fetchHolySites(filterId || undefined),
      ]);
      setReligions(r);
      setSites(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filterId]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          s.country.toLowerCase().includes(search.toLowerCase())
      )
    : sites;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#3264ff] to-[#0044CC] px-4 pt-8 pb-5 text-white">
        <h1 className="text-lg font-bold">{t("holySites.heroTitle")}</h1>
        <p className="text-xs text-white/70 mt-1">{t("holySites.heroSubtitle")}</p>
      </div>

      {/* Search */}
      <div className="px-4 -mt-4">
        <input
          className="w-full bg-white rounded-full px-4 py-2.5 text-sm shadow-md placeholder-gray-400 outline-none"
          placeholder={t("holySites.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Religion filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterId("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
            !filterId ? "bg-[#3264ff] text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {t("holySites.continent.all")}
        </button>
        {religions.map((r) => (
          <button
            key={r.id}
            onClick={() => setFilterId(r.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filterId === r.id ? "bg-[#3264ff] text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {r.symbol} {r.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏛️" message={t("holySites.emptyTitle")} />
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {t("holySites.foundResults", { count: String(filtered.length) })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((site) => (
                <Link
                  key={site.id}
                  to={`/holy-sites/${site.id}`}
                  className="rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  {site.imageUrl ? (
                    <img src={site.imageUrl} alt={site.name} loading="lazy" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl">⛩️</div>
                  )}
                  <div className="p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      {site.religion && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: site.religion.color || "#666" }}
                        >
                          {site.religion.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{site.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{site.country}</p>
                    {site.reviewStats && site.reviewStats.averageRating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-[#FF8800]">★ {site.reviewStats.averageRating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">({site.reviewStats.reviewCount} {t("holySites.reviews")})</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
