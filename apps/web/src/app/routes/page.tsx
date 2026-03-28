import { fetchRoutes, type PaginatedRoutes } from "@/lib/api";
import RoutesClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "文化路线 - 深度路线旅行",
  description: "探索全球文化圣地深度路线，禅宗路线、佛教圣地、道教寻根、基督教文化、伊斯兰文化、跨文化融合。",
};

export default async function RoutesPage() {
  let data: PaginatedRoutes = { items: [], total: 0, page: 1, pageSize: 20 };
  let error = false;
  try {
    data = await fetchRoutes({ pageSize: 20 });
  } catch {
    error = true;
  }

  return <RoutesClient initialData={data} error={error} />;
}
