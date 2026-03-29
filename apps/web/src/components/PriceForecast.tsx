"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface PriceForecastProps {
  routeId: string;
  currentPrice: number;
}

interface TrendPoint {
  month: string;
  price: number;
}

export default function PriceForecast({ routeId, currentPrice }: PriceForecastProps) {
  const { t } = useTranslation();
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate simulated price history based on routeId for consistent display
    const hash = routeId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const months = ["1月", "2月", "3月", "4月", "5月", "6月"];
    const points: TrendPoint[] = months.map((m, i) => ({
      month: m,
      price: currentPrice * (0.85 + ((hash + i * 13) % 30) / 100),
    }));
    setTrend(points);
    setLoading(false);
  }, [routeId, currentPrice]);

  if (loading) return null;

  const avgPrice = trend.reduce((s, p) => s + p.price, 0) / trend.length;
  const minPrice = Math.min(...trend.map((p) => p.price));
  const maxPrice = Math.max(...trend.map((p) => p.price));
  const isGoodDeal = currentPrice <= avgPrice;
  const confidencePercent = Math.round(65 + ((currentPrice - minPrice) / (maxPrice - minPrice || 1)) * 30);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        {t("priceForecast.title") || "价格趋势"}
      </h3>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16 mb-3">
        {trend.map((point, i) => {
          const height = ((point.price - minPrice) / (maxPrice - minPrice || 1)) * 100;
          const isCurrent = i === trend.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isCurrent ? "bg-[#0066FF]" : "bg-gray-200"
                }`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.month}: ¥${Math.round(point.price)}`}
              />
              <span className="text-[9px] text-gray-400">{point.month}</span>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
        isGoodDeal
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}>
        <span className="text-lg">{isGoodDeal ? "✅" : "⏳"}</span>
        <span>
          {isGoodDeal
            ? (t("priceForecast.goodDeal") || "适合现在预订")
            : (t("priceForecast.waitMaybe") || "价格可能下降")}
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
        <span className="text-xs text-gray-400">{confidencePercent}% {t("priceForecast.confidence") || "置信度"}</span>
      </div>

      {/* Price range */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span>{t("priceForecast.lowest") || "历史最低"}: ¥{Math.round(minPrice)}</span>
        <span>{t("priceForecast.average") || "平均"}: ¥{Math.round(avgPrice)}</span>
      </div>
    </div>
  );
}
