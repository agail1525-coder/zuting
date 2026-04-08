import type { Metadata } from "next";
import { listThemes } from "@/lib/api/personal-growth";
import PersonalGrowthLanding from "./PersonalGrowthLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "企业家觉醒之旅 | Joinus 个人成长",
  description:
    "从创业者到跨国集团董事长的心灵修炼之旅。6大深度成长主题，12大信仰智慧，300座圣地。找回初心·锻造定力·升级格局·中年重生·慈悲觉醒·传灯传承。",
};

export default async function Page() {
  const themesRes = await listThemes(1, 6).catch(() => ({ items: [] as never[] }));
  const themes = Array.isArray(themesRes) ? themesRes : (themesRes?.items ?? []);
  return <PersonalGrowthLanding themes={themes} />;
}
