"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import ReviewSection from "@/components/ReviewSection";
import type { Temple } from "@/lib/api";

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

export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const { t } = useTranslation();
  const gradient = RELIGION_GRADIENT[temple.religion?.slug || ""] || "from-temple-700 to-temple-800";
  const religionColor = temple.religion?.color ?? "#D4A855";

  return (
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-[400px] md:h-[500px] relative overflow-hidden">
          {temple.imageUrl ? (
            <>
              <OptimizedImage src={temple.imageUrl} alt={temple.name} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-temple-900/40 via-temple-900/20 to-temple-900" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-[120px] opacity-20">{temple.religion?.symbol || "🏛"}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-temple-900" />
            </div>
          )}

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Link href="/temples" className="hover:text-gold transition-colors">{t("nav.temples") || "祖庭"}</Link>
                <span>/</span>
                <span className="text-white/80">{temple.name}</span>
              </div>

              {/* Religion badge */}
              {temple.religion && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 mb-3"
                  style={{ backgroundColor: `${religionColor}30`, color: religionColor }}
                >
                  {temple.religion.symbol} {temple.religion.name}
                </span>
              )}

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg">
                {temple.name}
              </h1>
              {temple.nameEn && (
                <p className="text-xl text-white/70 mt-2">{temple.nameEn}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  📍 {temple.country}
                </span>
                {temple.foundingDate && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    📅 {temple.foundingDate}
                  </span>
                )}
                {temple.latitude && temple.longitude && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    🌐 {temple.latitude.toFixed(2)}°N, {temple.longitude.toFixed(2)}°E
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-24">
        {/* Description Card */}
        <div className="card-glow rounded-2xl p-6 md:p-8 bg-temple-800/60 backdrop-blur-sm mb-6">
          <h2 className="text-gold font-serif font-bold text-xl mb-4">{t("detail.description") || "祖庭介绍"}</h2>
          <p className="text-temple-200 leading-relaxed whitespace-pre-line text-lg">{temple.description}</p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-glow rounded-xl p-4 bg-temple-800/50 text-center">
            <span className="text-2xl mb-2 block">📍</span>
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.country") || "国家"}</p>
            <p className="text-white font-medium">{temple.country}</p>
          </div>
          {temple.foundingDate && (
            <div className="card-glow rounded-xl p-4 bg-temple-800/50 text-center">
              <span className="text-2xl mb-2 block">📅</span>
              <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.foundingDate") || "建立时间"}</p>
              <p className="text-white font-medium">{temple.foundingDate}</p>
            </div>
          )}
          <div className="card-glow rounded-xl p-4 bg-temple-800/50 text-center">
            <span className="text-2xl mb-2 block">{temple.religion?.symbol || "🏛"}</span>
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.religion") || "信仰"}</p>
            <p className="text-white font-medium">{temple.religion?.name || "-"}</p>
          </div>
          {temple.latitude && temple.longitude && (
            <div className="card-glow rounded-xl p-4 bg-temple-800/50 text-center">
              <span className="text-2xl mb-2 block">🌐</span>
              <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.coordinates") || "坐标"}</p>
              <p className="text-white font-medium text-sm">{temple.latitude.toFixed(3)}, {temple.longitude.toFixed(3)}</p>
            </div>
          )}
        </div>

        {/* Map Section */}
        {temple.latitude && temple.longitude && (
          <div className="card-glow rounded-2xl overflow-hidden bg-temple-800/50 mb-6">
            <div className="p-6">
              <h2 className="text-gold font-serif font-bold text-lg mb-4">{t("detail.mapPlaceholder") || "地理位置"}</h2>
            </div>
            <div className="h-64 bg-temple-700/30 flex items-center justify-center border-t border-temple-600/30">
              <div className="text-center">
                <span className="text-4xl block mb-3">🗺</span>
                <p className="text-temple-300">
                  {temple.latitude.toFixed(4)}°N, {temple.longitude.toFixed(4)}°E
                </p>
                <Link
                  href={`/map?lat=${temple.latitude}&lng=${temple.longitude}`}
                  className="inline-block mt-3 text-sm text-gold hover:text-gold-light transition-colors"
                >
                  {t("detail.viewOnMap") || "在全球地图中查看"} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Religion Context Card */}
        {temple.religion && (
          <div className="card-glow rounded-2xl p-6 mb-6" style={{ backgroundColor: `${religionColor}08`, borderColor: `${religionColor}20` }}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{temple.religion.symbol}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{temple.religion.name}</h3>
                <p className="text-temple-400 text-sm">{temple.religion.nameEn}</p>
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

        {/* Reviews Section */}
        <ReviewSection targetType="temple" targetId={temple.id} />

        {/* CTA */}
        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              ✨ {t("detail.aiPlanRoute") || "AI规划包含此祖庭的路线"}
            </Link>
            <Link
              href="/temples"
              className="px-6 py-3 bg-temple-700/60 hover:bg-temple-600/60 text-white font-medium rounded-xl transition-all border border-gold/20"
            >
              ← {t("detail.backToList") || "返回祖庭列表"}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
