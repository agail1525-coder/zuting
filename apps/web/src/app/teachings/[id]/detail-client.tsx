"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Teaching } from "@/lib/api";

export default function TeachingDetailClient({ teaching }: { teaching: Teaching }) {
  const { t } = useTranslation();
  const religionColor = teaching.religion?.color ?? "#0066FF";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/teachings" className="hover:text-[#0066FF] transition-colors">{t("nav.teachings") || "祖训"}</Link>
          <span>/</span>
          <span className="text-gray-700">{teaching.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          {teaching.religion && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 mb-4"
              style={{ backgroundColor: `${religionColor}10`, color: religionColor }}
            >
              {teaching.religion.symbol} {teaching.religion.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0066FF]">
            {teaching.name}
          </h1>
        </div>

        {/* Original Text */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">{t("detail.originalText") || "原文"}</h2>
          <blockquote className="text-gray-700 font-serif text-lg leading-relaxed whitespace-pre-line border-l-2 border-[#0066FF]/30 pl-6">
            {teaching.originalText}
          </blockquote>
        </div>

        {/* Source */}
        {teaching.sourceText && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-3">{t("detail.source") || "出处"}</h2>
            <p className="text-gray-600">{teaching.sourceText}</p>
          </div>
        )}

        {/* Translation */}
        {teaching.translationCn && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-3">{t("detail.translation") || "释义"}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{teaching.translationCn}</p>
          </div>
        )}

        {/* Religion Context */}
        {teaching.religion && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" style={{ backgroundColor: `${religionColor}08`, borderColor: `${religionColor}20` }}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{teaching.religion.symbol}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{teaching.religion.name}</h3>
                <p className="text-gray-500 text-sm">{teaching.religion.nameEn}</p>
              </div>
              <Link
                href={`/religions/${teaching.religion.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                style={{ borderColor: `${religionColor}40`, color: religionColor }}
              >
                {t("detail.learnMore") || "了解更多"} →
              </Link>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/teachings"
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
          >
            ← {t("detail.backToList") || "返回祖训列表"}
          </Link>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
