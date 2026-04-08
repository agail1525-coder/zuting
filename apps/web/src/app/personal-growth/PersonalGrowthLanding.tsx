"use client";

import Link from "next/link";
import type { PersonalGrowthTheme } from "@/lib/api/personal-growth";
import GrowthThemeCard from "./components/GrowthThemeCard";
import PersonalInquiryForm from "./components/PersonalInquiryForm";

const STAGES = [
  {
    stage: "01",
    title: "创业觉醒",
    age: "25-35 岁",
    desc: "从迷茫中找到初心，从焦虑中找到方向",
    icon: "🌱",
  },
  {
    stage: "02",
    title: "心智锻造",
    age: "35-45 岁",
    desc: "在风暴中修炼定力，从管理者蜕变为领袖",
    icon: "⚔️",
  },
  {
    stage: "03",
    title: "格局跃迁",
    age: "45-55 岁",
    desc: "突破中年危机，从成功走向意义",
    icon: "🏔️",
  },
  {
    stage: "04",
    title: "传灯传承",
    age: "55+ 岁",
    desc: "凝练一生智慧，点亮后人之路",
    icon: "🏮",
  },
];

const TRUST_NUMBERS = [
  { num: "300+", label: "全球圣地" },
  { num: "12", label: "信仰智慧" },
  { num: "1:1", label: "导师辅导" },
  { num: "30天", label: "回程跟踪" },
];

interface Props {
  themes: PersonalGrowthTheme[];
}

export default function PersonalGrowthLanding({ themes }: Props) {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ════════ Hero ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#1a1206] to-gray-950">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4A855]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4A855]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4A855]/10 border border-[#D4A855]/30 rounded-full text-[#D4A855] text-sm font-medium tracking-wide mb-6">
              🧘 企业家心灵修炼 · 个人深度成长
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              企业家<span className="text-[#D4A855]">觉醒</span>之旅
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              从创业者到跨国集团董事长，每一次跃迁都需要一次心灵的重生。
              在12种信仰的智慧中，找到属于你的精神进化之路。
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4A855] to-[#C49B3C] text-gray-900 font-semibold rounded-lg hover:from-[#E0B96E] hover:to-[#D4A855] transition-all shadow-lg shadow-amber-900/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                预约个人咨询
              </a>
              <Link
                href="/personal-growth/themes"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#D4A855]/30 text-[#D4A855] font-semibold rounded-lg hover:bg-[#D4A855]/10 hover:border-[#D4A855]/50 transition-all"
              >
                浏览修炼主题
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 进化阶梯 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-[#D4A855]/10 border border-[#D4A855]/30 rounded-full text-[#D4A855] text-sm font-medium mb-4">
            企业家进化阶梯
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            每个阶段，都有一场修行在等你
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            从初创到巅峰，企业家的心灵成长不会自动发生——它需要刻意的修炼和正确的引导
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((s) => (
            <div
              key={s.stage}
              className="relative p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-[#D4A855]/30 hover:bg-gray-900 transition-all group"
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="text-[#D4A855] text-xs font-mono mb-1">STAGE {s.stage}</div>
              <h3 className="text-xl font-bold text-white mb-1">{s.title}</h3>
              <div className="text-amber-200/60 text-sm mb-3">{s.age}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#D4A855]/10 flex items-center justify-center text-[#D4A855] opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三大价值主张 ════════ */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "不是团建，是个人深修",
                desc: "每次修行只有1-3人同行，确保导师能深度关注你的成长。独处时间占全程40%以上。",
              },
              {
                icon: "🌍",
                title: "12种信仰，找到你的",
                desc: "禅宗·道家·儒教·基督教·藏传佛教……不同的人适合不同的修炼路径，我们帮你找到最适合你的那条。",
              },
              {
                icon: "🔄",
                title: "30天跟踪，不是一次性鸡汤",
                desc: "行程结束后30天内，导师持续跟踪你的蜕变计划执行情况。觉醒是开始，不是结束。",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="p-8 rounded-2xl bg-gray-950 border border-gray-800 hover:border-[#D4A855]/30 hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Themes Grid ════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                六大修炼主题
              </h2>
              <p className="text-gray-500">
                每个主题对应企业家不同阶段的核心挑战
              </p>
            </div>
            <Link
              href="/personal-growth/themes"
              className="hidden md:inline-flex items-center text-[#D4A855] hover:text-[#E0B96E] font-medium"
            >
              查看全部 →
            </Link>
          </div>
          {themes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🧘</div>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                主题包即将上线，敬请期待
              </p>
              <a
                href="#inquiry"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#D4A855] text-gray-900 rounded-lg font-semibold hover:bg-[#E0B96E] transition-all"
              >
                预约咨询 →
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((th) => (
                <GrowthThemeCard key={th.id} theme={th} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ Trust Numbers ════════ */}
      <section className="py-20 bg-gradient-to-br from-[#1a1206] via-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {TRUST_NUMBERS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-6xl font-bold text-[#D4A855] mb-2">
                {s.num}
              </div>
              <div className="text-gray-500 text-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三部曲导航 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            企业家信仰修炼三部曲
          </h2>
          <p className="text-gray-500">个人 → 家庭 → 企业，构建完整的精神根基</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "个人成长",
              desc: "企业家自我进化——从创业者到领袖的心灵跃迁",
              href: "/personal-growth",
              color: "#D4A855",
              icon: "🧘",
              active: true,
            },
            {
              title: "家庭和谐",
              desc: "以信仰智慧为根基，构建幸福家庭的系统方法",
              href: "/family-harmony",
              color: "#2D8B6F",
              icon: "🏠",
              active: true,
            },
            {
              title: "团队文化",
              desc: "把祖庭变成团队的精神高地，打造百年组织文化",
              href: "/team-culture",
              color: "#3264ff",
              icon: "🏢",
              active: true,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-8 rounded-2xl border transition-all hover:-translate-y-1 ${
                item.active
                  ? "bg-gray-900 border-gray-700 hover:border-gray-600"
                  : "bg-gray-900/50 border-gray-800 hover:border-gray-700 opacity-60"
              }`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              {!item.active && (
                <span className="inline-block mt-3 text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                  即将上线
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ════════ Inquiry Form ════════ */}
      <section id="inquiry" className="py-20 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              预约个人成长咨询
            </h2>
            <p className="text-gray-500">
              我们的成长顾问将根据您的阶段和挑战，推荐最适合的修炼主题
            </p>
          </div>
          <div className="bg-gray-950 rounded-2xl border border-gray-800 shadow-lg p-8">
            <PersonalInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
