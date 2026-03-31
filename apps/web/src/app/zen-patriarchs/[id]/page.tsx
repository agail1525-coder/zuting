import { Metadata } from "next";
import { fetchPatriarch } from "@/lib/api";
import ZenPatriarchDetailClient from "./detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await fetchPatriarch(id);
    return {
      title: `${p.name}${p.title ? " · " + p.title : ""} — 禅宗祖师 | JOINUS`,
      description: p.biography?.slice(0, 160),
      openGraph: {
        title: `${p.name} — 禅宗祖师`,
        description: p.biography?.slice(0, 160),
        ...(p.imageUrl ? { images: [p.imageUrl] } : {}),
      },
    };
  } catch {
    return { title: "禅宗祖师 | JOINUS" };
  }
}

export default async function ZenPatriarchDetailPage({ params }: Props) {
  const { id } = await params;
  let patriarch;
  try {
    patriarch = await fetchPatriarch(id);
  } catch {
    patriarch = null;
  }

  if (!patriarch) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🧘</span>
          <h1 className="text-2xl font-serif text-[#2C1810]">祖师未找到</h1>
          <a href="/zen-patriarchs" className="text-[#8B6914] hover:underline mt-2 block">
            返回禅宗祖师
          </a>
        </div>
      </div>
    );
  }

  return <ZenPatriarchDetailClient patriarch={patriarch} />;
}
