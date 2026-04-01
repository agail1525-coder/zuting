import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import BahaiFiguresClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "巴哈伊教人物传承 — 五大传统 | JOINUS",
  description: "探索巴哈伊教从巴比运动先驱到圣约中心、从信仰之手到教务先驱的完整传承",
};

export default async function BahaiFiguresPage() {
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

  const rel = religions.find((r) => r.slug === "bahai");
  let filtered: Patriarch[] = [];
  if (rel) {
    filtered = patriarchs.filter(
      (p) => p.religionId === rel.id && p.school
    );
  }

  return (
    <BahaiFiguresClient
      patriarchs={filtered}
      religions={religions}
    />
  );
}
