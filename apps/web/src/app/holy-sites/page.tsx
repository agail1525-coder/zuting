import { fetchReligions, fetchHolySites, fetchFeaturedRoutes, type Religion, type HolySite, type Route } from "@/lib/api";
import HolySitesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全球60圣地 - 横跨12大信仰的朝圣圣地",
  description:
    "探索全球60个宗教圣地，横跨佛教、道教、基督教、伊斯兰教等12大信仰传统。含GPS坐标、详细介绍、地图导览。Explore 60 holy sites across 12 world faiths with maps and guides.",
  openGraph: {
    title: "全球60圣地 - 朝圣圣地导览 | 祖庭之旅",
    description:
      "探索全球60个宗教圣地，横跨12大信仰传统，含互动地图和详细介绍。",
    url: "https://zuting.fszyl.top/holy-sites",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/holy-sites",
  },
};

export default async function HolySitesPage() {
  const results = await Promise.allSettled([
    fetchReligions(),
    fetchHolySites(),
    fetchFeaturedRoutes(6),
  ]);

  const religions: Religion[] = results[0].status === "fulfilled" ? results[0].value : [];
  const holySites: HolySite[] = results[1].status === "fulfilled" ? results[1].value : [];
  const featuredRoutes: Route[] = results[2].status === "fulfilled"
    ? (Array.isArray(results[2].value) ? results[2].value : [])
    : [];
  const error = results[0].status === "rejected" && results[1].status === "rejected";

  return <HolySitesClient religions={religions} holySites={holySites} featuredRoutes={featuredRoutes} error={error} />;
}
