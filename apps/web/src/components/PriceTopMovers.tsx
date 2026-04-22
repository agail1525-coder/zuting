"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface MoverItem {
  routeId: string;
  slug: string;
  title: string;
  currentPriceFen: number;
  previousPriceFen: number;
  changePercent: number;
  changeDirection: "UP" | "DOWN" | "FLAT";
  source: "baseline" | "crawler" | "official";
}

export default function PriceTopMovers() {
  const [items, setItems] = useState<MoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/prices/top-movers?limit=5&window=24h")
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
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 text-rose-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </span>
          <div>
            <h2 className="font-bold text-gray-900 text-base">24h 涨跌榜</h2>
            <p className="text-[11px] text-gray-400">对比昨日同时刻 snapshot,绝对幅度排序</p>
          </div>
        </div>
        <Link href="/prices/trend" className="text-xs text-[#3264ff] hover:underline font-medium">查趋势 →</Link>
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
        <div className="px-5 py-10 text-center text-gray-400 text-sm">暂无涨跌数据</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {items.map((it) => {
            const currentYuan = Math.round(it.currentPriceFen / 100);
            const up = it.changeDirection === "UP";
            const flat = it.changeDirection === "FLAT";
            return (
              <li key={it.routeId}>
                <Link href={`/holy-sites/routes/${it.slug}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <span className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-base ${flat ? "bg-gray-50 text-gray-400" : up ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"}`}>
                    {flat ? "→" : up ? "▲" : "▼"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{it.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">现价 ¥{currentYuan.toLocaleString()}</p>
                  </div>
                  <div className={`text-right shrink-0 font-bold text-sm ${flat ? "text-gray-400" : up ? "text-rose-500" : "text-emerald-600"}`}>
                    {flat ? "—" : `${up ? "+" : ""}${(it.changePercent * 100).toFixed(1)}%`}
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
