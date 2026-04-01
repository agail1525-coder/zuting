import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import IslamPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "伊斯兰教先贤传承 — 五大学派25位大师 | JOINUS",
  description:
    "探索伊斯兰教从先知穆罕默德到苏菲大师、从四大教法学派到学者旅行家的完整传承",
};

export default async function IslamPatriarchsPage() {
  let patriarchs: Patriarch[] = [];
  let religions: Religion[] = [];
  try {
    [patriarchs, religions] = await Promise.all([
      fetchPatriarchs(),
      fetchReligions(),
    ]);
  } catch {
    // use defaults
  }

  // Filter to Islam patriarchs with school field (exclude base 28 entries without school)
  const islamRel = religions.find((r) => r.slug === "islam");
  let islamPatriarchs: Patriarch[] = [];
  if (islamRel) {
    islamPatriarchs = patriarchs.filter(
      (p) => p.religionId === islamRel.id && p.school
    );
  }

  return (
    <IslamPatriarchsClient
      patriarchs={islamPatriarchs}
      religions={religions}
    />
  );
}
