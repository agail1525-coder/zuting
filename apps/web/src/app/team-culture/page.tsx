import type { Metadata } from "next";
import { listThemes, listCases } from "@/lib/api/team-culture";
import TeamCultureLanding from "./TeamCultureLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "团队文化打造 | Joinus 朝圣之旅",
  description:
    "把团建升级为团队文化打造：6大文化主题包，60座祖庭圣地，12大信仰深度共修，让朝圣成为组织最深的纪念。",
};

export default async function Page() {
  const [themesRes, casesRes] = await Promise.allSettled([
    listThemes(1, 6),
    listCases(1, 4),
  ]);
  const themes = themesRes.status === "fulfilled" ? themesRes.value.items : [];
  const cases = casesRes.status === "fulfilled" ? casesRes.value.items : [];
  return <TeamCultureLanding themes={themes} cases={cases} />;
}
