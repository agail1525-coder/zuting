"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import HolySiteCard from "@/components/HolySiteCard";
import TempleCard from "@/components/TempleCard";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite, Temple, Patriarch, Teaching } from "@/lib/api";

interface Props {
  religion: Religion;
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  teachings: Teaching[];
}

type Tab = "holySites" | "temples" | "patriarchs" | "teachings";

export default function ReligionDetailClient({
  religion,
  holySites,
  temples,
  patriarchs,
  teachings,
}: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("holySites");
  const color = religion.color ?? "#D4A855";

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "holySites", label: t("religion.holySites"), count: holySites.length },
    { key: "temples", label: t("religion.temples"), count: temples.length },
    { key: "patriarchs", label: t("religion.patriarchs"), count: patriarchs.length },
    { key: "teachings", label: t("religion.teachings"), count: teachings.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}, transparent 70%)` }}
        />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/religions" className="hover:text-gold transition-colors">{t("nav.religions") || "信仰"}</Link>
            <span>/</span>
            <span className="text-white/80">{religion.name}</span>
          </div>

          {religion.symbol && (
            <span className="text-7xl block mb-4">{religion.symbol}</span>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
            {religion.name}
          </h1>
          <p className="text-xl" style={{ color }}>{religion.nameEn}</p>

          {/* Total count */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{holySites.length}</p>
              <p className="text-temple-400 text-sm">{t("religion.holySites")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{temples.length}</p>
              <p className="text-temple-400 text-sm">{t("religion.temples")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{patriarchs.length}</p>
              <p className="text-temple-400 text-sm">{t("religion.patriarchs")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{teachings.length}</p>
              <p className="text-temple-400 text-sm">{t("religion.teachings")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "font-semibold shadow-lg border"
                  : "bg-temple-800/60 text-temple-300 hover:bg-temple-700/60 border border-temple-600/50"
              }`}
              style={activeTab === tab.key ? {
                backgroundColor: `${color}25`,
                color,
                borderColor: `${color}50`,
                boxShadow: `0 4px 14px ${color}15`,
              } : undefined}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "holySites" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {holySites.map((site) => (
              <HolySiteCard key={site.id} site={site} />
            ))}
          </div>
        )}

        {activeTab === "temples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))}
          </div>
        )}

        {activeTab === "patriarchs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patriarchs.map((p) => (
              <PatriarchCard key={p.id} patriarch={p} />
            ))}
          </div>
        )}

        {activeTab === "teachings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachings.map((teaching) => (
              <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                <div className="card-glow rounded-xl p-6 bg-temple-800/50 group cursor-pointer h-full">
                  <h3 className="font-serif font-bold text-white group-hover:text-gold transition-colors mb-3">
                    {teaching.name}
                  </h3>
                  <p className="text-temple-400 text-sm font-serif leading-relaxed line-clamp-3">
                    {teaching.originalText}
                  </p>
                  {teaching.sourceText && (
                    <p className="text-temple-500 text-xs mt-2">— {teaching.sourceText}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-12">
          <Link
            href="/religions"
            className="px-6 py-3 bg-temple-700/60 hover:bg-temple-600/60 text-white font-medium rounded-xl transition-all border border-gold/20"
          >
            ← {t("detail.backToList") || "返回信仰列表"}
          </Link>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
