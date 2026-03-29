"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/api";

const TYPE_OPTIONS = [
  { key: "guide", label: "游记达人" },
  { key: "review", label: "评价达人" },
  { key: "pilgrim", label: "朝圣达人" },
];

const PERIOD_OPTIONS = [
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "all", label: "全部" },
];

const TYPE_LABELS: Record<string, { unit: string; icon: string; color: string }> = {
  guide: { unit: "篇游记", icon: "📖", color: "text-blue-600" },
  review: { unit: "条评价", icon: "⭐", color: "text-yellow-600" },
  pilgrim: { unit: "个圣地", icon: "🕌", color: "text-purple-600" },
};

function PodiumCard({ entry, meta }: { entry: LeaderboardEntry; meta: { unit: string; icon: string; color: string } }) {
  const podiumStyles: Record<number, { height: string; bg: string; badge: string }> = {
    1: { height: "h-28", bg: "bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300", badge: "🥇" },
    2: { height: "h-20", bg: "bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300", badge: "🥈" },
    3: { height: "h-16", bg: "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300", badge: "🥉" },
  };
  const style = podiumStyles[entry.rank] || podiumStyles[3];

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border shadow-sm ${style.bg}`}>
      <div className="text-3xl mb-2">{style.badge}</div>
      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-[#0066FF] mb-2 border-2 border-white">
        {entry.avatar ? (
          <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          entry.nickname.charAt(0)
        )}
      </div>
      <div className="font-semibold text-gray-900 text-sm text-center truncate max-w-full">{entry.nickname}</div>
      <div className={`text-lg font-bold mt-1 ${meta.color}`}>{entry.count}</div>
      <div className="text-xs text-gray-500">{meta.unit}</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [type, setType] = useState("guide");
  const [period, setPeriod] = useState("month");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLeaderboard(type, period)
      .then((res) => setEntries(Array.isArray(res) ? res : []))
      .catch(() => setError("加载失败，请稍后再试"))
      .finally(() => setLoading(false));
  }, [type, period]);

  const meta = TYPE_LABELS[type] || TYPE_LABELS.guide;
  const top3 = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">社区排行榜</h1>
          <p className="text-gray-500 text-sm">最活跃的朝圣者们</p>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-4">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setType(opt.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === opt.key ? "bg-[#0066FF] text-white shadow-sm" : "text-gray-600 hover:text-[#0066FF] hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                period === opt.key ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏆</div>
            <div>暂无排行数据</div>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {/* Reorder: 2nd, 1st, 3rd for podium effect */}
                {[
                  top3.find((e) => e.rank === 2),
                  top3.find((e) => e.rank === 1),
                  top3.find((e) => e.rank === 3),
                ].map((entry) =>
                  entry ? (
                    <PodiumCard key={entry.userId} entry={entry} meta={meta} />
                  ) : (
                    <div key={Math.random()} />
                  )
                )}
              </div>
            )}

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry) => (
                  <div key={entry.userId} className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-5 py-3">
                    <div className="text-sm font-bold text-gray-400 w-6 text-center">#{entry.rank}</div>
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        entry.nickname.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 font-medium text-gray-900 text-sm">{entry.nickname}</div>
                    <div className={`font-bold ${meta.color}`}>{entry.count}</div>
                    <div className="text-xs text-gray-400">{meta.unit}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
