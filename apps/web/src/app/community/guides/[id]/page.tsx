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
import { useTranslation } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MobileNav from "@/components/MobileNav";
import OptimizedImage from "@/components/OptimizedImage";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 估算阅读时长 · 中文 300 字/分钟 */
function estimateReadMinutes(content: string): number {
  const len = content.replace(/\s+/g, "").length;
  return Math.max(1, Math.round(len / 300));
}

/** 替代 picsum 兜底封面为真实关联图 */
function resolveCover(
  coverImage: string | null | undefined,
  inlineImages: string[] | undefined,
): string | null {
  if (coverImage && !coverImage.includes("picsum.photos")) return coverImage;
  if (inlineImages && inlineImages.length > 0) return inlineImages[0];
  return coverImage || null;
}

/**
 * RichGuideContent · 游记正文富渲染 (详情页++ DPG-01)
 *   - 将 content 按段落切分
 *   - 每 2-3 段插入 1 张大图 (figcaption 可空)
 *   - 排除 hero 封面图,防止头尾同图
 *   - 保留 Markdown 语法 (# ## ### > - 1. ** * ![alt](url))
 */
function RichGuideContent({
  content,
  images,
  excludeUrl,
}: {
  content: string;
  images: string[];
  excludeUrl?: string | null;
}) {
  if (!content) return null;

  const blocks = content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  if (blocks.length === 0) return null;

  // 已含 markdown 图则不再自动插图;排除 hero 封面图;去重
  const hasMarkdownImages = /!\[[^\]]*\]\([^)]+\)/.test(content);
  const seen = new Set<string>();
  const pool: string[] = hasMarkdownImages
    ? []
    : images.filter((u) => {
        if (!u) return false;
        if (excludeUrl && u === excludeUrl) return false;
        if (seen.has(u)) return false;
        seen.add(u);
        return true;
      });

  // 短文保护: <3 段不硬塞图,避免头尾挤在一起
  if (blocks.length < 3 || pool.length === 0) {
    return (
      <div className="guide-rich-content">
        {blocks.map((block, i) => (
          <div key={`b-${i}`} className="rich-block">
            <MarkdownRenderer content={block} />
          </div>
        ))}
      </div>
    );
  }

  let imgIdx = 0;
  const targetInserts = Math.min(pool.length, Math.max(2, Math.floor(blocks.length / 2)));
  const interval = targetInserts > 0 ? Math.max(2, Math.floor(blocks.length / (targetInserts + 1))) : Infinity;

  const nodes: React.ReactNode[] = [];
  blocks.forEach((block, i) => {
    nodes.push(
      <div key={`b-${i}`} className="rich-block">
        <MarkdownRenderer content={block} />
      </div>,
    );
    const shouldInsert =
      imgIdx < pool.length && (i + 1) % interval === 0 && i < blocks.length - 1 && i > 0;
    if (shouldInsert) {
      const src = pool[imgIdx++];
      nodes.push(
        <figure key={`img-${i}`} className="my-8 -mx-4 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full sm:rounded-2xl shadow-[0_6px_32px_rgba(0,0,0,0.08)] object-cover"
            style={{ maxHeight: "520px" }}
            loading="lazy"
          />
        </figure>,
      );
    }
  });

  // 末尾追加收束图: 必须正文 ≥ 5 段 且池内有余,否则略过
  if (blocks.length >= 5 && imgIdx < pool.length && imgIdx < 3) {
    nodes.push(
      <figure key="img-tail" className="my-8 -mx-4 sm:mx-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pool[imgIdx]}
          alt=""
          className="w-full sm:rounded-2xl shadow-[0_6px_32px_rgba(0,0,0,0.08)] object-cover"
          style={{ maxHeight: "520px" }}
          loading="lazy"
        />
      </figure>,
    );
  }

  return <div className="guide-rich-content">{nodes}</div>;
}

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { t } = useTranslation();

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
            .catch((err) => { console.error('Fetch related guides failed:', err); });
        }
      })
      .catch(() => setError(t("community.loadError")))
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
        <div className="text-gray-400">{t("community.loading")}</div>
      </main>
    );
  }

  if (error || !guide) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-5xl mb-4">⚠️</div>
          <div>{error || t("community.guide.notFound")}</div>
          <Link href="/community/guides" className="mt-4 inline-block text-[#0066FF] hover:underline">
            {t("community.guide.backToList")}
          </Link>
        </div>
      </main>
    );
  }

  const cover = resolveCover(guide.coverImage, guide.inlineImages);
  const readMin = estimateReadMinutes(guide.content || "");
  const inlineImages = Array.isArray(guide.inlineImages) ? guide.inlineImages : [];

  const primaryTag = guide.tags?.[0];
  const secondaryTags = guide.tags?.slice(1) ?? [];

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-8 lg:gap-12">
          {/* Main Content · Medium-style 阅读区,max-w-[720px] 左对齐 */}
          <article className="flex-1 min-w-0 lg:max-w-[720px]">
            {/* Breadcrumb · 含栏目 */}
            <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
              <Link href="/community" className="hover:text-[#0066FF]">{t("community.breadcrumb")}</Link>
              <span className="text-gray-300">›</span>
              <Link href="/community/guides" className="hover:text-[#0066FF]">{t("community.guides")}</Link>
              {primaryTag && (
                <>
                  <span className="text-gray-300">›</span>
                  <Link
                    href={`/community/guides?tag=${encodeURIComponent(primaryTag)}`}
                    className="text-[#0066FF] font-semibold hover:underline"
                  >
                    {primaryTag}
                  </Link>
                </>
              )}
            </nav>

            {/* 栏目徽章 · 大号填充药丸,强调栏目身份 */}
            {primaryTag && (
              <Link
                href={`/community/guides?tag=${encodeURIComponent(primaryTag)}`}
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-[#0066FF] text-white text-base font-bold shadow-[0_4px_14px_rgba(0,102,255,0.35)] hover:bg-[#0052CC] hover:shadow-[0_6px_18px_rgba(0,102,255,0.45)] transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>栏目 · {primaryTag}</span>
              </Link>
            )}

            {/* Title 优先 · Medium 把标题放在 hero 之前 */}
            <h1 className="text-3xl sm:text-[36px] font-bold text-gray-900 leading-tight tracking-tight mb-4">
              {guide.title}
            </h1>

            {/* 次级标签 (主栏目已在标题上方) */}
            {secondaryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {secondaryTags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-blue-50 text-[#0066FF] rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Meta */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-base font-bold text-blue-600 shrink-0">
                {guide.user?.avatar ? (
                  <OptimizedImage src={guide.user.avatar} alt="" width={44} height={44} className="w-full h-full rounded-full object-cover" />
                ) : (
                  guide.user?.nickname?.charAt(0) || "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-[15px]">{guide.user?.nickname || t("community.anonymous")}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{guide.publishedAt ? formatDate(guide.publishedAt) : formatDate(guide.createdAt)}</span>
                  <span className="text-gray-300">·</span>
                  <span>{readMin} 分钟阅读</span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {guide.viewCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Cover · 真实关联图,不再是 picsum 西装男 */}
            {cover && (
              <figure className="aspect-video rounded-2xl overflow-hidden mb-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <OptimizedImage src={cover} alt={guide.title} width={800} height={450} className="w-full h-full object-cover" />
              </figure>
            )}

            {/* Content · 段落间自动插图,Medium 风排版 (排除 hero 同图) */}
            <div className="mb-10 guide-typography text-[17px] leading-[1.85] text-gray-800">
              <RichGuideContent content={guide.content} images={inlineImages} excludeUrl={cover} />
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
                {liked ? "❤️" : "🤍"} {t("community.guide.like")} ({likeCount})
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t("community.guide.comments")} ({comments.length})</h2>

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
                      placeholder={t("community.guide.commentPlaceholder")}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleComment}
                        disabled={!commentText.trim() || submitting}
                        className="px-4 py-2 bg-[#0066FF] text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-[#0052CC] transition-colors"
                      >
                        {submitting ? t("community.guide.submitting") : t("community.guide.submitComment")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl text-sm text-center text-blue-700">
                  <Link href="/login" className="font-semibold hover:underline">{t("community.loginRequired")}</Link>{t("community.guide.loginToComment")}
                </div>
              )}

              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">{t("community.guide.noComments")}</div>
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
                  <h3 className="font-bold text-gray-900 mb-4">{t("community.guide.relatedGuides")}</h3>
                  <div className="space-y-3">
                    {related.slice(0, 3).map((r) => (
                      <Link key={r.id} href={`/community/guides/${r.id}`} className="flex gap-3 group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {r.coverImage ? (
                            <OptimizedImage src={r.coverImage} alt="" width={64} height={64} className="w-full h-full object-cover" />
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
                <h3 className="font-bold text-gray-900 mb-3">{t("community.guide.joinCommunity")}</h3>
                <p className="text-sm text-gray-500 mb-4">{t("community.guide.joinCommunityDesc")}</p>
                <Link
                  href="/community/guides/write"
                  className="block w-full text-center px-4 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold hover:bg-[#0052CC] transition-colors"
                >
                  ✍️ {t("community.guide.writeGuide")}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}
