import Link from "next/link";
import { fetchStages, LIFE_STAGE_META, type LifeStage, type LifeStageGuide } from "@/lib/api/culture-life";

export const dynamic = "force-dynamic";
export const metadata = { title: "七大生命阶段 | 文化与生命" };

export default async function StagesPage() {
  let items: LifeStageGuide[] = [];
  try {
    const r = await fetchStages();
    items = r.items;
  } catch {}

  const stages: LifeStage[] = ['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link> / 七大生命阶段
        </nav>
        <h1 className="text-4xl font-serif mb-4">七大生命阶段</h1>
        <p className="text-slate-400 mb-10 max-w-3xl">
          从诞生到临终，每个阶段 × 12 文化 = 不同的智慧指引。
        </p>

        <div className="space-y-4">
          {stages.map((s) => {
            const meta = LIFE_STAGE_META[s];
            const count = items.filter((g) => g.stage === s).length;
            return (
              <Link key={s} href={`/culture-life/stages/${s}`}
                className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-400/40 transition">
                <div className="text-4xl">{meta.emoji}</div>
                <div className="flex-1">
                  <div className="text-xl font-medium">{meta.title}</div>
                  <div className="text-xs text-slate-400 mt-1">参考年龄：{meta.age}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-amber-300/80">{count} 种文化视角</div>
                  <div className="text-xs text-slate-500 mt-1">进入对比 →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
