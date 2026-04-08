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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
          <Link
            href="/team-culture/themes"
            className="text-white/90 hover:text-white mb-4 inline-block font-medium"
          >
            ← 返回方案库
          </Link>
          <div className="text-6xl mb-2 text-white drop-shadow-lg">
            {theme.icon}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-3 text-white drop-shadow-lg">{theme.title}</h1>
          {theme.subtitle && (
            <p className="text-xl text-white/90 drop-shadow">{theme.subtitle}</p>
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

      {/* Body */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4 text-[#3264ff]">文化内核</h2>
        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-12">
          {theme.description}
        </p>

        {Array.isArray(theme.rituals) && theme.rituals.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-[#3264ff]">
              共修仪式清单
            </h2>
            <div className="space-y-4 mb-12">
              {theme.rituals.map((r, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{r.name}</h3>
                    <span className="text-sm text-gray-500">
                      {r.durationMin} 分钟
                    </span>
                  </div>
                  <p className="text-gray-600">{r.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-100 shadow-sm mb-12">
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
                  {theme.durationDays} 天行程
                </div>
              )}
            </div>
            <a
              href="#inquiry"
              className="px-8 py-4 bg-[#3264ff] text-white font-semibold rounded-lg hover:bg-[#1e4dcc] shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
              立即询价
            </a>
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
