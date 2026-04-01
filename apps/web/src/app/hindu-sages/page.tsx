import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import HinduSagesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "印度教圣贤传承 — 五大学派 | JOINUS",
  description: "探索印度教从吠檀多哲学到瑜伽修行、从虔信运动到近现代复兴的完整圣贤传承",
};

export default async function HinduSagesPage() {
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

  const rel = religions.find((r) => r.slug === "hinduism");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <HinduSagesClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
