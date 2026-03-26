const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? "http://localhost:3002" : "");

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// --- Types ---

export interface Religion {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol: string | null;
  color: string | null;
}

export interface HolySite {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl: string | null;
  soundEffect: string | null;
  religionId: string;
  religion?: Religion;
}

export interface Temple {
  id: string;
  name: string;
  nameEn: string | null;
  country: string;
  foundingDate: string | null;
  description: string;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  religionId: string;
  religion?: Religion;
}

export interface Patriarch {
  id: string;
  name: string;
  nameEn: string | null;
  dates: string | null;
  title: string | null;
  biography: string;
  coreTeaching: string;
  imageUrl: string | null;
  religionId: string;
  religion?: Religion;
}

export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText: string | null;
  translationCn: string | null;
  religionId: string;
  religion?: Religion;
}

export type SealSeries =
  | "CHUYIN"
  | "ZHONGYIN"
  | "YINGUOYIN"
  | "CHENGDAOYIN"
  | "GUIYUANYIN";

export interface Seal {
  id: number;
  name: string;
  series: SealSeries;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color: string | null;
}

// --- Religions ---

export async function fetchReligions(): Promise<Religion[]> {
  return fetchJson<Religion[]>("/api/religions");
}

export async function fetchReligion(slug: string): Promise<Religion> {
  const list = await fetchJson<Religion[]>(`/api/religions?slug=${slug}`);
  if (list.length === 0) throw new Error(`Religion not found: ${slug}`);
  return list[0];
}

// --- Holy Sites ---

export async function fetchHolySites(
  religionId?: string
): Promise<HolySite[]> {
  const params = religionId ? `?religionId=${religionId}` : "";
  return fetchJson<HolySite[]>(`/api/holy-sites${params}`);
}

export async function fetchHolySite(id: string): Promise<HolySite> {
  return fetchJson<HolySite>(`/api/holy-sites/${id}`);
}

// --- Temples ---

export async function fetchTemples(religionId?: string): Promise<Temple[]> {
  const params = religionId ? `?religionId=${religionId}` : "";
  return fetchJson<Temple[]>(`/api/temples${params}`);
}

export async function fetchTemple(id: string): Promise<Temple> {
  return fetchJson<Temple>(`/api/temples/${id}`);
}

// --- Patriarchs ---

export async function fetchPatriarchs(
  religionId?: string
): Promise<Patriarch[]> {
  const params = religionId ? `?religionId=${religionId}` : "";
  return fetchJson<Patriarch[]>(`/api/patriarchs${params}`);
}

export async function fetchPatriarch(id: string): Promise<Patriarch> {
  return fetchJson<Patriarch>(`/api/patriarchs/${id}`);
}

// --- Teachings ---

export async function fetchTeachings(
  religionId?: string
): Promise<Teaching[]> {
  const params = religionId ? `?religionId=${religionId}` : "";
  return fetchJson<Teaching[]>(`/api/teachings${params}`);
}

export async function fetchTeaching(id: string): Promise<Teaching> {
  return fetchJson<Teaching>(`/api/teachings/${id}`);
}

// --- Search ---

export interface SearchResultItem {
  type: string;
  id: string | number;
  title: string;
  subtitle: string | null;
  descriptionSnippet: string | null;
  image: string | null;
  religion: { name: string; symbol: string | null; color: string | null } | null;
}

export interface SearchResponse {
  query: string;
  type: string;
  page: number;
  limit: number;
  total: number;
  results: SearchResultItem[];
}

export async function fetchSearch(
  q: string,
  type = "all",
  page = 1,
  limit = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, type, page: String(page), limit: String(limit) });
  return fetchJson<SearchResponse>(`/api/search?${params}`);
}

// --- Seals ---

export async function fetchSeals(series?: string): Promise<Seal[]> {
  const params = series ? `?series=${series}` : "";
  return fetchJson<Seal[]>(`/api/seals${params}`);
}

export async function fetchSeal(id: number): Promise<Seal> {
  return fetchJson<Seal>(`/api/seals/${id}`);
}
