import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

export default function MapPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("map.title")} />

      <div className="flex flex-col items-center justify-center px-6 pt-20">
        {/* Globe illustration */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
          <span className="text-6xl">🌍</span>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">{t("map.title")}</h2>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-2">
          {t("map.placeholder")}
        </p>
        <p className="text-xs text-gray-400 text-center mb-2">
          {t("map.placeholderDesc")}
        </p>
        <p className="text-xs text-amber-500 mb-6">{t("common.comingSoon")}</p>

        {/* Stats row */}
        <div className="flex gap-6 mb-8">
          {[
            { icon: "🏛️", label: t("map.statSites"), count: "300+" },
            { icon: "⛩️", label: t("map.statTemples"), count: "27" },
            { icon: "🌐", label: t("map.statCountries"), count: "30+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-sm font-bold text-gray-900 mt-1">{s.count}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => nav("/holy-sites")}
          className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium"
        >
          {t("map.exploreList")}
        </button>
      </div>
    </div>
  );
}
