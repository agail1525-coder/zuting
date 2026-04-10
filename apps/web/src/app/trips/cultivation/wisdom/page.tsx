"use client";

import { useEffect, useState } from "react";
import {
  submitWisdomQuery,
  synthesizeWisdom,
  fetchWisdomHistory,
  type WisdomQuery,
} from "@/lib/api";

export default function WisdomPage() {
  const [question, setQuestion] = useState("");
  const [current, setCurrent] = useState<WisdomQuery | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [history, setHistory] = useState<WisdomQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = () =>
    fetchWisdomHistory(1, 10).then((r) => setHistory(r.items)).catch(() => {});

  useEffect(() => {
    loadHistory();
  }, []);

  const onAsk = async () => {
    if (question.trim().length < 5) {
      setError("问题至少 5 个字");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await submitWisdomQuery({ question: question.trim() });
      setCurrent(res);
      setChosen([]);
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提问失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleChosen = (t: string) =>
    setChosen((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">智慧融通问答</h1>
        <p className="text-amber-200/60">12 文化大师并行作答 · 你来融合 (10/小时)</p>
      </div>

      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="向 12 位大师提问，例如：如何在事业失意时保持内心安稳？"
          className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-amber-100/40">{question.length} / 500</span>
          <button
            onClick={onAsk}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
          >
            {loading ? "请教中..." : "向 12 师请教"}
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
          <h2 className="text-lg font-bold text-amber-100">12 大师作答</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.answers.map((a) => (
              <button
                key={a.tradition}
                onClick={() => toggleChosen(a.tradition)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  chosen.includes(a.tradition)
                    ? "border-amber-400 bg-amber-500/15"
                    : "border-amber-900/50 bg-amber-950/30 hover:border-amber-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-100">{a.masterName}</span>
                  <span className="text-xs text-amber-200/40">{a.tradition}</span>
                </div>
                <p className="text-sm text-amber-100/70 leading-relaxed line-clamp-4">{a.answer}</p>
              </button>
            ))}
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

          {current.synthesized && (
            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-amber-900/20 p-6">
              <div className="text-xs text-amber-300 uppercase tracking-widest mb-2">融合答案</div>
              <p className="text-amber-100 leading-relaxed">{current.synthesized}</p>
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
                onClick={() => setCurrent(h)}
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
