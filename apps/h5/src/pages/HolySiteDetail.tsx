import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchHolySite, fetchRoutesBySite, type HolySite, type Route } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import StickyTabBar from "@/components/StickyTabBar";
import ImageGallery from "@/components/ImageGallery";
import InfoCard from "@/components/InfoCard";
import FAQSection from "@/components/FAQSection";
import RouteCarousel from "@/components/RouteCarousel";
import ActionBar from "@/components/ActionBar";

type Tab = "overview" | "routes" | "intro" | "reviews" | "facilities" | "etiquette" | "packing" | "faq";

export default function HolySiteDetail() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<HolySite | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, r] = await Promise.allSettled([
          fetchHolySite(id!),
          fetchRoutesBySite(id!),
        ]);
        if (cancelled) return;
        if (s.status === "fulfilled") setSite(s.value);
        else throw s.reason;
        if (r.status === "fulfilled") setRoutes(r.value);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Reset audio when navigating to a different site
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      setSoundPlaying(false);
    };
  }, [id]);

  const toggleSound = () => {
    if (!site?.soundEffect) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(site.soundEffect);
      audioRef.current.loop = true;
      audioRef.current.onended = () => setSoundPlaying(false);
    }
    if (soundPlaying) {
      audioRef.current.pause();
      setSoundPlaying(false);
    } else {
      audioRef.current.play();
      setSoundPlaying(true);
    }
  };

  if (loading) return <><PageHeader title="" /><LoadingSpinner size="lg" /></>;
  if (error || !site) return <><PageHeader title="" /><ErrorState message={error ?? undefined} /></>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("holysite.nav.overview") },
    { key: "routes", label: t("holysite.nav.routes") },
    { key: "intro", label: t("holysite.nav.intro") },
    { key: "reviews", label: t("holysite.nav.reviews") },
    { key: "facilities", label: t("holysite.nav.facilities") },
    { key: "etiquette", label: t("holysite.nav.etiquette") },
    { key: "packing", label: t("holysite.nav.packing") },
    { key: "faq", label: t("holysite.nav.faq") },
  ];

  const infoItems = [
    { icon: "📍", label: t("holysite.coordinates"), value: `${site.latitude.toFixed(2)}, ${site.longitude.toFixed(2)}` },
    site.utcOffset !== undefined ? { icon: "🕐", label: t("holysite.timezone"), value: `UTC${site.utcOffset >= 0 ? "+" : ""}${site.utcOffset}` } : null,
    site.openingHours ? { icon: "🕰️", label: t("holysite.openingHours"), value: site.openingHours } : null,
    site.ticketPrice ? { icon: "🎫", label: t("holysite.ticket"), value: site.ticketPrice } : null,
    site.bestSeason ? { icon: "🌤️", label: t("holysite.bestSeason"), value: site.bestSeason } : null,
    site.visitDuration ? { icon: "⏱️", label: t("holysite.visitDuration"), value: site.visitDuration } : null,
  ].filter((x): x is { icon: string; label: string; value: string } => x !== null);

  const facilities = [
    { icon: "🅿️", label: t("holysite.facility.parking") },
    { icon: "🚻", label: t("holysite.facility.restroom") },
    { icon: "♿", label: t("holysite.facility.accessible") },
    { icon: "🧳", label: t("holysite.facility.storage") },
    { icon: "🎙️", label: t("holysite.facility.guide") },
    { icon: "📶", label: t("holysite.facility.wifi") },
  ];

  const accessibilityItems = [
    { icon: "♿", label: t("holysite.accessibility.wheelchair") },
    { icon: "🚻", label: t("holysite.accessibility.restroom") },
    { icon: "⠿", label: t("holysite.accessibility.braille") },
    { icon: "👴", label: t("holysite.accessibility.elderly") },
    { icon: "👶", label: t("holysite.accessibility.stroller") },
    { icon: "🤟", label: t("holysite.accessibility.signLang") },
  ];

  const paymentMethods = [
    { icon: "💚", label: t("holysite.payment.wechat") },
    { icon: "🔵", label: t("holysite.payment.alipay") },
    { icon: "💳", label: t("holysite.payment.visa") },
    { icon: "🏦", label: t("holysite.payment.unionpay") },
  ];

  const packingItems = [
    { icon: "🪪", label: t("holysite.packing.passport") },
    { icon: "👟", label: t("holysite.packing.shoes") },
    { icon: "☀️", label: t("holysite.packing.sun") },
    { icon: "💧", label: t("holysite.packing.water") },
    { icon: "👔", label: t("holysite.packing.clothes") },
    { icon: "📷", label: t("holysite.packing.camera") },
    { icon: "☂️", label: t("holysite.packing.rain") },
    { icon: "💰", label: t("holysite.packing.cash") },
  ];

  const faqItems = [
    { question: t("holysite.faq.q1", { name: site.name }), answer: t("holysite.faq.a1", { name: site.name, country: site.country }) },
    { question: t("holysite.faq.q2"), answer: t("holysite.faq.a2") },
    { question: t("holysite.faq.q3"), answer: t("holysite.faq.a3") },
    { question: t("holysite.faq.q4"), answer: t("holysite.faq.a4") },
    { question: t("holysite.faq.q5"), answer: t("holysite.faq.a5") },
    { question: t("holysite.faq.q6"), answer: t("holysite.faq.a6") },
  ];

  const lowestPrice = routes.length > 0 ? Math.min(...routes.filter(r => r.priceFrom > 0).map(r => r.priceFrom)) : 0;

  return (
    <div className="pb-28">
      <PageHeader title={site.name} transparent />

      {/* Hero image */}
      <div className="relative -mt-11">
        {site.imageUrl ? (
          <img src={site.imageUrl} alt={site.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl">⛩️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute bottom-4 left-4 right-16 text-white">
          <h1 className="text-xl font-bold">{site.name}</h1>
          <p className="text-sm text-white/80 mt-0.5">{site.country}</p>
          {site.religion && (
            <span
              className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: site.religion.color || "#666" }}
            >
              {site.religion.symbol} {site.religion.name}
            </span>
          )}
        </div>

        {/* Sound effect button */}
        {site.soundEffect && (
          <button
            onClick={toggleSound}
            aria-label={soundPlaying ? "Pause sound" : "Play sound"}
            aria-pressed={soundPlaying}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:bg-white/30"
          >
            <span className="text-lg" aria-hidden="true">{soundPlaying ? "🔊" : "🔇"}</span>
          </button>
        )}
      </div>

      {/* Rating + Collection bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          {site.reviewStats && site.reviewStats.averageRating > 0 && (
            <>
              <span className="bg-[#3264ff] text-white text-sm font-bold px-2 py-0.5 rounded">
                {site.reviewStats.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                {site.reviewStats.reviewCount} {t("holySites.reviews")}
              </span>
            </>
          )}
        </div>
        {site.collectionCount !== undefined && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {site.collectionCount}
          </span>
        )}
      </div>

      {/* Gallery */}
      {site.galleryImages && site.galleryImages.length > 0 && (
        <ImageGallery images={site.galleryImages} alt={site.name} />
      )}

      {/* Sticky Tabs */}
      <StickyTabBar tabs={tabs} activeTab={tab} onTabChange={(k) => setTab(k as Tab)} />

      {/* Tab content */}
      <div className="mt-4">
        {tab === "overview" ? (
          <div>
            {/* Info card */}
            <InfoCard items={infoItems} />

            {/* Description preview */}
            {site.description && (
              <section className="px-4 mt-5">
                <h2 className="font-bold text-sm text-gray-900 mb-2">{t("holysite.about")}</h2>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{site.description}</p>
                <button onClick={() => setTab("intro")} className="text-xs text-blue-600 mt-1">{t("common.viewAll")}</button>
              </section>
            )}

            {/* Transport preview */}
            {site.transport && (
              <section className="mx-4 mt-4 bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span>🚌</span>{t("holysite.transportTitle")}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{site.transport}</p>
              </section>
            )}

            {/* Tips */}
            {site.tips && site.tips.length > 0 && (
              <section className="px-4 mt-5">
                <h2 className="font-bold text-sm text-gray-900 mb-2">{t("holysite.travelTips")}</h2>
                <ul className="space-y-2">
                  {site.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-[#3264ff] mt-0.5 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Route preview */}
            {routes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between px-4 mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{t("holysite.routesIncluding")}</h3>
                  <button onClick={() => setTab("routes")} className="text-xs text-blue-600">{t("common.viewAll")}</button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
                  {routes.slice(0, 3).map((r) => (
                    <Link key={r.id} to={`/routes/${r.slug}`} className="flex-shrink-0 w-48 rounded-xl overflow-hidden bg-white shadow-sm">
                      {r.coverImage ? (
                        <img src={r.coverImage} alt={r.title} className="w-full h-24 object-cover" />
                      ) : (
                        <div className="w-full h-24 bg-blue-50 flex items-center justify-center text-xl">🗺️</div>
                      )}
                      <div className="p-2">
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{r.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{r.duration}{t("route.days")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick facility icons */}
            <section className="px-4 mt-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">{t("holysite.facilitiesServices")}</h3>
                <button onClick={() => setTab("facilities")} className="text-xs text-blue-600">{t("common.viewAll")}</button>
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
              <p className="text-xs text-amber-800">{t("holysite.dressReminder")}</p>
            </div>
          </div>
        ) : tab === "routes" ? (
          <div>
            {routes.length === 0 ? (
              <EmptyState icon="🗺️" />
            ) : (
              <RouteCarousel title={t("holysite.routesIncluding")} routes={routes} />
            )}
            {/* AI CTA */}
            <div className="mx-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-center text-white">
              <h3 className="text-base font-bold">{t("holysite.cta.aiConsult")}</h3>
              <p className="text-xs text-white/70 mt-1">{t("holysite.askAiPlan", { name: site.name })}</p>
              <button
                onClick={() => nav("/chat")}
                className="mt-3 px-5 py-2 bg-white rounded-full text-sm font-medium text-blue-600 active:opacity-80"
              >
                {t("holysite.cta.aiConsult")}
              </button>
            </div>
          </div>
        ) : tab === "intro" ? (
          <div className="px-4">
            {site.description ? (
              <div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{site.description}</p>
                {/* Same-faith link */}
                {site.religion && (
                  <Link
                    to={`/religions/${site.religion.slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                  >
                    <span>{site.religion.symbol}</span>
                    <span>{t("holysite.relatedSites", { religion: site.religion.name })}</span>
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
            {site.reviewStats && site.reviewStats.reviewCount > 0 ? (
              <div>
                {/* Rating summary */}
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <span className="text-4xl font-bold text-[#3264ff]">{site.reviewStats.averageRating.toFixed(1)}</span>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= Math.round(site.reviewStats!.averageRating) ? "text-yellow-400" : "text-gray-200"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {site.reviewStats.reviewCount} {t("holySites.reviews")}
                  </p>
                </div>

                {/* Traveler types */}
                <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{t("holysite.travelerTypes.title")}</h4>
                  <div className="space-y-2">
                    {[
                      { label: t("holysite.travelerTypes.solo"), pct: 35, color: "bg-blue-500" },
                      { label: t("holysite.travelerTypes.family"), pct: 25, color: "bg-green-500" },
                      { label: t("holysite.travelerTypes.couple"), pct: 20, color: "bg-pink-500" },
                      { label: t("holysite.travelerTypes.friends"), pct: 12, color: "bg-orange-500" },
                      { label: t("holysite.travelerTypes.group"), pct: 8, color: "bg-purple-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-20 flex-shrink-0">{item.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState icon="⭐" />
            )}
          </div>
        ) : tab === "facilities" ? (
          <div className="px-4 space-y-4">
            {/* Facilities grid */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("holysite.facilitiesServices")}</h3>
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
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("holysite.accessibility.title")}</h3>
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
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("holysite.payment.title")}</h3>
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
          <div className="px-4 space-y-3">
            {/* Dress code */}
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👔</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{t("holysite.nav.etiquette")}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t("holysite.dressReminder")}</p>
                </div>
              </div>
            </div>

            {/* Etiquette cards */}
            {[
              { icon: "🙏", title: t("holysite.nav.etiquette"), desc: t("holysite.dressCode") },
              { icon: "📸", title: t("holysite.faq.q6"), desc: t("holysite.faq.a6") },
              { icon: "🔇", title: t("holysite.faq.q5"), desc: t("holysite.faq.a5") },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{card.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : tab === "packing" ? (
          <div className="px-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t("holysite.packing.title")}</h3>
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
          <FAQSection title={t("holysite.nav.faq")} items={faqItems} />
        )}
      </div>

      {/* Bottom CTA */}
      <ActionBar
        priceLabel={t("holysite.cta.routePrice")}
        price={lowestPrice > 0 ? lowestPrice.toLocaleString() : undefined}
        primaryLabel={routes.length > 0 ? t("holysite.cta.bookNow") : t("holysite.cta.explore")}
        onPrimary={() => routes.length > 0 ? setTab("routes") : nav("/chat")}
        badges={[t("holysite.cta.instantConfirm"), t("holysite.cta.freeCancel"), t("holysite.cta.securePayment")]}
      />
    </div>
  );
}
