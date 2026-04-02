export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "天台宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "天台宗六祖在全球地图上的修行轨迹。追寻智者大师与湛然大师的天台山法脉。",
};

export default async function TiantaiAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["天台宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
