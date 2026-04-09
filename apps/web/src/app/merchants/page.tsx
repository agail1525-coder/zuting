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
  const results = await Promise.allSettled([
    fetchMerchants({ pageSize: 100 }),
  ]);
  const data = results[0].status === "fulfilled" ? results[0].value : { items: [], total: 0 };
  const merchants = Array.isArray(data.items) ? data.items : [];
  const total = data.total || 0;

  return <MerchantsClient initialMerchants={merchants} initialTotal={total} />;
}
