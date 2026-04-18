import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRankings, type RankingEntry } from "@/lib/api";

type RankType = "guide" | "review" | "trip" | "journal";
type Period = "week" | "month" | "all";

const TYPE_META: Record<RankType, { label: string; icon: string; color: string; unit: string }> = {
  guide:   { label: "攻略王",   icon: "📝", color: "#8B6914", unit: "篇" },
  review:  { label: "评价达人", icon: "⭐", color: "#B91C1C", unit: "条" },
  trip:    { label: "行程达人", icon: "✈️", color: "#3264ff", unit: "程" },
  journal: { label: "日记作家", icon: "📖", color: "#2D8B6F", unit: "篇" },
};

const PERIOD_META: Record<Period, string> = {
  week: "本周",
  month: "本月",
  all: "总榜",
};

export default function Rankings() {
  const nav = useNavigate();
  const [type, setType] = useState<RankType>("guide");
  const [period, setPeriod] = useState<Period>("month");
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRankings(type, period)
      .then((r) => {
        if (!cancelled) setItems(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, period]);

  const meta = TYPE_META[type];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero */}
      <div
        className="px-5 pt-10 pb-8 text-center"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, ${meta.color} 100%)`,
        }}
      >
        <p className="text-[11px] font-bold tracking-[2px] text-yellow-300">COMMUNITY LEADERBOARD</p>
        <h1 className="text-2xl font-bold text-white mt-2">{meta.label}榜</h1>
        <p className="text-xs text-white/80 mt-1">{PERIOD_META[period]} · 热度最高</p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {(Object.keys(TYPE_META) as RankType[]).map((t) => {
          const m = TYPE_META[t];
          const active = t === type;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                active ? "text-white" : "bg-gray-100 text-gray-700"
              }`}
              style={active ? { backgroundColor: m.color } : undefined}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Period picker */}
      <div className="flex gap-2 px-4 mb-3">
        {(["week", "month", "all"] as Period[]).map((p) => {
          const active = p === period;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {PERIOD_META[p]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: meta.color, borderTopColor: "transparent" }}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-gray-400">
          <span className="text-4xl mb-3">🏆</span>
          <p className="text-sm">暂无数据</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="flex gap-2 px-4 items-end mb-4">
              {top3.map((u) => {
                const podiumBg =
                  u.rank === 1 ? "bg-yellow-50 border-yellow-300"
                  : u.rank === 2 ? "bg-gray-100 border-gray-300"
                  : "bg-orange-100 border-orange-300";
                const medal = u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : "🥉";
                return (
                  <button
                    key={u.userId}
                    onClick={() => nav(`/users/${u.userId}`)}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border ${podiumBg}`}
                  >
                    <span className="text-3xl">{medal}</span>
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.nickname} className="w-12 h-12 rounded-full mt-1.5 object-cover" />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full mt-1.5 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: meta.color }}
                      >
                        {u.nickname.slice(0, 1)}
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-900 mt-1.5 truncate max-w-full text-center">{u.nickname}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: meta.color }}>
                      {u.count} {meta.unit}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Remaining list */}
          <div className="divide-y divide-gray-100">
            {rest.map((u) => (
              <button
                key={u.userId}
                onClick={() => nav(`/users/${u.userId}`)}
                className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50"
              >
                <span className="w-7 text-sm font-bold text-gray-500">{u.rank}</span>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.nickname} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                    {u.nickname.slice(0, 1)}
                  </div>
                )}
                <span className="flex-1 text-left text-sm font-semibold text-gray-900 truncate">{u.nickname}</span>
                <span className="text-xs font-bold" style={{ color: meta.color }}>
                  {u.count} {meta.unit}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
