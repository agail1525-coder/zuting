import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import SanlunPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "三论宗祖师传承 — 中观宗 | JOINUS",
  description:
    "探索三论宗从鸠摩罗什到嘉祥吉藏的完整传承，了解中观般若空义",
};

export default async function SanlunPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(undefined, "三论宗"),
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
    <SanlunPatriarchsClient
      patriarchs={patriarchs}
      allBuddhismPatriarchs={allBuddhismPatriarchs}
      religions={religions}
    />
  );
}
