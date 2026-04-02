"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion } from "@/lib/api";

// Curated marketing stats reflecting actual platform content (see seed data in CLAUDE.md)
const PLATFORM_STATS = [
  { icon: "🕌", value: "60+", labelKey: "about.stats.holySites" },
  { icon: "🏛", value: "27+", labelKey: "about.stats.temples" },
  { icon: "☸️", value: "12", labelKey: "about.stats.religions" },
  { icon: "🌍", value: "7", labelKey: "about.stats.languages" },
  { icon: "📱", value: "5", labelKey: "about.stats.platforms" },
  { icon: "📍", value: "10+", labelKey: "about.stats.routes" },
];

const TRUST_BADGE_KEYS = [
  { icon: "🔒", key: "about.trust.encryption" },
  { icon: "✅", key: "about.trust.review" },
  { icon: "🌐", key: "about.trust.multilang" },
  { icon: "💬", key: "about.trust.ai" },
];

const MILESTONES = [
  { year: "2024", icon: "🌱", key: "about.milestone.seed" },
  { year: "2025", icon: "🏗️", key: "about.milestone.build" },
  { year: "2025 Q4", icon: "🚀", key: "about.milestone.launch" },
  { year: "2026", icon: "🌍", key: "about.milestone.global" },
];

const FEATURES = [
  { icon: "🗺️", key: "about.feature.map" },
  { icon: "🤖", key: "about.feature.ai" },
  { icon: "📖", key: "about.feature.journal" },
  { icon: "🛤️", key: "about.feature.route" },
  { icon: "⭐", key: "about.feature.review" },
  { icon: "🎧", key: "about.feature.media" },
];

export default function AboutClient({ religions = [] }: { religions?: Religion[] }) {
  const { t } = useTranslation();

  const values = [
    { key: "dialogue", icon: "🤝" },
    { key: "peace", icon: "🕊️" },
    { key: "digital", icon: "💻" },
    { key: "immersive", icon: "🌟" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0066FF] to-[#003D99] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-50px] right-[-50px] w-60 h-60 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
            🏛
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t("about.title")}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t("about.subtitle")}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <span className="text-2xl block mb-1">{stat.icon}</span>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{t(stat.labelKey) || stat.labelKey.split(".").pop()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Vision */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.vision.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {t("about.vision.summary").split("{highlight}")[0]}
            <span className="text-[#0066FF] font-bold">{t("about.vision.highlight")}</span>
            {t("about.vision.summary").split("{highlight}")[1]}
          </p>
          <p className="text-gray-500 leading-relaxed mt-4">
            {t("about.vision.detail")}
          </p>
        </div>

        {/* Core Values */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.key}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-[#0066FF]/20 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {t(`about.values.${v.key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(`about.values.${v.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4 text-center">{t("about.trust.title")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGE_KEYS.map((badge) => (
              <div key={badge.key} className="flex items-center gap-2 justify-center text-sm text-green-700">
                <span className="text-xl">{badge.icon}</span>
                <span>{t(badge.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("about.team.desc")}
          </p>
        </div>

        {/* 12 Traditions Showcase */}
        {religions.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-2">
              {t("about.traditions.title")}
            </h2>
            <p className="text-gray-500 text-sm mb-6">{t("about.traditions.desc")}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {religions.map((r) => (
                <Link
                  key={r.id}
                  href={`/religions/${r.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${r.color || '#0066FF'}15` }}
                  >
                    {r.symbol || "🙏"}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-[#0066FF] transition-colors font-medium">{r.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Platform Features */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-6">
            {t("about.features.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl block mb-2">{f.icon}</span>
                <p className="text-sm font-medium text-gray-700">{t(`${f.key}.title`)}</p>
                <p className="text-xs text-gray-500 mt-1">{t(`${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-6">
            {t("about.milestones.title")}
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#0066FF]/20" />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-xl shrink-0 relative z-10 border-2 border-white">
                    {m.icon}
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-bold text-[#0066FF]">{m.year}</p>
                    <p className="text-gray-600 text-sm">{t(m.key)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.contact.title")}
          </h2>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-3">
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.email")}：</strong>
              contact@zuting.com
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.address")}：</strong>
              {t("about.contact.addressValue")}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.hours")}：</strong>
              {t("about.contact.hoursValue")}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{t("about.cta.title")}</h2>
          <p className="text-gray-400 text-sm mb-6">{t("about.cta.desc")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/holy-sites"
              className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              {t("about.cta.explore")} →
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
            >
              ✨ {t("about.cta.aiPlan")}
            </Link>
          </div>
        </div>

        {/* ICP */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            {t("about.icp")}
          </p>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
