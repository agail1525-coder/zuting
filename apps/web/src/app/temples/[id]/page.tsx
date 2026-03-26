import type { Metadata } from "next";
import { fetchTemple, type Temple } from "@/lib/api";
import TempleDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const temple = await fetchTemple(id);
    const title = `${temple.name} | 祖庭旅行`;
    const description = temple.description || `${temple.name}（${temple.nameEn}）- ${temple.country}的祖庭。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: temple.imageUrl ? [temple.imageUrl] : ["/og-default.jpg"],
      },
    };
  } catch {
    return { title: "祖庭详情 | 祖庭旅行" };
  }
}

export default async function TempleDetailPage({ params }: Props) {
  const { id } = await params;

  let temple: Temple | null = null;
  try {
    temple = await fetchTemple(id);
  } catch {
    // not found
  }

  if (!temple) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">Temple not found</h1>
      </div>
    );
  }

  return <TempleDetailClient temple={temple} />;
}
