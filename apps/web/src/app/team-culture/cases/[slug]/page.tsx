import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCase } from "@/lib/api/team-culture";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c = await getCase(slug);
    return { title: `${c.teamName} | 团队文化案例 | Joinus` };
  } catch {
    return { title: "案例 | Joinus" };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let item;
  try {
    item = await getCase(slug);
  } catch {
    notFound();
  }
  if (!item) notFound();

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="py-16 max-w-4xl mx-auto px-6">
        <Link
          href="/team-culture/cases"
          className="text-[#D4A855] hover:underline mb-6 inline-block"
        >
          ← 返回案例列表
        </Link>
        <div className="flex items-center gap-3 mb-4 text-sm text-white/60">
          {item.theme && (
            <span
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${item.theme.color}22`,
                color: item.theme.color,
              }}
            >
              {item.theme.title}
            </span>
          )}
          <span>{item.headcount} 人</span>
          {item.industry && <span>{item.industry}</span>}
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold mb-6">{item.teamName}</h1>

        {item.photos[0] && (
          <img
            src={item.photos[0]}
            alt={item.teamName}
            className="w-full h-96 object-cover rounded-2xl mb-10"
          />
        )}

        {item.highlights.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {item.highlights.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#D4A855]/10 border border-[#D4A855]/30 text-center text-[#D4A855] font-semibold"
              >
                {h}
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-invert max-w-none mb-10">
          <p className="text-white/80 leading-relaxed text-lg whitespace-pre-line">
            {item.story}
          </p>
        </div>

        {item.testimonial && (
          <blockquote className="p-6 rounded-2xl bg-white/5 border-l-4 border-[#D4A855] text-xl italic text-white/90">
            "{item.testimonial}"
          </blockquote>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/team-culture#inquiry"
            className="inline-block px-8 py-4 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg hover:bg-[#E5B968] transition"
          >
            为我的团队定制类似方案
          </Link>
        </div>
      </section>
    </main>
  );
}
