export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "律宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "律宗祖师在全球地图上的修行轨迹与弘律圣地。追寻南山律祖与鉴真大师的足迹。",
};

export default async function VinayaAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["律宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
