"use client";

import { useEffect, useMemo, useState } from "react";
import {
  submitWisdomQuery,
  synthesizeWisdom,
  fetchWisdomHistory,
  startWisdomDebate,
  WISDOM_TRADITIONS,
  type WisdomQuery,
  type WisdomSynthesis,
} from "@/lib/api";

const DEFAULT_SELECTED = ["ZEN", "TAOISM", "CONFUCIANISM", "CHRISTIANITY", "ISLAM", "HINDUISM"];

function dialecticHint(n: number): { tone: string; title: string; pros: string; cons: string } {
  if (n <= 4)
    return {
      tone: "text-emerald-200",
      title: "🎯 专精深入",
      pros: "答复聚焦，不分散心力，易一门深入",
      cons: "视野局限，可能强化偏执",
    };
  if (n <= 7)
    return {
      tone: "text-amber-200",
      title: "⚖️ 博约平衡 · 推荐",
      pros: "跨传统对话张力足，易发现融通点",
      cons: "信息密度中等，需用心辨析",
    };
  return {
    tone: "text-sky-200",
    title: "🌌 博观海纳",
    pros: "十二大文化全景呈现，真正的智慧大海",
    cons: "耗时长 (60-120s)，心散易浅尝辄止",
  };
}

function parseSynthesis(s: string | null): WisdomSynthesis | null {
  if (!s) return null;
  try {
    const o = JSON.parse(s);
    if (o && typeof o === "object" && Array.isArray(o.convergence)) return o as WisdomSynthesis;
  } catch {}
  return null;
}

