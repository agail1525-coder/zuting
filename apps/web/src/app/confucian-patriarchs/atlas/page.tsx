export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "儒教先贤大图谱 — 全球讲学地图 | JOINUS",
  description:
    "28位儒教先贤在全球地图上的讲学轨迹、学派传承与书院圣地。追寻圣贤足迹，走遍儒学文化重镇。",
};

export default async function ConfucianAtlasPage() {
  const religions = await fetchReligions();
  const confucianism = religions.find((r) => r.name === "儒教");
  const patriarchs = confucianism ? await fetchPatriarchs(confucianism.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
