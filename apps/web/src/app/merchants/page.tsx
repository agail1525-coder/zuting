import { fetchMerchants } from "@/lib/api";
import MerchantsClient from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "旅途配套服务 — 佳绩之旅",
  description: "精选餐饮、住宿、导游、养生、摄影等优质旅游配套商家，让每一段文化之旅充实有趣。",
  openGraph: {
    title: "Travel Services & Partners — Joinus",
    description: "Curated dining, lodging, guides, wellness & more for your spiritual journey.",
  },
};

export default async function MerchantsPage() {
  // [FE-03] 后端 @Max(100) 分页上限,循环分页到 page<=10 取 1000 条
  const firstPage = await fetchMerchants({ pageSize: 100, page: 1 }).catch(() => ({ items: [], total: 0 }));
  const total = firstPage.total || 0;
  const items: typeof firstPage.items = Array.isArray(firstPage.items) ? [...firstPage.items] : [];

  const maxPages = Math.min(10, Math.ceil(total / 100));
  if (maxPages > 1) {
    const rest = await Promise.allSettled(
      Array.from({ length: maxPages - 1 }, (_, i) =>
        fetchMerchants({ pageSize: 100, page: i + 2 }),
      ),
    );
    for (const r of rest) {
      if (r.status === "fulfilled" && Array.isArray(r.value.items)) items.push(...r.value.items);
    }
  }

  return <MerchantsClient initialMerchants={items} initialTotal={total} />;
}
