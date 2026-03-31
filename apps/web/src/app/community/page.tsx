"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchGuides,
  fetchTrending,
  fetchPhotoWall,
  fetchLeaderboard,
  type GuideItem,
  type QuestionItem,
  type PhotoItem,
  type LeaderboardEntry,
} from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";

type Tab = "guides" | "questions" | "photos" | "leaderboard";
type GuideSort = "hot" | "latest" | "most_liked" | "most_viewed";

const GUIDE_SORT_OPTIONS: { key: GuideSort; label: string }[] = [
  { key: "hot", label: "🔥 热门" },
  { key: "latest", label: "🕐 最新" },
  { key: "most_liked", label: "❤️ 最多点赞" },
  { key: "most_viewed", label: "👁 最多浏览" },
];

const TRENDING_TOPICS = [
  { tag: "禅宗朝圣", color: "#f59e0b" },
  { tag: "佛教圣地", color: "#ef4444" },
  { tag: "道教名山", color: "#10b981" },
  { tag: "跨文化之旅", color: "#8b5cf6" },
  { tag: "初次朝圣", color: "#0066FF" },
  { tag: "素食攻略", color: "#f97316" },
];

function GuideCard({ guide, featured }: { guide: GuideItem; featured?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/community/guides/${guide.id}`}
      className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${featured ? "sm:col-span-2 lg:col-span-1" : ""}`}
    >
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {guide.coverImage ? (
          <OptimizedImage
            src={guide.coverImage}
            alt={guide.title}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-4xl">📖</span>
          </div>
        )}
        {featured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#0066FF] text-white text-xs font-bold rounded-full">
            精选
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2 mb-2">
          {guide.title}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
          {guide.content.slice(0, 80)}...
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              {guide.user?.nickname?.charAt(0) || "?"}
            </div>
            <span className="text-gray-500 text-xs">
              {guide.user?.nickname || t("community.anonymous")}
            </span>
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

function QuestionCard({ q }: { q: QuestionItem }) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/community/questions/${q.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">{q.title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">
            {q.content.slice(0, 80)}...
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {q.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold text-[#0066FF]">{q.answerCount}</div>
          <div className="text-xs text-gray-400">{t("community.answers")}</div>
        </div>
      </div>
    </Link>
  );
}

function PhotoGrid({ photos }: { photos: PhotoItem[] }) {
  const [expanded, setExpanded] = useState<PhotoItem | null>(null);
  return (
    <>
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setExpanded(photo)}
          >
            <OptimizedImage
              src={photo.url}
              alt=""
              width={400}
              height={300}
              className="w-full object-cover"
            />
            <div className="bg-white px-3 py-2 text-xs text-gray-500">{photo.userName}</div>
          </div>
        ))}
      </div>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <OptimizedImage
            src={expanded.url}
            alt=""
            width={800}
            height={600}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

function LeaderboardList({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center gap-4 bg-white rounded-xl shadow-sm p-4 ${
            entry.rank <= 3 ? "ring-2 ring-yellow-200" : ""
          }`}
        >
          <div
            className={`text-xl font-bold w-8 text-center ${
              entry.rank === 1
                ? "text-yellow-500"
                : entry.rank === 2
                  ? "text-gray-400"
                  : entry.rank === 3
                    ? "text-amber-600"
                    : "text-gray-300"
            }`}
          >
            {entry.rank <= 3
              ? ["🥇", "🥈", "🥉"][entry.rank - 1]
              : `#${entry.rank}`}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
            {entry.avatar ? (
              <OptimizedImage
                src={entry.avatar}
                alt=""
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              entry.nickname.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm">{entry.nickname}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#0066FF] text-lg">{entry.count}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("guides");
  const [guideSort, setGuideSort] = useState<GuideSort>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (tab === "guides") {
          const res = await fetchGuides({ sort: guideSort, limit: 12 });
          setGuides(res.items ?? []);
        } else if (tab === "questions") {
          const res = await fetchTrending();
          setQuestions(res.hotQuestions ?? []);
        } else if (tab === "photos") {
          const res = await fetchPhotoWall({ limit: 18 });
          setPhotos(res.items ?? []);
        } else if (tab === "leaderboard") {
          const res = await fetchLeaderboard("guide", "month");
          setLeaderboard(Array.isArray(res) ? res : []);
        }
      } catch {
        setError(t("community.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, guideSort]);

  // Client-side search filter for guides
  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    const q = searchQuery.toLowerCase();
    return guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.content.toLowerCase().includes(q) ||
        (g.user?.nickname ?? "").toLowerCase().includes(q)
    );
  }, [guides, searchQuery]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (qItem) =>
        qItem.title.toLowerCase().includes(q) ||
        qItem.content.toLowerCase().includes(q) ||
        qItem.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [questions, searchQuery]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "guides", label: t("community.tabGuides"), icon: "📖" },
    { id: "questions", label: t("community.tabQuestions"), icon: "❓" },
    { id: "photos", label: t("community.tabPhotos"), icon: "📸" },
    { id: "leaderboard", label: t("community.tabLeaderboard"), icon: "🏆" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-24">
      {/* ========== Hero with Search ========== */}
      <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">{t("community.title")}</h1>
          <p className="text-blue-100 mb-6">{t("community.subtitle")}</p>

          {/* Search bar */}
          <div className="relative max-w-xl mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索攻略、问题、话题..."
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 backdrop-blur-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap mb-6">
            <Link
              href="/community/guides/write"
              className="px-5 py-2 bg-white text-[#0066FF] rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              ✍️ {t("community.writeGuide")}
            </Link>
            <Link
              href="/community/questions"
              className="px-5 py-2 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              ❓ {t("community.askQuestion")}
            </Link>
          </div>

          {/* Trending topics */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/60 text-xs">热门话题:</span>
            {TRENDING_TOPICS.map((topic) => (
              <button
                key={topic.tag}
                onClick={() => setSearchQuery(topic.tag)}
                className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium hover:bg-white/20 transition-colors border border-white/10"
              >
                #{topic.tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========== Tabs ========== */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                tab === item.id
                  ? "bg-[#0066FF] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#0066FF] hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* ========== Guide Sort Options ========== */}
        {tab === "guides" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {GUIDE_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setGuideSort(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    guideSort === opt.key
                      ? "bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {searchQuery && (
              <span className="text-xs text-gray-400">
                {filteredGuides.length} 条结果
              </span>
            )}
          </div>
        )}

        {/* ========== Content ========== */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{t("community.loading")}</p>
          </div>
        ) : error ? (
          <div>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">数据加载失败</p>
              <p className="text-sm text-gray-500 mb-4">网络可能暂时不稳定，请稍后重试</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#0066FF] text-white rounded-xl text-sm font-medium hover:bg-[#0052CC] transition-colors">重试</button>
            </div>

            {/* Fallback static content */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">热门话题推荐</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "第一次朝圣应该去哪里？", tags: ["初次朝圣", "路线推荐"], answers: 28 },
                  { title: "五台山禅修体验全攻略", tags: ["佛教圣地", "禅修"], answers: 15 },
                  { title: "道教名山排行榜：武当山vs龙虎山", tags: ["道教名山", "排行榜"], answers: 32 },
                  { title: "东南亚佛教朝圣路线推荐", tags: ["东南亚", "佛教"], answers: 21 },
                  { title: "素食餐厅推荐：朝圣途中怎么吃", tags: ["素食攻略", "实用"], answers: 45 },
                  { title: "如何写一篇好的朝圣游记", tags: ["写作技巧", "游记"], answers: 18 },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      {item.answers} 个回答
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community stats */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">社区数据</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { stat: "5,000+", label: "攻略游记" },
                  { stat: "12,000+", label: "问答互动" },
                  { stat: "30,000+", label: "精选照片" },
                  { stat: "100,000+", label: "活跃用户" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-[#0066FF]">{item.stat}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 hero-bg rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">加入朝圣者社区</h2>
              <p className="text-blue-100 mb-5">分享你的旅行故事，帮助更多人找到心灵的方向</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/community/guides/write" className="px-6 py-3 bg-white text-[#0066FF] font-bold rounded-xl hover:bg-blue-50 transition-colors">写游记</Link>
                <Link href="/community/questions" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">提问题</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {tab === "guides" && (
              <>
                {filteredGuides.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <span className="text-4xl block mb-3">📖</span>
                    {searchQuery
                      ? `没有找到 "${searchQuery}" 相关的攻略`
                      : t("community.emptyGuides")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredGuides.map((g, i) => (
                      <GuideCard key={g.id} guide={g} featured={i === 0 && !searchQuery} />
                    ))}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link
                    href="/community/guides"
                    className="text-[#0066FF] text-sm font-medium hover:underline"
                  >
                    {t("community.viewAllGuides")}
                  </Link>
                </div>
              </>
            )}

            {tab === "questions" && (
              <>
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <span className="text-4xl block mb-3">❓</span>
                    {searchQuery
                      ? `没有找到 "${searchQuery}" 相关的问题`
                      : t("community.emptyQuestions")}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-3">
                    {filteredQuestions.map((q) => (
                      <QuestionCard key={q.id} q={q} />
                    ))}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link
                    href="/community/questions"
                    className="text-[#0066FF] text-sm font-medium hover:underline"
                  >
                    {t("community.viewAllQuestions")}
                  </Link>
                </div>
              </>
            )}

            {tab === "photos" && (
              <>
                {photos.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    {t("community.emptyPhotos")}
                  </div>
                ) : (
                  <PhotoGrid photos={photos} />
                )}
                <div className="mt-8 text-center">
                  <Link
                    href="/community/photos"
                    className="text-[#0066FF] text-sm font-medium hover:underline"
                  >
                    {t("community.viewMorePhotos")}
                  </Link>
                </div>
              </>
            )}

            {tab === "leaderboard" && (
              <>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    {t("community.emptyLeaderboard")}
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <LeaderboardList entries={leaderboard} />
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link
                    href="/community/leaderboard"
                    className="text-[#0066FF] text-sm font-medium hover:underline"
                  >
                    {t("community.viewFullLeaderboard")}
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <MobileNav />
    </main>
  );
}
