"use client";
import { useState } from "react";
import type { LifePerspective } from "@/lib/api/culture-life";

export default function QuestionMatrixClient({ perspectives }: { perspectives: LifePerspective[] }) {
  const [expanded, setExpanded] = useState<string | null>(perspectives[0]?.id ?? null);

  if (perspectives.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        暂无观点数据。可能需要先运行 seed-culture-life。
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-serif">十二文化观点墙</h2>
        <div className="text-sm text-slate-400">{perspectives.length} 种立场 · 并列呈现，非评判</div>
      </div>

      <div className="space-y-3">
        {perspectives.map((p) => {
          const open = expanded === p.id;
          const color = p.religion?.color ?? "#D4A855";
          return (
            <div
              key={p.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
              style={{ borderLeftColor: color, borderLeftWidth: 3 }}
            >
              <button
                onClick={() => setExpanded(open ? null : p.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.03]"
              >
                <div className="text-2xl flex-shrink-0" style={{ color }}>
                  {p.religion?.symbol ?? "◇"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-400">{p.religion?.name}</div>
                  <div className="text-base md:text-lg text-slate-100 mt-0.5 line-clamp-1">
                    {p.corePosition}
                  </div>
                </div>
                <div className="text-amber-300/60 text-lg">{open ? "−" : "+"}</div>
              </button>

              {open && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{p.elaboration}</p>

                  {p.scriptureRefs && p.scriptureRefs.length > 0 && (
                    <div className="rounded-lg bg-black/30 border border-white/5 p-4">
                      <div className="text-xs text-amber-300/70 tracking-wider mb-2">经典引用</div>
                      {p.scriptureRefs.map((r, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <div className="text-xs text-slate-400">
                            《{r.scripture}》{r.chapter ? `·${r.chapter}` : ""}
                          </div>
                          <div className="text-slate-200 italic mt-1">"{r.quote}"</div>
                          {r.translation && <div className="text-xs text-slate-400 mt-1">{r.translation}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {p.masterQuotes && p.masterQuotes.length > 0 && (
                    <div className="rounded-lg bg-black/20 border border-white/5 p-4">
                      <div className="text-xs text-amber-300/70 tracking-wider mb-2">大师语录</div>
                      {p.masterQuotes.map((q, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <div className="text-slate-200 italic">"{q.quote}"</div>
                          <div className="text-xs text-slate-400 mt-1">
                            — {q.master}{q.source ? ` · ${q.source}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.practiceGuide && (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4">
                      <div className="text-xs text-emerald-300/90 tracking-wider mb-2">实修落地</div>
                      <div className="text-slate-200 text-sm leading-relaxed">{p.practiceGuide}</div>
                    </div>
                  )}

                  {p.aiReflection && (
                    <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-4">
                      <div className="text-xs text-indigo-300/90 tracking-wider mb-2">跨文化反思（AI · 非评判）</div>
                      <div className="text-slate-300 text-sm leading-relaxed italic">{p.aiReflection}</div>
                    </div>
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
