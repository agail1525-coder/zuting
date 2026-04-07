import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchTrip, transitionTrip, type TripDetail as TripDetailType } from "@/lib/api";
import { toast } from "@/lib/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import PageHeader from "@/components/PageHeader";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", PLANNING: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700", PAID: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700", COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-600", REFUNDING: "bg-orange-100 text-orange-700",
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { t } = useTranslation();
  const [trip, setTrip] = useState<TripDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    fetchTrip(id).then(setTrip).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleAction = async (action: string) => {
    if (!id || acting) return;
    setActing(true);
    try {
      const updated = await transitionTrip(id, action);
      setTrip(updated);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("orders.actionFailed"));
    } finally {
      setActing(false);
    }
  };

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !trip) return <><PageHeader title="" /><ErrorState message={error} onRetry={load} /></>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title={trip.title} />

      {/* Status & dates */}
      <div className="px-4 pt-4">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[trip.status] || "bg-gray-100 text-gray-600"}`}>
          {t(`trip.status.${trip.status}`)}
        </span>
        {trip.startDate && (
          <p className="text-xs text-gray-500 mt-2">
            📅 {new Date(trip.startDate).toLocaleDateString()}
            {trip.endDate && ` — ${new Date(trip.endDate).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Sites */}
      {trip.sites.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">📍 {t("checkout.holySites")} ({trip.sites.length})</h2>
          <div className="space-y-2">
            {trip.sites.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                {s.site.imageUrl && <img src={s.site.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.site.name}</p>
                  <p className="text-xs text-gray-400">{s.site.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status history */}
      {trip.statusHistory.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">{t("orders.statusTimeline")}</h2>
          <div className="space-y-0 border-l-2 border-gray-200 ml-2">
            {trip.statusHistory.map((h) => (
              <div key={h.id} className="pl-4 pb-3 relative">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-xs font-medium text-gray-700">{t(`trip.status.${h.toStatus}`)}</p>
                <p className="text-[10px] text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
                {h.reason && <p className="text-[10px] text-gray-500 mt-0.5">{h.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {trip.orders.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">{t("orders.pageTitle")}</h2>
          {trip.orders.map((o) => (
            <div key={o.id} className="bg-white rounded-lg p-3 mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-600">{o.orderNo}</p>
                <p className="text-sm font-bold text-gray-900">¥{o.totalAmount}</p>
              </div>
              <span className="text-xs text-gray-500">{t(`order.status.${o.status}`)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {trip.availableActions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2 z-50">
          {trip.availableActions.map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              disabled={acting}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full disabled:opacity-50 active:bg-blue-700"
            >
              {acting ? "..." : t(`trip.action.${action}`)}
            </button>
          ))}
          {trip.status === "CONFIRMED" && (
            <button
              onClick={() => nav(`/checkout/${trip.id}?type=trip`)}
              className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-full active:bg-orange-600"
            >
              {t("trips.goToPay")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
