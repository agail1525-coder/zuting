import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import PureLandPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "净土宗十三祖 — 净土宗祖师 | JOINUS",
  description:
    "探索净土宗从慧远大师到印光大师的完整传承，了解一千六百年念佛法门历史",
};

export default async function PureLandPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(undefined, "净土宗"),
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
    <PureLandPatriarchsClient
      patriarchs={patriarchs}
      allBuddhismPatriarchs={allBuddhismPatriarchs}
      religions={religions}
    />
  );
}
