import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchTemple, fetchFeaturedRoutes, type Temple, type Route } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import StickyTabBar from "@/components/StickyTabBar";
import InfoCard from "@/components/InfoCard";
import FAQSection from "@/components/FAQSection";
import RouteCarousel from "@/components/RouteCarousel";
import ActionBar from "@/components/ActionBar";

type Tab = "overview" | "routes" | "intro" | "reviews" | "facilities" | "etiquette" | "packing" | "faq";

export default function TempleDetail() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tm, rt] = await Promise.allSettled([
          fetchTemple(id!),
          fetchFeaturedRoutes(6),
        ]);
        if (cancelled) return;
        if (tm.status === "fulfilled") setTemple(tm.value);
        else throw tm.reason;
        if (rt.status === "fulfilled") setRoutes(rt.value);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner size="lg" /></>;
  if (error || !temple) return <><PageHeader title="" /><ErrorState message={error ?? undefined} /></>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("templeDetail.navOverview") },
    { key: "routes", label: t("templeDetail.navRouteBooking") },
    { key: "intro", label: t("templeDetail.navIntro") },
    { key: "reviews", label: t("templeDetail.navReviews") },
    { key: "facilities", label: t("templeDetail.navFacilities") },
    { key: "etiquette", label: t("templeDetail.navEtiquette") },
    { key: "packing", label: t("templeDetail.navPacking") },
    { key: "faq", label: t("templeDetail.navFaq") },
  ];

  const infoItems = [
    temple.foundingDate ? { icon: "🏛️", label: t("templeDetail.foundedTime"), value: temple.foundingDate } : null,
    { icon: "🎫", label: t("templeDetail.openForVisit"), value: t("templeDetail.suggestedDuration") },
    temple.latitude && temple.longitude ? { icon: "📍", label: t("templeDetail.viewMap"), value: `${temple.latitude.toFixed(2)}, ${temple.longitude.toFixed(2)}` } : null,
    { icon: "👔", label: t("templeDetail.dressCode"), value: t("templeDetail.dressCodeDesc") },
  ].filter((x): x is { icon: string; label: string; value: string } => x !== null);

  const facilities = [
    { icon: "🅿️", label: t("templeDetail.parking") },
    { icon: "🚻", label: t("templeDetail.restroom") },
    { icon: "♿", label: t("templeDetail.accessiblePath") },
    { icon: "🍵", label: t("templeDetail.teaRoom") },
    { icon: "📿", label: t("templeDetail.religiousGoods") },
    { icon: "🎙️", label: t("templeDetail.guidedTour") },
  ];

  const accessibilityItems = [
    { icon: "♿", label: t("templeDetail.wheelchairAccess") },
    { icon: "🚻", label: t("templeDetail.accessibleRestroom") },
    { icon: "⠿", label: t("templeDetail.brailleGuide") },
    { icon: "👴", label: t("templeDetail.elderlyFriendly") },
    { icon: "👶", label: t("templeDetail.strollerAccess") },
    { icon: "🤟", label: t("templeDetail.signLanguageTour") },
  ];

  const paymentMethods = [
    { icon: "💚", label: t("templeDetail.wechatPay") },
    { icon: "🔵", label: t("templeDetail.alipay") },
    { icon: "💳", label: t("templeDetail.visa") },
    { icon: "🏦", label: t("templeDetail.unionPay") },
  ];

  const etiquetteCards = [
    { icon: "👔", title: t("templeDetail.dressCode"), desc: t("templeDetail.dressCodeDesc") },
    { icon: "📸", title: t("templeDetail.photoRules"), desc: t("templeDetail.photoRulesDesc") },
    { icon: "🤫", title: t("templeDetail.keepQuiet"), desc: t("templeDetail.keepQuietDesc") },
    { icon: "🙏", title: t("templeDetail.worshipEtiquette"), desc: t("templeDetail.worshipEtiquetteDesc") },
    { icon: "👞", title: t("templeDetail.shoesOff"), desc: t("templeDetail.shoesOffDesc") },
    { icon: "⚠️", title: t("templeDetail.taboos"), desc: t("templeDetail.taboosDesc") },
  ];

  const packingItems = [
    { icon: "🪪", label: t("templeDetail.packingId") },
    { icon: "👟", label: t("templeDetail.packingShoes") },
    { icon: "☀️", label: t("templeDetail.packingSunHat") },
    { icon: "💧", label: t("templeDetail.packingWater") },
    { icon: "👔", label: t("templeDetail.packingClothing") },
    { icon: "📷", label: t("templeDetail.packingCamera") },
    { icon: "☂️", label: t("templeDetail.packingRainGear") },
    { icon: "💰", label: t("templeDetail.packingCash") },
  ];

  // Best visit months: spring/autumn best, summer good, winter average
  const monthRatings = [2, 2, 3, 3, 3, 2, 1, 1, 3, 3, 2, 2]; // 1=average, 2=good, 3=best
  const monthColors = { 3: "bg-green-500", 2: "bg-blue-400", 1: "bg-gray-300" };
  const monthLabels = { 3: t("holysite.bestTime.best"), 2: t("holysite.bestTime.good"), 1: t("holysite.bestTime.average") };

  const faqItems = [
    { question: t("templeDetail.faqHowToReach", { name: temple.name }), answer: t("templeDetail.faqHowToReachAnswer", { name: temple.name, country: temple.country }) },
    { question: t("templeDetail.faqBestTime"), answer: t("templeDetail.faqBestTimeAnswer") },
    { question: t("templeDetail.faqTickets"), answer: t("templeDetail.faqTicketsAnswer") },
    { question: t("templeDetail.faqCeremonies"), answer: t("templeDetail.faqCeremoniesAnswer") },
    { question: t("templeDetail.faqVegetarian"), answer: t("templeDetail.faqVegetarianAnswer") },
  ];

  return (
    <div className="pb-28">
      <PageHeader title={temple.name} transparent />

      {/* Hero */}
      <div className="relative -mt-11">
        {temple.imageUrl ? (
          <img src={temple.imageUrl} alt={temple.name} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl">🏯</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-xl font-bold">{temple.name}</h1>
          {temple.nameEn && <p className="text-sm text-white/70 mt-0.5">{temple.nameEn}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-white/80">{temple.country}</span>
            {temple.religion && (
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: temple.religion.color || "#666" }}
              >
                {temple.religion.symbol} {temple.religion.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Tabs */}
      <StickyTabBar tabs={tabs} activeTab={tab} onTabChange={(k) => setTab(k as Tab)} />

      {/* Tab content */}
      <div className="mt-4">
        {tab === "overview" ? (
          <div>
            {/* Info card */}
            <InfoCard items={infoItems} />

            {/* Description preview */}
            {temple.description && (
              <section className="px-4 mt-5">
                <h2 className="font-bold text-sm text-gray-900 mb-2">{t("templeDetail.templeIntroduction")}</h2>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{temple.description}</p>
                <button onClick={() => setTab("intro")} className="text-xs text-blue-600 mt-1">{t("templeDetail.learnMore")}</button>
              </section>
            )}

            {/* Best visit calendar */}
            <section className="px-4 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("holysite.bestTime.title")}</h3>
              <div className="grid grid-cols-6 gap-2">
                {monthRatings.map((rating, i) => (
                  <div key={i} className="text-center">
                    <div className={`h-8 rounded-lg ${monthColors[rating as keyof typeof monthColors]} flex items-center justify-center`}>
                      <span className="text-[10px] text-white font-medium">{t(`templeDetail.month${i + 1}`)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                {([3, 2, 1] as const).map((level) => (
                  <div key={level} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${monthColors[level]}`} />
                    <span className="text-[10px] text-gray-500">{monthLabels[level]}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick facility icons */}
            <section className="px-4 mt-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">{t("templeDetail.facilitiesAndServices")}</h3>
                <button onClick={() => setTab("facilities")} className="text-xs text-blue-600">{t("templeDetail.viewAll")}</button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {facilities.map((f, i) => (
                  <div key={i} className="flex flex-col items-center flex-shrink-0">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">{f.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Dress reminder */}
            <div className="mx-4 mt-4 bg-amber-50 rounded-xl p-3 flex gap-2 items-start">
              <span className="text-base flex-shrink-0">👔</span>
              <p className="text-xs text-amber-800">{t("templeDetail.dressRequirement")}</p>
            </div>

            {/* Route preview */}
            {routes.length > 0 && (
              <RouteCarousel title={t("templeDetail.recommendedRoutes")} routes={routes} />
            )}

            {/* Journal CTA */}
            <div className="mx-4 mt-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 text-center text-white">
              <h3 className="text-base font-bold">{t("templeDetail.pilgrimJournal")}</h3>
              <p className="text-xs text-white/70 mt-1">{t("templeDetail.recordVisitExperience")}</p>
              <button
                onClick={() => nav("/journals/new")}
                className="mt-3 px-5 py-2 bg-white rounded-full text-sm font-medium text-amber-600 active:opacity-80"
              >
                {t("templeDetail.writeJournal")}
              </button>
            </div>
          </div>
        ) : tab === "routes" ? (
          <div>
            {routes.length === 0 ? (
              <EmptyState icon="🗺️" />
            ) : (
              <RouteCarousel title={t("templeDetail.recommendedRoutes")} routes={routes} />
            )}
            {/* AI CTA */}
            <div className="mx-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-center text-white">
              <h3 className="text-base font-bold">{t("templeDetail.aiPlannerConsult")}</h3>
              <button
                onClick={() => nav("/chat")}
                className="mt-3 px-5 py-2 bg-white rounded-full text-sm font-medium text-blue-600 active:opacity-80"
              >
                {t("templeDetail.aiPlannerConsult")}
              </button>
            </div>
          </div>
        ) : tab === "intro" ? (
          <div className="px-4">
            {temple.description ? (
              <div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{temple.description}</p>
                {temple.religion && (
                  <Link
                    to={`/religions/${temple.religion.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                  >
                    <span>{temple.religion.symbol}</span>
                    <span>{t("templeDetail.sameReligionTemples")}</span>
                    <span className="text-gray-400">›</span>
                  </Link>
                )}
              </div>
            ) : (
              <EmptyState icon="📖" />
            )}
          </div>
        ) : tab === "reviews" ? (
          <div className="px-4">
            <EmptyState icon="⭐" />
          </div>
        ) : tab === "facilities" ? (
          <div className="px-4 space-y-4">
            {/* Facilities grid */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.facilitiesAndServices")}</h3>
              <div className="grid grid-cols-3 gap-3">
                {facilities.map((f, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-3 text-center">
                    <span className="text-2xl">{f.icon}</span>
                    <p className="text-xs text-gray-600 mt-1">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.accessibilityFacilities")}</h3>
              <div className="grid grid-cols-3 gap-3">
                {accessibilityItems.map((item, i) => (
                  <div key={i} className="bg-green-50 rounded-xl p-3 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.supportedPayments")}</h3>
              <div className="grid grid-cols-4 gap-3">
                {paymentMethods.map((pm, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-3 text-center">
                    <span className="text-xl">{pm.icon}</span>
                    <p className="text-[10px] text-gray-600 mt-1">{pm.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "etiquette" ? (
          <div className="px-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.visitEtiquetteGuide")}</h3>
            <div className="space-y-3">
              {etiquetteCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
                  <span className="text-2xl flex-shrink-0">{card.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{card.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === "packing" ? (
          <div className="px-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.packingChecklist")}</h3>
            <div className="space-y-2">
              {packingItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <svg className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* FAQ tab */
          <FAQSection title={t("templeDetail.faq")} items={faqItems} />
        )}
      </div>

      {/* Bottom CTA */}
      <ActionBar
        priceLabel={t("templeDetail.routeStartingPrice")}
        primaryLabel={t("templeDetail.visitTemple")}
        onPrimary={() => setTab("routes")}
        badges={[t("templeDetail.instantConfirm"), t("templeDetail.freeCancellation14"), t("templeDetail.securePayment")]}
      />
    </div>
  );
}
