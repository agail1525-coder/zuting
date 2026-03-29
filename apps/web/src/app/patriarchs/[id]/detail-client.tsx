"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import ReviewSection from "@/components/ReviewSection";
import RelatedEntities from "@/components/RelatedEntities";
import SaveButton from "@/components/SaveButton";
import { recordView } from "@/lib/api";
import type { Patriarch } from "@/lib/api";

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

export default function PatriarchDetailClient({ patriarch }: { patriarch: Patriarch }) {
  const { t } = useTranslation();
  const gradient = RELIGION_GRADIENT[patriarch.religion?.slug || ""] || "from-gray-600 to-gray-700";
  const religionColor = patriarch.religion?.color ?? "#0066FF";

  useEffect(() => {
    recordView("PATRIARCH", patriarch.id);
  }, [patriarch.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-[350px] md:h-[450px] relative overflow-hidden">
          {patriarch.imageUrl ? (
            <>
              <OptimizedImage src={patriarch.imageUrl} alt={patriarch.name} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-[120px] opacity-20">{patriarch.religion?.symbol || "👤"}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            </div>
          )}

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <Link href="/patriarchs" className="hover:text-white transition-colors">{t("nav.patriarchs") || "祖师"}</Link>
                <span>/</span>
                <span className="text-white/80">{patriarch.name}</span>
              </div>

              {/* Religion badge */}
              {patriarch.religion && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 mb-3"
                  style={{ backgroundColor: `${religionColor}30`, color: religionColor }}
                >
                  {patriarch.religion.symbol} {patriarch.religion.name}
                </span>
              )}

              <div className="flex items-start gap-3">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg flex-1">
                  {patriarch.name}
                </h1>
                <div className="mt-1">
                  <SaveButton entityType="PATRIARCH" entityId={patriarch.id} size="md" />
                </div>
              </div>
              {patriarch.nameEn && (
                <p className="text-xl text-white/70 mt-2">{patriarch.nameEn}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {patriarch.title && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    🏆 {patriarch.title}
                  </span>
                )}
                {patriarch.dates && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    📅 {patriarch.dates}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-24">
        {/* Biography Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.biography") || "生平事迹"}</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">{patriarch.biography}</p>
        </div>

        {/* Core Teaching Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.coreTeaching") || "核心教义"}</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg font-serif italic">{patriarch.coreTeaching}</p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {patriarch.title && (
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">🏆</span>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.title") || "称号"}</p>
              <p className="text-gray-900 font-medium">{patriarch.title}</p>
            </div>
          )}
          {patriarch.dates && (
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 text-center">
              <span className="text-2xl mb-2 block">📅</span>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.dates") || "年代"}</p>
              <p className="text-gray-900 font-medium">{patriarch.dates}</p>
            </div>
          )}
          <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 text-center">
            <span className="text-2xl mb-2 block">{patriarch.religion?.symbol || "🕉"}</span>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t("detail.religion") || "信仰"}</p>
            <p className="text-gray-900 font-medium">{patriarch.religion?.name || "-"}</p>
          </div>
        </div>

        {/* Religion Context Card */}
        {patriarch.religion && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" style={{ borderColor: `${religionColor}20` }}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{patriarch.religion.symbol}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{patriarch.religion.name}</h3>
                <p className="text-gray-500 text-sm">{patriarch.religion.nameEn}</p>
              </div>
              <Link
                href={`/religions/${patriarch.religion.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                style={{ borderColor: `${religionColor}40`, color: religionColor }}
              >
                {t("detail.learnMore") || "了解更多"} →
              </Link>
            </div>
          </div>
        )}

        {/* Related Entities */}
        <RelatedEntities entityType="PATRIARCH" entityId={patriarch.id} title="相关推荐" />

        {/* CTA */}
        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              ✨ {t("detail.aiPlanRoute") || "AI规划相关朝圣路线"}
            </Link>
            <Link
              href="/patriarchs"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
            >
              ← {t("detail.backToList") || "返回祖师列表"}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
