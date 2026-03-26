"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import HolySiteCard from "@/components/HolySiteCard";
import TempleCard from "@/components/TempleCard";
import PatriarchCard from "@/components/PatriarchCard";
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "holySites", label: t("religion.holySites"), count: holySites.length },
    { key: "temples", label: t("religion.temples"), count: temples.length },
    { key: "patriarchs", label: t("religion.patriarchs"), count: patriarchs.length },
    { key: "teachings", label: t("religion.teachings"), count: teachings.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        {religion.symbol && (
          <span className="text-6xl block mb-4">{religion.symbol}</span>
        )}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-2">
          {religion.name}
        </h1>
        <p className="text-temple-400 text-xl">{religion.nameEn}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-gold text-temple-900"
                : "bg-temple-800 text-temple-300 hover:bg-temple-700 border border-temple-600"
            }`}
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
          className="text-gold hover:text-gold-light transition-colors"
        >
          ← {t("detail.backToList")}
        </Link>
      </div>
    </div>
  );
}
