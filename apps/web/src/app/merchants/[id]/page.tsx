import { fetchMerchantDetail, fetchMerchants } from "@/lib/api";
import MerchantDetailClient from "./detail-client";

export const dynamic = "force-dynamic";

export default async function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const results = await Promise.allSettled([
    fetchMerchantDetail(id),
    fetchMerchants({ pageSize: 100 }),
  ]);

  const merchant = results[0].status === "fulfilled" ? results[0].value : null;
  const allMerchants = results[1].status === "fulfilled"
    ? (Array.isArray(results[1].value.items) ? results[1].value.items : [])
    : [];

  // Related merchants: same type, exclude current
  const related = merchant
    ? allMerchants.filter((m) => m.type === merchant.type && m.id !== merchant.id).slice(0, 4)
    : [];

  return <MerchantDetailClient merchant={merchant} relatedMerchants={related} />;
}
