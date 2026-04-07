"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchAvailableCoupons,
  fetchMyCoupons,
  claimCoupon,
  type CouponItem,
  type UserCouponItem,
} from "@/lib/api";

type TabKey = "available" | "mine" | "used";

function formatDate(dateStr: string, locale = "zh-CN"): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isExpiringSoon(endAt: string): boolean {
  const diff = new Date(endAt).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function daysUntilExpiry(endAt: string): number {
  return Math.max(0, Math.ceil((new Date(endAt).getTime() - Date.now()) / 86400000));
}

interface AvailableCouponCardProps {
  coupon: CouponItem;
  onClaim: (id: string) => void;
  claiming: boolean;
  claimed: boolean;
}

function AvailableCouponCard({ coupon, onClaim, claiming, claimed }: AvailableCouponCardProps) {
  const { t, locale } = useTranslation();
  const isFixed = coupon.type === "FIXED" || coupon.type === "fixed";
  const accentColor = isFixed ? "#EF4444" : "#3B82F6";
  const bgLight = isFixed ? "bg-red-50" : "bg-blue-50";
  const textAccent = isFixed ? "text-red-500" : "text-blue-500";
  const borderAccent = isFixed ? "border-red-100" : "border-blue-100";
  const expiring = isExpiringSoon(coupon.endAt);
  const isFull = coupon.usedCount >= coupon.totalCount;
  const days = daysUntilExpiry(coupon.endAt);

  return (
    <div
      className={`flex rounded-xl border ${borderAccent} overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isFull ? "opacity-60" : ""
      }`}
    >
      <div className="w-3 shrink-0" style={{ backgroundColor: accentColor }} />
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
                  <span className={`text-2xl font-bold ${textAccent}`}>
                    {coupon.value}
                  </span>
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
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-xs ${expiring ? "text-orange-500 font-medium" : "text-gray-400"}`}>
                {expiring ? t("coupons.expiringSoon") : ""}{t("coupons.validUntil", { date: formatDate(coupon.endAt, locale) })}
              </p>
              {days <= 3 && days > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                  {t("coupons.expiresInDays", { days })}
                </span>
              )}
            </div>
            {/* Quota bar */}
            {coupon.totalCount > 0 && (
              <div className="mt-2">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${coupon.usedCount / coupon.totalCount >= 0.8 ? "bg-red-400" : "bg-blue-400"}`}
                    style={{ width: `${Math.min(100, (coupon.usedCount / coupon.totalCount) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("coupons.quotaClaimed", { used: coupon.usedCount, total: coupon.totalCount })}
                </p>
              </div>
            )}
          </div>
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
  const { t, locale } = useTranslation();
  const { coupon } = userCoupon;
  const isFixed = coupon.type === "FIXED" || coupon.type === "fixed";
  const accentColor = used ? "#9CA3AF" : isFixed ? "#EF4444" : "#3B82F6";
  const bgLight = used ? "bg-gray-50" : isFixed ? "bg-red-50" : "bg-blue-50";
  const textAccent = used ? "text-gray-400" : isFixed ? "text-red-500" : "text-blue-500";
  const borderAccent = used ? "border-gray-200" : isFixed ? "border-red-100" : "border-blue-100";
  const expiring = !used && isExpiringSoon(coupon.endAt);

  return (
    <div
      className={`flex rounded-xl border ${borderAccent} overflow-hidden shadow-sm ${
        used ? "opacity-70" : "hover:shadow-md transition-shadow"
      }`}
    >
      <div className="w-3 shrink-0" style={{ backgroundColor: accentColor }} />
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
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-xs ${expiring ? "text-orange-500 font-medium" : "text-gray-400"}`}>
                {expiring ? t("coupons.expiringSoon") : ""}{t("coupons.validUntil", { date: formatDate(coupon.endAt, locale) })}
              </p>
            </div>
            {used && userCoupon.usedAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {t("coupons.usedAt", { date: formatDate(userCoupon.usedAt, locale) })}
              </p>
            )}
          </div>
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
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [t]);

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
    [t]
  );

  // Wallet stats
  const walletStats = useMemo(() => {
    const totalSavings = myCoupons.reduce((sum, uc) => {
      const c = uc.coupon;
      if (c.type === "FIXED" || c.type === "fixed") return sum + c.value;
      return sum;
    }, 0);
    const expiringSoon = myCoupons.filter((uc) => isExpiringSoon(uc.coupon.endAt)).length;
    return { count: myCoupons.length, totalSavings, expiringSoon, usedCount: usedCoupons.length };
  }, [myCoupons, usedCoupons]);

  // Client-side search
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableCoupons;
    const q = searchQuery.toLowerCase();
    return availableCoupons.filter((c) => c.name.toLowerCase().includes(q));
  }, [availableCoupons, searchQuery]);

  const filteredMy = useMemo(() => {
    if (!searchQuery.trim()) return myCoupons;
    const q = searchQuery.toLowerCase();
    return myCoupons.filter((uc) => uc.coupon.name.toLowerCase().includes(q));
  }, [myCoupons, searchQuery]);

  const filteredUsed = useMemo(() => {
    if (!searchQuery.trim()) return usedCoupons;
    const q = searchQuery.toLowerCase();
    return usedCoupons.filter((uc) => uc.coupon.name.toLowerCase().includes(q));
  }, [usedCoupons, searchQuery]);

  const tabs: { key: TabKey; label: string; count?: number; icon: string }[] = [
    { key: "available", label: t("coupons.tabAvailable"), icon: "🎫", count: availableCoupons.length || undefined },
    { key: "mine", label: t("coupons.tabMine"), count: myCoupons.length || undefined, icon: "💰" },
    { key: "used", label: t("coupons.tabUsed"), count: usedCoupons.length || undefined, icon: "✅" },
  ];

  const currentList =
    activeTab === "available"
      ? filteredAvailable
      : activeTab === "mine"
      ? filteredMy
      : filteredUsed;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#0066FF] mb-2">
            {t("nav.coupons")}
          </h1>
          <p className="text-gray-500 text-sm">{t("coupons.subtitle")}</p>
        </div>

        {/* Wallet Overview (对标Agoda/Priceline) */}
        {(myCoupons.length > 0 || usedCoupons.length > 0) && (
          <div className="mb-6 bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-white/70 text-sm mb-1">{t("coupons.walletTitle")}</p>
              <div className="flex items-end gap-6">
                <div>
                  <span className="text-3xl font-bold">{walletStats.count}</span>
                  <span className="text-white/70 text-sm ml-1">{t("coupons.walletAvailable")}</span>
                </div>
                {walletStats.totalSavings > 0 && (
                  <div>
                    <span className="text-lg font-semibold">¥{(walletStats.totalSavings / 100).toFixed(0)}</span>
                    <span className="text-white/70 text-xs ml-1">{t("coupons.walletTotalValue")}</span>
                  </div>
                )}
                {walletStats.expiringSoon > 0 && (
                  <div className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                    {t("coupons.walletExpiringSoon", { count: walletStats.expiringSoon })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("coupons.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-white text-[#0066FF] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? "bg-[#0066FF] text-white" : "bg-gray-200 text-gray-500"
                }`}>
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
            <div className="text-5xl mb-4">{searchQuery ? "🔍" : "🎫"}</div>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? t("coupons.searchNoResult")
                : activeTab === "available"
                ? t("coupons.emptyAvailable")
                : activeTab === "mine"
                ? t("coupons.emptyMine")
                : t("coupons.emptyUsed")}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                {t("coupons.clearSearch")}
              </button>
            ) : activeTab !== "available" ? (
              <button
                onClick={() => setActiveTab("available")}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                {t("coupons.goClaimCoupons")}
              </button>
            ) : null}
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

        {/* Bottom CTA */}
        {!loading && activeTab === "mine" && myCoupons.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200/50 text-center">
            <span className="text-2xl block mb-2">🛒</span>
            <h3 className="text-base font-semibold text-gray-900">{t("coupons.ctaTitle")}</h3>
            <p className="text-gray-500 text-xs mt-1">
              {walletStats.expiringSoon > 0
                ? t("coupons.ctaExpiring", { count: walletStats.expiringSoon })
                : t("coupons.ctaDefault")}
            </p>
            <Link
              href="/holy-sites#routes"
              className="inline-block mt-4 px-6 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl text-sm hover:bg-[#0052CC] transition-colors"
            >
              {t("coupons.ctaBrowseRoutes")}
            </Link>
          </div>
        )}

        {!loading && activeTab === "available" && availableCoupons.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/promotions" className="text-sm text-[#0066FF] hover:underline">
              {t("coupons.viewMorePromotions")}
            </Link>
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
