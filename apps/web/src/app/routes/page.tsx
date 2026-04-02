import { fetchRoutes, fetchFeaturedRoutes, type PaginatedRoutes, type Route } from "@/lib/api";
import RoutesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "文化之旅路线 — Joinus 全球祖庭旅行平台",
  description: "探索全球文化圣地深度路线，禅宗路线、佛教圣地、道教寻根、基督教文化、伊斯兰文化、跨文化融合。一眼心动，说走就走。",
  openGraph: {
    title: "Cultural Journey Routes — Joinus",
    description: "Curated cultural pilgrimage routes across traditions — Zen, Buddhist, Taoist, Christian, Islamic & more.",
  },
};

export default async function RoutesPage() {
  const results = await Promise.allSettled([
    fetchRoutes({ pageSize: 20 }),
    fetchFeaturedRoutes(6),
  ]);

  const data: PaginatedRoutes = results[0].status === "fulfilled"
    ? results[0].value
    : { items: [], total: 0, page: 1, pageSize: 20 };
  const featuredRoutes: Route[] = results[1].status === "fulfilled"
    ? (Array.isArray(results[1].value) ? results[1].value : [])
    : [];
  const error = results[0].status === "rejected";

  return <RoutesClient initialData={data} featuredRoutes={featuredRoutes} error={error} />;
}
