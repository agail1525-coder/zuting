import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchLifeQuestions,
  submitDialogue,
  type LifeQuestion,
  type LifePerspective,
} from "@/lib/api";

const BLUE = "#3264ff";

export default function CultureLifeDialogue() {
  const [questions, setQuestions] = useState<LifeQuestion[]>([]);
  const [code, setCode] = useState<string>("");
  const [situation, setSituation] = useState("");
  const [reply, setReply] = useState<string>("");
  const [cited, setCited] = useState<LifePerspective[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLifeQuestions()
      .then((r) => setQuestions(r?.items ?? []))
      .catch(() => setQuestions([]));
  }, []);

  async function handleSubmit() {
    if (!situation.trim()) return;
    setLoading(true);
    setReply("");
    setCited([]);
    try {
      const res = await submitDialogue(situation.trim(), code || undefined);
      setReply(res.reply ?? "");
      setCited(res.citedPerspectives ?? []);
    } catch {
      setReply("（对话服务暂不可用，请稍后再试）");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div
        className="px-5 pt-10 pb-6 text-center text-white"
        style={{ background: `linear-gradient(135deg, #0f172a 0%, ${BLUE} 100%)` }}
      >
        <p className="text-[11px] font-bold tracking-[2px] text-yellow-300">AI · CULTURAL DIALOGUE</p>
        <h1 className="text-2xl font-bold mt-2">与文化对话</h1>
        <p className="text-xs text-white/80 mt-2">把你的困惑告诉我，12 文化传统同堂论道</p>
      </div>

      <div className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-xs font-bold text-gray-700 mb-2">命题（可选）</label>
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">不限命题</option>
            {questions.map((q) => (
              <option key={q.id} value={q.code}>
                {q.title}
              </option>
            ))}
          </select>

          <label className="block text-xs font-bold text-gray-700 mt-4 mb-2">你的处境</label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="如：我正陷入事业瓶颈，不知道该坚持还是转换方向……"
            className="w-full h-28 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !situation.trim()}
            className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: BLUE }}
          >
            {loading ? "请稍候…" : "开启对话"}
          </button>
        </section>

        {reply && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2">AI 融合回应</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply}</p>
          </section>
        )}

        {cited.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">引用视角</h3>
            <div className="space-y-3">
              {cited.map((p) => {
                const color = p.religion?.color || BLUE;
                return (
                  <div key={p.id} className="border-l-2 pl-3" style={{ borderColor: color }}>
                    <p className="text-xs font-bold" style={{ color }}>
                      {p.religion?.symbol ?? "✨"} {p.religion?.name ?? "—"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{p.corePosition}</p>
                    {p.practiceGuide && (
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                        ↳ {p.practiceGuide}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
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
