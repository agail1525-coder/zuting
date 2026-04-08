"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchGuides,
  fetchQuestions,
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
const GUIDE_SORT_MAP: Record<GuideSort, string> = {
  hot: "popular",
  latest: "latest",
  most_liked: "mostLiked",
  most_viewed: "popular",
};

/* ================================================================
   旅行话题（替代宗教话题）
   ================================================================ */
const TRAVEL_TOPIC_KEYS = [
  { key: "foodGuide", icon: "🍜" },
  { key: "accommodation", icon: "🏨" },
  { key: "photography", icon: "📸" },
  { key: "packingList", icon: "🎒" },
  { key: "transport", icon: "🚌" },
  { key: "bestSeason", icon: "🌸" },
  { key: "budgetTravel", icon: "💰" },
  { key: "localCustoms", icon: "🏮" },
  { key: "templeTour", icon: "⛩️" },
  { key: "hikingTrails", icon: "🥾" },
];

/* ================================================================
   种子活动数据（API无数据时展示）
   ================================================================ */
const SEED_ACTIVITIES = [
  { type: "guide", initial: "L", name: "LinMei", actionKey: "publishedGuide", target: "activity.target1", timeKey: "activity.time2h", color: "bg-blue-500" },
  { type: "photo", initial: "W", name: "WangJun", actionKey: "sharedPhoto", target: "activity.target2", timeKey: "activity.time3h", color: "bg-green-500" },
  { type: "question", initial: "Z", name: "ZhangYi", actionKey: "askedQuestion", target: "activity.target3", timeKey: "activity.time5h", color: "bg-purple-500" },
  { type: "answer", initial: "C", name: "ChenHua", actionKey: "answeredQuestion", target: "activity.target4", timeKey: "activity.time6h", color: "bg-amber-500" },
  { type: "guide", initial: "S", name: "SunLi", actionKey: "publishedGuide", target: "activity.target5", timeKey: "activity.time8h", color: "bg-rose-500" },
  { type: "photo", initial: "M", name: "MaYue", actionKey: "sharedPhoto", target: "activity.target6", timeKey: "activity.time12h", color: "bg-teal-500" },
];

/* ================================================================
   编辑精选（API无数据时展示）
   ================================================================ */
const EDITORIAL_PICKS = [
  { titleKey: "community.editorial.pick1", subtitleKey: "community.editorial.pick1Sub", gradient: "from-amber-500 to-orange-600", icon: "🏯" },
  { titleKey: "community.editorial.pick2", subtitleKey: "community.editorial.pick2Sub", gradient: "from-emerald-500 to-teal-600", icon: "🌄" },
  { titleKey: "community.editorial.pick3", subtitleKey: "community.editorial.pick3Sub", gradient: "from-violet-500 to-purple-600", icon: "📷" },
];

/* ================================================================
   旅行贴士
   ================================================================ */
const TRAVEL_TIPS = [
  { key: "tip1", icon: "👟", bg: "bg-blue-50", border: "border-blue-100" },
  { key: "tip2", icon: "🎒", bg: "bg-green-50", border: "border-green-100" },
  { key: "tip3", icon: "📱", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "tip4", icon: "🗺️", bg: "bg-amber-50", border: "border-amber-100" },
  { key: "tip5", icon: "💊", bg: "bg-red-50", border: "border-red-100" },
  { key: "tip6", icon: "📷", bg: "bg-indigo-50", border: "border-indigo-100" },
];

/* ================================================================
   占位攻略（空状态）
   ================================================================ */
