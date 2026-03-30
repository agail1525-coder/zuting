"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchAvailableCoupons,
  fetchMyCoupons,
  claimCoupon,
  type CouponItem,
  type UserCouponItem,
} from "@/lib/api";

type TabKey = "available" | "mine" | "used";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isExpiringSoon(endAt: string): boolean {
  const diff = new Date(endAt).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

interface AvailableCouponCardProps {
  coupon: CouponItem;
  onClaim: (id: string) => void;
  claiming: boolean;
  claimed: boolean;
}

function AvailableCouponCard({ coupon, onClaim, claiming, claimed }: AvailableCouponCardProps) {
  const { t } = useTranslation();
  const isFixed = coupon.type === "FIXED" || coupon.type === "fixed";
  const accentColor = isFixed ? "#EF4444" : "#3B82F6";
  const bgLight = isFixed ? "bg-red-50" : "bg-blue-50";
  const textAccent = isFixed ? "text-red-500" : "text-blue-500";
  const borderAccent = isFixed ? "border-red-100" : "border-blue-100";
  const expiring = isExpiringSoon(coupon.endAt);
  const isFull = coupon.usedCount >= coupon.totalCount;

  return (
    <div
      className={`flex rounded-xl border ${borderAccent} overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isFull ? "opacity-60" : ""
      }`}
    >
      {/* Left accent strip */}
      <div
        className="w-3 shrink-0"
        style={{ backgroundColor: accentColor }}
      />
      {/* Content */}
      <div className={`flex-1 p-4 ${bgLight}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Amount */}
            <div className="flex items-baseline gap-1 mb-1">
              {isFixed ? (
                <>
                  <span className={`text-xs ${textAccent}`}>¥</span>
                  <span className={`text-2xl font-bold ${textAccent}`}>
                    {(coupon.value / 100).toFixed(0)}
                  </span>
                  <span className={`text-xs ${textAccent}`}>{t("coupons.fixedUnit")}</span>
                </>
              ) : (
                <>
                  <span className={`text-2xl font-bold ${textAccent}`}>
                    {coupon.value}
                  </span>
                  <span className={`text-xs ${textAccent}`}>{t("coupons.percentUnit")}</span>
                </>
              )}
            </div>
            {/* Name */}
            <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{coupon.name}</p>
            {/* Condition */}
            {coupon.minAmount != null && (
              <p className="text-xs text-gray-500">
                {t("coupons.minSpend", { min: (coupon.minAmount / 100).toFixed(0) })}
              </p>
            )}
            {/* Expiry */}
            <p className={`text-xs mt-1 ${expiring ? "text-orange-500 font-medium" : "text-gray-400"}`}>
              {expiring ? t("coupons.expiringSoon") : ""}{t("coupons.validUntil", { date: formatDate(coupon.endAt) })}
            </p>
            {/* Quota */}
            <p className="text-xs text-gray-400 mt-0.5">
              {t("coupons.quotaClaimed", { used: coupon.usedCount, total: coupon.totalCount })}
            </p>
          </div>
          {/* Claim button */}
          <button
            onClick={() => onClaim(coupon.id)}
            disabled={claiming || claimed || isFull}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              claimed
                ? "bg-gray-100 text-gray-400 cursor-default"
                : isFull
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : `text-white hover:opacity-90 disabled:opacity-60`
            }`}
            style={{
              backgroundColor: claimed || isFull ? undefined : accentColor,
            }}
          >
            {claimed ? t("coupons.claimed") : isFull ? t("coupons.soldOut") : claiming ? t("coupons.claiming") : t("coupons.claimNow")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MyCouponCardProps {
  userCoupon: UserCouponItem;
  used?: boolean;
}

function MyCouponCard({ userCoupon, used }: MyCouponCardProps) {
  const { t } = useTranslation();
  const { coupon } = userCoupon;
  const isFixed = coupon.type === "FIXED" || coupon.type === "fixed";
  const accentColor = used ? "#9CA3AF" : isFixed ? "#EF4444" : "#3B82F6";
  const bgLight = used ? "bg-gray-50" : isFixed ? "bg-red-50" : "bg-blue-50";
  const textAccent = used ? "text-gray-400" : isFixed ? "text-red-500" : "text-blue-500";
  const borderAccent = used ? "border-gray-200" : isFixed ? "border-red-100" : "border-blue-100";

  return (
    <div
      className={`flex rounded-xl border ${borderAccent} overflow-hidden shadow-sm ${
        used ? "opacity-70" : "hover:shadow-md transition-shadow"
      }`}
    >
      {/* Left accent strip */}
      <div className="w-3 shrink-0" style={{ backgroundColor: accentColor }} />
      {/* Content */}
      <div className={`flex-1 p-4 ${bgLight}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1 mb-1">
              {isFixed ? (
                <>
                  <span className={`text-xs ${textAccent}`}>¥</span>
                  <span className={`text-2xl font-bold ${textAccent}`}>
                    {(coupon.value / 100).toFixed(0)}
                  </span>
                  <span className={`text-xs ${textAccent}`}>{t("coupons.fixedUnit")}</span>
                </>
              ) : (
                <>
                  <span className={`text-2xl font-bold ${textAccent}`}>{coupon.value}</span>
                  <span className={`text-xs ${textAccent}`}>{t("coupons.percentUnit")}</span>
                </>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{coupon.name}</p>
            {coupon.minAmount != null && (
              <p className="text-xs text-gray-500">
                {t("coupons.minSpend", { min: (coupon.minAmount / 100).toFixed(0) })}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {t("coupons.validUntil", { date: formatDate(coupon.endAt) })}
            </p>
            {used && userCoupon.usedAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {t("coupons.usedAt", { date: formatDate(userCoupon.usedAt) })}
              </p>
            )}
          </div>
          {/* Status / Use button */}
          {used ? (
            <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 text-gray-500">
              {t("coupons.statusUsed")}
            </span>
          ) : (
            <a
              href="/trips"
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {t("coupons.goUse")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCouponItem[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<UserCouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set());
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadAvailable = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAvailableCoupons(1);
      setAvailableCoupons(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("coupons.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadMyCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [available, used] = await Promise.all([
        fetchMyCoupons("AVAILABLE", 1),
        fetchMyCoupons("USED", 1),
      ]);
      setMyCoupons(Array.isArray(available.items) ? available.items : []);
      setUsedCoupons(Array.isArray(used.items) ? used.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("coupons.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "available") {
      loadAvailable();
    } else {
      loadMyCoupons();
    }
  }, [activeTab, user, loadAvailable, loadMyCoupons]);

  const handleClaim = useCallback(
    async (couponId: string) => {
      setClaimingIds((prev) => new Set(prev).add(couponId));
      try {
        await claimCoupon(couponId);
        setClaimedIds((prev) => new Set(prev).add(couponId));
        // Refresh my coupons in background
        fetchMyCoupons("AVAILABLE", 1)
          .then((d) => setMyCoupons(Array.isArray(d.items) ? d.items : []))
          .catch((err) => { console.error('Refresh my coupons failed:', err); });
      } catch (err) {
        setError(err instanceof Error ? err.message : t("coupons.claimError"));
      } finally {
        setClaimingIds((prev) => {
          const next = new Set(prev);
          next.delete(couponId);
          return next;
        });
      }
    },
    []
  );

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "available", label: t("coupons.tabAvailable") },
    { key: "mine", label: t("coupons.tabMine"), count: myCoupons.length || undefined },
    { key: "used", label: t("coupons.tabUsed"), count: usedCoupons.length || undefined },
  ];

  const currentList =
    activeTab === "available"
      ? availableCoupons
      : activeTab === "mine"
      ? myCoupons
      : usedCoupons;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t("nav.coupons")}
        </h1>
        <p className="text-gray-500 text-sm">{t("coupons.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#0066FF] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-[#0066FF] text-white rounded-full px-1.5 py-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("common.loading")}</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🎫</div>
          <p className="text-gray-500 text-sm">
            {activeTab === "available"
              ? t("coupons.emptyAvailable")
              : activeTab === "mine"
              ? t("coupons.emptyMine")
              : t("coupons.emptyUsed")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "available" &&
            (currentList as CouponItem[]).map((coupon) => (
              <AvailableCouponCard
                key={coupon.id}
                coupon={coupon}
                onClaim={handleClaim}
                claiming={claimingIds.has(coupon.id)}
                claimed={claimedIds.has(coupon.id)}
              />
            ))}
          {activeTab === "mine" &&
            (currentList as UserCouponItem[]).map((uc) => (
              <MyCouponCard key={uc.id} userCoupon={uc} used={false} />
            ))}
          {activeTab === "used" &&
            (currentList as UserCouponItem[]).map((uc) => (
              <MyCouponCard key={uc.id} userCoupon={uc} used={true} />
            ))}
        </div>
      )}
    </div>
  );
}
