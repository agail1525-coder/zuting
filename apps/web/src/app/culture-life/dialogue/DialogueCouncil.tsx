"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

interface SpeakerTurn { religionSlug: string; text: string }

const RELIGION_NAMES: Record<string, { name: string; symbol: string; color: string }> = {
  buddhism:           { name: "佛教",       symbol: "☸", color: "#D4A855" },
  taoism:             { name: "道教",       symbol: "☯", color: "#8B5CF6" },
  confucianism:       { name: "儒家",       symbol: "孔", color: "#DC2626" },
  christianity:       { name: "基督文化",   symbol: "✝", color: "#2563EB" },
  islam:              { name: "伊斯兰文化", symbol: "☪", color: "#059669" },
  hinduism:           { name: "印度文化",   symbol: "ॐ", color: "#EA580C" },
  judaism:            { name: "犹太文化",   symbol: "✡", color: "#1D4ED8" },
  sikhism:            { name: "锡克文化",   symbol: "☬", color: "#CA8A04" },
  shinto:             { name: "神道文化",   symbol: "⛩", color: "#BE123C" },
  "tibetan-buddhism": { name: "藏传文化",   symbol: "卐", color: "#B91C1C" },
  indigenous:         { name: "原住民文化", symbol: "🌿", color: "#047857" },
  bahai:              { name: "巴哈伊文化", symbol: "★", color: "#7C3AED" },
};

export default function DialogueCouncil() {
  const [context, setContext] = useState("");
  const [turns, setTurns] = useState<SpeakerTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setErr(null);
    setTurns([]);

    try {
      const res = await fetch(`${API_BASE}/api/culture-life/dialogue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentSlug: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
          const lines = ev.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"))?.slice(6).trim();
          const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!dataLine) continue;
          try {
            const data = JSON.parse(dataLine);
            if (eventLine === "speaker") {
              currentSlug = data.religionSlug;
            } else if (eventLine === "token" && currentSlug) {
              setTurns((prev) => [...prev, { religionSlug: currentSlug!, text: data.text }]);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setErr(e?.message ?? "对话失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <label className="text-sm text-slate-300 block mb-2">你的处境或困惑</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="例如：父亲刚去世，我感到一种莫大的空虚，不知道接下来怎么活下去……"
          className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-amber-400/50 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-slate-500">{context.length}/1000</div>
          <button
            onClick={submit}
            disabled={loading || !context.trim()}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 text-slate-900 rounded-lg font-medium transition"
          >
            {loading ? "邀请 12 智者中..." : "召开圆桌 →"}
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
          {err}
        </div>
      )}

      {turns.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-slate-400">12 位智者依次发言（非评判，所有答案并置）：</div>
          {turns.map((t, i) => {
            const r = RELIGION_NAMES[t.religionSlug] ?? { name: t.religionSlug, symbol: "◇", color: "#D4A855" };
            return (
              <div key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                style={{ borderLeftColor: r.color, borderLeftWidth: 3 }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl" style={{ color: r.color }}>{r.symbol}</div>
                  <div className="text-sm text-slate-300">{r.name}</div>
                </div>
                <div className="text-slate-200 leading-relaxed">{t.text}</div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && turns.length === 0 && !err && (
        <div className="text-center text-slate-500 py-10 text-sm">
          ⚠️ 当前返回为占位响应，W5 Wave 将接入 Qwen3.5-35B 生成真实 12 智者回应。
        </div>
      )}
    </div>
  );
}
