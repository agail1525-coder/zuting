"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";
import OptimizedImage from "@/components/OptimizedImage";
import type { Merchant } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

/* ─── Type Config ─── */
const TYPE_CONFIG: Record<string, { icon: string; bg: string; text: string; gradient: string }> = {
  RESTAURANT:          { icon: "🍜", bg: "bg-orange-50",  text: "text-orange-700",  gradient: "from-orange-400 to-amber-500" },
  HOTEL:               { icon: "🏨", bg: "bg-purple-50",  text: "text-purple-700",  gradient: "from-purple-400 to-indigo-500" },
  GUIDE:               { icon: "🧭", bg: "bg-green-50",   text: "text-green-700",   gradient: "from-green-400 to-emerald-500" },
  TRANSPORT:           { icon: "🚌", bg: "bg-blue-50",    text: "text-blue-700",    gradient: "from-blue-400 to-cyan-500" },
  TEMPLE_SERVICE:      { icon: "🙏", bg: "bg-red-50",     text: "text-red-700",     gradient: "from-red-400 to-rose-500" },
  SHOPPING:            { icon: "🛍️", bg: "bg-pink-50",    text: "text-pink-700",    gradient: "from-pink-400 to-fuchsia-500" },
  PHOTOGRAPHY:         { icon: "📷", bg: "bg-sky-50",     text: "text-sky-700",     gradient: "from-sky-400 to-blue-500" },
  WELLNESS:            { icon: "🧘", bg: "bg-teal-50",    text: "text-teal-700",    gradient: "from-teal-400 to-cyan-500" },
  CULTURAL_EXPERIENCE: { icon: "🎭", bg: "bg-amber-50",   text: "text-amber-700",   gradient: "from-amber-400 to-yellow-500" },
};

function getTC(type: string) { return TYPE_CONFIG[type] || TYPE_CONFIG.GUIDE; }

/* ─── Sub Components ─── */

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${s} ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

