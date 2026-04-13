"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import ReviewSection from "@/components/ReviewSection";
import RelatedEntities from "@/components/RelatedEntities";
import MediaTour from "@/components/MediaTour";
import TravelPackages from "@/components/TravelPackages";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import UGCPhotoWall from "@/components/UGCPhotoWall";
import QASection from "@/components/QASection";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import {
  recordView,
  fetchRoutesBySite,
  fetchHolySites,
  fetchReviewStats,
  fetchReviews,
} from "@/lib/api";
import type { HolySite, Route, ReviewStats, Review } from "@/lib/api";

/* ═══════════════════════════════════════════════════════════
   Trip.com 画廊 — 左大图 + 右侧竖排缩略图
   ═══════════════════════════════════════════════════════════ */

function GalleryGrid({ images, alt }: { images: string[]; alt: string }) {
  const { t } = useTranslation();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const display = images.slice(0, 5);
  const remaining = images.length - 5;

  if (display.length === 0) return null;

  if (display.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div role="button" aria-label={`${alt} - view photo`} className="relative h-[400px] cursor-pointer" onClick={() => setLightboxIdx(0)}>
          <OptimizedImage src={display[0]} alt={alt} fill className="object-cover" priority />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            1/{images.length}
          </div>
        </div>
        <Lightbox images={images} idx={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_160px] gap-1 rounded-xl overflow-hidden h-[400px]">
        {/* 左侧大图 */}
        <div
          role="button"
          aria-label={`${alt} - view photo 1`}
          className="relative cursor-pointer hover:brightness-95 transition"
          onClick={() => setLightboxIdx(0)}
        >
          <OptimizedImage src={display[0]} alt={alt} fill className="object-cover" priority />
        </div>
        {/* 右侧竖排缩略图 */}
        <div className="grid grid-rows-4 gap-1">
          {[1, 2, 3, 4].map((i) => {
            const img = display[i] || display[display.length > i ? i : display.length - 1];
            const isLast = i === 4;
            if (!img && i > 1) return <div key={i} className="bg-gray-100" />;
            return (
              <div
                key={i}
                role="button"
                aria-label={`${alt} - view photo ${i + 1}`}
                className="relative cursor-pointer hover:brightness-90 transition overflow-hidden"
                onClick={() => setLightboxIdx(Math.min(i, images.length - 1))}
              >
                {img && <OptimizedImage src={img} alt={alt} fill className="object-cover" />}
                {isLast && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{remaining} {t("holysite.galleryPhotos") || "张"}</span>
                  </div>
                )}
                {isLast && remaining <= 0 && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {t("holysite.viewAll") || "查看全部"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Lightbox images={images} idx={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
    </>
  );
}

/* Lightbox */
function Lightbox({
  images, idx, onClose, onNav,
}: { images: string[]; idx: number | null; onClose: () => void; onNav: (i: number) => void }) {
  if (idx === null) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button aria-label="Close lightbox" className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10" onClick={onClose}>×</button>
      <button
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl z-10"
        onClick={(e) => { e.stopPropagation(); onNav((idx - 1 + images.length) % images.length); }}
      >‹</button>
      <button
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl z-10"
        onClick={(e) => { e.stopPropagation(); onNav((idx + 1) % images.length); }}
      >›</button>
      <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
        <OptimizedImage src={images[idx]} alt="" width={1200} height={800} className="object-contain max-h-[85vh] rounded" />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
        {idx + 1} / {images.length}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   JoinusBest 徽章 (Trip.com TripBest风格)
   ═══════════════════════════════════════════════════════════ */

function JoinusBestBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00b341]/10 border border-[#00b341]/20">
      <svg className="w-3.5 h-3.5 text-[#00b341]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-bold text-[#00b341]">Joinus Best</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   绿色圆点评分 (Trip.com风格)
   ═══════════════════════════════════════════════════════════ */

function GreenDotRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  const { t } = useTranslation();
  const label = rating >= 4.5 ? (t("rating.excellent") || "卓越") : rating >= 4 ? (t("rating.great") || "优秀") : rating >= 3.5 ? (t("rating.veryGood") || "很好") : rating >= 3 ? (t("rating.good") || "不错") : (t("rating.average") || "一般");
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? "bg-[#00b341]" : "bg-gray-200"}`} />
        ))}
      </div>
      <span className="text-sm font-bold text-[#0f294d]">{rating.toFixed(1)}/5</span>
      <span className="text-sm font-medium text-[#00b341]">{label}</span>
      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">({count}{t("common.reviews") || "条评价"})</a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   公告横幅
   ═══════════════════════════════════════════════════════════ */

function AnnouncementBanner() {
  const { t } = useTranslation();
  return (
    <div className="bg-[#fff8e6] border border-[#ffe4a0] rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4">
      <svg className="w-4 h-4 text-[#8b6914] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="text-sm text-[#8b6914] flex-1">{t("common.limitedOffer") || "限时优惠：预订包含此圣地的路线享早鸟折扣"}</span>
      <Link href="/promotions" className="text-sm text-[#3264ff] hover:underline font-medium whitespace-nowrap">{t("common.viewDetails") || "查看详情 →"}</Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   评价预览 (内联快照)
   ═══════════════════════════════════════════════════════════ */

function ReviewPreview({ targetType, targetId, siteName }: { targetType: string; targetId: string; siteName: string }) {
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews(targetType, targetId, 1)
      .then((res) => {
        if (res.data && res.data.length > 0) setReview(res.data[0]);
      })
      .catch(() => {});
  }, [targetType, targetId]);

  if (!review) return null;

  const { t } = useTranslation();
  const ratingLabel = review.rating >= 4.5 ? (t("rating.excellent") || "卓越") : review.rating >= 4 ? (t("rating.great") || "优秀") : review.rating >= 3 ? (t("rating.good") || "不错") : (t("rating.average") || "一般");

  return (
    <div className="border border-gray-200 rounded-xl p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{t("holysite.pilgrimReview")?.replace("{name}", siteName) || `文化旅行者对${siteName}的评价`}</p>
        <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{t("common.viewMoreReviews") || "查看更多评价"}</a>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00b341] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(review.user?.nickname || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{review.user?.nickname || t("common.anonymousUser") || "匿名用户"}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-[#00b341] text-white">{review.rating.toFixed(1)}/5</span>
            <span className="text-sm text-[#00b341] font-medium">{ratingLabel}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   评分分布图
   ═══════════════════════════════════════════════════════════ */

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const { t } = useTranslation();
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = stats.distribution?.[star] ?? 0;
    const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
    return { star, pct };
  });
  return (
    <div className="flex items-start gap-6 p-5 bg-[#f5f7fa] rounded-xl">
      <div className="text-center">
        <p className="text-4xl font-bold text-[#0f294d]">{stats.averageRating.toFixed(1)}</p>
        <div className="flex gap-0.5 justify-center mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(stats.averageRating) ? "bg-[#00b341]" : "bg-gray-300"}`} />
          ))}
        </div>
        <p className="text-xs text-[#8592a6] mt-1">{stats.totalCount}{t("common.reviews") || "条评价"}</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {dist.map((d) => (
          <div key={d.star} className="flex items-center gap-2">
            <span className="text-xs text-[#8592a6] w-3">{d.star}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#00b341] rounded-full" style={{ width: `${d.pct}%` }} />
            </div>
            <span className="text-xs text-[#8592a6] w-8 text-right">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   包含路线区 — Trip.com Tickets风格 + 日期Tab
   ═══════════════════════════════════════════════════════════ */

function AvailableRoutes({ siteId }: { siteId: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateTab, setDateTab] = useState(0);

  const today = new Date();
  const { t, locale } = useTranslation();
  const dateTabs = [
    { label: t("holysite.recentlyBookable") || "近期可订", date: today },
    ...[1, 2].map((offset) => {
      const d = new Date(today.getTime() + offset * 86400000);
      return { label: d.toLocaleDateString(locale || "zh-CN", { month: "short", day: "numeric" }), date: d };
    }),
  ];

  useEffect(() => {
    fetchRoutesBySite(siteId)
      .then((data) => setRoutes(data.slice(0, 6)))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading || routes.length === 0) return null;

  const lowestPrice = Math.min(...routes.filter((r) => r.priceFrom != null).map((r) => r.priceFrom));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d]">{t("holysite.routesIncluding") || "包含此圣地的路线"}</h2>
          <p className="text-sm text-[#8592a6] mt-0.5">{t("common.fromPrice") || "从"} <span className="text-[#ff6600] font-bold">¥{(lowestPrice / 100).toLocaleString()}</span>{t("common.pricePerPerson") || "/人起"}</p>
        </div>
        <Link href="/holy-sites#routes" className="text-sm text-[#3264ff] hover:underline">{t("common.viewAll") || "查看全部 →"}</Link>
      </div>

      {/* 日期Tab */}
      <div className="flex gap-2 mb-4">
        {dateTabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setDateTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateTab === i
                ? "bg-[#3264ff] text-white"
                : "bg-[#f5f7fa] text-[#455873] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {routes.map((r) => {
          const price = ((r.priceFrom ?? 0) / 100).toLocaleString();
          return (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-[#3264ff]/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/holy-sites/routes/${r.slug}`} className="text-base font-bold text-[#0f294d] hover:text-[#3264ff] transition-colors">
                    {r.title}
                  </Link>
                  {(r.bookCount ?? 0) > 0 && (
                    <span className="text-xs text-[#8592a6] ml-2">{r.bookCount ?? 0}{t("common.bookedCount") || "+ 人已预订"}</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{r.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {r.duration}{t("common.daysNights")?.replace("{nights}", String(r.nights)) || `天${r.nights}晚`}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 border border-green-100">
                      <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4" /></svg>
                      {t("common.instantConfirm") || "即时确认"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-600 border border-gray-100">
                      {t("common.freeCancel14") || "14天免费取消"}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#8592a6]">{t("common.startingPrice") || "起价"}</p>
                  <p className="text-2xl font-bold text-[#ff6600]">¥{price}</p>
                  <Link
                    href={`/holy-sites/routes/${r.slug}`}
                    className="mt-2 inline-block px-6 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    {t("common.bookNow") || "立即预订"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ手风琴
   ═══════════════════════════════════════════════════════════ */

function FAQSection({ siteName, country }: { siteName: string; country: string }) {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: (t("holysite.faq.q1") || `如何到达${siteName}？`).replace("{name}", siteName).replace("{country}", country), a: (t("holysite.faq.a1") || `${siteName}位于${country}，可通过公共交通或自驾前往。建议提前查看具体交通路线，部分圣地可能需要步行一段距离。推荐使用AI规划师获取详细交通方案。`).replace("{name}", siteName).replace("{country}", country) },
    { q: t("holysite.faq.q2") || "最佳参访时间是什么时候？", a: t("holysite.faq.a2") || "一般推荐春秋两季参访，天气宜人且游客相对较少。重要文化节日期间会有特殊活动，但也会更加拥挤。建议避开公共假期高峰期。" },
    { q: t("holysite.faq.q3") || "需要购买门票吗？", a: t("holysite.faq.a3") || "不同圣地的门票政策各异。部分文化场所免费开放，部分收取象征性的维护费用。具体票价请查看路线详情页或咨询AI规划师。" },
    { q: t("holysite.faq.q4") || "周边有住宿推荐吗？", a: t("holysite.faq.a4") || "大部分圣地周边都有丰富的住宿选择，从经济型客栈到修行中心、禅修民宿应有尽有。预订包含此圣地的路线套餐可享受精选住宿安排。" },
    { q: t("holysite.faq.q5") || "有着装要求吗？", a: t("holysite.faq.a5") || "参访文化圣地通常需要得体着装，避免过于暴露的服装。部分殿堂内需要脱鞋，建议穿易穿脱的鞋子。请尊重当地文化习俗。" },
    { q: t("holysite.faq.q6") || "可以拍照吗？", a: t("holysite.faq.a6") || "户外区域通常允许拍照，但殿堂内部可能禁止拍照或使用闪光灯。请留意现场标识，尊重文化场所的规定。" },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("common.faq") || "常见问题"}</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors"
            >
              <span className="font-medium text-[#0f294d] text-sm pr-4">{faq.q}</span>
              <svg className={`w-4 h-4 text-[#8592a6] shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[#455873] leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   周边推荐
   ═══════════════════════════════════════════════════════════ */

function NearbySites({ currentSite }: { currentSite: HolySite }) {
  const { t } = useTranslation();
  const [sites, setSites] = useState<HolySite[]>([]);
  const [tab, setTab] = useState<"same" | "nearby">("same");

  useEffect(() => {
    fetchHolySites(currentSite.religionId)
      .then((data) => setSites(data.filter((s) => s.id !== currentSite.id).slice(0, 6)))
      .catch(() => {});
  }, [currentSite.id, currentSite.religionId]);

  if (sites.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("holysite.nearbyRecommend") || "周边推荐"}</h2>
      <div className="flex gap-4 mb-4">
        {(["same", "nearby"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tabKey ? "bg-[#0f294d] text-white" : "bg-[#f5f7fa] text-[#0f294d] hover:bg-gray-200"
            }`}
          >
            {tabKey === "same" ? (t("holysite.sameFaith") || "同信仰圣地") : (t("holysite.nearbyAttractions") || "附近景点")}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sites.slice(0, tab === "same" ? 6 : 3).map((s) => (
          <Link key={s.id} href={`/holy-sites/${s.id}`} className="group block">
            <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="relative h-32 overflow-hidden">
                {s.imageUrl ? (
                  <OptimizedImage src={s.imageUrl} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-[#f5f7fa] flex items-center justify-center">
                    <span className="text-4xl opacity-30">{s.religion?.symbol || "🕌"}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-[#0f294d] group-hover:text-[#3264ff] transition-colors line-clamp-1">{s.name}</h3>
                <p className="text-xs text-[#8592a6] mt-0.5">{s.country}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   更多推荐手风琴
   ═══════════════════════════════════════════════════════════ */

function MoreRecommendations({ religion, country }: { religion?: string; country: string }) {
  const { t } = useTranslation();
  const items = [
    { href: `/holy-sites?country=${encodeURIComponent(country)}`, label: t("holysite.nearbySites")?.replace("{country}", country) || `${country}附近圣地` },
    { href: "/holy-sites#routes", label: t("holysite.popularRoutes") || "热门文化路线" },
    { href: "/community?type=guide", label: t("holysite.recommendedGuides") || "推荐旅行攻略" },
    { href: "/community?type=tip", label: t("holysite.travelTips") || "旅行实用贴士" },
    ...(religion ? [{ href: `/holy-sites?religion=${encodeURIComponent(religion)}`, label: t("holysite.relatedSites")?.replace("{religion}", religion) || `${religion}相关圣地` }] : []),
  ];
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("common.moreRecommendations") || "更多推荐"}</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors"
          >
            <span className="font-medium text-[#0f294d] text-sm">{item.label}</span>
            <span className="text-[#8592a6]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P1. Sticky跳转导航栏 (Booking.com/TripAdvisor/GetYourGuide)
   ═══════════════════════════════════════════════════════════ */

function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (!visible) return null;

  return (
    <div className="sticky top-[64px] z-30 bg-white border-b border-[#dadfe6] shadow-sm">
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto scrollbar-none">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === s.id ? "border-[#3264ff] text-[#3264ff]" : "border-transparent text-[#8592a6] hover:text-[#0f294d]"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P2. 热门徽章 (Booking.com/TripAdvisor)
   ═══════════════════════════════════════════════════════════ */

function PopularityBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff6600]/10 border border-[#ff6600]/20">
      <svg className="w-3 h-3 text-[#ff6600]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
      <span className="text-xs font-bold text-[#ff6600]">{t("common.weeklyViews")?.replace("{count}", String(count)) || `本周${count}人浏览`}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   P3. 文化礼仪指南 (TripAdvisor/GetYourGuide — 独特优势)
   ═══════════════════════════════════════════════════════════ */

function CulturalEtiquette() {
  const { t } = useTranslation();
  const rules = [
    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: t("etiquette.dressCode") || "着装规范", desc: t("etiquette.dressDesc") || "穿着得体，遮盖肩膀和膝盖，避免暴露服装" },
    { icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z", title: t("etiquette.photography") || "拍照须知", desc: t("etiquette.photoDesc") || "殿堂内禁止拍照和使用闪光灯，户外可自由拍摄" },
    { icon: "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z", title: t("etiquette.quiet") || "保持安静", desc: t("etiquette.quietDesc") || "殿堂内保持肃静，手机调为静音模式" },
    { icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11", title: t("etiquette.worship") || "参拜礼仪", desc: t("etiquette.worshipDesc") || "请遵循当地文化参拜方式，入乡随俗" },
    { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: t("etiquette.shoes") || "脱鞋区域", desc: t("etiquette.shoesDesc") || "部分殿堂需脱鞋进入，穿易穿脱的鞋子" },
    { icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", title: t("etiquette.taboos") || "禁忌事项", desc: t("etiquette.taboosDesc") || "勿触摸佛像，勿用手指向神像" },
  ];
  return (
    <div className="mt-6" id="sec-etiquette">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("etiquette.title") || "参访礼仪指南"}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rules.map((r, i) => (
          <div key={i} className="p-3 bg-[#f5f7fa] rounded-xl border border-gray-100">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-[#3264ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={r.icon} /></svg>
            </div>
            <p className="text-sm font-medium text-[#0f294d] mb-0.5">{r.title}</p>
            <p className="text-xs text-[#8592a6] leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P4. 最佳到访时间 (TripAdvisor/Expedia)
   ═══════════════════════════════════════════════════════════ */

function BestTimeToVisit() {
  const { t } = useTranslation();
  const months = [
    t("common.month.1") || "1月", t("common.month.2") || "2月", t("common.month.3") || "3月",
    t("common.month.4") || "4月", t("common.month.5") || "5月", t("common.month.6") || "6月",
    t("common.month.7") || "7月", t("common.month.8") || "8月", t("common.month.9") || "9月",
    t("common.month.10") || "10月", t("common.month.11") || "11月", t("common.month.12") || "12月",
  ];
  const heat = [3,3,4,5,5,3,2,2,4,5,5,3];
  const currentMonth = new Date().getMonth();
  const colors = ["bg-gray-200","bg-gray-200","bg-green-100","bg-green-200","bg-green-300","bg-green-400"];
  return (
    <div className="mt-4 p-4 bg-[#f5f7fa] rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-[#3264ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span className="text-sm font-medium text-[#0f294d]">{t("holysite.bestTime.title") || "最佳到访时间"}</span>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {months.map((m, i) => (
          <div key={i} className="text-center">
            <div className={`h-6 rounded ${colors[heat[i]]} ${i === currentMonth ? "ring-2 ring-[#3264ff]" : ""}`} />
            <span className="text-[10px] text-[#8592a6] mt-1 block">{m}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8592a6]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> {t("holysite.bestTime.best") || "最佳"}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-200" /> {t("holysite.bestTime.good") || "适宜"}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-200" /> {t("holysite.bestTime.average") || "一般"}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P5. 无障碍信息 (Booking.com/Airbnb/GetYourGuide)
   ═══════════════════════════════════════════════════════════ */

function AccessibilityInfo() {
  const { t } = useTranslation();
  const items = [
    { available: true, label: t("holysite.accessibility.wheelchair") || "轮椅通道" },
    { available: true, label: t("holysite.accessibility.restroom") || "无障碍洗手间" },
    { available: false, label: t("holysite.accessibility.braille") || "盲文指引" },
    { available: true, label: t("holysite.accessibility.elderly") || "老年人友好" },
    { available: true, label: t("holysite.accessibility.stroller") || "婴儿车通行" },
    { available: false, label: t("holysite.accessibility.signLang") || "手语导览" },
  ];
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-[#0f294d] mb-2">{t("holysite.accessibility.title") || "无障碍设施"}</h3>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {item.available ? (
              <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            )}
            <span className={item.available ? "text-[#0f294d]" : "text-[#8592a6]"}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P6. 支付方式图标 (Booking.com/Agoda/Priceline)
   ═══════════════════════════════════════════════════════════ */

function PaymentMethodIcons() {
  const { t } = useTranslation();
  const methods = [
    t("holysite.payment.wechat") || "微信支付",
    t("holysite.payment.alipay") || "支付宝",
    "Visa",
    t("holysite.payment.unionpay") || "银联",
  ];
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] text-[#8592a6] mb-2">{t("holysite.payment.title") || "支持支付方式"}</p>
      <div className="flex items-center gap-2">
        {methods.map((m) => (
          <span key={m} className="px-2 py-1 bg-[#f5f7fa] rounded text-[10px] text-[#455873] border border-gray-100">{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P7. 出行准备清单 (GetYourGuide/Expedia/Airbnb)
   ═══════════════════════════════════════════════════════════ */

function PackingChecklist() {
  const { t } = useTranslation();
  const items = [
    { checked: true, label: t("holysite.packing.passport") || "有效身份证件/护照" },
    { checked: true, label: t("holysite.packing.shoes") || "舒适的步行鞋" },
    { checked: true, label: t("holysite.packing.sun") || "防晒帽/遮阳伞" },
    { checked: true, label: t("holysite.packing.water") || "饮用水" },
    { checked: true, label: t("holysite.packing.clothes") || "得体的长袖衣物" },
    { checked: false, label: t("holysite.packing.camera") || "相机（注意拍照规定）" },
    { checked: false, label: t("holysite.packing.rain") || "雨具（视天气）" },
    { checked: false, label: t("holysite.packing.cash") || "小额现金/零钱" },
  ];
  return (
    <div className="mt-6" id="sec-packing">
      <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("holysite.packing.title") || "出行准备清单"}</h2>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f5f7fa] rounded-lg">
            <svg className={`w-4 h-4 shrink-0 ${item.checked ? "text-[#00b341]" : "text-[#8592a6]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {item.checked
                ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
            <span className="text-sm text-[#0f294d]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   P10. 旅行者类型标签 (GetYourGuide/TripAdvisor)
   ═══════════════════════════════════════════════════════════ */

function TravelerTypeTags() {
  const { t } = useTranslation();
  const types = [
    { label: t("holysite.travelerTypes.solo") || "独行探访", pct: 35 },
    { label: t("holysite.travelerTypes.family") || "家庭出行", pct: 25 },
    { label: t("holysite.travelerTypes.couple") || "情侣同行", pct: 20 },
    { label: t("holysite.travelerTypes.friends") || "朋友结伴", pct: 15 },
    { label: t("holysite.travelerTypes.group") || "团队参访", pct: 5 },
  ];
  return (
    <div className="mb-4 p-4 bg-[#f5f7fa] rounded-xl">
      <p className="text-sm font-medium text-[#0f294d] mb-3">{t("holysite.travelerTypes.title") || "旅行者类型分布"}</p>
      <div className="space-y-2">
        {types.map((tp) => (
          <div key={tp.label} className="flex items-center gap-3">
            <span className="text-xs text-[#455873] w-20">{tp.label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#3264ff] rounded-full" style={{ width: `${tp.pct}%` }} />
            </div>
            <span className="text-xs text-[#8592a6] w-8 text-right">{tp.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sticky CTA卡片 — Trip.com风格 (含价格)
   ═══════════════════════════════════════════════════════════ */

function StickyCTACard({ site, lowestPrice }: { site: HolySite; lowestPrice: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        {lowestPrice !== null && lowestPrice > 0 ? (
          <>
            <p className="text-xs text-[#8592a6]">{t("holysite.cta.routePrice") || "路线起价"}</p>
            <p className="text-3xl font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</p>
            <p className="text-xs text-[#8592a6]">{t("holysite.cta.perPerson") || "每人起"}</p>

            <Link
              href="#routes"
              className="mt-4 block w-full py-3 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-center transition-colors text-base"
            >
              {t("holysite.cta.bookNow") || "立即预订"}
            </Link>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-[#8592a6]">{t("holysite.cta.explore") || "探访圣地"}</p>
            <p className="text-center text-lg font-bold text-[#0f294d] mt-1">{site.name}</p>
          </>
        )}

        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的文化之旅路线`)}`}
          className="mt-3 block w-full py-2.5 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors text-sm"
        >
          {t("holysite.cta.aiConsult") || "AI规划师咨询"}
        </Link>
        <Link
          href="/holy-sites#routes"
          className="mt-2 block w-full py-2.5 rounded-lg border border-gray-200 text-[#0f294d] hover:bg-[#f5f7fa] font-medium text-center text-sm transition-colors"
        >
          {t("holysite.cta.viewRoutes") || "查看相关路线"}
        </Link>

        {/* 保障标签 */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            {t("holysite.cta.instantConfirm") || "即时确认"}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            {t("holysite.cta.freeCancel") || "14天免费取消"}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            {t("holysite.cta.securePayment") || "安全支付保障"}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
          <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
        </div>

        {/* 支付方式 */}
        <PaymentMethodIcons />
      </div>

      {/* 地图预览 */}
      <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
        <div className="h-36">
          <WorldMapDynamic holySites={[site]} height="144px" selectedSiteId={site.id} interactive={false} />
        </div>
        <Link href={`/map?lat=${site.latitude}&lng=${site.longitude}`} className="block text-center text-sm text-[#3264ff] hover:underline py-2 border-t border-gray-100">
          {`${t("holysite.cta.viewMap") || "查看大地图"} →`}
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   主页面
   ═══════════════════════════════════════════════════════════ */

export default function HolySiteDetailClient({ site }: { site: HolySite }) {
  const { t } = useTranslation();
  const religionColor = site.religion?.color ?? "#3264ff";
  const galleryImages = [
    ...(site.imageUrl ? [site.imageUrl] : []),
    ...(site.galleryImages ?? []),
  ];

  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  useEffect(() => {
    recordView("HOLY_SITE", site.id);
    fetchReviewStats("holy-site", site.id).then(setReviewStats).catch(() => {});
    fetchRoutesBySite(site.id)
      .then((routes) => {
        if (routes.length > 0) {
          setLowestPrice(Math.min(...routes.map((r) => r.priceFrom)));
        }
      })
      .catch(() => {});
  }, [site.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ S1. 面包屑 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pt-20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#8592a6]">
            <Link href="/" className="hover:text-[#3264ff] transition-colors">{t("holysite.breadcrumb.home") || "首页"}</Link>
            <span>&gt;</span>
            <Link href="/holy-sites" className="hover:text-[#3264ff] transition-colors">{t("nav.holySites") || "圣地"}</Link>
            <span>&gt;</span>
            {site.religion && (
              <>
                <Link href={`/religions/${site.religion.slug}`} className="hover:text-[#3264ff] transition-colors">{site.religion.name}</Link>
                <span>&gt;</span>
              </>
            )}
            <span className="text-[#0f294d]">{site.name}</span>
          </div>
          <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
        </div>
      </div>

      {/* ═══ S2. Trip.com画廊 (左大图+右竖排缩略图) ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 mb-4">
        <GalleryGrid images={galleryImages} alt={site.name} />
      </div>

      {/* ═══ S3. 公告横幅 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4">
        <AnnouncementBanner />
      </div>

      {/* ═══ Sticky跳转导航栏 ═══ */}
      <SectionNav sections={[
        { id: "sec-info", label: t("holysite.nav.overview") || "概览" },
        { id: "routes", label: t("holysite.nav.routes") || "路线预订" },
        { id: "sec-intro", label: t("holysite.nav.intro") || "圣地介绍" },
        { id: "reviews", label: t("holysite.nav.reviews") || "评价" },
        { id: "sec-facilities", label: t("holysite.nav.facilities") || "设施" },
        { id: "sec-etiquette", label: t("holysite.nav.etiquette") || "参访礼仪" },
        { id: "sec-packing", label: t("holysite.nav.packing") || "出行准备" },
        { id: "sec-faq", label: t("holysite.nav.faq") || "常见问题" },
        ...(site.transport ? [{ id: "sec-transport", label: t("holysite.nav.transport") || "交通指南" }] : []),
        { id: "sec-nearby", label: t("holysite.nav.nearby") || "周边推荐" },
      ]} />

      {/* ═══ S4-S16. 两栏布局 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── 左侧主内容 ─── */}
          <div className="flex-1 min-w-0">

            {/* S4. 标题信息区 — Trip.com增强版 */}
            <div id="sec-info" className="pb-6 border-b border-[#dadfe6]">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <JoinusBestBadge />
                    <PopularityBadge count={site.collectionCount ?? 0} />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0f294d]">{site.name}</h1>
                  {site.nameEn && <p className="text-sm text-[#8592a6] mt-0.5">{site.nameEn}</p>}
                </div>
                <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
              </div>

              {/* 绿色圆点评分 */}
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mt-3">
                  <GreenDotRating rating={reviewStats.averageRating} count={reviewStats.totalCount} />
                </div>
              )}

              {/* 分类标签 */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {site.religion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${religionColor}15`, color: religionColor }}>
                    {site.religion.symbol} {site.religion.name}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {site.country}
                </span>
                <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  {t("holysite.suggestHours") || "建议2-3小时"}
                </span>
                {site.religion && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{t("holysite.faithSite")?.replace("{religion}", site.religion.name) || `${site.religion.name}圣地`}</span>
                )}
              </div>
            </div>

            {/* S5. 实用信息区 — Trip.com紧凑列表 */}
            <div className="py-4 border-b border-[#dadfe6] space-y-3">
              {/* 营业状态 */}
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00b341]" />
                  <span className="font-medium text-[#00b341]">{t("holysite.openStatus") || "开放参观"}</span>
                  {site.openingHours && <span className="text-[#455873] font-normal ml-1">({site.openingHours})</span>}
                </span>
                <span className="text-[#8592a6]">·</span>
                <span className="text-[#455873]">{site.visitDuration || t("holysite.visitDuration") || "建议参访时长 2-3小时"}</span>
              </div>
              {/* 地址 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="flex-1">{site.country} <span className="text-[#8592a6]">({site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E)</span></span>
                <Link href={`/map?lat=${site.latitude}&lng=${site.longitude}`} className="text-[#3264ff] hover:underline text-sm">
                  {t("holysite.viewOnMap") || "查看地图"}
                </Link>
              </div>
              {/* 时区 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span>{t("holysite.timezoneLabel") || "时区"} UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</span>
              </div>
              {/* 着装提醒 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                <span>{t("holysite.dressReminder") || "得体着装，殿堂内禁止拍照"}</span>
              </div>

              {/* 最佳到访时间热力图 */}
              <BestTimeToVisit />
            </div>

            {/* S6. 评价预览 */}
            <ReviewPreview targetType="holy-site" targetId={site.id} siteName={site.name} />

            {/* S7. 包含路线 — Trip.com Tickets风格 */}
            <div id="routes">
              <AvailableRoutes siteId={site.id} />
            </div>

            {/* S7.5 旅游配套++ 4档×7类 */}
            <div id="packages">
              <TravelPackages siteId={site.id} />
            </div>

            {/* S9. 圣地介绍 */}
            <div id="sec-intro" className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("holysite.introTitle") || "圣地介绍"}</h2>
              <ExpandableText text={site.description} maxLength={300} />
            </div>

            {/* Religion Context */}
            {site.religion && (
              <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-gray-200" style={{ backgroundColor: `${religionColor}08` }}>
                <span className="text-3xl">{site.religion.symbol}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#0f294d]">{site.religion.name}</p>
                  <p className="text-sm text-[#8592a6]">{site.religion.nameEn}</p>
                </div>
                <Link href={`/religions/${site.religion.slug}`} className="text-sm text-[#3264ff] hover:underline">{`${t("holysite.learnMore") || "了解更多"} →`}</Link>
              </div>
            )}

            {/* Media Tour */}
            <div className="mt-6">
              <MediaTour entityType="HOLY_SITE" entityId={site.id} />
            </div>

            {/* S8. 评分分布 + 评价完整区 */}
            <div id="reviews" className="mt-6">
              {/* 旅行者类型分布 */}
              <TravelerTypeTags />
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mb-4">
                  <RatingDistribution stats={reviewStats} />
                </div>
              )}
              <ReviewSection targetType="holy-site" targetId={site.id} />
            </div>

            {/* S11. 设施与服务 */}
            <div id="sec-facilities" className="mt-6">
              <h2 className="text-base font-bold text-[#0f294d] mb-3">{t("holysite.facilitiesTitle") || "设施与服务"}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("holysite.facility.parking") || "停车场" }, { label: t("holysite.facility.restroom") || "洗手间" },
                  { label: t("holysite.facility.accessible") || "无障碍通道" }, { label: t("holysite.facility.storage") || "寄存处" },
                  { label: t("holysite.facility.guide") || "讲解服务" }, { label: "WiFi" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f5f7fa] rounded-lg">
                    <svg className="w-4 h-4 text-[#00b341] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm text-[#0f294d]">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* 无障碍设施 */}
              <AccessibilityInfo />
            </div>

            {/* 参访礼仪指南 */}
            <CulturalEtiquette />

            {/* 出行准备清单 */}
            <PackingChecklist />

            {/* FAQ */}
            <div id="sec-faq">
              <FAQSection siteName={site.name} country={site.country} />
            </div>

            {/* 交通指南 */}
            {site.transport && (
              <div id="sec-transport" className="mt-6">
                <h2 className="text-base font-bold text-[#0f294d] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3264ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 7h8m-8 4h4m-2 4v3m-4 0h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
                  {t("holysite.transportTitle") || "交通指南"}
                </h2>
                <div className="p-4 bg-[#f5f7fa] rounded-xl text-sm text-[#455873] leading-relaxed whitespace-pre-line">
                  {site.transport}
                </div>
              </div>
            )}

            {/* S10. 周边推荐 */}
            <div id="sec-nearby">
              <NearbySites currentSite={site} />
            </div>

            {/* S12. UGC照片墙 */}
            <div className="mt-6">
              <UGCPhotoWall targetType="holy-site" targetId={site.id} />
            </div>

            {/* Q&A */}
            <div className="mt-6">
              <QASection entityType="HOLY_SITE" entityId={site.id} />
            </div>

            {/* S13. 你可能也喜欢 */}
            <div className="mt-6">
              <RelatedEntities entityType="HOLY_SITE" entityId={site.id} title={t("holysite.youMayLike") || "你可能也喜欢"} />
            </div>

            {/* S16. 更多推荐手风琴 */}
            <MoreRecommendations religion={site.religion?.name} country={site.country} />
          </div>

          {/* ─── 右侧Sticky CTA (桌面端) ─── */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <StickyCTACard site={site} lowestPrice={lowestPrice} />
          </div>
        </div>
      </div>

      {/* 移动端粘性底栏 */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 min-w-0">
          {lowestPrice !== null && lowestPrice > 0 ? (
            <div>
              <span className="text-xs text-[#8592a6]">{t("holysite.cta.startingPrice") || "起价"} </span>
              <span className="text-lg font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</span>
            </div>
          ) : reviewStats && reviewStats.totalCount > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-[#00b341] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">
                {reviewStats.averageRating >= 4.5 ? (t("holysite.ratingExcellent") || "卓越") : reviewStats.averageRating >= 4 ? (t("holysite.ratingGreat") || "优秀") : (t("holysite.ratingGood") || "很好")}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8592a6] line-clamp-1">{site.name}</p>
          )}
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的文化之旅路线`)}`}
          className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold rounded-lg text-sm transition-colors"
        >
          {t("holysite.cta.bookNow") || "立即预订"}
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}

/* ─── ExpandableText ─── */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  return (
    <div>
      <p className="text-sm text-[#0f294d] leading-relaxed whitespace-pre-line">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[#3264ff] hover:underline text-sm font-medium">
          {expanded ? (t("holysite.collapse") || "收起") : (t("holysite.expand") || "展开全部")} {expanded ? "△" : "▽"}
        </button>
      )}
    </div>
  );
}
