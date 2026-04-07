import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  type Religion,
} from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import FAQSection from "@/components/FAQSection";

export default function Religions() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [stats, setStats] = useState({ sites: 0, temples: 0, patriarchs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rels, sites, temples, patriarchs] = await Promise.allSettled([
        fetchReligions(),
        fetchHolySites(),
        fetchTemples(),
        fetchPatriarchs(),
      ]);
      if (rels.status === "fulfilled") setReligions(rels.value);
      setStats({
        sites: sites.status === "fulfilled" ? sites.value.length : 0,
        temples: temples.status === "fulfilled" ? temples.value.length : 0,
        patriarchs: patriarchs.status === "fulfilled" ? patriarchs.value.length : 0,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (religions.length === 0) return <EmptyState icon="🕊️" />;

  const features = [
    { icon: "📖", title: t("religions.featureCulture"), desc: t("religions.featureCultureDesc") },
    { icon: "🌍", title: t("religions.featureNetwork"), desc: t("religions.featureNetworkDesc", { countries: "30+", sites: String(stats.sites) }) },
    { icon: "🗺️", title: t("religions.featureRoutes"), desc: t("religions.featureRoutesDesc") },
  ];

  const faqItems = [
    { question: t("religions.faq1Q"), answer: t("religions.faq1A") },
    { question: t("religions.faq2Q"), answer: t("religions.faq2A") },
    { question: t("religions.faq3Q"), answer: t("religions.faq3A") },
    { question: t("religions.faq4Q"), answer: t("religions.faq4A") },
  ];

  return (
    <div className="pb-6">
      {/* Hero with stats */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#4400CC] px-4 pt-8 pb-6 text-white">
        <p className="text-[10px] text-white/50 uppercase tracking-widest">{t("religions.heroSubtag")}</p>
        <h1 className="text-lg font-bold mt-1">{t("religions.heroTitle")}</h1>
        <p className="text-xs text-white/70 mt-1 leading-relaxed">{t("religions.heroDesc")}</p>

        {/* Stats row */}
        <div className="flex justify-between mt-5 bg-white/10 rounded-xl p-3">
          {[
            { value: religions.length, label: t("religions.statFaiths") },
            { value: stats.sites, label: t("religions.statSites") },
            { value: stats.temples, label: t("religions.statTemples") },
            { value: stats.patriarchs, label: t("religions.statPatriarchs") },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <span className="text-lg font-bold">{s.value}</span>
              <p className="text-[10px] text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="px-4 mt-4 space-y-3">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
            <span className="text-2xl flex-shrink-0">{f.icon}</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Religion Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">{t("religions.heroTitle")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {religions.map((r) => (
            <Link
              key={r.id}
              to={`/religions/${r.slug}`}
              className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-50"
            >
              <div
                className="h-20 flex items-center justify-center text-3xl"
                style={{ background: `linear-gradient(135deg, ${r.color || "#0066FF"}22, ${r.color || "#0066FF"}08)` }}
              >
                {r.symbol || "🕊️"}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900">{r.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{r.nameEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <FAQSection title={t("religions.faqTitle")} items={faqItems} />

      {/* CTA */}
      <div className="mx-4 mt-6 rounded-xl p-5 text-center text-white bg-gradient-to-r from-[#0066FF] to-[#4400CC]">
        <h3 className="text-base font-bold">{t("religions.ctaTitle")}</h3>
        <p className="text-xs text-white/70 mt-1">{t("religions.ctaDesc")}</p>
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => nav("/routes")}
            className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium active:bg-white/30"
          >
            {t("religions.ctaBrowseRoutes")}
          </button>
          <button
            onClick={() => nav("/chat")}
            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#0066FF] active:opacity-80"
          >
            {t("religions.ctaAiPlan")}
          </button>
        </div>
      </div>
    </div>
  );
}
