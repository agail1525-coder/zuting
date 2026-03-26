import { fetchReligions, fetchHolySites, type Religion, type HolySite } from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  try {
    [religions, holySites] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
    ]);
  } catch {
    // fallback to empty
  }

  const featured = holySites.slice(0, 6);

  return <HomeClient religions={religions} featuredSites={featured} allSites={holySites} />;
}
