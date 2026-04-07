import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { fetchAvailableCoupons, fetchMyCoupons, claimCoupon, type CouponItem, type UserCouponItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

type Tab = "available" | "mine";
type MineStatus = "active" | "used" | "expired";

export default function Coupons() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("available");
  const [available, setAvailable] = useState<CouponItem[]>([]);
  const [mine, setMine] = useState<UserCouponItem[]>([]);
  const [mineStatus, setMineStatus] = useState<MineStatus>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "available") {
        const res = await fetchAvailableCoupons();
        setAvailable(res.items);
      } else {
        const res = await fetchMyCoupons(mineStatus);
        setMine(res.items);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab, mineStatus]);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    try {
      await claimCoupon(id);
      load();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString();

  const typeBadge = (type: string) => {
    const map: Record<string, string> = { PERCENTAGE: "%", FIXED: "$", FREE_SHIPPING: "🚚" };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("coupon.center")} />

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white sticky top-11 z-30">
        {(["available", "mine"] as Tab[]).map(tb => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${tab === tb ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-gray-500"}`}
          >
            {tb === "available" ? t("coupon.available") : t("coupon.mine")}
          </button>
        ))}
      </div>

      {/* Mine sub-tabs */}
      {tab === "mine" && (
        <div className="flex gap-2 px-4 py-2 bg-white">
          {(["active", "used", "expired"] as MineStatus[]).map(s => (
            <button key={s} onClick={() => setMineStatus(s)} className={`px-3 py-1 text-xs rounded-full ${mineStatus === s ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-600"}`}>
              {s === "active" ? t("coupon.available") : s === "used" ? t("coupon.used") : t("coupon.expiringSoon")}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <>
            {tab === "available" && (
              available.length === 0 ? <EmptyState message={t("coupon.noAvailable")} /> : (
                <div className="space-y-3">
                  {available.map(c => (
                    <div key={c.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex">
                      <div className="w-24 bg-gradient-to-b from-red-500 to-red-600 flex flex-col items-center justify-center text-white p-2">
                        <span className="text-xs">{typeBadge(c.type)}</span>
                        <span className="text-2xl font-bold">{c.value}{c.type === "PERCENTAGE" ? "%" : ""}</span>
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{c.name}</p>
                          {c.minAmount && <p className="text-xs text-gray-400 mt-0.5">{t("common.startingPrice")} {c.minAmount}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{formatDate(c.endAt)}</span>
                          <button
                            onClick={() => handleClaim(c.id)}
                            disabled={claiming === c.id || c.usedCount >= c.totalCount}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-red-500 text-white disabled:bg-gray-300"
                          >
                            {c.usedCount >= c.totalCount ? t("coupon.full") : claiming === c.id ? "..." : t("coupon.claim")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {tab === "mine" && (
              mine.length === 0 ? <EmptyState message={t("coupon.noMine")} /> : (
                <div className="space-y-3">
                  {mine.map(uc => (
                    <div key={uc.id} className={`bg-white rounded-xl overflow-hidden shadow-sm flex ${uc.status !== "active" ? "opacity-50" : ""}`}>
                      <div className="w-24 bg-gradient-to-b from-orange-400 to-orange-500 flex flex-col items-center justify-center text-white p-2">
                        <span className="text-2xl font-bold">{uc.coupon.value}{uc.coupon.type === "PERCENTAGE" ? "%" : ""}</span>
                      </div>
                      <div className="flex-1 p-3">
                        <p className="font-medium text-sm text-gray-900">{uc.coupon.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(uc.coupon.endAt)}</p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${uc.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {uc.status === "active" ? t("coupon.use") : uc.status === "used" ? t("coupon.used") : t("coupon.expiringSoon")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
