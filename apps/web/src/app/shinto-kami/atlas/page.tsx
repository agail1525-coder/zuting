export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "神道教文化神灵大图谱 — 全球法脉地图 | JOINUS",
  description:
    "25位神道教文化神灵与神道家在日本地图上的圣地与传承。从天照大神到本居宣长，追寻神道千年灵脉。",
};

export default async function ShintoAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "神道教");
  const patriarchs = religion ? await fetchPatriarchs(religion.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
