"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Teaching } from "@/lib/api";

export default function TeachingDetailClient({ teaching }: { teaching: Teaching }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-4">
          {teaching.name}
        </h1>
      </div>

      <div className="card-glow rounded-xl p-8 bg-temple-800/50 mb-6">
        <h2 className="text-gold font-serif font-bold text-lg mb-4">{t("detail.originalText")}</h2>
        <blockquote className="text-temple-200 font-serif text-lg leading-relaxed whitespace-pre-line border-l-2 border-gold/30 pl-6">
          {teaching.originalText}
        </blockquote>
      </div>

      {teaching.sourceText && (
        <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-6">
          <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.source")}</h2>
          <p className="text-temple-300">{teaching.sourceText}</p>
        </div>
      )}

      {teaching.translationCn && (
        <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-8">
          <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.translation")}</h2>
          <p className="text-temple-300 leading-relaxed whitespace-pre-line">{teaching.translationCn}</p>
        </div>
      )}

      <div className="text-center">
        <Link href="/teachings" className="text-gold hover:text-gold-light transition-colors">
          ← {t("detail.backToList")}
        </Link>
      </div>
    </div>
  );
}
