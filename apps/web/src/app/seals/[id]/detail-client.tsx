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
  CHUYIN: "from-blue-900/30 to-temple-900",
  ZHONGYIN: "from-emerald-900/30 to-temple-900",
  YINGUOYIN: "from-amber-900/30 to-temple-900",
  CHENGDAOYIN: "from-purple-900/30 to-temple-900",
  GUIYUANYIN: "from-rose-900/30 to-temple-900",
};

interface Props {
  seal: Seal;
  prev: Seal | null;
  next: Seal | null;
}

export default function SealDetailClient({ seal, prev, next }: Props) {
  const { t } = useTranslation();
  const dotColor = seriesDotColors[seal.series] || "bg-gold";
  const bgColor = seriesBgColors[seal.series] || "from-gold/10 to-temple-900";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgColor}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="text-temple-400 text-sm">{t(`seal.series.${seal.series}`)}</span>
          </div>
          <p className="text-6xl font-serif font-bold text-gold/30 mb-2">
            {String(seal.id).padStart(2, "0")}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
            {seal.name}
          </h1>
        </div>

        {/* Poem */}
        <div className="card-glow rounded-2xl p-8 bg-temple-800/40 mb-6">
          <h2 className="text-gold font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span> {t("seal.poem")}
          </h2>
          <blockquote className="text-temple-200 font-serif text-xl leading-loose whitespace-pre-line text-center">
            {seal.poem}
          </blockquote>
        </div>

        {/* Essence */}
        <div className="card-glow rounded-2xl p-8 bg-temple-800/40 mb-6">
          <h2 className="text-gold font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">💎</span> {t("seal.essence")}
          </h2>
          <p className="text-temple-300 leading-relaxed whitespace-pre-line">{seal.essence}</p>
        </div>

        {/* Practice */}
        <div className="card-glow rounded-2xl p-8 bg-temple-800/40 mb-6">
          <h2 className="text-gold font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🧘</span> {t("seal.practice")}
          </h2>
          <p className="text-temple-300 leading-relaxed whitespace-pre-line">{seal.practice}</p>
        </div>

        {/* Vow */}
        <div className="card-glow rounded-2xl p-8 bg-temple-800/40 mb-10">
          <h2 className="text-gold font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🙏</span> {t("seal.vow")}
          </h2>
          <p className="text-temple-200 font-serif text-lg leading-relaxed whitespace-pre-line text-center italic">
            {seal.vow}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prev ? (
            <Link
              href={`/seals/${prev.id}`}
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
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
            className="text-temple-400 hover:text-gold transition-colors text-sm"
          >
            {t("detail.backToList")}
          </Link>
          {next ? (
            <Link
              href={`/seals/${next.id}`}
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
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
