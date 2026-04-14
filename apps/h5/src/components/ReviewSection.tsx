import { useEffect, useState } from "react";
import { fetchReviews, createReview, type Review } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";

interface Props {
  targetType: "TRIP" | "GUIDE" | "SITE";
  targetId: string;
}

export default function ReviewSection({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews(targetType, targetId, 20)
      .then((r) => setReviews(r.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  const submit = async () => {
    if (!user) { toast.warning(t("save.loginRequired")); return; }
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const r = await createReview({ targetType, targetId, rating, content });
      setReviews([r, ...reviews]);
      setContent("");
      setRating(5);
      toast.success(t("common.submitted") || "已发布");
    } catch {
      toast.error(t("common.error") || "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl p-4 my-3">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <span>⭐</span> {t("nav.reviews") || "评价"}
        <span className="text-xs text-gray-400 font-normal">({reviews.length})</span>
      </h3>

      {user && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className="text-xl" aria-label={`${n} stars`}>
                {n <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("review.placeholder") || "分享你的体验..."}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3264ff]"
          />
          <button
            onClick={submit}
            disabled={submitting || !content.trim()}
            className="mt-2 px-4 py-1.5 bg-[#3264ff] text-white rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? "..." : t("common.submit") || "发布"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-400 text-sm">加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">{t("review.empty") || "暂无评价"}</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{r.user?.nickname || "匿名"}</span>
                <span className="text-xs text-yellow-500">{"⭐".repeat(r.rating)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