function HeroGallery({ images, alt, fallbackGradient, fallbackIcon }: { images: string[]; alt: string; fallbackGradient: string; fallbackIcon: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
        <span className="text-8xl opacity-60">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0">
        <OptimizedImage key={active} src={images[active]} alt={alt} fill className="object-cover transition-opacity duration-500" />
      </div>
      {images.length > 1 && (
        <>
          {/* Prev / Next controls */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.preventDefault(); setActive((active - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.preventDefault(); setActive((active + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Expand */}
          <button
            type="button"
            aria-label="Open lightbox"
            onClick={(e) => { e.preventDefault(); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white text-xs flex items-center gap-1.5 z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            {active + 1} / {images.length}
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => { e.preventDefault(); setActive(i); }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "bg-white w-6" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button type="button" aria-label="Close" onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={images[active]} alt={alt} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">{active + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ─── Main Component ─── */

interface Props {
  merchant: Merchant | null;
  relatedMerchants: Merchant[];
}

export default function MerchantDetailClient({ merchant, relatedMerchants }: Props) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  // Sticky section nav via IntersectionObserver
  useEffect(() => {
    if (!merchant) return;
    const observers: IntersectionObserver[] = [];
    const sections = ["overview", "services", "location", "faq", "contact"];
    for (const key of sections) {
      const el = sectionRefs.current[key];
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(key); },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [merchant]);

  if (!merchant) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Failed to load merchant</p>
          <Link href="/merchants" className="text-[#0066FF] hover:underline">&larr; Back</Link>
        </div>
      </main>
    );
  }

  const tc = getTC(merchant.type);
  const location = [merchant.province, merchant.city].filter(Boolean).join(" ");
  const yearsActive = Math.max(1, Math.floor((Date.now() - new Date(merchant.createdAt).getTime()) / (365.25 * 24 * 3600 * 1000)));
  const activeServices = (merchant.services || []).filter((s) => s.isActive);
  const minServicePrice = activeServices.length > 0 ? Math.min(...activeServices.map((s) => s.price)) : 0;
  // Build gallery: logo + unique service coverImages (up to 6)
  const galleryImages: string[] = [
    ...(merchant.logo ? [merchant.logo] : []),
    ...activeServices.map((s) => s.coverImage).filter((x): x is string => typeof x === "string" && !!x),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

  const sections = [
    { key: "overview", label: t("merchant.overview") },
    { key: "services", label: t("merchant.services") },
    { key: "location", label: t("merchant.location") },
    { key: "faq", label: t("merchant.faq") },
    { key: "contact", label: t("merchant.contact") },
  ];

  const faqPairs = [
    { q: t("merchant.faq.booking"), a: t("merchant.faq.bookingAnswer") },
    { q: t("merchant.faq.cancel"), a: t("merchant.faq.cancelAnswer") },
    { q: t("merchant.faq.payment"), a: t("merchant.faq.paymentAnswer") },
    { q: t("merchant.faq.group"), a: t("merchant.faq.groupAnswer") },
    { q: t("merchant.faq.language"), a: t("merchant.faq.languageAnswer") },
    { q: t("merchant.faq.safety"), a: t("merchant.faq.safetyAnswer") },
  ];

  function scrollTo(key: string) {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ══════ Hero Header ══════ */}
      <section className="pt-20">
        {/* Cover / Gallery area */}
        <div className="relative h-64 md:h-[28rem] overflow-hidden bg-gray-900">
          <HeroGallery images={galleryImages} alt={merchant.name} fallbackGradient={tc.gradient} fallbackIcon={tc.icon} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Breadcrumb */}
          <div className="absolute top-4 left-4">
            <Link href="/merchants" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs hover:bg-black/50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {t("merchant.allPartners")}
            </Link>
          </div>

          {/* Share */}
          <div className="absolute top-4 right-4">
            <ShareButton title={merchant.name} description={merchant.description || ""} url={typeof window !== "undefined" ? window.location.href : ""} entityType="merchant" entityId={merchant.id} />
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
                  {tc.icon} {t(`merchant.type.${merchant.type}`)}
                </span>
                {merchant.status === "ACTIVE" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {t("merchant.badge.verified")}
                  </span>
                )}
                {merchant.rating >= 4.5 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{t("merchant.badge.topRated")}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{merchant.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating rating={merchant.rating} />
                <span className="text-white/70 text-sm">{merchant.totalOrders}+ {t("merchant.totalOrders")}</span>
                <span className="text-white/70 text-sm">{t("merchant.yearsActive", { years: yearsActive })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6 text-xs text-gray-500 overflow-x-auto">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {t("merchant.trustVerified")}
            </span>
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t("merchant.responseRate")} 98%
            </span>
            {location && (
              <span className="flex items-center gap-1.5 flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {location}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ══════ Sticky Section Nav ══════ */}
      <div ref={navRef} className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {sections.map((sec) => (
              <button
                key={sec.key}
                onClick={() => scrollTo(sec.key)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === sec.key
                    ? "border-[#0066FF] text-[#0066FF]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ Content ══════ */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-28 md:pb-8">

        {/* Host Story Card */}
        <section className="bg-gradient-to-br from-white to-blue-50/60 rounded-2xl border border-blue-100/60 p-5 md:p-6 flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
            {tc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{t("merchant.hostStory")}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{t("merchant.hostStory.verified")}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{merchant.description || t("merchant.hostStory.fallback")}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{t("merchant.yearsActive", { years: yearsActive })}</span>
              <span>· {merchant.totalOrders}+ {t("merchant.totalOrders")}</span>
              <span>· {merchant.rating.toFixed(1)} ★</span>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section ref={(el) => { sectionRefs.current.overview = el; }} id="overview" className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("merchant.overview")}</h2>
          {merchant.description && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{merchant.description}</p>
          )}
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-[#0066FF]">{merchant.rating.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("merchant.ratingLabel")}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#0066FF]">{merchant.totalOrders}+</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("merchant.totalOrders")}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#0066FF]">{activeServices.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("merchant.services")}</div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        {activeServices.length > 0 && (
          <section ref={(el) => { sectionRefs.current.services = el; }} id="services" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("merchant.services")} ({activeServices.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeServices.map((svc) => (
                <div key={svc.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* Service image or gradient */}
                  <div className="h-32 relative">
                    {svc.coverImage ? (
                      <OptimizedImage src={svc.coverImage} alt={svc.name} fill className="object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${tc.gradient} opacity-20`} />
                    )}
                    {/* Badges */}
                    <div className="absolute bottom-2 left-2 flex gap-2">
                      {svc.duration != null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                          {svc.duration >= 60 ? `${Math.floor(svc.duration / 60)}h${svc.duration % 60 ? svc.duration % 60 + "m" : ""}` : `${svc.duration}min`}
                        </span>
                      )}
                      {svc.maxPersons != null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                          Max {svc.maxPersons}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{svc.name}</h3>
                    {svc.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{svc.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-[#0066FF]">¥{Math.round(svc.price / 100)}</span>
                      <button className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors">
                        {t("merchant.inquireNow")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location */}
        <section ref={(el) => { sectionRefs.current.location = el; }} id="location" className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("merchant.location")}</h2>
          {(merchant.province || merchant.city) && (
            <p className="text-gray-600 mb-2">{t("merchant.locatedAt", { province: merchant.province || "", city: merchant.city || "" })}</p>
          )}
          {merchant.address && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div>
                <p className="text-gray-900">{merchant.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066FF] text-sm hover:underline mt-1 inline-block"
                >
                  {t("merchant.viewOnMap")} &rarr;
                </a>
              </div>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section ref={(el) => { sectionRefs.current.faq = el; }} id="faq" className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("merchant.faq")}</h2>
          {faqPairs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </section>

        {/* Contact CTA */}
        <section ref={(el) => { sectionRefs.current.contact = el; }} id="contact" className="hero-bg rounded-xl p-6 md:p-8 text-white">
          <h2 className="text-xl font-bold mb-4">{t("merchant.contact")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {merchant.contactPhone && (
              <a href={`tel:${merchant.contactPhone}`} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t("merchant.phone")}</p>
                  <p className="font-medium">{merchant.contactPhone}</p>
                </div>
              </a>
            )}
            {merchant.contactEmail && (
              <a href={`mailto:${merchant.contactEmail}`} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t("merchant.email")}</p>
                  <p className="font-medium">{merchant.contactEmail}</p>
                </div>
              </a>
            )}
          </div>
          {merchant.address && (
            <div className="flex items-center gap-3 mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-white/60 text-xs">{t("merchant.address")}</p>
                <p className="font-medium">{merchant.address}</p>
              </div>
            </div>
          )}
        </section>

        {/* Related Merchants */}
        {relatedMerchants.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">{t("merchant.relatedMerchants")}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedMerchants.map((m) => {
                const mc = getTC(m.type);
                return (
                  <Link key={m.id} href={`/merchants/${m.id}`} className="group min-w-[240px] flex-shrink-0">
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                      <div className="relative h-32">
                        {m.logo ? (
                          <OptimizedImage src={m.logo} alt={m.name} fill className="object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${mc.gradient} flex items-center justify-center`}>
                            <span className="text-3xl opacity-70">{mc.icon}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 group-hover:text-[#0066FF] line-clamp-1">{m.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={m.rating} size="sm" />
                          <span className="text-xs text-gray-400">{m.totalOrders}+</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ══════ Mobile Sticky CTA Bar ══════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {minServicePrice > 0 ? (
              <>
                <div className="text-xs text-gray-400">{t("merchant.priceFromLabel")}</div>
                <div className="text-xl font-bold text-[#0066FF] leading-tight">{t("merchant.priceFrom", { price: Math.round(minServicePrice / 100) })}</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">{t("merchant.contact")}</div>
            )}
          </div>
          {merchant.contactPhone && (
            <a href={`tel:${merchant.contactPhone}`} aria-label={t("merchant.phone")} className="w-11 h-11 rounded-xl border border-[#0066FF] text-[#0066FF] flex items-center justify-center hover:bg-[#0066FF]/5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </a>
          )}
          <button type="button" onClick={() => scrollTo("services")} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-sm font-semibold shadow-md">
            {t("merchant.inquireNow")}
          </button>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
