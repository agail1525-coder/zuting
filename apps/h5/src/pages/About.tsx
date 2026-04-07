import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

const STATS = [
  { key: "holySites", count: "60+", icon: "🏛️" },
  { key: "temples", count: "27", icon: "⛩️" },
  { key: "religions", count: "12", icon: "🙏" },
  { key: "languages", count: "7", icon: "🌐" },
  { key: "routes", count: "10+", icon: "🗺️" },
  { key: "platforms", count: "5", icon: "📱" },
];

const VALUES = ["dialogue", "peace", "digital", "immersive"] as const;

const FEATURES = ["map", "ai", "journal", "route", "review", "media"] as const;

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PageHeader title={t("about.title")} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-10 text-center">
        <h1 className="text-white text-2xl font-bold">JOINUS</h1>
        <p className="text-white/80 text-sm mt-2">{t("about.subtitle")}</p>
        <p className="text-white/60 text-xs mt-1">{t("site.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-5">
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.key} className="text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="text-base font-bold text-gray-900 mt-0.5">{s.count}</p>
              <p className="text-[10px] text-gray-400">{t(`about.stats.${s.key}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-2">{t("about.vision.title")}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t("about.vision.summary", { highlight: t("about.vision.highlight") })}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed mt-2">{t("about.vision.detail")}</p>
        </div>
      </div>

      {/* Values */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">{t("about.values.title")}</h3>
          <div className="space-y-3">
            {VALUES.map((v) => (
              <div key={v}>
                <p className="text-sm font-medium text-gray-800">{t(`about.values.${v}.title`)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`about.values.${v}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">{t("about.features.title")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-800">{t(`about.feature.${f}.title`)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t(`about.feature.${f}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-2">{t("about.team.title")}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{t("about.team.desc")}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-3">{t("about.contact.title")}</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("about.contact.email")}</span>
              <span className="text-gray-700">hello@joinus.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("about.contact.address")}</span>
              <span className="text-gray-700">{t("about.contact.addressValue")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("about.contact.hours")}</span>
              <span className="text-gray-700">{t("about.contact.hoursValue")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="px-4 mt-4 flex gap-4 justify-center text-xs">
        <Link to="/privacy" className="text-[var(--color-primary)]">{t("auth.privacyPolicy")}</Link>
        <Link to="/terms" className="text-[var(--color-primary)]">{t("auth.termsOfService")}</Link>
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-4">{t("about.icp")}</p>
      <p className="text-center text-[10px] text-gray-300">v1.0.0</p>
    </div>
  );
}
