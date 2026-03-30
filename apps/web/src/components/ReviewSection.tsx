"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import StarRating from "@/components/StarRating";
import RatingSummary from "@/components/RatingSummary";
import WriteReviewModal from "@/components/WriteReviewModal";
import {
  fetchReviewStats,
  fetchReviewsWithSort,
  voteReview,
  unvoteReview,
  type Review,
  type ReviewStats,
} from "@/lib/api";

// --- Review Card ---

const SUB_SCORE_LABELS: Record<string, string> = {
  spiritual: "灵性氛围",
  cultural: "文化深度",
  accessibility: "可达性",
  guideQuality: "导览质量",
  authenticity: "历史真实性",
};

function ReviewCard({ review }: { review: Review }) {
  const { t } = useTranslation();
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const handleVote = async () => {
    if (voteLoading) return;
    setVoteLoading(true);
    try {
      if (voted) {
        await unvoteReview(review.id);
        setVoted(false);
        setVoteCount((n) => Math.max(0, n - 1));
      } else {
        await voteReview(review.id);
        setVoted(true);
        setVoteCount((n) => n + 1);
      }
    } catch {
      // silent fail — user may not be authenticated
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
      {/* User row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {review.user.avatar ? (
            <OptimizedImage
              src={review.user.avatar}
              alt={review.user.nickname ?? "用户"}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center text-sm font-medium text-[#0066FF]">
              {(review.user.nickname ?? t("review.anonymous")).charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {review.user.nickname ?? t("review.anonymousPilgrim")}
            </p>
            <p className="text-xs text-gray-400">{review.createdAt.slice(0, 10)}</p>
          </div>
        </div>

        {/* Vote button */}
        <button
          onClick={handleVote}
          disabled={voteLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
            voted
              ? "bg-[#0066FF]/10 border-[#0066FF]/30 text-[#0066FF]"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
          } disabled:opacity-50`}
          title={voted ? "取消有用" : "标记为有用"}
        >
          <svg className="w-3.5 h-3.5" fill={voted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          有用{voteCount > 0 && ` · ${voteCount}`}
        </button>
      </div>

      {/* Stars + sub-scores */}
      <div className="flex items-center gap-3 flex-wrap">
        <StarRating value={review.rating} size="sm" readonly />
        {review.subScores && Object.entries(review.subScores).map(([key, val]) => (
          <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">
            {SUB_SCORE_LABELS[key] ?? key} <span className="font-medium text-gray-700">{val}</span>
          </span>
        ))}
      </div>

      {/* Content */}
      {review.content && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
      )}

      {/* Images with lightbox */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setLightboxImg(img)}
              className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 hover:border-[#0066FF]/40 transition-colors"
            >
              <OptimizedImage src={img} alt={`评价图片 ${idx + 1}`} width={112} height={112} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImg(null)}
        >
          <button aria-label="关闭图片" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-10" onClick={() => setLightboxImg(null)}>✕</button>
          <div className="relative max-w-4xl max-h-[85vh] m-4" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage src={lightboxImg} alt="Review photo" width={800} height={600} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sort Button ---

type SortType = "latest" | "helpful";

// --- ReviewSection ---

interface ReviewSectionProps {
  targetType: string;
  targetId: string;
}

export default function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortType>("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const PAGE_SIZE = 5;

  const loadStats = useCallback(() => {
    if (!targetId) return;
    fetchReviewStats(targetType, targetId)
      .then(setStats)
      .catch((err) => { console.error('Load review stats failed:', err); });
  }, [targetType, targetId]);

  const loadReviews = useCallback(
    (currentPage: number, currentSort: SortType, append = false) => {
      if (!targetId) return;
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      fetchReviewsWithSort(targetType, targetId, currentPage, PAGE_SIZE, currentSort)
        .then((res) => {
          setTotal(res.total);
          if (append) {
            setReviews((prev) => [...prev, ...res.data]);
          } else {
            setReviews(res.data);
          }
        })
        .catch((e) => setError(e instanceof Error ? e.message : t("review.loadFailed")))
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [targetType, targetId, t]
  );

  useEffect(() => {
    loadStats();
    loadReviews(1, "latest", false);
    setPage(1);
    setSort("latest");
  }, [targetType, targetId, loadStats, loadReviews]);

  const handleSortChange = (newSort: SortType) => {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);
    loadReviews(1, newSort, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, sort, true);
  };

  const handleReviewSuccess = () => {
    loadStats();
    setPage(1);
    loadReviews(1, sort, false);
  };

  const hasMore = reviews.length < total;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("review.pilgrimageReviews")}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("review.pilgrimageReviews")}
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-red-400 text-sm">{t("review.loadFailed")}</span>
          <button
            onClick={() => loadReviews(1, sort, false)}
            className="mt-3 text-xs text-[#0066FF] hover:underline"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalCount === 0;

  return (
    <>
      <WriteReviewModal
        targetType={targetType}
        targetId={targetId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleReviewSuccess}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-serif font-semibold text-gray-900">
            {t("review.pilgrimageReviews")}
            {stats && stats.totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({stats.totalCount})
              </span>
            )}
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl transition-colors shadow-sm"
          >
            写评价
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-3">
            <span className="text-4xl">📝</span>
            <span className="text-sm">{t("review.noReviews")}</span>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-1 px-5 py-2 text-sm font-medium bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl transition-colors"
            >
              成为第一个评价的人
            </button>
          </div>
        ) : (
          <>
            {/* Rating Summary */}
            {stats && (
              <div className="mb-6">
                <RatingSummary
                  averageRating={stats.averageRating}
                  totalCount={stats.totalCount}
                  distribution={stats.distribution}
                  subScoreAverages={stats.subScoreAverages}
                />
              </div>
            )}

            {/* Sort Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-400">排序：</span>
              {(["latest", "helpful"] as SortType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSortChange(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    sort === s
                      ? "bg-[#0066FF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "latest" ? "最新" : "最有用"}
                </button>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-5 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  {loadingMore ? "加载中..." : `加载更多 (${total - reviews.length} 条)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
