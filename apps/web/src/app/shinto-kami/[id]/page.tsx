import { Metadata } from "next";
import { fetchPatriarch, Patriarch } from "@/lib/api";
import ShintoKamiDetailClient from "./detail-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 神道教神灵 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: { title: `${p.name} — 神道教神灵`, description: p.biography?.slice(0, 160), ...(p.imageUrl ? { images: [p.imageUrl] } : {}) },
    };
  } catch { return { title: "神道教神灵 | JOINUS" }; }
}

export default async function ShintoKamiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patriarch: Patriarch | null = null;
  try { patriarch = await fetchPatriarch(id); } catch { /* not found */ }

  if (!patriarch) {
    return (
      <main className="min-h-screen bg-[#FFF1F2] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">⛩</span>
          <h1 className="text-2xl font-serif font-bold text-[#4C0519] mb-2">神灵未找到</h1>
          <p className="text-[#881337] text-sm mb-4">该神灵信息暂不存在</p>
          <Link href="/shinto-kami" className="px-6 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium rounded-xl transition-colors text-sm">返回神道教神灵</Link>
        </div>
      </main>
    );
  }
  return <ShintoKamiDetailClient patriarch={patriarch} />;
}
