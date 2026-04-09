import type { Metadata } from "next";
import { fetchPatriarch, type Patriarch } from "@/lib/api";
import PatriarchDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const patriarch = await fetchPatriarch(id);
    const title = `${patriarch.name} | 佳绩之旅`;
    const description = patriarch.biography
      ? patriarch.biography.slice(0, 160)
      : `${patriarch.name}（${patriarch.nameEn}）- ${patriarch.title || "祖师"}。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: patriarch.imageUrl ? [patriarch.imageUrl] : ["/og-default.svg"],
      },
    };
  } catch {
    return { title: "祖师详情 | 佳绩之旅" };
  }
}

export default async function PatriarchDetailPage({ params }: Props) {
  const { id } = await params;

  let patriarch: Patriarch | null = null;
  try {
    patriarch = await fetchPatriarch(id);
  } catch {
    // not found
  }

  if (!patriarch) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">祖师未找到</h1>
      </div>
    );
  }

  return <PatriarchDetailClient patriarch={patriarch} />;
}
