import { fetchReligions, fetchTeachings, type Religion, type Teaching } from "@/lib/api";
import TeachingsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "39条祖训 - 各信仰核心智慧",
  description:
    "聆听39条祖训，领悟佛教、道教、基督教、伊斯兰教等各信仰的核心智慧与经典原文。Discover 39 sacred teachings — core wisdom from world religions with original texts.",
  openGraph: {
    title: "39条祖训 - 信仰核心智慧 | 祖庭之旅",
    description: "聆听39条祖训，领悟各信仰的核心智慧与经典原文。",
    url: "https://zuting.fszyl.top/teachings",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/teachings",
  },
};

export default async function TeachingsPage() {
  let religions: Religion[] = [];
  let teachings: Teaching[] = [];
  try {
    [religions, teachings] = await Promise.all([
      fetchReligions(),
      fetchTeachings(),
    ]);
  } catch {
    // fallback
  }

  return <TeachingsClient religions={religions} teachings={teachings} />;
}
