import Link from "next/link";
import {
  fetchLifeQuestions, fetchStages,
  LIFE_QUESTION_META, LIFE_STAGE_META,
  type LifeQuestion, type LifeStageGuide,
} from "@/lib/api/culture-life";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "文化与生命 · Culture & Life — 生命的十二问 × 十二文化 | 佳绩之旅",
  description:
    "不给标准答案，只呈现所有答案：12 大文化传统对生命起源、苦难、爱、死亡、传承等 12 个普世命题的深度对照。",
  alternates: { canonical: "https://zuting.fszyl.top/culture-life" },
};

export default async function CultureLifePage() {
  let questions: LifeQuestion[] = [];
  let stages: LifeStageGuide[] = [];
  let error = false;
  try {
    const [q, s] = await Promise.all([fetchLifeQuestions(), fetchStages()]);
    questions = q.items;
    stages = s.items;
  } catch {
    error = true;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0a0f1e] to-[#020617] text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,85,0.15),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-sm tracking-widest text-amber-300/80 mb-4">M40 · CULTURE & LIFE</div>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight mb-6">
            生命的十二问 <span className="text-amber-300">×</span> 十二文化
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
            我们不给标准答案，只呈现所有答案。
            <br />
            从佛陀到耶稣，从老子到穆罕默德——12 大文化传统如何回答人类最深的 12 个问题？
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/culture-life/questions" className="px-6 py-3 bg-amber-500/90 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition">
              探索十二命题 →
            </Link>
            <Link href="/culture-life/dialogue" className="px-6 py-3 border border-amber-500/40 hover:border-amber-400/80 text-amber-200 rounded-lg font-medium transition">
              AI 智者圆桌
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-4xl mx-auto px-6 py-10 text-center text-rose-300">
          数据加载失败，请刷新重试。
        </div>
      )}

      {/* 12 Questions Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif">十二大生命命题</h2>
          <Link href="/culture-life/questions" className="text-amber-300/80 hover:text-amber-200 text-sm">
            全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => {
            const meta = LIFE_QUESTION_META[q.code as keyof typeof LIFE_QUESTION_META];
            return (
              <Link
                key={q.id}
                href={`/culture-life/questions/${q.code}`}
                className={`group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${meta?.gradient ?? "from-slate-500/10 to-slate-700/10"} p-6 hover:border-amber-400/40 transition`}
              >
                <div className="text-3xl mb-3">{meta?.emoji ?? "◇"}</div>
                <div className="text-lg font-medium mb-2">{q.title}</div>
                <div className="text-sm text-slate-300/80 italic mb-3">{q.question}</div>
                <div className="text-xs text-slate-400/70 line-clamp-3">{q.philosophicalDepth}</div>
                <div className="mt-4 text-xs text-amber-300/80 group-hover:text-amber-200">
                  查看 12 文化观点 →
                </div>
              </Link>
            );
          })}
          {!error && questions.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-16">
              命题尚未加载。请先运行 <code className="text-amber-300">pnpm --filter @zuting/api exec tsx prisma/seed-culture-life.ts</code>
            </div>
          )}
        </div>
      </section>

      {/* 7 Stages */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif">七大生命阶段</h2>
          <Link href="/culture-life/stages" className="text-amber-300/80 hover:text-amber-200 text-sm">
            全部 →
          </Link>
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {(Object.keys(LIFE_STAGE_META) as Array<keyof typeof LIFE_STAGE_META>).map((s) => {
              const meta = LIFE_STAGE_META[s];
              const count = stages.filter((g) => g.stage === s).length;
              return (
                <Link
                  key={s}
                  href={`/culture-life/stages/${s}`}
                  className="flex-shrink-0 w-48 rounded-xl border border-white/10 bg-white/5 p-5 hover:border-amber-400/40 transition"
                >
                  <div className="text-3xl mb-2">{meta.emoji}</div>
                  <div className="text-lg font-medium">{meta.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{meta.age}</div>
                  <div className="mt-3 text-xs text-amber-300/70">{count} 种文化视角 →</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI 圆桌 CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-indigo-900/20 p-10">
          <h2 className="text-2xl md:text-3xl font-serif mb-4">
            遇到生命困惑？听 12 位智者同时回应
          </h2>
          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed">
            输入你的处境（比如「父亲刚去世」「中年失业想放弃」），小鸿 AI 将依次召唤 12 大文化传统的代表发言。
            不评判谁对谁错——让所有答案同时在场，你自己做选择。
          </p>
          <Link href="/culture-life/dialogue" className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition">
            进入圆桌 →
          </Link>
        </div>
      </section>

      {/* 与兄弟模块的关系 */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10 text-sm text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/religions" className="border border-white/10 rounded-lg p-5 hover:border-amber-400/30">
            <div className="text-slate-200 mb-2">十二大文化传统 →</div>
            <div>了解每种文化的历史、圣地、祖师与经典</div>
          </Link>
          <Link href="/personal-growth" className="border border-white/10 rounded-lg p-5 hover:border-amber-400/30">
            <div className="text-slate-200 mb-2">个人圆满 →</div>
            <div>本模块是理论层，个人圆满提供实修路径</div>
          </Link>
          <Link href="/family-harmony" className="border border-white/10 rounded-lg p-5 hover:border-amber-400/30">
            <div className="text-slate-200 mb-2">家庭幸福 →</div>
            <div>把生命智慧落地到家庭关系</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
