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
    desc: "在风暴中锻造定力，从管理者蜕变为领袖",
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
  { num: "12", label: "文化智慧" },
  { num: "1:1", label: "导师辅导" },
  { num: "30天", label: "回程跟踪" },
];

interface Props {
  themes: PersonalGrowthTheme[];
}

export default function PersonalGrowthLanding({ themes }: Props) {
  return (
    <main className="min-h-screen bg-[#FFFBF0] text-gray-900">
      {/* ════════ Hero ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B6914] via-[#A67C1E] to-[#6B5210]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-200/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/30 rounded-full text-white text-sm font-medium tracking-wide mb-6">
              🧘 圆满之路 · 个人圆满
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              企业家<span className="text-amber-200">圆满</span>之旅
            </h1>
            <p className="text-lg lg:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
              从创业者到跨国集团董事长，每一次跃迁都需要一次心灵的重生。
              在12种文化的智慧中，找到属于你的精神进化之路。
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8B6914] font-semibold rounded-lg hover:bg-amber-50 transition-all shadow-lg shadow-amber-900/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                预约圆满咨询
              </a>
              <Link
                href="/personal-growth/themes"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/60 transition-all"
              >
                浏览成长主题
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 进化阶梯 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[#8B6914] text-sm font-medium mb-4">
            企业家进化阶梯
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            每个阶段，都有一场历练在等你
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            从初创到巅峰，企业家的心灵成长不会自动发生——它需要刻意的历练和正确的引导
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((s) => (
            <div
              key={s.stage}
              className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8B6914]/30 hover:-translate-y-1 transition-all group"
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="text-[#8B6914] text-xs font-mono mb-1">STAGE {s.stage}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{s.title}</h3>
              <div className="text-[#A67C1E] text-sm mb-3">{s.age}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#8B6914] opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三大价值主张 ════════ */}
      <section className="py-20 bg-gradient-to-b from-amber-50/50 to-[#FFFBF0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "不是团建，是个人深修",
                desc: "每次历练只有1-3人同行，确保导师能深度关注你的成长。独处时间占全程40%以上。",
              },
              {
                icon: "🌍",
                title: "12种文化智慧，找到你的",
                desc: "禅宗·道家·儒教·基督教·藏传佛教……不同的人适合不同的成长路径，我们帮你找到最适合你的那条。",
              },
              {
                icon: "🔄",
                title: "30天跟踪，不是一次性鸡汤",
                desc: "行程结束后30天内，导师持续跟踪你的蜕变计划执行情况。觉醒是开始，不是结束。",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                六大成长主题
              </h2>
              <p className="text-gray-500">
                每个主题对应企业家不同阶段的核心挑战
              </p>
            </div>
            <Link
              href="/personal-growth/themes"
              className="hidden md:inline-flex items-center text-[#8B6914] hover:text-[#A67C1E] font-medium"
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
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#8B6914] text-white rounded-lg font-semibold hover:bg-[#A67C1E] transition-all"
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
      <section className="py-20 bg-gradient-to-br from-[#8B6914] to-[#6B5210]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {TRUST_NUMBERS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">
                {s.num}
              </div>
              <div className="text-amber-100 text-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三部曲导航 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            企业家圆满之路三部曲
          </h2>
          <p className="text-gray-500">个人 → 家庭 → 企业，构建完整的精神根基</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "个人圆满",
              desc: "企业家自我进化——从创业者到领袖的心灵跃迁",
              href: "/personal-growth",
              icon: "🧘",
              active: true,
            },
            {
              title: "家庭幸福",
              desc: "以文化智慧为根基，构建幸福家庭的系统方法",
              href: "/family-harmony",
              icon: "🏠",
              active: true,
            },
            {
              title: "企业兴旺",
              desc: "把文化之旅变成团队的精神高地，打造百年组织文化",
              href: "/team-culture",
              icon: "🏢",
              active: true,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-8 rounded-2xl border transition-all hover:-translate-y-1 ${
                item.href === "/personal-growth"
                  ? "bg-amber-50 border-[#8B6914]/30 shadow-md"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════ Inquiry Form ════════ */}
      <section id="inquiry" className="py-20 bg-amber-50/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              预约个人圆满咨询
            </h2>
            <p className="text-gray-600">
              我们的成长顾问将根据您的阶段和挑战，推荐最适合的成长主题
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <PersonalInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
