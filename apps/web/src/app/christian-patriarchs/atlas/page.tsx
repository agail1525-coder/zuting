export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "基督教先贤大图谱 — 全球传道地图 | JOINUS",
  description:
    "28位基督教先贤在全球地图上的传道轨迹、教派传承与圣地足迹。追寻使徒与圣人的脚步，走遍基督教文明圣地。",
};

export default async function ChristianAtlasPage() {
  const religions = await fetchReligions();
  const christianity = religions.find((r) => r.name === "基督教");
  const patriarchs = christianity ? await fetchPatriarchs(christianity.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
