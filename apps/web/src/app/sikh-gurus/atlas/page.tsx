export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "锡克教古鲁大图谱 — 全球法脉地图 | JOINUS",
  description:
    "22位锡克教古鲁与圣者在全球地图上的传道轨迹。从那纳克四次乌达西到戈宾德·辛格创立卡尔萨，追寻古鲁足迹。",
};

export default async function SikhAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "锡克教");
  const patriarchs = religion ? await fetchPatriarchs(religion.id) : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
