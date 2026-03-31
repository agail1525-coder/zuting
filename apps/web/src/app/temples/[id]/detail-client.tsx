"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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

/* ═══ Trip.com 画廊 — 左大图+右竖排 ═══ */

function GalleryGrid({ image, name, religion }: { image: string | null; name: string; religion?: { symbol?: string | null } }) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!image) {
    const symbol = religion?.symbol || "🏛";
    return (
      <div className="rounded-xl overflow-hidden h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-[100px] opacity-20">{symbol}</span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden h-[400px] relative cursor-pointer" onClick={() => setLightboxOpen(true)}>
        <OptimizedImage src={image} alt={name} fill className="object-cover" priority />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          {t("templeDetail.viewLargeImage")}
        </div>
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10" onClick={() => setLightboxOpen(false)}>×</button>
          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage src={image} alt={name} width={1200} height={800} className="object-contain max-h-[85vh] rounded" />
          </div>
        </div>
      )}
    </>
  );
}

/* ═══ JoinusBest 徽章 ═══ */

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

/* ═══ 绿色圆点评分 ═══ */

function GreenDotRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  const { t } = useTranslation();
  const label = rating >= 4.5 ? t("templeDetail.ratingExcellent") : rating >= 4 ? t("templeDetail.ratingGreat") : rating >= 3.5 ? t("templeDetail.ratingGood") : rating >= 3 ? t("templeDetail.ratingOk") : t("templeDetail.ratingAverage");
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? "bg-[#00b341]" : "bg-gray-200"}`} />
        ))}
      </div>
      <span className="text-sm font-bold text-[#0f294d]">{rating.toFixed(1)}/5</span>
      <span className="text-sm font-medium text-[#00b341]">{label}</span>
      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">({count}{t("templeDetail.reviewCount")})</a>
    </div>
  );
}

/* ═══ 公告横幅 ═══ */

function AnnouncementBanner() {
  const { t } = useTranslation();
  return (
    <div className="bg-[#fff8e6] border border-[#ffe4a0] rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4">
      <svg className="w-4 h-4 text-[#8b6914] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="text-sm text-[#8b6914] flex-1">{t("templeDetail.announcementText")}</span>
      <Link href="/promotions" className="text-sm text-[#3264ff] hover:underline font-medium whitespace-nowrap">{t("templeDetail.viewDetails")} →</Link>
    </div>
  );
}

/* ═══ 评分分布图 ═══ */

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const { t } = useTranslation();
  const dist = [
    { star: 5, pct: 68 }, { star: 4, pct: 22 }, { star: 3, pct: 6 }, { star: 2, pct: 3 }, { star: 1, pct: 1 },
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
        <p className="text-xs text-[#8592a6] mt-1">{stats.totalCount}{t("templeDetail.reviewCount")}</p>
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

/* ═══ 评价预览 ═══ */

function ReviewPreview({ targetType, targetId, name }: { targetType: string; targetId: string; name: string }) {
  const { t } = useTranslation();
  const [review, setReview] = useState<Review | null>(null);
  useEffect(() => {
    fetchReviews(targetType, targetId, 1)
      .then((res) => { if (res.data?.length) setReview(res.data[0]); })
      .catch(() => {});
  }, [targetType, targetId]);
  if (!review) return null;
  const label = review.rating >= 4.5 ? t("templeDetail.ratingExcellent") : review.rating >= 4 ? t("templeDetail.ratingGreat") : review.rating >= 3 ? t("templeDetail.ratingOk") : t("templeDetail.ratingAverage");
  return (
    <div className="border border-gray-200 rounded-xl p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#8592a6]">{t("templeDetail.pilgrimReviewOf", { name })}</p>
        <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{t("templeDetail.viewMoreReviews")}</a>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00b341] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {(review.user?.nickname || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#0f294d]">{review.user?.nickname || t("templeDetail.anonymousUser")}</span>
            <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#00b341] text-white">{review.rating.toFixed(1)}/5</span>
            <span className="text-sm text-[#00b341] font-medium">{label}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══ 推荐路线区 — Trip.com Tickets风格 ═══ */

function RelatedRoutes() {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);
  useEffect(() => {
    fetchRoutes({ pageSize: 4, sort: "rating" })
      .then((res) => setRoutes(res.items.slice(0, 4)))
      .catch(() => {});
  }, []);
  if (routes.length === 0) return null;

  const lowestPrice = Math.min(...routes.map((r) => r.priceFrom));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d]">{t("templeDetail.recommendedRoutes")}</h2>
          <p className="text-sm text-[#8592a6] mt-0.5">{t("templeDetail.fromPrice")} <span className="text-[#ff6600] font-bold">¥{(lowestPrice / 100).toLocaleString()}</span>{t("templeDetail.perPerson")}</p>
        </div>
        <Link href="/routes" className="text-sm text-[#3264ff] hover:underline">{t("templeDetail.viewAll")} →</Link>
      </div>
      <div className="space-y-3">
        {routes.map((r) => {
          const price = (r.priceFrom / 100).toLocaleString();
          return (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#3264ff]/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/routes/${r.slug}`} className="text-base font-bold text-[#0f294d] hover:text-[#3264ff] transition-colors">{r.title}</Link>
                  {r.bookCount > 0 && <span className="text-xs text-[#8592a6] ml-2">{r.bookCount}+ {t("templeDetail.booked")}</span>}
                  <p className="text-sm text-[#8592a6] mt-1">{r.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">{r.duration}天{r.nights}晚</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 border border-green-100 flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4" /></svg>
                      {t("templeDetail.instantConfirm")}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-600 border border-gray-100">{t("templeDetail.freeCancellation14")}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#8592a6]">{t("templeDetail.startingPrice")}</p>
                  <p className="text-2xl font-bold text-[#ff6600]">¥{price}</p>
                  <Link href={`/routes/${r.slug}`} className="mt-2 inline-block px-6 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white text-sm font-bold rounded-lg transition-colors">
                    {t("templeDetail.bookNow")}
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

/* ═══ FAQ手风琴 ═══ */

function FAQSection({ templeName, country }: { templeName: string; country: string }) {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: t("templeDetail.faqHowToReach", { name: templeName }), a: t("templeDetail.faqHowToReachAnswer", { name: templeName, country }) },
    { q: t("templeDetail.faqBestTime"), a: t("templeDetail.faqBestTimeAnswer") },
    { q: t("templeDetail.faqTickets"), a: t("templeDetail.faqTicketsAnswer") },
    { q: t("templeDetail.faqCeremonies"), a: t("templeDetail.faqCeremoniesAnswer") },
    { q: t("templeDetail.faqVegetarian"), a: t("templeDetail.faqVegetarianAnswer") },
  ];
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("templeDetail.faq")}</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors">
              <span className="font-medium text-[#0f294d] text-sm pr-4">{faq.q}</span>
              <svg className={`w-4 h-4 text-[#8592a6] shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4"><p className="text-sm text-[#455873] leading-relaxed">{faq.a}</p></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 同信仰祖庭推荐 ═══ */

function NearbyTemples({ current }: { current: Temple }) {
  const { t } = useTranslation();
  const [temples, setTemples] = useState<Temple[]>([]);
  useEffect(() => {
    fetchTemples(current.religionId)
      .then((data) => setTemples(data.filter((tpl) => tpl.id !== current.id).slice(0, 6)))
      .catch(() => {});
  }, [current.id, current.religionId]);
  if (temples.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("templeDetail.sameReligionTemples")}</h2>
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

/* ═══ Sticky CTA — Trip.com风格 ═══ */

function StickyCTACard({ temple, lowestPrice }: { temple: Temple; lowestPrice: number | null }) {
  const { t } = useTranslation();
  const mapSite: HolySite | null = temple.latitude && temple.longitude ? {
    id: temple.id, name: temple.name, nameEn: temple.nameEn || "",
    country: temple.country, latitude: temple.latitude, longitude: temple.longitude,
    utcOffset: 0, description: temple.description, imageUrl: temple.imageUrl,
    soundEffect: null, religionId: temple.religionId, religion: temple.religion,
  } : null;

  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: "0 4px 20px rgba(15,41,77,0.12)" }}>
        {lowestPrice !== null && lowestPrice > 0 ? (
          <>
            <p className="text-xs text-[#8592a6]">{t("templeDetail.routeStartingPrice")}</p>
            <p className="text-3xl font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</p>
            <p className="text-xs text-[#8592a6]">{t("templeDetail.perPersonFrom")}</p>
            <Link href="#routes" className="mt-4 block w-full py-3 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-center transition-colors text-base">
              {t("templeDetail.bookNow")}
            </Link>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-[#8592a6]">{t("templeDetail.visitTemple")}</p>
            <p className="text-center text-lg font-bold text-[#0f294d] mt-1">{temple.name}</p>
            {temple.foundingDate && <p className="text-center text-sm text-[#8592a6] mt-0.5">{t("templeDetail.foundedIn")} {temple.foundingDate}</p>}
          </>
        )}
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"祖庭的朝圣路线`)}`}
          className="mt-3 block w-full py-2.5 rounded-lg bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold text-center transition-colors text-sm"
        >
          {t("templeDetail.aiPlannerConsult")}
        </Link>
        <Link href="/routes" className="mt-2 block w-full py-2.5 rounded-lg border border-gray-200 text-[#0f294d] hover:bg-[#f5f7fa] font-medium text-center text-sm transition-colors">
          {t("templeDetail.viewPilgrimageRoutes")}
        </Link>

        {/* 保障标签 */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {[t("templeDetail.instantConfirm"), t("templeDetail.freeCancellation14"), t("templeDetail.securePayment")].map((label) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[#455873]">
              <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {label}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
          <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
        </div>

        {/* 支付方式 */}
        <PaymentMethodIcons />
      </div>

      {mapSite && (
        <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
          <div className="h-36">
            <WorldMapDynamic holySites={[mapSite]} height="144px" selectedSiteId={temple.id} interactive={false} />
          </div>
          <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="block text-center text-sm text-[#3264ff] hover:underline py-2 border-t border-gray-100">
            {t("templeDetail.viewFullMap")} →
          </Link>
        </div>
      )}

      {/* 朝圣日志入口 */}
      <div className="mt-3 bg-white rounded-lg border border-[#dadfe6] p-3" style={{ boxShadow: "0 2px 8px rgba(15,41,77,0.08)" }}>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#3264ff] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0f294d]">{t("templeDetail.pilgrimJournal")}</p>
            <p className="text-xs text-[#8592a6]">{t("templeDetail.recordVisitExperience")}</p>
          </div>
          <Link href="/journals" className="px-3 py-1.5 rounded-lg bg-[#3264ff] text-white text-xs font-medium hover:bg-[#2854e0] transition-colors">{t("templeDetail.writeJournal")}</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══ ExpandableText ═══ */

function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const need = text.length > maxLength;
  return (
    <div>
      <p className="text-sm text-[#0f294d] leading-relaxed whitespace-pre-line">
        {expanded || !need ? text : text.slice(0, maxLength) + "..."}
      </p>
      {need && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[#3264ff] hover:underline text-sm font-medium">
          {expanded ? t("templeDetail.collapse") : t("templeDetail.expandAll")}
        </button>
      )}
    </div>
  );
}

/* ═══ P1. Sticky跳转导航栏 ═══ */

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
            <a key={s.id} href={`#${s.id}`}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === s.id ? "border-[#3264ff] text-[#3264ff]" : "border-transparent text-[#8592a6] hover:text-[#0f294d]"
              }`}>{s.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ P2. 热门徽章 ═══ */

function PopularityBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff6600]/10 border border-[#ff6600]/20">
      <svg className="w-3 h-3 text-[#ff6600]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
      <span className="text-xs font-bold text-[#ff6600]">{t("templeDetail.weeklyViews", { count })}</span>
    </span>
  );
}

/* ═══ P3. 文化礼仪指南 ═══ */

function CulturalEtiquette() {
  const { t } = useTranslation();
  const rules = [
    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: t("templeDetail.dressCode"), desc: t("templeDetail.dressCodeDesc") },
    { icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z", title: t("templeDetail.photoRules"), desc: t("templeDetail.photoRulesDesc") },
    { icon: "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z", title: t("templeDetail.keepQuiet"), desc: t("templeDetail.keepQuietDesc") },
    { icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11", title: t("templeDetail.worshipEtiquette"), desc: t("templeDetail.worshipEtiquetteDesc") },
    { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: t("templeDetail.shoesOff"), desc: t("templeDetail.shoesOffDesc") },
    { icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", title: t("templeDetail.taboos"), desc: t("templeDetail.taboosDesc") },
  ];
  return (
    <div className="mt-6" id="sec-etiquette">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("templeDetail.visitEtiquetteGuide")}</h2>
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

/* ═══ P4. 最佳到访时间 ═══ */

function BestTimeToVisit() {
  const { t } = useTranslation();
  const months = [t("templeDetail.month1"),t("templeDetail.month2"),t("templeDetail.month3"),t("templeDetail.month4"),t("templeDetail.month5"),t("templeDetail.month6"),t("templeDetail.month7"),t("templeDetail.month8"),t("templeDetail.month9"),t("templeDetail.month10"),t("templeDetail.month11"),t("templeDetail.month12")];
  const heat = [3,3,4,5,5,3,2,2,4,5,5,3];
  const currentMonth = new Date().getMonth();
  const colors = ["bg-gray-200","bg-gray-200","bg-green-100","bg-green-200","bg-green-300","bg-green-400"];
  return (
    <div className="mt-4 p-4 bg-[#f5f7fa] rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-[#3264ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span className="text-sm font-medium text-[#0f294d]">{t("templeDetail.bestTimeToVisit")}</span>
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
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> {t("templeDetail.best")}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-200" /> {t("templeDetail.suitable")}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-200" /> {t("templeDetail.average")}</span>
      </div>
    </div>
  );
}

/* ═══ P5. 无障碍信息 ═══ */

function AccessibilityInfo() {
  const { t } = useTranslation();
  const items = [
    { available: true, label: t("templeDetail.wheelchairAccess") },
    { available: true, label: t("templeDetail.accessibleRestroom") },
    { available: false, label: t("templeDetail.brailleGuide") },
    { available: true, label: t("templeDetail.elderlyFriendly") },
    { available: true, label: t("templeDetail.strollerAccess") },
    { available: false, label: t("templeDetail.signLanguageTour") },
  ];
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-[#0f294d] mb-2">{t("templeDetail.accessibilityFacilities")}</h3>
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

/* ═══ P6. 支付方式图标 ═══ */

function PaymentMethodIcons() {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] text-[#8592a6] mb-2">{t("templeDetail.supportedPayments")}</p>
      <div className="flex items-center gap-2">
        {[t("templeDetail.wechatPay"), t("templeDetail.alipay"), "Visa", t("templeDetail.unionPay")].map((m) => (
          <span key={m} className="px-2 py-1 bg-[#f5f7fa] rounded text-[10px] text-[#455873] border border-gray-100">{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══ P7. 出行准备清单 ═══ */

function PackingChecklist() {
  const { t } = useTranslation();
  const items = [
    { checked: true, label: t("templeDetail.packingId") },
    { checked: true, label: t("templeDetail.packingShoes") },
    { checked: true, label: t("templeDetail.packingSunHat") },
    { checked: true, label: t("templeDetail.packingWater") },
    { checked: true, label: t("templeDetail.packingClothing") },
    { checked: false, label: t("templeDetail.packingCamera") },
    { checked: false, label: t("templeDetail.packingRainGear") },
    { checked: false, label: t("templeDetail.packingCash") },
  ];
  return (
    <div className="mt-6" id="sec-packing">
      <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("templeDetail.packingChecklist")}</h2>
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

/* ═══ P10. 旅行者类型标签 ═══ */

function TravelerTypeTags() {
  const { t } = useTranslation();
  const types = [
    { label: t("templeDetail.travelerSolo"), pct: 35 },
    { label: t("templeDetail.travelerFamily"), pct: 25 },
    { label: t("templeDetail.travelerCouple"), pct: 20 },
    { label: t("templeDetail.travelerFriends"), pct: 15 },
    { label: t("templeDetail.travelerGroup"), pct: 5 },
  ];
  return (
    <div className="mb-4 p-4 bg-[#f5f7fa] rounded-xl">
      <p className="text-sm font-medium text-[#0f294d] mb-3">{t("templeDetail.travelerDistribution")}</p>
      <div className="space-y-2">
        {types.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="text-xs text-[#455873] w-20">{t.label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#3264ff] rounded-full" style={{ width: `${t.pct}%` }} />
            </div>
            <span className="text-xs text-[#8592a6] w-8 text-right">{t.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 更多推荐手风琴 ═══ */

function MoreRecommendations({ religion, country }: { religion?: string; country: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);
  const items = [
    { key: "nearby", label: t("templeDetail.nearbyTemples", { country }) },
    { key: "routes", label: t("templeDetail.popularRoutes") },
    { key: "guides", label: t("templeDetail.recommendedGuides") },
    ...(religion ? [{ key: "religion", label: t("templeDetail.relatedTemples", { religion }) }] : []),
  ];
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">{t("templeDetail.moreRecommendations")}</h2>
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
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  useEffect(() => {
    recordView("TEMPLE", temple.id);
    fetchReviewStats("TEMPLE", temple.id).then(setReviewStats).catch(() => {});
    fetchRoutes({ pageSize: 4, sort: "rating" })
      .then((res) => {
        if (res.items.length > 0) {
          setLowestPrice(Math.min(...res.items.map((r) => r.priceFrom)));
        }
      })
      .catch(() => {});
  }, [temple.id]);

  // Founding year calculation
  const foundingAge = temple.foundingDate ? (() => {
    const match = temple.foundingDate!.match(/(\d+)/);
    if (match) {
      const year = parseInt(match[1]);
      return new Date().getFullYear() - year;
    }
    return null;
  })() : null;

  return (
    <div className="min-h-screen bg-white">
      {/* S1. 面包屑 */}
      <div className="max-w-[1120px] mx-auto px-4 pt-20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#8592a6]">
            <Link href="/" className="hover:text-[#3264ff]">{t("nav.home")}</Link><span>&gt;</span>
            <Link href="/temples" className="hover:text-[#3264ff]">{t("nav.temples")}</Link><span>&gt;</span>
            {temple.religion && (<><Link href={`/religions/${temple.religion.slug}`} className="hover:text-[#3264ff]">{temple.religion.name}</Link><span>&gt;</span></>)}
            <span className="text-[#0f294d]">{temple.name}</span>
          </div>
          <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
        </div>
      </div>

      {/* S2. 图片画廊 */}
      <div className="max-w-[1120px] mx-auto px-4 mb-4">
        <GalleryGrid image={temple.imageUrl} name={temple.name} religion={temple.religion} />
      </div>

      {/* S3. 公告横幅 */}
      <div className="max-w-[1120px] mx-auto px-4">
        <AnnouncementBanner />
      </div>

      {/* Sticky跳转导航栏 */}
      <SectionNav sections={[
        { id: "sec-info", label: t("templeDetail.navOverview") },
        { id: "routes", label: t("templeDetail.navRouteBooking") },
        { id: "sec-intro", label: t("templeDetail.navIntro") },
        { id: "reviews", label: t("templeDetail.navReviews") },
        { id: "sec-facilities", label: t("templeDetail.navFacilities") },
        { id: "sec-etiquette", label: t("templeDetail.navEtiquette") },
        { id: "sec-packing", label: t("templeDetail.navPacking") },
        { id: "sec-faq", label: t("templeDetail.navFaq") },
      ]} />

      {/* 两栏布局 */}
      <div className="max-w-[1120px] mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧主内容 */}
          <div className="flex-1 min-w-0">
            {/* S4. 标题 — Trip.com增强版 */}
            <div id="sec-info" className="pb-6 border-b border-[#dadfe6]">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <JoinusBestBadge />
                    <PopularityBadge count={Math.floor(Math.random() * 150) + 30} />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0f294d]">{temple.name}</h1>
                  {temple.nameEn && <p className="text-sm text-[#8592a6] mt-0.5">{temple.nameEn}</p>}
                </div>
                <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
              </div>

              {/* 绿色圆点评分 */}
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mt-3">
                  <GreenDotRating rating={reviewStats.averageRating} count={reviewStats.totalCount} />
                </div>
              )}

              {/* 分类标签 */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {temple.religion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${religionColor}15`, color: religionColor }}>
                    {temple.religion.symbol} {temple.religion.name}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {temple.country}
                </span>
                {temple.foundingDate && (
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    {t("templeDetail.foundedIn")} {temple.foundingDate}{foundingAge ? ` · ${t("templeDetail.yearsAgo", { years: foundingAge })}` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* S5. 实用信息 */}
            <div className="py-4 border-b border-[#dadfe6] space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00b341]" />
                  <span className="font-medium text-[#00b341]">{t("templeDetail.openForVisit")}</span>
                </span>
                <span className="text-[#8592a6]">·</span>
                <span className="text-[#455873]">{t("templeDetail.suggestedDuration")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="flex-1">{temple.country}
                  {temple.latitude && temple.longitude && (
                    <span className="text-[#8592a6]"> ({temple.latitude.toFixed(4)}°N, {temple.longitude.toFixed(4)}°E)</span>
                  )}
                </span>
                {temple.latitude && temple.longitude && (
                  <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="text-[#3264ff] hover:underline text-sm">{t("templeDetail.viewMap")}</Link>
                )}
              </div>
              {temple.foundingDate && (
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  <span>{t("templeDetail.foundedTime")}: {temple.foundingDate}{foundingAge ? ` (${t("templeDetail.approxYearsAgo", { years: foundingAge })})` : ""}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                <span>{t("templeDetail.dressRequirement")}</span>
              </div>

              {/* 最佳到访时间热力图 */}
              <BestTimeToVisit />
            </div>

            {/* 评价预览 */}
            <ReviewPreview targetType="TEMPLE" targetId={temple.id} name={temple.name} />

            {/* 推荐路线 */}
            <div id="routes">
              <RelatedRoutes />
            </div>

            {/* 介绍 */}
            <div id="sec-intro" className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("templeDetail.templeIntroduction")}</h2>
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
                <Link href={`/religions/${temple.religion.slug}`} className="text-sm text-[#3264ff] hover:underline">{t("templeDetail.learnMore")} →</Link>
              </div>
            )}

            <div className="mt-6"><MediaTour entityType="TEMPLE" entityId={temple.id} /></div>

            {/* 评分分布 + 评价 */}
            <div id="reviews" className="mt-6">
              <TravelerTypeTags />
              {reviewStats && reviewStats.totalCount > 0 && (
                <div className="mb-4"><RatingDistribution stats={reviewStats} /></div>
              )}
              <ReviewSection targetType="TEMPLE" targetId={temple.id} />
            </div>

            {/* 设施 */}
            <div id="sec-facilities" className="mt-6">
              <h2 className="text-base font-bold text-[#0f294d] mb-3">{t("templeDetail.facilitiesAndServices")}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("templeDetail.parking") }, { label: t("templeDetail.restroom") }, { label: t("templeDetail.accessiblePath") },
                  { label: t("templeDetail.teaRoom") }, { label: t("templeDetail.religiousGoods") }, { label: t("templeDetail.guidedTour") },
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
              <FAQSection templeName={temple.name} country={temple.country} />
            </div>

            <div className="mt-6"><UGCPhotoWall targetType="TEMPLE" targetId={temple.id} /></div>
            <div className="mt-6"><QASection entityType="TEMPLE" entityId={temple.id} /></div>
            <NearbyTemples current={temple} />
            <div className="mt-6"><RelatedEntities entityType="TEMPLE" entityId={temple.id} title={t("templeDetail.youMayAlsoLike")} /></div>
            <MoreRecommendations religion={temple.religion?.name} country={temple.country} />
          </div>

          {/* 右侧Sticky CTA */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <StickyCTACard temple={temple} lowestPrice={lowestPrice} />
          </div>
        </div>
      </div>

      {/* 移动端底栏 */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
        <div className="flex-1 min-w-0">
          {lowestPrice !== null && lowestPrice > 0 ? (
            <div>
              <span className="text-xs text-[#8592a6]">{t("templeDetail.startingPrice")} </span>
              <span className="text-lg font-bold text-[#ff6600]">¥{(lowestPrice / 100).toLocaleString()}</span>
            </div>
          ) : reviewStats && reviewStats.totalCount > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-[#00b341] text-white">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-[#0f294d] font-medium">
                {reviewStats.averageRating >= 4.5 ? t("templeDetail.ratingExcellent") : reviewStats.averageRating >= 4 ? t("templeDetail.ratingGreat") : t("templeDetail.ratingGood")}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8592a6] line-clamp-1">{temple.name}</p>
          )}
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"的朝圣路线`)}`}
          className="px-5 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold rounded-lg text-sm transition-colors"
        >
          {t("templeDetail.bookNow")}
        </Link>
      </div>
      <MobileNav />
    </div>
  );
}
