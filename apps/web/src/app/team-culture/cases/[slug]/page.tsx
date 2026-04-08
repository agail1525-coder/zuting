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
    <main className="min-h-screen bg-white text-gray-900">
      <section className="py-16 max-w-4xl mx-auto px-6">
        <Link
          href="/team-culture/cases"
          className="text-[#3264ff] hover:text-[#1e4dcc] hover:underline mb-6 inline-block font-medium"
        >
          ← 返回案例列表
        </Link>
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
          {item.theme && (
            <span
              className="px-3 py-1 rounded-full bg-blue-50 text-[#3264ff] font-medium"
            >
              {item.theme.title}
            </span>
          )}
          <span>{item.headcount} 人</span>
          {item.industry && <span>{item.industry}</span>}
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">{item.teamName}</h1>

        {item.photos[0] && (
          <img
            src={item.photos[0]}
            alt={item.teamName}
            className="w-full h-96 object-cover rounded-2xl mb-10 shadow-md"
          />
        )}

        {item.highlights.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {item.highlights.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center text-[#3264ff] font-semibold"
              >
                {h}
              </div>
            ))}
          </div>
        )}

        <div className="prose max-w-none mb-10">
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {item.story}
          </p>
        </div>

        {item.testimonial && (
          <blockquote className="border-l-4 border-[#3264ff] bg-blue-50/60 text-blue-800 px-6 py-5 rounded-lg text-xl italic">
            &ldquo;{item.testimonial}&rdquo;
          </blockquote>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/team-culture#inquiry"
            className="inline-block px-8 py-4 bg-[#3264ff] text-white font-semibold rounded-lg hover:bg-[#1e4dcc] shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
          >
            为我的团队定制类似方案
          </Link>
        </div>
      </section>
    </main>
  );
}
