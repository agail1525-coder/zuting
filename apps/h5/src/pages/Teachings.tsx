import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchTeachings, fetchReligions, type Teaching, type Religion } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function Teachings() {
  const { t } = useTranslation();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [filterId, setFilterId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, tc] = await Promise.all([
        fetchReligions(),
        fetchTeachings(filterId || undefined),
      ]);
      setReligions(r);
      setTeachings(tc);
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
        <h1 className="text-lg font-bold">{t("nav.teachings")}</h1>
        <p className="text-xs text-white/70 mt-1">{t("teaching.title")}</p>
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
        ) : teachings.length === 0 ? (
          <EmptyState icon="📜" />
        ) : (
          <div className="space-y-3">
            {teachings.filter((tc) => !search.trim() || tc.name.toLowerCase().includes(search.toLowerCase()) || tc.originalText.toLowerCase().includes(search.toLowerCase())).map((tc) => (
              <Link
                key={tc.id}
                to={`/teachings/${tc.id}`}
                className="block p-4 bg-white rounded-xl shadow-sm border border-gray-50"
              >
                <div className="flex items-center gap-2 mb-2">
                  {tc.religion && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: tc.religion.color || "#666" }}
                    >
                      {tc.religion.name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{tc.name}</h3>
                <p className="text-sm text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{tc.originalText}</p>
                {tc.sourceText && (
                  <p className="text-xs text-gray-400 mt-2">— {tc.sourceText}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
