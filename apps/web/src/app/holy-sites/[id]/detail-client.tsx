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
import PhotoMosaic from "@/components/PhotoMosaic";
import SocialProof from "@/components/SocialProof";
import UGCPhotoWall from "@/components/UGCPhotoWall";
import QASection from "@/components/QASection";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import { recordView, fetchRoutesBySite, fetchHolySites, fetchReviewStats } from "@/lib/api";
import type { HolySite, Route, ReviewStats } from "@/lib/api";

const RELIGION_GRADIENT: Record<string, string> = {
  buddhism: "from-amber-800/30 to-amber-950/50",
  taoism: "from-emerald-800/30 to-emerald-950/50",
  christianity: "from-blue-800/30 to-blue-950/50",
  islam: "from-green-800/30 to-green-950/50",
  hinduism: "from-orange-800/30 to-orange-950/50",
  judaism: "from-indigo-800/30 to-indigo-950/50",
  confucianism: "from-red-800/30 to-red-950/50",
  sikhism: "from-orange-800/30 to-orange-950/50",
  shinto: "from-rose-800/30 to-rose-950/50",
  "tibetan-buddhism": "from-purple-800/30 to-purple-950/50",
  indigenous: "from-stone-800/30 to-stone-950/50",
  bahai: "from-cyan-800/30 to-cyan-950/50",
};

const FACILITIES = [
  { icon: "🅿️", label: "停车场" },
  { icon: "🚻", label: "洗手间" },
  { icon: "♿", label: "无障碍通道" },
  { icon: "🎒", label: "寄存处" },
  { icon: "🍵", label: "茶室/餐饮" },
  { icon: "🛍️", label: "纪念品店" },
  { icon: "📖", label: "讲解服务" },
  { icon: "📶", label: "WiFi覆盖" },
];

const VISITOR_TIPS = [
  { icon: "⏰", label: "建议时长", text: "2-3小时" },
  { icon: "👔", label: "着装要求", text: "得体着装，避免暴露" },
  { icon: "📷", label: "拍照须知", text: "殿堂内通常禁止拍照" },
  { icon: "🤫", label: "行为规范", text: "保持安静肃穆" },
];

/* ─── Rating Badge sub-component ─── */
function RatingBadge({ stats }: { stats: ReviewStats | null }) {
  if (!stats || stats.totalCount === 0) return null;
  const avg = stats.averageRating;
  const label = avg >= 4.5 ? "卓越" : avg >= 4.0 ? "优秀" : avg >= 3.5 ? "很好" : avg >= 3.0 ? "不错" : "一般";
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#0066FF] text-white font-bold text-sm">
        {avg.toFixed(1)}
      </span>
      <div>
        <span className="font-semibold text-gray-900">{label}</span>
        <span className="text-gray-400 text-sm ml-2">{stats.totalCount} 条评价</span>
      </div>
    </div>
  );
}

/* ─── Description with Show More ─── */
function ExpandableDescription({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;

  return (
    <div>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-[#0066FF] hover:text-[#0052CC] text-sm font-medium transition-colors"
        >
          {expanded ? "收起 ▲" : "展开全部 ▼"}
        </button>
      )}
    </div>
  );
}

