export const dynamic = "force-dynamic";

import { fetchPatriarchs, fetchReligions } from "@/lib/api";
import AtlasClient from "./atlas-client";

export const metadata = {
  title: "原住民灵性大图谱 — 大地之声地图 | JOINUS",
  description:
    "22位原住民灵性先知在全球地图上的迁徙轨迹与传承圣地。从北美大平原到非洲草原，从南美安第斯到大洋洲梦境。",
};

export default async function IndigenousAtlasPage() {
  const religions = await fetchReligions();
  const religion = religions.find((r) => r.name === "原住民灵性");
  const patriarchs = religion
    ? await fetchPatriarchs(religion.id)
    : [];

  return <AtlasClient patriarchs={patriarchs} />;
}
