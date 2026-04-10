"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchScriptureDetail,
  recordScriptureView,
  type ScriptureDetail,
} from "@/lib/api";

const RING_LABELS = ["", "禅宗核心", "佛教宗派", "信仰传统"];
const RING_COLORS = ["", "text-amber-400", "text-cyan-400", "text-purple-400"];

export default function ScriptureDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ScriptureDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchScriptureDetail(slug)
      .then((d) => {
        setData(d);
        recordScriptureView(slug).catch(() => {});
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, [slug]);

  if (error) {
    return (
      <div className="text-center py-20 text-rose-300">
        <p>{error}</p>
        <Link href="/trips/cultivation/scriptures" className="text-amber-400 underline mt-2 inline-block">
          返回经论
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-[50vh] flex items-center justify-center text-amber-200/60">加载经论详情...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-amber-200/50">
        <Link href="/trips/cultivation/scriptures" className="hover:text-amber-300">经论</Link>
        <span>/</span>
        <span className="text-amber-200">{data.title}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            {data.category?.icon || "📜"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">{data.title}</h1>
            {data.titleEn && <p className="text-sm text-amber-200/40 mt-0.5">{data.titleEn}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-amber-200/60">
              {data.author && <span>{data.author}</span>}
              {data.era && <span>· {data.era}</span>}
              <span className={`px-2 py-0.5 rounded-full text-xs border border-current/30 ${RING_COLORS[data.ring]}`}>
                {RING_LABELS[data.ring]}
              </span>
              {data.category && (
                <span className="text-xs text-amber-200/40">{data.category.name}</span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-amber-200/70 leading-relaxed">{data.summary}</p>

        {data.significance && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm text-amber-200/60 italic">{data.significance}</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-amber-200/40">
          <span>难度: {"★".repeat(data.difficulty)}{"☆".repeat(5 - data.difficulty)}</span>
          <span>阶位: {data.oxStageMin}-{data.oxStageMax}</span>
          {data.readingMins && <span>预计: {data.readingMins}分钟</span>}
          <span>{data.viewCount} 次阅读</span>
          <span>{data.chapterCount} 章</span>
        </div>

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300/60">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chapters */}
      {data.chapters.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-amber-100 mb-3">章节目录</h2>
          <div className="space-y-2">
            {data.chapters.map((ch) => (
              <Link
                key={ch.chapterNo}
                href={`/trips/cultivation/scriptures/${slug}/${ch.chapterNo}`}
                className="block rounded-xl border border-amber-900/40 bg-amber-950/15 p-4 hover:border-amber-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-300 text-sm font-bold">
                    {ch.chapterNo}
                  </span>
                  <div>
                    <h3 className="text-amber-100 font-medium">{ch.title}</h3>
                    {ch.subtitle && <p className="text-xs text-amber-200/40 mt-0.5">{ch.subtitle}</p>}
                  </div>
                  <span className="ml-auto text-amber-200/30 text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related scriptures */}
      {data.related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-amber-100 mb-3">关联经论</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.related.map((r) => (
              <Link
                key={r.slug}
                href={`/trips/cultivation/scriptures/${r.slug}`}
                className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-3 hover:border-amber-700/60 transition-colors"
              >
                <h3 className="text-sm font-bold text-amber-100 truncate">{r.title}</h3>
                <p className="text-xs text-amber-200/40 mt-0.5">
                  {r.author} · {RING_LABELS[r.ring]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Insights */}
      {data.insights.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-amber-100 mb-3">AI 经论悟道</h2>
          <div className="space-y-3">
            {data.insights.map((ins) => (
              <div
                key={ins.id}
                className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/30">
                    {ins.insightType === "DAILY_STUDY" ? "日学" : ins.insightType === "CROSS_REF" ? "融通" : ins.insightType === "PRACTICE_GUIDE" ? "修行指导" : ins.insightType}
                  </span>
                  {ins.oxStage && <span className="text-[10px] text-amber-200/30">阶位 {ins.oxStage}</span>}
                  <span className="ml-auto text-[10px] text-amber-200/20">
                    {new Date(ins.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-amber-200/70 leading-relaxed">{ins.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
