export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? "http://localhost:3002" : "");

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

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

export interface ReligionKeyEvent {
  year: string;
  title: string;
  description: string;
}

export interface ReligionSacredText {
  name: string;
  description: string;
}

export interface Religion {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol: string | null;
  color: string | null;
  // 深度内容 (文化百科)
  heroImage?: string | null;
  tagline?: string | null;
  summary?: string | null;
  foundedYear?: string | null;
  founder?: string | null;
  followers?: string | null;
  origin?: string | null;
  development?: string | null;
  keyEvents?: ReligionKeyEvent[] | null;
  contributions?: string | null;
  controversies?: string | null;
  sacredTexts?: ReligionSacredText[] | null;
  // 商业实践 (信仰与企业文化)
  businessPhilosophy?: string | null;
  businessValues?: Array<{ key: string; label: string; description: string }> | null;
  businessInsight?: string | null;
  businessCases?: ReligionBusinessCases | null;
}

export interface BusinessCase {
  company: string;
  founder: string;
  industry: string;
  story: string;
  achievements: string[];
  faithPrinciple: string;
}

export interface BusinessMasterQuote {
  master: string;
  title: string;
  quote: string;
  context: string;
}

export interface BusinessPractice {
  name: string;
  description: string;
  companies: string[];
  outcome: string;
}

export interface BusinessResearch {
  title: string;
  source: string;
  finding: string;
}

export interface BusinessBook {
  title: string;
  author: string;
  description: string;
}

export interface ReligionBusinessCases {
  cases: BusinessCase[];
  masterQuotes: BusinessMasterQuote[];
  practices: BusinessPractice[];
  research: BusinessResearch[];
  books: BusinessBook[];
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
  galleryImages?: string[];
  soundEffect: string | null;
  religionId: string;
  religion?: Religion;
  reviewStats?: {
    averageRating: number;
    reviewCount: number;
  };
  ticketPrice?: string | null;
  visitDuration?: string | null;
  bestSeason?: string | null;
  openingHours?: string | null;
  transport?: string | null;
  tips?: string[];
  collectionCount?: number;
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

export interface PatriarchRef {
  id: string;
  name: string;
  nameEn: string | null;
  title?: string | null;
  imageUrl?: string | null;
  generation?: number | null;
  dates?: string | null;
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
  // Zen lineage fields
  school?: string | null;
  generation?: number | null;
  teacherId?: string | null;
  teacher?: PatriarchRef | null;
  disciples?: PatriarchRef[];
  koans?: { title: string; content: string; source?: string }[] | null;
  achievements?: string | null;
  templeNames?: { name: string; nameEn?: string; role?: string; location?: string }[] | null;
  classicQuotes?: string[] | null;
  works?: { title: string; description?: string }[] | null;
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
  const res = await fetchJson<PaginatedResponse<Religion> | Religion[]>("/api/religions?limit=100");
  if (Array.isArray(res)) return res;
  return res?.items || [];
}

export async function fetchReligion(slug: string): Promise<Religion> {
  return fetchJson<Religion>(`/api/religions/${encodeURIComponent(slug)}`);
}

// --- Holy Sites ---

export async function fetchHolySites(
  religionId?: string
): Promise<HolySite[]> {
  // Backend caps limit at 100, so paginate to fetch all sites (300+ globally)
  const all: HolySite[] = [];
  const MAX_PAGES = 10; // safety cap (1000 sites max)
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({ limit: "100", page: String(page) });
    if (religionId) params.set("religionId", religionId);
    const res = await fetchJson<PaginatedResponse<HolySite> | HolySite[]>(`/api/holy-sites?${params}`);
    const items = Array.isArray(res) ? res : (res?.items || []);
    all.push(...items);
    if (items.length < 100) break;
  }
  return all;
}

export async function fetchHolySite(id: string): Promise<HolySite> {
  return fetchJson<HolySite>(`/api/holy-sites/${id}`);
}

// --- Temples ---

export async function fetchTemples(religionId?: string): Promise<Temple[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (religionId) params.set("religionId", religionId);
  const res = await fetchJson<PaginatedResponse<Temple> | Temple[]>(`/api/temples?${params}`);
  if (Array.isArray(res)) return res;
  return res?.items || [];
}

export async function fetchTemple(id: string): Promise<Temple> {
  return fetchJson<Temple>(`/api/temples/${id}`);
}

// --- Patriarchs ---

export async function fetchPatriarchs(
  religionId?: string,
  school?: string,
): Promise<Patriarch[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (religionId) params.set("religionId", religionId);
  if (school) params.set("school", school);
  const res = await fetchJson<PaginatedResponse<Patriarch> | Patriarch[]>(`/api/patriarchs?${params}`);
  if (Array.isArray(res)) return res;
  return res?.items || [];
}

export async function fetchPatriarch(id: string): Promise<Patriarch> {
  return fetchJson<Patriarch>(`/api/patriarchs/${id}`);
}

// --- Teachings ---

export async function fetchTeachings(
  religionId?: string
): Promise<Teaching[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (religionId) params.set("religionId", religionId);
  const res = await fetchJson<PaginatedResponse<Teaching> | Teaching[]>(`/api/teachings?${params}`);
  if (Array.isArray(res)) return res;
  return res?.items || [];
}

export async function fetchTeaching(id: string): Promise<Teaching> {
  return fetchJson<Teaching>(`/api/teachings/${id}`);
}

// --- Search ---

export interface SearchResultItem {
  type: string;
  id: string | number;
  slug?: string;
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
  limit = 20,
  religionId?: string,
  sort?: string,
  country?: string,
  sortOrder?: string
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, type, page: String(page), limit: String(limit) });
  if (religionId) params.set("religionId", religionId);
  if (sort) params.set("sort", sort);
  if (country) params.set("country", country);
  if (sortOrder) params.set("sortOrder", sortOrder);
  return fetchJson<SearchResponse>(`/api/search?${params}`);
}

// --- Search: Suggestions ---
export interface SearchSuggestion {
  type: string;
  id: string | number;
  title: string;
  subtitle: string | null;
  image: string | null;
}

export interface SearchSuggestionsResponse {
  entities: SearchSuggestion[];
  keywords: string[];
}

export async function fetchSearchSuggestions(q: string): Promise<SearchSuggestionsResponse> {
  return fetchJson<SearchSuggestionsResponse>(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
}

// --- Search: Hot Keywords ---
export interface HotKeyword {
  keyword: string;
  count: number;
}

export async function fetchHotKeywords(): Promise<{ keywords: HotKeyword[] }> {
  return fetchJson<{ keywords: HotKeyword[] }>("/api/search/hot");
}

// --- Search: Map ---
export interface MapSearchItem {
  type: string;
  id: string;
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  religionName: string;
  religionColor: string | null;
}

export async function fetchMapSearch(bounds: {
  swLat: number; swLng: number; neLat: number; neLng: number;
}, religionId?: string): Promise<{ items: MapSearchItem[] }> {
  const params = new URLSearchParams({
    swLat: String(bounds.swLat), swLng: String(bounds.swLng),
    neLat: String(bounds.neLat), neLng: String(bounds.neLng),
  });
  if (religionId) params.set("religionId", religionId);
  return fetchJson<{ items: MapSearchItem[] }>(`/api/search/map?${params}`);
}

// --- Seals ---

export async function fetchSeals(series?: string): Promise<Seal[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (series) params.set("series", series);
  const res = await fetchJson<PaginatedResponse<Seal>>(`/api/seals?${params}`);
  return res.items;
}

export async function fetchSeal(id: number): Promise<Seal> {
  return fetchJson<Seal>(`/api/seals/${id}`);
}

// --- Trips ---

export type TripStatus =
  | "DRAFT"
  | "PLANNING"
  | "SUBMITTED"
  | "CONFIRMED"
  | "PAID"
  | "PREPARING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REVIEWING"
  | "CANCELLED"
  | "REFUNDING"
  | "REFUNDED";

export interface TripSite {
  id: string;
  order: number;
  visitDate: string | null;
  notes: string | null;
  site: HolySite;
}

export interface TripStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  action: string;
  operator: string | null;
  reason: string | null;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  status: TripStatus;
  startDate: string | null;
  endDate: string | null;
  persons: number | null;
  totalBudget: number | null;
  contactName: string | null;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  sites: TripSite[];
  _count?: { orders: number; journals: number };
}

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDING" | "REFUNDED";

export interface Order {
  id: string;
  orderNo: string;
  tripId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  paymentId: string | null;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
}

export interface JournalEntry {
  id: string;
  userId: string;
  tripId: string | null;
  siteId: string | null;
  title: string;
  content: string;
  images: string[];
  mood: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripDetail extends Trip {
  user: { id: string; nickname: string | null; avatar: string | null } | null;
  statusHistory: TripStatusHistory[];
  orders: Order[];
  journals: JournalEntry[];
  availableActions: string[];
  statusLabel: string;
  statusColor: string;
}

export interface TripListResponse {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchTrips(params?: {
  status?: TripStatus;
  page?: number;
  limit?: number;
}): Promise<TripListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return fetchJson<TripListResponse>(`/api/trips${q ? `?${q}` : ""}`);
}

export async function fetchTrip(id: string): Promise<TripDetail> {
  return fetchJson<TripDetail>(`/api/trips/${id}`);
}

// --- Notifications (authenticated) ---

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

let refreshInflight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInflight) return refreshInflight;
  const { getRefreshToken, setTokens, clearTokens } = await import("./auth");
  const refresh = getRefreshToken();
  if (!refresh) return null;
  refreshInflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

