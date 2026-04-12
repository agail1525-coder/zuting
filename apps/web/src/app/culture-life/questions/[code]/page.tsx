import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuestionMatrix, LIFE_QUESTION_META } from "@/lib/api/culture-life";
import QuestionMatrixClient from "./client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = LIFE_QUESTION_META[code as keyof typeof LIFE_QUESTION_META];
  return { title: `${m?.title ?? code} | 12 文化观点 | 文化与生命` };
}

export default async function QuestionDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let data;
  try {
    data = await fetchQuestionMatrix(code);
  } catch {
    notFound();
  }
  if (!data) notFound();

  const meta = LIFE_QUESTION_META[code as keyof typeof LIFE_QUESTION_META];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <nav className="text-sm text-slate-400 mb-4">
          <Link href="/culture-life" className="hover:text-amber-300">文化与生命</Link>
          {' / '}
          <Link href="/culture-life/questions" className="hover:text-amber-300">命题</Link>
          {' / '}
          <span>{data.title}</span>
        </nav>

        <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${meta?.gradient} p-8 mb-10`}>
          <div className="text-5xl mb-4">{meta?.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-serif mb-3">{data.title}</h1>
          <div className="text-slate-400 mb-4">{data.titleEn}</div>
          <div className="text-lg italic text-slate-200 mb-4">"{data.question}"</div>
          <p className="text-slate-300 leading-relaxed max-w-3xl">{data.philosophicalDepth}</p>
        </div>

        <QuestionMatrixClient perspectives={data.perspectives ?? []} />
      </div>
    </main>
  );
}
