import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchTemples, fetchReligions, type Temple, type Religion } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function Temples() {
  const { t } = useTranslation();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [filterId, setFilterId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, tList] = await Promise.all([
        fetchReligions(),
        fetchTemples(filterId || undefined),
      ]);
      setReligions(r);
      setTemples(tList);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filterId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#3264ff] to-[#0044CC] px-4 pt-8 pb-5 text-white">
        <h1 className="text-lg font-bold">{t("nav.temples")}</h1>
        <p className="text-xs text-white/70 mt-1">{t("religions.statTemples")}</p>
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

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterId("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            !filterId ? "bg-[#3264ff] text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {t("holySites.continent.all")}
        </button>
        {religions.map((r) => (
          <button
            key={r.id}
            onClick={() => setFilterId(r.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
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
        ) : temples.length === 0 ? (
          <EmptyState icon="🏯" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {temples.filter((tm) => !search.trim() || tm.name.toLowerCase().includes(search.toLowerCase()) || (tm.nameEn || "").toLowerCase().includes(search.toLowerCase()) || tm.country.toLowerCase().includes(search.toLowerCase())).map((tm) => (
              <Link
                key={tm.id}
                to={`/temples/${tm.id}`}
                className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-50"
              >
                {tm.imageUrl ? (
                  <img src={tm.imageUrl} alt={tm.name} loading="lazy" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-2xl">🏯</div>
                )}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{tm.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{tm.country}</p>
                  {tm.foundingDate && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{t("templeDetail.foundedIn")} {tm.foundingDate}</p>
                  )}
                  {tm.religion && (
                    <span
                      className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: tm.religion.color || "#666" }}
                    >
                      {tm.religion.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
