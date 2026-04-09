import { fetchReligions, fetchHolySites, fetchFeaturedRoutes, type Religion, type HolySite, type Route } from "@/lib/api";
import HolySitesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全球300圣地 - 横跨12大文化传统的文化圣地",
  description:
    "探索全球300个文化圣地，横跨佛教文化、道教文化、基督教文化、伊斯兰教文化等12大文化传统。含GPS坐标、详细介绍、地图导览。Explore 300 holy sites across 12 world faiths with maps and guides.",
  openGraph: {
    title: "全球300圣地 - 文化圣地导览 | 祖庭之旅",
    description:
      "探索全球300个文化圣地，横跨12大文化传统，含互动地图和详细介绍。",
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
