"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import type {
  Religion,
  ReligionBusinessCases,
  BusinessCase,
  BusinessMasterQuote,
  BusinessPractice,
  BusinessResearch,
  BusinessBook,
} from "@/lib/api";

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

export default function BusinessClient({ religion }: { religion: Religion }) {
  const color = religion.color ?? "#3264ff";
  const biz = religion.businessCases as ReligionBusinessCases | null | undefined;
  const cases = biz?.cases ?? [];
  const masterQuotes = biz?.masterQuotes ?? [];
  const practices = biz?.practices ?? [];
  const research = biz?.research ?? [];
  const books = biz?.books ?? [];
  const hasDeepContent = cases.length > 0 || masterQuotes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[320px] md:h-[400px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-30"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}, transparent 70%)` }}
        />

        <div className="relative h-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/religions" className="hover:text-white transition-colors">
              信仰
            </Link>
            <span>/</span>
            <Link href={`/religions/${religion.slug}`} className="hover:text-white transition-colors">
              {religion.name}
            </Link>
            <span>/</span>
            <span className="text-white">商业实践</span>
          </div>

          <span className="text-5xl block mb-3">💼</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 drop-shadow-lg">
            {religion.name}与商业实践
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wide text-white/90 mb-4">
            Faith & Business Practice
          </p>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/80 px-4">
            探索{religion.name}智慧如何塑造世界级企业文化——从标杆案例到实践方法，为CEO与高管提供信仰驱动的商业灵感
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">

        {/* ① 核心商业哲学 */}
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

        {/* ② 核心商业价值 */}
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
        {cases.length > 0 && (
          <section>
            <SectionTitle icon="🏢" label="标杆企业案例" subLabel="Benchmark Cases" color={color} />
            <div className="space-y-6">
              {cases.map((c: BusinessCase, i: number) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ borderColor: `${color}20` }}
                >
                  <div className="p-6 md:p-8">
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
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{c.story}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.achievements.map((a: string, j: number) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100"
                        >
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                    <div
                      className="rounded-lg p-3 text-sm"
                      style={{ backgroundColor: `${color}06`, borderLeftColor: color, borderLeftWidth: '3px' }}
                    >
                      <span className="font-semibold" style={{ color }}>信仰原则：</span>
                      <span className="text-gray-700">{c.faithPrinciple}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ④ 商业大师语录 */}
        {masterQuotes.length > 0 && (
          <section>
            <SectionTitle icon="🎙️" label="商业大师推荐" subLabel="Master Quotes" color={color} />
            <div className="space-y-5">
              {masterQuotes.map((q: BusinessMasterQuote, i: number) => (
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
        {practices.length > 0 && (
          <section>
            <SectionTitle icon="🔧" label="实践方法论" subLabel="Methodologies" color={color} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {practices.map((p: BusinessPractice, i: number) => (
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
                    {p.companies.map((co: string, j: number) => (
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
        {research.length > 0 && (
          <section>
            <SectionTitle icon="📊" label="研究与数据" subLabel="Research" color={color} />
            <div className="space-y-4">
              {research.map((r: BusinessResearch, i: number) => (
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
        {books.length > 0 && (
          <section>
            <SectionTitle icon="📚" label="推荐阅读" subLabel="Recommended Books" color={color} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b: BusinessBook, i: number) => (
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

        {/* 无深度内容时的提示 */}
        {!hasDeepContent && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📋</span>
            <p className="text-gray-400">该信仰的商业实践深度内容正在整理中...</p>
          </div>
        )}

        {/* Bottom CTAs */}
        <div className="text-center mt-12 space-y-4">
          <Link
            href={`/religions/${religion.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
          >
            ← 返回{religion.name}详情
          </Link>
          <div>
            <Link
              href="/religions"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              查看全部信仰 →
            </Link>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
