"use client";

import { useEffect, useState } from "react";

// W3.0.1 骨架 — W3.0.2 接真实 /api/prices/system-status
interface SystemStatus {
  baselineCount: number;
  routeCount: number;
  dayCount: number;
  sourceBreakdown: { baseline: number; crawler: number; official: number };
  lastCronRun: { priceAlertScan?: string; priceReconcileRoutes?: string; priceSnapshotExtend?: string };
  cronSchedules: { name: string; cron: string; label: string }[];
  asOf: string;
}

const FALLBACK: SystemStatus = {
  baselineCount: 3003,
  routeCount: 33,
  dayCount: 91,
  sourceBreakdown: { baseline: 3003, crawler: 0, official: 0 },
  lastCronRun: {},
  cronSchedules: [
    { name: "price-alert-scan", cron: "0 0 * * * *", label: "每小时扫告警" },
    { name: "price-reconcile-routes", cron: "0 10 4 * * *", label: "日 04:10 校准" },
    { name: "price-snapshot-extend", cron: "0 20 4 * * *", label: "日 04:20 延展" },
  ],
  asOf: new Date().toISOString(),
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function PricePulseBar() {
  const [status, setStatus] = useState<SystemStatus>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/prices/system-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data && typeof data.baselineCount === "number") {
          setStatus(data);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const total = status.sourceBreakdown.baseline + status.sourceBreakdown.crawler + status.sourceBreakdown.official;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="relative bg-gradient-to-r from-[#1a1f3a] via-[#2a2240] to-[#1a1f3a] text-white pt-[4rem] pb-5 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,85,0.08),transparent_60%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs md:text-sm">
          {/* 左: Live indicator */}
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${live ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${live ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="font-semibold tracking-wide text-[#F5D898]">
              {live ? "自愈系统在线" : "系统就绪"}
            </span>
          </div>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* 覆盖量 */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-white/60">基线覆盖</span>
            <span className="font-bold text-[#F5D898] text-base">{status.baselineCount.toLocaleString()}</span>
            <span className="text-white/40">条</span>
            <span className="text-white/60 ml-1">· {status.routeCount} 路线 × {status.dayCount} 天</span>
          </div>

          <div className="h-4 w-px bg-white/15 hidden md:block" />

          {/* 数据源混合 */}
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">数据源</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-200">基线 {pct(status.sourceBreakdown.baseline)}%</span>
            </span>
            {status.sourceBreakdown.crawler > 0 && (
              <span className="inline-flex items-center gap-0.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-sky-200">爬虫 {pct(status.sourceBreakdown.crawler)}%</span>
              </span>
            )}
            {status.sourceBreakdown.official > 0 && (
              <span className="inline-flex items-center gap-0.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-200">官方 {pct(status.sourceBreakdown.official)}%</span>
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-white/15 hidden lg:block" />

          {/* CRON 状态 */}
          <div className="flex items-center gap-1.5 text-white/60">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>每小时扫告警 · 日 04:10 校准 · 04:20 延展</span>
          </div>

          {/* 右: asOf */}
          <div className="ml-auto text-white/40">
            最后更新 {fmtTime(status.asOf)}
          </div>
        </div>
      </div>
    </div>
  );
}
