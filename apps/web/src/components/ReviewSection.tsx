"use client";

import { useState, useEffect } from "react";

// --- Types ---

interface ReviewUser {
  id: string;
  nickname: string | null;
  avatar: string | null;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  user: ReviewUser;
}

interface ReviewListResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

interface ReviewStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
}

// --- API ---

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? "http://localhost:3002" : "");

async function fetchReviewStats(
  targetType: string,
  targetId: string
): Promise<ReviewStats> {
  const res = await fetch(
    `${API_BASE}/api/reviews/stats/${targetType}/${targetId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchReviews(
  targetType: string,
  targetId: string,
  limit = 5
): Promise<ReviewListResponse> {
  const params = new URLSearchParams({
    targetType,
    targetId,
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/api/reviews?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Stars Component ---

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating) ? "text-gold" : "text-temple-600"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

// --- ReviewSection ---

interface ReviewSectionProps {
  targetType: string;
  targetId: string;
}

export default function ReviewSection({
  targetType,
  targetId,
}: ReviewSectionProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchReviewStats(targetType, targetId),
      fetchReviews(targetType, targetId, 5),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData);
        setReviews(reviewsData.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载评价失败"))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  if (loading) {
    return (
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          朝圣评价
        </h2>
        <div className="flex items-center justify-center py-8">
          <span className="text-temple-500 animate-pulse">加载评价中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          朝圣评价
        </h2>
        <div className="flex items-center justify-center py-8">
          <span className="text-red-400 text-sm">评价加载失败</span>
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalCount === 0;

  return (
    <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
      <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
        朝圣评价
      </h2>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-temple-500">
          <span className="text-3xl mb-2">📝</span>
          <span className="text-sm">暂无评价，成为第一个评价者</span>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-temple-700/30 border border-temple-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold">
                {stats.averageRating.toFixed(1)}
              </div>
              <Stars rating={stats.averageRating} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-temple-400 mb-2">
                共 {stats.totalCount} 条评价
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star] ?? 0;
                  const pct =
                    stats.totalCount > 0
                      ? (count / stats.totalCount) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-temple-400 w-4 text-right">
                        {star}
                      </span>
                      <span className="text-gold text-[10px]">★</span>
                      <div className="flex-1 h-1.5 bg-temple-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold/60 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-temple-500 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-temple-700/20 border border-temple-700/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs text-gold">
                      {(review.user.nickname ?? "匿名").charAt(0)}
                    </div>
                    <span className="text-sm text-temple-200">
                      {review.user.nickname ?? "匿名朝圣者"}
                    </span>
                  </div>
                  <span className="text-xs text-temple-500">
                    {review.createdAt.slice(0, 10)}
                  </span>
                </div>
                <div className="mb-2">
                  <Stars rating={review.rating} />
                </div>
                <p className="text-sm text-temple-300 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
