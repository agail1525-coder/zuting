"use client";

import Link from "next/link";
import type { FamilyHarmonyTheme } from "@/lib/api/family-harmony";
import FamilyThemeCard from "./components/FamilyThemeCard";
import FamilyInquiryForm from "./components/FamilyInquiryForm";

const FAMILY_TYPES = [
  {
    icon: "💑",
    title: "夫妻关系",
    desc: "在忙碌的事业中重新找到彼此",
    color: "#2D8B6F",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "亲子关系",
    desc: "弥合代际鸿沟，建立深度连接",
    color: "#4A8B6B",
  },
  {
    icon: "👴👵",
    title: "三代同堂",
    desc: "让老人被尊重，让年轻人懂感恩",
    color: "#C4632D",
  },
  {
    icon: "🏡",
    title: "家族传承",
    desc: "把家风家训变成可传承的精神遗产",
    color: "#8B6F2D",
  },
];

interface Props {
  themes: FamilyHarmonyTheme[];
}

export default function FamilyHarmonyLanding({ themes }: Props) {
  return (
    <main className="min-h-screen bg-[#FEFAF3] text-gray-900">
      {/* ════════ Hero ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2D8B6F] via-[#3A9E80] to-[#1B5E4A]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-200/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/30 rounded-full text-white text-sm font-medium tracking-wide mb-6">
              🏠 圆满之路 · 家庭幸福根基
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              让文化智慧成为家庭
              <br />
              <span className="text-emerald-200">最深的纽带</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
              一个成功的家庭，是个人成长的根基，也是事业持续发展的隐性支撑。
              通过12种文化的智慧，帮助您的家庭找到和谐的根基。
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2D8B6F] font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                预约家庭咨询
              </a>
              <Link
                href="/family-harmony/themes"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/60 transition-all"
              >
                浏览和谐主题
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 家庭类型 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[#2D8B6F] text-sm font-medium mb-4">
            每种家庭，都有对应的成长之路
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            您的家庭需要哪种滋养？
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FAMILY_TYPES.map((ft) => (
            <div
              key={ft.title}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#2D8B6F]/30 hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-4">{ft.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{ft.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{ft.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三大价值 ════════ */}
      <section className="py-20 bg-gradient-to-b from-emerald-50/50 to-[#FEFAF3]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🌱",
              title: "不是旅游，是共修",
              desc: "区别于普通家庭游，我们的行程设计围绕\u201C关系修复\u201D和\u201C深度对话\u201D，每个环节都有导师引导。",
            },
            {
              icon: "💝",
              title: "12种文化智慧，找到你家的根",
              desc: "佛教因缘·儒家孝道·基督宽恕·印度感恩……每个家庭的文化根基不同，我们帮你找到最契合的。",
            },
            {
              icon: "🔄",
              title: "回家后才是开始",
              desc: "每个主题包都有\u201C回家练习\u201D手册。21天家庭微习惯，让文化之旅的感动变成日常的滋养。",
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
      </section>

      {/* ════════ Themes Grid ════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                六大和谐主题
              </h2>
              <p className="text-gray-500">
                每个主题由不同文化智慧驱动，适合不同家庭类型
              </p>
            </div>
            <Link
              href="/family-harmony/themes"
              className="hidden md:inline-flex items-center text-[#2D8B6F] hover:text-[#1B5E4A] font-medium"
            >
              查看全部 →
            </Link>
          </div>
          {themes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏠</div>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                主题包即将上线，敬请期待
              </p>
              <a
                href="#inquiry"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#2D8B6F] text-white rounded-lg font-semibold hover:bg-[#247259] transition-all"
              >
                预约咨询 →
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((th) => (
                <FamilyThemeCard key={th.id} theme={th} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ 信任数据 ════════ */}
      <section className="py-20 bg-gradient-to-br from-[#2D8B6F] to-[#1B5E4A]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "300+", label: "全球圣地" },
            { num: "12", label: "文化智慧" },
            { num: "21天", label: "回家练习" },
            { num: "100%", label: "定制方案" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">{s.num}</div>
              <div className="text-emerald-100 text-lg">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ 三部曲 ════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            企业家圆满之路三部曲
          </h2>
          <p className="text-gray-500">个人 → 家庭 → 企业，构建完整的精神根基</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "个人圆满", desc: "企业家自我进化之旅", href: "/personal-growth", color: "#D4A855", icon: "🧘", active: true },
            { title: "家庭幸福", desc: "以文化智慧构建幸福家庭", href: "/family-harmony", color: "#2D8B6F", icon: "🏠", active: true },
            { title: "企业兴旺", desc: "把文化之旅变成团队精神高地", href: "/team-culture", color: "#3264ff", icon: "🏢", active: true },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-8 rounded-2xl border transition-all hover:-translate-y-1 ${
                item.href === "/family-harmony"
                  ? "bg-emerald-50 border-[#2D8B6F]/30 shadow-md"
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
      <section id="inquiry" className="py-20 bg-emerald-50/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              预约家庭幸福咨询
            </h2>
            <p className="text-gray-600">
              我们的家庭顾问将根据您的家庭情况，推荐最适合的和谐主题
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <FamilyInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
