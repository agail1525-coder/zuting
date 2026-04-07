import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { fetchPointsProducts, exchangeProduct, fetchMyExchanges, fetchMyMembership, type PointsProductItem, type PointsExchangeItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const CATEGORIES = ["", "COUPON", "DISCOUNT", "EXPERIENCE", "BADGE"];

export default function PointsMall() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<PointsProductItem[]>([]);
  const [exchanges, setExchanges] = useState<PointsExchangeItem[]>([]);
  const [points, setPoints] = useState(0);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exchanging, setExchanging] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const catLabels: Record<string, string> = {
    "": t("pointsMall.catAll"),
    COUPON: t("pointsMall.catCoupon"),
    DISCOUNT: t("pointsMall.catDiscount"),
    EXPERIENCE: t("pointsMall.catExperience"),
    BADGE: t("pointsMall.catBadge"),
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, mRes] = await Promise.all([
        fetchPointsProducts(category || undefined),
        fetchMyMembership().catch(() => ({ availablePoints: 0 })),
      ]);
      setProducts(pRes.items);
      setPoints((mRes as { availablePoints: number }).availablePoints);
    } catch {
      setError(t("pointsMall.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetchMyExchanges();
      setExchanges(res.items);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, [category]);

  const handleExchange = async (p: PointsProductItem) => {
    if (points < p.pointsCost) { toast.warning(t("pointsMall.insufficientPoints")); return; }
    setExchanging(p.id);
    try {
      await exchangeProduct(p.id);
      toast.success(t("pointsMall.exchangeSuccess", { name: p.name }));
      load();
    } catch {
      toast.error(t("pointsMall.exchangeFailed"));
    } finally {
      setExchanging(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("pointsMall.title")} />

      {/* Points header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 mx-4 mt-3 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-80">{t("pointsMall.availablePoints")}</p>
        <p className="text-4xl font-extrabold mt-1">{points}</p>
        <p className="text-xs opacity-60 mt-1">{t("pointsMall.subtitle")}</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`shrink-0 px-4 py-1.5 text-xs rounded-full ${category === c ? "bg-[var(--color-primary)] text-white" : "bg-white text-gray-600 shadow-sm"}`}>
            {catLabels[c] || c}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={load} /> : products.length === 0 ? <EmptyState message={t("pointsMall.noProducts")} /> : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-28 bg-gray-100 flex items-center justify-center">
                  {p.coverImage ? <img src={p.coverImage} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🎁</span>}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-[var(--color-primary)]">{p.pointsCost} <span className="text-xs font-normal">{t("pointsMall.points")}</span></span>
                    <span className="text-xs text-gray-400">{t("pointsMall.stock")}: {p.stock - p.soldCount}</span>
                  </div>
                  <button
                    onClick={() => handleExchange(p)}
                    disabled={exchanging === p.id || p.stock <= p.soldCount}
                    className="w-full mt-2 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary)] text-white disabled:bg-gray-300"
                  >
                    {p.stock <= p.soldCount ? t("pointsMall.soldOut") : exchanging === p.id ? t("pointsMall.exchanging") : t("pointsMall.exchangeNow")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History toggle */}
        <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }} className="w-full mt-4 py-2 text-sm text-[var(--color-primary)] bg-white rounded-xl shadow-sm">
          {showHistory ? t("common.collapse") : t("membership.pointsHistory")}
        </button>
        {showHistory && exchanges.length > 0 && (
          <div className="mt-2 space-y-2">
            {exchanges.map(e => (
              <div key={e.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900">{e.product.name}</p>
                  <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-medium text-gray-500">-{e.pointsSpent} {t("pointsMall.points")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