async function fetchAuthed<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { getAccessToken } = await import("./auth");
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const { timeoutMs = 15_000, ...fetchOptions } = options;

  const doFetch = async (bearer: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("请求超时，请重试"), timeoutMs);
    try {
      return await fetch(`${API_BASE}${url}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
          ...fetchOptions.headers,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let res = await doFetch(token);

  if (res.status === 401) {
    const fresh = await refreshAccessToken();
    if (!fresh) {
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
      throw new Error("Session expired");
    }
    res = await doFetch(fresh);
  }

  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) msg = typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function fetchOptionalAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const { getAccessToken } = await import("./auth");
  const token = getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: { ...headers, ...options.headers },
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchNotifications(
  page = 1,
  limit = 20,
  unreadOnly = false
): Promise<NotificationListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (unreadOnly) params.set("unreadOnly", "true");
  return fetchAuthed<NotificationListResponse>(
    `/api/notifications?${params}`
  );
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  return fetchAuthed<{ count: number }>("/api/notifications/unread-count");
}

export async function markNotificationAsRead(
  id: string
): Promise<Notification> {
  return fetchAuthed<Notification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<{
  updated: number;
}> {
  return fetchAuthed<{ updated: number }>("/api/notifications/read-all", {
    method: "POST",
  });
}

export async function deleteNotification(id: string): Promise<Notification> {
  return fetchAuthed<Notification>(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}

// --- Orders (authenticated) ---

export interface OrderDetail {
  id: string;
  orderNo: string;
  tripId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  paymentId: string | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  trip?: {
    id: string;
    title: string;
    status: string;
    sites?: Array<{
      id: string;
      order: number;
      site: { name: string; country: string };
    }>;
    user?: { id: string; nickname: string | null };
  };
}

export interface OrderListResponse {
  data: OrderDetail[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<OrderListResponse> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return fetchAuthed<OrderListResponse>(`/api/orders${q ? `?${q}` : ""}`);
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  return fetchAuthed<OrderDetail>(`/api/orders/${id}`);
}

export async function cancelOrder(id: string): Promise<OrderDetail> {
  return fetchAuthed<OrderDetail>(`/api/orders/${id}/cancel`, {
    method: "POST",
  });
}

export async function refundOrder(
  id: string,
  reason?: string
): Promise<OrderDetail> {
  return fetchAuthed<OrderDetail>(`/api/orders/${id}/refund`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// --- Trips (authenticated mutations) ---

export interface CreateTripData {
  title: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number;
  persons?: number;
  contactName?: string;
  contactPhone?: string;
  note?: string;
}

export async function createTrip(data: CreateTripData): Promise<Trip> {
  return fetchAuthed<Trip>("/api/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrip(
  id: string,
  data: Partial<CreateTripData>
): Promise<Trip> {
  return fetchAuthed<Trip>(`/api/trips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function transitionTrip(
  id: string,
  action: string
): Promise<TripDetail> {
  return fetchAuthed<TripDetail>(`/api/trips/${id}/transition`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export async function addSiteToTrip(
  tripId: string,
  siteId: string,
  order = 0
): Promise<TripSite> {
  return fetchAuthed<TripSite>(`/api/trips/${tripId}/sites`, {
    method: "POST",
    body: JSON.stringify({ siteId, order }),
  });
}

// ───── AI Trip Planner ─────
export interface AiTripPlanPackageHints {
  accommodation: string;
  transportation: string;
  meals: string;
  pace: string;
  highlights: string[];
}

export interface AiTripPlan {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  days: number;
  estimatedBudgetCents: number;
  siteIds: string[];
  packageHints: AiTripPlanPackageHints;
}

export interface EnrichedSiteData {
  name: string;
  nameEn?: string;
  country: string;
  city?: string;
  latitude: number;
  longitude: number;
  religionSlug: string;
  description: string;
  source: "AI_KNOWLEDGE";
  confidence: number;
}

export interface PlanTripResult {
  plans: AiTripPlan[];
  source: "llm" | "rule";
  warning?: string;
  enrichedSites?: Record<string, EnrichedSiteData>;
}

/**
 * Bulk-create AI-enriched holy sites and return ext_xxx → realId map.
 * Used after AI plan selection if plan.siteIds contains ext_* synthetic ids.
 */
export async function bulkCreateEnrichedHolySites(
  enrichedSites: Record<string, EnrichedSiteData>,
): Promise<Record<string, string>> {
  const sites = Object.entries(enrichedSites).map(([extId, data]) => ({
    extId,
    name: data.name,
    nameEn: data.nameEn,
    country: data.country,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    religionSlug: data.religionSlug,
    description: data.description,
    confidence: data.confidence,
  }));
  const res = await fetch(`${API_BASE}/api/holy-sites/from-enriched`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sites }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<Record<string, string>>;
}

export async function planTripWithAI(input: {
  title: string;
  note?: string;
  startDate?: string;
  endDate?: string;
  persons?: number;
  budgetCents?: number;
}): Promise<PlanTripResult> {
  // Public endpoint with long timeout — vLLM Qwen3.5 can take 60-150s under load
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);
  try {
    const res = await fetch(`${API_BASE}/api/trips/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<PlanTripResult>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function removeSiteFromTrip(
  tripId: string,
  siteId: string
): Promise<void> {
  return fetchAuthed<void>(`/api/trips/${tripId}/sites/${siteId}`, {
    method: "DELETE",
  });
}

// --- Orders (authenticated mutations) ---

export interface CreateOrderData {
  tripId: string;
  totalAmount: number;
  paymentMethod?: string;
  currency?: string;
  couponCode?: string;
  promotionId?: string;
}

export async function createOrder(data: CreateOrderData): Promise<OrderDetail> {
  return fetchAuthed<OrderDetail>("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Payments (authenticated) ---

export interface PaymentResult {
  transaction: {
    id: string;
    orderId: string;
    gateway: string;
    amount: number;
    status: string;
  };
  paymentParams: Record<string, unknown>;
}

export async function createPayment(
  orderId: string,
  gateway: string
): Promise<PaymentResult> {
  return fetchAuthed<PaymentResult>("/api/payments/create", {
    method: "POST",
    body: JSON.stringify({ orderId, gateway }),
  });
}

// --- Coupons ---

export interface CouponVerifyResult {
  valid: boolean;
  reason?: string;
  discount?: number;
  coupon?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
  };
}

export async function verifyCoupon(
  code: string,
  orderAmount: number
): Promise<CouponVerifyResult> {
  return fetchAuthed<CouponVerifyResult>("/api/coupons/verify", {
    method: "POST",
    body: JSON.stringify({ code, orderAmount }),
  });
}

// --- XiaoHong AI Chat ---

export interface ChatResponse {
  content: string;
  reply?: string;
  intent?: string;
  conversationId?: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export async function chatWithXiaohong(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  return fetchOptionalAuth<ChatResponse>("/api/xiaohong/chat", {
    method: "POST",
    body: JSON.stringify({ message, conversationId }),
  });
}

export async function fetchXiaohongSuggestions(): Promise<SuggestionsResponse> {
  return fetchJson<SuggestionsResponse>("/api/xiaohong/suggestions");
}

/** SSE streaming chat - returns an AbortController to cancel */
export function chatStreamXiaohong(
  message: string,
  conversationId?: string,
  onChunk?: (text: string, meta?: { intent?: string; conversationId?: string; done?: boolean }) => void,
): AbortController {
  const controller = new AbortController();
  const params = new URLSearchParams({ message });
  if (conversationId) params.set("conversationId", conversationId);
  const url = `${API_BASE}/api/xiaohong/chat/stream?${params.toString()}`;

  (async () => {
    const { getAccessToken } = await import("./auth");
    const token = getAccessToken();
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token || ""}` },
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        onChunk?.("小鸿暂时无法回答，请稍后再试。", { done: true });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              onChunk?.(data.content || "", {
                intent: data.intent,
                conversationId: data.conversationId,
                done: data.done,
              });
            } catch {
              onChunk?.(jsonStr, {});
            }
          }
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        onChunk?.("网络异常，请稍后再试。", { done: true });
      }
    }
  })();

  return controller;
}

// --- Journals (authenticated) ---

export interface JournalItem {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  images: string[];
  isPublic: boolean;
  createdAt: string;
  trip?: { id: string; title: string } | null;
  holySite?: { id: string; name: string } | null;
}

export interface JournalDetail extends JournalItem {
  userId?: string;
  user?: { nickname: string } | null;
}

export interface UpdateJournalData {
  title?: string;
  content?: string;
  mood?: string;
  images?: string[];
  isPublic?: boolean;
}

