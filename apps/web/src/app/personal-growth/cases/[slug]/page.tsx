import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCase } from "@/lib/api/personal-growth";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await getCase(slug);
    return { title: `${item.teamName} | 蜕变案例 | Joinus` };
  } catch {
    return { title: "蜕变案例 | Joinus" };
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
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 max-w-4xl mx-auto px-6">
        <Link href="/personal-growth/cases" className="text-[#D4A855] hover:text-[#E0B96E] text-sm">
          ← 蜕变案例
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">{item.teamName}</h1>
        {item.theme && (
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#D4A855]/10 text-[#D4A855] border border-[#D4A855]/20 mb-6">
            {item.theme.title}
          </span>
        )}
        <div className="prose prose-invert max-w-none mt-6">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{item.story}</p>
        </div>
        {item.highlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">亮点</h2>
            <ul className="space-y-2">
              {item.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-[#D4A855]">✦</span> {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.testimonial && (
          <div className="mt-8 p-6 rounded-2xl bg-gray-900/80 border border-[#D4A855]/10">
            <p className="text-[#D4A855] text-lg italic">&ldquo;{item.testimonial}&rdquo;</p>
          </div>
        )}
        {item.photos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {item.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="rounded-xl w-full aspect-video object-cover" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
