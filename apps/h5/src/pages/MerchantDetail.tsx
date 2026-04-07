import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchMerchantDetail, type Merchant } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function MerchantDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setData(await fetchMerchantDetail(id));
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !data) return <><PageHeader title="" /><ErrorState message={error} onRetry={load} /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={data.name} />

      {/* Header */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {data.logo ? <img src={data.logo} alt={data.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 truncate">{data.name}</h1>
              {data.status === "APPROVED" && (
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">{t("merchant.badge.verified")}</span>
              )}
            </div>
            <span className="text-xs text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">{t(`merchant.type.${data.type}`)}</span>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>★ {(data.rating ?? 0).toFixed(1)}</span>
              <span>{t("merchant.totalOrders")}: {data.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      {data.description && (
        <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">{t("merchant.overview")}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Services */}
      {data.services && data.services.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">{t("merchant.services")}</h3>
          <div className="space-y-3">
            {data.services.map(s => (
              <div key={s.id} className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {s.coverImage ? <img src={s.coverImage} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📋</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-[var(--color-primary)]">¥{s.price}</span>
                    {s.duration && <span className="text-xs text-gray-400">{s.duration}min</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{t("merchant.contact")}</h3>
        <div className="space-y-2 text-sm">
          {data.contactPhone && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("merchant.phone")}:</span>
              <a href={`tel:${data.contactPhone}`} className="text-[var(--color-primary)]">{data.contactPhone}</a>
            </div>
          )}
          {data.contactEmail && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("merchant.email")}:</span>
              <a href={`mailto:${data.contactEmail}`} className="text-[var(--color-primary)]">{data.contactEmail}</a>
            </div>
          )}
          {data.address && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t("merchant.address")}:</span>
              <span className="text-gray-700">{data.address}</span>
            </div>
          )}
          {(data.province || data.city) && (
            <p className="text-xs text-gray-400">{t("merchant.locatedAt", { province: data.province ?? "", city: data.city ?? "" })}</p>
          )}
        </div>
      </div>

      {/* Inquire CTA */}
      <div className="mx-4 mt-4 mb-6">
        <button
          onClick={() => {
            if (data.contactPhone) window.location.href = `tel:${data.contactPhone}`;
            else if (data.contactEmail) window.location.href = `mailto:${data.contactEmail}`;
          }}
          className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl"
        >
          {t("merchant.inquireNow")}
        </button>
      </div>
    </div>
  );
}
