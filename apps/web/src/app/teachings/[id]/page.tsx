import type { Metadata } from "next";
import { fetchTeaching, type Teaching } from "@/lib/api";
import TeachingDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const teaching = await fetchTeaching(id);
    const title = `${teaching.name} | 祖庭旅行`;
    const description = teaching.translationCn
      ? teaching.translationCn.slice(0, 160)
      : teaching.originalText.slice(0, 160);
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
    return { title: "祖训详情 | 祖庭旅行" };
  }
}

export default async function TeachingDetailPage({ params }: Props) {
  const { id } = await params;

  let teaching: Teaching | null = null;
  try {
    teaching = await fetchTeaching(id);
  } catch {
    // not found
  }

  if (!teaching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">Teaching not found</h1>
      </div>
    );
  }

  return <TeachingDetailClient teaching={teaching} />;
}
