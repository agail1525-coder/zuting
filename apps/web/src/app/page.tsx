import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchFeaturedRoutes,
  fetchTeachings,
  type Religion,
  type HolySite,
  type Temple,
  type Patriarch,
  type Route,
  type Teaching,
} from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let featuredRoutes: Route[] = [];
  let teachings: Teaching[] = [];
  let error = false;
  try {
    const results = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
      fetchPatriarchs(),
      fetchFeaturedRoutes(8),
      fetchTeachings(),
    ]);
    religions = Array.isArray(results[0]) ? results[0] : [];
    holySites = Array.isArray(results[1]) ? results[1] : [];
    temples = Array.isArray(results[2]) ? results[2] : [];
    patriarchs = Array.isArray(results[3]) ? results[3] : [];
    featuredRoutes = Array.isArray(results[4]) ? results[4] : [];
    teachings = Array.isArray(results[5]) ? results[5] : [];
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
      teachings={teachings}
      error={error}
    />
  );
}
