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
import type { Religion, HolySite, Temple, Patriarch, Teaching, ReligionBusinessCases } from "@/lib/api";

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
    { q: `${religionName}的核心文化智慧是什么？`, a: `${religionName}有着悠久的历史和深厚的文化传承，其核心教义涵盖了对宇宙、生命和修行的独特理解。详细内容可通过平台的祖训和祖师板块深入了解。` },
    { q: "如何开始了解这个文化传统？", a: "建议从浏览相关圣地和祖庭开始，了解文化传统的历史脉络。同时可以阅读祖训板块的经典原文，或使用AI规划师获取个性化的学习路径。" },
    { q: "有哪些文化探访路线推荐？", a: "平台提供多条精品文化探访路线，涵盖各大文化传统的核心圣地。可以通过路线板块筛选相关路线，或咨询AI规划师获取个性化推荐。" },
    { q: "如何参与社区交流？", a: "欢迎在社区板块发表攻略、提问和分享照片。您也可以在文化日志中记录您的参访体验，与其他文化探访者交流心得。" },
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

/* ═══ 商业实践深度版块 (标杆企业/大师语录/实践方法/研究/书单) ═══ */

function BusinessPracticeDetailSection({ religion, color }: { religion: Religion; color: string }) {
  const biz = religion.businessCases as ReligionBusinessCases | null | undefined;
  if (!biz) return null;

  const { cases, masterQuotes, practices, research, books } = biz;
  const hasContent = (cases?.length ?? 0) > 0 || (masterQuotes?.length ?? 0) > 0;
  if (!hasContent) return null;

  return (
    <div id="sec-business" className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">

        {/* 标题 */}
        <div className="text-center">
          <span className="text-4xl block mb-3">💼</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            文化智慧与商业实践
          </h2>
          <p className="text-sm tracking-widest uppercase" style={{ color }}>
            Faith & Business Practice
          </p>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            探索{religion.name}智慧如何塑造世界级企业文化——从标杆案例到实践方法，为CEO与高管提供文化智慧驱动的商业灵感
          </p>
        </div>

        {/* ① 核心商业哲学 (复用已有字段) */}
        {religion.businessPhilosophy && (
          <section>
            <SectionTitle icon="🧭" label="核心商业哲学" subLabel="Core Philosophy" color={color} />
            <div
              className="relative rounded-2xl p-8 md:p-10"
              style={{ backgroundColor: `${color}08` }}
            >
              <span className="absolute top-4 left-6 text-6xl opacity-15" style={{ color }}>❝</span>
              <p className="relative text-xl md:text-2xl font-serif font-medium text-gray-800 leading-relaxed text-center italic z-10">
                {religion.businessPhilosophy}
              </p>
            </div>
          </section>
        )}

        {/* ② 核心商业价值 (复用已有字段，展开description) */}
        {religion.businessValues && religion.businessValues.length > 0 && (
          <section>
            <SectionTitle icon="💎" label="核心商业价值" subLabel="Core Values" color={color} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {religion.businessValues.map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 border bg-white hover:shadow-md transition-shadow"
                  style={{ borderColor: `${color}25` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </span>
                    <h4 className="font-bold text-gray-900">{v.label}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ③ 标杆企业案例 */}
        {cases && cases.length > 0 && (
          <section>
            <SectionTitle icon="🏢" label="标杆企业案例" subLabel="Benchmark Cases" color={color} />
            <div className="space-y-6">
              {cases.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ borderColor: `${color}20` }}
                >
                  <div className="p-6 md:p-8">
                    {/* 公司头部 */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{c.company}</h4>
                        <p className="text-sm text-gray-500">{c.founder} · {c.industry}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {religion.name}智慧
                      </span>
                    </div>
                    {/* 故事 */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{c.story}</p>
                    {/* 成就 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.achievements.map((a, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100"
                        >
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                    {/* 文化原则 */}
                    <div
                      className="rounded-lg p-3 text-sm border-l-3"
                      style={{ backgroundColor: `${color}06`, borderLeftColor: color, borderLeftWidth: '3px' }}
                    >
                      <span className="font-semibold" style={{ color }}>文化原则：</span>
                      <span className="text-gray-700">{c.faithPrinciple}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ④ 商业大师语录 */}
        {masterQuotes && masterQuotes.length > 0 && (
          <section>
            <SectionTitle icon="🎙️" label="商业大师推荐" subLabel="Master Quotes" color={color} />
            <div className="space-y-5">
              {masterQuotes.map((q, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 bg-white border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <span className="text-3xl opacity-30 flex-shrink-0" style={{ color }}>❝</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-serif text-base md:text-lg leading-relaxed italic mb-3">
                        {q.quote}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-gray-900">— {q.master}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">{q.title}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed">{q.context}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⑤ 实践方法论 */}
        {practices && practices.length > 0 && (
          <section>
            <SectionTitle icon="🔧" label="实践方法论" subLabel="Methodologies" color={color} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {practices.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 bg-white border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded text-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </span>
                    {p.name}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.companies.map((co, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {co}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color }}>
                    效果：{p.outcome}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⑥ 研究与数据 */}
        {research && research.length > 0 && (
          <section>
            <SectionTitle icon="📊" label="研究与数据" subLabel="Research" color={color} />
            <div className="space-y-4">
              {research.map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4 bg-white border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{r.title}</h4>
                  <p className="text-xs text-gray-400 mb-2">{r.source}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.finding}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⑦ 推荐阅读 */}
        {books && books.length > 0 && (
          <section>
            <SectionTitle icon="📚" label="推荐阅读" subLabel="Recommended Books" color={color} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 bg-white border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3"
                    style={{ backgroundColor: `${color}12`, color }}
                  >
                    📖
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">{b.author}</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
              {t("nav.religions") || "文化"}
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
            href={`/chat?q=${encodeURIComponent(`我想了解${religion.name}的文化探访路线`)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3264ff] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            ✨ {t("religion.exploreRoutes").replace("{name}", religion.name)}
          </Link>
          <div>
            <Link
              href="/religions"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200 inline-block"
            >
              ← {t("detail.backToList") || "返回文化列表"}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
