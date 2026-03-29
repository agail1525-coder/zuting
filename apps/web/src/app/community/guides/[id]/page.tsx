"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  fetchGuide,
  fetchGuideComments,
  addGuideComment,
  likeGuide,
  unlikeGuide,
  fetchGuides,
  type GuideItem,
  type GuideComment,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ShareButton from "@/components/ShareButton";
import MarkdownRenderer from "@/components/MarkdownRenderer";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [guide, setGuide] = useState<GuideItem | null>(null);
  const [comments, setComments] = useState<GuideComment[]>([]);
  const [related, setRelated] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchGuide(id),
      fetchGuideComments(id),
    ])
      .then(([g, c]) => {
        setGuide(g);
        setLikeCount(g.likeCount);
        setComments(c.items ?? []);
        // fetch related
        if (g.tags?.length) {
          fetchGuides({ tag: g.tags[0], limit: 4 })
            .then((r) => setRelated((r.items ?? []).filter((x) => x.id !== id)))
            .catch(() => {});
        }
      })
      .catch(() => setError("加载失败，请稍后再试"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLike() {
    if (!user) return;
    try {
      if (liked) {
        await unlikeGuide(id);
        setLikeCount((n) => n - 1);
      } else {
        await likeGuide(id);
        setLikeCount((n) => n + 1);
      }
      setLiked((v) => !v);
    } catch {
      // silent
    }
  }

  async function handleComment() {
    if (!user || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addGuideComment(id, commentText.trim());
      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </main>
    );
  }

  if (error || !guide) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-5xl mb-4">⚠️</div>
          <div>{error || "游记不存在"}</div>
          <Link href="/community/guides" className="mt-4 inline-block text-[#0066FF] hover:underline">
            返回游记列表
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 lg:gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
              <Link href="/community" className="hover:text-[#0066FF]">社区</Link>
              {" > "}
              <Link href="/community/guides" className="hover:text-[#0066FF]">游记</Link>
              {" > "}
              <span className="text-gray-700">{guide.title}</span>
            </nav>

            {/* Hero Cover */}
            {guide.coverImage && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-md">
                <img src={guide.coverImage} alt={guide.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{guide.title}</h1>

            {/* Author info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
                {guide.user?.avatar ? (
                  <img src={guide.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  guide.user?.nickname?.charAt(0) || "?"
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{guide.user?.nickname || "匿名"}</div>
                <div className="text-sm text-gray-500">
                  {guide.publishedAt ? formatDate(guide.publishedAt) : formatDate(guide.createdAt)}
                </div>
              </div>
              <div className="ml-auto flex gap-4 text-sm text-gray-400">
                <span>👁 {guide.viewCount}</span>
                <span>💬 {comments.length}</span>
              </div>
            </div>

            {/* Tags */}
            {guide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {guide.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            )}

            {/* Content (Markdown) */}
            <div className="mb-8">
              <MarkdownRenderer content={guide.content} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200 mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  liked
                    ? "bg-red-50 text-red-500 border border-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                {liked ? "❤️" : "🤍"} 点赞 ({likeCount})
              </button>
              <ShareButton
                title={guide.title}
                description={guide.content?.slice(0, 100)}
                url={`/community/guides/${guide.id || id}`}
                entityType="GUIDE"
                entityId={guide.id || id}
              />
            </div>

            {/* Comments */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">评论 ({comments.length})</h2>

              {/* Comment input */}
              {user ? (
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                    {user.nickname.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="分享你的想法..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleComment}
                        disabled={!commentText.trim() || submitting}
                        className="px-4 py-2 bg-[#0066FF] text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-[#0052CC] transition-colors"
                      >
                        {submitting ? "发送中..." : "发表评论"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl text-sm text-center text-blue-700">
                  <Link href="/login" className="font-semibold hover:underline">登录</Link> 后才能发表评论
                </div>
              )}

              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">暂无评论，快来抢沙发！</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-500 shrink-0">
                        👤
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">{formatDate(c.createdAt)}</div>
                        <div className="text-sm text-gray-700">{c.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              {related.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">相关游记</h3>
                  <div className="space-y-3">
                    {related.slice(0, 3).map((r) => (
                      <Link key={r.id} href={`/community/guides/${r.id}`} className="flex gap-3 group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {r.coverImage ? (
                            <img src={r.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🕌</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-[#0066FF] transition-colors">
                            {r.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">❤️ {r.likeCount}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">加入社区</h3>
                <p className="text-sm text-gray-500 mb-4">记录你的朝圣旅程，分享给全球同行者</p>
                <Link
                  href="/community/guides/write"
                  className="block w-full text-center px-4 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold hover:bg-[#0052CC] transition-colors"
                >
                  ✍️ 写游记
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
