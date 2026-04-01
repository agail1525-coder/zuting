import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import BahaiFigureDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 巴哈伊教人物 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 巴哈伊教人物`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "巴哈伊教人物 | JOINUS" }; }
}

export default async function BahaiFigureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#ECFEFF] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">✦</span>
          <h1 className="text-2xl font-serif font-bold text-[#083344] mb-2">人物未找到</h1>
          <p className="text-[#155E75] text-sm mb-4">该人物信息暂不存在</p>
          <Link href="/bahai-figures" className="px-6 py-3 bg-[#0891B2] hover:bg-[#0E7490] text-white font-medium rounded-xl transition-colors text-sm">返回巴哈伊教人物</Link>
        </div>
      </main>
    );
  }
  return <BahaiFigureDetailClient patriarch={patriarch} />;
}
