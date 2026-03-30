"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchPriceTrend, fetchRoutes, type PriceTrendPoint, type Route } from "@/lib/api";

interface EntityOption { type: string; id: string; label: string }

const PERIODS = [
  { label: "7天", days: 7 },
  { label: "30天", days: 30 },
  { label: "90天", days: 90 },
];

function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(0)}`;
}

// Pure SVG line chart
function TrendChart({
  data,
  width = 600,
  height = 200,
}: {
  data: PriceTrendPoint[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const prices = data.map(d => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = width - PAD_L - PAD_R;
  const chartH = height - PAD_T - PAD_B;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
  const toY = (p: number) => PAD_T + chartH - ((p - minP) / range) * chartH;

  const points = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.price).toFixed(1)}`).join(" ");

  // Fill area under line
  const firstX = toX(0).toFixed(1);
  const lastX = toX(data.length - 1).toFixed(1);
  const bottomY = (PAD_T + chartH).toFixed(1);
  const fillPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  // Y-axis labels: 4 ticks
  const yTicks = [0, 0.33, 0.67, 1].map(f => ({
    price: minP + f * range,
    y: PAD_T + chartH - f * chartH,
  }));

  // X-axis labels: show first, middle, last
  const xLabelIdxs = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
      role="img"
      aria-label="价格趋势折线图"
    >
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <line
          key={i}
          x1={PAD_L}
          y1={tick.y}
          x2={PAD_L + chartW}
          y2={tick.y}
          stroke="#E5E7EB"
          strokeWidth="1"
          strokeDasharray={i === 0 ? "none" : "4,4"}
        />
      ))}

      {/* Fill */}
      <polygon points={fillPoints} fill="#0066FF" fillOpacity="0.06" />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#0066FF"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data point dots for small datasets */}
      {data.length <= 14 && data.map((d, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(d.price)}
          r="3"
          fill="#0066FF"
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <text
          key={i}
          x={PAD_L - 4}
          y={tick.y + 4}
          textAnchor="end"
          fontSize="10"
          fill="#9CA3AF"
        >
          {formatPrice(tick.price)}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabelIdxs.map(idx => (
        <text
          key={idx}
          x={toX(idx)}
          y={PAD_T + chartH + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#9CA3AF"
        >
          {data[idx]?.date.slice(5)}
        </text>
      ))}
    </svg>
  );
}

export default function PriceTrendPage() {
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [period, setPeriod] = useState(PERIODS[1]);
  const [trendData, setTrendData] = useState<PriceTrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load routes as entity options
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRoutes({ pageSize: 50 });
        const opts: EntityOption[] = (res.items || []).map((r: Route) => ({
          type: "route",
          id: r.id,
          label: r.title,
        }));
        if (opts.length > 0) {
          setEntityOptions(opts);
          setSelectedEntity(opts[0]);
        } else {
          setError("暂无可用路线");
        }
      } catch {
        setError("无法加载路线列表");
      } finally {
        setLoadingRoutes(false);
      }
    })();
  }, []);

  const loadTrend = useCallback(async () => {
    if (!selectedEntity) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPriceTrend(selectedEntity.type, selectedEntity.id, period.days);
      setTrendData(data);
    } catch {
      setTrendData([]);
      setError("暂无价格趋势数据");
    } finally {
      setLoading(false);
    }
  }, [selectedEntity, period]);

  useEffect(() => { loadTrend(); }, [loadTrend]);

  const prices = trendData.map(d => d.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const currentPrice = prices[prices.length - 1] ?? 0;
  const firstPrice = prices[0] ?? 0;
  const changePct = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/prices" className="text-sm text-[#0066FF] flex items-center gap-1 mb-6 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回价格工具
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">价格趋势</h1>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">路线</label>
            {loadingRoutes ? (
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400">加载路线中...</div>
            ) : (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
              value={selectedEntity?.id ?? ""}
              onChange={(e) => {
                const opt = entityOptions.find(o => o.id === e.target.value);
                if (opt) setSelectedEntity(opt);
              }}
            >
              {entityOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">时间范围</label>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button
                  key={p.days}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    period.days === p.days
                      ? "bg-[#0066FF] text-white border-[#0066FF]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#0066FF] hover:text-[#0066FF]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
            {error}
          </div>
        )}

        {/* Chart card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">当前价格</div>
              <div className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</div>
            </div>
            {prices.length > 0 && (
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                changePct < 0
                  ? "bg-green-50 text-green-700"
                  : changePct > 0
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-600"
              }`}>
                {changePct > 0 ? "+" : ""}{changePct.toFixed(1)}% 较{period.label}前
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
          ) : trendData.length >= 2 ? (
            <TrendChart data={trendData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">暂无数据</div>
          )}
        </div>

        {/* Stats */}
        {prices.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{period.label}最低</div>
              <div className="text-lg font-bold text-green-600">{formatPrice(minPrice)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{period.label}均价</div>
              <div className="text-lg font-bold text-blue-600">{formatPrice(avgPrice)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{period.label}最高</div>
              <div className="text-lg font-bold text-red-600">{formatPrice(maxPrice)}</div>
            </div>
          </div>
        )}

        {/* Price positioning */}
        {prices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="text-sm font-medium text-gray-700 mb-3">当前价格位置</div>
            <div className="relative h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full">
              {(() => {
                const pct = ((currentPrice - minPrice) / (maxPrice - minPrice || 1)) * 100;
                return (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0066FF] rounded-full border-2 border-white shadow-md"
                    style={{ left: `${Math.min(Math.max(pct, 4), 96)}%` }}
                  />
                );
              })()}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>历史低点</span>
              <span>历史高点</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="/prices/alerts"
            className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] text-white rounded-full text-sm font-medium hover:bg-[#0052CC] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            设置价格提醒
          </Link>
        </div>
      </div>
    </main>
  );
}
