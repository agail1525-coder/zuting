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
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
          {t("about.title")}
        </h1>
        <p className="text-gray-500 text-lg">{t("about.subtitle")}</p>
      </div>

      <div className="space-y-8">
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
                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
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

        {/* Team */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("about.team.desc")}
          </p>
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

        {/* ICP */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            {t("about.icp")}
          </p>
        </div>
      </div>
    </div>
  );
}
