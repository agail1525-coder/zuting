"use client";

import { useTranslation } from "@/lib/i18n";

/**
 * ZUTING 文化朝圣五步法
 * 把"祖庭之旅"拆解成可交付、可复用、可迭代的企业文化工程
 */
const STEPS = [
  {
    n: "01",
    icon: "🔍",
    titleKey: "teamCulture.methodology.step1Title",
    subtitleKey: "teamCulture.methodology.step1Subtitle",
    actionsKey: "teamCulture.methodology.step1Actions",
    deliverableKey: "teamCulture.methodology.step1Deliverable",
  },
  {
    n: "02",
    icon: "🗺️",
    titleKey: "teamCulture.methodology.step2Title",
    subtitleKey: "teamCulture.methodology.step2Subtitle",
    actionsKey: "teamCulture.methodology.step2Actions",
    deliverableKey: "teamCulture.methodology.step2Deliverable",
  },
  {
    n: "03",
    icon: "🏛️",
    titleKey: "teamCulture.methodology.step3Title",
    subtitleKey: "teamCulture.methodology.step3Subtitle",
    actionsKey: "teamCulture.methodology.step3Actions",
    deliverableKey: "teamCulture.methodology.step3Deliverable",
  },
  {
    n: "04",
    icon: "📜",
    titleKey: "teamCulture.methodology.step4Title",
    subtitleKey: "teamCulture.methodology.step4Subtitle",
    actionsKey: "teamCulture.methodology.step4Actions",
    deliverableKey: "teamCulture.methodology.step4Deliverable",
  },
  {
    n: "05",
    icon: "♾️",
    titleKey: "teamCulture.methodology.step5Title",
    subtitleKey: "teamCulture.methodology.step5Subtitle",
    actionsKey: "teamCulture.methodology.step5Actions",
    deliverableKey: "teamCulture.methodology.step5Deliverable",
  },
];

export default function MethodologySection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-blue-50/40 to-white overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full text-[#1e4dcc] text-sm font-semibold mb-6">
            ⚡ {t("teamCulture.methodology.kicker")}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t("teamCulture.methodology.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("teamCulture.methodology.subtitle")}
          </p>
        </div>

        {/* 5-Step horizontal timeline (desktop) / vertical (mobile) */}
        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-[88px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-transparent via-[#3264ff]/40 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {STEPS.map((step, idx) => (
              <div
                key={step.n}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-200/50 hover:border-[#3264ff]/40 hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Step number — large gradient */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-5xl font-black bg-gradient-to-br from-[#3264ff] to-[#1e4dcc] bg-clip-text text-transparent leading-none"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {step.n}
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-[#3264ff] font-medium mb-4">
                  {t(step.subtitleKey)}
                </p>

                {/* Actions */}
                <div className="text-sm text-gray-600 leading-relaxed mb-5 min-h-[60px]">
                  {t(step.actionsKey)}
                </div>

                {/* Deliverable badge */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                    {t("teamCulture.methodology.deliverableLabel")}
                  </div>
                  <div className="text-sm font-semibold text-gray-800 leading-snug">
                    📄 {t(step.deliverableKey)}
                  </div>
                </div>

                {/* Hover ring glow */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-[#3264ff]/0 group-hover:ring-[#3264ff]/20 pointer-events-none transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
            <span className="font-semibold text-[#3264ff]">
              {t("teamCulture.methodology.closingHighlight")}
            </span>
            {" — "}
            {t("teamCulture.methodology.closingBody")}
          </p>
        </div>
      </div>
    </section>
  );
}