const PLACEHOLDER_GUIDES = [
  { titleKey: "community.placeholder.guide1", gradient: "from-blue-400 to-indigo-500", icon: "🏔️", likes: 128, comments: 32, views: 2340 },
  { titleKey: "community.placeholder.guide2", gradient: "from-emerald-400 to-teal-500", icon: "🍜", likes: 96, comments: 18, views: 1820 },
  { titleKey: "community.placeholder.guide3", gradient: "from-amber-400 to-orange-500", icon: "📸", likes: 204, comments: 45, views: 3650 },
  { titleKey: "community.placeholder.guide4", gradient: "from-rose-400 to-pink-500", icon: "🚶", likes: 87, comments: 21, views: 1560 },
  { titleKey: "community.placeholder.guide5", gradient: "from-purple-400 to-violet-500", icon: "🌅", likes: 156, comments: 38, views: 2890 },
  { titleKey: "community.placeholder.guide6", gradient: "from-cyan-400 to-blue-500", icon: "🎒", likes: 72, comments: 14, views: 1230 },
];

/* ================================================================
   社交证明头像色
   ================================================================ */
const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500"];
const AVATAR_INITIALS = ["T", "M", "L", "S", "J"];

/* ================================================================
   子组件
   ================================================================ */
function ContributorBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  if (count >= 50) return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded inline-flex items-center gap-0.5 ml-1">{t("community.topContributor")}</span>;
  if (count >= 10) return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded inline-flex items-center gap-0.5 ml-1">{t("community.activeWriter")}</span>;
  return null;
}

