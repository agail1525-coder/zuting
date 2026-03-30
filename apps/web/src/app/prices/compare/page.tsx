"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchPriceCompare, fetchRoutes, type PriceCompareItem } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface RouteOption {
  type: string;
  id: string;
  label: string;
}

function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(0)}`;
}

// Minimal SVG trend sparkline
function Sparkline({ data }: { data: { date: string; price: number }[] }) {
  if (!data || data.length < 2) {
    return <div className="w-24 h-8 bg-gray-50 rounded text-xs text-gray-300 flex items-center justify-center">--</div>;
  }
  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 96;
  const H = 32;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.price - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="#0066FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function generateMockItem(id: string, label: string): PriceCompareItem {
  const base = 79800 + Math.floor(Math.random() * 50000);
  const trend = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    price: base + Math.floor(Math.random() * 20000) - 10000,
  }));
  const trendPrices = trend.map(t => t.price);
  return {
    entityId: id,
    name: label,
    currentPrice: base,
    minPrice: Math.min(...trendPrices),
    maxPrice: Math.max(...trendPrices),
    avgPrice: Math.round(trendPrices.reduce((a, b) => a + b, 0) / trendPrices.length),
    memberPrice: Math.round(base * 0.92),
    duration: 5 + Math.floor(Math.random() * 5),
    trend,
  };
}

export default function PriceComparePage() {
  const { t } = useTranslation();

  const COMPARE_ROWS = [
    { key: "currentPrice" as const, label: t("prices.compare.currentPrice"), format: (v: number) => formatPrice(v), highlight: true },
    { key: "memberPrice" as const, label: t("prices.compare.memberPrice"), format: (v: number | null) => v ? formatPrice(v) : "--", highlight: false },
    { key: "minPrice" as const, label: t("prices.compare.min30"), format: (v: number) => formatPrice(v), highlight: true },
    { key: "maxPrice" as const, label: t("prices.compare.max30"), format: (v: number) => formatPrice(v), highlight: false },
    { key: "avgPrice" as const, label: t("prices.compare.avg30"), format: (v: number) => formatPrice(v), highlight: false },
    { key: "duration" as const, label: t("prices.compare.duration"), format: (v: number) => t("prices.compare.durationDays").replace("{days}", String(v)), highlight: false },
  ];
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [items, setItems] = useState<PriceCompareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  // Load available routes on mount
  useEffect(() => {
    let cancelled = false;
    async function loadRoutes() {
      setRoutesLoading(true);
      try {
        const res = await fetchRoutes({ pageSize: 20 });
        if (cancelled) return;
        const options: RouteOption[] = (res.items ?? []).map(r => ({
          type: "route",
          id: r.id,
          label: r.title,
        }));
        setRouteOptions(options);
        // Auto-select first 2 routes
        if (options.length >= 2) {
          setSelected([options[0].id, options[1].id]);
        }
      } catch {
        // If routes API fails, leave empty — user sees message
        if (!cancelled) setRouteOptions([]);
      } finally {
        if (!cancelled) setRoutesLoading(false);
      }
    }
    loadRoutes();
    return () => { cancelled = true; };
  }, []);

  const loadCompare = useCallback(async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError(null);
    setUsingMock(false);
    try {
      const data = await fetchPriceCompare("route", selected);
      setItems(data);
    } catch {
      // Fallback mock — keep UI functional but warn user
      const mocks = selected.map(id => {
        const opt = routeOptions.find(p => p.id === id);
        return generateMockItem(id, opt?.label ?? id);
      });
      setItems(mocks);
      setUsingMock(true);
      setError("⚠ " + t("prices.compare.apiError"));
    } finally {
      setLoading(false);
    }
  }, [selected, routeOptions]);

  useEffect(() => { loadCompare(); }, [loadCompare]);

  function togglePackage(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 4 ? prev : [...prev, id]
    );
  }

  // Find cheapest value per row
  function getCheapest(key: keyof PriceCompareItem): number {
    const vals = items
      .map(item => item[key])
      .filter((v): v is number => typeof v === "number");
    return vals.length ? Math.min(...vals) : -1;
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/prices" className="text-sm text-[#0066FF] flex items-center gap-1 mb-6 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("prices.backToPrices")}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("prices.compare.title")}</h1>

        {/* Route selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-3">{t("prices.compare.selectRoutes")}</div>
          {routesLoading ? (
            <div className="text-sm text-gray-400 py-2">{t("prices.compare.loadingRoutes")}</div>
          ) : routeOptions.length === 0 ? (
            <div className="text-sm text-gray-400 py-2">{t("prices.compare.noRoutes")}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {routeOptions.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => togglePackage(pkg.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selected.includes(pkg.id)
                      ? "bg-[#0066FF] text-white border-[#0066FF]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#0066FF] hover:text-[#0066FF]"
                  }`}
                >
                  {pkg.label}
                </button>
              ))}
            </div>
          )}
          {selected.length < 2 && !routesLoading && routeOptions.length > 0 && (
            <p className="text-xs text-orange-500 mt-2">{t("prices.compare.minTwo")}</p>
          )}
        </div>

        {usingMock && error && (
          <div className="text-sm text-orange-700 bg-orange-50 rounded-lg px-4 py-3 mb-4 border border-orange-300 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">&#9888;</span>
            <span>{error}</span>
          </div>
        )}
        {!usingMock && error && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
            {error}
          </div>
        )}

        {/* Comparison Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">{t("prices.compare.loading")}</div>
        ) : items.length >= 2 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-gray-500 font-medium w-32">{t("prices.compare.compareItem")}</th>
                  {items.map(item => (
                    <th key={item.entityId} className="px-4 py-4 text-center font-semibold text-gray-800 min-w-[130px]">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => {
                  const cheapest = row.highlight ? getCheapest(row.key as keyof PriceCompareItem) : -1;
                  return (
                    <tr key={row.key} className={ri % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="px-5 py-3.5 text-gray-500 font-medium">{row.label}</td>
                      {items.map(item => {
                        const rawVal = item[row.key as keyof PriceCompareItem];
                        const numVal = typeof rawVal === "number" ? rawVal : null;
                        const isCheapest = row.highlight && numVal !== null && numVal === cheapest;
                        return (
                          <td
                            key={item.entityId}
                            className={`px-4 py-3.5 text-center font-medium transition-colors ${
                              isCheapest ? "bg-green-50 text-green-700" : "text-gray-800"
                            }`}
                          >
                            {row.format(rawVal as never)}
                            {isCheapest && (
                              <span className="ml-1.5 text-[10px] bg-green-100 text-green-600 px-1 py-0.5 rounded-full">{t("prices.compare.best")}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Trend row */}
                <tr className="bg-gray-50/50 border-t border-gray-100">
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{t("prices.compare.trend")}</td>
                  {items.map(item => (
                    <td key={item.entityId} className="px-4 py-3.5 flex justify-center">
                      <Sparkline data={item.trend} />
                    </td>
                  ))}
                </tr>
                {/* Action row */}
                <tr className="border-t border-gray-100">
                  <td className="px-5 py-4 text-gray-500 font-medium">{t("prices.compare.action")}</td>
                  {items.map(item => (
                    <td key={item.entityId} className="px-4 py-4 text-center">
                      <Link
                        href={`/prices/alerts`}
                        className="inline-block text-xs bg-[#0066FF] text-white px-3 py-1.5 rounded-full hover:bg-[#0052CC] transition-colors"
                      >
                        {t("prices.compare.setAlert")}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-gray-400">
          {t("prices.compare.disclaimer")}
        </p>
      </div>
    </main>
  );
}
