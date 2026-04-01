import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import IndigenousSpiritDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 原住民灵性 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 原住民灵性`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "原住民灵性 | JOINUS" }; }
}

export default async function IndigenousSpiritDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#F5F5F4] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">◉</span>
          <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">先知未找到</h1>
          <p className="text-[#44403C] text-sm mb-4">该灵性先知信息暂不存在</p>
          <Link href="/indigenous-spirits" className="px-6 py-3 bg-[#78716C] hover:bg-[#57534E] text-white font-medium rounded-xl transition-colors text-sm">返回原住民灵性</Link>
        </div>
      </main>
    );
  }
  return <IndigenousSpiritDetailClient patriarch={patriarch} />;
}
