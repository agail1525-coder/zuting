import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchSeals, type Seal, type SealSeries } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const SERIES: SealSeries[] = ["CHUYIN", "ZHONGYIN", "YINGUOYIN", "CHENGDAOYIN", "GUIYUANYIN"];

const seriesColors: Record<string, { bg: string; text: string; accent: string }> = {
  CHUYIN: { bg: "bg-cyan-50", text: "text-cyan-700", accent: "border-cyan-400" },
  ZHONGYIN: { bg: "bg-blue-50", text: "text-blue-700", accent: "border-blue-400" },
  YINGUOYIN: { bg: "bg-purple-50", text: "text-purple-700", accent: "border-purple-400" },
  CHENGDAOYIN: { bg: "bg-red-50", text: "text-red-700", accent: "border-red-400" },
  GUIYUANYIN: { bg: "bg-amber-50", text: "text-amber-700", accent: "border-amber-400" },
};

export default function Seals() {
  const { t } = useTranslation();
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [series, setSeries] = useState<SealSeries>("CHUYIN");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchSeals(series)
      .then(setSeals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [series]);

  const retry = () => {
    setLoading(true);
    setError("");
    fetchSeals(series)
      .then(setSeals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const colors = seriesColors[series] || seriesColors.CHUYIN;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("nav.seals")} />

      {/* Series tabs */}
      <div className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {SERIES.map((s) => {
            const sc = seriesColors[s];
            return (
              <button
                key={s}
                onClick={() => setSeries(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition border ${
                  series === s ? `${sc.bg} ${sc.text} ${sc.accent}` : "border-gray-200 text-gray-500"
                }`}
              >
                {t(`seal.series.${s}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : seals.length === 0 ? (
          <EmptyState icon="🔮" message={t("common.noData")} />
        ) : (
          <div className="space-y-3">
            {seals.map((seal) => (
              <Link
                key={seal.id}
                to={`/seals/${seal.id}`}
                className={`block rounded-xl p-4 shadow-sm border-l-4 ${colors.accent} ${colors.bg}`}
              >
                <h3 className={`font-bold text-base ${colors.text}`}>{seal.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seal.poem}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
