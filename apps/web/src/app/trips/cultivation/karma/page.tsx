"use client";

import { useEffect, useState } from "react";
import {
  coachKarmaDraft,
  createKarmaEvent,
  deleteKarmaEvent,
  fetchKarmaTimeline,
  reanalyzeKarmaEvent,
  type KarmaCausalNode,
  type KarmaEvent,
  type KarmaTraditionInsight,
} from "@/lib/api";

const INTENT_OPTIONS = [
  { value: "反思", icon: "🪞" },
  { value: "决策", icon: "⚖️" },
  { value: "情绪", icon: "🌊" },
  { value: "感悟", icon: "✨" },
  { value: "争吵", icon: "🔥" },
  { value: "喜悦", icon: "🌸" },
];

const REALM_LABEL: Record<string, string> = {
  AWAKENING: "初觉",
  CLARIFYING: "明心",
  SEEING: "见性",
  ATTAINING: "定力",
  INTEGRATING: "融通",
  RETURNING: "归真",
  GIVING_BACK: "布施",
};

const TRADITION_ICON: Record<string, string> = {
  ZEN: "🧘",
  BUDDHISM: "☸",
  TAOISM: "☯",
  CONFUCIANISM: "📜",
  TIBETAN: "🕉",
  HINDUISM: "🕉",
  SIKHISM: "☬",
  CHRISTIANITY: "✝",
  JUDAISM: "✡",
  ISLAM: "☪",
  BAHAI: "⭐",
  SHINTO: "⛩",
  INDIGENOUS: "🪶",
};

