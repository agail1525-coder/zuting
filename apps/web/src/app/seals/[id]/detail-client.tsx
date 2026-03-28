"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
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

interface Props {
  seal: Seal;
  prev: Seal | null;
  next: Seal | null;
}

export default function SealDetailClient({ seal, prev, next }: Props) {
  const { t } = useTranslation();
  const dotColor = seriesDotColors[seal.series] || "bg-[#0066FF]";
  const bgColor = seriesBgColors[seal.series] || "from-blue-50 to-gray-50";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgColor}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="text-gray-500 text-sm">{t(`seal.series.${seal.series}`)}</span>
          </div>
          <p className="text-6xl font-serif font-bold text-[#0066FF]/20 mb-2">
            {String(seal.id).padStart(2, "0")}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0066FF]">
            {seal.name}
          </h1>
        </div>

        {/* Poem */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span> {t("seal.poem")}
          </h2>
          <blockquote className="text-gray-700 font-serif text-xl leading-loose whitespace-pre-line text-center">
            {seal.poem}
          </blockquote>
        </div>

        {/* Essence */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">💎</span> {t("seal.essence")}
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{seal.essence}</p>
        </div>

        {/* Practice */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-6">
          <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🧘</span> {t("seal.practice")}
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{seal.practice}</p>
        </div>

        {/* Vow */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 mb-10">
          <h2 className="text-[#0066FF] font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🙏</span> {t("seal.vow")}
          </h2>
          <p className="text-gray-700 font-serif text-lg leading-relaxed whitespace-pre-line text-center italic">
            {seal.vow}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prev ? (
            <Link
              href={`/seals/${prev.id}`}
              className="flex items-center gap-2 text-[#0066FF] hover:text-[#3385FF] transition-colors"
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
            className="text-gray-500 hover:text-[#0066FF] transition-colors text-sm"
          >
            {t("detail.backToList")}
          </Link>
          {next ? (
            <Link
              href={`/seals/${next.id}`}
              className="flex items-center gap-2 text-[#0066FF] hover:text-[#3385FF] transition-colors"
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

      <MobileNav />
    </div>
  );
}
