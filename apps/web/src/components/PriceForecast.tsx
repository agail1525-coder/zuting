"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface PriceForecastProps {
  routeId: string;
  currentPrice: number;
}

interface TrendPoint {
  date: string;
  price: number;
}

interface TrendStats {
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  currentPrice: number | null;
  vsAvg: number | null;
}

interface TrendResponse {
  entityType: string;
  entityId: string;
  days: number;
  trend: TrendPoint[];
  stats: TrendStats;
}

export default function PriceForecast({ routeId, currentPrice }: PriceForecastProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
    fetch(
      `${apiBase}/api/prices/trend?entityType=ROUTE&entityId=${encodeURIComponent(routeId)}&days=30`,
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: TrendResponse) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-16 bg-gray-100 rounded mb-3" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
    );
  }

  // Error or empty state — no fake data fallback
  if (error || !data || data.trend.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          {t("priceForecast.title") || "价格趋势"}
        </h3>
        <p className="text-sm text-gray-400 text-center py-4">
          {t("priceForecast.noData") || "暂无价格数据"}
        </p>
      </div>
    );
  }

  const { trend, stats } = data;
  const minPrice = stats.minPrice ?? currentPrice;
  const maxPrice = stats.maxPrice ?? currentPrice;
  const avgPrice = stats.avgPrice ?? currentPrice;
  const latestPrice = stats.currentPrice ?? currentPrice;
  const isGoodDeal = latestPrice <= avgPrice;
  const priceRange = maxPrice - minPrice || 1;
  const confidencePercent = Math.round(
    65 + ((latestPrice - minPrice) / priceRange) * 30,
  );

  // Show last 6 data points with short date labels
  const displayPoints = trend.slice(-6);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        {t("priceForecast.title") || "价格趋势"}
      </h3>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16 mb-3">
        {displayPoints.map((point, i) => {
          const height = ((point.price - minPrice) / priceRange) * 100;
          const isCurrent = i === displayPoints.length - 1;
          // Format date label: "03-15" from "2026-03-15"
          const dateLabel = point.date.slice(5);
          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isCurrent ? "bg-[#0066FF]" : "bg-gray-200"
                }`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.date}: ¥${Math.round(point.price)}`}
              />
              <span className="text-[9px] text-gray-400">{dateLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isGoodDeal
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
      >
        <span className="text-lg">{isGoodDeal ? "\u2705" : "\u23F3"}</span>
        <span>
          {isGoodDeal
            ? t("priceForecast.goodDeal") || "适合现在预订"
            : t("priceForecast.waitMaybe") || "价格可能下降"}
        </span>
      </div>

      {/* Confidence */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0066FF] rounded-full transition-all"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">
          {confidencePercent}% {t("priceForecast.confidence") || "置信度"}
        </span>
      </div>

      {/* Price range */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span>
          {t("priceForecast.lowest") || "历史最低"}: ¥{Math.round(minPrice)}
        </span>
        <span>
          {t("priceForecast.average") || "平均"}: ¥{Math.round(avgPrice)}
        </span>
      </div>
    </div>
  );
}
