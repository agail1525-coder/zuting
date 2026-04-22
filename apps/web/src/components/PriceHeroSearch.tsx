"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PriceHeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="bg-gradient-to-b from-[#1a1f3a] to-[#020617] text-white pt-4 pb-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-[#F5D898]/80 text-xs font-medium tracking-[0.3em] uppercase mb-3">JOINUS · PRICE CONTROL CENTER</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">价格工具 · 7×24 自动盯价</h1>
        <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-6">
          深度价格洞察 · 一个目标价,CRON 帮你守到
        </p>
        <form onSubmit={onSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜路线 / 目的地 / 主题,查实时价格"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F5D898]/60 focus:bg-white/15 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-[#F5D898] hover:bg-[#F5D898]/90 text-[#1a1f3a] font-bold text-sm transition-colors whitespace-nowrap"
          >
            搜索
          </button>
        </form>
      </div>
    </section>
  );
}
