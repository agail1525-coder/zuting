import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCase } from "@/lib/api/family-harmony";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await getCase(slug);
    return { title: `${item.teamName} | 家庭故事 | Joinus` };
  } catch {
    return { title: "家庭故事 | Joinus" };
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
    <main className="min-h-screen bg-[#FEFAF3] text-gray-900">
      <section className="py-20 max-w-4xl mx-auto px-6">
        <Link href="/family-harmony/cases" className="text-[#2D8B6F] hover:text-[#1B5E4A] text-sm">
          ← 家庭故事
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{item.teamName}</h1>
        {item.theme && (
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-emerald-50 text-[#2D8B6F] border border-emerald-200 mb-6">
            {item.theme.title}
          </span>
        )}
        <div className="prose max-w-none mt-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.story}</p>
        </div>
        {item.highlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">亮点</h2>
            <ul className="space-y-2">
              {item.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#2D8B6F]">✦</span> {h}
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.testimonial && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <p className="text-[#2D8B6F] text-lg italic">&ldquo;{item.testimonial}&rdquo;</p>
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
