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
import { recordView, fetchTemples, fetchRoutes, fetchReviewStats, fetchReviews } from "@/lib/api";
import type { Temple, Route, ReviewStats, Review, HolySite } from "@/lib/api";

/* ═══ 图片画廊 ═══ */
function GallerySection({ image, name, religion }: { image: string | null; name: string; religion?: { symbol?: string | null; slug?: string } }) {
  if (!image) {
    const symbol = religion?.symbol || "🏛";
    return (
      <div className="rounded-xl overflow-hidden h-[370px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-[100px] opacity-20">{symbol}</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden h-[370px] relative">
      <OptimizedImage src={image} alt={name} fill className="object-cover" priority />
    </div>
  );
}

/* ═══ 评价预览 ═══ */
function ReviewPreview({ targetType, targetId, name }: { targetType: string; targetId: string; name: string }) {
  const [review, setReview] = useState<Review | null>(null);
  useEffect(() => {
    fetchReviews(targetType, targetId, 1)
      .then((res) => { if (res.data?.length) setReview(res.data[0]); })
      .catch(() => {});
  }, [targetType, targetId]);
  if (!review) return null;
  const label = review.rating >= 4.5 ? "卓越" : review.rating >= 4 ? "优秀" : review.rating >= 3 ? "不错" : "一般";
  return (
    <div className="border border-gray-200 rounded-xl p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#8592a6]">朝圣者对{name}的评价</p>
        <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">查看更多评价</a>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3264ff] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(review.user?.nickname || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#0f294d]">{review.user?.nickname || "匿名用户"}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">{review.rating.toFixed(1)}/5</span>
            <span className="text-sm text-[#3264ff] font-medium">{label}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══ 推荐路线区 ═══ */
function RelatedRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  useEffect(() => {
    fetchRoutes({ pageSize: 4, sort: "rating" })
      .then((res) => setRoutes(res.items.slice(0, 4)))
      .catch(() => {});
  }, []);
  if (routes.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f294d]">推荐朝圣路线</h2>
        <Link href="/routes" className="text-sm text-[#3264ff] hover:underline">查看全部 →</Link>
      </div>
      <div className="space-y-3">
        {routes.map((r) => {
          const price = (r.priceFrom / 100).toLocaleString();
          return (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/routes/${r.slug}`} className="text-base font-bold text-[#0f294d] hover:text-[#3264ff] transition-colors">{r.title}</Link>
                  <p className="text-sm text-[#8592a6] mt-1">{r.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">{r.duration}天{r.nights}晚</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 border border-green-100">即时确认</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#8592a6]">起价</p>
                  <p className="text-xl font-bold text-[#0f294d]">¥{price}</p>
                  <Link href={`/routes/${r.slug}`} className="mt-2 inline-block px-5 py-2 bg-[#3264ff] hover:bg-[#2854e0] text-white text-sm font-semibold rounded-lg transition-colors">
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

/* ═══ 同信仰祖庭推荐 ═══ */
function NearbyTemples({ current }: { current: Temple }) {
  const [temples, setTemples] = useState<Temple[]>([]);
  useEffect(() => {
    fetchTemples(current.religionId)
      .then((data) => setTemples(data.filter((t) => t.id !== current.id).slice(0, 6)))
      .catch(() => {});
  }, [current.id, current.religionId]);
  if (temples.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">同信仰祖庭</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {temples.map((t) => (
          <Link key={t.id} href={`/temples/${t.id}`} className="group block">
            <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="relative h-32 overflow-hidden">
                {t.imageUrl ? (
                  <OptimizedImage src={t.imageUrl} alt={t.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-[#f5f7fa] flex items-center justify-center">
                    <span className="text-4xl opacity-30">{t.religion?.symbol || "🏛"}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-[#0f294d] group-hover:text-[#3264ff] transition-colors line-clamp-1">{t.name}</h3>
                <p className="text-xs text-[#8592a6] mt-0.5">{t.country}{t.foundingDate ? ` · ${t.foundingDate}` : ""}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══ Sticky CTA ═══ */
function StickyCTACard({ temple }: { temple: Temple }) {
  const mapSite: HolySite | null = temple.latitude && temple.longitude ? {
    id: temple.id, name: temple.name, nameEn: temple.nameEn || "",
    country: temple.country, latitude: temple.latitude, longitude: temple.longitude,
    utcOffset: 0, description: temple.description, imageUrl: temple.imageUrl,
    soundEffect: null, religionId: temple.religionId, religion: temple.religion,
  } : null;

  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        <p className="text-center text-sm text-[#8592a6]">探访祖庭</p>
        <p className="text-center text-lg font-bold text-[#0f294d] mt-1">{temple.name}</p>
        {temple.foundingDate && <p className="text-center text-sm text-[#8592a6] mt-0.5">始建于 {temple.foundingDate}</p>}
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"祖庭的朝圣路线`)}`}
          className="mt-4 block w-full py-3 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors"
        >
          AI规划师咨询
        </Link>
        <Link href="/routes" className="mt-2 block w-full py-2.5 rounded-lg border border-[#3264ff] text-[#3264ff] hover:bg-blue-50 font-medium text-center text-sm transition-colors">
          查看朝圣路线
        </Link>
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
          <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
        </div>
      </div>
      {mapSite && (
        <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
          <div className="h-36">
            <WorldMapDynamic holySites={[mapSite]} height="144px" selectedSiteId={temple.id} interactive={false} />
          </div>
          <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="block text-center text-sm text-[#3264ff] hover:underline py-2 border-t border-gray-100">
            查看大地图 →
          </Link>
        </div>
      )}
      <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0f294d]">朝圣日志</p>
            <p className="text-xs text-[#8592a6]">记录参访体验</p>
          </div>
          <Link href="/journals" className="px-3 py-1.5 rounded-lg bg-[#3264ff] text-white text-xs font-medium hover:bg-[#2854e0] transition-colors">写日记</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══ ExpandableText ═══ */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const need = text.length > maxLength;
  return (
    <div>
      <p className="text-sm text-[#0f294d] leading-relaxed whitespace-pre-line">
        {expanded || !need ? text : text.slice(0, maxLength) + "..."}
      </p>
      {need && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[#3264ff] hover:underline text-sm font-medium">
          {expanded ? "收起 △" : "展开全部 ▽"}
        </button>
      )}
    </div>
  );
}

/* ═══ 更多推荐手风琴 ═══ */
function MoreRecommendations({ religion, country }: { religion?: string; country: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const items = [
    { key: "nearby", label: `${country}附近祖庭` },
    { key: "routes", label: "热门朝圣路线" },
    { key: "guides", label: "推荐朝圣攻略" },
    ...(religion ? [{ key: "religion", label: `${religion}相关祖庭` }] : []),
  ];
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">更多推荐</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {items.map((item) => (
          <button key={item.key} onClick={() => setOpen(open === item.key ? null : item.key)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors">
            <span className="font-medium text-[#0f294d] text-sm">{item.label}</span>
            <span className={`text-[#8592a6] transition-transform ${open === item.key ? "rotate-180" : ""}`}>▾</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   主页面
   ═══════════════════════════════════════════════════════════ */
export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const { t } = useTranslation();
  const religionColor = temple.religion?.color ?? "#3264ff";
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    recordView("TEMPLE", temple.id);
    fetchReviewStats("TEMPLE", temple.id).then(setReviewStats).catch(() => {});
  }, [temple.id]);

  const ratingLabel = reviewStats
    ? reviewStats.averageRating >= 4.5 ? "卓越" : reviewStats.averageRating >= 4 ? "优秀" : reviewStats.averageRating >= 3.5 ? "很好" : "不错"
    : "";

  return (
    <div className="min-h-screen bg-white">
      {/* S1. 面包屑 */}
      <div className="max-w-[1120px] mx-auto px-4 pt-20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#8592a6]">
            <Link href="/" className="hover:text-[#3264ff]">首页</Link><span>&gt;</span>
            <Link href="/temples" className="hover:text-[#3264ff]">{t("nav.temples") || "祖庭"}</Link><span>&gt;</span>
            {temple.religion && (<><Link href={`/religions/${temple.religion.slug}`} className="hover:text-[#3264ff]">{temple.religion.name}</Link><span>&gt;</span></>)}
            <span className="text-[#0f294d]">{temple.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8592a6] mr-1">分享</span>
            <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
          </div>
        </div>
      </div>

      {/* S2. 图片 */}
      <div className="max-w-[1120px] mx-auto px-4 mb-4">
        <GallerySection image={temple.imageUrl} name={temple.name} religion={temple.religion} />
      </div>

      {/* 两栏布局 */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧主内容 */}
          <div className="flex-1 min-w-0">
            {/* S4. 标题 */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold text-[#0f294d] flex-1">{temple.name}</h1>
                <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
              </div>
              {temple.nameEn && <p className="text-sm text-[#8592a6] mt-1">{temple.nameEn}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {temple.religion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${religionColor}15`, color: religionColor }}>
                    {temple.religion.symbol} {temple.religion.name}
                  </span>
                )}
                {reviewStats && reviewStats.totalCount > 0 && (
                  <>
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">{reviewStats.averageRating.toFixed(1)}/5</span>
                    <span className="text-sm text-[#3264ff] font-medium">{ratingLabel}</span>
                    <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{reviewStats.totalCount} 条评价 ▶</a>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{temple.country}</span>
                {temple.foundingDate && <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">始建于 {temple.foundingDate}</span>}
              </div>
            </div>

            {/* S5. 实用信息 */}
            <div className="py-5 border-b border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">⏱</span>
                <span className="font-medium text-[#0f294d]">建议参访时长:</span>
                <span className="text-[#0f294d]">2-3小时</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">📍</span>
                <span className="font-medium text-[#0f294d]">地址:</span>
                <span className="text-[#0f294d]">{temple.country}</span>
                {temple.latitude && temple.longitude && (
                  <>
                    <span className="text-[#8592a6]">({temple.latitude.toFixed(4)}°N, {temple.longitude.toFixed(4)}°E)</span>
                    <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="text-[#3264ff] hover:underline">地图</Link>
                  </>
                )}
              </div>
              {temple.foundingDate && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-base">📅</span>
                  <span className="font-medium text-[#0f294d]">建立时间:</span>
                  <span className="text-[#0f294d]">{temple.foundingDate}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-base">👔</span>
                <span className="font-medium text-[#0f294d]">着装要求:</span>
                <span className="text-[#0f294d]">得体着装，部分殿堂需脱鞋</span>
              </div>
            </div>

            {/* 评价预览 */}
            <ReviewPreview targetType="TEMPLE" targetId={temple.id} name={temple.name} />

            {/* 推荐路线 */}
            <RelatedRoutes />

            {/* 介绍 */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">祖庭介绍</h2>
              <ExpandableText text={temple.description} maxLength={300} />
            </div>

            {/* 信仰卡 */}
            {temple.religion && (
              <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-gray-200" style={{ backgroundColor: `${religionColor}08` }}>
                <span className="text-3xl">{temple.religion.symbol}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#0f294d]">{temple.religion.name}</p>
                  <p className="text-sm text-[#8592a6]">{temple.religion.nameEn}</p>
                </div>
                <Link href={`/religions/${temple.religion.slug}`} className="text-sm text-[#3264ff] hover:underline">了解更多 →</Link>
              </div>
            )}

            <div className="mt-8"><MediaTour entityType="TEMPLE" entityId={temple.id} /></div>

            {/* 评价 */}
            <div id="reviews" className="mt-8"><ReviewSection targetType="TEMPLE" targetId={temple.id} /></div>

            {/* 设施 */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#0f294d] mb-4">设施与服务</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: "🅿️", label: "停车场" }, { icon: "🚻", label: "洗手间" }, { icon: "♿", label: "无障碍通道" },
                  { icon: "🍵", label: "茶室/斋堂" }, { icon: "🛍️", label: "法物流通处" }, { icon: "📖", label: "导览讲解" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm text-[#0f294d]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8"><UGCPhotoWall targetType="TEMPLE" targetId={temple.id} /></div>
            <div className="mt-8"><QASection entityType="TEMPLE" entityId={temple.id} /></div>
            <NearbyTemples current={temple} />
            <div className="mt-8"><RelatedEntities entityType="TEMPLE" entityId={temple.id} title="你可能也喜欢" /></div>
            <MoreRecommendations religion={temple.religion?.name} country={temple.country} />
          </div>

          {/* 右侧Sticky CTA */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <StickyCTACard temple={temple} />
          </div>
        </div>
      </div>

      {/* 移动端底栏 */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 min-w-0">
          {reviewStats && reviewStats.totalCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-[#3264ff] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">{ratingLabel}</span>
            </div>
          )}
          <p className="text-xs text-[#8592a6] line-clamp-1">{temple.name}</p>
        </div>
        <Link href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"的朝圣路线`)}`}
          className="px-5 py-2.5 bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold rounded-lg text-sm transition-colors">
          AI规划咨询
        </Link>
      </div>
      <MobileNav />
    </div>
  );
}
