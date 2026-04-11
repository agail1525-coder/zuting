"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchOxPath,
  advanceOxStage,
  fetchQuizProgress,
  fetchZenHouses,
  setZenHouse,
  fetchBhumiGate,
  type OxPathResponse,
  type QuizProgressResponse,
  type ZenHouseMeta,
} from "@/lib/api";

type HouseListItem = Omit<ZenHouseMeta, "signatureKoans"> & { foundedEra: string };

export default function OxPathPage() {
  const [data, setData] = useState<OxPathResponse | null>(null);
  const [quizProgress, setQuizProgress] = useState<QuizProgressResponse | null>(null);
  const [houses, setHouses] = useState<HouseListItem[]>([]);
  const [gate, setGate] = useState<{ eligible: boolean; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [switching, setSwitching] = useState(false);

  const load = () => {
    fetchOxPath().then(setData).catch((e) => setError(e.message));
    fetchQuizProgress().then(setQuizProgress).catch(() => {});
    fetchBhumiGate().then((g) => setGate({ eligible: g.eligible, reason: g.reason })).catch(() => {});
  };

  useEffect(() => {
    load();
    fetchZenHouses().then(setHouses).catch(() => {});
  }, []);

  const onAdvance = async () => {
    setAdvancing(true);
    setError(null);
    try {
      await advanceOxStage();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "晋阶失败");
    } finally {
      setAdvancing(false);
    }
  };

  const onPickHouse = async (code: string | null) => {
    setSwitching(true);
    setError(null);
    try {
      await setZenHouse(code);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "切换宗风失败");
    } finally {
      setSwitching(false);
    }
  };

  if (!data) return <div className="text-amber-200/60 py-20 text-center">加载中...</div>;

  const house = data.house;
  const houseColor = house?.color || "#D4A855";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
        <Link
          href="/trips/cultivation/ox-path"
          className="px-4 py-2 rounded-t-lg bg-amber-500/20 border border-amber-400/40 text-amber-100 font-bold text-sm"
        >
          🐃 十牛图 · 自觉
        </Link>
        <Link
          href="/trips/cultivation/bhumi-path"
          className={`px-4 py-2 rounded-t-lg border text-sm transition-all ${
            gate?.eligible
              ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/20"
              : "bg-emerald-950/20 border-emerald-900/30 text-emerald-200/30"
          }`}
          title={gate?.reason || ""}
        >
          {gate?.eligible ? "🪷 菩萨十地 · 觉他" : "🔒 菩萨十地 (待解锁)"}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-100 mb-1">十牛图修行路径</h1>
          <p className="text-amber-200/60">
            {house ? `${house.name} · ${house.motto}` : "禅宗主脉 · 十阶心性图 · 通宗兼采五家"}
          </p>
        </div>
        {houses.length > 0 && (
          <div className="shrink-0">
            <label className="block text-xs text-amber-200/60 mb-1">🌸 一花五叶 · 宗风</label>
            <select
              value={data.zenHouse || ""}
              onChange={(e) => onPickHouse(e.target.value || null)}
              disabled={switching}
              className="bg-amber-950/40 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-amber-100 min-w-[180px]"
            >
              <option value="">通宗 · 兼采五家</option>
              {houses.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.emoji} {h.name} · {h.motto}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {house && (
        <div
          className="rounded-2xl p-5 border-2 bg-gradient-to-r"
          style={{
            borderColor: `${houseColor}66`,
            background: `linear-gradient(to right, ${houseColor}1a, ${houseColor}05)`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{house.emoji}</span>
            <div>
              <div className="font-bold text-lg" style={{ color: houseColor }}>
                {house.name}
              </div>
              <div className="text-xs text-amber-200/60">
                {house.founder} · {house.motto}
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-100/80 leading-relaxed">{house.introStyle}</p>
          {house.signatureKoans && house.signatureKoans.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-900/40">
              <div className="text-xs text-amber-200/50 mb-1">代表公案</div>
              <ul className="text-xs text-amber-100/70 space-y-1">
                {house.signatureKoans.slice(0, 2).map((k, i) => (
                  <li key={i}>· {k}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* 今日禅修考核 */}
      {quizProgress && (
        <div className="rounded-2xl border border-amber-700/50 bg-gradient-to-r from-amber-900/30 to-amber-950/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-amber-100 flex items-center gap-2">
              <span className="text-xl">🪷</span> 每日禅修考核
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300">
              {quizProgress.todayStatus === "PASSED"
                ? "今日已通过"
                : quizProgress.todayStatus === "FAILED"
                ? "今日未通过"
                : quizProgress.todayStatus === "IN_PROGRESS"
                ? "答题中..."
                : "未开始"}
            </span>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-amber-200/60">
                连续通过 {quizProgress.quizPassedStreak} / 21 天
              </span>
              <span className="text-amber-300 font-bold">
                {quizProgress.daysToAdvancement > 0
                  ? `还需 ${quizProgress.daysToAdvancement} 天`
                  : "可以晋阶！"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-950/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                style={{ width: `${Math.min(100, (quizProgress.quizPassedStreak / 21) * 100)}%` }}
              />
            </div>
          </div>
          <Link
            href="/trips/cultivation/ox-path/quiz"
            className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            {quizProgress.todayStatus === "NOT_STARTED"
              ? "开始今日修行"
              : quizProgress.todayStatus === "IN_PROGRESS"
              ? "继续修行"
              : "查看今日结果"}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.stages.map((s) => {
          const borderStyle = s.current
            ? { borderColor: houseColor, boxShadow: `0 0 24px ${houseColor}26` }
            : {};
          return (
            <div
              key={s.stage}
              className={`rounded-2xl border p-5 transition-all ${
                s.current
                  ? "border-2 bg-gradient-to-br from-amber-900/40 to-amber-950/40"
                  : s.unlocked
                  ? "border-amber-900/50 bg-amber-950/30"
                  : "border-amber-900/20 bg-amber-950/10 opacity-50"
              }`}
              style={s.current && !house ? { borderColor: "#f59e0b" } : borderStyle}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{
                    backgroundColor: s.current
                      ? houseColor
                      : s.unlocked
                      ? "#78350f"
                      : "#1c1917",
                    opacity: s.unlocked ? 1 : 0.3,
                  }}
                >
                  {s.stage}
                </div>
                <div>
                  <div className="font-bold text-amber-100">{s.name}</div>
                  <div className="text-xs text-amber-200/40">第 {s.stage} 阶</div>
                </div>
                {s.current && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full border font-bold"
                    style={{
                      color: houseColor,
                      borderColor: `${houseColor}66`,
                      backgroundColor: `${houseColor}1a`,
                    }}
                  >
                    当前
                  </span>
                )}
              </div>
              <p className="text-amber-100/70 text-sm leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 text-center space-y-3">
        <p className="text-amber-100/70 text-sm">
          连续通过 21 天禅修考核即可申请晋阶
          {quizProgress ? ` (当前 ${quizProgress.quizPassedStreak}/21)` : ""}
        </p>
        <button
          onClick={onAdvance}
          disabled={advancing || data.currentStage >= 10}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {data.currentStage >= 10 ? "已至圆融境 · 入廛垂手" : advancing ? "晋阶中..." : "申请晋阶"}
        </button>
        {data.currentStage >= 10 && (
          <div className="pt-3 border-t border-amber-900/40">
            <p className="text-emerald-200/80 text-sm mb-2">🪷 十牛已尽 · 入廛垂手 · 起大悲心 · 行菩萨道</p>
            <Link
              href="/trips/cultivation/bhumi-path"
              className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              进入菩萨十地 · 觉他路径 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
