"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TodayLowItem {
  routeId: string;
  slug: string;
  title: string;
  priceFen: number;
  currency: string;
  source: "baseline" | "crawler" | "official";
  date: string;
  changePercent24h: number;
}

// W3.0.1 骨架,数据由 W3.0.2 /api/prices/today-low 提供
export default function PriceTodayLow() {
  const [items, setItems] = useState<TodayLowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/prices/today-low?limit=5")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        const arr = Array.isArray(data?.items) ? data.items : [];
        setItems(arr);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          </span>
          <div>
            <h2 className="font-bold text-gray-900 text-base">今日最低 Top 5</h2>
            <p className="text-[11px] text-gray-400">来自 CRON 日 04:20 刷新的 baseline 快照</p>
          </div>
        </div>
        <Link href="/prices/compare" className="text-xs text-[#3264ff] hover:underline font-medium">全榜 →</Link>
      </header>

      {loading ? (
        <ul className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-5 py-3.5 animate-pulse flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100" />
              <div className="flex-1"><div className="h-3.5 bg-gray-100 rounded w-2/3 mb-1.5" /><div className="h-2.5 bg-gray-100 rounded w-1/3" /></div>
              <div className="h-4 bg-gray-100 rounded w-14" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center text-gray-400 text-sm">暂无今日价格数据</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {items.map((it, idx) => {
            const priceYuan = Math.round(it.priceFen / 100);
            const down = it.changePercent24h < 0;
            const flat = Math.abs(it.changePercent24h) < 0.01;
            return (
              <li key={it.routeId}>
                <Link href={`/holy-sites/routes/${it.slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <span className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{it.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{it.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#3264ff] text-base leading-none">¥{priceYuan.toLocaleString()}</p>
                    <p className={`text-[11px] mt-1 font-medium ${flat ? "text-gray-400" : down ? "text-emerald-600" : "text-rose-500"}`}>
                      {flat ? "—" : `${down ? "↓" : "↑"} ${Math.abs(it.changePercent24h * 100).toFixed(1)}%`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