const NODE_LABEL: Record<string, { label: string; color: string }> = {
  CAUSE: { label: "因", color: "text-sky-300 border-sky-400/40 bg-sky-500/10" },
  EVENT: { label: "事", color: "text-amber-300 border-amber-400/40 bg-amber-500/10" },
  EFFECT: { label: "果", color: "text-rose-300 border-rose-400/40 bg-rose-500/10" },
  INSIGHT: { label: "觉", color: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10" },
};

type Step = "idle" | "rough" | "draft" | "analyzed";

export default function KarmaPage() {
  const [items, setItems] = useState<KarmaEvent[]>([]);
  const [step, setStep] = useState<Step>("idle");

  // Step: rough
  const [rough, setRough] = useState("");
  const [intent, setIntent] = useState<string>("");
  const [coaching, setCoaching] = useState(false);
  const [coachNote, setCoachNote] = useState<string>("");
  const [guidingQuestions, setGuidingQuestions] = useState<string[]>([]);

  // Step: draft
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventAt, setEventAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [visibility, setVisibility] = useState<"PRIVATE" | "FRIENDS" | "PUBLIC">("PRIVATE");
  const [submitting, setSubmitting] = useState(false);

  // Step: analyzed
  const [justSaved, setJustSaved] = useState<KarmaEvent | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);

  const load = () =>
    fetchKarmaTimeline(1, 50)
      .then((r) => setItems(Array.isArray(r?.items) ? r.items : []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setStep("idle");
    setRough("");
    setIntent("");
    setTitle("");
    setBody("");
    setCoachNote("");
    setGuidingQuestions([]);
    setJustSaved(null);
    setError(null);
  };

  const onCoach = async () => {
    if (!rough.trim()) {
      setError("先随手写几句，小鸿才能帮你");
      return;
    }
    setCoaching(true);
    setError(null);
    try {
      const res = await coachKarmaDraft({ roughNotes: rough.trim(), intent: intent || undefined });
      setTitle(res.suggestedTitle ?? "");
      setBody(res.structuredBody ?? rough);
      setGuidingQuestions(res.guidingQuestions ?? []);
      setCoachNote(
        res.source === "llm"
          ? "✨ 小鸿已为你整理好草稿，下面可以继续修改"
          : "⚠️ 小鸿暂时不在，先用模板起草",
      );
      setStep("draft");
    } catch (e) {
      setError(e instanceof Error ? e.message : "小鸿起草失败");
    } finally {
      setCoaching(false);
    }
  };

  const onSave = async () => {
    if (!title.trim() || !body.trim()) {
      setError("标题和正文不能为空");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const saved = await createKarmaEvent({
        title: title.trim(),
        body: body.trim(),
        eventAt: new Date(eventAt).toISOString(),
        visibility,
      });
      setJustSaved(saved);
      setStep("analyzed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("删除这条因缘?")) return;
    await deleteKarmaEvent(id);
    if (openDetailId === id) setOpenDetailId(null);
    load();
  };

  const onReanalyze = async (id: string) => {
    setReanalyzing(id);
    try {
      const updated = await reanalyzeKarmaEvent(id);
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      if (justSaved?.id === id) setJustSaved(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "重新分析失败");
    } finally {
      setReanalyzing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-100 mb-1">因缘日志</h1>
          <p className="text-amber-200/60 text-sm">
            🔮 小鸿深度介入 · 写前引导思路 · 写后因果链分析 · 12 文化智慧融通
          </p>
        </div>
        <button
          onClick={() => (step === "idle" ? setStep("rough") : resetForm())}
          className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          {step === "idle" ? "+ 记一笔" : "取消"}
        </button>
      </div>

      {/* 觉门 banner */}
      {step === "idle" && (
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🪷</span>
            <div className="text-sm leading-relaxed">
              <p className="text-amber-200 font-semibold mb-1">小鸿的觉门 · AI 方便法门</p>
              <p className="text-amber-100/70">
                不用担心思路乱、没耐心。只需要抛几句零散的想法或情绪，小鸿会帮你
                <span className="text-amber-300">理清思路</span>、生成结构化草稿；保存后再做
                <span className="text-amber-300">因果链多维度分析</span>，融入 12
                文化传统的智慧，让一件小事成为觉知之源。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step: ROUGH 随手写 */}
      {step === "rough" && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xs">1</span>
            <span className="font-semibold">随手写 · 思路乱也没关系</span>
          </div>

          {/* Intent chips */}
          <div className="flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntent(intent === opt.value ? "" : opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  intent === opt.value
                    ? "bg-amber-500/20 border-amber-400 text-amber-100"
                    : "bg-amber-950/40 border-amber-900/50 text-amber-200/70 hover:border-amber-700"
                }`}
              >
                {opt.icon} {opt.value}
              </button>
            ))}
          </div>

          <textarea
            value={rough}
            onChange={(e) => setRough(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="写下让你触动、困惑、感动、愤怒或喜悦的事。碎片也行，不用完整。&#10;比如：「今天和合伙人吵了，很憋屈，但又说不清到底在气什么…」"
            className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500 leading-relaxed"
          />

          <button
            onClick={onCoach}
            disabled={coaching || !rough.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg disabled:opacity-50"
          >
            {coaching ? "🔮 小鸿正在帮你理清思路…" : "🔮 让小鸿帮我理清思路"}
          </button>
        </div>
      )}

      {/* Step: DRAFT 编辑草稿 */}
      {step === "draft" && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xs">2</span>
            <span className="font-semibold">小鸿起草 · 你来微调</span>
          </div>

          {coachNote && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-2 text-xs text-amber-200">
              {coachNote}
            </div>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="事件标题"
            className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            maxLength={5000}
            placeholder="详细描述这件事的经过、感受、思考…"
            className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500 leading-relaxed font-mono text-sm"
          />

          {guidingQuestions.length > 0 && (
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/5 p-4">
              <p className="text-sky-300 font-semibold text-xs mb-2">💭 小鸿给你的自省问题 · 可以试着在正文里回答</p>
              <ul className="space-y-1.5 text-sm text-sky-200/80">
                {guidingQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sky-400">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className="rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"
            />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className="rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"
            >
              <option value="PRIVATE">仅自己</option>
              <option value="FRIENDS">同修可见</option>
              <option value="PUBLIC">公开</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("rough")}
              className="px-4 py-3 rounded-xl border border-amber-900/60 text-amber-200 hover:border-amber-600"
            >
              ← 重新起草
            </button>
            <button
              onClick={onSave}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? "🪷 小鸿正在做深度分析…" : "保存 · 让小鸿分析因果链"}
            </button>
          </div>
        </div>
      )}

      {/* Step: ANALYZED 深度分析展示 */}
      {step === "analyzed" && justSaved && (
        <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-950/30 to-amber-950/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xs">3</span>
              <span className="font-semibold">小鸿的深度觉察</span>
            </div>
            <button
              onClick={resetForm}
              className="text-xs text-amber-300 hover:text-amber-100"
            >
              收起 · 查看时间线 →
            </button>
          </div>

          <KarmaDeepAnalysis event={justSaved} onReanalyze={() => onReanalyze(justSaved.id)} reanalyzing={reanalyzing === justSaved.id} />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {items.length === 0 && step === "idle" && (
          <div className="text-center py-12 text-amber-200/40">
            还没有因缘记录。点击「+ 记一笔」，让小鸿带你走觉门。
          </div>
        )}
        {items.map((ev) => {
          const isOpen = openDetailId === ev.id;
          return (
            <div
              key={ev.id}
              className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 hover:border-amber-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-amber-100 flex-1">{ev.title}</h3>
                <button
                  onClick={() => onDelete(ev.id)}
                  className="text-rose-300/60 hover:text-rose-300 text-xs"
                >
                  删除
                </button>
              </div>
              <p className="text-sm text-amber-100/70 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-3">
                {ev.body}
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-200/40 flex-wrap">
                <span>{new Date(ev.eventAt).toLocaleString()}</span>
                <span>·</span>
                <span>{ev.visibility}</span>
                {ev.aiRealmTag && (
                  <>
                    <span>·</span>
                    <span className="text-amber-300">境界: {REALM_LABEL[ev.aiRealmTag] ?? ev.aiRealmTag}</span>
                  </>
                )}
                {ev.aiCauseTag && (
                  <>
                    <span>·</span>
                    <span className="text-sky-300">因: {ev.aiCauseTag}</span>
                  </>
                )}
                {ev.aiEffectTag && (
                  <>
                    <span>·</span>
                    <span className="text-rose-300">果: {ev.aiEffectTag}</span>
                  </>
                )}
              </div>

              {ev.aiAdvice && !isOpen && (
                <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-400/30 px-3 py-2 text-xs text-amber-200">
                  🪷 {ev.aiAdvice}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setOpenDetailId(isOpen ? null : ev.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-amber-600/50 text-amber-200 hover:bg-amber-500/10"
                >
                  {isOpen ? "收起" : "查看深度分析"}
                </button>
                {(!ev.aiCausalChain || (ev.aiCausalChain as unknown as unknown[]).length === 0) && (
                  <button
                    onClick={() => onReanalyze(ev.id)}
                    disabled={reanalyzing === ev.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-600/50 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    {reanalyzing === ev.id ? "小鸿分析中…" : "🔮 重新分析"}
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-amber-900/50">
                  <KarmaDeepAnalysis
                    event={ev}
                    onReanalyze={() => onReanalyze(ev.id)}
                    reanalyzing={reanalyzing === ev.id}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KarmaDeepAnalysis({
  event,
  onReanalyze,
  reanalyzing,
}: {
  event: KarmaEvent;
  onReanalyze: () => void;
  reanalyzing: boolean;
}) {
  const causalChain = Array.isArray(event.aiCausalChain) ? (event.aiCausalChain as KarmaCausalNode[]) : [];
  const insights = Array.isArray(event.aiTraditionInsights) ? (event.aiTraditionInsights as KarmaTraditionInsight[]) : [];

  return (
    <div className="space-y-5">
      {/* Realm + advice */}
      {(event.aiRealmTag || event.aiAdvice) && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-400/30 p-4">
          {event.aiRealmTag && (
            <p className="text-amber-300 text-sm font-semibold mb-2">
              ☸ 此刻的境界 · {REALM_LABEL[event.aiRealmTag] ?? event.aiRealmTag}
            </p>
          )}
          {event.aiAdvice && <p className="text-amber-100/80 text-sm leading-relaxed">{event.aiAdvice}</p>}
        </div>
      )}

      {/* Causal chain timeline */}
      {causalChain.length > 0 && (
        <div>
          <p className="text-amber-200/60 text-xs font-semibold uppercase tracking-wider mb-3">
            因果链 · Karma Chain
          </p>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-sky-400/40 via-amber-400/40 via-rose-400/40 to-emerald-400/40" />
            {causalChain.map((node, i) => {
              const style = NODE_LABEL[node.type] ?? {
                label: node.type.slice(0, 1),
                color: "text-amber-300 border-amber-400/40 bg-amber-500/10",
              };
              return (
                <div key={i} className="relative mb-3 last:mb-0">
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${style.color}`}
                  >
                    {style.label}
                  </div>
                  <div className="text-sm text-amber-100/80 leading-relaxed pl-1">{node.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tradition insights grid */}
      {insights.length > 0 && (
        <div>
          <p className="text-amber-200/60 text-xs font-semibold uppercase tracking-wider mb-3">
            12 文化智慧 · Multi-Tradition Wisdom
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 hover:border-amber-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{TRADITION_ICON[ins.tradition] ?? "📖"}</span>
                  <span className="text-xs text-amber-300 font-semibold">{ins.tradition}</span>
                  <span className="text-xs text-amber-100/40">·</span>
                  <span className="text-xs text-amber-100/70 truncate">《{ins.scriptureTitle}》</span>
                </div>
                <p className="text-sm text-amber-100/80 leading-relaxed italic mb-2 pl-2 border-l-2 border-amber-600/40">
                  "{ins.quote}"
                </p>
                {ins.guidance && <p className="text-xs text-amber-200/60 leading-relaxed">🪷 {ins.guidance}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty / reanalyze fallback */}
      {causalChain.length === 0 && insights.length === 0 && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200/60">
          小鸿尚未完成深度分析。点击下方按钮让小鸿重新解读这件因缘。
        </div>
      )}

      <button
        onClick={onReanalyze}
        disabled={reanalyzing}
        className="w-full py-2 rounded-lg border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 text-xs disabled:opacity-50"
      >
        {reanalyzing ? "小鸿分析中…" : "🔮 让小鸿再思考一次"}
      </button>
    </div>
  );
}
