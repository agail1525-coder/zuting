"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { HolySite } from "@/lib/api";

export default function HolySiteDetailClient({ site }: { site: HolySite }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-temple-700 to-temple-800 h-64 md:h-80 flex items-center justify-center mb-8 relative">
        <span className="text-8xl opacity-20">🕌</span>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="text-sm px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/20">
            {site.country}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-2">
          {site.name}
        </h1>
        <p className="text-xl text-temple-400">{site.nameEn}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-glow rounded-xl p-4 bg-temple-800/50">
          <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.country")}</p>
          <p className="text-white font-medium">{site.country}</p>
        </div>
        <div className="card-glow rounded-xl p-4 bg-temple-800/50">
          <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">{t("detail.coordinates")}</p>
          <p className="text-white font-medium text-sm">
            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
          </p>
        </div>
        <div className="card-glow rounded-xl p-4 bg-temple-800/50">
          <p className="text-xs text-temple-500 uppercase tracking-wider mb-1">UTC</p>
          <p className="text-white font-medium">
            UTC{site.utcOffset >= 0 ? "+" : ""}{site.utcOffset}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-8">
        <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.description")}</h2>
        <p className="text-temple-300 leading-relaxed whitespace-pre-line">{site.description}</p>
      </div>

      {/* Map placeholder */}
      <div className="card-glow rounded-xl p-6 bg-temple-800/50 mb-8">
        <h2 className="text-gold font-serif font-bold text-lg mb-3">{t("detail.mapPlaceholder")}</h2>
        <div className="h-48 rounded-lg bg-temple-700/50 flex items-center justify-center border border-temple-600/50">
          <div className="text-center">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-temple-400 text-sm">
              {site.latitude.toFixed(4)}N, {site.longitude.toFixed(4)}E
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/holy-sites" className="text-gold hover:text-gold-light transition-colors">
          ← {t("detail.backToList")}
        </Link>
      </div>
    </div>
  );
}
