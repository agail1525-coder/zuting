import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import TiantaiPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "天台宗祖师传承 — 法华宗 | JOINUS",
  description:
    "探索天台宗从龙树菩萨到荆溪湛然的完整传承，了解一千五百年止观法门历史",
};

export default async function TiantaiPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(undefined, "天台宗"),
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
    <TiantaiPatriarchsClient
      patriarchs={patriarchs}
      allBuddhismPatriarchs={allBuddhismPatriarchs}
      religions={religions}
    />
  );
}
