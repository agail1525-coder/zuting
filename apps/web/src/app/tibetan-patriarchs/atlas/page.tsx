export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "藏传佛教祖师大图谱 — 雪域法脉地图 | JOINUS",
  description:
    "25位藏传佛教祖师在全球地图上的弘法轨迹、宗派传承与建寺圣地。追寻莲花生、宗喀巴的足迹，走遍雪域高原。",
};

export default async function TibetanAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "藏传佛教");
  const patriarchs = religion
    ? await fetchPatriarchs(religion.id)
    : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
