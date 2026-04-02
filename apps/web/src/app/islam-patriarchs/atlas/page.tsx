export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "伊斯兰先贤大图谱 — 全球传教地图 | JOINUS",
  description:
    "25位伊斯兰先贤在全球地图上的传教轨迹、学派传承与圣城足迹。追寻先知与学者的脚步，走遍伊斯兰文明圣地。",
};

export default async function IslamAtlasPage() {
  const religions = await fetchReligions();
  const islam = religions.find((r) => r.name === "伊斯兰教");
  const patriarchs = islam ? await fetchPatriarchs(islam.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
