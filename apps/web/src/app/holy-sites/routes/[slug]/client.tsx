"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import PhotoMosaic from "@/components/PhotoMosaic";
import RouteGalleryBySite from "@/components/RouteGalleryBySite";
import SocialProof from "@/components/SocialProof";
import PriceForecast from "@/components/PriceForecast";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import RouteMap from "@/components/RouteMap";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import MediaTour from "@/components/MediaTour";
import type {
  Route,
  ItineraryDay,
  RouteRelatedPatriarch,
  RouteRelatedTeaching,
} from "@/lib/api";
import { fetchRoutes } from "@/lib/api";

/* ─── static maps ─── */

// Category / difficulty labels resolved via i18n inside components
const CATEGORY_I18N_KEYS: Record<string, string> = {
  ZEN: "routes.category.zen",
  BUDDHIST: "routes.category.buddhist",
  TAOIST: "routes.category.taoist",
  CHRISTIAN: "routes.category.christian",
  ISLAMIC: "routes.category.islamic",
  CROSS_CULTURAL: "routes.category.crossCultural",
  HINDU: "routes.category.hindu",
  JEWISH: "routes.category.jewish",
  CULTURAL_HERITAGE: "routes.category.culturalHeritage",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-50 text-green-600 border-green-200",
  MODERATE: "bg-amber-50 text-amber-600 border-amber-200",
  CHALLENGING: "bg-red-50 text-red-600 border-red-200",
};

const DIFFICULTY_I18N_KEYS: Record<string, string> = {
  EASY: "routes.difficulty.easy",
  MODERATE: "routes.difficulty.moderate",
  CHALLENGING: "routes.difficulty.challenging",
};

function priceModeLabel(mode?: string | null): string {
  switch (mode) {
    case "AA_SHARE": return "AA 制";
    case "CUSTOM": return "团队定制";
    case "FREE": return "免费参与";
    default: return "";
  }
}

const CANCELLATION_POLICY_KEYS = [
  "routeDetail.cancellationFullRefund14",
  "routeDetail.cancellationRefund80",
  "routeDetail.cancellationRefund50",
  "routeDetail.cancellationNoRefund3",
];

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

/* ─── Expandable Description ─── */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  return (
    <div>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
        {expanded || !needsTruncation ? text : text.slice(0, maxLength) + "..."}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 text-[#3264ff] hover:text-[#0052CC] text-sm font-medium transition-colors">
          {expanded ? t("routeDetail.collapse") : t("routeDetail.expandAll")}
        </button>
      )}
    </div>
  );
}

// FAQ_ITEMS are populated with t() inside the component
const FAQ_KEYS = ["howToBook", "customTrip", "whatToPrepare", "groupSize", "mealsIncluded", "cancellation"];

/* ─── FAQAccordion sub-component ─── */

