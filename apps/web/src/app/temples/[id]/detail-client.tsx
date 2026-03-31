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
import SocialProof from "@/components/SocialProof";
import UGCPhotoWall from "@/components/UGCPhotoWall";
import QASection from "@/components/QASection";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import { recordView, fetchTemples, fetchRoutes, fetchReviewStats } from "@/lib/api";
import type { Temple, Route, ReviewStats, HolySite } from "@/lib/api";

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
  { icon: "🍵", label: "茶室/斋堂" },
  { icon: "🛍️", label: "法物流通处" },
  { icon: "📖", label: "导览讲解" },
  { icon: "📶", label: "WiFi覆盖" },
];

const VISITOR_TIPS = [
  { icon: "⏰", label: "建议时长", text: "2-3小时" },
  { icon: "👔", label: "着装要求", text: "得体着装，避免暴露" },
  { icon: "📷", label: "拍照须知", text: "殿堂内通常禁止拍照" },
  { icon: "🤫", label: "行为规范", text: "保持安静肃穆" },
  { icon: "🩴", label: "脱鞋须知", text: "部分殿堂需脱鞋进入" },
  { icon: "🙏", label: "参拜礼仪", text: "请尊重宗教仪式" },
];

/* ─── Rating Badge ─── */
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

/* ─── Expandable Description ─── */
function ExpandableDescription({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  return (
    <div>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-[#0066FF] hover:text-[#0052CC] text-sm font-medium transition-colors">
          {expanded ? "收起 ▲" : "展开全部 ▼"}
        </button>
      )}
    </div>
  );
}

