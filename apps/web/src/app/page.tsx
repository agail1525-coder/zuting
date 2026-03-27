import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchSeals,
  type Religion,
  type HolySite,
  type Temple,
  type Patriarch,
  type Seal,
} from "@/lib/api";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let seals: Seal[] = [];
  try {
    [religions, holySites, temples, patriarchs, seals] = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
      fetchPatriarchs(),
      fetchSeals(),
    ]);
  } catch {
    // fallback to empty
  }

  const featured = holySites.slice(0, 6);

  return (
    <HomeClient
      religions={religions}
      featuredSites={featured}
      allSites={holySites}
      temples={temples}
      patriarchs={patriarchs}
      seals={seals}
    />
  );
}
