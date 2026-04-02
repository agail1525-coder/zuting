export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "三论宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "三论宗祖师在全球地图上的修行轨迹。追寻鸠摩罗什大师丝绸之路东来译经的伟大足迹。",
};

export default async function SanlunAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["三论宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
