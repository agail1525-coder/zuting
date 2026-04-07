import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { fetchPromotions, type PromotionItem } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const TYPES = ["", "FLASH_SALE", "EARLY_BIRD", "DISCOUNT"];

function Countdown({ endAt }: { endAt: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setLeft("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);
  return <span className="font-mono text-sm text-red-500">{left}</span>;
}

export default function Promotions() {
  const { t } = useTranslation();
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPromotions(typeFilter || undefined);
      setItems(res.items);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter]);

  const typeLabel = (tp: string) => {
    const map: Record<string, string> = {
      "": t("promotion.all"),
      FLASH_SALE: t("promotion.flashSale"),
      EARLY_BIRD: t("promotion.earlyBird"),
      DISCOUNT: t("promotion.discount"),
    };
    return map[tp] ?? tp;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("promotion.title")} />

      {/* Type filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white sticky top-11 z-30">
        {TYPES.map(tp => (
          <button
            key={tp}
            onClick={() => setTypeFilter(tp)}
            className={`shrink-0 px-4 py-1.5 text-xs rounded-full transition ${typeFilter === tp ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {typeLabel(tp)}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? <EmptyState message={t("promotion.noPromotion")} /> : (
          <div className="space-y-4">
            {items.map(p => {
              const quotaPct = p.totalQuota > 0 ? Math.round((p.usedQuota / p.totalQuota) * 100) : 0;
              return (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {p.coverImage && (
                    <img src={p.coverImage} alt={p.name} className="w-full h-36 object-cover" loading="lazy" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{p.name}</h3>
                        {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                      </div>
                      <span className="shrink-0 ml-2 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">
                        {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `¥${p.discountValue}`}
                      </span>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <span>{t("promotion.ends")}</span>
                      <Countdown endAt={p.endAt} />
                    </div>

                    {/* Quota bar */}
                    {p.totalQuota > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{t("promotion.quota")}</span>
                          <span>{p.totalQuota - p.usedQuota}/{p.totalQuota}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all" style={{ width: `${quotaPct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
