"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import ReviewSection from "@/components/ReviewSection";
import RelatedEntities from "@/components/RelatedEntities";
import MediaTour from "@/components/MediaTour";
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
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const display = images.slice(0, 5);
  const remaining = images.length - 5;

  if (display.length === 0) return null;

  if (display.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="relative h-[400px] cursor-pointer" onClick={() => setLightboxIdx(0)}>
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
                className="relative cursor-pointer hover:brightness-90 transition overflow-hidden"
                onClick={() => setLightboxIdx(Math.min(i, images.length - 1))}
              >
                {img && <OptimizedImage src={img} alt={alt} fill className="object-cover" />}
                {isLast && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{remaining} 张</span>
                  </div>
                )}
                {isLast && remaining <= 0 && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                    查看全部
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
      <button className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10" onClick={onClose}>×</button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl z-10"
        onClick={(e) => { e.stopPropagation(); onNav((idx - 1 + images.length) % images.length); }}
      >‹</button>
      <button
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
  const label = rating >= 4.5 ? "卓越" : rating >= 4 ? "优秀" : rating >= 3.5 ? "很好" : rating >= 3 ? "不错" : "一般";
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? "bg-[#00b341]" : "bg-gray-200"}`} />
        ))}
      </div>
      <span className="text-sm font-bold text-[#0f294d]">{rating.toFixed(1)}/5</span>
      <span className="text-sm font-medium text-[#00b341]">{label}</span>
      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">({count}条评价)</a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   公告横幅
   ═══════════════════════════════════════════════════════════ */

function AnnouncementBanner() {
  return (
    <div className="bg-[#fff8e6] border border-[#ffe4a0] rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4">
      <svg className="w-4 h-4 text-[#8b6914] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="text-sm text-[#8b6914] flex-1">限时优惠：预订包含此圣地的路线享早鸟折扣</span>
      <Link href="/promotions" className="text-sm text-[#3264ff] hover:underline font-medium whitespace-nowrap">查看详情 →</Link>
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

  const ratingLabel = review.rating >= 4.5 ? "卓越" : review.rating >= 4 ? "优秀" : review.rating >= 3 ? "不错" : "一般";

  return (
    <div className="border border-gray-200 rounded-xl p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">朝圣者对{siteName}的评价</p>
        <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">查看更多评价</a>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00b341] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(review.user?.nickname || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{review.user?.nickname || "匿名用户"}</span>
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
  const dist = [
    { star: 5, pct: 68 },
    { star: 4, pct: 22 },
    { star: 3, pct: 6 },
    { star: 2, pct: 3 },
    { star: 1, pct: 1 },
  ];
  return (
    <div className="flex items-start gap-6 p-5 bg-[#f5f7fa] rounded-xl">
      <div className="text-center">
        <p className="text-4xl font-bold text-[#0f294d]">{stats.averageRating.toFixed(1)}</p>
        <div className="flex gap-0.5 justify-center mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(stats.averageRating) ? "bg-[#00b341]" : "bg-gray-300"}`} />
          ))}
        </div>
        <p className="text-xs text-[#8592a6] mt-1">{stats.totalCount}条评价</p>
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
  const dateTabs = [
    { label: "近期可订", date: today },
    { label: `${today.getMonth() + 1}月${today.getDate() + 1}日`, date: new Date(today.getTime() + 86400000) },
    { label: `${today.getMonth() + 1}月${today.getDate() + 2}日`, date: new Date(today.getTime() + 172800000) },
  ];

  useEffect(() => {
    fetchRoutesBySite(siteId)
      .then((data) => setRoutes(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading || routes.length === 0) return null;

  const lowestPrice = Math.min(...routes.map((r) => r.priceFrom));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d]">包含此圣地的路线</h2>
          <p className="text-sm text-[#8592a6] mt-0.5">从 <span className="text-[#ff6600] font-bold">¥{(lowestPrice / 100).toLocaleString()}</span>/人起</p>
        </div>
        <Link href="/routes" className="text-sm text-[#3264ff] hover:underline">查看全部 →</Link>
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
          const price = (r.priceFrom / 100).toLocaleString();
          return (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-[#3264ff]/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/routes/${r.slug}`} className="text-base font-bold text-[#0f294d] hover:text-[#3264ff] transition-colors">
                    {r.title}
                  </Link>
                  {r.bookCount > 0 && (
                    <span className="text-xs text-[#8592a6] ml-2">{r.bookCount}+ 人已预订</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{r.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {r.duration}天{r.nights}晚
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 border border-green-100">
                      <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4" /></svg>
                      即时确认
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-600 border border-gray-100">
                      14天免费取消
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#8592a6]">起价</p>
                  <p className="text-2xl font-bold text-[#ff6600]">¥{price}</p>
                  <Link
                    href={`/routes/${r.slug}`}
                    className="mt-2 inline-block px-6 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    立即预订
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
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: `如何到达${siteName}？`, a: `${siteName}位于${country}，可通过公共交通或自驾前往。建议提前查看具体交通路线，部分圣地可能需要步行一段距离。推荐使用AI规划师获取详细交通方案。` },
    { q: "最佳参访时间是什么时候？", a: "一般推荐春秋两季参访，天气宜人且游客相对较少。重要宗教节日期间会有特殊活动，但也会更加拥挤。建议避开公共假期高峰期。" },
    { q: "需要购买门票吗？", a: "不同圣地的门票政策各异。部分宗教场所免费开放，部分收取象征性的维护费用。具体票价请查看路线详情页或咨询AI规划师。" },
    { q: "周边有住宿推荐吗？", a: "大部分圣地周边都有丰富的住宿选择，从经济型客栈到修行中心、禅修民宿应有尽有。预订包含此圣地的路线套餐可享受精选住宿安排。" },
    { q: "有着装要求吗？", a: "参访宗教圣地通常需要得体着装，避免过于暴露的服装。部分殿堂内需要脱鞋，建议穿易穿脱的鞋子。请尊重当地宗教文化习俗。" },
    { q: "可以拍照吗？", a: "户外区域通常允许拍照，但殿堂内部可能禁止拍照或使用闪光灯。请留意现场标识，尊重宗教场所的规定。" },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">常见问题</h2>
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
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">周边推荐</h2>
      <div className="flex gap-4 mb-4">
        {(["same", "nearby"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-[#0f294d] text-white" : "bg-[#f5f7fa] text-[#0f294d] hover:bg-gray-200"
            }`}
          >
            {t === "same" ? "同信仰圣地" : "附近景点"}
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
  const [open, setOpen] = useState<string | null>(null);
  const items = [
    { key: "nearby", label: `${country}附近圣地` },
    { key: "popular", label: "热门朝圣路线" },
    { key: "guides", label: "推荐朝圣攻略" },
    { key: "tips", label: "旅行实用贴士" },
    ...(religion ? [{ key: "religion", label: `${religion}相关圣地` }] : []),
  ];
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">更多推荐</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setOpen(open === item.key ? null : item.key)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors"
          >
            <span className="font-medium text-[#0f294d] text-sm">{item.label}</span>
            <span className={`text-[#8592a6] transition-transform ${open === item.key ? "rotate-180" : ""}`}>▾</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sticky CTA卡片 — Trip.com风格 (含价格)
   ═══════════════════════════════════════════════════════════ */

function StickyCTACard({ site, lowestPrice }: { site: HolySite; lowestPrice: number | null }) {
  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        {lowestPrice !== null && lowestPrice > 0 ? (
          <>
            <p className="text-xs text-[#8592a6]">路线起价</p>
            <p className="text-3xl font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</p>
            <p className="text-xs text-[#8592a6]">每人起</p>

            <Link
              href="#routes"
              className="mt-4 block w-full py-3 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-center transition-colors text-base"
            >
              立即预订
            </Link>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-[#8592a6]">探访圣地</p>
            <p className="text-center text-lg font-bold text-[#0f294d] mt-1">{site.name}</p>
          </>
        )}

        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
          className="mt-3 block w-full py-2.5 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors text-sm"
        >
          AI规划师咨询
        </Link>
        <Link
          href="/routes"
          className="mt-2 block w-full py-2.5 rounded-lg border border-gray-200 text-[#0f294d] hover:bg-[#f5f7fa] font-medium text-center text-sm transition-colors"
        >
          查看相关路线
        </Link>

        {/* 保障标签 */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            即时确认
          </div>
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            14天免费取消
          </div>
          <div className="flex items-center gap-2 text-xs text-[#455873]">
            <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            安全支付保障
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
          <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
        </div>
      </div>

      {/* 地图预览 */}
      <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
        <div className="h-36">
          <WorldMapDynamic holySites={[site]} height="144px" selectedSiteId={site.id} interactive={false} />
        </div>
        <Link href={`/map?lat=${site.latitude}&lng=${site.longitude}`} className="block text-center text-sm text-[#3264ff] hover:underline py-2 border-t border-gray-100">
          查看大地图 →
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
            <Link href="/" className="hover:text-[#3264ff] transition-colors">首页</Link>
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

      {/* ═══ S4-S16. 两栏布局 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── 左侧主内容 ─── */}
          <div className="flex-1 min-w-0">

            {/* S4. 标题信息区 — Trip.com增强版 */}
            <div className="pb-6 border-b border-[#dadfe6]">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <JoinusBestBadge />
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
                  建议2-3小时
                </span>
                {site.religion && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{site.religion.name}圣地</span>
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
                  <span className="font-medium text-[#00b341]">开放参观</span>
                </span>
                <span className="text-[#8592a6]">·</span>
                <span className="text-[#455873]">建议参访时长 2-3小时</span>
              </div>
              {/* 地址 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="flex-1">{site.country} <span className="text-[#8592a6]">({site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E)</span></span>
                <Link href={`/map?lat=${site.latitude}&lng=${site.longitude}`} className="text-[#3264ff] hover:underline text-sm">
                  查看地图
                </Link>
              </div>
              {/* 时区 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span>时区 UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</span>
              </div>
              {/* 着装提醒 */}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                <span>得体着装，殿堂内禁止拍照</span>
              </div>
            </div>

            {/* S6. 评价预览 */}
            <ReviewPreview targetType="holy-site" targetId={site.id} siteName={site.name} />

            {/* S7. 包含路线 — Trip.com Tickets风格 */}
            <div id="routes">
              <AvailableRoutes siteId={site.id} />
            </div>

            {/* S9. 圣地介绍 */}
            <div className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">圣地介绍</h2>
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
                <Link href={`/religions/${site.religion.slug}`} className="text-sm text-[#3264ff] hover:underline">了解更多 →</Link>
              </div>
            )}

            {/* Media Tour */}
            <div className="mt-6">
              <MediaTour entityType="HOLY_SITE" entityId={site.id} />
            </div>

            {/* S8. 评分分布 + 评价完整区 */}
            <div id="reviews" className="mt-6">
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mb-4">
                  <RatingDistribution stats={reviewStats} />
                </div>
              )}
              <ReviewSection targetType="holy-site" targetId={site.id} />
            </div>

            {/* S11. 设施与服务 */}
            <div className="mt-6">
              <h2 className="text-base font-bold text-[#0f294d] mb-3">设施与服务</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "停车场" }, { label: "洗手间" },
                  { label: "无障碍通道" }, { label: "寄存处" },
                  { label: "讲解服务" }, { label: "WiFi" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f5f7fa] rounded-lg">
                    <svg className="w-4 h-4 text-[#00b341] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm text-[#0f294d]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <FAQSection siteName={site.name} country={site.country} />

            {/* S10. 周边推荐 */}
            <NearbySites currentSite={site} />

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
              <RelatedEntities entityType="HOLY_SITE" entityId={site.id} title="你可能也喜欢" />
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
              <span className="text-xs text-[#8592a6]">起价 </span>
              <span className="text-lg font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</span>
            </div>
          ) : reviewStats && reviewStats.totalCount > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-[#00b341] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">
                {reviewStats.averageRating >= 4.5 ? "卓越" : reviewStats.averageRating >= 4 ? "优秀" : "很好"}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8592a6] line-clamp-1">{site.name}</p>
          )}
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
          className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold rounded-lg text-sm transition-colors"
        >
          立即预订
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}

/* ─── ExpandableText ─── */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  return (
    <div>
      <p className="text-sm text-[#0f294d] leading-relaxed whitespace-pre-line">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[#3264ff] hover:underline text-sm font-medium">
          {expanded ? "收起" : "展开全部"} {expanded ? "△" : "▽"}
        </button>
      )}
    </div>
  );
}