/* ─── Related Routes Section ─── */
function RelatedRoutes({ religionId }: { religionId: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes({ pageSize: 4, sort: "rating" })
      .then((res) => setRoutes(res.items.slice(0, 4)))
      .catch(() => {});
  }, [religionId]);

  if (routes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">推荐朝圣路线</h2>
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
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{r.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{r.subtitle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>📅 {r.duration}天{r.nights}晚</span>
                  <span>👥 {r.groupSize}</span>
                  {r.rating && (
                    <span className="flex items-center gap-0.5">
                      <span className="text-amber-400">★</span> {r.rating.toFixed(1)}
                    </span>
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

/* ─── Nearby Temples Section ─── */
function NearbyTemples({ currentTemple }: { currentTemple: Temple }) {
  const [temples, setTemples] = useState<Temple[]>([]);

  useEffect(() => {
    fetchTemples(currentTemple.religionId)
      .then((data) => setTemples(data.filter((t) => t.id !== currentTemple.id).slice(0, 4)))
      .catch(() => {});
  }, [currentTemple.id, currentTemple.religionId]);

  if (temples.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">同信仰祖庭推荐</h2>
        <Link href="/temples" className="text-sm text-[#0066FF] hover:underline">查看全部 →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {temples.map((t) => (
          <Link key={t.id} href={`/temples/${t.id}`} className="group block">
            <div className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
              <div className="relative h-32 overflow-hidden">
                {t.imageUrl ? (
                  <OptimizedImage src={t.imageUrl} alt={t.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl opacity-30">{t.religion?.symbol || "🏛"}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{t.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">📍 {t.country}</p>
                {t.foundingDate && <p className="text-xs text-gray-400 mt-0.5">📅 {t.foundingDate}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Sticky Sidebar CTA ─── */
function SidebarCTA({ temple }: { temple: Temple }) {
  const mapSite: HolySite | null = temple.latitude && temple.longitude
    ? {
        id: temple.id,
        name: temple.name,
        nameEn: temple.nameEn || "",
        country: temple.country,
        latitude: temple.latitude,
        longitude: temple.longitude,
        utcOffset: 0,
        description: temple.description,
        imageUrl: temple.imageUrl,
        soundEffect: null,
        religionId: temple.religionId,
        religion: temple.religion,
      }
    : null;

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-1">探访祖庭</p>
          <p className="text-lg font-bold text-gray-900">{temple.name}</p>
          {temple.foundingDate && (
            <p className="text-sm text-gray-400 mt-1">始建于 {temple.foundingDate}</p>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"祖庭的朝圣路线`)}`}
            className="block w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-center transition-colors shadow-lg shadow-blue-500/20"
          >
            AI规划师咨询
          </Link>
          <Link
            href="/routes"
            className="block w-full py-2.5 rounded-xl border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 font-medium text-center text-sm transition-colors"
          >
            查看朝圣路线
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
          <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-orange-600">
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            本周热门 · 多人浏览中
          </span>
        </div>
      </div>

      {/* Quick Map Preview */}
      {mapSite && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-40">
            <WorldMapDynamic
              holySites={[mapSite]}
              height="160px"
              selectedSiteId={temple.id}
              interactive={false}
            />
          </div>
          <Link
            href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`}
            className="block text-center text-sm text-[#0066FF] hover:text-[#0052CC] py-2 border-t border-gray-100 transition-colors"
          >
            查看大地图 →
          </Link>
        </div>
      )}

      {/* Pilgrim Journal Quick Entry */}
      <div className="mt-4 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-4 border border-[#0066FF]/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">朝圣日志</p>
            <p className="text-xs text-gray-500">记录参访体验</p>
          </div>
          <Link href="/journals" className="px-3 py-1.5 rounded-lg bg-[#0066FF] text-white text-xs font-medium hover:bg-[#0052CC] transition-colors">
            写日记
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const { t } = useTranslation();
  const gradient = RELIGION_GRADIENT[temple.religion?.slug || ""] || "from-gray-700 to-gray-800";
  const religionColor = temple.religion?.color ?? "#0066FF";

  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    recordView("TEMPLE", temple.id);
    fetchReviewStats("TEMPLE", temple.id)
      .then(setReviewStats)
      .catch(() => {});
  }, [temple.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Hero Section ========== */}
      <div className="relative">
        <div className="h-[400px] md:h-[500px] relative overflow-hidden">
          {temple.imageUrl ? (
            <>
              <OptimizedImage src={temple.imageUrl} alt={temple.name} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-[120px] opacity-20">{temple.religion?.symbol || "🏛"}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Link href="/" className="hover:text-white transition-colors">首页</Link>
                <span>/</span>
                <Link href="/temples" className="hover:text-white transition-colors">{t("nav.temples") || "祖庭"}</Link>
                <span>/</span>
                <span className="text-white/80">{temple.name}</span>
              </div>

              {temple.religion && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 mb-3"
                  style={{ backgroundColor: `${religionColor}30`, color: religionColor }}
                >
                  {temple.religion.symbol} {temple.religion.name}
                </span>
              )}

              <div className="flex items-start gap-3">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg flex-1">{temple.name}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <SaveButton entityType="TEMPLE" entityId={temple.id} size="md" />
                  <ShareButton title={temple.name} description={temple.description} url={`/temples/${temple.id}`} entityType="TEMPLE" entityId={temple.id} />
                </div>
              </div>
              {temple.nameEn && <p className="text-xl text-white/70 mt-2">{temple.nameEn}</p>}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">📍 {temple.country}</span>
                {temple.foundingDate && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">📅 {temple.foundingDate}</span>
                )}
                {temple.latitude && temple.longitude && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">🌐 {temple.latitude.toFixed(2)}°N, {temple.longitude.toFixed(2)}°E</span>
                )}
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

      {/* ========== Two-Column Layout ========== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Main Content Column ─── */}
          <div className="flex-1 min-w-0">
            {/* Rating Summary Badge */}
            {reviewStats && reviewStats.totalCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center justify-between">
                <RatingBadge stats={reviewStats} />
                <a href="#reviews" className="text-sm text-[#0066FF] hover:underline">查看全部评价 →</a>
              </div>
            )}

            {/* Social Proof */}
            <div className="mb-6">
              <SocialProof entityType="TEMPLE" entityId={temple.id} variant="banner" />
            </div>

            {/* Description Card with Show More */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
              <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.description") || "祖庭介绍"}</h2>
              <ExpandableDescription text={temple.description} maxLength={300} />
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">📍</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.country") || "国家"}</p>
                <p className="text-gray-900 font-medium">{temple.country}</p>
              </div>
              {temple.foundingDate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <span className="text-2xl mb-2 block">📅</span>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.foundingDate") || "建立时间"}</p>
                  <p className="text-gray-900 font-medium">{temple.foundingDate}</p>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <span className="text-2xl mb-2 block">{temple.religion?.symbol || "🏛"}</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.religion") || "信仰"}</p>
                <p className="text-gray-900 font-medium">{temple.religion?.name || "-"}</p>
              </div>
              {temple.latitude && temple.longitude && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <span className="text-2xl mb-2 block">🌐</span>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.coordinates") || "坐标"}</p>
                  <p className="text-gray-900 font-medium text-sm">{temple.latitude.toFixed(3)}, {temple.longitude.toFixed(3)}</p>
                </div>
              )}
            </div>

            {/* Visitor Tips (Trip.com style) */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-6">
              <h2 className="text-lg font-bold text-amber-600 mb-4">参访须知</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {VISITOR_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-xl mt-0.5">{tip.icon}</span>
                    <div>
                      <p className="text-xs text-amber-500">{tip.label}</p>
                      <p className="text-sm font-medium text-amber-800">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Grid (Trip.com Additional Information) */}
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

            {/* Related Routes (Trip.com Tickets equivalent) */}
            <RelatedRoutes religionId={temple.religionId} />

            {/* Map Section (desktop full width) */}
            {temple.latitude && temple.longitude && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 lg:block hidden">
                <div className="p-6 pb-0">
                  <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4">{t("detail.mapPlaceholder") || "地理位置"}</h2>
                </div>
                <div className="h-72">
                  <WorldMapDynamic
                    holySites={[{
                      id: temple.id,
                      name: temple.name,
                      nameEn: temple.nameEn || "",
                      country: temple.country,
                      latitude: temple.latitude,
                      longitude: temple.longitude,
                      utcOffset: 0,
                      description: temple.description,
                      imageUrl: temple.imageUrl,
                      soundEffect: null,
                      religionId: temple.religionId,
                      religion: temple.religion,
                    }]}
                    height="288px"
                    selectedSiteId={temple.id}
                    interactive={false}
                  />
                </div>
                <div className="px-6 py-3 border-t border-gray-100 text-center">
                  <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="text-sm text-[#0066FF] hover:text-[#3385FF] transition-colors">
                    在全球地图中查看 →
                  </Link>
                </div>
              </div>
            )}

            {/* Religion Context Card */}
            {temple.religion && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" style={{ backgroundColor: `${religionColor}08`, borderColor: `${religionColor}20` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{temple.religion.symbol}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{temple.religion.name}</h3>
                    <p className="text-gray-500 text-sm">{temple.religion.nameEn}</p>
                  </div>
                  <Link
                    href={`/religions/${temple.religion.slug}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                    style={{ borderColor: `${religionColor}40`, color: religionColor }}
                  >
                    {t("detail.learnMore") || "了解更多"} →
                  </Link>
                </div>
              </div>
            )}

            {/* Multimedia Tour */}
            <MediaTour entityType="TEMPLE" entityId={temple.id} />

            {/* UGC Photo Wall (Trip Moments equivalent - new!) */}
            <UGCPhotoWall targetType="TEMPLE" targetId={temple.id} />

            {/* Reviews Section */}
            <div id="reviews" className="mt-6">
              <ReviewSection targetType="TEMPLE" targetId={temple.id} />
            </div>

            {/* Q&A Section */}
            <div className="mt-8">
              <QASection entityType="TEMPLE" entityId={temple.id} />
            </div>

            {/* Nearby Temples */}
            <div className="mt-8">
              <NearbyTemples currentTemple={temple} />
            </div>

            {/* Related Entities */}
            <div className="mt-8">
              <RelatedEntities entityType="TEMPLE" entityId={temple.id} title="你可能还喜欢" />
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  ✨ {t("detail.aiPlanRoute") || "AI规划包含此祖庭的路线"}
                </Link>
                <Link
                  href="/temples"
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
                >
                  ← {t("detail.backToList") || "返回祖庭列表"}
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Sticky Sidebar ─── */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <SidebarCTA temple={temple} />
          </div>
        </div>

        {/* Mobile Map */}
        {temple.latitude && temple.longitude && (
          <div className="lg:hidden mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 pb-0">
                <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4">{t("detail.mapPlaceholder") || "地理位置"}</h2>
              </div>
              <div className="h-56">
                <WorldMapDynamic
                  holySites={[{
                    id: temple.id, name: temple.name, nameEn: temple.nameEn || "",
                    country: temple.country, latitude: temple.latitude!, longitude: temple.longitude!,
                    utcOffset: 0, description: temple.description, imageUrl: temple.imageUrl,
                    soundEffect: null, religionId: temple.religionId, religion: temple.religion,
                  }]}
                  height="224px"
                  selectedSiteId={temple.id}
                  interactive={false}
                />
              </div>
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <Link href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`} className="text-sm text-[#0066FF] hover:text-[#3385FF] transition-colors">
                  在全球地图中查看 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom CTA */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            {reviewStats && reviewStats.totalCount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-amber-400">★</span>
                <span className="font-bold">{reviewStats.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({reviewStats.totalCount}评)</span>
              </div>
            )}
            <p className="text-xs text-gray-500 line-clamp-1">{temple.name}</p>
          </div>
          <Link
            href={`/chat?q=${encodeURIComponent(`帮我规划包含"${temple.name}"的朝圣路线`)}`}
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
