import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicUserProfile, type PublicUserProfile } from "@/lib/api";

const LEVEL_META: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: "初行者", color: "#9CA3AF", emoji: "🌱" },
  2: { label: "参学者", color: "#3264ff", emoji: "🌿" },
  3: { label: "善行者", color: "#2D8B6F", emoji: "🌳" },
  4: { label: "明行者", color: "#8B6914", emoji: "🌟" },
  5: { label: "证道者", color: "#B91C1C", emoji: "👑" },
};

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchPublicUserProfile(userId)
      .then(setData)
      .catch(() => setError("用户不存在或已隐私"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-sm text-red-600">{error ?? "未找到"}</p>
      </div>
    );
  }

  const level = LEVEL_META[data.pilgrimLevel] ?? LEVEL_META[1];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero */}
      <div
        className="px-5 pt-12 pb-8 flex flex-col items-center text-center"
        style={{ background: `linear-gradient(135deg, #0f172a 0%, ${level.color} 100%)` }}
      >
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.displayName ?? "avatar"}
            className="w-20 h-20 rounded-full object-cover border-2 border-white/40"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl">
            {level.emoji}
          </div>
        )}
        <h1 className="text-xl font-bold text-white mt-3">{data.displayName ?? "匿名行者"}</h1>
        <div className="px-3 py-1 bg-white/15 rounded-lg mt-2">
          <p className="text-xs font-semibold text-white">
            {level.emoji} Lv.{data.pilgrimLevel} · {level.label}
          </p>
        </div>
        {data.location && (
          <p className="text-xs text-white/80 mt-2">📍 {data.location}</p>
        )}
        {data.bio && (
          <p className="text-sm text-white/90 mt-3 leading-relaxed max-w-[280px]">{data.bio}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 px-4 py-4">
        <Stat label="行程" value={data.totalTrips} />
        <Stat label="圣地" value={data.totalSites} />
        <Stat label="攻略" value={data.guideCount} />
        <Stat label="评价" value={data.reviewCount} />
      </div>

      {/* Empty hint */}
      <div className="py-12 flex flex-col items-center text-gray-400">
        <span className="text-3xl mb-3">🚧</span>
        <p className="text-xs">更多内容（游记 / 攻略 / 收藏）即将上线</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 py-3.5 bg-[#f8faff] rounded-xl border border-gray-200 flex flex-col items-center">
      <p className="text-xl font-bold text-[var(--color-primary)]">{value}</p>
      <p className="text-[10px] text-gray-500 mt-1 tracking-wider">{label}</p>
    </div>
  );
}
