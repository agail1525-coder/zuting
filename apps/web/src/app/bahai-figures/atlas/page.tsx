export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "巴哈伊教圣贤大图谱 — 世界和平地图 | JOINUS",
  description:
    "18位巴哈伊教圣贤在全球地图上的流放轨迹与宣教足迹。追寻巴哈欧拉从德黑兰到阿卡的苦难历程，见证信仰的力量。",
};

export default async function BahaiAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "巴哈伊教");
  const patriarchs = religion
    ? await fetchPatriarchs(religion.id)
    : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
