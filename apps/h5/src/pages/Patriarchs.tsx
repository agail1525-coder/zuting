import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchPatriarchs, fetchReligions, type Patriarch, type Religion } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function Patriarchs() {
  const { t } = useTranslation();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([]);
  const [filterId, setFilterId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, p] = await Promise.all([
        fetchReligions(),
        fetchPatriarchs(filterId || undefined),
      ]);
      setReligions(r);
      setPatriarchs(p);
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
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0044CC] px-4 pt-8 pb-5 text-white">
        <h1 className="text-lg font-bold">{t("nav.patriarchs")}</h1>
        <p className="text-xs text-white/70 mt-1">{t("religions.statPatriarchs")}</p>
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
            !filterId ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {t("holySites.continent.all")}
        </button>
        {religions.map((r) => (
          <button
            key={r.id}
            onClick={() => setFilterId(r.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
              filterId === r.id ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600"
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
        ) : patriarchs.length === 0 ? (
          <EmptyState icon="🧘" />
        ) : (
          <div className="space-y-3">
            {patriarchs.filter((p) => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || (p.nameEn || "").toLowerCase().includes(search.toLowerCase())).map((p) => (
              <Link
                key={p.id}
                to={`/patriarchs/${p.id}`}
                className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-50"
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-2xl flex-shrink-0">🧘</div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                  {p.nameEn && <p className="text-xs text-gray-500 mt-0.5">{p.nameEn}</p>}
                  {p.title && <p className="text-xs text-[#0066FF] mt-0.5">{p.title}</p>}
                  {p.dates && <p className="text-[10px] text-gray-400 mt-0.5">{p.dates}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.school && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{p.school}</span>}
                    {p.generation && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{p.generation}{t("patriarchDetail.lineage")}</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.coreTeaching}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
