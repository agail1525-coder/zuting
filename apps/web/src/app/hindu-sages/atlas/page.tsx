export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "印度教圣贤大图谱 — 全球法脉地图 | JOINUS",
  description:
    "28位印度教圣贤在全球地图上的修行轨迹、师承法脉与朝圣圣地。从商羯罗到维韦卡南达，追寻圣贤足迹。",
};

export default async function HinduAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "印度教");
  const patriarchs = religion ? await fetchPatriarchs(religion.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
