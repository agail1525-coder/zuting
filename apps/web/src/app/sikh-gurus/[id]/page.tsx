import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import SikhGuruDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 锡克教古鲁 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 锡克教古鲁`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "锡克教古鲁 | JOINUS" }; }
}

export default async function SikhGuruDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">☬</span>
          <h1 className="text-2xl font-serif font-bold text-[#431407] mb-2">古鲁未找到</h1>
          <p className="text-[#7C2D12] text-sm mb-4">该古鲁信息暂不存在</p>
          <Link href="/sikh-gurus" className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-medium rounded-xl transition-colors text-sm">返回锡克教古鲁</Link>
        </div>
      </main>
    );
  }
  return <SikhGuruDetailClient patriarch={patriarch} />;
}
