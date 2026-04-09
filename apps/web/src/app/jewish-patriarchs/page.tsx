import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import JewishPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "犹太教文化先贤传承 — 五大传统 | JOINUS",
  description: "探索犹太教文化从圣经先知到拉比传统、从卡巴拉神秘主义到近现代思想的完整先贤传承",
};

export default async function JewishPatriarchsPage() {
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

  const rel = religions.find((r) => r.slug === "judaism");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <JewishPatriarchsClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
