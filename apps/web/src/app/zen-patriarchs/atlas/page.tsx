export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "禅宗祖师大图谱 — 全球法脉地图 | JOINUS",
  description:
    "63位禅宗祖师在全球地图上的修行轨迹、师承法脉与驻锡圣地。追寻祖师足迹，走遍天下祖庭。",
};

export default async function ZenAtlasPage() {
  const religions = await fetchReligions();
  const buddhism = religions.find((r) => r.name === "佛教");
  const patriarchs = buddhism
    ? await fetchPatriarchs(buddhism.id)
    : [];

  // Filter to Zen schools only
  const zenSchools = [
    "曹洞宗", "临济宗", "云门宗", "法眼宗", "沩仰宗",
    "日本曹洞宗", "日本临济宗", "韩国禅宗", "越南禅宗", "西方禅宗",
  ];
  const zenPatriarchs = patriarchs.filter((p) =>
    zenSchools.includes(p.school ?? "")
  );

  return <AtlasClient patriarchs={zenPatriarchs} />;
}
