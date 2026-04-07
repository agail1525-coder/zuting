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
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-end"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, ${theme.color}, #0f172a)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
          <Link
            href="/team-culture/themes"
            className="text-[#D4A855] hover:underline mb-4 inline-block"
          >
            ← 返回方案库
          </Link>
          <div className="text-6xl mb-2" style={{ color: theme.color }}>
            {theme.icon}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-3">{theme.title}</h1>
          {theme.subtitle && (
            <p className="text-xl text-white/80">{theme.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {theme.keywords.map((k) => (
              <span
                key={k}
                className="px-3 py-1 text-sm rounded-full bg-white/10 text-white/80"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4 text-[#D4A855]">文化内核</h2>
        <p className="text-white/80 leading-relaxed text-lg whitespace-pre-line mb-12">
          {theme.description}
        </p>

        {Array.isArray(theme.rituals) && theme.rituals.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-[#D4A855]">
              共修仪式清单
            </h2>
            <div className="space-y-4 mb-12">
              {theme.rituals.map((r, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <span className="text-sm text-white/50">
                      {r.durationMin} 分钟
                    </span>
                  </div>
                  <p className="text-white/70">{r.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#D4A855]/10 to-transparent border border-[#D4A855]/30 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-white/60 text-sm mb-1">起价</div>
              {priceYuan ? (
                <div className="text-4xl font-bold text-[#D4A855]">
                  ¥{priceYuan.toLocaleString()}
                  <span className="text-base text-white/60 ml-2">/ 人</span>
                </div>
              ) : (
                <div className="text-2xl text-white/80">面议</div>
              )}
              {theme.durationDays && (
                <div className="text-white/60 text-sm mt-1">
                  {theme.durationDays} 天行程
                </div>
              )}
            </div>
            <a
              href="#inquiry"
              className="px-8 py-4 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg hover:bg-[#E5B968] transition"
            >
              立即询价
            </a>
          </div>
        </div>
      </section>

      <section id="inquiry" className="py-16 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          为「{theme.title}」定制方案
        </h2>
        <TeamInquiryForm defaultThemeId={theme.id} />
      </section>
    </main>
  );
}
