import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStageMatrix, LIFE_STAGE_META, type LifeStage } from "@/lib/api/culture-life";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  const m = LIFE_STAGE_META[stage as LifeStage];
  return { title: `${m?.title ?? stage} · 12 文化视角 | 文化与生命` };
}

export default async function StageDetailPage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  let data;
  try { data = await fetchStageMatrix(stage); } catch { notFound(); }
  if (!data) notFound();
  const meta = LIFE_STAGE_META[stage as LifeStage];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link>
          {' / '}<Link href="/culture-life/stages" className="hover:text-amber-300">阶段</Link>
          {' / '}<span>{meta?.title}</span>
        </nav>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 mb-10">
          <div className="text-5xl mb-3">{meta?.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-serif">{meta?.title}</h1>
          <div className="text-slate-400 mt-2">参考年龄：{meta?.age}</div>
        </div>

        <div className="space-y-4">
          {data.items.length === 0 && (
            <div className="text-center text-slate-400 py-12">本阶段暂无内容</div>
          )}
          {data.items.map((g) => {
            const color = g.religion?.color ?? "#D4A855";
            return (
              <div key={g.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl" style={{ color }}>{g.religion?.symbol ?? "◇"}</div>
                  <div className="text-sm text-slate-400">{g.religion?.name}</div>
                </div>
                <div className="text-lg text-slate-100 mb-3">{g.title}</div>
                <div className="text-slate-300 leading-relaxed mb-4">{g.keyWisdom}</div>

                {g.rituals && g.rituals.length > 0 && (
                  <div className="rounded-lg bg-black/20 border border-white/5 p-3 mb-2">
                    <div className="text-xs text-amber-300/70 mb-2">仪式指引</div>
                    {g.rituals.map((r, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">
                        · <span className="text-slate-100">{r.name}</span>
                        {r.purpose && <span className="text-slate-400">—{r.purpose}</span>}
                        {r.howTo && <span className="text-slate-500 block ml-4">{r.howTo}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {g.challenges && g.challenges.length > 0 && (
                  <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-3">
                    <div className="text-xs text-rose-300/80 mb-2">常见挑战</div>
                    {g.challenges.map((c, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">
                        <span className="text-rose-200">{c.challenge}</span>
                        <span className="text-slate-400"> → {c.guidance}</span>
                      </div>
                    ))}
                  </div>
                )}
                {g.scriptureRef && (
                  <div className="text-xs text-slate-400 mt-3">经典依据：{g.scriptureRef}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
