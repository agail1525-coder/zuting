"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Patriarch } from "@/lib/api";

export default function PatriarchDetailClient({ patriarch }: { patriarch: Patriarch }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-temple-700 to-temple-800 h-56 flex items-center justify-center mb-8">
        <span className="text-8xl opacity-20">👤</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-2">
          {patriarch.name}
        </h1>
        {patriarch.nameEn && (
          <p className="text-xl text-temple-400">{patriarch.nameEn}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {patriarch.title && (
          <div className="card-glow rounded-xl p-4 bg-temple-800/50">
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.title")}</p>
            <p className="text-white font-medium">{patriarch.title}</p>
          </div>
        )}
        {patriarch.dates && (
          <div className="card-glow rounded-xl p-4 bg-temple-800/50">
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.dates")}</p>
            <p className="text-white font-medium">{patriarch.dates}</p>
          </div>
        )}
      </div>

      <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-6">
        <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.biography")}</h2>
        <p className="text-temple-300 leading-relaxed whitespace-pre-line">{patriarch.biography}</p>
      </div>

      <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-8">
        <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.coreTeaching")}</h2>
        <p className="text-temple-300 leading-relaxed whitespace-pre-line font-serif">{patriarch.coreTeaching}</p>
      </div>

      <div className="text-center">
        <Link href="/patriarchs" className="text-gold hover:text-gold-light transition-colors">
          ← {t("detail.backToList")}
        </Link>
      </div>
    </div>
  );
}
