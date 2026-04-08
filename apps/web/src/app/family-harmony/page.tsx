import type { Metadata } from "next";
import { listThemes } from "@/lib/api/family-harmony";
import FamilyHarmonyLanding from "./FamilyHarmonyLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "家庭和谐 | Joinus 信仰修炼",
  description:
    "通过12种信仰智慧构建和谐家庭根基。夫妻同心·家族传承·亲子和解·三代感恩·亲子共修·寻根归宗。让信仰成为家庭最深的纽带。",
};

export default async function Page() {
  const themesRes = await listThemes(1, 6).catch(() => ({ items: [] as never[] }));
  const themes = Array.isArray(themesRes) ? themesRes : (themesRes?.items ?? []);
  return <FamilyHarmonyLanding themes={themes} />;
}
