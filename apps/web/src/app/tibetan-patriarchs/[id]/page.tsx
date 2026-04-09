import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import TibetanPatriarchDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 藏传佛教文化大师 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 藏传佛教文化大师`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "藏传佛教文化大师 | JOINUS" }; }
}

export default async function TibetanPatriarchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">☸</span>
          <h1 className="text-2xl font-serif font-bold text-[#2E1065] mb-2">大师未找到</h1>
          <p className="text-[#4C1D95] text-sm mb-4">该大师信息暂不存在</p>
          <Link href="/tibetan-patriarchs" className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-xl transition-colors text-sm">返回藏传佛教文化大师</Link>
        </div>
      </main>
    );
  }
  return <TibetanPatriarchDetailClient patriarch={patriarch} />;
}
