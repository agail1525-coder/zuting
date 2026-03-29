"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchPromotions, type PromotionItem } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

type TabKey = "all" | "FLASH_SALE" | "EARLY_BIRD" | "DISCOUNT";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountdown(endAt: string) {
  const calc = () => Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
  const [seconds, setSeconds] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(timer);
  }, [endAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { seconds, d, h, m, s, expired: seconds === 0 };
}

function CountdownBadge({ endAt }: { endAt: string }) {
  const { d, h, m, s, expired } = useCountdown(endAt);
  if (expired) return <span className="text-xs text-gray-400 font-mono">已结束</span>;
  return (
    <span className="text-xs font-mono text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
      {d > 0 ? `${d}天 ` : ""}
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const color = pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-orange-400" : "bg-[#0066FF]";
  return (
    <div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        已抢 {used}/{total} · 剩余 {Math.max(0, total - used)}
      </p>
    </div>
  );
}

interface PromoCardProps {
  promo: PromotionItem;
}

function FlashSaleCard({ promo }: PromoCardProps) {
  const { expired } = useCountdown(promo.endAt);
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        expired ? "opacity-60" : ""
      }`}
    >
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-red-500 to-orange-400 flex items-center justify-center">
          <span className="text-4xl">⚡</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
            闪购
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        {/* Discount display */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-red-500">
            {promo.discountType === "PERCENT"
              ? `${promo.discountValue}折`
              : `减¥${(promo.discountValue / 100).toFixed(0)}`}
          </span>
          {promo.minAmount != null && (
            <span className="text-xs text-gray-400">满¥{(promo.minAmount / 100).toFixed(0)}可用</span>
          )}
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">距结束</span>
          <CountdownBadge endAt={promo.endAt} />
        </div>
        {/* Quota bar */}
        {promo.totalQuota > 0 && (
          <QuotaBar used={promo.usedQuota} total={promo.totalQuota} />
        )}
      </div>
    </div>
  );
}

function DiscountCard({ promo }: PromoCardProps) {
  const endDate = formatDate(promo.endAt);
  const nowMs = Date.now();
  const endMs = new Date(promo.endAt).getTime();
  const remainDays = Math.max(0, Math.ceil((endMs - nowMs) / 86400000));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-[#0066FF] to-purple-500 flex items-center justify-center">
          <span className="text-4xl">🏷️</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded-full">
            限时
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-[#0066FF]">
            {promo.discountType === "PERCENT"
              ? `${promo.discountValue}折`
              : `减¥${(promo.discountValue / 100).toFixed(0)}`}
          </span>
          {promo.minAmount != null && (
            <span className="text-xs text-gray-400 line-through">
              原价
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>截止 {endDate}</span>
          {remainDays <= 3 && remainDays > 0 && (
            <span className="text-orange-500 font-medium">仅剩 {remainDays} 天</span>
          )}
        </div>
      </div>
    </div>
  );
}

function EarlyBirdCard({ promo }: PromoCardProps) {
  const saving = promo.discountType === "FIXED"
    ? `¥${(promo.discountValue / 100).toFixed(0)}`
    : `${promo.discountValue}%`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {promo.coverImage ? (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.coverImage})` }}
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
          <span className="text-4xl">🌅</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.name}</h3>
          <span className="shrink-0 text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
            早鸟
          </span>
        </div>
        {promo.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
        )}
        <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-3">
          <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm8.5 1H10V5.5a1 1 0 011-1h1a1 1 0 011 1V6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-green-700">
            提前预订节省 {saving}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          活动截止 {formatDate(promo.endAt)}
        </div>
        {promo.totalQuota > 0 && (
          <div className="mt-2">
            <QuotaBar used={promo.usedQuota} total={promo.totalQuota} />
          </div>
        )}
      </div>
    </div>
  );
}

function PromoCard({ promo }: PromoCardProps) {
  const type = promo.type?.toUpperCase();
  if (type === "FLASH_SALE") return <FlashSaleCard promo={promo} />;
  if (type === "EARLY_BIRD") return <EarlyBirdCard promo={promo} />;
  return <DiscountCard promo={promo} />;
}

export default function PromotionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "all", label: "全部", icon: "🎯" },
    { key: "FLASH_SALE", label: "闪购", icon: "⚡" },
    { key: "EARLY_BIRD", label: "早鸟价", icon: "🌅" },
    { key: "DISCOUNT", label: "限时折扣", icon: "🏷️" },
  ];

  const load = useCallback(async (type: TabKey) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPromotions(type === "all" ? undefined : type, 1);
      setPromotions(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t("nav.deals") || "促销活动"}
        </h1>
        <p className="text-gray-500 text-sm">限时优惠、早鸟特价、闪购活动，一站掌握</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#0066FF] text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#0066FF]/40 hover:text-[#0066FF]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
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
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-gray-500 text-sm">暂无进行中的促销活动，请稍后再来</p>
          <Link href="/holy-sites" className="mt-4 inline-block text-[#0066FF] text-sm hover:underline">
            浏览全部圣地
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {promotions.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  );
}
