export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { fetchReligions } from "@/lib/api";
import AboutClient from "./client";

export const metadata: Metadata = {
  title: "关于我们 - 平台愿景与团队",
  description:
    "了解全球祖庭旅行平台的愿景、核心理念与团队。帮助100万人走祖庭，建立全球文化和平使者网络。About our mission to help 1 million people walk the ancestral temples.",
  openGraph: {
    title: "关于我们 - 祖庭之旅平台愿景与团队",
    description:
      "帮助100万人走祖庭，建立全球文化和平使者网络。了解我们的愿景、理念与团队。",
    url: "https://zuting.fszyl.top/about",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/about",
  },
};

export default async function AboutPage() {
  let religions: Awaited<ReturnType<typeof fetchReligions>> = [];
  try { religions = await fetchReligions(); } catch {}
  return <AboutClient religions={religions} />;
}
