"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion } from "@/lib/api";

// Curated marketing stats reflecting actual platform content (see seed data in CLAUDE.md)
const PLATFORM_STATS = [
  { icon: "🕌", value: "300+", labelKey: "about.stats.holySites" },
  { icon: "🏛", value: "27+", labelKey: "about.stats.temples" },
  { icon: "☸️", value: "12", labelKey: "about.stats.religions" },
  { icon: "🌍", value: "7", labelKey: "about.stats.languages" },
  { icon: "📱", value: "5", labelKey: "about.stats.platforms" },
  { icon: "📍", value: "10+", labelKey: "about.stats.routes" },
];

const TRUST_BADGE_KEYS = [
  { icon: "🔒", key: "about.trust.encryption" },
  { icon: "✅", key: "about.trust.review" },
  { icon: "🌐", key: "about.trust.multilang" },
  { icon: "💬", key: "about.trust.ai" },
];

const MILESTONES = [
  { year: "2024", icon: "🌱", key: "about.milestone.seed" },
  { year: "2025", icon: "🏗️", key: "about.milestone.build" },
  { year: "2025 Q4", icon: "🚀", key: "about.milestone.launch" },
  { year: "2026", icon: "🌍", key: "about.milestone.global" },
];

const FEATURES = [
  { icon: "🗺️", key: "about.feature.map" },
  { icon: "🤖", key: "about.feature.ai" },
  { icon: "📖", key: "about.feature.journal" },
  { icon: "🛤️", key: "about.feature.route" },
  { icon: "⭐", key: "about.feature.review" },
  { icon: "🎧", key: "about.feature.media" },
];

