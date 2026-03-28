import type { Metadata } from "next";
import { fetchHolySite, type HolySite } from "@/lib/api";
import HolySiteDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const site = await fetchHolySite(id);
    const title = `${site.name} - ${site.country} | 祖庭旅行`;
    const description = site.description || `${site.name}（${site.nameEn}）- ${site.country}的圣地。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: site.imageUrl ? [site.imageUrl] : ["/og-default.svg"],
      },
    };
  } catch {
    return { title: "圣地详情 | 祖庭旅行" };
  }
}

export default async function HolySiteDetailPage({ params }: Props) {
  const { id } = await params;

  let site: HolySite | null = null;
  try {
    site = await fetchHolySite(id);
  } catch {
    // not found
  }

  if (!site) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">圣地未找到</h1>
      </div>
    );
  }

  return <HolySiteDetailClient site={site} />;
}
