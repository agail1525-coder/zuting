import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/api/team-culture";
import TeamInquiryForm from "../../components/TeamInquiryForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const theme = await getTheme(slug);
    return { title: `${theme.title} | 团队文化主题包 | Joinus` };
  } catch {
    return { title: "主题包 | Joinus" };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let theme;
  try {
    theme = await getTheme(slug);
  } catch {
    notFound();
  }
  if (!theme) notFound();

  const priceYuan = theme.priceFrom ? Math.round(theme.priceFrom / 100) : null;
  const rich = theme.richContent ?? null;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-end"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, #3264ff, #1e4dcc)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
          <Link
            href="/team-culture/themes"
            className="text-white/90 hover:text-white mb-4 inline-block font-medium"
          >
            ← 返回方案库
          </Link>
          {rich?.dimension && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 mb-3">
              <span className="text-white/80 text-xs font-mono">
                {rich.dimension.code}
              </span>
              <span className="text-white text-sm font-semibold">
                {rich.dimension.label}
              </span>
            </div>
          )}
          <div className="text-6xl mb-2 text-white drop-shadow-lg">
            {theme.icon}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-3 text-white drop-shadow-lg">
            {theme.title}
          </h1>
          {theme.subtitle && (
            <p className="text-xl text-white/90 drop-shadow">
              {theme.subtitle}
            </p>
          )}
          {rich?.dimension?.kicker && (
            <p className="text-base text-white/80 mt-2 max-w-2xl">
              {rich.dimension.kicker}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {theme.keywords.map((k) => (
              <span
                key={k}
                className="px-3 py-1 text-sm rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Pain Point */}
      {rich?.founderPainPoint && (
        <section className="py-16 bg-gradient-to-b from-blue-50/60 to-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              CEO 的痛点 · FOUNDER PAIN POINT
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
              {rich.founderPainPoint.title}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-8">
              {rich.founderPainPoint.body}
            </p>
            {Array.isArray(rich.founderPainPoint.signs) &&
              rich.founderPainPoint.signs.length > 0 && (
                <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-6">
                  <div className="text-sm font-semibold text-[#3264ff] mb-4">
                    你是否正在经历这些信号？
                  </div>
                  <ul className="space-y-3">
                    {rich.founderPainPoint.signs.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3264ff]/10 text-[#3264ff] text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>
      )}

      {/* Philosophy */}
      {rich?.philosophy && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              文化哲学 · PHILOSOPHY
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
              {rich.philosophy.title}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-10">
              {rich.philosophy.body}
            </p>
            {Array.isArray(rich.philosophy.quotes) &&
              rich.philosophy.quotes.length > 0 && (
                <div className="grid md:grid-cols-2 gap-5">
                  {rich.philosophy.quotes.map((q, i) => (
                    <figure
                      key={i}
                      className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border-l-4 border-[#3264ff] p-6 shadow-sm"
                    >
                      <blockquote className="text-gray-900 text-lg font-medium leading-relaxed mb-3">
                        「{q.text}」
                      </blockquote>
                      {q.translation && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {q.translation}
                        </p>
                      )}
                      <figcaption className="text-xs text-[#3264ff] font-semibold">
                        — {q.source}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
          </div>
        </section>
      )}

      {/* Daily Itinerary */}
      {Array.isArray(rich?.dailyItinerary) && rich.dailyItinerary.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50/40">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              每日行程 · DAILY ITINERARY
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900">
              {theme.durationDays ? `${theme.durationDays} 天` : "全程"}沉浸式行程
            </h2>
            <p className="text-gray-600 mb-10">
              每一天都是一次精心编排的文化植入，从晨钟到暮鼓，每一个环节都有用意。
            </p>
            <div className="relative">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#3264ff] via-[#4a7aff] to-[#1e4dcc] hidden md:block" />
              <div className="space-y-6">
                {rich.dailyItinerary.map((d) => (
                  <div key={d.day} className="md:pl-20 relative">
                    <div className="hidden md:flex absolute left-0 top-2 w-12 h-12 rounded-full bg-[#3264ff] text-white font-bold items-center justify-center shadow-lg shadow-blue-200">
                      D{d.day}
                    </div>
                    <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <span className="md:hidden inline-block px-2.5 py-0.5 rounded-full bg-[#3264ff] text-white text-xs font-bold mr-2">
                            DAY {d.day}
                          </span>
                          <span className="text-xl font-bold text-gray-900">
                            {d.title}
                          </span>
                        </div>
                        <span className="text-sm text-[#3264ff] font-medium">
                          📍 {d.location}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        {d.morning && (
                          <div>
                            <div className="text-xs font-bold text-amber-600 mb-1">
                              ☀ 晨 · MORNING
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {d.morning}
                            </p>
                          </div>
                        )}
                        {d.afternoon && (
                          <div>
                            <div className="text-xs font-bold text-orange-600 mb-1">
                              ☼ 午 · AFTERNOON
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {d.afternoon}
                            </p>
                          </div>
                        )}
                        {d.evening && (
                          <div>
                            <div className="text-xs font-bold text-indigo-600 mb-1">
                              ☾ 暮 · EVENING
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {d.evening}
                            </p>
                          </div>
                        )}
                      </div>
                      {Array.isArray(d.rituals) && d.rituals.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 mb-2">
                            当日文化植入
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {d.rituals.map((r, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full bg-blue-50 text-[#3264ff] border border-blue-100"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rituals */}
      {Array.isArray(theme.rituals) && theme.rituals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              共修仪式清单 · RITUALS
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900">
              可复制到组织内的文化仪式
            </h2>
            <p className="text-gray-600 mb-10">
              结业后，这些仪式将成为你团队日常运营的一部分，让文化真正落地。
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {theme.rituals.map((r, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {r.name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-[#3264ff] font-medium">
                      {r.durationMin} 分钟
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mentor Team */}
      {Array.isArray(rich?.mentorTeam) && rich.mentorTeam.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-blue-50/40 to-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              导师阵容 · MENTOR TEAM
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-gray-900">
              带队的不只是讲师，而是文化的活化石
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {rich.mentorTeam.map((m, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3264ff] to-[#1e4dcc] text-white text-2xl font-bold flex items-center justify-center mb-4 shadow-md">
                    {m.name.slice(0, 1)}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {m.name}
                  </h3>
                  <div className="text-sm text-[#3264ff] font-medium mb-3">
                    {m.title}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {m.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deliverables */}
      {Array.isArray(rich?.deliverables) && rich.deliverables.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              交付物清单 · DELIVERABLES
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900">
              你不止带回回忆，更带回一套可执行的文化系统
            </h2>
            <p className="text-gray-600 mb-10">
              结业当天交付，回到公司即可启用。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {rich.deliverables.map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100"
                >
                  <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3264ff] text-white text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-800 leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Target Audience + Why ZUTING */}
      {(Array.isArray(rich?.targetAudience) ||
        Array.isArray(rich?.whyZuting)) && (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50/40">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
            {Array.isArray(rich?.targetAudience) &&
              rich.targetAudience.length > 0 && (
                <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-8">
                  <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
                    适合人群 · WHO IS THIS FOR
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    这趟旅程为你而生
                  </h3>
                  <ul className="space-y-3">
                    {rich.targetAudience.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <span className="text-[#3264ff] font-bold mt-1">→</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {Array.isArray(rich?.whyZuting) && rich.whyZuting.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-[#3264ff] to-[#1e4dcc] text-white shadow-lg p-8">
                <div className="text-xs font-bold text-white/80 tracking-wider mb-2">
                  为什么是 ZUTING · WHY US
                </div>
                <h3 className="text-2xl font-bold mb-6">
                  全球唯一的祖庭文化运营平台
                </h3>
                <ul className="space-y-3">
                  {rich.whyZuting.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-white/95"
                    >
                      <span className="text-white font-bold mt-1">★</span>
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cultural Kernel (description fallback) */}
      {theme.description && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-xs font-bold text-[#3264ff] tracking-wider mb-2">
              文化内核 · CORE
            </div>
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
              {theme.description}
            </p>
          </div>
        </section>
      )}

      {/* Price + CTA */}
      <section className="py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 rounded-2xl bg-white border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">起价</div>
                {priceYuan ? (
                  <div className="text-4xl font-bold text-[#3264ff]">
                    ¥{priceYuan.toLocaleString()}
                    <span className="text-base text-gray-500 ml-2">/ 人</span>
                  </div>
                ) : (
                  <div className="text-2xl text-gray-700">面议</div>
                )}
                {theme.durationDays && (
                  <div className="text-gray-500 text-sm mt-1">
                    {theme.durationDays} 天行程 · 含食宿/交通/导师/教材/认证
                  </div>
                )}
              </div>
              <a
                href="#inquiry"
                className="px-8 py-4 bg-[#3264ff] text-white font-semibold rounded-lg hover:bg-[#1e4dcc] shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
              >
                立即询价 →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="inquiry" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            为「{theme.title}」定制方案
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <TeamInquiryForm defaultThemeId={theme.id} />
          </div>
        </div>
      </section>
    </main>
  );
}
