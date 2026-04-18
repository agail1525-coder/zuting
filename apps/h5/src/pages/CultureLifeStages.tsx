import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLifeStages, LIFE_STAGE_META, type LifeStageGuide, type LifeStage } from "@/lib/api";

const BLUE = "#3264ff";

export default function CultureLifeStages() {
  const [items, setItems] = useState<LifeStageGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<LifeStage>("GROWTH");

  useEffect(() => {
    fetchLifeStages()
      .then((r) => setItems(r?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter((it) => it.stage === stage), [items, stage]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div
        className="px-5 pt-10 pb-6 text-center text-white"
        style={{ background: `linear-gradient(135deg, #0f172a 0%, ${BLUE} 100%)` }}
      >
        <p className="text-[11px] font-bold tracking-[2px] text-yellow-300">CULTURE · LIFE STAGES</p>
        <h1 className="text-2xl font-bold mt-2">人生七境 · 十二文化视角</h1>
        <p className="text-xs text-white/80 mt-2 leading-relaxed">
          诞生 · 成长 · 成家 · 立业 · 中年 · 老年 · 临终
        </p>
      </div>

      {/* Stage picker */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white sticky top-14 z-10 border-b border-gray-100">
        {(Object.keys(LIFE_STAGE_META) as LifeStage[]).map((k) => {
          const meta = LIFE_STAGE_META[k];
          const active = k === stage;
          return (
            <button
              key={k}
              onClick={() => setStage(k)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                active ? "text-white bg-[#3264ff]" : "bg-gray-100 text-gray-700"
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.title}</span>
              <span className="text-[10px] opacity-70">{meta.age}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">加载中…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">该阶段暂无内容</div>
        ) : (
          filtered.map((it) => {
            const color = it.religion?.color || BLUE;
            return (
              <div
                key={it.id}
                className="bg-white rounded-xl p-4 shadow-sm"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{it.religion?.symbol ?? "✨"}</span>
                  <span className="text-sm font-bold" style={{ color }}>
                    {it.religion?.name ?? "—"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{it.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">{it.keyWisdom}</p>

                {it.rituals && it.rituals.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-1.5">🕯️ 仪式</p>
                    <ul className="space-y-1">
                      {it.rituals.map((r, i) => (
                        <li key={i} className="text-xs text-gray-600 leading-snug">
                          · <strong>{r.name}</strong>
                          {r.purpose ? ` — ${r.purpose}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {it.challenges && it.challenges.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-1.5">⚠️ 挑战与指引</p>
                    <ul className="space-y-1.5">
                      {it.challenges.map((c, i) => (
                        <li key={i} className="text-xs text-gray-600 leading-relaxed">
                          <strong>{c.challenge}</strong>
                          <br />
                          <span className="text-gray-500">↳ {c.guidance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {it.scriptureRef && (
                  <p className="text-[11px] text-gray-400 mt-3">📜 {it.scriptureRef}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 mt-4">
        <Link to="/culture-life" className="text-xs text-[#3264ff] font-semibold">
          ← 回到 文化与生命
        </Link>
      </div>
    </div>
  );
}
