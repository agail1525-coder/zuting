import type { MetadataRoute } from "next";

const BASE_URL = "https://zuting.fszyl.top";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

async function fetchIds<T extends { id: string }>(
  endpoint: string
): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchReligionSlugs(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/religions`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchSealIds(): Promise<{ id: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/seals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

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

  // Dynamic pages
  const [religions, holySites, temples, patriarchs, teachings, seals] =
    await Promise.all([
      fetchReligionSlugs(),
      fetchIds<{ id: string }>("/holy-sites"),
      fetchIds<{ id: string }>("/temples"),
      fetchIds<{ id: string }>("/patriarchs"),
      fetchIds<{ id: string }>("/teachings"),
      fetchSealIds(),
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
