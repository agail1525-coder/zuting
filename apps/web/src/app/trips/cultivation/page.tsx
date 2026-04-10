"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompass, type CompassResponse } from "@/lib/api";

const REALM_LABEL: Record<string, string> = {
  AWAKENING: "初觉",
  CLARIFYING: "明心",
  SEEING: "见性",
  ATTAINING: "证道",
  INTEGRATING: "融通",
  RETURNING: "归源",
  GIVING_BACK: "布施",
};

export default function CultivationCompassPage() {
  const [data, setData] = useState<CompassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompass()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-amber-200/60 py-20 text-center">加载罗盘...</div>;
  if (error) return <div className="text-rose-300 py-20 text-center">{error}</div>;
  if (!data) return null;

  const { journey, currentSymbol, todaySteps, streakDays } = data;

  return (
    <div className="space-y-6">
      {/* Hero — current realm + symbol */}
      <div className="rounded-3xl border border-amber-900/50 bg-gradient-to-br from-amber-950/60 to-[#1a1410] p-8 shadow-xl">
        <div className="flex items-start gap-6">
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30">
            ☸
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-300/60 text-xs uppercase tracking-widest mb-1">
              当前境界 · {journey.primaryTradition}
            </p>
            <h1 className="text-3xl font-bold text-amber-100 mb-1">
              {REALM_LABEL[journey.currentRealm] || journey.currentRealm}
            </h1>
            <p className="text-amber-200/60 text-sm mb-4">
              十牛图 第 {journey.oxStage} 阶 · 连击 {streakDays} 天 · {journey.karmaPoints} 因缘点
            </p>
            {currentSymbol && (
              <div className="rounded-xl bg-amber-950/40 border border-amber-900/40 p-4">
                <p className="text-amber-300 font-semibold text-sm mb-1">{currentSymbol.symbolName}</p>
                <p className="text-amber-100/70 text-sm leading-relaxed">{currentSymbol.originalText}</p>
                <p className="text-amber-100/40 text-xs mt-2">— {currentSymbol.source}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's steps */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
        <h2 className="text-lg font-bold text-amber-100 mb-4">今日修行</h2>
        <div className="space-y-3">
          {todaySteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                step.completed
                  ? "bg-emerald-500/10 border-emerald-400/30"
                  : "bg-amber-950/30 border-amber-900/50 hover:border-amber-700"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step.completed ? "bg-emerald-500/30 text-emerald-200" : "bg-amber-900/40 text-amber-300"
                }`}
              >
                {step.completed ? "✓" : "○"}
              </div>
              <div className="flex-1 text-amber-100 text-sm">{step.title}</div>
              <span className="text-xs text-amber-200/40">{step.kind}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/trips/cultivation/ox-path", label: "十牛图路径", icon: "🐂", desc: "十阶进度" },
          { href: "/trips/cultivation/daily-seal", label: "每日一印", icon: "🪷", desc: "晨晚课打卡" },
          { href: "/trips/cultivation/wisdom", label: "智慧融通", icon: "💬", desc: "12 文化问答" },
          { href: "/trips/cultivation/karma", label: "因缘日志", icon: "📖", desc: "AI 标注" },
          { href: "/trips/cultivation/three-lives", label: "三生愿景", icon: "🏠", desc: "个人/家庭/事业" },
          { href: "/trips/cultivation/scriptures", label: "经论大系统", icon: "📜", desc: "知识图谱" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-2xl border border-amber-900/50 bg-amber-950/30 p-4 hover:border-amber-600 hover:bg-amber-950/50 transition-all group"
          >
            <div className="text-2xl mb-2">{q.icon}</div>
            <div className="font-semibold text-amber-100 text-sm group-hover:text-amber-300">{q.label}</div>
            <div className="text-xs text-amber-100/40 mt-0.5">{q.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