function FAQAccordion() {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqItems = FAQ_KEYS.map((key) => ({
    q: t(`routeDetail.faq${key.charAt(0).toUpperCase() + key.slice(1)}`),
    a: t(`routeDetail.faq${key.charAt(0).toUpperCase() + key.slice(1)}Answer`),
  }));
  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-5">{t("routeDetail.faq")}</h2>
      <div className="divide-y divide-gray-100">
        {faqItems.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="font-medium text-gray-800 group-hover:text-[#3264ff] transition-colors pr-4">
                {item.q}
              </span>
              <span
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  openIdx === i ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {openIdx === i && (
              <p className="pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RouteCulture sub-component — 路线级精准绑定,不再拉全站 religion 聚合 ─── */

function RouteCulture({
  patriarchs,
  teachings,
}: {
  patriarchs?: RouteRelatedPatriarch[] | null;
  teachings?: RouteRelatedTeaching[] | null;
}) {
  const { t } = useTranslation();
  const hasPatriarchs = Array.isArray(patriarchs) && patriarchs.length > 0;
  const hasTeachings = Array.isArray(teachings) && teachings.length > 0;
  if (!hasPatriarchs && !hasTeachings) return null;

  // 合并按 day 分组
  const days = new Set<number>();
  if (hasPatriarchs) patriarchs!.forEach((p) => days.add(p.day));
  if (hasTeachings) teachings!.forEach((tt) => days.add(tt.day));
  const sortedDays = Array.from(days).sort((a, b) => a - b);

  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-5">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {t("routeDetail.relatedCulture")}
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        按行程日程呈现本路线涉及的祖师与经典
      </p>

      <div className="space-y-8">
        {sortedDays.map((day) => {
          const dayPatriarchs = (patriarchs || []).filter((p) => p.day === day);
          const dayTeachings = (teachings || []).filter((tt) => tt.day === day);
          return (
            <section key={day}>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#fff7e6] border border-[#f2c879] text-[#8b6914] text-xs font-semibold">
                  Day {day}
                </span>
                <span className="h-px flex-1 bg-gray-100" />
              </div>

              {dayPatriarchs.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("routeDetail.relatedPatriarchs")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {dayPatriarchs.map((p, i) => (
                      <article
                        key={`${day}-p-${i}`}
                        className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-[#fffdf7] to-white hover:border-[#f2c879] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {p.imageUrl ? (
                            <OptimizedImage
                              src={p.imageUrl}
                              alt={p.name}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full object-cover border border-[#f2c879] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f2c879] to-[#8b6914] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0 shadow-sm">
                              {p.name.slice(0, 1)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-base">{p.name}</p>
                              {p.nameEn && (
                                <p className="text-xs text-gray-400">{p.nameEn}</p>
                              )}
                            </div>
                            {p.dynasty && (
                              <p className="text-xs text-[#8b6914] mt-0.5">{p.dynasty}</p>
                            )}
                            {p.title && (
                              <p className="text-[13px] text-gray-600 mt-1 font-medium">
                                {p.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed mt-3 whitespace-pre-line">
                          {p.bio}
                        </p>

                        {p.quote && (
                          <blockquote className="mt-3 px-3 py-2 border-l-2 border-[#8b6914] bg-[#fff7e6] text-xs text-[#5a4708] italic">
                            "{p.quote}"
                          </blockquote>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            📍 {p.siteName}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {dayTeachings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("routeDetail.relatedTeachings")}
                  </h3>
                  <div className="space-y-3">
                    {dayTeachings.map((tt, i) => (
                      <article
                        key={`${day}-t-${i}`}
                        className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{tt.name}</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-white border border-gray-200 text-[11px] text-gray-500">
                            📍 {tt.relatedSiteName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium mb-2">
                          {tt.originalText}
                        </p>
                        {tt.translationCn && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {tt.translationCn}
                          </p>
                        )}
                        {tt.sourceText && (
                          <p className="text-xs text-gray-400 mt-2">— {tt.sourceText}</p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ─── XiaohongFloat sub-component ─── */

function XiaohongFloat({ routeTitle }: { routeTitle: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#3264ff] text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        title={t("routeDetail.askXiaohong")}
      >
        🤖
      </button>

      {/* Quick panel */}
      {open && (
        <div className="fixed bottom-40 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border border-[#dadfe6] overflow-hidden">
          <div className="bg-[#3264ff] text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">{t("routeDetail.aiRouteAdvisor")}</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm text-gray-600">{t("routeDetail.whatToKnow", { title: routeTitle })}</p>
            <div className="space-y-1.5">
              {[
                t("routeDetail.aiQ1"),
                t("routeDetail.aiQ2"),
                t("routeDetail.aiQ3"),
                t("routeDetail.aiQ4"),
              ].map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(`${t("routeDetail.aiChatAboutRoute", { title: routeTitle })}${q}`)}`}
                  className="block px-3 py-2 text-sm text-[#3264ff] bg-[#3264ff]/5 rounded-lg hover:bg-[#3264ff]/10 transition-colors border border-[#3264ff]/10"
                >
                  {q}
                </Link>
              ))}
            </div>
            <Link
              href={`/chat?q=${encodeURIComponent(t("routeDetail.aiChatDetailRoute", { title: routeTitle }))}`}
              className="block text-center text-sm text-[#3264ff] font-medium mt-2 hover:underline"
            >
              {t("routeDetail.openFullChat")} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── SimilarRoutes sub-component ─── */

function SimilarRoutes({ currentRouteId, category }: { currentRouteId: string; category: string }) {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes({ category, pageSize: 5, sort: "rating" })
      .then((res) => {
        setRoutes(res.items.filter((r) => r.id !== currentRouteId).slice(0, 4));
      })
      .catch(() => {});
  }, [currentRouteId, category]);

  if (routes.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">{t("routeDetail.youMayAlsoLike")}</h2>
        <Link href="/holy-sites#routes" className="text-sm text-[#3264ff] hover:underline">
          {t("routeDetail.viewAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {routes.map((r) => {
          const p = ((r.priceFrom ?? 0) / 100).toLocaleString();
          return (
            <Link key={r.id} href={`/holy-sites/routes/${r.slug}`} className="group block">
              <div className="border border-[#dadfe6] rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  {r.coverImage ? (
                    <OptimizedImage
                      src={r.coverImage}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-5xl opacity-30">🌏</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/30 text-white backdrop-blur-sm">
                      {t("routeDetail.daysNights", { days: r.duration, nights: r.nights })}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#3264ff] transition-colors line-clamp-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.subtitle}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#3264ff]">¥{p}<span className="text-xs font-normal text-gray-400">{t("routeDetail.perPerson")}</span></span>
                    {r.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <span className="text-amber-400">★</span> {r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── P1. Sticky跳转导航栏 ─── */

function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (!visible) return null;

  return (
    <div className="sticky top-[64px] z-30 bg-white border-b border-[#dadfe6] shadow-sm">
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto scrollbar-none">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === s.id ? "border-[#3264ff] text-[#3264ff]" : "border-transparent text-[#8592a6] hover:text-[#0f294d]"
              }`}>{s.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── P2. 热门徽章 ─── */

function PopularityBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff6600]/10 border border-[#ff6600]/20">
      <svg className="w-3 h-3 text-[#ff6600]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
      <span className="text-xs font-bold text-[#ff6600]">{count}+ {t("routeDetail.booked")}</span>
    </span>
  );
}

/* ─── P5. 路线适合人群 (替代硬编码AccessibilityInfo) ─── */

function RouteSuitability({ difficulty, duration }: { difficulty: string; duration: number }) {
  const { t } = useTranslation();

  // 基于难度动态推算
  const difficultyDesc = difficulty === "CHALLENGING"
    ? t("routeDetail.suitChallenging")
    : difficulty === "MODERATE"
      ? t("routeDetail.suitModerate")
      : t("routeDetail.suitEasy");

  const durationDesc = duration >= 7
    ? t("routeDetail.suitLong")
    : duration >= 4
      ? t("routeDetail.suitMedium")
      : t("routeDetail.suitShort");

  const suitItems = [
    {
      available: difficulty !== "CHALLENGING",
      label: t("routeDetail.suitSenior"),
    },
    {
      available: difficulty === "EASY" && duration <= 5,
      label: t("routeDetail.suitFamily"),
    },
    {
      available: true,
      label: t("routeDetail.suitYouth"),
    },
    {
      available: difficulty !== "EASY" || duration >= 5,
      label: t("routeDetail.suitAdvanced"),
    },
  ];

  const diffColor = difficulty === "CHALLENGING" ? "text-red-600 bg-red-50" : difficulty === "MODERATE" ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";

  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-base font-bold text-[#0f294d] mb-3">{t("routeDetail.suitability")}</h2>
      {/* Physical requirement bar */}
      <div className="mb-4 p-3 rounded-lg bg-[#f5f7fa]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#455873]">{t("routeDetail.suitPhysical")}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffColor}`}>
            {DIFFICULTY_I18N_KEYS[difficulty] ? t(DIFFICULTY_I18N_KEYS[difficulty]) : difficulty}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${difficulty === "CHALLENGING" ? "bg-red-500 w-full" : difficulty === "MODERATE" ? "bg-amber-500 w-2/3" : "bg-green-500 w-1/3"}`}
          />
        </div>
        <p className="text-xs text-[#8592a6] mt-2">{difficultyDesc}</p>
      </div>
      {/* Duration rhythm */}
      <div className="mb-4 p-3 rounded-lg bg-[#f5f7fa]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#455873]">{t("routeDetail.suitDuration")}</span>
          <span className="text-xs font-bold text-[#3264ff]">{durationDesc}</span>
        </div>
      </div>
      {/* Who can join */}
      <div className="grid grid-cols-2 gap-2">
        {suitItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {item.available ? (
              <svg className="w-3.5 h-3.5 text-[#00b341] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            )}
            <span className={item.available ? "text-[#0f294d]" : "text-[#8592a6]"}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── KnowBeforeYouGo 出发须知 ─── */

function KnowBeforeYouGo({ difficulty, category }: { difficulty: string; category: string }) {
  const { t } = useTranslation();

  // 基于路线类别选择礼仪文案
  const etiquetteMap: Record<string, string> = {
    ZEN: "routeDetail.kbygEtiquetteZen",
    BUDDHIST: "routeDetail.kbygEtiquetteBuddhist",
    TAOIST: "routeDetail.kbygEtiquetteTaoist",
    CHRISTIAN: "routeDetail.kbygEtiquetteChristian",
    ISLAMIC: "routeDetail.kbygEtiquetteIslamic",
  };
  const etiquetteKey = etiquetteMap[category] ?? "routeDetail.kbygEtiquetteDefault";

  // 基于难度选择体力文案
  const fitnessKey = difficulty === "CHALLENGING"
    ? "routeDetail.kbygFitnessChallenging"
    : difficulty === "MODERATE"
      ? "routeDetail.kbygFitnessModerate"
      : "routeDetail.kbygFitnessEasy";

  const isTempleRoute = category === "ZEN" || category === "BUDDHIST" || category === "TAOIST";

  const sections = [
    { icon: "🙏", title: t("routeDetail.kbygEtiquette"), content: t(etiquetteKey) },
    { icon: "💪", title: t("routeDetail.kbygFitness"), content: t(fitnessKey) },
    { icon: "🎒", title: t("routeDetail.kbygPacking"), content: t("routeDetail.kbygPackingItems") },
    ...(isTempleRoute
      ? [{ icon: "🏯", title: t("routeDetail.kbygTemple"), content: t("routeDetail.kbygTempleDesc") }]
      : []),
  ];

  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-base font-bold text-[#0f294d] mb-4">{t("routeDetail.knowBeforeYouGo")}</h2>
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">{s.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[#0f294d]">{s.title}</p>
              <p className="text-sm text-[#8592a6] mt-1 leading-relaxed">{s.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── P6. 支付方式图标 ─── */

function PaymentMethodIcons() {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] text-[#8592a6] mb-2">{t("routeDetail.supportedPayments")}</p>
      <div className="flex items-center gap-2">
        {[t("routeDetail.wechatPay"), t("routeDetail.alipay"), "Visa", t("routeDetail.unionPay")].map((m) => (
          <span key={m} className="px-2 py-1 bg-[#f5f7fa] rounded text-[10px] text-[#455873] border border-gray-100">{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── P10. 适合人群推荐 (替代硬编码TravelerTypeTags) ─── */

function WhoIsThisFor({ difficulty, category, duration }: { difficulty: string; category: string; duration: number }) {
  const { t } = useTranslation();

  // 基于路线属性动态计算推荐人群
  const personas = [
    {
      icon: "🌱",
      key: "forBeginners",
      match: difficulty === "EASY",
    },
    {
      icon: "🙏",
      key: "forDevotees",
      match: category === "ZEN" || category === "BUDDHIST" || category === "TAOIST",
    },
    {
      icon: "🏛",
      key: "forCulture",
      match: true, // always relevant for pilgrimage
    },
    {
      icon: "📷",
      key: "forPhotography",
      match: duration >= 3,
    },
    {
      icon: "👨‍👩‍👧",
      key: "forFamily",
      match: difficulty === "EASY" && duration <= 5,
    },
    {
      icon: "🧘",
      key: "forSolo",
      match: category === "ZEN" || difficulty === "CHALLENGING",
    },
  ].filter((p) => p.match);

  return (
    <div className="mb-6 p-4 bg-white border border-[#dadfe6] rounded-lg">
      <p className="text-sm font-bold text-[#0f294d] mb-3">{t("routeDetail.whoIsThisFor")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personas.map((p) => (
          <div key={p.key} className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f7fa]">
            <span className="text-xl mt-0.5">{p.icon}</span>
            <div>
              <p className="text-sm font-medium text-[#0f294d]">{t(`routeDetail.${p.key}`)}</p>
              <p className="text-xs text-[#8592a6] mt-0.5">{t(`routeDetail.${p.key}Desc`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── P10. 领队信息卡 (宗教文化感知版) ─── */

function GuideProfile({ religionName, category }: { religionName?: string; category: string }) {
  const { t } = useTranslation();

  // 基于路线类别动态设定领队经验年限和专长
  const isZen = category === "ZEN";
  const years = isZen ? 8 : category === "BUDDHIST" || category === "TAOIST" ? 6 : 5;

  const badges = [
    { label: t("routeDetail.certifiedGuide"), color: "bg-green-50 text-green-600 border-green-100" },
    { label: religionName ? t("routeDetail.guideReligionExp", { religion: religionName }) : t("routeDetail.cultureExpert"), color: "bg-blue-50 text-blue-600 border-blue-100" },
    ...(isZen
      ? [{ label: t("routeDetail.guideTempleCoord"), color: "bg-purple-50 text-purple-600 border-purple-100" }]
      : [{ label: t("routeDetail.firstAidCert"), color: "bg-amber-50 text-amber-600 border-amber-100" }]),
  ];

  return (
    <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-base font-bold text-[#0f294d] mb-4">{t("routeDetail.guideDedicatedTeam")}</h2>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3264ff] to-blue-400 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {isZen ? "禅" : t("routeDetail.guideIcon")}
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#0f294d]">{t("routeDetail.guideLocalExpert")}</p>
          <p className="text-sm text-[#8592a6] mt-0.5">
            {t("routeDetail.guideYearsExp", { years })} · {t("routeDetail.guideBilingual")}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((b) => (
              <span key={b.label} className={`px-2 py-0.5 rounded text-xs border ${b.color}`}>{b.label}</span>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#00b341]" />
              ))}
            </div>
            <span className="text-xs text-[#0f294d] font-medium ml-1">4.9</span>
            <span className="text-xs text-[#8592a6]">· {t("routeDetail.approvalRate")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Itinerary Accordion (可折叠逐日行程) ─── */

function ItineraryAccordion({ itinerary }: { itinerary: ItineraryDay[] }) {
  const { t } = useTranslation();
  // First day expanded by default
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div id="sec-itinerary" className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("routeDetail.dailyItinerary")}</h2>
      <div className="space-y-3">
        {itinerary.map((day, idx) => {
          const isOpen = expandedDays.has(day.day);
          const isLast = idx === itinerary.length - 1;
          return (
            <div key={day.day} className="relative">
              {/* Timeline connector */}
              {!isLast && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#3264ff]/20" />
              )}
              {/* Day header (clickable) */}
              <button
                onClick={() => toggleDay(day.day)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className="relative z-10 w-8 h-8 bg-[#3264ff] rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white text-xs font-bold">{day.day}</span>
                </div>
                <div className="flex-1 flex items-center justify-between py-2">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#3264ff] transition-colors">
                    Day {day.day}: {day.title}
                  </h3>
                  <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </div>
              </button>
              {/* Day content (collapsible) */}
              {isOpen && (
                <div className="ml-11 mt-2 mb-4 space-y-3">
                  {/* Activities as tags */}
                  {day.activities && day.activities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {day.activities.map((act, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Meals & Accommodation in mini cards */}
                  <div className="flex flex-wrap gap-2">
                    {day.meals && day.meals.length > 0 && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100">
                        <span className="text-base">🍽</span>
                        <div className="text-xs text-orange-700">
                          {day.meals.map((m, i) => (
                            <span key={i} className="block">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {day.accommodation && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
                        <span className="text-base">🏨</span>
                        <span className="text-xs text-purple-700">{day.accommodation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── BookingWidget sub-component ─── */

function BookingWidget({ route }: { route: Route }) {
  const { t } = useTranslation();
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const unitPrice = (route.priceFrom ?? 0) / 100;
  const total = unitPrice * guests;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  const formatQuickDate = (d: Date) => d.toISOString().split("T")[0];
  const formatLabel = (d: Date) => t("routeDetail.dateMonthDay", { month: d.getMonth() + 1, day: d.getDate() });

  const quickDates = [
    { label: t("routeDetail.today"), value: formatQuickDate(today), sub: formatLabel(today) },
    { label: t("routeDetail.tomorrow"), value: formatQuickDate(tomorrow), sub: formatLabel(tomorrow) },
    { label: t("routeDetail.dayAfter"), value: formatQuickDate(dayAfter), sub: formatLabel(dayAfter) },
  ];

  return (
    <div className="bg-white border border-[#dadfe6] rounded-lg p-4 md:min-w-[300px]">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">{t("routeDetail.startingPrice")}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          ¥{unitPrice.toLocaleString()}
          <span className="text-base font-normal text-gray-500">{t("routeDetail.perPerson")}</span>
        </p>
        {route.priceMode && (
          <p className="mt-2 inline-block px-3 py-1 rounded-full bg-[#fff7e6] border border-[#f2c879] text-[#8b6914] text-xs font-semibold">
            {priceModeLabel(route.priceMode)}
          </p>
        )}
      </div>

      {/* Quick Date Tabs (Trip.com style) */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">{t("routeDetail.departureDate")}</label>
          <div className="flex gap-2 mb-2">
            {quickDates.map((qd) => (
              <button
                key={qd.value}
                aria-label={`Select date: ${qd.label} ${qd.sub}`}
                onClick={() => { setDate(qd.value); setShowDatePicker(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  date === qd.value
                    ? "bg-[#3264ff] text-white border-[#3264ff]"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#3264ff]/30"
                }`}
              >
                <span className="block">{qd.label}</span>
                <span className={`block text-[10px] mt-0.5 ${date === qd.value ? "text-white/80" : "text-gray-400"}`}>{qd.sub}</span>
              </button>
            ))}
            <button
              aria-label="Open date picker"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                showDatePicker || (date && !quickDates.some(q => q.value === date))
                  ? "bg-[#3264ff] text-white border-[#3264ff]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#3264ff]/30"
              }`}
            >
              <span className="block">{t("routeDetail.pickDate")}</span>
              <span className={`block text-[10px] mt-0.5 ${showDatePicker ? "text-white/80" : "text-gray-400"}`}>▾</span>
            </button>
          </div>
          {showDatePicker && (
            <input
              type="date"
              value={date}
              min={minDateStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3264ff]/30 focus:border-[#3264ff]"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t("routeDetail.travelers")}</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              −
            </button>
            <span className="flex-1 text-center font-semibold text-gray-900">{guests}</span>
            <button
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {guests > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>¥{unitPrice.toLocaleString()} × {t("routeDetail.guestsCount", { count: guests })}</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Link
          href={`/trips/create?route=${route.slug}&date=${date}&guests=${guests}`}
          className="block w-full py-3 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-center transition-colors shadow-[0_4px_20px_rgba(15,41,77,0.12)]"
        >
          {date ? t("routeDetail.bookNow") : t("routeDetail.selectDateToBook")}
        </Link>
        <Link
          href="/chat"
          className="block w-full py-2.5 rounded-xl border border-[#3264ff] text-[#3264ff] hover:bg-[#3264ff]/5 font-medium text-center text-sm transition-colors"
        >
          {t("routeDetail.aiPlannerConsult")}
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <SaveButton entityType="ROUTE" entityId={route.slug ?? route.id} size="md" />
        <ShareButton
          title={route.title}
          description={route.subtitle}
          url={typeof window !== "undefined" ? window.location.href : ""}
          image={route.coverImage ?? undefined}
          entityType="ROUTE"
          entityId={route.slug ?? route.id}
          className="text-sm"
        />
      </div>

      {/* Scarcity indicator */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-600 font-medium">{t("routeDetail.limitedSpots")}</span>
        <span className="text-gray-400">· {t("routeDetail.weekBookings", { count: route.bookCount })}</span>
      </div>

      {/* Points display */}
      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-200">
          🪙 {t("routeDetail.earnPoints", { points: Math.floor(unitPrice * guests * 0.05) })}
        </span>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        {t("routeDetail.freeCancellation14")}
      </p>

      {/* 支付方式 */}
      <PaymentMethodIcons />
    </div>
  );
}

/* ─── main page ─── */

export default function RouteDetailClient({ route }: { route: Route }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-16 pb-24">
        {/* ═══ S1. 面包屑 (白色背景) ═══ */}
        <div className="max-w-[1120px] mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#8592a6]">
              <Link href="/" className="hover:text-[#3264ff]">{t("nav.home")}</Link>
              <span>&gt;</span>
              <Link href="/holy-sites" className="hover:text-[#3264ff]">{t("nav.destinations")}</Link>
              <span>&gt;</span>
              <span className="text-[#0f294d]">{route.title}</span>
            </div>
            <ShareButton title={route.title} description={route.subtitle} url={typeof window !== "undefined" ? window.location.href : ""} image={route.coverImage ?? undefined} entityType="ROUTE" entityId={route.slug ?? route.id} className="text-sm" />
          </div>
        </div>

        {/* ═══ S2. 图片画廊 (白色背景，非暗色Hero) ═══ */}
        <div className="max-w-[1120px] mx-auto px-4 mb-4">
          {route.images && route.images.length > 0 ? (
            <PhotoMosaic images={[...(route.coverImage ? [route.coverImage] : []), ...route.images]} alt={route.title} />
          ) : route.coverImage ? (
            <div className="rounded-xl overflow-hidden h-[370px] relative">
              <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover" priority />
            </div>
          ) : null}
        </div>

        {/* Sticky跳转导航栏 */}
        <SectionNav sections={[
          { id: "sec-info", label: t("routeDetail.navOverview") },
          { id: "sec-desc", label: t("routeDetail.navDescription") },
          { id: "sec-itinerary", label: t("routeDetail.navItinerary") },
          { id: "sec-included", label: t("routeDetail.navCostDetails") },
          { id: "sec-know", label: t("routeDetail.knowBeforeYouGo") },
          { id: "sec-tips", label: t("routeDetail.navTips") },
          { id: "reviews", label: t("routeDetail.navReviews") },
          { id: "sec-faq", label: t("routeDetail.navFaq") },
        ]} />

        {/* ═══ S4. 标题信息区 + 两栏布局 ═══ */}
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── 左侧主内容 ── */}
            <div className="flex-1 min-w-0">
              {/* 标题区 */}
              <div id="sec-info" className="pb-5 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PopularityBadge count={route.bookCount} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#0f294d]">{route.title}</h1>
                  </div>
                  <SaveButton entityType="ROUTE" entityId={route.slug ?? route.id} size="md" />
                </div>{/* end flex items-start */}
                <p className="text-base text-[#8592a6] mt-1">{route.subtitle}</p>
                {route.titleEn && <p className="text-sm text-[#8592a6] mt-0.5">{route.titleEn}</p>}

                {/* 评分+标签行 */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-[#f5f7fa] text-[#455873] rounded text-xs">{CATEGORY_I18N_KEYS[route.category] ? t(CATEGORY_I18N_KEYS[route.category]) : route.category}</span>
                  <span className={`px-2.5 py-1 rounded text-xs border ${DIFFICULTY_COLORS[route.difficulty] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {DIFFICULTY_I18N_KEYS[route.difficulty] ? t(DIFFICULTY_I18N_KEYS[route.difficulty]) : route.difficulty}
                  </span>
                  {route.rating && (
                    <>
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#3264ff] text-white">{route.rating.toFixed(1)}/5</span>
                      <a href="#reviews" className="text-sm text-[#3264ff] hover:underline">{t("routeDetail.reviewsCount", { count: route.reviewCount })} ▶</a>
                    </>
                  )}
                </div>
              </div>

              {/* S5. 实用信息 (Trip.com紧凑列表) */}
              <div className="py-4 border-b border-[#dadfe6] space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  <span className="font-medium">{t("routeDetail.duration")}:</span> {route.duration}{t("routeDetail.days")}{route.nights}{t("routeDetail.nights")}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M8.34 15.66l-1.41 1.41m12.14 0-1.41-1.41M8.34 8.34 6.93 6.93" /></svg>
                  <span className="font-medium">{t("routeDetail.bestSeason")}:</span> {route.season}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0f294d]">
                  <svg className="w-4 h-4 text-[#8592a6] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  <span className="font-medium">{t("routeDetail.groupSize")}:</span> {route.groupSize}
                </div>
              </div>

          {/* ========== Religion Affiliation ========== */}
          {route.religion && (
            <div className="mt-4 bg-white border border-[#dadfe6] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${route.religion.color ?? "#3264ff"}15` }}
                >
                  {RELIGION_ICONS[route.religion.name] ?? "🙏"}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("routeDetail.faithSystem")}</p>
                  <Link
                    href={`/religions/${route.religion.slug}`}
                    className="font-semibold text-gray-900 hover:text-[#3264ff] transition-colors"
                  >
                    {route.religion.name}
                    <span className="text-sm text-gray-400 ml-2">{route.religion.nameEn}</span>
                  </Link>
                </div>
                <Link
                  href={`/religions/${route.religion.slug}`}
                  className="ml-auto text-sm text-[#3264ff] hover:underline"
                >
                  {t("routeDetail.learnMore")} →
                </Link>
              </div>
            </div>
          )}

          {/* ========== Highlights ========== */}
          <div className="flex flex-wrap gap-2 mt-6">
            {(route.highlights ?? []).map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 bg-[#3264ff]/5 text-[#3264ff] rounded-full text-sm font-medium border border-[#3264ff]/20"
              >
                {h}
              </span>
            ))}
          </div>

          {/* ========== 专业领队信息 (宗教感知) ========== */}
          <GuideProfile religionName={route.religion?.name} category={route.category} />

          {/* ========== Price Forecast (mobile visible too) ========== */}
          <div className="mt-6">
            <PriceForecast routeId={route.slug ?? route.id} currentPrice={(route.priceFrom ?? 0) / 100} />
          </div>

          {/* ========== Description ========== */}
          <div id="sec-desc" className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t("routeDetail.routeDescription")}</h2>
            <ExpandableText text={route.description} maxLength={300} />
          </div>

          {/* ========== Social Proof ========== */}
          <div className="mt-6">
            <SocialProof entityType="ROUTE" entityId={route.slug ?? route.id} variant="banner" />
          </div>

          {/* ========== Interactive Route Map ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t("routeDetail.routeMap")}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {t("routeDetail.mapSummary", { sites: route.sites.length, days: route.duration, nights: route.nights })}
              </p>
              <RouteMap sites={route.sites} height="400px" />
            </div>
          )}

          {/* ========== Image Gallery (按站分组,优先 coverGallery,回退 Mosaic) ========== */}
          {route.coverGallery && route.coverGallery.some((g) => g.siteName) ? (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("routeDetail.photoGallery")}</h2>
              <RouteGalleryBySite
                gallery={route.coverGallery}
                coverImage={route.coverImage}
                routeTitle={route.title}
              />
            </div>
          ) : route.images && route.images.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-[#0f294d] mb-3">{t("routeDetail.photoGallery")}</h2>
              <PhotoMosaic images={route.images} alt={route.title} />
            </div>
          ) : null}

          {/* ========== Multimedia Tour ========== */}
          <div className="mt-6">
            <MediaTour entityType="ROUTE" entityId={route.id} />
          </div>

          {/* ========== Itinerary (可折叠手风琴+卡片化) ========== */}
          <ItineraryAccordion itinerary={(route.itinerary ?? []) as ItineraryDay[]} />

          {/* ========== Included / Excluded ========== */}
          <div id="sec-included" className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t("routeDetail.included")}</h2>
              <ul className="space-y-2">
                {(route.included ?? []).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t("routeDetail.excluded")}</h2>
              <ul className="space-y-2">
                {(route.excluded ?? []).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-red-400">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ========== Cancellation Policy (红绿灯视觉) ========== */}
          <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
            <h2 className="text-base font-bold text-[#0f294d] mb-3">{t("routeDetail.cancellationPolicy")}</h2>
            <div className="space-y-3">
              {/* Green: full refund */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50 border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">{t("routeDetail.cancellationGreen")}</p>
                  <p className="text-xs text-green-600">{t(CANCELLATION_POLICY_KEYS[0])}</p>
                </div>
              </div>
              {/* Yellow: partial refund */}
              {CANCELLATION_POLICY_KEYS.slice(1, 3).map((key, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">{t("routeDetail.cancellationYellow")}</p>
                    <p className="text-xs text-amber-600">{t(key)}</p>
                  </div>
                </div>
              ))}
              {/* Red: no refund */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50 border border-red-100">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">{t("routeDetail.cancellationRed")}</p>
                  <p className="text-xs text-red-600">{t(CANCELLATION_POLICY_KEYS[3])}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              {t("routeDetail.cancellationForceNote")}
            </p>
          </div>

          {/* ========== 路线适合人群 (动态) ========== */}
          <RouteSuitability difficulty={route.difficulty} duration={route.duration} />

          {/* ========== 出发须知 (KnowBeforeYouGo) ========== */}
          <div id="sec-know">
            <KnowBeforeYouGo difficulty={route.difficulty} category={route.category} />
          </div>

          {/* ========== Tips ========== */}
          {(route.tips ?? []).length > 0 && (
            <div id="sec-tips" className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h2 className="text-lg font-bold text-amber-600 mb-3">{t("routeDetail.travelTips")}</h2>
              <ul className="space-y-2">
                {(route.tips ?? []).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ========== Related Sites (带图片+宗教色彩) ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-6 bg-white border border-[#dadfe6] rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t("routeDetail.sitesAlong")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {route.sites.map((rs) => (
                  <Link
                    key={rs.id}
                    href={`/holy-sites/${rs.site?.id}`}
                    className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-[#3264ff]/30 hover:shadow-md transition-all duration-300"
                  >
                    {/* Site image */}
                    <div className="relative h-28 overflow-hidden">
                      {rs.site.imageUrl ? (
                        <OptimizedImage
                          src={rs.site.imageUrl}
                          alt={rs.site.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl opacity-30">🏛</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#3264ff] text-white shadow-sm">
                          D{rs.day}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-[#3264ff] transition-colors">{rs.site.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {rs.site.nameEn} · {rs.site.country}
                      </p>
                      {rs.duration && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{rs.duration}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ========== Related Culture (路线级精准绑定,按 Day 分组) ========== */}
          <RouteCulture
            patriarchs={route.relatedPatriarchs}
            teachings={route.relatedTeachings}
          />

          {/* ========== Pilgrim Journals ========== */}
          <div className="mt-6 bg-gradient-to-r from-[#3264ff]/5 to-blue-50 rounded-lg p-4 border border-[#3264ff]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t("routeDetail.pilgrimJournals")}</h2>
                  <p className="text-sm text-gray-500">{t("routeDetail.pilgrimJournalsDesc")}</p>
                </div>
              </div>
              <Link
                href="/journals"
                className="px-4 py-2 rounded-xl bg-[#3264ff] text-white text-sm font-medium hover:bg-[#0052CC] transition-colors shadow-sm"
              >
                {t("routeDetail.viewJournals")}
              </Link>
            </div>
          </div>

          {/* ========== Reviews (UGC) ========== */}
          <div id="reviews" className="mt-10">
            <WhoIsThisFor difficulty={route.difficulty} category={route.category} duration={route.duration} />
            <ReviewSection targetType="ROUTE" targetId={route.id} />
          </div>

          {/* ========== FAQ Accordion ========== */}
          <div id="sec-faq">
            <FAQAccordion />
          </div>

          {/* ========== Q&A Section ========== */}
          <div className="mt-10">
            <QASection entityType="ROUTE" entityId={route.id} />
          </div>

          {/* ========== Similar Routes ========== */}
          <SimilarRoutes currentRouteId={route.id} category={route.category} />

            </div>{/* end left column */}

            {/* ── 右侧Sticky BookingWidget (桌面端) ── */}
            <div className="hidden lg:block w-[340px] flex-shrink-0">
              <div className="sticky top-20">
                <BookingWidget route={route} />
              </div>
            </div>
          </div>{/* end flex row */}
        </div>{/* end max-w container */}

        {/* 移动端粘性底栏 */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-3" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.08)" }}>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#0f294d]">¥{((route.priceFrom ?? 0) / 100).toLocaleString()}<span className="text-sm font-normal text-[#8592a6]">{t("routeDetail.perPerson")}</span></p>
            {route.priceMode && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#fff7e6] border border-[#f2c879] text-[#8b6914] text-[10px] font-semibold">
                {priceModeLabel(route.priceMode)}
              </span>
            )}
          </div>
          <Link
            href={`/trips/create?route=${route.slug}`}
            className="px-6 py-2.5 bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold rounded-lg text-sm transition-colors"
          >
            {t("routeDetail.bookNow")}
          </Link>
        </div>
      </main>
      {/* Xiaohong AI Floating Widget */}
      <XiaohongFloat routeTitle={route.title} />
      <MobileNav />
    </div>
  );
}
