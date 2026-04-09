import type { Metadata } from "next";
import {
  fetchReligion,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchTeachings,
  type Religion,
  type HolySite,
  type Temple,
  type Patriarch,
  type Teaching,
} from "@/lib/api";
import ReligionDetailClient from "./detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const religion = await fetchReligion(slug);
    const title = `${religion.name} | 佳绩之旅`;
    const description = `探索${religion.name}（${religion.nameEn}）的圣地、祖庭、祖师与教义。走文化之旅，寻根源。`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ["/og-default.svg"],
      },
    };
  } catch {
    return { title: "文化传统详情 | 佳绩之旅" };
  }
}

export default async function ReligionDetailPage({ params }: Props) {
  const { slug } = await params;

  let religion: Religion | null = null;
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let teachings: Teaching[] = [];

  try {
    religion = await fetchReligion(slug);
    [holySites, temples, patriarchs, teachings] = await Promise.all([
      fetchHolySites(religion.id),
      fetchTemples(religion.id),
      fetchPatriarchs(religion.id),
      fetchTeachings(religion.id),
    ]);
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

  return (
    <ReligionDetailClient
      religion={religion}
      holySites={holySites}
      temples={temples}
      patriarchs={patriarchs}
      teachings={teachings}
    />
  );
}
