export const API_BASE =
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

async function fetchAuthed<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const { getAccessToken } = await import("./auth");
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
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
  siteId: string
): Promise<TripSite> {
  return fetchAuthed<TripSite>(`/api/trips/${tripId}/sites`, {
    method: "POST",
    body: JSON.stringify({ siteId }),
  });
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
  return fetchAuthed<ChatResponse>("/api/xiaohong/chat", {
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
}

export interface CreateReviewData {
  targetType: "TRIP" | "GUIDE" | "SITE";
  targetId: string;
  rating: number;
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
  }).catch(() => {});
}

// --- OAuth Providers ---

export interface OAuthProviders {
  wechat: boolean;
  google: boolean;
}

export async function fetchAuthProviders(): Promise<OAuthProviders> {
  return fetchJson<OAuthProviders>("/api/auth/providers");
}