export default function WisdomPage() {
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [current, setCurrent] = useState<WisdomQuery | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [history, setHistory] = useState<WisdomQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [debating, setDebating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const hint = dialecticHint(selected.length);
  const synthesis = useMemo(() => parseSynthesis(current?.synthesized ?? null), [current]);

  const loadHistory = () =>
    fetchWisdomHistory(1, 10).then((r) => setHistory(r.items)).catch(() => {});

  useEffect(() => {
    loadHistory();
  }, []);

  const toggleTradition = (code: string) =>
    setSelected((prev) => {
      if (prev.includes(code)) {
        if (prev.length <= 3) return prev;
        return prev.filter((x) => x !== code);
      }
      if (prev.length >= 12) return prev;
      return [...prev, code];
    });

  const onAsk = async () => {
    if (question.trim().length < 5) {
      setError("问题至少 5 个字");
      return;
    }
    if (selected.length < 3) {
      setError("至少选 3 位大师");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await submitWisdomQuery({ question: question.trim(), traditions: selected });
      setCurrent(res);
      setChosen([]);
      setExpanded(new Set());
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提问失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleChosen = (t: string) =>
    setChosen((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleExpand = (t: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const onSynthesize = async () => {
    if (!current || chosen.length === 0) return;
    setLoading(true);
    try {
      const res = await synthesizeWisdom({ queryId: current.id, chosenTraditions: chosen });
      setCurrent(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "融合失败");
    } finally {
      setLoading(false);
    }
  };

  const onDebate = async () => {
    if (!current) return;
    setDebating(true);
    setError(null);
    try {
      const res = await startWisdomDebate(current.id, 3);
      setCurrent(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "圆桌启动失败");
    } finally {
      setDebating(false);
    }
  };

  const masterEmoji = (code: string) =>
    WISDOM_TRADITIONS.find((x) => x.code === code)?.emoji ?? "✨";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">智慧融通问答</h1>
        <p className="text-amber-200/60">3-12 文化大师深度作答 · 圆桌讨论 · 融通合一</p>
      </div>

      {/* 提问区 */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="向大师们提问，例如：如何在事业失意时保持内心安稳？"
          className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
        />

        {/* 大师数量 + 辩证提示 */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-100/70">选择大师数量 · 修行辩证</span>
            <span className="text-lg font-bold text-amber-100">{selected.length} 位</span>
          </div>
          <div className={`text-sm ${hint.tone} space-y-1`}>
            <div className="font-semibold">{hint.title}</div>
            <div className="text-xs opacity-80">优势：{hint.pros}</div>
            <div className="text-xs opacity-80">代价：{hint.cons}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
            {WISDOM_TRADITIONS.map((t) => {
              const on = selected.includes(t.code);
              return (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => toggleTradition(t.code)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                    on
                      ? "border-amber-400 bg-amber-500/15 text-amber-100"
                      : "border-amber-900/50 bg-amber-950/40 text-amber-100/50 hover:border-amber-700"
                  }`}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-amber-100/40">{question.length} / 500</span>
          <button
            onClick={onAsk}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
          >
            {loading ? "请教中..." : `向 ${selected.length} 师请教`}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {current && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-100">
              {current.answers.length} 大师作答
            </h2>
            {!current.debate && current.answers.filter((a) => a.status === "OK").length >= 2 && (
              <button
                onClick={onDebate}
                disabled={debating}
                className="px-4 py-2 rounded-lg border border-amber-400/50 bg-amber-500/10 text-amber-100 text-sm hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {debating ? "圆桌进行中..." : "🔄 启动大师圆桌 (3 轮)"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.answers.map((a) => {
              const isChosen = chosen.includes(a.tradition);
              const isOpen = expanded.has(a.tradition);
              const failed = a.status !== "OK";
              return (
                <div
                  key={a.tradition}
                  className={`rounded-xl border p-4 transition-all ${
                    failed
                      ? "border-amber-900/30 bg-amber-950/10 opacity-60"
                      : isChosen
                        ? "border-amber-400 bg-amber-500/15"
                        : "border-amber-900/50 bg-amber-950/30 hover:border-amber-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{masterEmoji(a.tradition)}</span>
                      <span className="font-bold text-amber-100">{a.masterName}</span>
                    </div>
                    <span className="text-xs text-amber-200/40">{a.tradition}</span>
                  </div>
                  <p
                    className={`text-sm text-amber-100/80 leading-relaxed whitespace-pre-wrap ${
                      isOpen ? "" : "line-clamp-4"
                    }`}
                  >
                    {a.answer}
                  </p>
                  {a.keyPoints && a.keyPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {a.keyPoints.map((k, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                  {a.citations && a.citations.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {a.citations.map((c, i) => (
                        <div
                          key={i}
                          className="text-xs text-amber-200/70 border-l-2 border-amber-500/40 pl-2"
                        >
                          {c.title && <span className="font-semibold">《{c.title}》</span>}
                          <span className="italic">"{c.quote}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!failed && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-900/30">
                      <button
                        onClick={() => toggleExpand(a.tradition)}
                        className="text-xs text-amber-300/70 hover:text-amber-200"
                      >
                        {isOpen ? "收起" : "展开全文"}
                      </button>
                      <button
                        onClick={() => toggleChosen(a.tradition)}
                        className={`text-xs px-3 py-1 rounded-full border ${
                          isChosen
                            ? "border-amber-400 bg-amber-500/30 text-amber-50"
                            : "border-amber-700/50 text-amber-200/70 hover:border-amber-500"
                        }`}
                      >
                        {isChosen ? "✓ 已选入融合" : "选入融合"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {chosen.length > 0 && (
            <button
              onClick={onSynthesize}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {loading ? "融合中..." : `融合所选 ${chosen.length} 派智慧`}
            </button>
          )}

          {/* 结构化融合 */}
          {synthesis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-5">
                <div className="text-xs text-emerald-300 uppercase tracking-widest mb-2">✨ 共识</div>
                <ul className="space-y-1.5 text-sm text-emerald-100/90">
                  {synthesis.convergence.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-400/40 bg-rose-500/5 p-5">
                <div className="text-xs text-rose-300 uppercase tracking-widest mb-2">⚡ 分歧</div>
                <ul className="space-y-2 text-sm text-rose-100/90">
                  {synthesis.divergence.map((d, i) => (
                    <li key={i}>
                      <span className="font-semibold">{d.tradition}</span>: {d.stance}
                      <div className="text-xs opacity-70 mt-0.5">{d.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-amber-900/20 p-5 md:col-span-2">
                <div className="text-xs text-amber-300 uppercase tracking-widest mb-2">🌉 融通建议</div>
                <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">{synthesis.integration}</p>
              </div>
              <div className="rounded-2xl border border-sky-400/40 bg-sky-500/5 p-5 md:col-span-2">
                <div className="text-xs text-sky-300 uppercase tracking-widest mb-2">🎯 今日可行</div>
                <p className="text-sky-100 leading-relaxed">{synthesis.practice}</p>
              </div>
            </div>
          ) : (
            current.synthesized && (
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-amber-900/20 p-6">
                <div className="text-xs text-amber-300 uppercase tracking-widest mb-2">融合答案</div>
                <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">
                  {current.synthesized}
                </p>
              </div>
            )
          )}

          {/* 圆桌讨论时间线 */}
          {current.debate && current.debate.rounds.length > 0 && (
            <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-6">
              <h2 className="text-lg font-bold text-amber-100">🔄 大师圆桌讨论</h2>
              {current.debate.rounds.map((round) => (
                <div key={round.round} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-amber-900/50" />
                    <span className="text-sm text-amber-300 font-bold">第 {round.round} 轮</span>
                    <div className="h-px flex-1 bg-amber-900/50" />
                  </div>
                  <div className="space-y-3">
                    {round.turns.map((t) => (
                      <div
                        key={t.tradition}
                        className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{masterEmoji(t.tradition)}</span>
                            <span className="font-bold text-amber-100 text-sm">{t.masterName}</span>
                          </div>
                          {t.repliesTo && t.repliesTo.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-200/50">
                              <span>呼应</span>
                              {t.repliesTo.map((r) => (
                                <span key={r} className="px-1.5 py-0.5 rounded bg-amber-500/10">
                                  {masterEmoji(r)} {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-amber-100/80 leading-relaxed whitespace-pre-wrap">
                          {t.response}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
          <h2 className="text-lg font-bold text-amber-100 mb-4">最近问答</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setCurrent(h);
                  setChosen([]);
                  setExpanded(new Set());
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-amber-950/40 transition-colors"
              >
                <div className="text-sm text-amber-100 line-clamp-1">{h.question}</div>
                <div className="text-xs text-amber-200/40 mt-0.5">
                  {new Date(h.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
