import Link from "next/link";
import { fetchLifeQuestions, LIFE_QUESTION_META, type LifeQuestion } from "@/lib/api/culture-life";

export const dynamic = "force-dynamic";
export const metadata = { title: "十二大生命命题 | 文化与生命" };

export default async function QuestionsPage() {
  let items: LifeQuestion[] = [];
  let error = false;
  try {
    const r = await fetchLifeQuestions();
    items = r.items;
  } catch { error = true; }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link> / 十二大生命命题
        </nav>
        <h1 className="text-4xl font-serif mb-4">十二大生命命题</h1>
        <p className="text-slate-400 mb-10 max-w-3xl">
          每个命题 × 12 文化 = 144 种答案的对照墙。点击任一命题，进入矩阵视图。
        </p>
        {error && <div className="text-rose-300 py-4">数据加载失败</div>}
        {!error && items.length === 0 && (
          <div className="text-center text-slate-400 py-16">尚无命题数据</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((q) => {
            const m = LIFE_QUESTION_META[q.code as keyof typeof LIFE_QUESTION_META];
            return (
              <Link key={q.id} href={`/culture-life/questions/${q.code}`}
                className={`group rounded-xl border border-white/10 bg-gradient-to-br ${m?.gradient} p-6 hover:border-amber-400/50 transition`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{m?.emoji}</div>
                  <div className="flex-1">
                    <div className="text-xs text-amber-300/70 tracking-wider">LGQ-{String(q.sortOrder).padStart(2, '0')}</div>
                    <div className="text-xl font-medium mt-1">{q.title}</div>
                    <div className="text-sm text-slate-400 mt-1">{q.titleEn}</div>
                    <div className="text-sm italic text-slate-300 mt-3">{q.question}</div>
                    <div className="text-xs text-slate-400 mt-3 line-clamp-2">{q.philosophicalDepth}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
