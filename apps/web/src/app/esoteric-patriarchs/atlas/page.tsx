export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "密宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "密宗祖师在全球地图上的修行轨迹。追寻不空三藏与空海大师的海上丝路法脉。",
};

export default async function EsotericAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["密宗", "真言宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
