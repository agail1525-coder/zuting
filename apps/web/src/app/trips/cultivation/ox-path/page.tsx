"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOxPath, advanceOxStage, fetchQuizProgress, type OxPathResponse, type QuizProgressResponse } from "@/lib/api";

const STAGE_NAMES = [
  "寻牛", "见迹", "见牛", "得牛", "牧牛",
  "骑牛归家", "忘牛存人", "人牛俱忘", "返本还源", "入廛垂手",
];

const STAGE_DESC = [
  "心猿意马，初心觅道",
  "略见踪迹，信心初生",
  "亲见本性，欣喜非常",
  "得遇真心，犹须调伏",
  "调伏渐熟，习气渐消",
  "心牛合一，自在归家",
  "牛去人在，能所未泯",
  "人牛俱忘，能所双绝",
  "返本还源，无修无证",
  "和光同尘，垂手入廛",
];

export default function OxPathPage() {
  const [data, setData] = useState<OxPathResponse | null>(null);
  const [quizProgress, setQuizProgress] = useState<QuizProgressResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const load = () => {
    fetchOxPath().then(setData).catch((e) => setError(e.message));
    fetchQuizProgress().then(setQuizProgress).catch(() => {});
  };

  useEffect(() => {
    load();
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

  if (!data) return <div className="text-amber-200/60 py-20 text-center">加载中...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">十牛图修行路径</h1>
        <p className="text-amber-200/60">禅宗主脉 · 十阶心性图</p>
      </div>

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
          const idx = s.stage - 1;
          return (
            <div
              key={s.stage}
              className={`rounded-2xl border p-5 transition-all ${
                s.current
                  ? "border-amber-400 bg-gradient-to-br from-amber-900/40 to-amber-950/40 shadow-lg shadow-amber-500/10"
                  : s.unlocked
                  ? "border-amber-900/50 bg-amber-950/30"
                  : "border-amber-900/20 bg-amber-950/10 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    s.current
                      ? "bg-amber-500 text-white"
                      : s.unlocked
                      ? "bg-amber-900/50 text-amber-300"
                      : "bg-amber-950/30 text-amber-200/30"
                  }`}
                >
                  {s.stage}
                </div>
                <div>
                  <div className="font-bold text-amber-100">{STAGE_NAMES[idx]}</div>
                  <div className="text-xs text-amber-200/40">第 {s.stage} 阶</div>
                </div>
                {s.current && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    当前
                  </span>
                )}
              </div>
              <p className="text-amber-100/60 text-sm leading-relaxed">{STAGE_DESC[idx]}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 text-center">
        <p className="text-amber-100/70 text-sm mb-3">
          连续通过 21 天禅修考核即可申请晋阶
          {quizProgress ? ` (当前 ${quizProgress.quizPassedStreak}/21)` : ""}
        </p>
        <button
          onClick={onAdvance}
          disabled={advancing || data.currentStage >= 10}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {data.currentStage >= 10 ? "已至圆融境" : advancing ? "晋阶中..." : "申请晋阶"}
        </button>
      </div>
    </div>
  );
}
