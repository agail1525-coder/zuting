import type { Metadata } from "next";
import { fetchReligion, type Religion } from "@/lib/api";
import BusinessClient from "./client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const religion = await fetchReligion(slug);
    const title = `${religion.name}与商业实践 | 祖庭旅行`;
    const description = `探索${religion.name}智慧如何塑造世界级企业文化——标杆企业案例、商业大师语录、实践方法论、研究数据、推荐书单。`;
    return { title, description };
  } catch {
    return { title: "文化智慧与商业实践 | 祖庭旅行" };
  }
}

export default async function ReligionBusinessPage({ params }: Props) {
  const { slug } = await params;

  let religion: Religion | null = null;
  try {
    religion = await fetchReligion(slug);
  } catch {
    // not found
  }

  if (!religion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gold">文化传统未找到</h1>
      </div>
    );
  }

  return <BusinessClient religion={religion} />;
}
