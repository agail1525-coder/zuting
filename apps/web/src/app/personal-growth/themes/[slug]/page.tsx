import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/api/personal-growth";
import type { PersonalGrowthRichContent } from "@/lib/api/personal-growth";
import PersonalInquiryForm from "../../components/PersonalInquiryForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const theme = await getTheme(slug);
    return { title: `${theme.title} | 企业家个人圆满 | Joinus` };
  } catch {
    return { title: "成长主题 | Joinus" };
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
  const rich = (theme.richContent ?? null) as PersonalGrowthRichContent | null;

  return (
    <main className="min-h-screen bg-[#FFFBF0] text-gray-900">
      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-end"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, ${theme.color || '#8B6914'}, #6B5210)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
          <Link
            href="/personal-growth/themes"
            className="inline-flex items-center text-white/80 hover:text-white text-sm mb-4"
          >
            ← 成长主题
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl">{theme.icon}</span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">{theme.title}</h1>
          </div>
          {theme.subtitle && (
            <p className="text-lg text-white/75 mt-2 max-w-2xl">{theme.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-6">
            {theme.durationDays && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm text-white border border-white/30">
                {theme.durationDays} 天
              </span>
            )}
            {priceYuan && (
              <span className="px-3 py-1.5 bg-white/25 backdrop-blur rounded-full text-sm text-white font-semibold border border-white/40">
                ¥{priceYuan.toLocaleString()} 起 / 人
              </span>
            )}
            {theme.keywords.map((k) => (
              <span key={k} className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm text-white/90 border border-white/30">
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* Dimension Kicker */}
        {rich?.dimension && (
          <section className="py-16 border-b border-gray-200">
            <span className="text-[#8B6914] text-sm font-mono">{rich.dimension.code}</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{rich.dimension.label}</h2>
            <p className="text-gray-600 text-lg mt-2 italic">&ldquo;{rich.dimension.kicker}&rdquo;</p>
          </section>
        )}

        {/* Description */}
        <section className="py-12 border-b border-gray-200">
          <p className="text-gray-700 leading-relaxed text-lg max-w-4xl">{theme.description}</p>
        </section>

        {/* Pain Point */}
        {rich?.entrepreneurPainPoint && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {rich.entrepreneurPainPoint.title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-4xl">
              {rich.entrepreneurPainPoint.body}
            </p>
            {rich.entrepreneurPainPoint.signs && (
              <div className="space-y-3">
                <h3 className="text-[#8B6914] font-semibold mb-4">你是否有以下信号？</h3>
                {rich.entrepreneurPainPoint.signs.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <span className="text-gray-700">{s}</span>
                  </div>
                ))}
              </div>
            )}
            {rich.entrepreneurPainPoint.stage && (
              <div className="mt-6 text-sm text-amber-200/60">
                适合阶段: {rich.entrepreneurPainPoint.stage}
              </div>
            )}
          </section>
        )}

        {/* Philosophy */}
        {rich?.philosophy && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {rich.philosophy.title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-4xl">
              {rich.philosophy.body}
            </p>
            {rich.philosophy.quotes && (
              <div className="grid md:grid-cols-2 gap-4">
                {rich.philosophy.quotes.map((q, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-amber-100 shadow-sm"
                  >
                    <p className="text-[#8B6914] text-lg font-medium mb-2 leading-relaxed">
                      &ldquo;{q.text}&rdquo;
                    </p>
                    <div className="text-gray-500 text-sm">—— {q.source}</div>
                    {q.translation && (
                      <p className="text-gray-500 text-sm mt-2 italic">{q.translation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Daily Itinerary */}
        {rich?.dailyItinerary && rich.dailyItinerary.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              行程安排
            </h2>
            <div className="space-y-6">
              {rich.dailyItinerary.map((day) => (
                <div
                  key={day.day}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-r from-amber-50 to-transparent border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-full bg-[#8B6914]/20 text-[#8B6914] font-bold flex items-center justify-center text-lg">
                        D{day.day}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{day.title}</h3>
                        <span className="text-sm text-gray-500">{day.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 grid gap-4">
                    {day.dawn && (
                      <TimeBlock label="黎明" icon="🌅" text={day.dawn} />
                    )}
                    {day.morning && (
                      <TimeBlock label="上午" icon="☀️" text={day.morning} />
                    )}
                    {day.afternoon && (
                      <TimeBlock label="下午" icon="🌤" text={day.afternoon} />
                    )}
                    {day.evening && (
                      <TimeBlock label="晚间" icon="🌙" text={day.evening} />
                    )}
                    {day.soloTime && (
                      <TimeBlock label="独处时间" icon="🧘" text={day.soloTime} />
                    )}
                    {day.rituals && day.rituals.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {day.rituals.map((r) => (
                          <span key={r} className="px-2.5 py-1 text-xs rounded-full bg-[#8B6914]/10 text-[#8B6914] border border-[#8B6914]/20">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rituals */}
        {theme.rituals && theme.rituals.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              核心修行仪式
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {theme.rituals.map((r) => (
                <div
                  key={r.name}
                  className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                    <span className="text-sm text-gray-500">{r.durationMin} 分钟</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentor Profile */}
        {rich?.mentorProfile && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              导师介绍
            </h2>
            <div className="p-8 rounded-2xl bg-white border border-amber-100 shadow-sm">
              <h3 className="text-2xl font-bold text-[#8B6914] mb-1">{rich.mentorProfile.name}</h3>
              <div className="text-gray-600 text-sm mb-4">{rich.mentorProfile.title}</div>
              <p className="text-gray-700 leading-relaxed mb-4">{rich.mentorProfile.bio}</p>
              {rich.mentorProfile.expertise && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {rich.mentorProfile.expertise.map((e) => (
                    <span key={e} className="px-3 py-1 text-xs rounded-full bg-[#8B6914]/10 text-[#8B6914] border border-[#8B6914]/20">
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {rich.mentorProfile.philosophy && (
                <p className="text-gray-500 italic">&ldquo;{rich.mentorProfile.philosophy}&rdquo;</p>
              )}
            </div>
          </section>
        )}

        {/* Transformation Path */}
        {rich?.transformationPath && rich.transformationPath.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              蜕变路径
            </h2>
            <div className="space-y-4">
              {rich.transformationPath.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#8B6914]/20 text-[#8B6914] font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {rich?.testimonials && rich.testimonials.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              蜕变见证
            </h2>
            <div className="space-y-6">
              {rich.testimonials.map((t, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <p className="text-xl text-[#8B6914] font-medium mb-6 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <div className="text-red-500 text-xs font-semibold mb-2">BEFORE</div>
                      <p className="text-gray-600 text-sm">{t.before}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <div className="text-green-600 text-xs font-semibold mb-2">AFTER</div>
                      <p className="text-gray-600 text-sm">{t.after}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B6914]/20 text-[#8B6914] font-bold flex items-center justify-center">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">{t.name}</div>
                      <div className="text-gray-500 text-sm">{t.role} · {t.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {rich?.gallery && rich.gallery.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">实景图集</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rich.gallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Target Audience */}
        {rich?.targetAudience && rich.targetAudience.length > 0 && (
          <section className="py-16 border-b border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">适合人群</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {rich.targetAudience.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <span className="text-[#8B6914] mt-0.5">✦</span>
                  <span className="text-gray-700">{a}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA + Form */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                开启{theme.title}
              </h2>
              <p className="text-gray-500">填写咨询表，我们的成长顾问将为您量身定制</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <PersonalInquiryForm defaultThemeId={theme.slug} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TimeBlock({ label, icon, text }: { label: string; icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <span className="text-[#8B6914] text-xs font-semibold">{label}</span>
        <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
