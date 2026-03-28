import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchFeaturedRoutes,
  type Religion,
  type HolySite,
  type Temple,
  type Patriarch,
  type Route,
} from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let featuredRoutes: Route[] = [];
  let error = false;
  try {
    [religions, holySites, temples, patriarchs, featuredRoutes] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
      fetchPatriarchs(),
      fetchFeaturedRoutes(8),
    ]);
  } catch {
    error = true;
  }

  return (
    <HomeClient
      religions={religions}
      holySites={holySites}
      temples={temples}
      patriarchs={patriarchs}
      featuredRoutes={featuredRoutes}
      error={error}
    />
  );
}
