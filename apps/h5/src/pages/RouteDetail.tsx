import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchRouteBySlug, type Route } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import PageHeader from "@/components/PageHeader";

export default function RouteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const { t } = useTranslation();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDay, setOpenDay] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchRouteBySlug(slug)
      .then(setRoute)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !route) return <><PageHeader title="" /><ErrorState message={error} onRetry={() => window.location.reload()} /></>;

  const stats = [
    { label: t("routeDetail.duration"), value: `${route.duration}${t("routeDetail.days")}${route.nights}${t("routeDetail.nights")}` },
    { label: t("routeDetail.groupSize"), value: route.groupSize },
    { label: t("routeDetail.bestSeason"), value: route.season },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title={route.title} transparent />

      {/* Hero gallery */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {(route.images.length > 0 ? route.images : [route.coverImage]).filter(Boolean).map((img, i) => (
            <img key={i} src={img!} alt="" className="h-56 w-80 object-cover first:rounded-bl-none last:rounded-br-none" />
          ))}
        </div>
      </div>

      {/* Title & badges */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">{t(`routes.category.${route.category?.toLowerCase()}`)}</span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">{t(`routes.difficulty.${route.difficulty?.toLowerCase()}`)}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{route.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{route.subtitle}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rating & bookings */}
      <div className="flex items-center gap-4 px-4 mt-3">
        {route.rating != null && route.rating > 0 && (
          <span className="text-sm font-bold text-amber-500">★ {route.rating.toFixed(1)} <span className="text-gray-400 font-normal text-xs">({route.reviewCount})</span></span>
        )}
        {route.bookCount > 0 && (
          <span className="text-xs text-gray-400">{t("routeDetail.weekBookings", { count: String(route.bookCount) })}</span>
        )}
      </div>

      {/* Highlights */}
      {route.highlights.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {route.highlights.map((h, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{h}</span>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary accordion */}
      {route.itinerary.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">{t("routeDetail.dailyItinerary")}</h2>
          <div className="space-y-2">
            {route.itinerary.map((day, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-100">
                <button
                  onClick={() => setOpenDay(openDay === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    <span className="text-blue-600 mr-2">{t("routes.card.dayLabel", { day: String(day.day) })}</span>
                    {day.title}
                  </span>
                  <span className="text-gray-400 text-xs">{openDay === i ? "▲" : "▼"}</span>
                </button>
                {openDay === i && (
                  <div className="px-4 pb-3 text-xs text-gray-600 space-y-1 border-t border-gray-50">
                    {(day.activities ?? []).map((a, j) => (
                      <p key={j} className="flex items-start gap-2 mt-1"><span className="text-blue-400">•</span>{a}</p>
                    ))}
                    {day.meals && day.meals.length > 0 && (
                      <p className="text-gray-400 mt-1">🍽️ {day.meals.join(" · ")}</p>
                    )}
                    {day.accommodation && <p className="text-gray-400">🏨 {day.accommodation}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Included / Excluded */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">{t("routeDetail.included")}</h3>
          {route.included.map((item, i) => (
            <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5 mb-1"><span className="text-green-500">✓</span>{item}</p>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">{t("routeDetail.excluded")}</h3>
          {route.excluded.map((item, i) => (
            <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5 mb-1"><span className="text-red-400">✗</span>{item}</p>
          ))}
        </div>
      </div>

      {/* Tips */}
      {route.tips.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2">{t("routeDetail.travelTips")}</h2>
          <div className="bg-amber-50 rounded-lg p-3 space-y-1">
            {route.tips.map((tip, i) => (
              <p key={i} className="text-xs text-amber-800 flex items-start gap-1.5"><span>💡</span>{tip}</p>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-[10px] text-gray-400">{t("routeDetail.startingPrice")}</span>
          <span className="text-xl font-bold text-orange-600 ml-1">¥{route.priceFrom}</span>
          <span className="text-[10px] text-gray-400">{t("routeDetail.perPerson")}</span>
        </div>
        <button
          onClick={() => nav(`/checkout/${slug}`)}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full active:bg-blue-700 transition"
        >
          {t("routeDetail.bookNow")}
        </button>
      </div>
    </div>
  );
}
