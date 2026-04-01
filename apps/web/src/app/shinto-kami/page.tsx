import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import ShintoKamiClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "神道教神灵与思想家 — 五大传统 | JOINUS",
  description: "探索神道教从天津神到国津神、从神社创建者到近代教派神道的完整传承",
};

export default async function ShintoKamiPage() {
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

  const rel = religions.find((r) => r.slug === "shinto");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <ShintoKamiClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
