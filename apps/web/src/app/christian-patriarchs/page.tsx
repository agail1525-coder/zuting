import { Metadata } from "next";
import { fetchPatriarchs, fetchReligions, Patriarch, Religion } from "@/lib/api";
import ChristianPatriarchsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "基督教先贤传承 — 五大传统28位大师 | JOINUS",
  description:
    "探索基督教从耶稣基督到近现代影响者、从使徒教父到宗教改革家的完整传承",
};

export default async function ChristianPatriarchsPage() {
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

  // Filter to Christianity patriarchs with school field
  const christianRel = religions.find((r) => r.slug === "christianity");
  let christianPatriarchs: Patriarch[] = [];
  if (christianRel) {
    christianPatriarchs = patriarchs.filter(
      (p) => p.religionId === christianRel.id && p.school
    );
  }

  return (
    <ChristianPatriarchsClient
      patriarchs={christianPatriarchs}
      religions={religions}
    />
  );
}
