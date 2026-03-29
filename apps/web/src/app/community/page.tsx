"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
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

type Tab = "guides" | "questions" | "photos" | "leaderboard";

function GuideCard({ guide }: { guide: GuideItem }) {
  return (
    <Link href={`/community/guides/${guide.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {guide.coverImage ? (
          <img
            src={guide.coverImage}
            alt={guide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-4xl">📖</span>
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

function QuestionCard({ q }: { q: QuestionItem }) {
  return (
    <Link href={`/community/questions/${q.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">{q.title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">{q.content.slice(0, 80)}...</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {q.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold text-[#0066FF]">{q.answerCount}</div>
          <div className="text-xs text-gray-400">回答</div>
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
            <img src={photo.url} alt="" className="w-full object-cover" />
            <div className="bg-white px-3 py-2 text-xs text-gray-500">{photo.userName}</div>
          </div>
        ))}
      </div>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <img src={expanded.url} alt="" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </>
  );
}

function LeaderboardList({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.userId} className={`flex items-center gap-4 bg-white rounded-xl shadow-sm p-4 ${entry.rank <= 3 ? "ring-2 ring-yellow-200" : ""}`}>
          <div className={`text-xl font-bold w-8 text-center ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : entry.rank === 3 ? "text-amber-600" : "text-gray-300"}`}>
            {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : `#${entry.rank}`}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
            {entry.avatar ? (
              <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
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
  const [tab, setTab] = useState<Tab>("guides");
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
          const res = await fetchGuides({ sort: "hot", limit: 12 });
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
        setError("加载失败，请稍后再试");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "guides", label: "推荐游记" },
    { id: "questions", label: "热门问答" },
    { id: "photos", label: "照片墙" },
    { id: "leaderboard", label: "排行榜" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">朝圣者社区</h1>
          <p className="text-blue-100 mb-6">分享旅行故事，探索宗教文化，结识同路人</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/community/guides/write" className="px-5 py-2 bg-white text-[#0066FF] rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors">
              ✍️ 写游记
            </Link>
            <Link href="/community/questions" className="px-5 py-2 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30">
              ❓ 提问题
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-[#0066FF] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#0066FF] hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <>
            {tab === "guides" && (
              <>
                {guides.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">暂无游记，快来写第一篇吧！</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/guides" className="text-[#0066FF] text-sm font-medium hover:underline">
                    查看全部游记 →
                  </Link>
                </div>
              </>
            )}

            {tab === "questions" && (
              <>
                {questions.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">暂无问题，来提第一个问题吧！</div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-3">
                    {questions.map((q) => <QuestionCard key={q.id} q={q} />)}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/questions" className="text-[#0066FF] text-sm font-medium hover:underline">
                    查看全部问答 →
                  </Link>
                </div>
              </>
            )}

            {tab === "photos" && (
              <>
                {photos.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">暂无照片</div>
                ) : (
                  <PhotoGrid photos={photos} />
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/photos" className="text-[#0066FF] text-sm font-medium hover:underline">
                    查看更多照片 →
                  </Link>
                </div>
              </>
            )}

            {tab === "leaderboard" && (
              <>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">暂无排行数据</div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <LeaderboardList entries={leaderboard} />
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link href="/community/leaderboard" className="text-[#0066FF] text-sm font-medium hover:underline">
                    查看完整排行榜 →
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
