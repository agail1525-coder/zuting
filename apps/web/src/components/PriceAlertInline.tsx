"use client";

import Link from "next/link";
import { useState } from "react";

export default function PriceAlertInline() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <section className="rounded-2xl border border-[#F5D898]/40 bg-gradient-to-br from-[#FFF8E7] via-white to-white shadow-sm overflow-hidden">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex w-7 h-7 rounded-lg bg-[#F5D898]/40 items-center justify-center">🔔</span>
          <div>
            <h3 className="font-bold text-gray-900 text-base">订一个价格告警</h3>
            <p className="text-[11px] text-gray-500">CRON 每小时帮你盯,达到目标价即通知</p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            订阅成功,跌至目标价立刻通知
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="接收通知的邮箱"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#3264ff] focus:ring-1 focus:ring-[#3264ff]/20"
            />
            <div className="flex items-center gap-2">
              <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-[#3264ff] hover:bg-[#2850d6] text-white text-sm font-bold transition-colors">
                开始盯价
              </button>
              <Link href="/prices/alerts" className="px-3 py-2.5 rounded-lg text-[#3264ff] text-xs font-medium whitespace-nowrap hover:bg-[#3264ff]/5">
                高级 →
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
