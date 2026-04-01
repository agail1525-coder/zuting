import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import VinayaPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "律宗祖师传承 — 南山律宗 | JOINUS",
  description:
    "探索律宗从昙柯迦罗到弘一法师的完整传承，了解一千七百年戒律法门历史",
};

export default async function VinayaPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(undefined, "律宗"),
      fetchReligions(),
    ]);
  } catch {
    // use defaults
  }

  let allBuddhismPatriarchs: Patriarch[] = [];
  try {
    const buddhismRel = religions.find((r) => r.slug === "buddhism");
    if (buddhismRel) {
      allBuddhismPatriarchs = await fetchPatriarchs(buddhismRel.id);
    }
  } catch {
    // use default
  }

  return (
    <VinayaPatriarchsClient
      patriarchs={patriarchs}
      allBuddhismPatriarchs={allBuddhismPatriarchs}
      religions={religions}
    />
  );
}
