"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import SocialProof from "@/components/SocialProof";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import MediaTour from "@/components/MediaTour";
import type { Teaching } from "@/lib/api";
import { fetchTeachings } from "@/lib/api";

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

/* ═══ FAQ手风琴 ═══ */

function FAQSection({ teachingName, religionName }: { teachingName: string; religionName?: string }) {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: t("teachingDetail.faqCoreMeaning", { name: teachingName }), a: t("teachingDetail.faqCoreMeaningAnswer", { religion: religionName ?? t("teachingDetail.tradition") }) },
    { q: t("teachingDetail.faqPractice"), a: t("teachingDetail.faqPracticeAnswer") },
    { q: t("teachingDetail.faqSuggestions"), a: t("teachingDetail.faqSuggestionsAnswer") },
    { q: t("teachingDetail.faqRecord"), a: t("teachingDetail.faqRecordAnswer") },
  ];
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("teachingDetail.faq")}</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
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

function SimilarTeachings({ currentId, religionId }: { currentId: string; religionId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Teaching[]>([]);

  useEffect(() => {
    fetchTeachings(religionId)
      .then((all) => setItems(all.filter((t) => t.id !== currentId).slice(0, 4)))
      .catch(() => {});
  }, [currentId, religionId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-5">{t("teachingDetail.sameSeriesTeachings")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((t) => (
          <Link
            key={t.id}
            href={`/teachings/${t.id}`}
            className="block bg-white rounded-xl p-5 border border-gray-100 hover:border-[#3264ff]/30 hover:shadow-sm transition-all group"
          >
            <p className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#3264ff] transition-colors">
              {t.name}
            </p>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{t.originalText}</p>
            {t.sourceText && (
              <p className="text-xs text-gray-400 mt-2">— {t.sourceText}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function TeachingDetailClient({ teaching }: { teaching: Teaching }) {
  const { t } = useTranslation();
  const religionColor = teaching.religion?.color ?? "#3264ff";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16 pb-24">
        {/* ========== Hero Section ========== */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/50 mb-8">
              <Link href="/teachings" className="hover:text-white transition-colors">
                {t("nav.teachings") || "祖训"}
              </Link>
              <span>/</span>
              <span className="text-white/70">{teaching.name}</span>
            </div>

            {/* Religion badge */}
            {teaching.religion && (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border mb-6"
                style={{
                  backgroundColor: `${religionColor}20`,
                  color: religionColor,
                  borderColor: `${religionColor}40`,
                }}
              >
                {teaching.religion.symbol ?? RELIGION_ICONS[teaching.religion.name] ?? "🙏"}{" "}
                {teaching.religion.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              {teaching.name}
            </h1>
            {teaching.sourceText && (
              <p className="text-white/50 mt-3 text-sm">{t("teachingDetail.source")}: {teaching.sourceText}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <ShareButton
                title={teaching.name}
                description={teaching.originalText.slice(0, 100)}
                url={typeof window !== "undefined" ? window.location.href : ""}
                entityType="TEACHING"
                entityId={teaching.id}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* ========== Social Proof ========== */}
          <div className="mt-6">
            <SocialProof entityType="TEACHING" entityId={teaching.id} variant="banner" />
          </div>

          {/* ========== Original Text (featured) ========== */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-[#3264ff] font-serif font-bold text-xl mb-4">
              {t("detail.originalText") || "原文"}
            </h2>
            <blockquote className="text-gray-700 font-serif text-lg leading-relaxed whitespace-pre-line border-l-2 border-[#3264ff]/30 pl-6">
              {teaching.originalText}
            </blockquote>
          </div>

          {/* ========== Translation / 释义 ========== */}
          {teaching.translationCn && (
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-[#3264ff] font-serif font-bold text-lg mb-3">
                {t("detail.translation") || "释义"}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {teaching.translationCn}
              </p>
            </div>
          )}

          {/* ========== Key Insights ========== */}
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <h2 className="text-lg font-bold text-amber-700 mb-3">{t("teachingDetail.practiceInsights")}</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{t("teachingDetail.insightCore", { religion: teaching.religion?.name ?? t("teachingDetail.tradition") })}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{t("teachingDetail.insightRecite")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{t("teachingDetail.insightJournal")}</span>
              </div>
            </div>
          </div>

          {/* ========== Multimedia Tour ========== */}
          <div className="mt-8">
            <MediaTour entityType="TEACHING" entityId={teaching.id} />
          </div>

          {/* ========== Religion Context ========== */}
          {teaching.religion && (
            <div
              className="mt-8 bg-white rounded-2xl shadow-sm border p-6"
              style={{
                backgroundColor: `${religionColor}08`,
                borderColor: `${religionColor}20`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {teaching.religion.symbol ?? RELIGION_ICONS[teaching.religion.name] ?? "🙏"}
                </span>
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

          {/* ========== Reviews ========== */}
          <div className="mt-10">
            <ReviewSection targetType="TEACHING" targetId={teaching.id} />
          </div>

          {/* ========== Q&A ========== */}
          <div className="mt-10">
            <QASection entityType="TEACHING" entityId={teaching.id} />
          </div>

          {/* ========== FAQ ========== */}
          <FAQSection teachingName={teaching.name} religionName={teaching.religion?.name} />

          {/* ========== Similar Teachings ========== */}
          {teaching.religionId && (
            <SimilarTeachings currentId={teaching.id} religionId={teaching.religionId} />
          )}

          {/* ========== Pilgrim Journal CTA ========== */}
          <div className="mt-8 bg-gradient-to-r from-[#3264ff]/5 to-blue-50 rounded-2xl p-6 border border-[#3264ff]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t("teachingDetail.recordInsights")}</h2>
                  <p className="text-sm text-gray-500">{t("teachingDetail.recordInsightsDesc")}</p>
                </div>
              </div>
              <Link
                href="/journals"
                className="px-4 py-2 rounded-xl bg-[#3264ff] text-white text-sm font-medium hover:bg-[#2854e0] transition-colors shadow-sm"
              >
                {t("teachingDetail.writeJournal")}
              </Link>
            </div>
          </div>

          {/* ========== Bottom CTA ========== */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3264ff] hover:bg-[#2854e0] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {t("teachingDetail.askAiAbout")}
            </Link>
            <Link
              href="/teachings"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
            >
              ← {t("detail.backToList") || "返回祖训列表"}
            </Link>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
