export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "道教先贤大图谱 — 全球仙踪地图 | JOINUS",
  description:
    "29位道教先贤在全球地图上的修道轨迹、法脉传承与洞天福地。追寻仙真足迹，走遍道教名山圣地。",
};

export default async function TaoistAtlasPage() {
  const religions = await fetchReligions();
  const taoism = religions.find((r) => r.name === "道教");
  const patriarchs = taoism ? await fetchPatriarchs(taoism.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
