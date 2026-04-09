import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import TaoistPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "道教文化先贤传承 — 五大传统29位大师 | JOINUS",
  description:
    "探索道教文化从老子庄子到全真七子、从天师道到内丹养生的完整传承",
};

export default async function TaoistPatriarchsPage() {
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

  // Filter to Taoism patriarchs with school field
  const taoismRel = religions.find((r) => r.slug === "taoism");
  let taoistPatriarchs: Patriarch[] = [];
  if (taoismRel) {
    taoistPatriarchs = patriarchs.filter(
      (p) => p.religionId === taoismRel.id && p.school
    );
  }

  return (
    <TaoistPatriarchsClient
      patriarchs={taoistPatriarchs}
      religions={religions}
    />
  );
}