export interface JournalListResponse {
  data: JournalItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateJournalData {
  title: string;
  content: string;
  mood?: string;
  isPublic?: boolean;
  tripId?: string;
}

export async function fetchJournals(params?: {
  userId?: string;
  tripId?: string;
  page?: number;
  limit?: number;
}): Promise<JournalListResponse> {
  const qs = new URLSearchParams();
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.tripId) qs.set("tripId", params.tripId);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return fetchAuthed<JournalListResponse>(`/api/journals${q ? `?${q}` : ""}`);
}

export async function fetchJournal(id: string): Promise<JournalDetail> {
  return fetchAuthed<JournalDetail>(`/api/journals/${id}`);
}

export async function createJournal(
  data: CreateJournalData
): Promise<{ id: string }> {
  return fetchAuthed<{ id: string }>("/api/journals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateJournal(
  id: string,
  data: UpdateJournalData
): Promise<JournalDetail> {
  return fetchAuthed<JournalDetail>(`/api/journals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteJournal(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/journals/${id}`, {
    method: "DELETE",
  });
}

// --- Reviews ---

export interface ReviewUser {
  id: string;
  nickname: string | null;
  avatar: string | null;
}

export interface Review {
  id: string;
  rating: number;
  subScores?: Record<string, number>;
  content: string;
  images: string[];
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewListResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
  subScoreAverages?: Record<string, number>;
}

export interface CreateReviewData {
  targetType: "TRIP" | "GUIDE" | "SITE";
  targetId: string;
  rating: number;
  subScores?: Record<string, number>;
  content?: string;
  images?: string[];
}

export async function fetchReviewStats(
  targetType: string,
  targetId: string
): Promise<ReviewStats> {
  return fetchJson<ReviewStats>(
    `/api/reviews/stats/${targetType}/${targetId}`
  );
}

export async function fetchReviews(
  targetType: string,
  targetId: string,
  limit = 5
): Promise<ReviewListResponse> {
  const params = new URLSearchParams({
    targetType,
    targetId,
    limit: String(limit),
  });
  return fetchJson<ReviewListResponse>(`/api/reviews?${params}`);
}

export async function createReview(
  data: CreateReviewData
): Promise<Review> {
  return fetchAuthed<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Review Replies
export async function replyToReview(reviewId: string, content: string): Promise<{ id: string; content: string }> {
  return fetchAuthed<{ id: string; content: string }>(`/api/reviews/${reviewId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// Review Votes
export async function voteReview(reviewId: string): Promise<void> {
  await fetchAuthed<void>(`/api/reviews/${reviewId}/vote`, { method: "POST" });
}

export async function unvoteReview(reviewId: string): Promise<void> {
  await fetchAuthed<void>(`/api/reviews/${reviewId}/vote`, { method: "DELETE" });
}

export async function fetchReviewsWithSort(
  targetType: string,
  targetId: string,
  page = 1,
  limit = 5,
  sort: "latest" | "helpful" = "latest"
): Promise<ReviewListResponse> {
  const params = new URLSearchParams({
    targetType,
    targetId,
    page: String(page),
    limit: String(limit),
    sort,
  });
  return fetchJson<ReviewListResponse>(`/api/reviews?${params}`);
}

// --- Recommendations ---
export interface RecommendationItem {
  type: string;
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  country?: string;
  religionName: string;
  religionColor: string | null;
}

export async function fetchRelatedItems(
  entityType: string,
  entityId: string,
  limit = 6
): Promise<RecommendationItem[]> {
  const params = new URLSearchParams({ entityType, entityId, limit: String(limit) });
  const res = await fetchJson<RecommendationItem[] | { items: RecommendationItem[] }>(`/api/recommendations/related?${params}`);
  return Array.isArray(res) ? res : (res?.items ?? []);
}

export async function fetchHomepageRecommendations(limit = 12): Promise<{ items: RecommendationItem[] }> {
  try {
    return await fetchOptionalAuth<{ items: RecommendationItem[] }>(`/api/recommendations?limit=${limit}`);
  } catch {
    return fetchJson<{ items: RecommendationItem[] }>(`/api/recommendations/popular?limit=${limit}`);
  }
}

export async function fetchPopularItems(religion?: string, limit = 10): Promise<{ items: RecommendationItem[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (religion) params.set("religion", religion);
  return fetchJson<{ items: RecommendationItem[] }>(`/api/recommendations/popular?${params}`);
}

export async function recordView(entityType: string, entityId: string): Promise<void> {
  try {
    await fetchAuthed<void>("/api/recommendations/view-history", {
      method: "POST",
      body: JSON.stringify({ entityType, entityId }),
    });
  } catch { /* silent fail for non-authenticated users */ }
}

export async function fetchViewHistory(limit = 20): Promise<{ items: Array<{ entityType: string; entityId: string; viewedAt: string }> }> {
  return fetchAuthed(`/api/recommendations/view-history?limit=${limit}`);
}

// --- Profile ---

export interface UpdateProfileData {
  nickname?: string;
  avatar?: string;
  phone?: string;
}

export async function updateProfile(
  data: UpdateProfileData
): Promise<{ id: string; nickname: string; avatar: string | null; phone: string | null }> {
  return fetchAuthed(`/api/auth/profile`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// --- Auth ---

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  nickname: string;
  avatar: string | null;
  role: string;
  phone: string | null;
  email: string | null;
  _count: { trips: number; orders: number; journals: number; practices: number };
}

async function fetchAuthEndpoint<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = Array.isArray(err.message)
        ? err.message.join("; ")
        : err.message || `Auth error: ${res.status}`;
      throw new Error(msg);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return fetchAuthEndpoint<AuthUser>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function loginUser(
  phone: string,
  password: string
): Promise<AuthTokens> {
  return fetchAuthEndpoint<AuthTokens>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export async function registerUser(body: {
  phone?: string;
  email?: string;
  password: string;
  nickname: string;
}): Promise<AuthTokens> {
  return fetchAuthEndpoint<AuthTokens>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logoutUser(token: string): Promise<void> {
  await fetchAuthEndpoint<void>("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch((err) => { console.error('Logout request failed:', err); });
}

// --- OAuth Providers ---

export interface OAuthProviders {
  wechat: boolean;
  google: boolean;
}

export async function fetchAuthProviders(): Promise<OAuthProviders> {
  return fetchJson<OAuthProviders>("/api/auth/providers");
}

// --- Route (路线产品) ---

export interface Route {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: string;
  difficulty: string;
  duration: number;
  nights: number;
  coverImage: string | null;
  images: string[];
  highlights: string[];
  description: string;
  itinerary: ItineraryDay[];
  priceFrom: number;
  included: string[];
  excluded: string[];
  tips: string[];
  season: string;
  groupSize: string;
  status: string;
  rating: number | null;
  reviewCount: number;
  bookCount: number;
  religionId: string | null;
  religion?: Religion | null;
  sites?: RouteSiteWithDetail[];
  _count?: { bookings: number };
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities?: string[];
  meals?: string[];
  accommodation?: string;
}

export interface RouteSiteWithDetail {
  id: string;
  day: number;
  order: number;
  duration: string | null;
  note: string | null;
  site: {
    id: string;
    name: string;
    nameEn: string;
    country: string;
    latitude: number;
    longitude: number;
    imageUrl: string | null;
  };
}

export interface PaginatedRoutes {
  items: Route[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchRoutes(params?: {
  category?: string;
  difficulty?: string;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}): Promise<PaginatedRoutes> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
  if (params?.minDuration) searchParams.set("minDuration", String(params.minDuration));
  if (params?.maxDuration) searchParams.set("maxDuration", String(params.maxDuration));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.sort) searchParams.set("sort", params.sort);
  const qs = searchParams.toString();
  return fetchJson<PaginatedRoutes>(`/api/routes${qs ? `?${qs}` : ""}`);
}

export async function fetchRouteBySlug(slug: string): Promise<Route> {
  return fetchJson<Route>(`/api/routes/${slug}`);
}

export async function fetchFeaturedRoutes(limit = 8): Promise<Route[]> {
  const res = await fetchJson<Route[] | { items: Route[] }>(`/api/routes/featured?limit=${limit}`);
  return Array.isArray(res) ? res : (res?.items || []);
}

export async function fetchRoutesBySite(siteId: string): Promise<Route[]> {
  return fetchJson<Route[]>(`/api/routes/by-site/${siteId}`);
}

// --- Collections (authenticated) ---

export type CollectionEntityType = 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH' | 'TRIP' | 'ROUTE';

export interface CollectionItem {
  id: string;
  entityType: CollectionEntityType;
  entityId: string;
  note: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
  _count?: { items: number };
}

export async function fetchCollections(): Promise<Collection[]> {
  return fetchAuthed<Collection[]>("/api/collections");
}

export async function fetchCollection(id: string): Promise<Collection> {
  return fetchAuthed<Collection>(`/api/collections/${id}`);
}

export async function createCollection(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<Collection> {
  return fetchAuthed<Collection>("/api/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCollection(id: string, data: {
  name?: string;
  description?: string;
  isPublic?: boolean;
}): Promise<Collection> {
  return fetchAuthed<Collection>(`/api/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCollection(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/collections/${id}`, { method: "DELETE" });
}

export async function addToCollection(collectionId: string, data: {
  entityType: CollectionEntityType;
  entityId: string;
  note?: string;
}): Promise<CollectionItem> {
  return fetchAuthed<CollectionItem>(`/api/collections/${collectionId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeFromCollection(collectionId: string, itemId: string): Promise<void> {
  await fetchAuthed<void>(`/api/collections/${collectionId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function quickSave(entityType: CollectionEntityType, entityId: string): Promise<CollectionItem> {
  return fetchAuthed<CollectionItem>("/api/collections/quick-save", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId }),
  });
}

export async function checkSaved(entityType: CollectionEntityType, entityId: string): Promise<{
  saved: boolean;
  collections: Array<{ id: string; name: string }>;
}> {
  const params = new URLSearchParams({ entityType, entityId });
  return fetchAuthed<{ saved: boolean; collections: Array<{ id: string; name: string }> }>(
    `/api/collections/check?${params}`
  );
}

// --- Coupons (full CRUD + claim) ---

export interface CouponItem {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minAmount: number | null;
  maxDiscount: number | null;
  startAt: string;
  endAt: string;
  totalCount: number;
  usedCount: number;
  isActive: boolean;
}

export interface UserCouponItem {
  id: string;
  couponId: string;
  userId: string;
  status: string;
  orderId: string | null;
  usedAt: string | null;
  createdAt: string;
  coupon: CouponItem;
}

export async function fetchAvailableCoupons(page = 1): Promise<{ items: CouponItem[]; total: number }> {
  return fetchJson(`/api/coupons/available?page=${page}`);
}

export async function claimCoupon(couponId: string): Promise<UserCouponItem> {
  return fetchAuthed<UserCouponItem>(`/api/coupons/${couponId}/claim`, { method: "POST" });
}

export async function fetchMyCoupons(status?: string, page = 1): Promise<{ items: UserCouponItem[]; total: number }> {
  const p = new URLSearchParams({ page: String(page) });
  if (status) p.set("status", status);
  return fetchAuthed(`/api/coupons/my/claimed?${p}`);
}

export async function applyCoupon(code: string, orderId: string): Promise<{ discount: number }> {
  return fetchAuthed<{ discount: number }>("/api/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ code, orderId }),
  });
}

// --- Membership ---
export interface MembershipData {
  id: string; userId: string; level: number; levelName: string; totalPoints: number; availablePoints: number;
}
export interface PointsTransactionItem {
  id: string; type: string; amount: number; source: string; description: string; createdAt: string;
}
export interface LevelInfo {
  level: number; name: string; minPoints: number; perks: string[];
}

export async function fetchMyMembership(): Promise<MembershipData> {
  return fetchAuthed("/api/membership/me");
}
export async function fetchPointsHistory(page = 1): Promise<{ items: PointsTransactionItem[]; total: number }> {
  return fetchAuthed(`/api/membership/points?page=${page}`);
}
export async function checkin(): Promise<{ points: number; streak: number; bonus: number }> {
  return fetchAuthed("/api/membership/checkin", { method: "POST" });
}
export async function fetchCheckinCalendar(year: number, month: number): Promise<{ dates: string[] }> {
  return fetchAuthed(`/api/membership/checkin-calendar?year=${year}&month=${month}`);
}
export async function fetchLevels(): Promise<LevelInfo[]> {
  return fetchJson("/api/membership/levels");
}

// --- Referral ---
export interface InviteCodeData { code: string; totalInvites: number; totalRewards: number }
export interface ReferralStats { totalInvites: number; level1Count: number; level2Count: number; totalRewards: number; monthlyRewards: number }
export interface TeamMember { id: string; inviteeId: string; level: number; createdAt: string }
export interface ReferralRewardItem { id: string; orderId: string; amount: number; level: number; status: string; createdAt: string }

export async function fetchMyInviteCode(): Promise<InviteCodeData> {
  return fetchAuthed("/api/referral/my-code");
}
export async function fetchMyTeam(): Promise<{ level1: TeamMember[]; level2: TeamMember[] }> {
  return fetchAuthed("/api/referral/my-team");
}
export async function fetchMyRewards(page = 1): Promise<{ items: ReferralRewardItem[]; total: number }> {
  return fetchAuthed(`/api/referral/my-rewards?page=${page}`);
}
export async function fetchReferralStats(): Promise<ReferralStats> {
  return fetchAuthed("/api/referral/stats");
}
export async function bindInviteCode(code: string): Promise<void> {
  await fetchAuthed("/api/referral/bind", { method: "POST", body: JSON.stringify({ code }) });
}

// --- Points Mall ---
export interface PointsProductItem {
  id: string; name: string; description: string | null; coverImage: string | null; category: string;
  pointsCost: number; originalPrice: number | null; stock: number; soldCount: number; isActive: boolean;
}
export interface PointsExchangeItem {
  id: string; productId: string; pointsSpent: number; status: string; createdAt: string; product: PointsProductItem;
}

export async function fetchPointsProducts(category?: string, page = 1): Promise<{ items: PointsProductItem[]; total: number }> {
  const p = new URLSearchParams({ page: String(page) });
  if (category) p.set("category", category);
  return fetchJson(`/api/points-mall/products?${p}`);
}
export async function fetchPointsProduct(id: string): Promise<PointsProductItem> {
  return fetchJson(`/api/points-mall/products/${id}`);
}
export async function exchangeProduct(productId: string): Promise<PointsExchangeItem> {
  return fetchAuthed("/api/points-mall/exchange", { method: "POST", body: JSON.stringify({ productId }) });
}
export async function fetchMyExchanges(page = 1): Promise<{ items: PointsExchangeItem[]; total: number }> {
  return fetchAuthed(`/api/points-mall/my-exchanges?page=${page}`);
}

// --- Packages ---
export interface PackageItem {
  id: string; name: string; description: string | null; coverImage: string | null; packageType: string;
  basePrice: number; memberPrice: number | null; includes: Record<string, boolean>; duration: number;
  maxPersons: number; isActive: boolean;
}
export interface PackageBookingItem {
  id: string; packageId: string; persons: number; totalPrice: number; status: string; startDate: string; createdAt: string; package: PackageItem;
}

export async function fetchPackages(params?: { type?: string; page?: number }): Promise<{ items: PackageItem[]; total: number }> {
  const p = new URLSearchParams();
  if (params?.type) p.set("type", params.type);
  if (params?.page) p.set("page", String(params.page));
  return fetchJson(`/api/packages?${p}`);
}
export async function fetchPackage(id: string): Promise<PackageItem> {
  return fetchJson(`/api/packages/${id}`);
}
export async function bookPackage(packageId: string, data: { persons: number; startDate: string; contactName?: string; contactPhone?: string }): Promise<PackageBookingItem> {
  return fetchAuthed(`/api/packages/${packageId}/book`, { method: "POST", body: JSON.stringify(data) });
}
export async function fetchMyPackageBookings(page = 1): Promise<{ items: PackageBookingItem[]; total: number }> {
  return fetchAuthed(`/api/packages/my-bookings?page=${page}`);
}

export async function payOrder(
  orderId: string,
  data: { paidAmount?: number; paymentMethod?: string; paymentId?: string }
): Promise<OrderDetail> {
  return fetchAuthed<OrderDetail>(`/api/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Promotions ---

export interface PromotionItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  discountType: string;
  discountValue: number;
  minAmount: number | null;
  maxDiscount: number | null;
  startAt: string;
  endAt: string;
  entityType: string | null;
  entityIds: string[];
  totalQuota: number;
  usedQuota: number;
  coverImage: string | null;
  isActive: boolean;
}

export async function fetchPromotions(type?: string, page = 1): Promise<{ items: PromotionItem[]; total: number }> {
  const p = new URLSearchParams({ page: String(page) });
  if (type) p.set("type", type);
  return fetchJson(`/api/promotions?${p}`);
}

export async function fetchPromotion(id: string): Promise<PromotionItem> {
  return fetchJson<PromotionItem>(`/api/promotions/${id}`);
}

export async function verifyPromotion(
  promotionId: string,
  orderAmount: number
): Promise<{ valid: boolean; discount?: number; reason?: string }> {
  return fetchAuthed<{ valid: boolean; discount?: number; reason?: string }>("/api/promotions/verify", {
    method: "POST",
    body: JSON.stringify({ promotionId, orderAmount }),
  });
}

export async function applyPromotion(
  promotionId: string,
  orderId: string
): Promise<{ discount: number }> {
  return fetchAuthed<{ discount: number }>("/api/promotions/apply", {
    method: "POST",
    body: JSON.stringify({ promotionId, orderId }),
  });
}

// --- Guides (攻略) ---

export interface GuideAuthor {
  id: string;
  nickname: string;
  avatar: string | null;
}

export interface GuideItem {
  id: string;
  title: string;
  coverImage: string | null;
  content: string;
  entityType: string | null;
  entityId: string | null;
  tags: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  user: GuideAuthor;
}

export interface GuideListResponse {
  items: GuideItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GuideComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface GuideCommentListResponse {
  items: GuideComment[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Questions (问答) ---

export interface QuestionItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  entityType: string | null;
  entityId: string | null;
  tags: string[];
  status: string;
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

export interface QuestionListResponse {
  items: QuestionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AnswerItem {
  id: string;
  userId: string;
  content: string;
  isAccepted: boolean;
  voteCount: number;
  createdAt: string;
}

export interface QuestionDetail extends QuestionItem {
  answers: AnswerItem[];
}

// --- Community ---

export interface LeaderboardEntry {
  userId: string;
  nickname: string;
  avatar: string | null;
  count: number;
  rank: number;
}

export interface TrendingContent {
  hotGuides: GuideItem[];
  hotQuestions: QuestionItem[];
}

export interface PhotoItem {
  id: string;
  url: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

// --- UserProfile ---

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  pilgrimLevel: number;
  totalTrips: number;
  totalSites: number;
  guideCount: number;
  reviewCount: number;
  followerCount: number;
  followingCount: number;
}

// --- Guides API ---
export async function fetchGuides(params?: { tag?: string; sort?: string; page?: number; limit?: number }): Promise<GuideListResponse> {
  const p = new URLSearchParams();
  if (params?.tag) p.set("tag", params.tag);
  if (params?.sort) p.set("sort", params.sort);
  if (params?.page) p.set("page", String(params.page));
  if (params?.limit) p.set("limit", String(params.limit));
  // Backend returns {data, total, page, limit}; normalize to {items, total, page, pageSize}
  const raw = await fetchJson<{ data?: GuideItem[]; items?: GuideItem[]; total: number; page: number; limit?: number; pageSize?: number }>(`/api/guides?${p}`);
  return {
    items: raw.items ?? raw.data ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    pageSize: raw.pageSize ?? raw.limit ?? 20,
  };
}

export async function fetchGuide(id: string): Promise<GuideItem> {
  return fetchJson<GuideItem>(`/api/guides/${id}`);
}

export async function createGuide(data: { title: string; content: string; coverImage?: string; entityType?: string; entityId?: string; tags?: string[] }): Promise<GuideItem> {
  return fetchAuthed<GuideItem>("/api/guides", { method: "POST", body: JSON.stringify(data) });
}

export async function updateGuide(id: string, data: Partial<{ title: string; content: string; coverImage: string; tags: string[] }>): Promise<GuideItem> {
  return fetchAuthed<GuideItem>(`/api/guides/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteGuide(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/guides/${id}`, { method: "DELETE" });
}

export async function publishGuide(id: string): Promise<GuideItem> {
  return fetchAuthed<GuideItem>(`/api/guides/${id}/publish`, { method: "POST" });
}

// --- AI Draft Guide ---
export interface AiDraftGuideInput {
  rawNotes: string;
  imageUrls?: string[];
  category?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
}

export interface AiDraftGuideResult {
  title: string;
  content: string; // markdown with inline ![](url)
  tags: string[];
  suggestedCoverIdx: number; // -1 if none
}

export async function aiDraftGuide(input: AiDraftGuideInput): Promise<AiDraftGuideResult> {
  // LLM 生成耗时通常 20-60s，给 3 分钟缓冲
  return fetchAuthed<AiDraftGuideResult>("/api/guides/ai-draft", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: 180_000,
  });
}

export async function fetchGuideComments(guideId: string, page = 1): Promise<GuideCommentListResponse> {
  return fetchJson<GuideCommentListResponse>(`/api/guides/${guideId}/comments?page=${page}`);
}

export async function addGuideComment(guideId: string, content: string): Promise<GuideComment> {
  return fetchAuthed<GuideComment>(`/api/guides/${guideId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
}

export async function likeGuide(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/guides/${id}/like`, { method: "POST" });
}

export async function unlikeGuide(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/guides/${id}/like`, { method: "DELETE" });
}

// --- Questions API ---
export async function fetchQuestions(params?: { tag?: string; status?: string; sort?: string; page?: number }): Promise<QuestionListResponse> {
  const p = new URLSearchParams();
  if (params?.tag) p.set("tag", params.tag);
  if (params?.status) p.set("status", params.status);
  if (params?.sort) p.set("sort", params.sort);
  if (params?.page) p.set("page", String(params.page));
  const raw = await fetchJson<{ data?: QuestionItem[]; items?: QuestionItem[]; total: number; page: number; limit?: number; pageSize?: number }>(`/api/questions?${p}`);
  return {
    items: raw.items ?? raw.data ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    pageSize: raw.pageSize ?? raw.limit ?? 20,
  };
}

export async function fetchQuestion(id: string): Promise<QuestionDetail> {
  return fetchJson<QuestionDetail>(`/api/questions/${id}`);
}

export async function createQuestion(data: { title: string; content: string; tags?: string[] }): Promise<QuestionItem> {
  return fetchAuthed<QuestionItem>("/api/questions", { method: "POST", body: JSON.stringify(data) });
}

export async function addAnswer(questionId: string, content: string): Promise<AnswerItem> {
  return fetchAuthed<AnswerItem>(`/api/questions/${questionId}/answers`, { method: "POST", body: JSON.stringify({ content }) });
}

export async function acceptAnswer(questionId: string, answerId: string): Promise<void> {
  await fetchAuthed<void>(`/api/questions/${questionId}/answers/${answerId}/accept`, { method: "POST" });
}

export async function voteAnswer(questionId: string, answerId: string): Promise<void> {
  await fetchAuthed<void>(`/api/questions/${questionId}/answers/${answerId}/vote`, { method: "POST" });
}

// --- Community API ---
export async function fetchLeaderboard(type: string, period: string): Promise<LeaderboardEntry[]> {
  return fetchJson<LeaderboardEntry[]>(`/api/community/leaderboard?type=${type}&period=${period}`);
}

export async function fetchTrending(): Promise<TrendingContent> {
  return fetchJson<TrendingContent>("/api/community/trending");
}

export async function fetchPhotoWall(params?: { entityType?: string; entityId?: string; page?: number; limit?: number }): Promise<{ items: PhotoItem[]; total: number }> {
  const p = new URLSearchParams();
  if (params?.entityType) p.set("entityType", params.entityType);
  if (params?.entityId) p.set("entityId", params.entityId);
  if (params?.page) p.set("page", String(params.page));
  if (params?.limit) p.set("limit", String(params.limit));
  return fetchJson<{ items: PhotoItem[]; total: number }>(`/api/community/photos?${p}`);
}

export async function fetchFeaturedPhotos(): Promise<{ items: PhotoItem[] }> {
  return fetchJson<{ items: PhotoItem[] }>("/api/community/photos/featured");
}

// --- User Profile API ---
export async function fetchMyProfile(): Promise<UserProfile> {
  return fetchAuthed<UserProfile>("/api/users/me/profile");
}

export async function updateMyProfile(data: { displayName?: string; bio?: string; location?: string; avatar?: string }): Promise<UserProfile> {
  return fetchAuthed<UserProfile>("/api/users/me/profile", { method: "PATCH", body: JSON.stringify(data) });
}

export async function fetchUserProfile(userId: string): Promise<UserProfile & { nickname: string }> {
  return fetchJson<UserProfile & { nickname: string }>(`/api/users/${userId}/profile`);
}

export async function fetchUserGuides(userId: string, page = 1): Promise<GuideListResponse> {
  return fetchJson<GuideListResponse>(`/api/users/${userId}/guides?page=${page}`);
}

export async function fetchSharedCollection(shareToken: string): Promise<Collection> {
  return fetchJson<Collection>(`/api/collections/shared/${shareToken}`);
}

export async function generateShareLink(id: string): Promise<{ shareToken: string; shareUrl: string }> {
  return fetchAuthed<{ shareToken: string; shareUrl: string }>(`/api/collections/${id}/share`, {
    method: "POST",
  });
}

// --- Price Tools ---
export interface PriceCalendarItem { date: string; price: number }
export interface PriceCompareItem {
  entityId: string; name: string; currentPrice: number; minPrice: number; maxPrice: number; avgPrice: number;
  memberPrice: number | null; duration: number; trend: { date: string; price: number }[];
}
export interface PriceTrendPoint { date: string; price: number }
export interface PriceAlertItem {
  id: string; entityType: string; entityId: string; entityName: string;
  targetPrice: number; currentPrice: number; isTriggered: boolean; isActive: boolean; createdAt: string;
}

export async function fetchPriceCalendar(entityType: string, entityId: string, startDate: string, endDate: string): Promise<PriceCalendarItem[]> {
  return fetchJson<PriceCalendarItem[]>(`/api/prices/calendar?entityType=${entityType}&entityId=${entityId}&startDate=${startDate}&endDate=${endDate}`);
}
export async function fetchPriceCompare(entityType: string, entityIds: string[]): Promise<PriceCompareItem[]> {
  return fetchJson<PriceCompareItem[]>(`/api/prices/compare?entityType=${entityType}&entityIds=${entityIds.join(",")}`);
}
export async function fetchPriceTrend(entityType: string, entityId: string, days = 30): Promise<PriceTrendPoint[]> {
  return fetchJson<PriceTrendPoint[]>(`/api/prices/trend?entityType=${entityType}&entityId=${entityId}&days=${days}`);
}
export async function createPriceAlert(data: { entityType: string; entityId: string; entityName: string; targetPrice: number; currentPrice: number }): Promise<PriceAlertItem> {
  return fetchAuthed<PriceAlertItem>("/api/price-alerts", { method: "POST", body: JSON.stringify(data) });
}
export async function fetchMyPriceAlerts(): Promise<{ items: PriceAlertItem[] }> {
  return fetchAuthed<{ items: PriceAlertItem[] }>("/api/price-alerts/my");
}
export async function deletePriceAlert(id: string): Promise<void> {
  await fetchAuthed<void>(`/api/price-alerts/${id}`, { method: "DELETE" });
}

// ======== Share 社交分享 ========

export interface ShareStats {
  total: number;
  byPlatform: { platform: string; _count: number }[];
  byEntityType: { entityType: string; _count: number }[];
}

export interface PopularShare {
  entityType: string;
  entityId: string;
  _count: { id: number };
}

export async function recordShare(data: { platform: string; entityType: string; entityId: string }): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  await fetch(`${API_BASE}/api/shares`, { method: "POST", headers, body: JSON.stringify(data) });
}

export async function fetchShareStats(): Promise<ShareStats> {
  return fetchAuthed<ShareStats>("/api/shares/stats");
}

export async function fetchPopularShares(): Promise<PopularShare[]> {
  return fetchJson<PopularShare[]>("/api/shares/popular");
}

// ======== Merchant 商家入驻 ========

export interface Merchant {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string | null;
  logo: string | null;
  license: string | null;
  status: string;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  rating: number;
  totalOrders: number;
  createdAt: string;
  services?: MerchantServiceItem[];
}

export interface MerchantServiceItem {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  price: number;
  duration: number | null;
  maxPersons: number | null;
  isActive: boolean;
}

export interface MerchantStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export async function fetchMerchants(params?: { type?: string; page?: number; pageSize?: number }): Promise<{ items: Merchant[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  return fetchJson<{ items: Merchant[]; total: number }>(`/api/merchants?${qs}`);
}

export async function fetchMerchantDetail(id: string): Promise<Merchant> {
  return fetchJson<Merchant>(`/api/merchants/${id}`);
}

export async function registerMerchant(data: { type: string; name: string; description?: string; contactPhone?: string; contactEmail?: string; address?: string; province?: string; city?: string }): Promise<Merchant> {
  return fetchAuthed<Merchant>('/api/merchants/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchMyMerchant(): Promise<Merchant> {
  return fetchAuthed<Merchant>('/api/merchants/my');
}

export async function updateMyMerchant(data: Partial<{ name: string; description: string; contactPhone: string; contactEmail: string; address: string; logo: string }>): Promise<Merchant> {
  return fetchAuthed<Merchant>('/api/merchants/my', { method: 'PATCH', body: JSON.stringify(data) });
}

export async function fetchMerchantStats(): Promise<MerchantStats> {
  return fetchAuthed<MerchantStats>('/api/merchants/stats');
}

// ======== Analytics 数据分析 ========

export interface AnalyticsOverview {
  users: number; trips: number; orders: number; reviews: number;
  guides: number; merchants: number; shares: number;
}

export interface AnalyticsTrend {
  date: string; orders: number; trips: number; users: number;
}

export interface AnalyticsFunnel {
  totalUsers: number; usersWithTrips: number; usersWithOrders: number; usersWithPaidOrders: number;
}

export interface TopContentItem {
  entityType: string; entityId: string; count: number;
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return fetchAuthed<AnalyticsOverview>('/api/analytics/overview');
}
export async function fetchAnalyticsTrends(): Promise<AnalyticsTrend[]> {
  return fetchAuthed<AnalyticsTrend[]>('/api/analytics/trends');
}
export async function fetchAnalyticsFunnel(): Promise<AnalyticsFunnel> {
  return fetchAuthed<AnalyticsFunnel>('/api/analytics/funnel');
}
export async function fetchTopContent(): Promise<TopContentItem[]> {
  return fetchAuthed<TopContentItem[]>('/api/analytics/top-content');
}

// ======== Chat 实时消息 ========

export interface ChatRoom {
  id: string;
  type: string;
  name: string | null;
  createdAt: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  lastReadAt: string | null;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

export async function fetchChatRooms(): Promise<ChatRoom[]> {
  return fetchAuthed<ChatRoom[]>('/api/chat/rooms');
}

export async function createChatRoom(data: { type: string; participantIds: string[]; name?: string }): Promise<ChatRoom> {
  return fetchAuthed<ChatRoom>('/api/chat/rooms', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchChatMessages(roomId: string, page = 1): Promise<{ items: ChatMessage[]; total: number }> {
  return fetchAuthed<{ items: ChatMessage[]; total: number }>(`/api/chat/rooms/${roomId}/messages?page=${page}`);
}

export async function sendChatMessage(roomId: string, content: string, type = 'TEXT'): Promise<ChatMessage> {
  return fetchAuthed<ChatMessage>(`/api/chat/rooms/${roomId}/messages`, { method: 'POST', body: JSON.stringify({ content, type }) });
}

export async function markChatRead(roomId: string): Promise<void> {
  await fetchAuthed<void>(`/api/chat/rooms/${roomId}/read`, { method: 'POST' });
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  await fetchAuthed<void>(`/api/chat/messages/${messageId}`, { method: 'DELETE' });
}

// ======== Media 多媒体导览 ========

export interface MediaContent {
  id: string;
  entityType: string;
  entityId: string;
  mediaType: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchMediaByEntity(entityType: string, entityId: string): Promise<MediaContent[]> {
  const res = await fetchJson<{ data: MediaContent[] }>(`/api/media?entityType=${entityType}&entityId=${entityId}`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchMediaDetail(id: string): Promise<MediaContent> {
  return fetchJson<MediaContent>(`/api/media/${id}`);
}

// ======== Cultivation 修行圈 (M37) ========

export type CultivationRole = "NONE" | "SEEKER" | "PRACTITIONER" | "MENTOR" | "MASTER";
export type Realm =
  | "AWAKENING"
  | "CLARIFYING"
  | "SEEING"
  | "ATTAINING"
  | "INTEGRATING"
  | "RETURNING"
  | "GIVING_BACK";

export interface CultivationApplication {
  id: string;
  userId: string;
  motivation: string;
  experience: string | null;
  primaryTradition: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface CultivationMineResponse {
  hasAccess: boolean;
  role: CultivationRole;
  expiresAt: string | null;
  application: CultivationApplication | null;
}

export interface FulfillmentJourney {
  id: string;
  userId: string;
  primaryTradition: string;
  blendTraditions: string[];
  currentRealm: Realm;
  oxStage: number;
  streakDays: number;
  lastSealAt: string | null;
  karmaPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompassResponse {
  journey: FulfillmentJourney;
  currentSymbol: { symbolName: string; originalText: string; source: string } | null;
  todaySteps: { id: string; title: string; kind: string; completed: boolean }[];
  streakDays: number;
}

export interface OxPathResponse {
  currentStage: number;
  stages: { stage: number; unlocked: boolean; current: boolean }[];
}

export interface DailySealResponse {
  session: string;
  practice: {
    id: string;
    sealId: string;
    audioListenedSec: number;
    reflection: string | null;
    status: string;
  } | null;
  recommendedSealId: string;
  tradition: string;
}

export interface WisdomCitation {
  scriptureSlug: string;
  title: string;
  quote: string;
}
export interface WisdomMasterAnswer {
  tradition: string;
  masterName: string;
  answer: string;
  citations: WisdomCitation[];
  keyPoints: string[];
  status: "OK" | "FAILED" | string;
}
export interface WisdomDebateTurn {
  tradition: string;
  masterName: string;
  response: string;
  citations: WisdomCitation[];
  repliesTo: string[];
}
export interface WisdomDebate {
  rounds: { round: number; turns: WisdomDebateTurn[] }[];
  moderatorNotes?: string[];
}
export interface WisdomSynthesis {
  convergence: string[];
  divergence: { tradition: string; stance: string; reason: string }[];
  integration: string;
  practice: string;
}
export interface WisdomQuery {
  id: string;
  question: string;
  answers: WisdomMasterAnswer[];
  chosenTrads: string[];
  synthesized: string | null;
  debate?: WisdomDebate | null;
  createdAt: string;
}

export type KarmaCausalNode = {
  type: "CAUSE" | "EVENT" | "EFFECT" | "INSIGHT" | string;
  text: string;
  weight?: number;
};

export type KarmaTraditionInsight = {
  tradition: string;
  scriptureTitle: string;
  scriptureSlug?: string;
  quote: string;
  guidance: string;
};

export interface KarmaEvent {
  id: string;
  title: string;
  body: string;
  eventAt: string;
  visibility: string;
  aiRealmTag: string | null;
  aiCauseTag: string | null;
  aiEffectTag: string | null;
  aiAdvice: string | null;
  aiConfidence?: number | null;
  aiCausalChain?: KarmaCausalNode[] | null;
  aiTraditionInsights?: KarmaTraditionInsight[] | null;
  createdAt: string;
}

export interface KarmaCoachResponse {
  suggestedTitle: string;
  structuredBody: string;
  guidingQuestions: string[];
  causeHint?: string;
  effectHint?: string;
  source: "llm" | "fallback";
}

export interface ThreeLifeVision {
  id: string;
  personalGoal: string | null;
  familyGoal: string | null;
  businessGoal: string | null;
  reviewedAt: string | null;
}

export interface DharmaLiveSession {
  id: string;
  topic: string;
  masterName: string;
  masterType: string;
  tradition: string;
  startAt: string;
  durationMin: number;
  streamUrl: string | null;
  status: string;
}

// Access / apply
export const fetchCultivationMine = () =>
  fetchAuthed<CultivationMineResponse>("/api/cultivation/apply/mine");

export const submitCultivationApplication = (data: {
  motivation: string;
  experience?: string;
  primaryTradition?: string;
}) =>
  fetchAuthed<CultivationApplication>("/api/cultivation/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const redeemCultivationInvite = (code: string) =>
  fetchAuthed<{ ok: true; role: CultivationRole }>("/api/cultivation/invite/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

// A1 Journey / Compass
export const fetchJourney = () => fetchAuthed<FulfillmentJourney>("/api/cultivation/journey/me");
export const startJourney = (data: { primaryTradition?: string; blendTraditions?: string[] }) =>
  fetchAuthed<FulfillmentJourney>("/api/cultivation/journey/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const setTradition = (data: { primaryTradition: string; blendTraditions?: string[] }) =>
  fetchAuthed<FulfillmentJourney>("/api/cultivation/journey/tradition", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const fetchCompass = () => fetchAuthed<CompassResponse>("/api/cultivation/compass");

// A2 Ox Path
export const fetchOxPath = () => fetchAuthed<OxPathResponse>("/api/cultivation/ox-path");
export const advanceOxStage = () =>
  fetchAuthed<FulfillmentJourney>("/api/cultivation/ox-path/advance", { method: "POST" });

// A2.1 Zen Quiz (AI禅修考核)
export interface ZenQuizQuestion {
  index: number;
  question: string;
  questionType: string;
  stageName: string;
}
export interface ZenQuizAnswer {
  index: number;
  userAnswer: string;
  aiScore: number;
  aiFeedback: string;
  encouragement: string;
  passed: boolean;
}
export interface ZenQuizResponse {
  id: string;
  quizDate: string;
  oxStage: number;
  questions: ZenQuizQuestion[];
  answers: ZenQuizAnswer[] | null;
  totalQuestions: number;
  answeredCount: number;
  passedCount: number;
  status: "IN_PROGRESS" | "PASSED" | "FAILED";
}
export interface QuizProgressResponse {
  quizPassedStreak: number;
  lastQuizPassedAt: string | null;
  todayStatus: string;
  daysToAdvancement: number;
  oxStage: number;
}
export interface AnswerFeedbackResponse {
  passed: boolean;
  score: number;
  feedback: string;
  encouragement: string;
  quizStatus: string;
  answeredCount: number;
  passedCount: number;
  totalQuestions: number;
}
export const fetchTodayQuiz = () =>
  fetchAuthed<ZenQuizResponse>("/api/cultivation/zen-quiz/today", { timeoutMs: 120000 });
export const submitQuizAnswer = (data: { quizId: string; questionIndex: number; answer: string }) =>
  fetchAuthed<AnswerFeedbackResponse>("/api/cultivation/zen-quiz/answer", {
    method: "POST",
    body: JSON.stringify(data),
    timeoutMs: 60000,
  });
export const fetchQuizProgress = () =>
  fetchAuthed<QuizProgressResponse>("/api/cultivation/zen-quiz/progress");
export const fetchQuizHistory = (page = 1, pageSize = 20) =>
  fetchAuthed<{ items: ZenQuizResponse[]; total: number }>(
    `/api/cultivation/zen-quiz/history?page=${page}&pageSize=${pageSize}`
  );

// A3 Daily Seal
export const fetchTodaySeal = (session: "MORNING" | "EVENING" = "MORNING") =>
  fetchAuthed<DailySealResponse>(`/api/cultivation/daily-seal/today?session=${session}`);
export const submitSealPractice = (data: {
  sealId: string;
  session: "MORNING" | "EVENING";
  audioListenedSec: number;
  reflection?: string;
}) =>
  fetchAuthed("/api/cultivation/daily-seal/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const fetchSealStreak = () =>
  fetchAuthed<{ streakDays: number; lastSealAt: string | null; karmaPoints: number }>(
    "/api/cultivation/daily-seal/streak",
  );

// A4 Wisdom
// 注: 12 大师并行 LLM 调用耗时 60-150s，须覆盖 fetchAuthed 默认 15s 超时
export const submitWisdomQuery = (data: { question: string; traditions?: string[] }) =>
  fetchAuthed<WisdomQuery>("/api/cultivation/wisdom/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    timeoutMs: 180_000,
  });
export const synthesizeWisdom = (data: { queryId: string; chosenTraditions: string[] }) =>
  fetchAuthed<WisdomQuery>("/api/cultivation/wisdom/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    timeoutMs: 180_000,
  });
export const fetchWisdomHistory = (page = 1, pageSize = 20) =>
  fetchAuthed<{ items: WisdomQuery[]; total: number; page: number; pageSize: number }>(
    `/api/cultivation/wisdom/history?page=${page}&pageSize=${pageSize}`,
  );
export const startWisdomDebate = (queryId: string, rounds = 3) =>
  fetchAuthed<WisdomQuery>(`/api/cultivation/wisdom/${queryId}/debate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rounds }),
    timeoutMs: 420_000,
  });
export const WISDOM_TRADITIONS: { code: string; label: string; emoji: string }[] = [
  { code: "ZEN", label: "禅宗 · 惠能", emoji: "🪷" },
  { code: "TAOISM", label: "道家 · 老子", emoji: "☯" },
  { code: "CONFUCIANISM", label: "儒家 · 孔子", emoji: "📖" },
  { code: "CHRISTIANITY", label: "基督 · 耶稣", emoji: "✝" },
  { code: "ISLAM", label: "伊斯兰 · 穆罕默德", emoji: "☪" },
  { code: "HINDUISM", label: "印度 · 商羯罗", emoji: "🕉" },
  { code: "JUDAISM", label: "犹太 · 摩西", emoji: "✡" },
  { code: "SIKHISM", label: "锡克 · 那纳克", emoji: "🪯" },
  { code: "TIBETAN", label: "藏传 · 莲花生", emoji: "🏔" },
  { code: "SHINTO", label: "神道 · 天照大神", emoji: "⛩" },
  { code: "INDIGENOUS", label: "原住民 · 部落长老", emoji: "🌿" },
  { code: "BAHAI", label: "巴哈伊 · 巴哈欧拉", emoji: "✴" },
];

// A5 Karma — 小鸿觉门深度介入
export const coachKarmaDraft = (data: { roughNotes: string; intent?: string }) =>
  fetchAuthed<KarmaCoachResponse>("/api/cultivation/karma/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    timeoutMs: 150_000,
  });
export const createKarmaEvent = (data: {
  title: string;
  body: string;
  eventAt: string;
  visibility?: "PRIVATE" | "FRIENDS" | "PUBLIC";
}) =>
  fetchAuthed<KarmaEvent>("/api/cultivation/karma/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    timeoutMs: 210_000,
  });
export const reanalyzeKarmaEvent = (id: string) =>
  fetchAuthed<KarmaEvent>(`/api/cultivation/karma/event/${id}/reanalyze`, {
    method: "POST",
    timeoutMs: 210_000,
  });
export const fetchKarmaTimeline = (page = 1, pageSize = 20) =>
  fetchAuthed<{ items: KarmaEvent[]; total: number; page: number; pageSize: number }>(
    `/api/cultivation/karma/timeline?page=${page}&pageSize=${pageSize}`,
  );
export const fetchKarmaEvent = (id: string) =>
  fetchAuthed<KarmaEvent>(`/api/cultivation/karma/event/${id}`);
export const deleteKarmaEvent = (id: string) =>
  fetchAuthed(`/api/cultivation/karma/event/${id}`, { method: "DELETE" });

// A6 Three Lives
export const fetchThreeLives = () =>
  fetchAuthed<ThreeLifeVision>("/api/cultivation/three-lives");
export const updateThreeLives = (data: {
  personalGoal?: string;
  familyGoal?: string;
  businessGoal?: string;
}) =>
  fetchAuthed<ThreeLifeVision>("/api/cultivation/three-lives", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// A7 Live Dharma
export const fetchLiveDharmaSchedule = (date?: string) =>
  fetchAuthed<DharmaLiveSession[]>(
    `/api/cultivation/live-dharma/schedule${date ? `?date=${date}` : ""}`,
  );

// ── M38 经论大系统 ─────────────────────────────
export interface ScriptureCategory {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  ring: number;
  tradition: string;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  description: string | null;
  children: ScriptureCategory[];
  _count: { scriptures: number };
}

export interface ScriptureItem {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  author: string | null;
  era: string | null;
  tradition: string;
  ring: number;
  summary: string;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  tags: string[];
  viewCount: number;
  chapterCount: number;
  category: { slug: string; name: string; icon: string | null; color: string | null } | null;
}

export interface ScriptureDetail extends ScriptureItem {
  significance: string | null;
  coverUrl: string | null;
  readingMins: number | null;
  relatedIds: string[];
  chapters: { chapterNo: number; title: string; subtitle: string | null }[];
  related: { slug: string; title: string; author: string | null; tradition: string; ring: number }[];
  insights: ScriptureInsight[];
}

export interface ScriptureChapterDetail {
  scripture: { title: string; slug: string; chapterCount: number };
  chapter: {
    id: string;
    chapterNo: number;
    title: string;
    subtitle: string | null;
    originalText: string;
    commentary: string | null;
    keyQuotes: { quote: string; explanation: string }[] | null;
    practiceHint: string | null;
  };
}

export interface ScriptureInsight {
  id: string;
  scriptureId: string;
  chapterNo: number | null;
  insightType: string;
  content: string;
  tradition: string;
  oxStage: number | null;
  quality: number;
  createdAt: string;
  scripture?: { slug: string; title: string; tradition: string };
}

export interface ScriptureGraphData {
  nodes: {
    id: string;
    type: 'category' | 'scripture';
    slug: string;
    label: string;
    ring: number;
    tradition: string;
    parentId: string | null;
    icon: string | null;
    color: string | null;
  }[];
  edges: { source: string; target: string; type: string }[];
}

export const fetchScriptureCategories = () =>
  fetchAuthed<ScriptureCategory[]>("/api/cultivation/scriptures/categories");

export const fetchScriptureGraph = () =>
  fetchAuthed<ScriptureGraphData>("/api/cultivation/scriptures/graph");

export const fetchScriptureRecommended = () =>
  fetchAuthed<ScriptureItem[]>("/api/cultivation/scriptures/recommended");

export const fetchScriptureInsights = (params?: {
  scriptureSlug?: string; tradition?: string; oxStage?: number; insightType?: string; page?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.scriptureSlug) q.set("scriptureSlug", params.scriptureSlug);
  if (params?.tradition) q.set("tradition", params.tradition);
  if (params?.oxStage) q.set("oxStage", String(params.oxStage));
  if (params?.insightType) q.set("insightType", params.insightType);
  if (params?.page) q.set("page", String(params.page));
  return fetchAuthed<{ items: ScriptureInsight[]; total: number; page: number; pageSize: number }>(
    `/api/cultivation/scriptures/insights?${q}`,
  );
};

export const fetchScriptures = (params?: {
  ring?: number; tradition?: string; categorySlug?: string; search?: string; page?: number; pageSize?: number;
}) => {
  const q = new URLSearchParams();
  if (params?.ring) q.set("ring", String(params.ring));
  if (params?.tradition) q.set("tradition", params.tradition);
  if (params?.categorySlug) q.set("categorySlug", params.categorySlug);
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  return fetchAuthed<{ items: ScriptureItem[]; total: number; page: number; pageSize: number }>(
    `/api/cultivation/scriptures?${q}`,
  );
};

export const fetchScriptureDetail = (slug: string) =>
  fetchAuthed<ScriptureDetail>(`/api/cultivation/scriptures/${slug}`);

export const fetchScriptureChapter = (slug: string, chapterNo: number) =>
  fetchAuthed<ScriptureChapterDetail>(`/api/cultivation/scriptures/${slug}/chapters/${chapterNo}`);

export const recordScriptureView = (slug: string) =>
  fetchAuthed<void>(`/api/cultivation/scriptures/${slug}/view`, { method: "POST" });

// ═══════════════════════════════════════════════
// M39 PKB 修行库 API
// ═══════════════════════════════════════════════

export type PkbEntryKind = "CHAT" | "INSIGHT" | "REFLECTION" | "VOW_UPDATE" | "SCRIPTURE_NOTE";
export type PkbCategory = "PERSONAL" | "FAMILY" | "CAREER" | "DAILY_STRUGGLE" | "GENERAL";
export type PkbRecommendationStatus = "PENDING" | "READ" | "PRACTICING" | "DONE" | "DISMISSED";

export interface UserPkb {
  id: string;
  userId: string;
  personalVow: string | null;
  familyVow: string | null;
  careerVow: string | null;
  vowUpdatedAt: string | null;
  currentOxStage: number;
  dominantRings: number[];
  topTraditions: string[];
  struggleTags: string[];
  insightCount: number;
  entryCount: number;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PkbEntry {
  id: string;
  pkbId: string;
  kind: PkbEntryKind;
  category: PkbCategory;
  title: string;
  content: string;
  xiaohongSessionId: string | null;
  userMessage: string | null;
  xiaohongReply: string | null;
  citedScriptureIds: string[];
  citedChapterRefs: Array<{ slug?: string; title?: string; author?: string | null; tradition?: string | null; summary?: string | null }> | null;
  tags: string[];
  mood: string | null;
  isShared: boolean;
  sharedGuideId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PkbRecommendation {
  id: string;
  pkbId: string;
  category: PkbCategory;
  title: string;
  reason: string;
  scriptureId: string | null;
  scriptureSlug: string | null;
  chapterNo: number | null;
  priority: number;
  status: PkbRecommendationStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PkbOverview {
  pkb: UserPkb & { entryCount: number };
  recentEntries: PkbEntry[];
  activeRecs: PkbRecommendation[];
}

export const fetchPkbOverview = () => fetchAuthed<PkbOverview>(`/api/pkb/me`);

export const updatePkbVows = (dto: { personalVow?: string; familyVow?: string; careerVow?: string }) =>
  fetchAuthed<UserPkb>(`/api/pkb/me/vows`, { method: "PUT", body: JSON.stringify(dto) });

export const fetchPkbEntries = (params?: { kind?: PkbEntryKind; category?: PkbCategory; tag?: string; page?: number; pageSize?: number }) => {
  const q = new URLSearchParams();
  if (params?.kind) q.set("kind", params.kind);
  if (params?.category) q.set("category", params.category);
  if (params?.tag) q.set("tag", params.tag);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return fetchAuthed<{ items: PkbEntry[]; total: number; page: number; pageSize: number }>(`/api/pkb/me/entries${suffix}`);
};

export const createPkbEntry = (dto: { kind: PkbEntryKind; category?: PkbCategory; title: string; content: string; tags?: string[]; mood?: string }) =>
  fetchAuthed<PkbEntry>(`/api/pkb/me/entries`, { method: "POST", body: JSON.stringify(dto) });

export const updatePkbEntry = (id: string, dto: { title?: string; content?: string; tags?: string[]; mood?: string }) =>
  fetchAuthed<PkbEntry>(`/api/pkb/me/entries/${id}`, { method: "PATCH", body: JSON.stringify(dto) });

export const deletePkbEntry = (id: string) =>
  fetchAuthed<{ deleted: boolean }>(`/api/pkb/me/entries/${id}`, { method: "DELETE" });

export const submitPkbStruggle = (dto: { message: string; category?: PkbCategory; tags?: string[] }) =>
  fetchAuthed<{
    entry: PkbEntry;
    reply: string;
    dailyPractice: string;
    citedScriptures: Array<{ slug: string; title: string; author: string | null; tradition: string | null; summary: string | null | undefined }>;
  }>(`/api/pkb/me/struggle`, { method: "POST", body: JSON.stringify(dto), timeoutMs: 200_000 });

export const fetchPkbRecommendations = () =>
  fetchAuthed<PkbRecommendation[]>(`/api/pkb/me/recommendations`);

export const updatePkbRecommendation = (id: string, status: PkbRecommendationStatus) =>
  fetchAuthed<PkbRecommendation>(`/api/pkb/me/recommendations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });

export const sharePkbEntry = (id: string, dto: { title?: string; summary?: string }) =>
  fetchAuthed<{ entry: PkbEntry; shareDraft: { title: string; summary: string; content: string; tags: string[] } }>(
    `/api/pkb/me/entries/${id}/share`,
    { method: "POST", body: JSON.stringify(dto) },
  );

export const draftPkbVow = (dto: { category: "PERSONAL" | "FAMILY" | "CAREER"; keywords?: string[]; currentDraft?: string; hint?: string }) =>
  fetchAuthed<{
    vow: string;
    rationale: string;
    referenceScriptures: Array<{ slug: string; title: string }>;
    source: "llm" | "fallback";
  }>(`/api/pkb/me/vows/draft`, { method: "POST", body: JSON.stringify(dto), timeoutMs: 150_000 });
