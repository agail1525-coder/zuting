import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchFeaturedRoutes,
  fetchTeachings,
} from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const results = await Promise.allSettled([
    fetchReligions(),
    fetchHolySites(),
    fetchTemples(),
    fetchPatriarchs(),
    fetchFeaturedRoutes(8),
    fetchTeachings(),
  ]);
  const val = <T,>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];
  const religions = val(results[0]);
  const holySites = val(results[1]);
  const temples = val(results[2]);
  const patriarchs = val(results[3]);
  const featuredRoutes = val(results[4]);
  const teachings = val(results[5]);
  const error = results.every((r) => r.status === "rejected");

  return (
    <HomeClient
      religions={religions}
      holySites={holySites}
      temples={temples}
      patriarchs={patriarchs}
      featuredRoutes={featuredRoutes}
      teachings={teachings}
      error={error}
    />
  );
}
