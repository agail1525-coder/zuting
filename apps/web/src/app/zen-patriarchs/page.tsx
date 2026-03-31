import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import ZenPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "曹洞宗传承法脉 — 禅宗祖师 | JOINUS",
  description:
    "探索曹洞宗从洞山良价到当代的完整传承谱系，了解五家七宗禅宗历史",
};

export default async function ZenPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(undefined, "曹洞宗"),
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
    <ZenPatriarchsClient
      patriarchs={patriarchs}
      allBuddhismPatriarchs={allBuddhismPatriarchs}
      religions={religions}
    />
  );
}
