"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import HolySiteCard from "@/components/HolySiteCard";
import TempleCard from "@/components/TempleCard";
import PatriarchCard from "@/components/PatriarchCard";
import MobileNav from "@/components/MobileNav";
import ShareButton from "@/components/ShareButton";
import SocialProof from "@/components/SocialProof";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import MediaTour from "@/components/MediaTour";
import type { Religion, HolySite, Temple, Patriarch, Teaching } from "@/lib/api";

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

interface Props {
  religion: Religion;
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  teachings: Teaching[];
}

type Tab = "holySites" | "temples" | "patriarchs" | "teachings";

/* ═══ Sticky跳转导航栏 ═══ */

function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
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
      <div className="max-w-7xl mx-auto px-4">
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

/* ═══ FAQ手风琴 ═══ */

function FAQSection({ religionName, t }: { religionName: string; t: (key: string) => string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: `${religionName}的核心信仰是什么？`, a: `${religionName}有着悠久的历史和深厚的文化传承，其核心教义涵盖了对宇宙、生命和修行的独特理解。详细内容可通过平台的祖训和祖师板块深入了解。` },
    { q: "如何开始了解这个信仰？", a: "建议从浏览相关圣地和祖庭开始，了解信仰的历史脉络。同时可以阅读祖训板块的经典原文，或使用AI规划师获取个性化的学习路径。" },
    { q: "有哪些朝圣路线推荐？", a: "平台提供多条精品朝圣路线，涵盖各大信仰的核心圣地。可以通过路线板块筛选相关路线，或咨询AI规划师获取个性化推荐。" },
    { q: "如何参与社区交流？", a: "欢迎在社区板块发表攻略、提问和分享照片。您也可以在朝圣日志中记录您的参访体验，与其他朝圣者交流心得。" },
  ];
  return (
    <div className="mt-10" id="sec-faq">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("religion.faq")}</h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f7fa] transition-colors">
              <span className="font-medium text-[#0f294d] text-sm pr-4">{faq.q}</span>
              <svg className={`w-4 h-4 text-[#8592a6] shrink-0 transition-transform ${openIdx === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4"><p className="text-sm text-[#455873] leading-relaxed">{faq.a}</p></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 深度内容章节 (起源/发展/大事记/贡献/争议/圣典) ═══ */

function DeepContentSection({ religion, color }: { religion: Religion; color: string }) {
  const hasAnyContent =
    religion.origin ||
    religion.development ||
    (religion.keyEvents && religion.keyEvents.length > 0) ||
    religion.contributions ||
    religion.controversies ||
    (religion.sacredTexts && religion.sacredTexts.length > 0);

  if (!hasAnyContent) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        {/* 起源 */}
        {religion.origin && (
          <section>
            <SectionTitle icon="🌱" label="起源" subLabel="Origin" color={color} />
            <p className="text-gray-700 leading-[1.9] text-base md:text-lg font-serif whitespace-pre-wrap">
              {religion.origin}
            </p>
          </section>
        )}

        {/* 发展 */}
        {religion.development && (
          <section>
            <SectionTitle icon="🌊" label="发展历程" subLabel="Development" color={color} />
            <p className="text-gray-700 leading-[1.9] text-base md:text-lg font-serif whitespace-pre-wrap">
              {religion.development}
            </p>
          </section>
        )}

        {/* 历史大事记 */}
        {religion.keyEvents && religion.keyEvents.length > 0 && (
          <section>
            <SectionTitle icon="📜" label="历史大事记" subLabel="Timeline" color={color} />
            <div className="relative">
              {/* 时间线竖线 */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-0.5"
                style={{ backgroundColor: `${color}30` }}
              />
              <ul className="space-y-6">
                {religion.keyEvents.map((ev, i) => (
                  <li key={i} className="relative pl-8">
                    {/* 时间点 */}
                    <span
                      className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs font-bold tracking-wider mb-1" style={{ color }}>
                      {ev.year}
                    </div>
                    <h4 className="font-serif font-bold text-gray-900 text-lg mb-1">
                      {ev.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{ev.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 贡献 */}
        {religion.contributions && (
          <section>
            <SectionTitle
              icon="✨"
              label="对人类文明的贡献"
              subLabel="Contributions"
              color={color}
            />
            <div
              className="rounded-2xl p-6 md:p-8 border-l-4"
              style={{
                backgroundColor: `${color}08`,
                borderLeftColor: color,
              }}
            >
              <p className="text-gray-700 leading-[1.9] text-base md:text-lg font-serif whitespace-pre-wrap">
                {religion.contributions}
              </p>
            </div>
          </section>
        )}

        {/* 争议与反思 */}
        {religion.controversies && (
          <section>
            <SectionTitle
              icon="⚖️"
              label="争议与反思"
              subLabel="Controversies"
              color={color}
            />
            <div className="rounded-2xl p-6 md:p-8 bg-gray-50 border-l-4 border-gray-400">
              <p className="text-gray-700 leading-[1.9] text-base md:text-lg font-serif whitespace-pre-wrap">
                {religion.controversies}
              </p>
            </div>
          </section>
        )}

        {/* 圣典 */}
        {religion.sacredTexts && religion.sacredTexts.length > 0 && (
          <section>
            <SectionTitle
              icon="📖"
              label="圣典与经文"
              subLabel="Sacred Texts"
              color={color}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {religion.sacredTexts.map((txt, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  <h4 className="font-serif font-bold text-gray-900 text-lg mb-2">
                    {txt.name}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{txt.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  label,
  subLabel,
  color,
}: {
  icon: string;
  label: string;
  subLabel: string;
  color: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{label}</h2>
        <p className="text-xs tracking-widest uppercase" style={{ color }}>
          {subLabel}
        </p>
      </div>
    </div>
  );
}

export default function ReligionDetailClient({
  religion,
  holySites,
  temples,
  patriarchs,
  teachings,
}: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("holySites");
  const color = religion.color ?? "#3264ff";
  const totalItems = holySites.length + temples.length + patriarchs.length + teachings.length;

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: "holySites", label: t("religion.holySites"), count: holySites.length, icon: "🏔️" },
    { key: "temples", label: t("religion.temples"), count: temples.length, icon: "🏛️" },
    { key: "patriarchs", label: t("religion.patriarchs"), count: patriarchs.length, icon: "🧘" },
    { key: "teachings", label: t("religion.teachings"), count: teachings.length, icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Hero Section — 宏大场景图 ========== */}
      <div className="relative h-[560px] md:h-[680px] overflow-hidden">
        {/* 背景大图 */}
        {religion.heroImage ? (
          <img
            src={religion.heroImage}
            alt={religion.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color}, #0f172a)` }}
          />
        )}
        {/* 暗色蒙层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        {/* 色调蒙层 */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-30"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}, transparent 70%)` }}
        />

        <div className="relative h-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/religions" className="hover:text-white transition-colors">
              {t("nav.religions") || "信仰"}
            </Link>
            <span>/</span>
            <span className="text-white">{religion.name}</span>
          </div>

          {religion.symbol && (
            <span className="text-7xl block mb-4 drop-shadow-lg">{religion.symbol}</span>
          )}
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-3 drop-shadow-lg">
            {religion.name}
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-white/90 mb-6">
            {religion.nameEn}
          </p>

          {/* 恢弘标语 */}
          {religion.tagline && (
            <p
              className="max-w-2xl text-lg md:text-xl italic font-serif text-white/95 mb-6 px-4"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              「{religion.tagline}」
            </p>
          )}

          {/* 简介 */}
          {religion.summary && (
            <p className="max-w-3xl text-sm md:text-base leading-relaxed text-white/80 mb-8 px-4">
              {religion.summary}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs md:text-sm">
            {religion.foundedYear && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                <span className="text-white/60">创立:</span>{" "}
                <span className="text-white font-medium">{religion.foundedYear}</span>
              </div>
            )}
            {religion.founder && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                <span className="text-white/60">创始:</span>{" "}
                <span className="text-white font-medium">{religion.founder}</span>
              </div>
            )}
            {religion.followers && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                <span className="text-white/60">信众:</span>{" "}
                <span className="text-white font-medium">{religion.followers}</span>
              </div>
            )}
          </div>

          {/* Share button */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShareButton
              title={religion.name}
              description={religion.tagline ?? `${religion.nameEn} — ${totalItems}项文化遗产`}
              url={typeof window !== "undefined" ? window.location.href : ""}
              entityType="RELIGION"
              entityId={religion.id}
              className="text-sm"
            />
          </div>

          {/* Stats grid */}
          <div className="flex flex-wrap justify-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="text-center group cursor-pointer"
              >
                <span className="text-2xl block mb-1">{tab.icon}</span>
                <p className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                  {tab.count}
                </p>
                <p className="text-white/70 text-sm">{tab.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== 深度内容:起源 / 发展 / 大事记 / 贡献 / 争议 / 圣典 ========== */}
      <DeepContentSection religion={religion} color={color} />

      {/* Sticky跳转导航栏 */}
      <SectionNav sections={[
        { id: "sec-content", label: t("religion.sectionContent") },
        { id: "sec-media", label: t("religion.sectionMedia") },
        { id: "sec-reviews", label: t("religion.sectionReviews") },
        { id: "sec-faq", label: t("religion.sectionFaq") },
      ]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ========== Social Proof ========== */}
        <div className="mb-8">
          <SocialProof entityType="RELIGION" entityId={religion.id} variant="banner" />
        </div>

        {/* ========== Tabs ========== */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "font-semibold shadow-lg border"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
              style={
                activeTab === tab.key
                  ? {
                      backgroundColor: `${color}25`,
                      color,
                      borderColor: `${color}50`,
                      boxShadow: `0 4px 14px ${color}15`,
                    }
                  : undefined
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className="opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* ========== Tab Content ========== */}
        <div id="sec-content">
        {activeTab === "holySites" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {holySites.map((site) => (
              <HolySiteCard key={site.id} site={site} />
            ))}
          </div>
        )}

        {activeTab === "temples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))}
          </div>
        )}

        {activeTab === "patriarchs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patriarchs.map((p) => (
              <PatriarchCard key={p.id} patriarch={p} />
            ))}
          </div>
        )}

        {activeTab === "teachings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachings.map((teaching) => {
              const icon = RELIGION_ICONS[religion.name] ?? "📜";
              return (
                <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 group cursor-pointer h-full flex overflow-hidden hover:shadow-md hover:border-[#3264ff]/20 transition-all">
                    <div
                      className="w-14 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#3264ff] transition-colors mb-2">
                        {teaching.name}
                      </h3>
                      <p className="text-gray-500 text-sm font-serif leading-relaxed line-clamp-3">
                        {teaching.originalText}
                      </p>
                      {teaching.sourceText && (
                        <p className="text-gray-400 text-xs mt-2">— {teaching.sourceText}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        </div>{/* end sec-content */}

        {/* ========== Multimedia Tour ========== */}
        <div id="sec-media" className="mt-10">
          <MediaTour entityType="RELIGION" entityId={religion.id} />
        </div>

        {/* ========== Reviews ========== */}
        <div id="sec-reviews" className="mt-10">
          <ReviewSection targetType="RELIGION" targetId={religion.id} />
        </div>

        {/* ========== Q&A ========== */}
        <div className="mt-10">
          <QASection entityType="RELIGION" entityId={religion.id} />
        </div>

        {/* ========== FAQ ========== */}
        <FAQSection religionName={religion.name} t={t} />

        {/* ========== Bottom CTAs ========== */}
        <div className="text-center mt-12 space-y-4">
          <Link
            href={`/chat?q=${encodeURIComponent(`我想了解${religion.name}的朝圣路线`)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3264ff] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            ✨ {t("religion.exploreRoutes").replace("{name}", religion.name)}
          </Link>
          <div>
            <Link
              href="/religions"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200 inline-block"
            >
              ← {t("detail.backToList") || "返回信仰列表"}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
