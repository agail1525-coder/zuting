import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import TibetanPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "藏传佛教文化大师传承 — 五大教派 | JOINUS",
  description: "探索藏传佛教文化从宁玛派到格鲁派、从噶举派到利美运动的完整大师传承",
};

export default async function TibetanPatriarchsPage() {
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

  const rel = religions.find((r) => r.slug === "tibetan-buddhism");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <TibetanPatriarchsClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