function GuideCard({ guide, featured }: { guide: GuideItem; featured?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/community/guides/${guide.id}`}
      className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group ${featured ? "sm:col-span-2 lg:col-span-1" : ""}`}
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
            {t("community.featured")}
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
            <ContributorBadge count={(guide.likeCount ?? 0) + (guide.commentCount ?? 0)} />
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
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4"
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
            <div className="font-medium text-gray-900 text-sm flex items-center flex-wrap">
              {entry.nickname}
              <ContributorBadge count={entry.count} />
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#0066FF] text-lg">{entry.count}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   动画计数器
   ================================================================ */
function AnimatedCounter({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ================================================================
   主页面
   ================================================================ */
export default function CommunityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("guides");
  const [guideSort, setGuideSort] = useState<GuideSort>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [guidesTotal, setGuidesTotal] = useState(0);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [recentGuides, setRecentGuides] = useState<GuideItem[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<QuestionItem[]>([]);

  // 首次加载全部数据（并行）
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGuides({ sort: "popular", limit: 12 }).catch(() => ({ items: [], total: 0 })),
      fetchTrending().catch(() => ({ hotGuides: [], hotQuestions: [] })),
      fetchPhotoWall({ limit: 18 }).catch(() => ({ items: [] })),
      fetchLeaderboard("guide", "month").catch(() => []),
      fetchGuides({ sort: "latest", limit: 6 }).catch(() => ({ items: [], total: 0 })),
      fetchQuestions({ sort: "latest", page: 1 }).catch(() => ({ items: [], total: 0 })),
    ]).then(([guidesRes, trendingRes, photosRes, leaderboardRes, recentGuidesRes, questionsRes]) => {
      const gRes = guidesRes as { items: GuideItem[]; total?: number };
      setGuides(gRes.items ?? []);
      setGuidesTotal(gRes.total ?? gRes.items?.length ?? 0);
      setQuestions((trendingRes as { hotQuestions: QuestionItem[] }).hotQuestions ?? []);
      setPhotos((photosRes as { items: PhotoItem[] }).items ?? []);
      setLeaderboard(Array.isArray(leaderboardRes) ? leaderboardRes as LeaderboardEntry[] : []);
      setRecentGuides((recentGuidesRes as { items: GuideItem[] }).items ?? []);
      const qRes = questionsRes as { items: QuestionItem[]; total?: number };
      setRecentQuestions(qRes.items ?? []);
      setQuestionsTotal(qRes.total ?? qRes.items?.length ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  // 攻略排序变化时重新加载
  useEffect(() => {
    if (guideSort === "hot") return;
    fetchGuides({ sort: GUIDE_SORT_MAP[guideSort], limit: 12 })
      .then(res => setGuides(res.items ?? []))
      .catch(() => {});
  }, [guideSort]);

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

  // 真实活动流（由最新游记+问题时间倒序合并）
  const realActivities = useMemo(() => {
    const items: {
      type: "guide" | "question";
      id: string;
      name: string;
      initial: string;
      target: string;
      time: Date;
      color: string;
    }[] = [];
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];
    recentGuides.forEach((g, i) => {
      items.push({
        type: "guide",
        id: g.id,
        name: g.user?.nickname ?? "旅行者",
        initial: (g.user?.nickname ?? "T").slice(0, 1),
        target: g.title,
        time: new Date(g.publishedAt ?? g.createdAt),
        color: colors[i % colors.length],
      });
    });
    recentQuestions.slice(0, 6).forEach((q, i) => {
      items.push({
        type: "question",
        id: q.id,
        name: "旅行者",
        initial: "?",
        target: q.title,
        time: new Date(q.createdAt),
        color: colors[(i + 3) % colors.length],
      });
    });
    return items.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6);
  }, [recentGuides, recentQuestions]);

  const formatRelativeTime = (time: Date): string => {
    const diffMs = Date.now() - time.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "guides", label: t("community.tabGuides"), icon: "📖" },
    { id: "questions", label: t("community.tabQuestions"), icon: "❓" },
    { id: "photos", label: t("community.tabPhotos"), icon: "📸" },
    { id: "leaderboard", label: t("community.tabLeaderboard"), icon: "🏆" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* ============================================================
          Section 1: 沉浸式Hero
          ============================================================ */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden pt-20">
        {/* 装饰浮动元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
          {/* 小浮动图标 */}
          <div className="absolute top-16 right-[15%] text-4xl opacity-10 animate-pulse">✈️</div>
          <div className="absolute bottom-20 left-[10%] text-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}>🗺️</div>
          <div className="absolute top-24 left-[25%] text-2xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}>📸</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14">
          {/* 社交证明 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {AVATAR_COLORS.map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-900`}>
                  {AVATAR_INITIALS[i]}
                </div>
              ))}
            </div>
            <span className="text-blue-200 text-sm">{t("community.heroSocialProof", { count: "12,800" })}</span>
            <span className="flex items-center gap-1 text-green-300 text-xs ml-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              {t("community.heroOnlineNow", { count: 86 })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("community.title")}</h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl">{t("community.subtitle")}</p>

          {/* 搜索栏 */}
          <div className="relative max-w-xl mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("community.searchPlaceholder")}
              className="w-full px-4 py-3.5 pl-11 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 backdrop-blur-md text-sm"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* CTA按钮 */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/community/guides/write"
              className="px-6 py-2.5 bg-white text-[#0066FF] rounded-full text-sm font-bold hover:bg-blue-50 transition-all shadow-lg shadow-white/10"
            >
              ✍️ {t("community.writeGuide")}
            </Link>
            <Link
              href="/community/questions"
              className="px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-all border border-white/20 backdrop-blur-sm"
            >
              ❓ {t("community.askQuestion")}
            </Link>
            <Link
              href="/community/photos"
              className="px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-all border border-white/20 backdrop-blur-sm"
            >
              📸 {t("community.sharePhoto")}
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          Section 2: 旅行话题快捷入口
          ============================================================ */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {TRAVEL_TOPIC_KEYS.map((topic) => (
              <button
                key={topic.key}
                onClick={() => setSearchQuery(t(`community.topic.${topic.key}`))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  searchQuery === t(`community.topic.${topic.key}`)
                    ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-[#0066FF]/5 hover:text-[#0066FF] hover:border-[#0066FF]/20"
                }`}
              >
                <span>{topic.icon}</span>
                {t(`community.topic.${topic.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================================
            Section 3: 智能统计栏
            ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { key: "totalGuides", value: guidesTotal || 60, icon: "📖", color: "text-[#0066FF]" },
              { key: "totalTravelers", value: 12800, icon: "👥", color: "text-emerald-600" },
              { key: "totalPhotos", value: questionsTotal * 10 + 420, icon: "📸", color: "text-purple-600" },
              { key: "totalCountries", value: 38, icon: "🌍", color: "text-amber-600" },
            ].map((stat) => (
              <div key={stat.key}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>
                  <AnimatedCounter target={stat.value} />
                </p>
                <p className="text-xs text-gray-500 mt-1">{t(`community.stat.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            Section 4: 社区动态 (Activity Feed)
            ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-bold text-gray-900 text-sm">{t("community.activityFeed")}</h3>
          </div>
          <div className="relative max-h-[260px] overflow-hidden">
            <div className="space-y-3">
              {(realActivities.length > 0 ? realActivities : SEED_ACTIVITIES.map((a, i) => ({
                type: a.type,
                id: `seed-${i}`,
                name: a.name,
                initial: a.initial,
                target: t(`community.${a.target}`),
                time: new Date(Date.now() - (i + 1) * 3600_000),
                color: a.color,
              }))).map((act) => (
                <Link
                  key={act.id}
                  href={act.type === "question" ? `/community/questions/${act.id}` : `/community/guides/${act.id}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${act.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {act.initial}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-medium text-gray-900">{act.name}</span>
                    <span className="text-gray-500 mx-1">
                      {act.type === "question" ? "提出了问题" : "发布了攻略"}
                    </span>
                    <span className="text-[#0066FF] font-medium truncate">「{act.target.slice(0, 30)}」</span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(act.time)}</span>
                </Link>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ============================================================
            Section 5: 编辑精选
            ============================================================ */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("community.editorial.sectionTitle")}</h2>
          {guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guides.slice(0, 3).map((g, i) => (
                <GuideCard key={g.id} guide={g} featured={i === 0} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EDITORIAL_PICKS.map((pick, i) => (
                <div key={i} className={`relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br ${pick.gradient} group cursor-pointer hover:scale-[1.02] transition-transform`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30 group-hover:opacity-40 transition-opacity">{pick.icon}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-bold text-sm mb-1">{t(pick.titleKey)}</h3>
                    <p className="text-white/70 text-xs">{t(pick.subtitleKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            Section 6: 旅行贴士
            ============================================================ */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("community.tips.sectionTitle")}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {TRAVEL_TIPS.map((tip) => (
              <div key={tip.key} className={`min-w-[220px] p-4 rounded-xl ${tip.bg} border ${tip.border} shrink-0`}>
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{t(`community.tips.${tip.key}`)}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{t(`community.tips.${tip.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            Section 7: 照片征集Widget (始终显示)
            ============================================================ */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-8 border border-purple-100/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{t("community.photoContest")}</h3>
              <p className="text-sm text-gray-500">{t("community.photoContestDesc")}</p>
            </div>
            <button
              onClick={() => setTab("photos")}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              {t("community.viewPhotos")}
            </button>
          </div>
        </div>

        {/* ============================================================
            Section 8: Tabs
            ============================================================ */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
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

        {/* Guide Sort */}
        {tab === "guides" && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {([
                { key: "hot" as GuideSort, icon: "🔥", labelKey: "community.sort.hot" },
                { key: "latest" as GuideSort, icon: "🕐", labelKey: "community.sort.latest" },
                { key: "most_liked" as GuideSort, icon: "❤️", labelKey: "community.sort.mostLiked" },
                { key: "most_viewed" as GuideSort, icon: "👁", labelKey: "community.sort.mostViewed" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setGuideSort(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    guideSort === opt.key
                      ? "bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {opt.icon} {t(opt.labelKey)}
                </button>
              ))}
            </div>
            {searchQuery && (
              <span className="text-xs text-gray-400">
                {t("community.searchResults", { count: filteredGuides.length })}
              </span>
            )}
          </div>
        )}

        {/* ============================================================
            Tab Content
            ============================================================ */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{t("community.loading")}</p>
          </div>
        ) : (
          <>
            {/* === Guides Tab === */}
            {tab === "guides" && (
              <>
                {filteredGuides.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredGuides.map((g, i) => (
                      <GuideCard key={g.id} guide={g} featured={i === 0 && !searchQuery} />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-16 text-gray-400">
                    <span className="text-4xl block mb-3">🔍</span>
                    {t("community.noSearchResultsGuides", { query: searchQuery })}
                  </div>
                ) : (
                  /* 占位攻略卡片 */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {PLACEHOLDER_GUIDES.map((pg, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden opacity-90">
                        <div className={`aspect-video bg-gradient-to-br ${pg.gradient} flex items-center justify-center`}>
                          <span className="text-5xl opacity-50">{pg.icon}</span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-gray-900 font-semibold text-sm mb-2">{t(pg.titleKey)}</h3>
                          <p className="text-gray-400 text-xs mb-3">{t("community.placeholder.guideHint")}</p>
                          <div className="flex items-center justify-between text-gray-300 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gray-100" />
                              <span className="text-gray-400">---</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>❤️ {pg.likes}</span>
                              <span>💬 {pg.comments}</span>
                              <span>👁 {pg.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* 写攻略CTA覆盖 */}
                    <div className="col-span-full flex justify-center mt-4">
                      <Link href="/community/guides/write" className="px-8 py-3 bg-[#0066FF] text-white rounded-xl text-sm font-bold hover:bg-[#0052CC] transition-colors shadow-lg shadow-blue-200">
                        ✍️ {t("community.beFirstGuide")}
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/guides" className="text-[#0066FF] text-sm font-medium hover:underline">
                    {t("community.viewAllGuides")}
                  </Link>
                </div>
              </>
            )}

            {/* === Questions Tab === */}
            {tab === "questions" && (
              <>
                {filteredQuestions.length > 0 ? (
                  <div className="max-w-3xl mx-auto space-y-3">
                    {filteredQuestions.map((q) => (
                      <QuestionCard key={q.id} q={q} />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-16 text-gray-400">
                    <span className="text-4xl block mb-3">🔍</span>
                    {t("community.noSearchResultsQuestions", { query: searchQuery })}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-3">
                    {[
                      { titleKey: "community.placeholder.q1", tags: ["community.guides.tagTravelTips", "community.guides.tagAccommodation"], answers: 28 },
                      { titleKey: "community.placeholder.q2", tags: ["community.guides.tagFood", "community.guides.tagTravelTips"], answers: 15 },
                      { titleKey: "community.placeholder.q3", tags: ["community.guides.tagTravelTips", "community.guides.tagAccommodation"], answers: 32 },
                      { titleKey: "community.placeholder.q4", tags: ["community.guides.tagTravelTips"], answers: 21 },
                    ].map((pq, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-4 opacity-90">
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-700 font-semibold text-sm mb-2">{t(pq.titleKey)}</h3>
                            <div className="flex flex-wrap gap-1">
                              {pq.tags.map(tk => <span key={tk} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full">{t(tk)}</span>)}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-bold text-blue-400">{pq.answers}</div>
                            <div className="text-xs text-gray-400">{t("community.answers")}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center mt-4">
                      <Link href="/community/questions" className="px-8 py-3 bg-[#0066FF] text-white rounded-xl text-sm font-bold hover:bg-[#0052CC] transition-colors shadow-lg shadow-blue-200">
                        ❓ {t("community.beFirstQuestion")}
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/questions" className="text-[#0066FF] text-sm font-medium hover:underline">
                    {t("community.viewAllQuestions")}
                  </Link>
                </div>
              </>
            )}

            {/* === Photos Tab === */}
            {tab === "photos" && (
              <>
                {photos.length > 0 ? (
                  <PhotoGrid photos={photos} />
                ) : (
                  <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                    {[
                      { gradient: "from-blue-200 to-indigo-300", h: "h-40" },
                      { gradient: "from-amber-200 to-orange-300", h: "h-56" },
                      { gradient: "from-emerald-200 to-teal-300", h: "h-48" },
                      { gradient: "from-rose-200 to-pink-300", h: "h-36" },
                      { gradient: "from-purple-200 to-violet-300", h: "h-52" },
                      { gradient: "from-cyan-200 to-blue-300", h: "h-44" },
                    ].map((ph, i) => (
                      <div key={i} className={`break-inside-avoid rounded-xl overflow-hidden ${ph.h} bg-gradient-to-br ${ph.gradient} flex items-center justify-center`}>
                        <span className="text-4xl opacity-30">📸</span>
                      </div>
                    ))}
                    <div className="break-inside-avoid flex justify-center py-4">
                      <Link href="/community/photos" className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">
                        📸 {t("community.shareFirstPhoto")}
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/photos" className="text-[#0066FF] text-sm font-medium hover:underline">
                    {t("community.viewMorePhotos")}
                  </Link>
                </div>
              </>
            )}

            {/* === Leaderboard Tab === */}
            {tab === "leaderboard" && (
              <>
                {leaderboard.length > 0 ? (
                  <div className="max-w-2xl mx-auto">
                    <LeaderboardList entries={leaderboard} />
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-3">
                    {[
                      { name: "TravelMaster", initial: "T", count: 42, color: "bg-amber-500" },
                      { name: "WanderLin", initial: "W", count: 38, color: "bg-blue-500" },
                      { name: "SkyWalker", initial: "S", count: 31, color: "bg-emerald-500" },
                      { name: "PhotoHunter", initial: "P", count: 27, color: "bg-purple-500" },
                      { name: "RouteKing", initial: "R", count: 24, color: "bg-rose-500" },
                    ].map((pl, i) => (
                      <div key={i} className={`flex items-center gap-4 bg-white rounded-xl shadow-sm p-4 opacity-90 ${i < 3 ? "ring-2 ring-yellow-100" : ""}`}>
                        <div className={`text-xl font-bold w-8 text-center ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>
                          {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                        </div>
                        <div className={`w-10 h-10 rounded-full ${pl.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                          {pl.initial}
                        </div>
                        <div className="flex-1 font-medium text-gray-700 text-sm">{pl.name}</div>
                        <div className="font-bold text-blue-400 text-lg">{pl.count}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/leaderboard" className="text-[#0066FF] text-sm font-medium hover:underline">
                    {t("community.viewFullLeaderboard")}
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {/* ============================================================
            Section 9: 社区亮点
            ============================================================ */}
        <div className="mt-12 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("community.highlights.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 本周达人 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-xs text-amber-600 font-bold mb-3">{t("community.highlights.featuredContributor")}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold">T</div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">TravelMaster</div>
                  <div className="text-xs text-gray-400">42 {t("community.leaderboard.unitGuides")}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">{t("community.topContributor")}</span>
              </div>
            </div>

            {/* 本周最佳攻略 */}
            <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-blue-500 to-indigo-600 group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">📖</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="text-xs text-blue-200 font-bold mb-1">{t("community.highlights.guideOfWeek")}</div>
                <div className="text-white font-bold text-sm">{t("community.editorial.pick1")}</div>
              </div>
            </div>

            {/* 本周最佳照片 */}
            <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-purple-500 to-pink-600 group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">📸</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="text-xs text-purple-200 font-bold mb-1">{t("community.highlights.photoOfWeek")}</div>
                <div className="text-white font-bold text-sm">{t("community.highlights.photoCaption")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            Section 10: 底部CTA
            ============================================================ */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            {/* 头像排 */}
            <div className="flex justify-center -space-x-2 mb-4">
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} className={`w-10 h-10 rounded-full ${c} flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-900`}>
                  {AVATAR_INITIALS[i]}
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("community.cta.joinTitle")}</h2>
            <p className="text-blue-200 mb-6 max-w-lg mx-auto">{t("community.cta.joinDesc")}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/community/guides/write" className="px-7 py-3 bg-white text-[#0066FF] font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                ✍️ {t("community.writeGuide")}
              </Link>
              <Link href="/community/questions" className="px-7 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                ❓ {t("community.askQuestion")}
              </Link>
              <Link href="/community/photos" className="px-7 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                📸 {t("community.sharePhoto")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}
