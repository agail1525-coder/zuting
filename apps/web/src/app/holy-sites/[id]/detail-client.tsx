"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
   S2. 图片画廊 — Trip.com 3列网格 (非全屏Hero)
   ═══════════════════════════════════════════════════════════ */

function GalleryGrid({ images, alt }: { images: string[]; alt: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const display = images.slice(0, 5);
  const remaining = images.length - 5;

  if (display.length === 0) return null;

  // 单图
  if (display.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="relative h-[370px] cursor-pointer" onClick={() => setLightboxIdx(0)}>
          <OptimizedImage src={display[0]} alt={alt} fill className="object-cover" priority />
        </div>
        <Lightbox images={images} idx={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      </div>
    );
  }

  // 2-5图：Trip.com 3列布局
  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-1 rounded-xl overflow-hidden h-[370px]">
        {/* 左列大图 */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer hover:brightness-95 transition"
          onClick={() => setLightboxIdx(0)}
        >
          <OptimizedImage src={display[0]} alt={alt} fill className="object-cover" priority />
        </div>
        {/* 中列 */}
        <div className="relative cursor-pointer hover:brightness-95 transition" onClick={() => setLightboxIdx(1)}>
          {display[1] && <OptimizedImage src={display[1]} alt={alt} fill className="object-cover" />}
        </div>
        <div className="relative cursor-pointer hover:brightness-95 transition" onClick={() => setLightboxIdx(display.length >= 4 ? 3 : 1)}>
          {(display[3] || display[1]) && <OptimizedImage src={display[3] || display[1]} alt={alt} fill className="object-cover" />}
        </div>
        {/* 右列 */}
        <div className="relative cursor-pointer hover:brightness-95 transition" onClick={() => setLightboxIdx(2)}>
          {display[2] && <OptimizedImage src={display[2]} alt={alt} fill className="object-cover" />}
        </div>
        <div
          className="relative cursor-pointer hover:brightness-95 transition"
          onClick={() => setLightboxIdx(display.length >= 5 ? 4 : display.length - 1)}
        >
          {(display[4] || display[display.length - 1]) && (
            <OptimizedImage src={display[4] || display[display.length - 1]} alt={alt} fill className="object-cover" />
          )}
          {remaining > 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">+{remaining} 张</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            查看更多 &gt;
          </div>
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
   S6. 评价预览 (内联快照)
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
        <div className="w-8 h-8 rounded-full bg-[#3264ff] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(review.user?.nickname || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{review.user?.nickname || "匿名用户"}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">{review.rating.toFixed(1)}/5</span>
            <span className="text-sm text-[#3264ff] font-medium">{ratingLabel}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   S7. 包含路线区 (Trip.com Tickets风格)
   ═══════════════════════════════════════════════════════════ */

function AvailableRoutes({ siteId }: { siteId: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutesBySite(siteId)
      .then((data) => setRoutes(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading || routes.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f294d]">包含此圣地的路线</h2>
        <Link href="/routes" className="text-sm text-[#3264ff] hover:underline">查看全部 →</Link>
      </div>
      <div className="space-y-3">
        {routes.map((r) => {
          const price = (r.priceFrom / 100).toLocaleString();
          return (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/routes/${r.slug}`} className="text-base font-bold text-[#0f294d] hover:text-[#3264ff] transition-colors">
                    {r.title}
                  </Link>
                  {r.bookCount > 0 && (
                    <span className="text-xs text-gray-400 ml-2">{r.bookCount}+ 人已预订</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{r.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {r.duration}天{r.nights}晚
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 border border-green-100">
                      即时确认
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-600 border border-gray-100">
                      14天免费取消
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">起价</p>
                  <p className="text-xl font-bold text-[#0f294d]">¥{price}</p>
                  <Link
                    href={`/routes/${r.slug}`}
                    className="mt-2 inline-block px-5 py-2 bg-[#3264ff] hover:bg-[#2854e0] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    预订
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
   S10. 周边推荐
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
    <div className="mt-8">
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
   S16. 更多推荐 (手风琴)
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
    <div className="mt-8">
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
   Sticky CTA卡片 (右侧sidebar)
   ═══════════════════════════════════════════════════════════ */

function StickyCTACard({ site }: { site: HolySite }) {
  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        <p className="text-center text-sm text-[#8592a6]">探访圣地</p>
        <p className="text-center text-lg font-bold text-[#0f294d] mt-1">{site.name}</p>

        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
          className="mt-4 block w-full py-3 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors text-base"
        >
          AI规划师咨询
        </Link>
        <Link
          href="/routes"
          className="mt-2 block w-full py-2.5 rounded-lg border border-[#3264ff] text-[#3264ff] hover:bg-blue-50 font-medium text-center text-sm transition-colors"
        >
          查看相关路线
        </Link>

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

  useEffect(() => {
    recordView("HOLY_SITE", site.id);
    fetchReviewStats("holy-site", site.id).then(setReviewStats).catch(() => {});
  }, [site.id]);

  const ratingLabel = reviewStats
    ? reviewStats.averageRating >= 4.5 ? "卓越" : reviewStats.averageRating >= 4 ? "优秀" : reviewStats.averageRating >= 3.5 ? "很好" : "不错"
    : "";

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ S1. 面包屑 (白色背景) ═══ */}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8592a6] mr-1">分享</span>
            <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
          </div>
        </div>
      </div>

      {/* ═══ S2. 图片画廊 (3列网格) ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 mb-4">
        <GalleryGrid images={galleryImages} alt={site.name} />
      </div>

      {/* ═══ S4-S16. 两栏布局 ═══ */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── 左侧主内容 ─── */}
          <div className="flex-1 min-w-0">

            {/* S4. 标题信息区 */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold text-[#0f294d] flex-1">{site.name}</h1>
                <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
              </div>
              {site.nameEn && <p className="text-sm text-[#8592a6] mt-1">{site.nameEn}</p>}

              {/* 评分行 */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {site.religion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${religionColor}15`, color: religionColor }}>
                    {site.religion.symbol} {site.religion.name}
                  </span>
                )}
                {reviewStats && reviewStats.totalCount > 0 && (
                  <>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">
                      {reviewStats.averageRating.toFixed(1)}/5
                    </span>
                    <span className="text-sm text-[#3264ff] font-medium">{ratingLabel}</span>
                    <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{reviewStats.totalCount} 条评价 ▶</a>
                  </>
                )}
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{site.country}</span>
                {site.religion && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{site.religion.name}圣地</span>
                )}
              </div>
            </div>

            {/* S5. 实用信息区 (紧凑列表) */}
            <div className="py-5 border-b border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">⏱</span>
                <div>
                  <span className="font-medium text-[#0f294d]">建议参访时长:</span>
                  <span className="text-[#0f294d] ml-1">2-3小时</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">📍</span>
                <div>
                  <span className="font-medium text-[#0f294d]">地址:</span>
                  <span className="text-[#0f294d] ml-1">{site.country}</span>
                  <span className="text-[#8592a6] ml-1">({site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E)</span>
                  <Link href={`/map?lat=${site.latitude}&lng=${site.longitude}`} className="text-[#3264ff] ml-2 hover:underline">地图</Link>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">🕐</span>
                <div>
                  <span className="font-medium text-[#0f294d]">时区:</span>
                  <span className="text-[#0f294d] ml-1">UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">👔</span>
                <div>
                  <span className="font-medium text-[#0f294d]">着装要求:</span>
                  <span className="text-[#0f294d] ml-1">得体着装，殿堂内禁止拍照</span>
                </div>
              </div>
            </div>

            {/* S6. 评价预览 */}
            <ReviewPreview targetType="holy-site" targetId={site.id} siteName={site.name} />

            {/* S7. 包含路线 (Tickets风格) */}
            <AvailableRoutes siteId={site.id} />

            {/* S9. 圣地介绍 */}
            <div className="mt-8">
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
            <div className="mt-8">
              <MediaTour entityType="HOLY_SITE" entityId={site.id} />
            </div>

            {/* S8. 评价完整区 */}
            <div id="reviews" className="mt-8">
              <ReviewSection targetType="holy-site" targetId={site.id} />
            </div>

            {/* S11. 设施与服务 */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#0f294d] mb-4">设施与服务</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: "🅿️", label: "停车场" }, { icon: "🚻", label: "洗手间" },
                  { icon: "♿", label: "无障碍通道" }, { icon: "🎒", label: "寄存处" },
                  { icon: "📖", label: "讲解服务" }, { icon: "📶", label: "WiFi" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm text-[#0f294d]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* S10. 周边推荐 */}
            <NearbySites currentSite={site} />

            {/* S12. UGC照片墙 */}
            <div className="mt-8">
              <UGCPhotoWall targetType="holy-site" targetId={site.id} />
            </div>

            {/* Q&A */}
            <div className="mt-8">
              <QASection entityType="HOLY_SITE" entityId={site.id} />
            </div>

            {/* S13. 你可能也喜欢 */}
            <div className="mt-8">
              <RelatedEntities entityType="HOLY_SITE" entityId={site.id} title="你可能也喜欢" />
            </div>

            {/* S16. 更多推荐手风琴 */}
            <MoreRecommendations religion={site.religion?.name} country={site.country} />
          </div>

          {/* ─── 右侧Sticky CTA (桌面端) ─── */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <StickyCTACard site={site} />
          </div>
        </div>
      </div>

      {/* 移动端粘性底栏 */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 min-w-0">
          {reviewStats && reviewStats.totalCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-[#3264ff] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">{ratingLabel}</span>
            </div>
          )}
          <p className="text-xs text-[#8592a6] line-clamp-1">{site.name}</p>
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
          className="px-5 py-2.5 bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold rounded-lg text-sm transition-colors"
        >
          AI规划咨询
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