export default function AboutClient({ religions = [] }: { religions?: Religion[] }) {
  const { t } = useTranslation();

  const values = [
    { key: "dialogue", icon: "🤝" },
    { key: "peace", icon: "🕊️" },
    { key: "digital", icon: "💻" },
    { key: "immersive", icon: "🌟" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0066FF] to-[#003D99] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-50px] right-[-50px] w-60 h-60 rounded-full bg-white/10" />
          <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
            🏛
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t("about.title")}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t("about.subtitle")}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <span className="text-2xl block mb-1">{stat.icon}</span>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{t(stat.labelKey) || stat.labelKey.split(".").pop()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Vision */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.vision.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {t("about.vision.summary").split("{highlight}")[0]}
            <span className="text-[#0066FF] font-bold">{t("about.vision.highlight")}</span>
            {t("about.vision.summary").split("{highlight}")[1]}
          </p>
          <p className="text-gray-500 leading-relaxed mt-4">
            {t("about.vision.detail")}
          </p>
        </div>

        {/* Compliance Declaration · 合规性声明 */}
        <section
          id="compliance"
          aria-labelledby="compliance-title"
          className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-2 border-amber-200 shadow-sm overflow-hidden"
        >
          <header className="px-6 sm:px-8 py-5 border-b border-amber-100 bg-white/60 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-700 text-lg">⚖️</span>
            <div>
              <p className="text-[11px] tracking-[0.25em] text-amber-700 font-semibold uppercase">Compliance · 合规声明</p>
              <h2 id="compliance-title" className="text-lg sm:text-xl font-bold text-gray-900">平台性质声明 · 非宗教组织,仅文化旅行平台</h2>
            </div>
          </header>

          <div className="px-6 sm:px-8 py-6 space-y-5 text-sm text-gray-700 leading-relaxed">
            <p className="text-gray-800">
              <strong className="text-gray-900">Joinus (佳绩之旅)</strong> 是依法取得 ICP 备案、以「文化旅行 · 文化游学 · 文化交流」为业务定位的互联网旅行平台。
              平台<strong className="text-amber-700">不属于、不附属、不代表任何宗教组织、宗教团体、宗教院校或宗教活动场所</strong>,
              亦不持有《互联网宗教信息服务许可证》。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-red-700 tracking-wider uppercase mb-2.5">✕ 平台不做</p>
                <ul className="space-y-1.5 text-[13px] text-gray-700">
                  <li>· 不传教、不讲经、不开展任何宗教教育与培训</li>
                  <li>· 不直播、不录播宗教仪式 (礼拜 / 烧香 / 受戒 / 诵经 / 祈祷 / 弥撒 / 洗礼 等)</li>
                  <li>· 不接受、不转达、不代收宗教捐献与功德款</li>
                  <li>· 不组织公民参加境内外宗教培训或宗教活动</li>
                  <li>· 不以宗教名义进行商业宣传</li>
                  <li>· 不招募、不安排宗教教职人员讲经或代言</li>
                </ul>
              </div>

              <div className="bg-white/70 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2.5">✓ 平台所做</p>
                <ul className="space-y-1.5 text-[13px] text-gray-700">
                  <li>· 提供世俗文化旅行、文化游学、文化交流产品</li>
                  <li>· 介绍文化场所的建筑、历史、艺术、民俗背景</li>
                  <li>· 规划行程、预订住宿与交通、撮合合规供应商</li>
                  <li>· 展示公开学术资料与文化遗产数字化内容</li>
                  <li>· 协助用户遵守目的地法律、场所管理规定与风俗</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-700 tracking-wider uppercase mb-2.5">法规依据</p>
              <p className="text-[13px] text-gray-600">
                平台严格遵守《中华人民共和国宗教事务条例》(国务院令第 686 号)、
                《互联网宗教信息服务管理办法》(2022-03-01 施行)、
                《宗教教职人员网络行为规范》(2025-09 发布)、
                《中华人民共和国旅游法》、
                《中华人民共和国网络安全法》、
                《中华人民共和国个人信息保护法》、
                《互联网信息服务管理办法》
                等相关法律法规。平台内容经人工与 AI 双审核,任何涉及宗教信息服务的用户生成内容一经发现立即下线。
              </p>
            </div>

            <div className="bg-white/70 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-700 tracking-wider uppercase mb-2.5">用户参访提示</p>
              <ul className="text-[13px] text-gray-600 space-y-1 list-disc pl-5">
                <li>用户前往文化场所 (含寺院、宫观、教堂、清真寺、神社等) 时,请自觉遵守场所管理规定、所在国法律法规与民族风俗习惯;</li>
                <li>任何宗教性质的法会、受戒、皈依、捐献等活动,请通过场所官方渠道参与,<strong className="text-gray-800">平台不参与、不组织、不代理</strong>;</li>
                <li>平台推荐的行程与话术均为世俗文化游学性质,如与用户个人信仰实践存在差异,以场所官方规定为准。</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 pt-1">
              合规问题或投诉渠道: <a href="mailto:compliance@joinus.com" className="text-[#0066FF] hover:underline font-medium">compliance@joinus.com</a>
              <span className="text-gray-300 mx-2">·</span>
              最近更新: 2026-04-22
            </p>
          </div>
        </section>

        {/* Core Values */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.key}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-[#0066FF]/20 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {t(`about.values.${v.key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(`about.values.${v.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4 text-center">{t("about.trust.title")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGE_KEYS.map((badge) => (
              <div key={badge.key} className="flex items-center gap-2 justify-center text-sm text-green-700">
                <span className="text-xl">{badge.icon}</span>
                <span>{t(badge.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("about.team.desc")}
          </p>
        </div>

        {/* 12 Traditions Showcase */}
        {religions.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-2">
              {t("about.traditions.title")}
            </h2>
            <p className="text-gray-500 text-sm mb-6">{t("about.traditions.desc")}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {religions.map((r) => (
                <Link
                  key={r.id}
                  href={`/religions/${r.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${r.color || '#0066FF'}15` }}
                  >
                    {r.symbol || "🙏"}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-[#0066FF] transition-colors font-medium">{r.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Platform Features */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-6">
            {t("about.features.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl block mb-2">{f.icon}</span>
                <p className="text-sm font-medium text-gray-700">{t(`${f.key}.title`)}</p>
                <p className="text-xs text-gray-500 mt-1">{t(`${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-6">
            {t("about.milestones.title")}
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#0066FF]/20" />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-xl shrink-0 relative z-10 border-2 border-white">
                    {m.icon}
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-bold text-[#0066FF]">{m.year}</p>
                    <p className="text-gray-600 text-sm">{t(m.key)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("about.contact.title")}
          </h2>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-3">
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.email")}：</strong>
              contact@zuting.com
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.address")}：</strong>
              {t("about.contact.addressValue")}
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-700">{t("about.contact.hours")}：</strong>
              {t("about.contact.hoursValue")}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{t("about.cta.title")}</h2>
          <p className="text-gray-400 text-sm mb-6">{t("about.cta.desc")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/holy-sites"
              className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              {t("about.cta.explore")} →
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
            >
              ✨ {t("about.cta.aiPlan")}
            </Link>
          </div>
        </div>

        {/* ICP */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            {t("about.icp")}
          </p>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
