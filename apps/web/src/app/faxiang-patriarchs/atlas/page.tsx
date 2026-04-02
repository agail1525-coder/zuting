export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "法相宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "法相宗祖师在全球地图上的修行轨迹。追寻玄奘大师丝绸之路西行求法的伟大足迹。",
};

export default async function FaxiangAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["法相宗", "唯识宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
