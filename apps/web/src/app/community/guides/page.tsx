"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchGuides, type GuideItem } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

const POPULAR_TAGS = [
  { value: "朝圣", key: "tagPilgrimage" },
  { value: "佛教", key: "tagBuddhism" },
  { value: "道教", key: "tagTaoism" },
  { value: "伊斯兰教", key: "tagIslam" },
  { value: "基督教", key: "tagChristianity" },
  { value: "印度教", key: "tagHinduism" },
  { value: "神社", key: "tagShrine" },
  { value: "旅行攻略", key: "tagTravelTips" },
  { value: "美食", key: "tagFood" },
  { value: "住宿", key: "tagAccommodation" },
] as const;

function GuideCard({ guide }: { guide: GuideItem }) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/community/guides/${guide.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {guide.coverImage ? (
          <OptimizedImage
            src={guide.coverImage}
            alt={guide.title}
            width={400}
            height={300}
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
            <span className="text-gray-500 text-xs">{guide.user?.nickname || t("community.anonymous")}</span>
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
  const { t } = useTranslation();
  const [sort, setSort] = useState("latest");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const PAGE_SIZE = 12;

  const SORT_OPTIONS = [
    { key: "latest", label: t("community.guides.sortLatest") },
    { key: "hot", label: t("community.guides.sortHot") },
    { key: "likes", label: t("community.guides.sortLikes") },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGuides({ sort, tag: tag || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        setGuides(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setError(t("community.loadError")))
      .finally(() => setLoading(false));
  }, [sort, tag, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side search within loaded results
  const displayGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    const q = searchQuery.toLowerCase();
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.content.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [guides, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0066FF]">{t("community.guides.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {t("community.guides.subtitle")}
              {total > 0 && <span className="ml-2 text-gray-400">· 共 {total} 篇攻略</span>}
            </p>
          </div>
          <Link
            href="/community/guides/write"
            className="px-5 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold hover:bg-[#0052CC] transition-colors shadow-sm"
          >
            ✍️ {t("community.writeGuide")}
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索攻略标题、内容或标签..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-500 shrink-0">{t("community.guides.sortLabel")}</span>
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
            <span className="text-sm text-gray-500 shrink-0">{t("community.guides.tagLabel")}</span>
            <button
              onClick={() => { setTag(""); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                !tag ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("community.guides.allTag")}
            </button>
            {POPULAR_TAGS.map((item) => (
              <button
                key={item.value}
                onClick={() => { setTag(item.value); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  tag === item.value ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t(`community.guides.${item.key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("community.loading")}</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📖</div>
            <div>{t("community.emptyGuides")}</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayGuides.map((g) => <GuideCard key={g.id} guide={g} />)}
            </div>
            {searchQuery && displayGuides.length === 0 && guides.length > 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>没有找到匹配的攻略</p>
                <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#0066FF] hover:underline">清除搜索</button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              {t("community.guides.prevPage")}
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              {t("community.guides.nextPage")}
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && guides.length > 0 && (
          <div className="mt-10 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-3xl" />
            <div className="relative">
              <span className="text-3xl block mb-3">✍️</span>
              <h2 className="text-xl font-bold text-white">分享你的朝圣体验</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                写下你的旅行故事，帮助更多朝圣者规划路线
              </p>
              <Link
                href="/community/guides/write"
                className="inline-block mt-5 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                开始写攻略 →
              </Link>
            </div>
          </div>
        )}
      </div>
      <MobileNav />
    </main>
  );
}
