import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchReligionPerspectives, LIFE_QUESTION_META, type LifePerspective } from "@/lib/api/culture-life";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ religionSlug: string }> }) {
  const { religionSlug } = await params;
  return { title: `${religionSlug} · 12 命题视角 | 文化与生命` };
}

export default async function ReligionPerspectivesPage({
  params,
}: {
  params: Promise<{ religionSlug: string }>;
}) {
  const { religionSlug } = await params;
  let data: { religion: any; perspectives: LifePerspective[] };
  try {
    data = (await fetchReligionPerspectives(religionSlug)) as any;
  } catch {
    notFound();
  }
  if (!data?.religion) notFound();

  const color = data.religion.color ?? "#D4A855";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link>
          {' / '}
          <span>{data.religion.name} · 生命视角</span>
        </nav>

        <div className="rounded-2xl border border-white/10 p-8 mb-10"
             style={{ background: `linear-gradient(135deg, ${color}22, transparent)` }}>
          <div className="text-5xl mb-3" style={{ color }}>{data.religion.symbol ?? "◇"}</div>
          <h1 className="text-3xl md:text-4xl font-serif">{data.religion.name}</h1>
          <div className="text-slate-400 mb-4">{data.religion.nameEn} · 十二生命命题全景</div>
          <Link href={`/religions/${data.religion.slug}`} className="text-sm text-amber-300/80 hover:text-amber-200">
            ← 返回 {data.religion.name} 主页
          </Link>
        </div>

        <div className="space-y-4">
          {data.perspectives.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              本文化传统暂无生命命题内容，稍后补充。
            </div>
          )}
          {data.perspectives.map((p) => {
            const code = p.question?.code;
            const meta = code ? LIFE_QUESTION_META[code as keyof typeof LIFE_QUESTION_META] : null;
            return (
              <Link
                key={p.id}
                href={code ? `/culture-life/questions/${code}` : "#"}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-400/40 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{meta?.emoji ?? "◇"}</div>
                  <div className="flex-1">
                    <div className="text-xs text-amber-300/70 tracking-wider">{p.question?.title}</div>
                    <div className="text-lg text-slate-100 mt-1">{p.corePosition}</div>
                    <div className="text-sm text-slate-400 mt-3 line-clamp-2">{p.elaboration}</div>
                    <div className="text-xs text-amber-300/60 mt-3">查看 12 文化对比 →</div>
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
