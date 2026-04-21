import { fetchReligions, fetchHolySites, fetchTemples, type Religion, type HolySite, type Temple } from "@/lib/api";
import MapClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全球圣地地图 | 全球祖庭旅行平台",
  description: "在交互式世界地图上探索全球300+圣地与27座祖庭，横跨12大文化传统",
};

export default async function MapPage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let error = false;
  try {
    [religions, holySites, temples] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
    ]);
  } catch {
    error = true;
  }

  return <MapClient religions={religions} holySites={holySites} temples={temples} error={error} />;
}
