"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  fetchReviewStats,
  fetchReviews,
  createReview,
  type Review,
  type ReviewStats,
  type CreateReviewData,
} from "@/lib/api";

// --- Stars Component ---

function Stars({
  rating,
  interactive,
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (star: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${
            star <= (hover || Math.round(rating))
              ? "text-gold"
              : "text-temple-600"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={interactive ? () => onSelect?.(star) : undefined}
          onMouseEnter={interactive ? () => setHover(star) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// --- Review Form ---

function ReviewForm({
  targetType,
  targetId,
  onSubmitted,
}: {
  targetType: string;
  targetId: string;
  onSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full py-3 rounded-xl border border-dashed border-gold/30 text-gold/70 hover:text-gold hover:border-gold/50 transition-colors text-sm"
      >
        {t("review.write")}
      </button>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t("review.ratingRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data: CreateReviewData = {
        targetType: targetType as CreateReviewData["targetType"],
        targetId,
        rating,
        content: content.trim() || undefined,
      };
      await createReview(data);
      setRating(0);
      setContent("");
      setExpanded(false);
      onSubmitted();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("review.submitFailed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-temple-700/30 border border-temple-700/50 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-temple-300">{t("review.ratingLabel")}</span>
        <Stars rating={rating} interactive onSelect={setRating} />
        {rating > 0 && (
          <span className="text-xs text-temple-400">{rating} {t("review.stars")}</span>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("review.contentPlaceholder")}
        rows={3}
        className="w-full bg-temple-800/50 border border-temple-700/50 rounded-lg px-3 py-2 text-sm text-temple-200 placeholder:text-temple-500 focus:outline-none focus:border-gold/40 resize-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setExpanded(false)}
          className="px-3 py-1.5 text-xs text-temple-400 hover:text-temple-200 transition-colors"
          disabled={submitting}
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="px-4 py-1.5 text-xs rounded-lg bg-gold/20 text-gold hover:bg-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? t("review.submitting") : t("review.submitReview")}
        </button>
      </div>
    </div>
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
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
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
      .catch((e) =>
        setError(e instanceof Error ? e.message : t("review.loadFailed"))
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId]);

  if (loading) {
    return (
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          {t("review.pilgrimageReviews")}
        </h2>
        <div className="flex items-center justify-center py-8">
          <span className="text-temple-500 animate-pulse">{t("review.loadingReviews")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          {t("review.pilgrimageReviews")}
        </h2>
        <div className="flex items-center justify-center py-8">
          <span className="text-red-400 text-sm">{t("review.loadFailed")}</span>
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalCount === 0;

  return (
    <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
      <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
        {t("review.pilgrimageReviews")}
      </h2>

      {isEmpty ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 text-temple-500">
            <span className="text-3xl mb-2">📝</span>
            <span className="text-sm">{t("review.noReviews")}</span>
          </div>
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            onSubmitted={loadData}
          />
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
                {stats.totalCount} {t("review.totalReviews")}
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star] ?? 0;
                  const pct =
                    stats.totalCount > 0
                      ? (count / stats.totalCount) * 100
                      : 0;
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-xs"
                    >
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
          <div className="space-y-4 mb-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-temple-700/20 border border-temple-700/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs text-gold">
                      {(review.user.nickname ?? t("review.anonymous")).charAt(0)}
                    </div>
                    <span className="text-sm text-temple-200">
                      {review.user.nickname ?? t("review.anonymousPilgrim")}
                    </span>
                  </div>
                  <span className="text-xs text-temple-500">
                    {review.createdAt.slice(0, 10)}
                  </span>
                </div>
                <div className="mb-2">
                  <Stars rating={review.rating} />
                </div>
                {review.content && (
                  <p className="text-sm text-temple-300 leading-relaxed">
                    {review.content}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Write Review */}
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            onSubmitted={loadData}
          />
        </>
      )}
    </div>
  );
}
