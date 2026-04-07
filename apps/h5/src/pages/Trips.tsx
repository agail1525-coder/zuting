import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { fetchTrips, type Trip, type TripStatus } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const TABS: Array<{ key: string; status?: TripStatus }> = [
  { key: "all" },
  { key: "planning", status: "PLANNING" },
  { key: "confirmed", status: "CONFIRMED" },
  { key: "inProgress", status: "IN_PROGRESS" },
  { key: "completed", status: "COMPLETED" },
];

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PLANNING: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-indigo-100 text-indigo-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PREPARING: "bg-teal-100 text-teal-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDING: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-100 text-gray-500",
};

export default function Trips() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");

  const currentStatus = TABS.find((tb) => tb.key === tab)?.status;

  const load = () => {
    setLoading(true);
    setError("");
    fetchTrips({ status: currentStatus, limit: 50 })
      .then((res) => setTrips(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title={t("trips.pageTitle")} />
        <EmptyState icon="🔒" message={t("auth.login")} action={{ label: t("auth.loginSubmit"), onClick: () => (window.location.href = "/login") }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("trips.pageTitle")} />

      {/* Status tabs */}
      <div className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                tab === tb.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(`trips.tab.${tb.key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : trips.length === 0 ? (
          <EmptyState icon="✈️" message={t("trips.empty")} />
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="block bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 flex-1 line-clamp-1">{trip.title}</h3>
                  <span className={`ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[trip.status] || "bg-gray-100 text-gray-600"}`}>
                    {t(`trip.status.${trip.status}`)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {trip.startDate && (
                    <span>📅 {new Date(trip.startDate).toLocaleDateString()}{trip.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString()}` : ""}</span>
                  )}
                  {trip.sites.length > 0 && (
                    <span>📍 {trip.sites.length} {t("trips.siteCount")}</span>
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
