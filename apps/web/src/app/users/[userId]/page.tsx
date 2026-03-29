"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchUserProfile, fetchUserGuides, type UserProfile, type GuideItem } from "@/lib/api";

const PILGRIM_LEVELS: Record<number, { label: string; color: string }> = {
  1: { label: "初级朝圣者", color: "bg-gray-100 text-gray-600" },
  2: { label: "朝圣探索者", color: "bg-blue-100 text-blue-700" },
  3: { label: "资深朝圣者", color: "bg-purple-100 text-purple-700" },
  4: { label: "朝圣导师", color: "bg-amber-100 text-amber-700" },
  5: { label: "朝圣大使", color: "bg-yellow-100 text-yellow-700" },
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function GuideCard({ guide }: { guide: GuideItem }) {
  return (
    <Link href={`/community/guides/${guide.id}`} className="flex gap-3 group bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {guide.coverImage ? (
          <img src={guide.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#0066FF] transition-colors mb-1">
          {guide.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>❤️ {guide.likeCount}</span>
          <span>💬 {guide.commentCount}</span>
          <span>👁 {guide.viewCount}</span>
        </div>
      </div>
    </Link>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);

  const [profile, setProfile] = useState<(UserProfile & { nickname: string }) | null>(null);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [guidesTotal, setGuidesTotal] = useState(0);
  const [guidePage, setGuidePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserProfile(userId)
      .then((p) => setProfile(p))
      .catch(() => setError("用户不存在"))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setGuidesLoading(true);
    fetchUserGuides(userId, guidePage)
      .then((res) => {
        setGuides(res.items ?? []);
        setGuidesTotal(res.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setGuidesLoading(false));
  }, [userId, guidePage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-5xl mb-4">👤</div>
          <div>{error || "用户不存在"}</div>
          <Link href="/community" className="mt-4 inline-block text-[#0066FF] hover:underline">返回社区</Link>
        </div>
      </main>
    );
  }

  const pilgrimLevel = PILGRIM_LEVELS[profile.pilgrimLevel] || PILGRIM_LEVELS[1];
  const totalGuidePages = Math.ceil(guidesTotal / 10);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0 shadow-md">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                (profile.displayName || profile.nickname || "?").charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.displayName || profile.nickname}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${pilgrimLevel.color}`}>
                  {pilgrimLevel.label}
                </span>
              </div>
              {profile.bio && (
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {profile.location && <span>📍 {profile.location}</span>}
                <span>👥 {profile.followerCount} 关注者</span>
                <span>关注 {profile.followingCount} 人</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="游记" value={profile.guideCount} icon="📖" />
          <StatCard label="评价" value={profile.reviewCount} icon="⭐" />
          <StatCard label="到访圣地" value={profile.totalSites} icon="🕌" />
          <StatCard label="行程" value={profile.totalTrips} icon="🗺️" />
        </div>

        {/* Guides */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Ta 的游记
              {guidesTotal > 0 && <span className="ml-2 text-sm font-normal text-gray-400">共 {guidesTotal} 篇</span>}
            </h2>
          </div>

          {guidesLoading ? (
            <div className="text-center py-10 text-gray-400">加载中...</div>
          ) : guides.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-3">📖</div>
              <div>暂未发表任何游记</div>
            </div>
          ) : (
            <div className="space-y-3">
              {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
            </div>
          )}

          {totalGuidePages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setGuidePage((p) => Math.max(1, p - 1))}
                disabled={guidePage === 1}
                className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">{guidePage} / {totalGuidePages}</span>
              <button
                onClick={() => setGuidePage((p) => Math.min(totalGuidePages, p + 1))}
                disabled={guidePage === totalGuidePages}
                className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
