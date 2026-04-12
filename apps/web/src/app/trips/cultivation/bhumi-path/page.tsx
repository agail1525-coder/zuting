"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBhumiPath,
  fetchBhumiGate,
  unlockBhumi,
  submitBhumiVow,
  advanceBhumi,
  type BhumiStageDetail,
  type BhumiVowDetail,
} from "@/lib/api";
import { toast } from "@/lib/toast";

const BHUMI_GREEN = "#38A676";
const BHUMI_GREEN_DARK = "#1f5a42";
const FIVE_MIN = 5 * 60 * 1000;

export default function BhumiPathPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expandedBhumi, setExpandedBhumi] = useState<number | null>(null);
  const [vowDrafts, setVowDrafts] = useState<Record<string, string>>({});

  const gateQuery = useQuery({
    queryKey: ["cultivation", "bhumi-gate"],
    queryFn: fetchBhumiGate,
    staleTime: FIVE_MIN,
  });
  const pathQuery = useQuery({
    queryKey: ["cultivation", "bhumi-path"],
    queryFn: fetchBhumiPath,
    staleTime: FIVE_MIN,
    enabled: gateQuery.data?.eligible !== false,
  });

  const data = pathQuery.data ?? null;
  const gate = gateQuery.data ?? null;

  const invalidateBhumi = () => {
    queryClient.invalidateQueries({ queryKey: ["cultivation"] });
  };

  const onUnlock = async () => {
    setBusy(true);
    setError(null);
    try {
      await unlockBhumi();
      invalidateBhumi();
      toast.success("发菩提心 · 入欢喜地", 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "发心失败";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onSubmitVow = async (bhumiStage: number, vow: BhumiVowDetail) => {
    const key = `${bhumiStage}-${vow.type}`;
    const reflection = vowDrafts[key] ?? "";
    if (vow.reflectionMin > 0 && reflection.trim().length < vow.reflectionMin) {
      const msg = `${vow.title} 需要至少 ${vow.reflectionMin} 字反思 (当前 ${reflection.trim().length})`;
      setError(msg);
      toast.warning(msg);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await submitBhumiVow({
        bhumiStage,
        vowType: vow.type,
        reflection: reflection || undefined,
        count: 1,
      });
      queryClient.setQueryData(["cultivation", "bhumi-path"], updated);
      queryClient.invalidateQueries({ queryKey: ["cultivation"] });
      setVowDrafts((d) => ({ ...d, [key]: "" }));
      toast.success("愿已纳受 · 大地为证");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "提交大愿失败";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onAdvance = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await advanceBhumi();
      invalidateBhumi();
      toast.success(`证入第 ${updated?.bhumiStage ?? "?"} 地`, 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "证入下一地失败";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  // Gate 未开
  if (gate && !gate.eligible) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
          <Link
            href="/trips/cultivation/ox-path"
            className="px-4 py-2 rounded-t-lg bg-amber-950/40 border border-amber-900/40 text-amber-200/70 text-sm hover:bg-amber-950/60"
          >
            🐃 十牛图 · 自觉
          </Link>
          <div className="px-4 py-2 rounded-t-lg border text-sm bg-emerald-500/10 border-emerald-400/40 text-emerald-200 font-bold">
            🔒 菩萨十地 · 觉他
          </div>
        </div>

        <div
          className="rounded-3xl border-2 p-10 text-center space-y-5"
          style={{ borderColor: `${BHUMI_GREEN}40`, background: `${BHUMI_GREEN}08` }}
        >
          <div className="text-6xl">🪷</div>
          <h1 className="text-3xl font-bold" style={{ color: BHUMI_GREEN }}>
            菩萨十地 · 大愿行路径
          </h1>
          <p className="text-emerald-200/80 max-w-xl mx-auto leading-relaxed">
            十牛图尽处，方为菩萨道起点。
            <br />
            自觉已成，当起大悲，回向众生，行大愿道。
          </p>

          <div className="inline-block rounded-xl bg-amber-950/40 border border-amber-900/50 px-6 py-4 text-left">
            <p className="text-sm text-amber-200/70 mb-2">入地资格</p>
            <p className="text-amber-100 font-bold">
              十牛图第十阶「入廛垂手」圆满 ({gate.oxStage}/{gate.oxRequired})
            </p>
            <p className="text-xs text-amber-200/50 mt-2">{gate.reason}</p>
          </div>

          <div>
            <Link
              href="/trips/cultivation/ox-path"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              先圆满十牛图 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    if (error) {
      return (
        <div className="py-20 text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-300/90 text-sm">{error}</p>
          <button
            onClick={() => pathQuery.refetch()}
            className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm hover:bg-emerald-500/30"
          >
            重新加载
          </button>
        </div>
      );
    }
    return <div className="text-emerald-200/60 py-20 text-center">加载中...</div>;
  }

  // Gate 已开但未发心
  if (data.currentBhumi === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
          <Link
            href="/trips/cultivation/ox-path"
            className="px-4 py-2 rounded-t-lg bg-amber-950/40 border border-amber-900/40 text-amber-200/70 text-sm hover:bg-amber-950/60"
          >
            🐃 十牛图 · 自觉
          </Link>
          <div
            className="px-4 py-2 rounded-t-lg border-2 text-sm font-bold"
            style={{ borderColor: `${BHUMI_GREEN}88`, color: BHUMI_GREEN, background: `${BHUMI_GREEN}15` }}
          >
            🪷 菩萨十地 · 觉他
          </div>
        </div>

        <div
          className="rounded-3xl border-2 p-10 text-center space-y-5"
          style={{ borderColor: `${BHUMI_GREEN}66`, background: `linear-gradient(135deg, ${BHUMI_GREEN}15, ${BHUMI_GREEN}05)` }}
        >
          <div className="text-7xl">🪷</div>
          <h1 className="text-3xl font-bold" style={{ color: BHUMI_GREEN }}>
            恭喜圆满十牛图
          </h1>
          <p className="text-emerald-100/90 text-lg leading-relaxed max-w-xl mx-auto">
            十牛已尽 · 入廛垂手
            <br />
            当发菩提心 · 起大悲愿 · 行菩萨十地
          </p>
          <div className="inline-block rounded-xl px-8 py-4" style={{ background: `${BHUMI_GREEN}18`, border: `1px solid ${BHUMI_GREEN}40` }}>
            <p className="text-xs text-emerald-200/60 mb-1">入地偈</p>
            <p className="font-bold" style={{ color: BHUMI_GREEN }}>
              愿我尽未来际 · 度一切众生 · 入无余涅槃
            </p>
          </div>
          <button
            onClick={onUnlock}
            disabled={busy}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:shadow-xl disabled:opacity-40"
            style={{ background: `linear-gradient(to right, ${BHUMI_GREEN}, ${BHUMI_GREEN_DARK})`, boxShadow: `0 0 30px ${BHUMI_GREEN}40` }}
          >
            {busy ? "发心中..." : "✨ 发菩提心 · 入欢喜地"}
          </button>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // 已解锁，显示十地卡片
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
        <Link
          href="/trips/cultivation/ox-path"
          className="px-4 py-2 rounded-t-lg bg-amber-950/40 border border-amber-900/40 text-amber-200/70 text-sm hover:bg-amber-950/60"
        >
          🐃 十牛图 · 自觉
        </Link>
        <div
          className="px-4 py-2 rounded-t-lg border-2 text-sm font-bold"
          style={{ borderColor: `${BHUMI_GREEN}88`, color: BHUMI_GREEN, background: `${BHUMI_GREEN}15` }}
        >
          🪷 菩萨十地 · 觉他
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: BHUMI_GREEN }}>
          菩萨十地 · 大愿行路径
        </h1>
        <p className="text-emerald-200/70">
          出《华严经·十地品》 · 当前第 {data.currentBhumi} 地 / 共 {data.total} 地 · 自觉觉他 · 觉行圆满
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {data.stages.map((b) => {
          const isExpanded = expandedBhumi === b.no;
          const completedVowCount = b.vows.filter((v) => v.completed).length;
          return (
            <div
              key={b.no}
              className={`rounded-2xl border-2 transition-all overflow-hidden ${
                b.current
                  ? ""
                  : b.completed
                  ? ""
                  : b.locked
                  ? "opacity-40"
                  : "opacity-70"
              }`}
              style={{
                borderColor: b.current
                  ? `${BHUMI_GREEN}`
                  : b.completed
                  ? `${BHUMI_GREEN}88`
                  : `${BHUMI_GREEN}33`,
                background: b.current
                  ? `linear-gradient(135deg, ${BHUMI_GREEN}20, ${BHUMI_GREEN}08)`
                  : b.completed
                  ? `${BHUMI_GREEN}0c`
                  : "rgba(0,0,0,0.3)",
                boxShadow: b.current ? `0 0 30px ${BHUMI_GREEN}30` : undefined,
              }}
            >
              <button
                className="w-full p-5 text-left cursor-pointer"
                onClick={() => setExpandedBhumi(isExpanded ? null : b.no)}
                disabled={b.locked}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 border-2"
                    style={{
                      background: b.current || b.completed ? `${BHUMI_GREEN}30` : "#1a1a1a",
                      borderColor: b.current ? BHUMI_GREEN : `${BHUMI_GREEN}44`,
                    }}
                  >
                    {b.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-lg text-emerald-100">
                        第{b.no}地 · {b.name}
                      </span>
                      <span className="text-xs text-emerald-300/60">{b.sanskrit}</span>
                      {b.current && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: `${BHUMI_GREEN}30`, color: BHUMI_GREEN, border: `1px solid ${BHUMI_GREEN}66` }}
                        >
                          当前
                        </span>
                      )}
                      {b.completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          ✓ 已证
                        </span>
                      )}
                      {b.locked && <span className="text-xs text-emerald-300/40">🔒 未开</span>}
                    </div>
                    <div className="text-xs text-emerald-200/60">
                      {b.paramita}波罗蜜 · {b.focus}
                    </div>
                  </div>
                  {!b.locked && (
                    <div className="text-right shrink-0">
                      <div className="text-xs text-emerald-200/60">三大愿</div>
                      <div className="text-sm font-bold" style={{ color: BHUMI_GREEN }}>
                        {completedVowCount} / 3
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs italic pl-16" style={{ color: `${BHUMI_GREEN}bb` }}>
                  「{b.gateVow}」
                </div>
              </button>

              {isExpanded && !b.locked && (
                <div
                  className="px-5 pb-5 pt-0 space-y-3 border-t"
                  style={{ borderColor: `${BHUMI_GREEN}33` }}
                >
                  {b.vows.map((v, i) => {
                    const key = `${b.no}-${v.type}`;
                    const draft = vowDrafts[key] ?? "";
                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 border"
                        style={{ borderColor: `${BHUMI_GREEN}33`, background: "rgba(0,0,0,0.3)" }}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
                            style={{
                              background: v.completed ? BHUMI_GREEN : "transparent",
                              border: `2px solid ${BHUMI_GREEN}`,
                              color: v.completed ? "#fff" : BHUMI_GREEN,
                            }}
                          >
                            {v.completed ? "✓" : i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-emerald-100 text-sm">{v.title}</div>
                            <div className="text-xs text-emerald-200/60 mt-0.5">{v.description}</div>
                            <div className="text-xs mt-1" style={{ color: `${BHUMI_GREEN}bb` }}>
                              进度 {v.done} / {v.target}
                              {v.reflectionMin > 0 && ` · 反思≥${v.reflectionMin}字`}
                            </div>
                          </div>
                        </div>
                        {b.current && !v.completed && (
                          <>
                            {v.reflectionMin > 0 && (
                              <textarea
                                value={draft}
                                onChange={(e) =>
                                  setVowDrafts((d) => ({ ...d, [key]: e.target.value }))
                                }
                                placeholder={`写下你的反思 (至少 ${v.reflectionMin} 字)...`}
                                rows={3}
                                className="w-full rounded-lg bg-black/40 border border-emerald-900/50 px-3 py-2 text-sm text-emerald-100 placeholder:text-emerald-200/30 mt-2"
                              />
                            )}
                            <button
                              onClick={() => onSubmitVow(b.no, v)}
                              disabled={busy}
                              className="mt-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-40"
                              style={{ background: `linear-gradient(to right, ${BHUMI_GREEN}, ${BHUMI_GREEN_DARK})` }}
                            >
                              {busy ? "提交中..." : "提交大愿"}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {b.current && b.canAdvance && (
                    <button
                      onClick={onAdvance}
                      disabled={busy}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-xl disabled:opacity-40 text-center"
                      style={{
                        background: `linear-gradient(to right, ${BHUMI_GREEN}, ${BHUMI_GREEN_DARK})`,
                        boxShadow: `0 0 20px ${BHUMI_GREEN}40`,
                      }}
                    >
                      {busy
                        ? "证入下一地..."
                        : b.no === 10
                        ? "✨ 证入法云地 · 愿财双圆"
                        : `✨ 证入第${b.no + 1}地`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
