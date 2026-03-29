"use client";

import Link from "next/link";
import { useEffect } from "react";
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
import { recordView } from "@/lib/api";
import type { HolySite } from "@/lib/api";

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

export default function HolySiteDetailClient({ site }: { site: HolySite }) {
  const { t } = useTranslation();
  const gradient = RELIGION_GRADIENT[site.religion?.slug || ""] || "from-gray-700 to-gray-800";
  const religionColor = site.religion?.color ?? '#0066FF';
  const galleryImages = [
    ...(site.imageUrl ? [site.imageUrl] : []),
    ...(site.galleryImages ?? []),
  ];

  useEffect(() => {
    recordView("HOLY_SITE", site.id);
  }, [site.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {galleryImages.length > 1 ? (
        /* Airbnb-style Photo Mosaic Hero */
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-20 md:pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
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
        /* Fallback: original single-image hero */
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
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-24">
        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.description") || "圣地介绍"}</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">{site.description}</p>
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

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
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

        {/* UGC Photo Wall */}
        <UGCPhotoWall targetType="holy-site" targetId={site.id} />

        {/* Q&A Section */}
        <QASection entityType="HOLY_SITE" entityId={site.id} />

        {/* Reviews Section */}
        <ReviewSection targetType="holy-site" targetId={site.id} />

        {/* Related Entities */}
        <div className="mt-6">
          <RelatedEntities entityType="HOLY_SITE" entityId={site.id} title="你可能还喜欢" />
        </div>

        {/* CTA */}
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

      <MobileNav />
    </div>
  );
}
