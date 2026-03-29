"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchPriceCompare, type PriceCompareItem } from "@/lib/api";

const ALL_PACKAGES = [
  { type: "package", id: "pkg-001", label: "峨眉山朝圣7日游" },
  { type: "package", id: "pkg-002", label: "麦加朝觐精华团" },
  { type: "package", id: "pkg-003", label: "耶路撒冷圣地探访" },
  { type: "package", id: "pkg-004", label: "恒河瓦拉纳西净心之旅" },
  { type: "package", id: "pkg-005", label: "京都寺庙禅修5日" },
  { type: "package", id: "pkg-006", label: "梵蒂冈朝圣之旅" },
];

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

const COMPARE_ROWS = [
  { key: "currentPrice" as const, label: "当前价格", format: (v: number) => formatPrice(v), highlight: true },
  { key: "memberPrice" as const, label: "会员价", format: (v: number | null) => v ? formatPrice(v) : "--", highlight: false },
  { key: "minPrice" as const, label: "30天最低", format: (v: number) => formatPrice(v), highlight: true },
  { key: "maxPrice" as const, label: "30天最高", format: (v: number) => formatPrice(v), highlight: false },
  { key: "avgPrice" as const, label: "30天均价", format: (v: number) => formatPrice(v), highlight: false },
  { key: "duration" as const, label: "行程天数", format: (v: number) => `${v} 天`, highlight: false },
];

export default function PriceComparePage() {
  const [selected, setSelected] = useState<string[]>(["pkg-001", "pkg-002"]);
  const [items, setItems] = useState<PriceCompareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompare = useCallback(async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPriceCompare("package", selected);
      setItems(data);
    } catch {
      // Fallback mock
      const mocks = selected.map(id => {
        const pkg = ALL_PACKAGES.find(p => p.id === id)!;
        return generateMockItem(id, pkg?.label ?? id);
      });
      setItems(mocks);
      setError("使用演示数据 (API 尚未就绪)");
    } finally {
      setLoading(false);
    }
  }, [selected]);

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
          返回价格工具
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">比价面板</h1>

        {/* Package selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-3">选择套餐（最多4个）</div>
          <div className="flex flex-wrap gap-2">
            {ALL_PACKAGES.map(pkg => (
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
          {selected.length < 2 && (
            <p className="text-xs text-orange-500 mt-2">请至少选择 2 个套餐进行比较</p>
          )}
        </div>

        {error && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
            {error}
          </div>
        )}

        {/* Comparison Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">加载中...</div>
        ) : items.length >= 2 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-gray-500 font-medium w-32">对比项</th>
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
                              <span className="ml-1.5 text-[10px] bg-green-100 text-green-600 px-1 py-0.5 rounded-full">最优</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Trend row */}
                <tr className="bg-gray-50/50 border-t border-gray-100">
                  <td className="px-5 py-3.5 text-gray-500 font-medium">价格走势</td>
                  {items.map(item => (
                    <td key={item.entityId} className="px-4 py-3.5 flex justify-center">
                      <Sparkline data={item.trend} />
                    </td>
                  ))}
                </tr>
                {/* Action row */}
                <tr className="border-t border-gray-100">
                  <td className="px-5 py-4 text-gray-500 font-medium">操作</td>
                  {items.map(item => (
                    <td key={item.entityId} className="px-4 py-4 text-center">
                      <Link
                        href={`/prices/alerts`}
                        className="inline-block text-xs bg-[#0066FF] text-white px-3 py-1.5 rounded-full hover:bg-[#0052CC] transition-colors"
                      >
                        设提醒
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-gray-400">
          * 价格为参考价，以实际支付页面为准。会员价需登录后查看。
        </p>
      </div>
    </main>
  );
}
