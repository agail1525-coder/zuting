"use client";

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import ReligionCard from "@/components/ReligionCard";
import HolySiteCard from "@/components/HolySiteCard";
import StatsCounter from "@/components/StatsCounter";
import QuickActions from "@/components/QuickActions";
import type { Religion, HolySite, Temple, Patriarch, Seal } from "@/lib/api";

const WorldMapDynamic = lazy(() => import("@/components/WorldMapDynamic"));
const OnboardingModal = lazy(() => import("@/components/OnboardingModal"));

interface Props {
  religions: Religion[];
  featuredSites: HolySite[];
  allSites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  seals: Seal[];
}

// Carousel component for featured sites
function FeaturedCarousel({ sites }: { sites: HolySite[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % sites.length);
  }, [sites.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + sites.length) % sites.length);
  }, [sites.length]);

  useEffect(() => {
    if (paused || sites.length <= 1) return;
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next, sites.length]);

  if (sites.length === 0) return null;

  // Show 3 at a time on desktop, 1 on mobile
  const visibleDesktop = 3;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mobile: single card view */}
      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {sites.map((site) => (
              <div key={site.id} className="w-full flex-shrink-0 px-2">
                <HolySiteCard site={site} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: 3-card view */}
      <div className="hidden md:block overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(current % Math.max(sites.length - visibleDesktop + 1, 1)) * (100 / visibleDesktop)}%)`,
          }}
        >
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / visibleDesktop}%` }}
            >
              <HolySiteCard site={site} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {sites.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 w-10 h-10 rounded-full bg-temple-800/90 border border-gold/20 flex items-center justify-center text-gold hover:bg-temple-700 hover:border-gold/40 transition-all z-10"
            aria-label="Previous site"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 w-10 h-10 rounded-full bg-temple-800/90 border border-gold/20 flex items-center justify-center text-gold hover:bg-temple-700 hover:border-gold/40 transition-all z-10"
            aria-label="Next site"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {sites.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-gold w-6" : "bg-temple-600 hover:bg-temple-500"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// How it works step component
function HowItWorksStep({
  step,
  icon,
  title,
  desc,
  delay,
}: {
  step: number;
  icon: string;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div
      className="relative text-center group animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Step number */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gold text-temple-900 text-xs font-bold flex items-center justify-center z-10">
        {step}
      </div>
      <div className="pt-6 pb-8 px-6 rounded-2xl border border-gold/10 bg-temple-800/30 hover:border-gold/25 hover:bg-temple-800/50 transition-all h-full">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-2">{title}</h3>
        <p className="text-temple-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Wisdom quotes for the testimonial section
const WISDOM_QUOTES = [
  {
    text: "千里之行，始于足下。",
    textEn: "A journey of a thousand miles begins with a single step.",
    source: "道德经",
    sourceEn: "Tao Te Ching",
    religion: "道教",
  },
  {
    text: "你们要进窄门。因为引到灭亡，那门是宽的，路是大的。",
    textEn: "Enter through the narrow gate. For wide is the gate that leads to destruction.",
    source: "马太福音 7:13",
    sourceEn: "Matthew 7:13",
    religion: "基督教",
  },
  {
    text: "一切有为法，如梦幻泡影，如露亦如电，应作如是观。",
    textEn: "All conditioned phenomena are like dreams, illusions, bubbles, shadows.",
    source: "金刚经",
    sourceEn: "Diamond Sutra",
    religion: "佛教",
  },
  {
    text: "己所不欲，勿施于人。",
    textEn: "Do not do to others what you would not have them do to you.",
    source: "论语",
    sourceEn: "Analerta",
    religion: "儒教",
  },
];

export default function HomeClient({ religions, featuredSites, allSites, temples, patriarchs, seals }: Props) {
  const { t, locale } = useTranslation();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const isZh = locale === "zh-CN";

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % WISDOM_QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: religions.length, label: t("stats.faiths") },
    { value: allSites.length, label: t("stats.holySites") },
    { value: temples.length, label: t("stats.temples") },
    { value: patriarchs.length, label: t("stats.patriarchs") },
    { value: seals.length, label: t("stats.seals") },
  ];

  const currentQuote = WISDOM_QUOTES[quoteIndex];

  return (
    <div>
      {/* Onboarding Modal (lazy loaded) */}
      <Suspense fallback={null}>
        <OnboardingModal />
      </Suspense>

      {/* Quick Actions floating bar */}
      <QuickActions />

      {/* === HERO SECTION === */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden" aria-label="Hero">
        {/* Layered background for depth */}
        <div className="absolute inset-0 hero-bg" />
        {/* Radial temple light from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(212,168,85,0.12),transparent_70%)]" />
        {/* Top vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(2,6,23,0.8)_100%)]" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-temple-900 to-transparent" />

        {/* Animated light rays */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[800px] bg-[conic-gradient(from_180deg,transparent_40%,rgba(212,168,85,0.04)_50%,transparent_60%)] animate-slow-spin opacity-60" />
        </div>

        {/* Floating sacred symbols */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[8%] text-7xl opacity-[0.04] animate-float select-none">🕌</div>
          <div className="absolute top-[20%] right-[8%] text-6xl opacity-[0.04] animate-float select-none" style={{ animationDelay: "2s" }}>⛩</div>
          <div className="absolute bottom-[25%] left-[12%] text-6xl opacity-[0.04] animate-float select-none" style={{ animationDelay: "4s" }}>☸</div>
          <div className="absolute bottom-[20%] right-[12%] text-7xl opacity-[0.04] animate-float select-none" style={{ animationDelay: "1s" }}>✡</div>
          <div className="absolute top-[45%] left-[5%] text-5xl opacity-[0.04] animate-float select-none" style={{ animationDelay: "3s" }}>☯</div>
          <div className="absolute top-[45%] right-[5%] text-5xl opacity-[0.04] animate-float select-none" style={{ animationDelay: "5s" }}>✝</div>
        </div>

        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Small top label */}
          <div className="mb-6 animate-fade-in-up">
            <span className="inline-block px-5 py-1.5 border border-gold/20 rounded-full text-gold/70 text-sm tracking-[0.3em] uppercase font-sans">
              {`${religions.length} Faiths · ${allSites.length} Holy Sites · ${temples.length} Temples`}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-gradient-gold mb-5 leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {t("hero.headline")}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-temple-200 mb-4 leading-relaxed font-serif animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {t("hero.subtitle")}
          </p>

          {/* Mission statement */}
          <p className="text-base md:text-lg text-temple-400 mb-8 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            {isZh
              ? "跨越文明边界，连接心灵圣地，成为全球宗教文化和平使者"
              : "Cross boundaries of civilizations, connect sacred spaces, become a global peace ambassador"}
          </p>

          {/* Multi-language translations */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm md:text-base text-temple-400/80">
              <span className="font-serif">तीर्थयात्रा</span>
              <span className="text-gold/20">·</span>
              <span>巡礼の旅</span>
              <span className="text-gold/20">·</span>
              <span>الحجّ إلى المعابد</span>
              <span className="text-gold/20">·</span>
              <span>Pilgrimage</span>
              <span className="text-gold/20">·</span>
              <span>מסע אל בתי המקדש</span>
              <span className="text-gold/20">·</span>
              <span>조정순례</span>
              <span className="text-gold/20">·</span>
              <span>Pèlerinage</span>
              <span className="text-gold/20">·</span>
              <span>Паломничество</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link
              href="/holy-sites"
              className="group relative px-10 py-4 bg-gold text-temple-900 font-bold rounded-full text-lg overflow-hidden transition-all shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-105"
            >
              <span className="relative z-10">{isZh ? "探索圣地" : "Explore Sites"}</span>
              <div className="absolute inset-0 bg-gold-light opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/trips"
              className="px-10 py-4 border border-gold/30 text-gold rounded-full hover:bg-gold/10 hover:border-gold/50 transition-all text-lg hover:scale-105"
            >
              {isZh ? "开始旅程" : "Start Journey"}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "1s" }}>
          <span className="text-xs text-temple-500 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent animate-bounce" />
        </div>
      </section>

      {/* === STATS SECTION === */}
      <section className="py-20 px-4" aria-label="Statistics">
        <div className="max-w-5xl mx-auto">
          <StatsCounter stats={stats} />
        </div>
      </section>

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === HOW IT WORKS === */}
      <section className="py-20 px-4" aria-label="How it works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-3">
              {isZh ? "三步开启朝圣之旅" : "3 Steps to Pilgrimage"}
            </h2>
            <p className="text-temple-400 text-lg">
              {isZh ? "简单三步，踏上改变人生的旅途" : "Three simple steps to a life-changing journey"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px bg-gradient-to-r from-gold/5 via-gold/30 to-gold/5" />

            <HowItWorksStep
              step={1}
              icon="🔍"
              title={isZh ? "选择圣地" : "Choose Holy Sites"}
              desc={isZh ? "浏览12大信仰、60处全球圣地，找到与您心灵共鸣的朝圣目的地。" : "Browse 12 faiths, 60 global holy sites, find destinations that resonate with your soul."}
              delay="0s"
            />
            <HowItWorksStep
              step={2}
              icon="📋"
              title={isZh ? "规划行程" : "Plan Your Trip"}
              desc={isZh ? "使用AI助手小鸿规划行程，定制专属朝圣路线和修行计划。" : "Use XiaoHong AI to plan your trip, customize pilgrimage routes and practice plans."}
              delay="0.15s"
            />
            <HowItWorksStep
              step={3}
              icon="🚀"
              title={isZh ? "踏上旅途" : "Begin the Journey"}
              desc={isZh ? "带着祝福出发，用日志记录每一步感悟，获得三十印修行成就。" : "Set off with blessings, journal your insights, earn the Thirty Seals of practice."}
              delay="0.3s"
            />
          </div>

          <div className="text-center mt-12">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-temple-900 font-bold rounded-full text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20 hover:scale-105"
            >
              {isZh ? "立即规划行程" : "Plan Your Trip Now"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === 12 RELIGIONS GRID === */}
      <section className="py-20 px-4" aria-label="Twelve Religions">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-3">
              {t("section.twelveReligions")}
            </h2>
            <p className="text-temple-400 text-lg">
              {isZh ? "纵览人类文明最深邃的精神传统" : "Survey humanity's most profound spiritual traditions"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {religions.map((r, i) => (
              <div
                key={r.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ReligionCard religion={r} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === FEATURED HOLY SITES CAROUSEL === */}
      {featuredSites.length > 0 && (
        <section className="py-20 px-4" aria-label="Featured Holy Sites">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-3">
                {t("section.featuredSites")}
              </h2>
              <p className="text-temple-400 text-lg">
                {isZh ? "精选全球最具灵性的朝圣圣地" : "Curated selection of the world's most sacred pilgrimage sites"}
              </p>
            </div>
            <FeaturedCarousel sites={featuredSites} />
            <div className="text-center mt-10">
              <Link
                href="/holy-sites"
                className="inline-block px-8 py-3 border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition-all"
              >
                {t("section.allHolySites")} →
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === WISDOM QUOTES === */}
      <section className="py-20 px-4" aria-label="Wisdom Quotes">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-12">
            {isZh ? "祖师智慧" : "Wisdom of the Masters"}
          </h2>

          <div className="relative min-h-[200px] flex items-center justify-center">
            <div key={quoteIndex} className="animate-fade-in-up">
              <blockquote className="relative">
                {/* Decorative quote mark */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-gold/10 font-serif select-none">&ldquo;</div>
                <p className="text-2xl md:text-3xl font-serif text-temple-100 leading-relaxed mb-6 pt-4">
                  {isZh ? currentQuote.text : currentQuote.textEn}
                </p>
                <footer className="flex items-center justify-center gap-3">
                  <div className="w-8 h-px bg-gold/30" />
                  <cite className="text-gold not-italic text-sm tracking-wider">
                    {isZh ? currentQuote.source : currentQuote.sourceEn}
                  </cite>
                  <span className="text-temple-600">|</span>
                  <span className="text-temple-500 text-sm">
                    {currentQuote.religion}
                  </span>
                  <div className="w-8 h-px bg-gold/30" />
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Quote navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {WISDOM_QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === quoteIndex ? "bg-gold w-6" : "bg-temple-600 hover:bg-temple-500"
                }`}
                aria-label={`Quote ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === AI ASSISTANT SECTION === */}
      <section className="py-20 px-4" aria-label="AI Assistant">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              AI 智慧助手
            </h2>
            <p className="text-temple-400 mt-2">
              {isZh ? "小鸿 — 您的朝圣旅行导航" : "XiaoHong — Your pilgrimage guide"}
            </p>
          </div>
          <Link
            href="/chat"
            className="block card-glow rounded-2xl bg-temple-800/50 p-6 md:p-8 hover:bg-temple-800/70 transition-all group"
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                🏛
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-gold mb-2">
                  {isZh ? "与小鸿对话" : "Chat with XiaoHong"}
                </h3>
                <p className="text-temple-300 leading-relaxed mb-4">
                  {isZh
                    ? "小鸿熟知全球12大信仰、60处圣地、27座祖庭的文化与历史。无论您想了解朝圣路线、修行方法，还是宗教文化知识，都可以向小鸿请教。"
                    : "XiaoHong knows the culture and history of 12 faiths, 60 holy sites, and 27 ancestral temples worldwide. Ask about pilgrimage routes, practices, or religious culture."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    isZh ? "推荐朝圣路线" : "Pilgrimage Routes",
                    isZh ? "佛教圣地" : "Buddhist Sites",
                    isZh ? "三十印修炼" : "Thirty Seals",
                    isZh ? "今日修行" : "Daily Practice",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full border border-gold/20 text-gold/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <svg
                className="w-6 h-6 text-gold/40 group-hover:text-gold transition-colors shrink-0 mt-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === WORLD MAP PREVIEW === */}
      {allSites.length > 0 && (
        <section className="py-20 px-4" aria-label="World Map">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-3">
                {isZh ? "探索全球圣地地图" : "Explore the Global Map"}
              </h2>
              <p className="text-temple-400 text-lg">
                {isZh ? `${religions.length}大信仰 · ${allSites.length}处圣地 · 遍布全球` : `${religions.length} Faiths · ${allSites.length} Sites · Worldwide`}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gold/10 card-glow mb-8">
              <Suspense
                fallback={
                  <div className="h-[400px] bg-temple-800/50 flex items-center justify-center text-temple-500">
                    {isZh ? "地图加载中..." : "Loading map..."}
                  </div>
                }
              >
                <WorldMapDynamic
                  holySites={allSites}
                  religions={religions}
                  height="400px"
                  interactive={false}
                />
              </Suspense>
            </div>
            <div className="text-center">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-temple-900 font-bold rounded-full text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {isZh ? "探索全球圣地地图" : "Explore the Map"}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="divider-gold max-w-4xl mx-auto" />

      {/* === CTA BANNER: Peace Ambassador === */}
      <section className="py-24 px-4 relative overflow-hidden" aria-label="Join Us">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(212,168,85,0.06),transparent_70%)]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="text-5xl mb-6">🕊</div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gradient-gold mb-4 leading-tight">
            {isZh ? "加入我们" : "Join Us"}
          </h2>
          <h3 className="text-xl md:text-2xl font-serif text-temple-200 mb-6">
            {isZh ? "成为全球宗教文化和平使者" : "Become a Global Peace Ambassador"}
          </h3>
          <p className="text-temple-300 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {isZh
              ? "从规划到出发，从朝圣到省思——让每一次旅程都成为心灵的修行，让每一步都为世界和平贡献力量。"
              : "From planning to departure, from pilgrimage to reflection - let every journey be a spiritual practice, every step a contribution to world peace."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-10 py-4 bg-gold text-temple-900 font-bold rounded-full text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20 hover:scale-105"
            >
              {isZh ? "立即注册" : "Register Now"}
            </Link>
            <Link
              href="/journals"
              className="px-10 py-4 border border-gold/30 text-gold rounded-full text-lg hover:bg-gold/10 hover:border-gold/50 transition-all hover:scale-105"
            >
              {isZh ? "阅读朝圣日记" : "Read Pilgrim Journals"}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-temple-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gold">{religions.length}</span>
              <span>{isZh ? "大信仰" : "Faiths"}</span>
            </div>
            <div className="w-px h-4 bg-temple-700" />
            <div className="flex items-center gap-2">
              <span className="text-gold">{allSites.length}</span>
              <span>{isZh ? "处圣地" : "Holy Sites"}</span>
            </div>
            <div className="w-px h-4 bg-temple-700" />
            <div className="flex items-center gap-2">
              <span className="text-gold">{seals.length}</span>
              <span>{isZh ? "枚修行印" : "Practice Seals"}</span>
            </div>
            <div className="w-px h-4 bg-temple-700" />
            <div className="flex items-center gap-2">
              <span className="text-gold">7</span>
              <span>{isZh ? "种语言" : "Languages"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
