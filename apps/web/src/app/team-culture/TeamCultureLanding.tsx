"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { TeamCultureTheme, TeamCase } from "@/lib/api/team-culture";
import TeamInquiryForm from "./components/TeamInquiryForm";
import TeamThemeCard from "./components/TeamThemeCard";
import TeamCaseCard from "./components/TeamCaseCard";
import MethodologySection from "./components/MethodologySection";
import ComparisonTable from "./components/ComparisonTable";

const INDUSTRIES = [
  { key: "ENTERPRISE", labelKey: "teamCulture.orgEnterpriseLabel", copyKey: "teamCulture.orgEnterpriseCopy", icon: "🏢" },
  { key: "EXECUTIVE", labelKey: "teamCulture.orgExecutiveLabel", copyKey: "teamCulture.orgExecutiveCopy", icon: "👔" },
  { key: "FAMILY_OFFICE", labelKey: "teamCulture.orgFamilyOfficeLabel", copyKey: "teamCulture.orgFamilyOfficeCopy", icon: "🏛️" },
  { key: "NGO", labelKey: "teamCulture.orgNGOLabel", copyKey: "teamCulture.orgNGOCopy", icon: "🤝" },
  { key: "GOVERNMENT", labelKey: "teamCulture.orgGovernmentLabel", copyKey: "teamCulture.orgGovernmentCopy", icon: "🏛" },
];

interface Props {
  themes: TeamCultureTheme[];
  cases: TeamCase[];
}

export default function TeamCultureLanding({ themes, cases }: Props) {
  const { t } = useTranslation();
  const [activeIndustry, setActiveIndustry] = useState("ENTERPRISE");
  const activeCopy = INDUSTRIES.find((i) => i.key === activeIndustry);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ════════ Hero ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc]">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/30 rounded-full text-white text-sm font-medium tracking-wide mb-6">
              ✨ {t("teamCulture.heroKicker")}
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {t("teamCulture.heroTitle")}
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
              {t("teamCulture.heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#3264ff] font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("teamCulture.ctaInquiry")} →
              </a>
              <Link
                href="/team-culture/themes"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/60 transition-all"
              >
                {t("teamCulture.ctaThemes")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 五步法 Methodology ════════ */}
      <MethodologySection />

      {/* ════════ Value Props ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", titleKey: "teamCulture.valueDepthTitle", descKey: "teamCulture.valueDepthDesc" },
            { icon: "🌍", titleKey: "teamCulture.valueGlobalTitle", descKey: "teamCulture.valueGlobalDesc" },
            { icon: "✨", titleKey: "teamCulture.valueCustomTitle", descKey: "teamCulture.valueCustomDesc" },
          ].map((v) => (
            <div
              key={v.titleKey}
              className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#3264ff]/30 hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t(v.titleKey)}</h3>
              <p className="text-gray-600 leading-relaxed">{t(v.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ Themes Grid ════════ */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {t("teamCulture.themesTitle")}
              </h2>
              <p className="text-gray-600">{t("teamCulture.themesSubtitle")}</p>
            </div>
            <Link
              href="/team-culture/themes"
              className="hidden md:inline-flex items-center text-[#3264ff] hover:text-[#1e4dcc] font-medium"
            >
              {t("teamCulture.viewAll")}
            </Link>
          </div>
          {themes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏛️</div>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                {t("teamCulture.themesEmptyHint")}
              </p>
              <a
                href="#inquiry"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#3264ff] text-white rounded-lg font-semibold hover:bg-[#1e4dcc] transition-all"
              >
                {t("teamCulture.ctaInquiry")} →
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((th) => (
                <TeamThemeCard key={th.id} theme={th} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ Industries Tabs ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t("teamCulture.industriesTitle")}
          </h2>
          <p className="text-gray-600">{t("teamCulture.industriesSubtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {INDUSTRIES.map((i) => (
            <button
              key={i.key}
              onClick={() => setActiveIndustry(i.key)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium transition-all ${
                activeIndustry === i.key
                  ? "bg-[#3264ff] text-white border-[#3264ff] shadow-lg shadow-blue-200"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#3264ff] hover:text-[#3264ff]"
              }`}
            >
              <span>{i.icon}</span>
              {t(i.labelKey)}
            </button>
          ))}
        </div>

        {activeCopy && (
          <div className="max-w-4xl mx-auto p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-100 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-5xl flex-shrink-0">{activeCopy.icon}</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t(activeCopy.labelKey)}</h3>
                <p className="text-gray-700 leading-relaxed text-base lg:text-lg">{t(activeCopy.copyKey)}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ════════ Cases ════════ */}
      {cases.length > 0 && (
        <section id="cases" className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {t("teamCulture.casesTitle")}
              </h2>
              <p className="text-gray-600">{t("teamCulture.casesSubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {cases.map((c) => (
                <TeamCaseCard key={c.id} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ Comparison + Legacy ════════ */}
      <ComparisonTable />

      {/* ════════ Process Timeline ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
          {t("teamCulture.processTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#3264ff]/40 transition-all text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#3264ff] to-[#1e4dcc] text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-200">
                {String(n).padStart(2, "0")}
              </div>
              <div className="text-gray-800 font-medium">{t(`teamCulture.processStep${n}`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ Trust Numbers ════════ */}
      <section className="py-20 bg-gradient-to-br from-[#3264ff] to-[#1e4dcc]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "300+", labelKey: "teamCulture.trustSites" },
            { num: "27+", labelKey: "teamCulture.trustTemples" },
            { num: "12", labelKey: "teamCulture.trustReligions" },
            { num: "100%", labelKey: "teamCulture.trustCustom" },
          ].map((s) => (
            <div key={s.labelKey}>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">{s.num}</div>
              <div className="text-blue-100 text-lg">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ Inquiry Form ════════ */}
      <section id="inquiry" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {t("teamCulture.inquiryTitle")}
            </h2>
            <p className="text-gray-600">{t("teamCulture.inquirySubtitle")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <TeamInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
