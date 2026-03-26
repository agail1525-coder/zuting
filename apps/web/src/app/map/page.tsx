import { fetchReligions, fetchHolySites, type Religion, type HolySite } from "@/lib/api";
import MapClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全球圣地地图 | 全球祖庭旅行平台",
  description: "在交互式世界地图上探索全球60个圣地，横跨12大信仰传统",
};

export default async function MapPage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  try {
    [religions, holySites] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
    ]);
  } catch {
    // fallback
  }

  return <MapClient religions={religions} holySites={holySites} />;
}
