import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchMerchants, type Merchant } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const TYPES = ["", "RESTAURANT", "HOTEL", "GUIDE", "TRANSPORT", "TEMPLE_SERVICE", "SHOPPING", "PHOTOGRAPHY", "WELLNESS", "CULTURAL_EXPERIENCE"];

export default function Merchants() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [items, setItems] = useState<Merchant[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMerchants({ type: typeFilter || undefined });
      setItems(res.items);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("merchant.title")} />

      {/* Subtitle */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-gray-500">{t("merchant.subtitle")}</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {TYPES.map(tp => (
          <button key={tp} onClick={() => setTypeFilter(tp)} className={`shrink-0 px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${typeFilter === tp ? "bg-[var(--color-primary)] text-white" : "bg-white text-gray-600 shadow-sm"}`}>
            {tp === "" ? t("merchant.allTypes") : t(`merchant.type.${tp}`)}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? <EmptyState message={t("merchant.noResults")} /> : (
          <div className="space-y-3">
            {items.map(m => (
              <button key={m.id} onClick={() => nav(`/merchants/${m.id}`)} className="w-full bg-white rounded-xl p-4 flex gap-3 shadow-sm text-left">
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {m.logo ? <img src={m.logo} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🏪</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{m.name}</h3>
                    {m.status === "APPROVED" && (
                      <span className="shrink-0 text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{t("merchant.badge.verified")}</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-primary)] bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">{t(`merchant.type.${m.type}`)}</span>
                  {m.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>★ {(m.rating ?? 0).toFixed(1)}</span>
                    <span>{t("merchant.totalOrders")}: {m.totalOrders}</span>
                    {m.city && <span>{m.city}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
