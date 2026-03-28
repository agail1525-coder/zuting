import {
  fetchReligions,
  fetchHolySites,
  fetchFeaturedRoutes,
  type Religion,
  type HolySite,
  type Route,
} from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let featuredRoutes: Route[] = [];
  let error = false;
  try {
    [religions, holySites, featuredRoutes] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchFeaturedRoutes(8),
    ]);
  } catch {
    error = true;
  }

  return (
    <HomeClient
      religions={religions}
      holySites={holySites}
      featuredRoutes={featuredRoutes}
      error={error}
    />
  );
}
