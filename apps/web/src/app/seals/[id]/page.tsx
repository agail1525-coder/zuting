import type { Metadata } from "next";
import { fetchSeal, fetchSeals, type Seal } from "@/lib/api";
import SealDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10);
  try {
    const seal = await fetchSeal(numId);
    const title = `第${seal.id}印 ${seal.name} | 祖庭旅行`;
    const description = seal.essence
      ? seal.essence.slice(0, 160)
      : `曹溪愿命三十印 - 第${seal.id}印「${seal.name}」。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ["/og-default.jpg"],
      },
    };
  } catch {
    return { title: "印详情 | 祖庭旅行" };
  }
}

export default async function SealDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let seal: Seal | null = null;
  let allSeals: Seal[] = [];
  try {
    [seal, allSeals] = await Promise.all([fetchSeal(numId), fetchSeals()]);
  } catch {
    // not found
  }

  if (!seal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">Seal not found</h1>
      </div>
    );
  }

  const sorted = allSeals.sort((a, b) => a.id - b.id);
  const idx = sorted.findIndex((s) => s.id === numId);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return <SealDetailClient seal={seal} prev={prev} next={next} />;
}
