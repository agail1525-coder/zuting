"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchScriptureChapter, type ScriptureChapterDetail } from "@/lib/api";

export default function ChapterReadingPage() {
  const { slug, chapterNo } = useParams<{ slug: string; chapterNo: string }>();
  const [data, setData] = useState<ScriptureChapterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !chapterNo) return;
    fetchScriptureChapter(slug, parseInt(chapterNo, 10))
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [slug, chapterNo]);

  if (error) {
    return (
      <div className="text-center py-20 text-rose-300">
        <p>{error}</p>
        <Link href={`/trips/cultivation/scriptures/${slug}`} className="text-amber-400 underline mt-2 inline-block">
          返回经论
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-[50vh] flex items-center justify-center text-amber-200/60">加载章节...</div>;
  }

  const { scripture, chapter } = data;
  const no = chapter.chapterNo;
  const keyQuotes: { quote: string; explanation: string }[] = Array.isArray(chapter.keyQuotes) ? chapter.keyQuotes : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-amber-200/50 flex-wrap">
        <Link href="/trips/cultivation/scriptures" className="hover:text-amber-300">经论</Link>
        <span>/</span>
        <Link href={`/trips/cultivation/scriptures/${slug}`} className="hover:text-amber-300">{scripture.title}</Link>
        <span>/</span>
        <span className="text-amber-200">{chapter.title}</span>
      </div>

      {/* Chapter header */}
      <div className="text-center border-b border-amber-900/40 pb-6">
        <p className="text-sm text-amber-200/40 mb-1">《{scripture.title}》</p>
        <h1 className="text-2xl font-bold text-amber-100">{chapter.title}</h1>
        {chapter.subtitle && <p className="text-sm text-amber-200/50 mt-1">{chapter.subtitle}</p>}
      </div>

      {/* Original text */}
      <article className="rounded-2xl border border-amber-900/40 bg-amber-950/15 p-6">
        <div
          className="text-amber-200/80 leading-[2] text-base whitespace-pre-wrap"
          style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif" }}
        >
          {chapter.originalText}
        </div>
      </article>

      {/* Key quotes */}
      {keyQuotes.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-amber-100 mb-3">名句提炼</h2>
          <div className="space-y-3">
            {keyQuotes.map((kq, i) => (
              <div
                key={i}
                className="rounded-xl border-l-4 border-amber-500/50 bg-amber-500/5 p-4"
              >
                <p className="text-amber-100 font-medium text-base mb-1">「{kq.quote}」</p>
                <p className="text-sm text-amber-200/60">{kq.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Commentary */}
      {chapter.commentary && (
        <section className="rounded-2xl border border-cyan-900/40 bg-cyan-950/10 p-5">
          <h2 className="text-lg font-bold text-cyan-200 mb-2">注释</h2>
          <p className="text-sm text-cyan-100/70 leading-relaxed whitespace-pre-wrap">{chapter.commentary}</p>
        </section>
      )}

      {/* Practice hint */}
      {chapter.practiceHint && (
        <section className="rounded-2xl border border-purple-900/40 bg-purple-950/10 p-5">
          <h2 className="text-lg font-bold text-purple-200 mb-2">修行提示</h2>
          <p className="text-sm text-purple-100/70 leading-relaxed">{chapter.practiceHint}</p>
        </section>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-amber-900/40">
        {no > 1 ? (
          <Link
            href={`/trips/cultivation/scriptures/${slug}/${no - 1}`}
            className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/20 transition-colors"
          >
            ← 上一章
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/trips/cultivation/scriptures/${slug}`}
          className="text-sm text-amber-200/50 hover:text-amber-300"
        >
          目录
        </Link>
        {no < scripture.chapterCount ? (
          <Link
            href={`/trips/cultivation/scriptures/${slug}/${no + 1}`}
            className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/20 transition-colors"
          >
            下一章 →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
