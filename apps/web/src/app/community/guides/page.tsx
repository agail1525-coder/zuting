"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchGuides, type GuideItem } from "@/lib/api";

const SORT_OPTIONS = [
  { key: "latest", label: "最新" },
  { key: "hot", label: "最热" },
  { key: "likes", label: "最多点赞" },
];

const POPULAR_TAGS = ["朝圣", "佛教", "道教", "伊斯兰教", "基督教", "印度教", "神社", "旅行攻略", "美食", "住宿"];

function GuideCard({ guide }: { guide: GuideItem }) {
  return (
    <Link
      href={`/community/guides/${guide.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {guide.coverImage ? (
          <img
            src={guide.coverImage}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-5xl">🕌</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 font-semibold mb-2 leading-snug line-clamp-2">{guide.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {guide.content.slice(0, 100)}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {guide.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              {guide.user?.nickname?.charAt(0) || "?"}
            </div>
            <span className="text-gray-500 text-xs">{guide.user?.nickname || "匿名"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span>❤️ {guide.likeCount}</span>
            <span>💬 {guide.commentCount}</span>
            <span>👁 {guide.viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GuidesPage() {
  const [sort, setSort] = useState("latest");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 12;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGuides({ sort, tag: tag || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        setGuides(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setError("加载失败，请稍后再试"))
      .finally(() => setLoading(false));
  }, [sort, tag, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">旅行游记</h1>
            <p className="text-gray-500 text-sm mt-1">朝圣者们的真实旅行故事</p>
          </div>
          <Link
            href="/community/guides/write"
            className="px-5 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold hover:bg-[#0052CC] transition-colors shadow-sm"
          >
            ✍️ 写游记
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-500 shrink-0">排序:</span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    sort === opt.key
                      ? "bg-[#0066FF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 shrink-0">标签:</span>
            <button
              onClick={() => { setTag(""); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                !tag ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全部
            </button>
            {POPULAR_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => { setTag(t); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  tag === t ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📖</div>
            <div>暂无游记，快来写第一篇吧！</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
