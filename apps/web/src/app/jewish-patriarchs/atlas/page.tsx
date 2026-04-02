export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "犹太教先知大图谱 — 全球法脉地图 | JOINUS",
  description:
    "25位犹太教先知与拉比在全球地图上的足迹。从亚伯拉罕到迈蒙尼德，追寻信仰之父的应许之路。",
};

export default async function JewishAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "犹太教");
  const patriarchs = religion ? await fetchPatriarchs(religion.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
