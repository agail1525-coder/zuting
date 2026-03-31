"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import type { Seal } from "@/lib/api";

const seriesDotColors: Record<string, string> = {
  CHUYIN: "bg-blue-400",
  ZHONGYIN: "bg-emerald-400",
  YINGUOYIN: "bg-amber-400",
  CHENGDAOYIN: "bg-purple-400",
  GUIYUANYIN: "bg-rose-400",
};

const seriesBgColors: Record<string, string> = {
  CHUYIN: "from-blue-50 to-gray-50",
  ZHONGYIN: "from-emerald-50 to-gray-50",
  YINGUOYIN: "from-amber-50 to-gray-50",
  CHENGDAOYIN: "from-purple-50 to-gray-50",
  GUIYUANYIN: "from-rose-50 to-gray-50",
};

const seriesAccentColors: Record<string, string> = {
  CHUYIN: "#3B82F6",
  ZHONGYIN: "#10B981",
  YINGUOYIN: "#F59E0B",
  CHENGDAOYIN: "#8B5CF6",
  GUIYUANYIN: "#F43F5E",
};

interface Props {
  seal: Seal;
  prev: Seal | null;
  next: Seal | null;
}

/* ═══ FAQ手风琴 ═══ */

function FAQSection({ sealName }: { sealName: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: `如何理解"${sealName}"的深意？`, a: "建议先诵读偈语，再结合精要和修行指南深入理解。可以在静坐冥想中观想此印含义，或向AI请教获取更深入的解读。" },
    { q: "三十印的修行顺序是什么？", a: "三十印分为五系：初印系、中印系、印果印、成道印、归源印，建议按序修行。每一印都是修行旅程中的一个里程碑。" },
    { q: "如何在朝圣中结合印的修行？", a: "建议在朝圣途中选择与当前修行的印相关的圣地进行冥想。在朝圣日志中记录修行体验，与社区分享心得。" },
    { q: "修行此印需要什么准备？", a: "需要一颗虔诚的心和安静的环境。建议先通读全部三十印了解体系，再逐一深入。可以结合每日功课进行修习。" },
  ];
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-4">常见问题</h2>
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

export default function SealDetailClient({ seal, prev, next }: Props) {
  const { t } = useTranslation();
  const dotColor = seriesDotColors[seal.series] || "bg-[#3264ff]";
  const bgColor = seriesBgColors[seal.series] || "from-blue-50 to-gray-50";
  const accentColor = seriesAccentColors[seal.series] || "#3264ff";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgColor} pb-24`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/seals" className="hover:text-[#3264ff] transition-colors">
            {t("nav.seals") || "三十印"}
          </Link>
          <span>/</span>
          <span className="text-gray-600">第{seal.id}印</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="text-gray-500 text-sm">{t(`seal.series.${seal.series}`)}</span>
          </div>
          <p className="text-6xl font-serif font-bold text-[#3264ff]/20 mb-2">
            {String(seal.id).padStart(2, "0")}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3264ff]">
            {seal.name}
          </h1>

          {/* Share button */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <ShareButton
              title={`第${seal.id}印 ${seal.name}`}
              description={seal.poem.slice(0, 100)}
              url={typeof window !== "undefined" ? window.location.href : ""}
              entityType="SEAL"
              entityId={String(seal.id)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Series Progress */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{t(`seal.series.${seal.series}`)}</span>
            <span>第 {seal.id} / 30 印</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(seal.id / 30) * 100}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Poem */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#3264ff] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span> {t("seal.poem")}
          </h2>
          <blockquote className="text-gray-700 font-serif text-xl leading-loose whitespace-pre-line text-center">
            {seal.poem}
          </blockquote>
        </div>

        {/* Essence */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#3264ff] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">💎</span> {t("seal.essence")}
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{seal.essence}</p>
        </div>

        {/* Practice */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#3264ff] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🧘</span> {t("seal.practice")}
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{seal.practice}</p>
        </div>

        {/* Vow */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#3264ff] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🙏</span> {t("seal.vow")}
          </h2>
          <p className="text-gray-700 font-serif text-lg leading-relaxed whitespace-pre-line text-center italic">
            {seal.vow}
          </p>
        </div>

        {/* Practice Tips */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-6">
          <h2 className="text-lg font-bold text-amber-700 mb-3">💡 修行提示</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-amber-800">
              <span className="mt-0.5 text-amber-500">•</span>
              <span>每日静坐时诵读此印偈语，观想其深意</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-amber-800">
              <span className="mt-0.5 text-amber-500">•</span>
              <span>在朝圣途中结合实际体验，加深对此印的理解</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-amber-800">
              <span className="mt-0.5 text-amber-500">•</span>
              <span>建议在朝圣日志中记录修行此印的感悟与心得</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <ReviewSection targetType="SEAL" targetId={String(seal.id)} />
        </div>

        {/* Q&A */}
        <div className="mb-6">
          <QASection entityType="SEAL" entityId={String(seal.id)} />
        </div>

        {/* FAQ */}
        <FAQSection sealName={seal.name} />

        {/* Navigation */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            {prev ? (
              <Link
                href={`/seals/${prev.id}`}
                className="flex items-center gap-2 text-[#3264ff] hover:text-[#3385FF] transition-colors"
              >
                <span>←</span>
                <span className="text-sm">
                  {t("seal.prev")}: {prev.name}
                </span>
              </Link>
            ) : (
              <div />
            )}
            <Link
              href="/seals"
              className="text-gray-500 hover:text-[#3264ff] transition-colors text-sm"
            >
              {t("detail.backToList")}
            </Link>
            {next ? (
              <Link
                href={`/seals/${next.id}`}
                className="flex items-center gap-2 text-[#3264ff] hover:text-[#3385FF] transition-colors"
              >
                <span className="text-sm">
                  {t("seal.next")}: {next.name}
                </span>
                <span>→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="px-6 py-3 bg-[#3264ff] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            ✨ 向小鸿AI请教此印
          </Link>
          <Link
            href="/journals/create"
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
          >
            📖 记录修行感悟
          </Link>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
