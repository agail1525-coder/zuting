import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import SanlunPatriarchDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 三论宗祖师 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 三论宗祖师`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "三论宗祖师 | JOINUS" }; }
}

export default async function SanlunPatriarchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">💠</span>
          <h1 className="text-2xl font-serif font-bold text-[#2C1810] mb-2">祖师未找到</h1>
          <p className="text-[#6B5C4D] text-sm mb-4">该祖师信息暂不存在</p>
          <Link href="/sanlun-patriarchs" className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-medium rounded-xl transition-colors text-sm">返回三论宗祖师</Link>
        </div>
      </main>
    );
  }
  return <SanlunPatriarchDetailClient patriarch={patriarch} />;
}
