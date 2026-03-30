"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import HolySiteCard from "@/components/HolySiteCard";
import TempleCard from "@/components/TempleCard";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import SocialProof from "@/components/SocialProof";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import MediaTour from "@/components/MediaTour";
import type { Religion, HolySite, Temple, Patriarch, Teaching } from "@/lib/api";

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

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
  const color = religion.color ?? "#0066FF";
  const totalItems = holySites.length + temples.length + patriarchs.length + teachings.length;

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: "holySites", label: t("religion.holySites"), count: holySites.length, icon: "🏔️" },
    { key: "temples", label: t("religion.temples"), count: temples.length, icon: "🏛️" },
    { key: "patriarchs", label: t("religion.patriarchs"), count: patriarchs.length, icon: "🧘" },
    { key: "teachings", label: t("religion.teachings"), count: teachings.length, icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Hero Section ========== */}
      <div className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}, transparent 70%)` }}
        />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/religions" className="hover:text-[#0066FF] transition-colors">
              {t("nav.religions") || "信仰"}
            </Link>
            <span>/</span>
            <span className="text-gray-700">{religion.name}</span>
          </div>

          {religion.symbol && (
            <span className="text-7xl block mb-4">{religion.symbol}</span>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            {religion.name}
          </h1>
          <p className="text-xl" style={{ color }}>
            {religion.nameEn}
          </p>

          {/* Share button */}
          <div className="flex items-center justify-center mt-4">
            <ShareButton
              title={religion.name}
              description={`${religion.nameEn} — ${totalItems}项文化遗产`}
              url={typeof window !== "undefined" ? window.location.href : ""}
              entityType="RELIGION"
              entityId={religion.id}
              className="text-sm"
            />
          </div>

          {/* Stats grid */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="text-center group cursor-pointer"
              >
                <span className="text-2xl block mb-1">{tab.icon}</span>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                  {tab.count}
                </p>
                <p className="text-gray-500 text-sm">{tab.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ========== Social Proof ========== */}
        <div className="mb-8">
          <SocialProof entityType="RELIGION" entityId={religion.id} variant="banner" />
        </div>

        {/* ========== Tabs ========== */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "font-semibold shadow-lg border"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
              style={
                activeTab === tab.key
                  ? {
                      backgroundColor: `${color}25`,
                      color,
                      borderColor: `${color}50`,
                      boxShadow: `0 4px 14px ${color}15`,
                    }
                  : undefined
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className="opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* ========== Tab Content ========== */}
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
            {teachings.map((teaching) => {
              const icon = RELIGION_ICONS[religion.name] ?? "📜";
              return (
                <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 group cursor-pointer h-full flex overflow-hidden hover:shadow-md hover:border-[#0066FF]/20 transition-all">
                    <div
                      className="w-14 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-2">
                        {teaching.name}
                      </h3>
                      <p className="text-gray-500 text-sm font-serif leading-relaxed line-clamp-3">
                        {teaching.originalText}
                      </p>
                      {teaching.sourceText && (
                        <p className="text-gray-400 text-xs mt-2">— {teaching.sourceText}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ========== Multimedia Tour ========== */}
        <div className="mt-10">
          <MediaTour entityType="RELIGION" entityId={religion.id} />
        </div>

        {/* ========== Reviews ========== */}
        <div className="mt-10">
          <ReviewSection targetType="RELIGION" targetId={religion.id} />
        </div>

        {/* ========== Q&A ========== */}
        <div className="mt-10">
          <QASection entityType="RELIGION" entityId={religion.id} />
        </div>

        {/* ========== Bottom CTAs ========== */}
        <div className="text-center mt-12 space-y-4">
          <Link
            href={`/chat?q=${encodeURIComponent(`我想了解${religion.name}的朝圣路线`)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            ✨ 探索{religion.name}朝圣路线
          </Link>
          <div>
            <Link
              href="/religions"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200 inline-block"
            >
              ← {t("detail.backToList") || "返回信仰列表"}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
