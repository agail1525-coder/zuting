import type { MetadataRoute } from "next";
import {
  fetchReligions,
  fetchHolySites,
  fetchTemples,
  fetchPatriarchs,
  fetchTeachings,
  fetchSeals,
} from "@/lib/api";

const BASE_URL = "https://zuting.fszyl.top";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/religions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/holy-sites`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/temples`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/patriarchs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/teachings`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/seals`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/chat`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/trips`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/journals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  // Dynamic pages — reuse api.ts functions, catch errors to avoid breaking sitemap
  const safe = <T,>(p: Promise<T[]>): Promise<T[]> =>
    p.catch(() => [] as T[]);

  const [religions, holySites, temples, patriarchs, teachings, seals] =
    await Promise.all([
      safe(fetchReligions()),
      safe(fetchHolySites()),
      safe(fetchTemples()),
      safe(fetchPatriarchs()),
      safe(fetchTeachings()),
      safe(fetchSeals()),
    ]);

  const religionPages: MetadataRoute.Sitemap = religions.map((r) => ({
    url: `${BASE_URL}/religions/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const holySitePages: MetadataRoute.Sitemap = holySites.map((s) => ({
    url: `${BASE_URL}/holy-sites/${s.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const templePages: MetadataRoute.Sitemap = temples.map((t) => ({
    url: `${BASE_URL}/temples/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const patriarchPages: MetadataRoute.Sitemap = patriarchs.map((p) => ({
    url: `${BASE_URL}/patriarchs/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const teachingPages: MetadataRoute.Sitemap = teachings.map((t) => ({
    url: `${BASE_URL}/teachings/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const sealPages: MetadataRoute.Sitemap = seals.map((s) => ({
    url: `${BASE_URL}/seals/${s.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...religionPages,
    ...holySitePages,
    ...templePages,
    ...patriarchPages,
    ...teachingPages,
    ...sealPages,
  ];
}
