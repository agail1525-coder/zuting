import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import IndigenousSpiritsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "原住民灵性传承 — 五大传统 | JOINUS",
  description: "探索原住民灵性从澳洲原住民到北美原住民、从萨满传统到非洲灵性的完整传承",
};

export default async function IndigenousSpiritsPage() {
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

  const rel = religions.find((r) => r.slug === "indigenous");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <IndigenousSpiritsClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
