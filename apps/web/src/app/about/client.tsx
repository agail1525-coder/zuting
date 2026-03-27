"use client";

import { useTranslation } from "@/lib/i18n";

export default function AboutClient() {
  const { t } = useTranslation();

  const values = [
    { key: "dialogue" },
    { key: "peace" },
    { key: "digital" },
    { key: "immersive" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          {t("about.title")}
        </h1>
        <p className="text-temple-400 text-lg">{t("about.subtitle")}</p>
      </div>

      <div className="space-y-8">
        {/* Vision */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            {t("about.vision.title")}
          </h2>
          <p className="text-temple-300 leading-relaxed text-lg">
            {t("about.vision.summary").split("{highlight}")[0]}
            <span className="text-gold font-bold">{t("about.vision.highlight")}</span>
            {t("about.vision.summary").split("{highlight}")[1]}
          </p>
          <p className="text-temple-400 leading-relaxed mt-4">
            {t("about.vision.detail")}
          </p>
        </div>

        {/* Core Values */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.key}
                className="bg-temple-900/60 rounded-xl p-6 border border-gold/10"
              >
                <h3 className="text-lg font-semibold text-temple-200 mb-2">
                  {t(`about.values.${v.key}.title`)}
                </h3>
                <p className="text-temple-400 text-sm leading-relaxed">
                  {t(`about.values.${v.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-temple-300 leading-relaxed">
            {t("about.team.desc")}
          </p>
        </div>

        {/* Contact */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            {t("about.contact.title")}
          </h2>
          <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10 space-y-3">
            <p className="text-temple-300">
              <strong className="text-temple-200">{t("about.contact.email")}：</strong>
              contact@zuting.com
            </p>
            <p className="text-temple-300">
              <strong className="text-temple-200">{t("about.contact.address")}：</strong>
              {t("about.contact.addressValue")}
            </p>
            <p className="text-temple-300">
              <strong className="text-temple-200">{t("about.contact.hours")}：</strong>
              {t("about.contact.hoursValue")}
            </p>
          </div>
        </div>

        {/* ICP */}
        <div className="text-center py-4">
          <p className="text-temple-500 text-sm">
            {t("about.icp")}
          </p>
        </div>
      </div>
    </div>
  );
}