/* ─── Available Routes Section (Trip.com Tickets equivalent) ─── */
function AvailableRoutes({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutesBySite(siteId)
      .then((data) => setRoutes(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading) return null;
  if (routes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">包含此圣地的路线</h2>
        <Link href="/routes" className="text-sm text-[#0066FF] hover:underline">查看全部 →</Link>
      </div>
      <div className="space-y-4">
        {routes.map((r) => {
          const price = (r.priceFrom / 100).toLocaleString();
          return (
            <Link
              key={r.id}
              href={`/routes/${r.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#0066FF]/30 hover:shadow-md transition-all group bg-gray-50/50"
            >
              {r.coverImage && (
                <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <OptimizedImage src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{r.subtitle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>📅 {r.duration}天{r.nights}晚</span>
                  <span>👥 {r.groupSize}</span>
                  {r.rating && (
                    <span className="flex items-center gap-0.5">
                      <span className="text-amber-400">★</span> {r.rating.toFixed(1)}
                    </span>
                  )}
                  {r.bookCount > 0 && (
                    <span className="text-orange-500">{r.bookCount}+ 人已预订</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-400">起价</p>
                <p className="text-xl font-bold text-[#0066FF]">¥{price}</p>
                <p className="text-xs text-gray-400">/人</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Nearby Sites Section ─── */
function NearbySites({ currentSite }: { currentSite: HolySite }) {
  const [sites, setSites] = useState<HolySite[]>([]);

  useEffect(() => {
    fetchHolySites(currentSite.religionId)
      .then((data) => setSites(data.filter((s) => s.id !== currentSite.id).slice(0, 4)))
      .catch(() => {});
  }, [currentSite.id, currentSite.religionId]);

  if (sites.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">同信仰圣地推荐</h2>
        <Link href="/holy-sites" className="text-sm text-[#0066FF] hover:underline">查看全部 →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sites.map((s) => (
          <Link key={s.id} href={`/holy-sites/${s.id}`} className="group block">
            <div className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
              <div className="relative h-32 overflow-hidden">
                {s.imageUrl ? (
                  <OptimizedImage src={s.imageUrl} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl opacity-30">{s.religion?.symbol || "🕌"}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{s.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">📍 {s.country}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Sticky Sidebar CTA ─── */
function SidebarCTA({ site }: { site: HolySite }) {
  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* AI Consult CTA */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-1">想去这里？</p>
          <p className="text-lg font-bold text-gray-900">{site.name}</p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
            className="block w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-center transition-colors shadow-lg shadow-blue-500/20"
          >
            AI规划师咨询
          </Link>
          <Link
            href="/routes"
            className="block w-full py-2.5 rounded-xl border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 font-medium text-center text-sm transition-colors"
          >
            查看相关路线
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
          <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
        </div>

        {/* Scarcity / Social Proof */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-orange-600">
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            本周热门 · 多人浏览中
          </span>
        </div>
      </div>

      {/* Quick Map Preview */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-40">
          <WorldMapDynamic
            holySites={[site]}
            height="160px"
            selectedSiteId={site.id}
            interactive={false}
          />
        </div>
        <Link
          href={`/map?lat=${site.latitude}&lng=${site.longitude}`}
          className="block text-center text-sm text-[#0066FF] hover:text-[#0052CC] py-2 border-t border-gray-100 transition-colors"
        >
          查看大地图 →
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HolySiteDetailClient({ site }: { site: HolySite }) {
  const { t } = useTranslation();
  const gradient = RELIGION_GRADIENT[site.religion?.slug || ""] || "from-gray-700 to-gray-800";
  const religionColor = site.religion?.color ?? '#0066FF';
  const galleryImages = [
    ...(site.imageUrl ? [site.imageUrl] : []),
    ...(site.galleryImages ?? []),
  ];

  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    recordView("HOLY_SITE", site.id);
    fetchReviewStats("holy-site", site.id)
      .then(setReviewStats)
      .catch(() => {});
  }, [site.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Hero Section ========== */}
      {galleryImages.length > 1 ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20 md:pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-700 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/holy-sites" className="hover:text-gray-700 transition-colors">{t("nav.holySites") || "圣地"}</Link>
            <span>/</span>
            <span className="text-gray-600">{site.name}</span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {site.religion && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border mb-3"
                  style={{ backgroundColor: `${religionColor}10`, color: religionColor, borderColor: `${religionColor}30` }}
                >
                  {site.religion.symbol} {site.religion.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{site.name}</h1>
              <p className="text-lg text-gray-500 mt-1">{site.nameEn}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                <span>📍 {site.country}</span>
                <span>🌐 {site.latitude.toFixed(2)}°N, {site.longitude.toFixed(2)}°E</span>
                <span>🕐 UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</span>
                {/* Rating Badge inline */}
                {reviewStats && reviewStats.totalCount > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span className="font-semibold text-gray-900">{reviewStats.averageRating.toFixed(1)}</span>
                      <span className="text-gray-400">({reviewStats.totalCount}条评价)</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
              <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
            </div>
          </div>

          <PhotoMosaic images={galleryImages} alt={site.name} />

          <div className="mt-4">
            <SocialProof entityType="HOLY_SITE" entityId={site.id} />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="h-[400px] md:h-[500px] relative overflow-hidden">
            {site.imageUrl ? (
              <>
                <OptimizedImage src={site.imageUrl} alt={site.name} fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
              </>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-[120px] opacity-20">{site.religion?.symbol || "🕌"}</span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                  <Link href="/" className="hover:text-white transition-colors">首页</Link>
                  <span>/</span>
                  <Link href="/holy-sites" className="hover:text-white transition-colors">{t("nav.holySites") || "圣地"}</Link>
                  <span>/</span>
                  <span className="text-white/80">{site.name}</span>
                </div>
                {site.religion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 mb-3" style={{ backgroundColor: `${religionColor}30`, color: religionColor }}>
                    {site.religion.symbol} {site.religion.name}
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg flex-1">{site.name}</h1>
                  <div className="mt-1">
                    <SaveButton entityType="HOLY_SITE" entityId={site.id} size="md" />
                    <ShareButton title={site.name} description={site.description} url={`/holy-sites/${site.id}`} entityType="HOLY_SITE" entityId={site.id} />
                  </div>
                </div>
                <p className="text-xl text-white/70 mt-2">{site.nameEn}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">📍 {site.country}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">🌐 {site.latitude.toFixed(2)}°N, {site.longitude.toFixed(2)}°E</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">🕐 UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</span>
                  {reviewStats && reviewStats.totalCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-white bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-amber-400">★</span> {reviewStats.averageRating.toFixed(1)} · {reviewStats.totalCount}条评价
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Two-Column Layout (Trip.com style) ========== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Main Content Column ─── */}
          <div className="flex-1 min-w-0">
            {/* Rating Summary Badge (Trip.com style) */}
            {reviewStats && reviewStats.totalCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center justify-between">
                <RatingBadge stats={reviewStats} />
                <a href="#reviews" className="text-sm text-[#0066FF] hover:underline">查看全部评价 →</a>
              </div>
            )}

            {/* Description Card with Show More */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.description") || "圣地介绍"}</h2>
              <ExpandableDescription text={site.description} maxLength={300} />
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">📍</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.country") || "国家"}</p>
                <p className="text-gray-900 font-medium">{site.country}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">🕐</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.timezone") || "时区"}</p>
                <p className="text-gray-900 font-medium">UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">{site.religion?.symbol || "🏛"}</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.religion") || "信仰"}</p>
                <p className="text-gray-900 font-medium">{site.religion?.name || "-"}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">🌐</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.coordinates") || "坐标"}</p>
                <p className="text-gray-900 font-medium text-sm">{site.latitude.toFixed(3)}, {site.longitude.toFixed(3)}</p>
              </div>
            </div>

            {/* Visitor Tips (Trip.com Additional Info style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">参访须知</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {VISITOR_TIPS.map((tip, i) => (
                  <div key={i} className="text-center">
                    <span className="text-2xl block mb-1">{tip.icon}</span>
                    <p className="text-xs text-gray-400 mb-0.5">{tip.label}</p>
                    <p className="text-sm font-medium text-gray-800">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Grid (Trip.com Additional Information style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">设施与服务</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FACILITIES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-sm text-gray-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Routes (Trip.com Tickets equivalent) */}
            <AvailableRoutes siteId={site.id} siteName={site.name} />

            {/* Map Section (desktop: full width in main column) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 lg:block hidden">
              <div className="p-6 pb-0">
                <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4">{t("detail.mapPlaceholder") || "地理位置"}</h2>
              </div>
              <div className="h-72">
                <WorldMapDynamic
                  holySites={[site]}
                  height="288px"
                  selectedSiteId={site.id}
                  interactive={false}
                />
              </div>
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <Link
                  href={`/map?lat=${site.latitude}&lng=${site.longitude}`}
                  className="text-sm text-[#0066FF] hover:text-[#3385FF] transition-colors"
                >
                  在全球地图中查看 →
                </Link>
              </div>
            </div>

            {/* Religion Context Card */}
            {site.religion && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" style={{ backgroundColor: `${religionColor}08`, borderColor: `${religionColor}20` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{site.religion.symbol}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{site.religion.name}</h3>
                    <p className="text-gray-500 text-sm">{site.religion.nameEn}</p>
                  </div>
                  <Link
                    href={`/religions/${site.religion.slug}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                    style={{ borderColor: `${religionColor}40`, color: religionColor }}
                  >
                    了解更多 →
                  </Link>
                </div>
              </div>
            )}

            {/* Social Proof (inline for single-image hero) */}
            {galleryImages.length <= 1 && (
              <div className="mb-6">
                <SocialProof entityType="HOLY_SITE" entityId={site.id} />
              </div>
            )}

            {/* Media Tour */}
            <MediaTour entityType="HOLY_SITE" entityId={site.id} />

            {/* UGC Photo Wall (Trip Moments equivalent) */}
            <UGCPhotoWall targetType="holy-site" targetId={site.id} />

            {/* Q&A Section */}
            <QASection entityType="HOLY_SITE" entityId={site.id} />

            {/* Reviews Section */}
            <div id="reviews">
              <ReviewSection targetType="holy-site" targetId={site.id} />
            </div>

            {/* Nearby Same-Religion Sites (Trip.com "You might also like") */}
            <NearbySites currentSite={site} />

            {/* Related Entities */}
            <div className="mt-6">
              <RelatedEntities entityType="HOLY_SITE" entityId={site.id} title="你可能还喜欢" />
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  ✨ AI规划包含此圣地的路线
                </Link>
                <Link
                  href="/holy-sites"
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
                >
                  ← {t("detail.backToList") || "返回圣地列表"}
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Sticky Sidebar (Desktop only, Trip.com booking card equivalent) ─── */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <SidebarCTA site={site} />
          </div>
        </div>

        {/* Mobile-only Map (shown below main content on mobile) */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4">{t("detail.mapPlaceholder") || "地理位置"}</h2>
            </div>
            <div className="h-56">
              <WorldMapDynamic
                holySites={[site]}
                height="224px"
                selectedSiteId={site.id}
                interactive={false}
              />
            </div>
            <div className="px-6 py-3 border-t border-gray-100 text-center">
              <Link
                href={`/map?lat=${site.latitude}&lng=${site.longitude}`}
                className="text-sm text-[#0066FF] hover:text-[#3385FF] transition-colors"
              >
                在全球地图中查看 →
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile-only Sticky Bottom CTA */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            {reviewStats && reviewStats.totalCount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-amber-400">★</span>
                <span className="font-bold">{reviewStats.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({reviewStats.totalCount}评)</span>
              </div>
            )}
            <p className="text-xs text-gray-500 line-clamp-1">{site.name}</p>
          </div>
          <Link
            href={`/chat?q=${encodeURIComponent(`帮我规划包含"${site.name}"的朝圣路线`)}`}
            className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
          >
            AI规划咨询
          </Link>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
