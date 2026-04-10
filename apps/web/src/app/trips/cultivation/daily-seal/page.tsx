"use client";

import { useEffect, useState } from "react";
import {
  fetchTodaySeal,
  fetchSealStreak,
  submitSealPractice,
  type DailySealResponse,
} from "@/lib/api";

export default function DailySealPage() {
  const [session, setSession] = useState<"MORNING" | "EVENING">("MORNING");
  const [data, setData] = useState<DailySealResponse | null>(null);
  const [streak, setStreak] = useState<{ streakDays: number; karmaPoints: number } | null>(null);
  const [audioSec, setAudioSec] = useState(0);
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [seal, st] = await Promise.all([fetchTodaySeal(session), fetchSealStreak()]);
      setData(seal);
      setStreak(st);
      setAudioSec(seal.practice?.audioListenedSec ?? 0);
      setReflection(seal.practice?.reflection ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const onSubmit = async () => {
    if (!data) return;
    if (audioSec < 60) {
      setError("音频至少听满 60 秒才可打卡");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitSealPractice({
        sealId: data.recommendedSealId,
        session,
        audioListenedSec: audioSec,
        reflection: reflection.trim() || undefined,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-100 mb-1">每日一印</h1>
          <p className="text-amber-200/60">三十印 × 12 文化主修</p>
        </div>
        {streak && (
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-300">{streak.streakDays} 天</div>
            <div className="text-xs text-amber-200/40">连击 · {streak.karmaPoints} 因缘点</div>
          </div>
        )}
      </div>

      {/* Session toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-amber-950/40 border border-amber-900/50">
        {(["MORNING", "EVENING"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSession(s)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              session === s
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            {s === "MORNING" ? "🌅 晨课" : "🌙 晚课"}
          </button>
        ))}
      </div>

      {data && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-5">
          <div>
            <div className="text-xs text-amber-300/60 uppercase tracking-widest mb-1">推荐印</div>
            <div className="text-xl font-bold text-amber-100">{data.recommendedSealId}</div>
            <div className="text-xs text-amber-200/40 mt-1">主修：{data.tradition}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              音频听课时长 (秒) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={audioSec}
              onChange={(e) => setAudioSec(parseInt(e.target.value || "0", 10))}
              className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"
            />
            <div className="text-xs text-amber-100/40 mt-1">至少 60 秒方可打卡</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-2">
              修行心得 <span className="text-amber-100/40 text-xs font-normal">(可选)</span>
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
            />
          </div>

          {data.practice?.status === "DONE" && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/40 px-4 py-3 text-emerald-200 text-sm">
              ✓ 今日{session === "MORNING" ? "晨" : "晚"}课已完成
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
          >
            {submitting ? "提交中..." : "完成打卡"}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
