import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import {
  fetchReligion,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchTeachings,
  fetchFeaturedRoutes,
  type Religion,
  type HolySite,
  type Temple,
  type Patriarch,
  type Teaching,
  type Route,
} from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import StickyTabBar from "@/components/StickyTabBar";
import FAQSection from "@/components/FAQSection";
import RouteCarousel from "@/components/RouteCarousel";

type Tab = "overview" | "sites" | "temples" | "patriarchs" | "teachings";

export default function ReligionDetail() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [religion, setReligion] = useState<Religion | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [sites, setSites] = useState<HolySite[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [counts, setCounts] = useState({ sites: 0, temples: 0, patriarchs: 0, teachings: 0 });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReligion(slug!);
        if (cancelled) return;
        setReligion(r);
        // Parallel load counts + routes
        const [s, tm, p, tc, rt] = await Promise.allSettled([
          fetchHolySites(r.id),
          fetchTemples(r.id),
          fetchPatriarchs(r.id),
          fetchTeachings(r.id),
          fetchFeaturedRoutes(6),
        ]);
        if (cancelled) return;
        const sitesData = s.status === "fulfilled" ? s.value : [];
        const templesData = tm.status === "fulfilled" ? tm.value : [];
        const patriarchsData = p.status === "fulfilled" ? p.value : [];
        const teachingsData = tc.status === "fulfilled" ? tc.value : [];
        setSites(sitesData);
        setTemples(templesData);
        setPatriarchs(patriarchsData);
        setTeachings(teachingsData);
        setCounts({
          sites: sitesData.length,
          temples: templesData.length,
          patriarchs: patriarchsData.length,
          teachings: teachingsData.length,
        });
        if (rt.status === "fulfilled") setRoutes(rt.value);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const loadTab = useCallback(async (newTab: Tab) => {
    if (!religion) return;
    setTab(newTab);
    if (newTab === "overview") return;
    // Data already loaded on mount
  }, [religion]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner size="lg" /></>;
  if (error || !religion) return <><PageHeader title="" /><ErrorState message={error ?? undefined} /></>;

  const tabs = [
    { key: "overview" as Tab, label: t("religion.sectionContent") },
    { key: "sites" as Tab, label: `${t("nav.holySites")} (${counts.sites})` },
    { key: "temples" as Tab, label: `${t("nav.temples")} (${counts.temples})` },
    { key: "patriarchs" as Tab, label: `${t("nav.patriarchs")} (${counts.patriarchs})` },
    { key: "teachings" as Tab, label: `${t("nav.teachings")} (${counts.teachings})` },
  ];

  const color = religion.color || "#0066FF";

  const faqItems = [
    { question: t("religions.faq1Q"), answer: t("religions.faq1A") },
    { question: t("religions.faq2Q"), answer: t("religions.faq2A") },
    { question: t("religions.faq3Q"), answer: t("religions.faq3A") },
    { question: t("religions.faq4Q"), answer: t("religions.faq4A") },
  ];

  const features = [
    { icon: "📖", title: t("religions.featureCulture"), desc: t("religions.featureCultureDesc") },
    { icon: "🌍", title: t("religions.featureNetwork"), desc: t("religions.featureNetworkDesc", { countries: "30+", sites: String(counts.sites) }) },
    { icon: "🗺️", title: t("religions.featureRoutes"), desc: t("religions.featureRoutesDesc") },
  ];

  return (
    <div className="pb-20">
      <PageHeader title={religion.name} />

      {/* Hero */}
      <div
        className="px-4 py-8 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
      >
        <span className="text-5xl">{religion.symbol || "🕊️"}</span>
        <h1 className="text-xl font-bold mt-3">{religion.name}</h1>
        <p className="text-sm text-white/70 mt-1">{religion.nameEn}</p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <span className="text-2xl font-bold">{counts.sites}</span>
            <p className="text-[10px] text-white/60 mt-0.5">{t("nav.holySites")}</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold">{counts.temples}</span>
            <p className="text-[10px] text-white/60 mt-0.5">{t("nav.temples")}</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold">{counts.patriarchs}</span>
            <p className="text-[10px] text-white/60 mt-0.5">{t("nav.patriarchs")}</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold">{counts.teachings}</span>
            <p className="text-[10px] text-white/60 mt-0.5">{t("nav.teachings")}</p>
          </div>
        </div>
      </div>

      {/* Sticky Tabs */}
      <StickyTabBar tabs={tabs} activeTab={tab} onTabChange={(k) => loadTab(k as Tab)} />

      {/* Tab content */}
      <div className="mt-4">
        {tabLoading ? (
          <div className="px-4"><LoadingSpinner /></div>
        ) : tab === "overview" ? (
          /* ─── Overview Tab ─── */
          <div>
            {/* Feature cards */}
            <div className="px-4 space-y-3">
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

            {/* Preview: Top holy sites */}
            {sites.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between px-4 mb-3">
                  <h3 className="text-base font-bold text-gray-900">{t("nav.holySites")}</h3>
                  <button onClick={() => setTab("sites")} className="text-xs text-blue-600">{t("common.viewAll")}</button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
                  {sites.slice(0, 4).map((s) => (
                    <Link key={s.id} to={`/holy-sites/${s.id}`} className="flex-shrink-0 w-36 rounded-xl overflow-hidden bg-white shadow-sm">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.name} className="w-full h-20 object-cover" />
                      ) : (
                        <div className="w-full h-20 bg-gray-100 flex items-center justify-center text-xl">⛩️</div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{s.name}</p>
                        <p className="text-[10px] text-gray-400">{s.country}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Preview: Top patriarchs */}
            {patriarchs.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between px-4 mb-3">
                  <h3 className="text-base font-bold text-gray-900">{t("nav.patriarchs")}</h3>
                  <button onClick={() => setTab("patriarchs")} className="text-xs text-blue-600">{t("common.viewAll")}</button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
                  {patriarchs.slice(0, 4).map((p) => (
                    <Link key={p.id} to={`/patriarchs/${p.id}`} className="flex-shrink-0 w-28 text-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-full mx-auto object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full mx-auto bg-gray-100 flex items-center justify-center text-xl">🧘</div>
                      )}
                      <p className="text-xs font-semibold text-gray-900 mt-2 line-clamp-1">{p.name}</p>
                      {p.title && <p className="text-[10px] text-gray-400 line-clamp-1">{p.title}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Routes */}
            {routes.length > 0 && (
              <RouteCarousel title={t("religion.exploreRoutes", { name: religion.name })} routes={routes} />
            )}

            {/* FAQ */}
            <FAQSection title={t("religions.faqTitle")} items={faqItems} />

            {/* CTA */}
            <div className="mx-4 mt-6 rounded-xl p-5 text-center text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
            >
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
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium active:opacity-80"
                  style={{ color }}
                >
                  {t("religions.ctaAiPlan")}
                </button>
              </div>
            </div>
          </div>
        ) : tab === "sites" ? (
          <div className="px-4">
            {sites.length === 0 ? (
              <EmptyState icon="⛩️" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sites.map((s) => (
                  <Link key={s.id} to={`/holy-sites/${s.id}`} className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-50">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.name} loading="lazy" className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gray-50 flex items-center justify-center text-xl">⛩️</div>
                    )}
                    <div className="p-2.5">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{s.name}</h3>
                      <p className="text-xs text-gray-500">{s.country}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : tab === "temples" ? (
          <div className="px-4">
            {temples.length === 0 ? (
              <EmptyState icon="🏯" />
            ) : (
              <div className="space-y-3">
                {temples.map((tm) => (
                  <Link key={tm.id} to={`/temples/${tm.id}`} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-50">
                    {tm.imageUrl ? (
                      <img src={tm.imageUrl} alt={tm.name} loading="lazy" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">🏯</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{tm.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{tm.country}</p>
                      {tm.foundingDate && (
                        <p className="text-xs text-gray-400 mt-0.5">{t("templeDetail.foundedIn")} {tm.foundingDate}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : tab === "patriarchs" ? (
          <div className="px-4">
            {patriarchs.length === 0 ? (
              <EmptyState icon="🧘" />
            ) : (
              <div className="space-y-3">
                {patriarchs.map((p) => (
                  <Link key={p.id} to={`/patriarchs/${p.id}`} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-50">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">🧘</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                      {p.title && <p className="text-xs text-gray-500 mt-0.5">{p.title}</p>}
                      {p.dates && <p className="text-[10px] text-gray-400 mt-0.5">{p.dates}</p>}
                      {p.coreTeaching && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.coreTeaching}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-4">
            {teachings.length === 0 ? (
              <EmptyState icon="📜" />
            ) : (
              <div className="space-y-3">
                {teachings.map((tc) => (
                  <Link key={tc.id} to={`/teachings/${tc.id}`} className="block p-4 bg-white rounded-xl shadow-sm border border-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{tc.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{tc.originalText}</p>
                    {tc.sourceText && <p className="text-[10px] text-gray-400 mt-1">— {tc.sourceText}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
