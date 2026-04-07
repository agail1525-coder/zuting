"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { TeamCultureTheme, TeamCase } from "@/lib/api/team-culture";
import TeamInquiryForm from "./components/TeamInquiryForm";
import TeamThemeCard from "./components/TeamThemeCard";
import TeamCaseCard from "./components/TeamCaseCard";

const INDUSTRIES = [
  { key: "ENTERPRISE", label: "企业 / Enterprise" },
  { key: "SCHOOL", label: "学校 / School" },
  { key: "RELIGIOUS", label: "宗教组织 / Religious" },
  { key: "FAMILY", label: "家族 / Family" },
  { key: "NGO", label: "公益 / NGO" },
  { key: "GOVERNMENT", label: "政府 / Gov" },
];

interface Props {
  themes: TeamCultureTheme[];
  cases: TeamCase[];
}

export default function TeamCultureLanding({ themes, cases }: Props) {
  const { t } = useTranslation();
  const [activeIndustry, setActiveIndustry] = useState("ENTERPRISE");

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545569310-25c4e8eb7eb1?w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/60 to-[#0f172a]" />
        <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-[#D4A855] font-medium tracking-[0.2em] mb-4 uppercase">
              {t("team_culture.hero_kicker") || "Team Culture Building"}
            </p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              {t("team_culture.hero_title") || "让朝圣成为团队最深的纪念"}
            </h1>
            <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl">
              {t("team_culture.hero_subtitle") ||
                "把团建升级为团队文化打造。6 大文化主题包，60 座祖庭圣地，12 大信仰深度共修。"}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#inquiry"
                className="px-8 py-4 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg hover:bg-[#E5B968] transition shadow-lg"
              >
                {t("team_culture.cta_inquiry") || "免费方案咨询"}
              </a>
              <Link
                href="/team-culture/themes"
                className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                {t("team_culture.cta_themes") || "浏览主题包"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "☸",
              title: t("team_culture.value_depth_title") || "文化深度",
              desc:
                t("team_culture.value_depth_desc") ||
                "12 大信仰、60 座圣地、27 处祖庭，专业策划师与导师全程陪伴。",
            },
            {
              icon: "✦",
              title: t("team_culture.value_global_title") || "全球祖庭",
              desc:
                t("team_culture.value_global_desc") ||
                "从少林到耶路撒冷，从普陀到圣彼得堡，覆盖人类文明源头。",
            },
            {
              icon: "◈",
              title: t("team_culture.value_custom_title") || "定制共修",
              desc:
                t("team_culture.value_custom_desc") ||
                "为团队量身定制主题包、共修仪式、文化证书。",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4A855]/50 transition"
            >
              <div className="text-5xl text-[#D4A855] mb-4">{v.icon}</div>
              <h3 className="text-xl font-bold mb-3">{v.title}</h3>
              <p className="text-white/70 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-20 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                {t("team_culture.themes_title") || "6 大文化主题包"}
              </h2>
              <p className="text-white/60">
                {t("team_culture.themes_subtitle") || "选一个最契合你的团队当下需要"}
              </p>
            </div>
            <Link
              href="/team-culture/themes"
              className="hidden md:block text-[#D4A855] hover:underline"
            >
              {t("team_culture.view_all") || "查看全部 →"}
            </Link>
          </div>
          {themes.length === 0 ? (
            <div className="text-center py-20 text-white/50">
              {t("common.empty") || "暂无数据"}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((th) => (
                <TeamThemeCard key={th.id} theme={th} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold mb-3">
          {t("team_culture.industries_title") || "为不同组织量身打造"}
        </h2>
        <p className="text-white/60 mb-10">
          {t("team_culture.industries_subtitle") ||
            "无论你领导的是企业、学校、宗教组织、家族还是公益团体"}
        </p>
        <div className="flex flex-wrap gap-3 mb-8">
          {INDUSTRIES.map((i) => (
            <button
              key={i.key}
              onClick={() => setActiveIndustry(i.key)}
              className={`px-5 py-2 rounded-full border transition ${
                activeIndustry === i.key
                  ? "bg-[#D4A855] text-[#0f172a] border-[#D4A855]"
                  : "border-white/20 text-white/70 hover:border-white/50"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/80 leading-relaxed">
            {industryCopy(activeIndustry)}
          </p>
        </div>
      </section>

      {/* Cases */}
      {cases.length > 0 && (
        <section className="py-20 bg-[#020617]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              {t("team_culture.cases_title") || "他们已经在路上"}
            </h2>
            <p className="text-white/60 mb-10">
              {t("team_culture.cases_subtitle") || "真实案例，真实改变"}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {cases.map((c) => (
                <TeamCaseCard key={c.id} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">
          {t("team_culture.process_title") || "六步交付，全程陪伴"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            "询价",
            "方案",
            "签约",
            "行前",
            "朝圣",
            "沉淀",
          ].map((s, i) => (
            <div
              key={s}
              className="p-5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-2xl font-bold text-[#D4A855] mb-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-white/80">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "60+", label: t("team_culture.trust_sites") || "圣地" },
            { num: "27+", label: t("team_culture.trust_temples") || "祖庭" },
            { num: "12", label: t("team_culture.trust_religions") || "大信仰" },
            { num: "100%", label: t("team_culture.trust_custom") || "定制化" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl font-bold text-[#D4A855] mb-2">
                {s.num}
              </div>
              <div className="text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-20 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-center">
          {t("team_culture.inquiry_title") || "与文化顾问对话"}
        </h2>
        <p className="text-white/60 mb-10 text-center">
          {t("team_culture.inquiry_subtitle") ||
            "提交需求，48 小时内收到定制方案"}
        </p>
        <TeamInquiryForm />
      </section>
    </main>
  );
}

function industryCopy(key: string): string {
  switch (key) {
    case "ENTERPRISE":
      return "为企业团队提供超越庸俗团建的文化共修：在祖庭与圣地之间，让员工回到工作之外的连接，重塑组织凝聚力与同心。";
    case "SCHOOL":
      return "为中小学、大学的研学之旅注入深度。让学生在真实祖庭中学习传统文化，让老师在朝圣中重新理解师者使命。";
    case "RELIGIOUS":
      return "为寺院、教会、道观的朝山团、共修团提供端到端组织工具：报名、行程、签到、证书、回忆全闭环。";
    case "FAMILY":
      return "为家族寻根之旅提供专业策划：从祖籍地到祖庭，从家训到族谱，让一次旅行变成家族文化的传承时刻。";
    case "NGO":
      return "为公益组织、慈善基金会设计慈悲主题之旅：在朝圣中完成施食、放生、捐书等公益行动。";
    case "GOVERNMENT":
      return "为政府机关、文化系统提供文化传承考察方案：打通祖庭、圣地、非遗的研学通道。";
    default:
      return "";
  }
}
