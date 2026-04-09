import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import ConfucianPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "儒教文化先贤传承 — 五大学派28位圣贤 | JOINUS",
  description:
    "探索儒教文化从孔子孟子到阳明心学、从汉唐经学到现代新儒学的完整传承",
};

export default async function ConfucianPatriarchsPage() {
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

  const confucianRel = religions.find((r) => r.slug === "confucianism");
  let confucianPatriarchs: Patriarch[] = [];
  if (confucianRel) {
    confucianPatriarchs = patriarchs.filter(
      (p) => p.religionId === confucianRel.id && p.school
    );
  }

  return (
    <ConfucianPatriarchsClient
      patriarchs={confucianPatriarchs}
      religions={religions}
    />
  );
}
