export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "华严宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "华严宗五祖在全球地图上的修行轨迹。追寻法藏国师与澄观大师的华严法脉。",
};

export default async function HuayanAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["华严宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
