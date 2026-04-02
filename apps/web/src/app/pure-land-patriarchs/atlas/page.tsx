export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "净土宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description: "净土宗十三祖在全球地图上的修行轨迹、师承法脉与驻锡圣地。追寻祖师足迹，走遍天下祖庭。",
};

export default async function PureLandAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism ? await fetchPatriarchs(buddhism.id) : [];
  const filtered = patriarchs.filter((p) => ["净土宗"].includes(p.school ?? ""));
  return <AtlasClient patriarchs={filtered} />;
}
