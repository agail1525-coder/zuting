"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Temple } from "@/lib/api";

export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-temple-700 to-temple-800 h-64 flex items-center justify-center mb-8">
        <span className="text-8xl opacity-20">🏛</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-2">
          {temple.name}
        </h1>
        {temple.nameEn && (
          <p className="text-xl text-temple-400">{temple.nameEn}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="card-glow rounded-xl p-4 bg-temple-800/50">
          <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.country")}</p>
          <p className="text-white font-medium">{temple.country}</p>
        </div>
        {temple.foundingDate && (
          <div className="card-glow rounded-xl p-4 bg-temple-800/50">
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.foundingDate")}</p>
            <p className="text-white font-medium">{temple.foundingDate}</p>
          </div>
        )}
        {temple.latitude && temple.longitude && (
          <div className="card-glow rounded-xl p-4 bg-temple-800/50">
            <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.coordinates")}</p>
            <p className="text-white font-medium text-sm">
              {temple.latitude.toFixed(4)}, {temple.longitude.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-8">
        <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.description")}</h2>
        <p className="text-temple-300 leading-relaxed whitespace-pre-line">{temple.description}</p>
      </div>

      <div className="text-center">
        <Link href="/temples" className="text-gold hover:text-gold-light transition-colors">
          ← {t("detail.backToList")}
        </Link>
      </div>
    </div>
  );
}
