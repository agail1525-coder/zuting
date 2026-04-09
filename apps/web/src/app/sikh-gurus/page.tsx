import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import SikhGurusClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "锡克教文化十位古鲁传承 — 五大传统 | JOINUS",
  description: "探索锡克教文化从那纳克古鲁到十位古鲁、从殉道英雄到近现代领袖的完整传承",
};

export default async function SikhGurusPage() {
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

  const rel = religions.find((r) => r.slug === "sikhism");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <SikhGurusClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
