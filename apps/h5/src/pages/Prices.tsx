import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

const TOOLS = [
  { key: "calendar", icon: "📅", color: "from-blue-400 to-blue-600" },
  { key: "compare", icon: "⚖️", color: "from-green-400 to-green-600" },
  { key: "alerts", icon: "🔔", color: "from-amber-400 to-amber-600" },
  { key: "trend", icon: "📈", color: "from-purple-400 to-purple-600" },
];

const TIPS = [
  { key: "tip1", icon: "💰" },
  { key: "tip2", icon: "📊" },
  { key: "tip3", icon: "🔔" },
  { key: "tip4", icon: "📉" },
];

export default function Prices() {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("prices.hub.title")} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 mx-4 mt-3 rounded-2xl p-5 text-white">
        <h2 className="text-lg font-bold">{t("prices.hero.tagline")}</h2>
        <p className="text-xs opacity-80 mt-1">{t("prices.hub.subtitle")}</p>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold">{t("prices.stats.routes")}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{t("prices.stats.monitoring")}</p>
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        {TOOLS.map(tool => (
          <button
            key={tool.key}
            onClick={() => { /* Sub-pages not yet available */ }}
            className="bg-white rounded-xl p-4 text-left shadow-sm active:scale-95 transition-transform"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl mb-3`}>
              {tool.icon}
            </div>
            <h3 className="font-semibold text-sm text-gray-900">{t(`prices.hub.${tool.key}`)}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t(`prices.hub.${tool.key}Desc`)}</p>
            <span className="inline-block mt-2 text-xs text-[var(--color-primary)] font-medium">{t("prices.hub.viewNow")}</span>
          </button>
        ))}
      </div>

      {/* Saving tips */}
      <div className="mx-4 mt-5">
        <h3 className="font-semibold text-gray-900 mb-3">{t("prices.savingTips")}</h3>
        <div className="space-y-2">
          {TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-xl p-3 flex items-start gap-3 shadow-sm">
              <span className="text-2xl">{tip.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t(`prices.${tip.key}.title`)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`prices.${tip.key}.desc`)}</p>
              </div>
              <span className="text-xs font-bold text-[var(--color-primary)] bg-blue-50 px-2 py-1 rounded">{t(`prices.${tip.key}.stat`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-4 mt-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">{t("prices.howItWorks")}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-7 h-7 shrink-0 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">{n}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t(`prices.step${n}.title`)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`prices.step${n}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-4 mb-6">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white text-center">
          <h3 className="font-bold">{t("prices.ctaTitle")}</h3>
          <p className="text-xs opacity-80 mt-1">{t("prices.ctaDesc")}</p>
          <button onClick={() => { /* Not yet available */ }} className="mt-3 bg-white text-orange-600 font-semibold text-sm px-5 py-2 rounded-full">
            {t("prices.ctaBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
