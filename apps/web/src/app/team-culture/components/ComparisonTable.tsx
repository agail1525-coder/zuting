"use client";

import { useTranslation } from "@/lib/i18n";

const ROWS = [
  { dimKey: "teamCulture.comparison.dim1", normalKey: "teamCulture.comparison.normal1", zutingKey: "teamCulture.comparison.zuting1" },
  { dimKey: "teamCulture.comparison.dim2", normalKey: "teamCulture.comparison.normal2", zutingKey: "teamCulture.comparison.zuting2" },
  { dimKey: "teamCulture.comparison.dim3", normalKey: "teamCulture.comparison.normal3", zutingKey: "teamCulture.comparison.zuting3" },
  { dimKey: "teamCulture.comparison.dim4", normalKey: "teamCulture.comparison.normal4", zutingKey: "teamCulture.comparison.zuting4" },
  { dimKey: "teamCulture.comparison.dim5", normalKey: "teamCulture.comparison.normal5", zutingKey: "teamCulture.comparison.zuting5" },
  { dimKey: "teamCulture.comparison.dim6", normalKey: "teamCulture.comparison.normal6", zutingKey: "teamCulture.comparison.zuting6" },
  { dimKey: "teamCulture.comparison.dim7", normalKey: "teamCulture.comparison.normal7", zutingKey: "teamCulture.comparison.zuting7" },
];

const LEGACY_CARDS = [
  { icon: "🏛️", titleKey: "teamCulture.legacy.card1Title", descKey: "teamCulture.legacy.card1Desc" },
  { icon: "🌐", titleKey: "teamCulture.legacy.card2Title", descKey: "teamCulture.legacy.card2Desc" },
  { icon: "♾️", titleKey: "teamCulture.legacy.card3Title", descKey: "teamCulture.legacy.card3Desc" },
];

export default function ComparisonTable() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50/40 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full text-[#1e4dcc] text-sm font-semibold mb-6">
            🆚 {t("teamCulture.comparison.kicker")}
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t("teamCulture.comparison.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("teamCulture.comparison.subtitle")}
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-blue-100/50 bg-white">
          {/* Header row */}
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200">
            <div className="col-span-4 lg:col-span-3 px-6 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("teamCulture.comparison.dimension")}
            </div>
            <div className="col-span-4 lg:col-span-4 px-6 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider border-l border-gray-200">
              ❌ {t("teamCulture.comparison.normalLabel")}
            </div>
            <div className="col-span-4 lg:col-span-5 px-6 py-5 text-sm font-bold text-white uppercase tracking-wider bg-gradient-to-r from-[#3264ff] to-[#1e4dcc]">
              ✅ {t("teamCulture.comparison.zutingLabel")}
            </div>
          </div>

          {/* Body rows */}
          {ROWS.map((row, idx) => (
            <div
              key={row.dimKey}
              className={`grid grid-cols-12 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <div className="col-span-4 lg:col-span-3 px-6 py-5 text-sm lg:text-base font-semibold text-gray-900 flex items-center">
                {t(row.dimKey)}
              </div>
              <div className="col-span-4 lg:col-span-4 px-6 py-5 text-sm lg:text-base text-gray-500 border-l border-gray-100 flex items-center leading-snug">
                {t(row.normalKey)}
              </div>
              <div className="col-span-4 lg:col-span-5 px-6 py-5 text-sm lg:text-base text-gray-900 font-medium bg-blue-50/40 border-l border-blue-100 flex items-center leading-snug">
                <span className="text-[#3264ff] mr-2 flex-shrink-0">✦</span>
                {t(row.zutingKey)}
              </div>
            </div>
          ))}
        </div>

        {/* ════════ Legacy / 基业长青 Cards ════════ */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">
              {t("teamCulture.legacy.title")}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("teamCulture.legacy.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {LEGACY_CARDS.map((card) => (
              <div
                key={card.titleKey}
                className="relative p-8 rounded-2xl bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc] text-white shadow-2xl shadow-blue-200 hover:-translate-y-2 transition-all overflow-hidden group"
              >
                {/* Decorative orb */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />

                <div className="relative">
                  <div className="text-5xl mb-4">{card.icon}</div>
                  <h4 className="text-xl lg:text-2xl font-bold mb-3 leading-tight">
                    {t(card.titleKey)}
                  </h4>
                  <p className="text-blue-100 leading-relaxed text-sm lg:text-base">
                    {t(card.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
