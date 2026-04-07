import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchRoutes, type Route } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const CATEGORIES = ["all", "zen", "buddhist", "taoist", "christian", "islamic", "crossCultural", "hindu", "jewish", "culturalHeritage"];
const DIFFICULTIES = ["all", "easy", "moderate", "challenging"];

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  challenging: "bg-red-100 text-red-700",
};

export default function RoutesList() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchRoutes({
      category: category === "all" ? undefined : category.toUpperCase(),
      difficulty: difficulty === "all" ? undefined : difficulty.toUpperCase(),
      pageSize: 50,
    })
      .then((res) => setRoutes(Array.isArray(res.items) ? res.items : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, difficulty]);

  const retry = () => window.location.reload();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("nav.routes")} />

      {/* Category tabs */}
      <div className="overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                category === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(`routes.category.${c}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              difficulty === d ? "border-blue-500 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"
            }`}
          >
            {t(`routes.difficulty.${d}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : routes.length === 0 ? (
          <EmptyState icon="🗺️" message={t("routes.empty.title")} />
        ) : (
          <div className="space-y-3">
            {routes.map((r) => (
              <Link key={r.id} to={`/routes/${r.slug}`} className="block bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="relative h-40">
                  {r.coverImage ? (
                    <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl">🗺️</div>
                  )}
                  {r.difficulty && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold rounded ${difficultyColor[r.difficulty.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                      {t(`routes.difficulty.${r.difficulty.toLowerCase()}`)}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("routes.card.daysNights", { days: String(r.duration), nights: String(r.nights) })}
                    {r.reviewCount > 0 && ` · ${t("routes.card.reviewCount", { count: String(r.reviewCount) })}`}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      {r.rating != null && r.rating > 0 && (
                        <span className="text-xs font-bold text-amber-500">★ {r.rating.toFixed(1)}</span>
                      )}
                      {r.bookCount > 0 && (
                        <span className="text-[10px] text-gray-400">{t("routes.card.departed", { count: String(r.bookCount) })}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400">{t("routes.card.priceFrom")}</span>
                      <span className="text-base font-bold text-orange-600 ml-1">¥{r.priceFrom}</span>
                      <span className="text-[10px] text-gray-400">{t("routes.card.perPerson")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
