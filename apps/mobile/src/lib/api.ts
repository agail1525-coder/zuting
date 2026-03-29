import { getAccessToken } from './auth';

const BASE_URL = __DEV__
  ? 'http://192.168.1.22:3002/api'
  : 'https://zuting.fszyl.top/api';

async function request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function requestMutateAuth<T>(
  endpoint: string,
  method: string,
  body: Record<string, unknown>,
  token: string,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function requestMutate<T>(endpoint: string, method: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface Religion {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  symbol: string;
  color?: string;
}

export interface HolySite {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  city?: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl?: string;
  religionId: string;
  religion?: Religion;
  openingHours?: string;
  ticketPrice?: string;
  bestSeason?: string;
  visitDuration?: string;
  transport?: string;
  tips?: string;
  nearbyFood?: string;
  nearbyStay?: string;
  nearbyExperience?: string;
  nearbySights?: string;
}

export interface Temple {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  city?: string;
  description: string;
  imageUrl?: string;
  religionId: string;
  religion?: Religion;
  foundingDate?: string;
  latitude?: number;
  longitude?: number;
}

export interface Patriarch {
  id: string;
  name: string;
  nameEn: string;
  dates: string;
  title: string;
  biography: string;
  imageUrl?: string;
  religionId: string;
  religion?: Religion;
  coreTeaching?: string;
}

export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText: string;
  translationCn?: string;
  religionId: string;
  religion?: Religion;
}

export interface Seal {
  id: string;
  number: number;
  name: string;
  series: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
}

export interface Route {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: string;
  difficulty: string;
  status: string;
  duration: number;
  nights: number;
  season: string;
  groupSize: string;
  priceFrom: number;
  coverImage: string | null;
  highlights: string[];
  description: string;
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  tips: string[];
  rating: number | null;
  reviewCount: number;
  bookCount: number;
  religion?: Religion;
  sites: RouteSiteWithDetail[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  accommodation: string;
}

export interface RouteSiteWithDetail {
  id: string;
  day: number;
  order: number;
  duration: string | null;
  site: { id: string; name: string; country: string };
}

export interface PaginatedRoutes {
  items: Route[];
  total: number;
  page: number;
  pageSize: number;
}

export type TripStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEWING'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

export interface TripSiteItem {
  id: string;
  order: number;
  visitDate: string | null;
  site: HolySite;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  totalBudget: number | null;
  persons: number;
  contactName: string | null;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  sites: TripSiteItem[];
  _count: { orders: number; journals: number };
}

export interface PaginatedTrips {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  getReligions: (slug?: string) =>
    request<Religion[]>('/religions', slug ? { slug } : undefined),

  getHolySites: (religionId?: string) =>
    request<HolySite[]>('/holy-sites', religionId ? { religionId } : undefined),

  getHolySiteById: (id: string) =>
    request<HolySite>(`/holy-sites/${id}`),

  getTemples: (religionId?: string) =>
    request<Temple[]>('/temples', religionId ? { religionId } : undefined),

  getTempleById: (id: string) =>
    request<Temple>(`/temples/${id}`),

  getPatriarchs: (religionId?: string) =>
    request<Patriarch[]>('/patriarchs', religionId ? { religionId } : undefined),

  getPatriarchById: (id: string) =>
    request<Patriarch>(`/patriarchs/${id}`),

  getTeachings: (religionId?: string) =>
    request<Teaching[]>('/teachings', religionId ? { religionId } : undefined),

  getTeachingById: (id: string) =>
    request<Teaching>(`/teachings/${id}`),

  getSeals: (series?: string) =>
    request<Seal[]>('/seals', series ? { series } : undefined),

  getSealById: (id: string) =>
    request<Seal>(`/seals/${id}`),

  getTrips: (params?: { userId?: string; status?: string; page?: string; limit?: string }) =>
    request<PaginatedTrips>('/trips', params),

  getTripById: (id: string) =>
    request<Trip>(`/trips/${id}`),

  getJournals: (params?: { page?: string; limit?: string; isPublic?: string }) =>
    request<PaginatedJournals>('/journals', params),

  getJournalById: (id: string) =>
    request<Journal>(`/journals/${id}`),

  createTrip: (data: {
    title: string;
    startDate: string;
    endDate: string;
    persons: number;
    contactName?: string;
    contactPhone?: string;
    note?: string;
  }, token: string) => requestMutateAuth<Trip>('/trips', 'POST', data, token),

  transitionTrip: (id: string, action: string, reason?: string) =>
    requestMutate<Trip>(`/trips/${id}/transition`, 'POST', { action, reason }),

  createJournal: (data: {
    title: string;
    content: string;
    mood?: string;
    isPublic?: boolean;
    tripId?: string;
  }) => requestMutate<Journal>('/journals', 'POST', data),

  getRoutes: (params?: { category?: string; difficulty?: string; sort?: string; page?: string; pageSize?: string }) =>
    request<PaginatedRoutes>('/routes', params as Record<string, string>),

  getFeaturedRoutes: (limit = 8) =>
    request<Route[]>('/routes/featured', { limit: String(limit) }),

  getRouteBySlug: (slug: string) =>
    request<Route>(`/routes/${slug}`),

  getRoutesBySite: (siteId: string) =>
    request<Route[]>(`/routes/by-site/${siteId}`),

  search: (q: string, type = 'all', page = 1, limit = 20) =>
    request<SearchResponse>('/search', {
      q,
      type,
      page: String(page),
      limit: String(limit),
    }),

  // Search suggestions & hot keywords
  fetchSearchSuggestions: (q: string) =>
    request<SearchSuggestion[]>('/search/suggestions', { q }),

  fetchHotKeywords: () =>
    request<HotKeyword[]>('/search/hot'),

  // Collections
  fetchCollections: async () => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/collections`, { headers });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json() as Promise<Collection[]>;
  },

  fetchCollection: async (id: string) => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/collections/${id}`, { headers });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json() as Promise<Collection>;
  },

  createCollection: (data: { name: string; description?: string; isPublic?: boolean }) =>
    requestMutate<Collection>('/collections', 'POST', data as Record<string, unknown>),

  deleteCollection: async (id: string) => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/collections/${id}`, { method: 'DELETE', headers });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
  },

  quickSave: (entityType: CollectionEntityType, entityId: string) =>
    requestMutate<{ collectionId: string; itemId: string }>('/collections/quick-save', 'POST', { entityType, entityId }),

  checkSaved: async (entityType: CollectionEntityType, entityId: string) => {
    const token = await getAccessToken();
    const url = new URL(`${BASE_URL}/collections/check`);
    url.searchParams.set('entityType', entityType);
    url.searchParams.set('entityId', entityId);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) return { saved: false, itemId: null as string | null, collectionId: null as string | null };
    return response.json() as Promise<{ saved: boolean; itemId: string | null; collectionId: string | null }>;
  },

  removeFromCollection: async (collectionId: string, itemId: string) => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
  },

  getReviewStats: (targetType: string, targetId: string) =>
    request<ReviewStats>(`/reviews/stats/${targetType}/${targetId}`),

  getReviews: (targetType: string, targetId: string, limit = 5) =>
    request<ReviewListResponse>('/reviews', { targetType, targetId, limit: String(limit) }),

  createReview: (data: CreateReviewData) =>
    requestMutate<Review>('/reviews', 'POST', data as unknown as Record<string, unknown>),

  // Orders
  getOrders: (params?: { status?: string; page?: string; limit?: string }) =>
    request<OrderListResponse>('/orders', params),

  getOrderById: (id: string) =>
    request<OrderDetail>(`/orders/${id}`),

  cancelOrder: (id: string) =>
    requestMutate<OrderDetail>(`/orders/${id}/cancel`, 'POST', {}),

  refundOrder: (id: string, reason?: string) =>
    requestMutate<OrderDetail>(`/orders/${id}/refund`, 'POST', { reason }),

  // Notifications
  getNotifications: (params?: { page?: string; limit?: string; unreadOnly?: string }) =>
    request<NotificationListResponse>('/notifications', params),

  getUnreadCount: () =>
    request<{ count: number }>('/notifications/unread-count'),

  markNotificationRead: (id: string) =>
    requestMutate<Notification>(`/notifications/${id}/read`, 'POST', {}),

  markAllNotificationsRead: () =>
    requestMutate<void>('/notifications/read-all', 'POST', {}),

  // Reviews — reply, vote
  replyToReview: (reviewId: string, content: string) =>
    requestMutate<ReviewReply>(`/reviews/${reviewId}/replies`, 'POST', { content }),

  voteReview: (reviewId: string) =>
    requestMutate<{ helpful: number }>(`/reviews/${reviewId}/vote`, 'POST', {}),

  unvoteReview: (reviewId: string) =>
    requestMutate<{ helpful: number }>(`/reviews/${reviewId}/vote`, 'DELETE', {}),

  // Recommendations
  fetchRelatedItems: (entityType: RecommendationEntityType, entityId: string, limit = 6) =>
    request<RecommendationItem[]>('/recommendations/related', {
      entityType,
      entityId,
      limit: String(limit),
    }),

  fetchPopularItems: (religion?: string, limit = 10) =>
    request<RecommendationItem[]>('/recommendations/popular', {
      ...(religion ? { religion } : {}),
      limit: String(limit),
    }),

  recordView: async (entityType: RecommendationEntityType, entityId: string): Promise<void> => {
    try {
      await requestMutate<void>('/recommendations/view-history', 'POST', { entityType, entityId });
    } catch {
      // silent fail — non-critical analytics
    }
  },
};

export interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  isPublic: boolean;
  images: string[];
  siteId: string | null;
  tripId: string | null;
  user?: { id: string; nickname: string; avatar: string | null };
  trip?: { id: string; title: string } | null;
  createdAt: string;
}

export interface PaginatedJournals {
  data: Journal[];
  total: number;
  page: number;
  limit: number;
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
  targetType: 'TRIP' | 'GUIDE' | 'SITE';
  targetId: string;
  rating: number;
  content?: string;
}

// --- Orders ---

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';

export interface OrderDetail {
  id: string;
  orderNo: string;
  tripId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  trip?: { id: string; title: string; status: string };
}

export interface OrderListResponse {
  data: OrderDetail[];
  total: number;
  page: number;
  limit: number;
}

// --- Notifications ---

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

// --- Search Suggestions ---

export interface SearchSuggestion {
  text: string;
  type: string;
  id?: string;
}

export interface HotKeyword {
  text: string;
  count?: number;
}

// --- Collections ---

export type CollectionEntityType = 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH' | 'ROUTE' | 'JOURNAL';

export interface CollectionItem {
  id: string;
  collectionId: string;
  entityType: CollectionEntityType;
  entityId: string;
  note: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
  _count?: { items: number };
}

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

// --- Recommendations ---

export type RecommendationEntityType = 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH' | 'ROUTE' | 'JOURNAL';

export interface RecommendationItem {
  type: RecommendationEntityType;
  id: string;
  name: string;
  nameEn: string;
  imageUrl: string | null;
  country?: string;
  religionName: string;
  religionColor: string | null;
}

// --- Review extras ---

export interface ReviewReply {
  id: string;
  content: string;
  createdAt: string;
  user: ReviewUser;
}

// --- Community types ---

export interface GuideItem {
  id: string;
  title: string;
  coverImage: string | null;
  content: string;
  tags: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  user: { id: string; nickname: string; avatar: string | null };
}

export interface GuideCommentItem {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  viewCount: number;
  answerCount: number;
  createdAt: string;
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

export interface LeaderboardEntry {
  userId: string;
  nickname: string;
  avatar: string | null;
  count: number;
  rank: number;
}

export interface UserProfileData {
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  pilgrimLevel: number;
  totalTrips: number;
  totalSites: number;
  guideCount: number;
  reviewCount: number;
}

// --- Community helpers ---

async function fetchJson<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchAuthed<T>(path: string, options: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) } });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `API Error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return undefined as unknown as T;
  return response.json();
}

// --- Guides ---
export async function fetchGuides(params?: { tag?: string; sort?: string; page?: number }): Promise<{ items: GuideItem[]; total: number }> {
  const p = new URLSearchParams();
  if (params?.tag) p.set('tag', params.tag);
  if (params?.sort) p.set('sort', params.sort);
  if (params?.page) p.set('page', String(params.page));
  return fetchJson(`/api/guides?${p}`);
}

export async function fetchGuide(id: string): Promise<GuideItem> {
  return fetchJson(`/api/guides/${id}`);
}

export async function createGuide(data: { title: string; content: string; coverImage?: string; tags?: string[] }): Promise<GuideItem> {
  return fetchAuthed('/api/guides', { method: 'POST', body: JSON.stringify(data) });
}

export async function publishGuide(id: string): Promise<GuideItem> {
  return fetchAuthed(`/api/guides/${id}/publish`, { method: 'POST' });
}

export async function likeGuide(id: string): Promise<void> {
  await fetchAuthed(`/api/guides/${id}/like`, { method: 'POST' });
}

export async function unlikeGuide(id: string): Promise<void> {
  await fetchAuthed(`/api/guides/${id}/like`, { method: 'DELETE' });
}

export async function fetchGuideComments(guideId: string, page = 1): Promise<{ items: GuideCommentItem[]; total: number }> {
  return fetchJson(`/api/guides/${guideId}/comments?page=${page}`);
}

export async function addGuideComment(guideId: string, content: string): Promise<GuideCommentItem> {
  return fetchAuthed(`/api/guides/${guideId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
}

// --- Questions ---
export async function fetchQuestions(params?: { sort?: string; page?: number }): Promise<{ items: QuestionItem[]; total: number }> {
  const p = new URLSearchParams();
  if (params?.sort) p.set('sort', params.sort);
  if (params?.page) p.set('page', String(params.page));
  return fetchJson(`/api/questions?${p}`);
}

export async function fetchQuestion(id: string): Promise<QuestionDetail> {
  return fetchJson(`/api/questions/${id}`);
}

export async function createQuestion(data: { title: string; content: string; tags?: string[] }): Promise<QuestionItem> {
  return fetchAuthed('/api/questions', { method: 'POST', body: JSON.stringify(data) });
}

export async function addAnswer(questionId: string, content: string): Promise<AnswerItem> {
  return fetchAuthed(`/api/questions/${questionId}/answers`, { method: 'POST', body: JSON.stringify({ content }) });
}

export async function voteAnswer(questionId: string, answerId: string): Promise<void> {
  await fetchAuthed(`/api/questions/${questionId}/answers/${answerId}/vote`, { method: 'POST' });
}

// --- Community ---
export async function fetchLeaderboard(type: string, period: string): Promise<LeaderboardEntry[]> {
  return fetchJson(`/api/community/leaderboard?type=${type}&period=${period}`);
}

export async function fetchTrending(): Promise<{ hotGuides: GuideItem[]; hotQuestions: QuestionItem[] }> {
  return fetchJson('/api/community/trending');
}

// --- User Profile ---
export async function fetchUserProfile(userId: string): Promise<UserProfileData> {
  return fetchJson(`/api/users/${userId}/profile`);
}

export async function fetchMyProfile(): Promise<UserProfileData> {
  return fetchAuthed('/api/users/me/profile', { method: 'GET' });
}

// --- Payment & Checkout ---

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
  isActive: boolean;
}

export interface UserCouponItem {
  id: string;
  couponId: string;
  status: string;
  coupon: CouponItem;
  createdAt: string;
}

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
  totalQuota: number;
  usedQuota: number;
  coverImage: string | null;
}

export interface OrderItem {
  id: string;
  orderNo: string;
  tripId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number | null;
  paymentMethod: string | null;
  status: string;
  couponCode: string | null;
  promotionId: string | null;
  discountAmount: number | null;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  trip?: { id: string; title: string; status: string };
}

export async function createOrder(data: {
  tripId: string;
  totalAmount: number;
  paymentMethod?: string;
  couponCode?: string;
  promotionId?: string;
}): Promise<OrderItem> {
  return fetchAuthed('/api/orders', { method: 'POST', body: JSON.stringify(data) });
}

export async function payOrder(orderId: string, data: { paidAmount?: number; paymentMethod?: string }): Promise<OrderItem> {
  return fetchAuthed(`/api/orders/${orderId}/pay`, { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchAvailableCoupons(page = 1): Promise<{ items: CouponItem[]; total: number }> {
  return fetchJson(`/api/coupons/available?page=${page}`);
}

export async function claimCoupon(couponId: string): Promise<UserCouponItem> {
  return fetchAuthed(`/api/coupons/${couponId}/claim`, { method: 'POST' });
}

export async function fetchMyCoupons(status?: string): Promise<{ items: UserCouponItem[]; total: number }> {
  const p = new URLSearchParams();
  if (status) p.set('status', status);
  return fetchAuthed(`/api/coupons/my/claimed?${p}`, { method: 'GET' });
}

export async function verifyCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount?: number; reason?: string }> {
  return fetchAuthed('/api/coupons/verify', { method: 'POST', body: JSON.stringify({ code, orderAmount }) });
}

export async function fetchPromotions(type?: string): Promise<{ items: PromotionItem[]; total: number }> {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  return fetchJson(`/api/promotions?${p}`);
}

// ─── Membership ──────────────────────────────────────────────────────────────

export interface MembershipData {
  id: string;
  userId: string;
  level: string;        // e.g. "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  levelName: string;
  points: number;
  totalPoints: number;
  nextLevel: string | null;
  nextLevelPoints: number | null;
  expiredAt: string | null;
  checkinStreak: number;
  totalCheckins: number;
}

export interface PointsTransactionItem {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface MemberLevel {
  level: string;
  name: string;
  minPoints: number;
  icon: string;
  color: string;
  perks: string[];
}

export async function fetchMyMembership(): Promise<MembershipData> {
  return fetchAuthed('/api/membership/me', { method: 'GET' });
}

export async function fetchPointsHistory(page = 1): Promise<{ items: PointsTransactionItem[]; total: number }> {
  return fetchAuthed(`/api/membership/points/history?page=${page}`, { method: 'GET' });
}

export async function checkin(): Promise<{ points: number; streak: number; message: string }> {
  return fetchAuthed('/api/membership/checkin', { method: 'POST' });
}

export async function fetchCheckinCalendar(year: number, month: number): Promise<{ dates: string[] }> {
  return fetchAuthed(`/api/membership/checkin/calendar?year=${year}&month=${month}`, { method: 'GET' });
}

export async function fetchLevels(): Promise<MemberLevel[]> {
  return fetchJson('/api/membership/levels');
}

// ─── Referral / 分销 ──────────────────────────────────────────────────────────

export interface InviteCodeData {
  code: string;
  link: string;
  usedCount: number;
}

export interface ReferralStats {
  totalInvited: number;
  level1Count: number;
  level2Count: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export interface ReferralTeamMember {
  id: string;
  nickname: string;
  avatar: string | null;
  level: number;
  joinedAt: string;
  contribution: number;
}

export async function fetchMyInviteCode(): Promise<InviteCodeData> {
  return fetchAuthed('/api/referral/my-code', { method: 'GET' });
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  return fetchAuthed('/api/referral/stats', { method: 'GET' });
}

export async function fetchMyTeam(page = 1): Promise<{ items: ReferralTeamMember[]; total: number }> {
  return fetchAuthed(`/api/referral/team?page=${page}`, { method: 'GET' });
}

export async function bindInviteCode(code: string): Promise<{ success: boolean; message: string }> {
  return fetchAuthed('/api/referral/bind', { method: 'POST', body: JSON.stringify({ code }) });
}

// ─── Points Mall / 积分商城 ────────────────────────────────────────────────────

export interface PointsProductItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  pointsCost: number;
  category: string;
  stock: number;
  isActive: boolean;
  exchangeLimit: number | null;
}

export interface PointsExchangeItem {
  id: string;
  productId: string;
  product: PointsProductItem;
  pointsCost: number;
  status: string;
  createdAt: string;
}

export async function fetchPointsProducts(category?: string): Promise<{ items: PointsProductItem[]; total: number }> {
  const p = new URLSearchParams();
  if (category) p.set('category', category);
  return fetchJson(`/api/points-mall/products?${p}`);
}

export async function exchangeProduct(productId: string): Promise<PointsExchangeItem> {
  return fetchAuthed('/api/points-mall/exchange', { method: 'POST', body: JSON.stringify({ productId }) });
}

export async function fetchMyExchanges(page = 1): Promise<{ items: PointsExchangeItem[]; total: number }> {
  return fetchAuthed(`/api/points-mall/my-exchanges?page=${page}`, { method: 'GET' });
}

// ─── Packages / 套餐 ──────────────────────────────────────────────────────────

export interface PackageItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverImage: string | null;
  type: string;
  duration: number;
  nights: number;
  priceFrom: number;
  originalPrice: number | null;
  rating: number | null;
  reviewCount: number;
  bookCount: number;
  highlights: string[];
  includes: string[];
  isActive: boolean;
  religion?: { name: string; color: string | null };
}

export interface PackageDetail extends PackageItem {
  description: string;
  itinerary: Array<{ day: number; title: string; activities: string[]; meals: string[]; accommodation: string }>;
  excluded: string[];
  tips: string[];
  sites: Array<{ id: string; name: string; day: number }>;
}

export interface PackageBookingItem {
  id: string;
  packageId: string;
  package: { id: string; title: string; coverImage: string | null };
  userId: string;
  startDate: string;
  persons: number;
  totalAmount: number;
  status: string;
  contactName: string;
  contactPhone: string;
  note: string | null;
  createdAt: string;
}

export async function fetchPackages(params?: { type?: string; page?: string; pageSize?: string }): Promise<{ items: PackageItem[]; total: number; page: number; pageSize: number }> {
  const p = new URLSearchParams();
  if (params?.type) p.set('type', params.type);
  if (params?.page) p.set('page', params.page);
  if (params?.pageSize) p.set('pageSize', params.pageSize);
  return fetchJson(`/api/packages?${p}`);
}

export async function fetchPackage(id: string): Promise<PackageDetail> {
  return fetchJson(`/api/packages/${id}`);
}

export async function bookPackage(data: {
  packageId: string;
  startDate: string;
  persons: number;
  contactName: string;
  contactPhone: string;
  note?: string;
}): Promise<PackageBookingItem> {
  return fetchAuthed('/api/packages/book', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchMyPackageBookings(page = 1): Promise<{ items: PackageBookingItem[]; total: number }> {
  return fetchAuthed(`/api/packages/my-bookings?page=${page}`, { method: 'GET' });
}

// ─── Price Tools / 价格工具 ────────────────────────────────────────────────────

export interface PriceCalendarDay {
  date: string;         // ISO date string YYYY-MM-DD
  price: number;
  level: 'cheap' | 'normal' | 'expensive';
  available: boolean;
}

export interface PriceCalendarResponse {
  routeId: string;
  year: number;
  month: number;
  days: PriceCalendarDay[];
  currency: string;
}

export interface PriceCompareItem {
  routeId: string;
  title: string;
  coverImage: string | null;
  basePrice: number;
  currentPrice: number;
  discount: number | null;
  rating: number | null;
  duration: number;
  priceLevel: 'cheap' | 'normal' | 'expensive';
  currency: string;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
}

export interface PriceTrendResponse {
  routeId: string;
  title: string;
  trend: PriceTrendPoint[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  recommendation: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  routeId: string;
  routeTitle: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  isTriggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface CreatePriceAlertData {
  routeId: string;
  targetPrice: number;
}

// --- Price Calendar ---
export async function fetchPriceCalendar(
  routeId: string,
  year: number,
  month: number,
): Promise<PriceCalendarResponse> {
  return fetchJson(`/api/prices/calendar?routeId=${routeId}&year=${year}&month=${month}`);
}

// --- Price Compare ---
export async function fetchPriceCompare(routeIds: string[]): Promise<PriceCompareItem[]> {
  const ids = routeIds.join(',');
  return fetchJson(`/api/prices/compare?ids=${ids}`);
}

export async function fetchCheapestRoutes(limit = 10): Promise<PriceCompareItem[]> {
  return fetchJson(`/api/prices/cheapest?limit=${limit}`);
}

// --- Price Trend ---
export async function fetchPriceTrend(routeId: string, days = 30): Promise<PriceTrendResponse> {
  return fetchJson(`/api/prices/trend?routeId=${routeId}&days=${days}`);
}

// --- Price Alerts ---
export async function fetchPriceAlerts(): Promise<PriceAlert[]> {
  return fetchAuthed('/api/prices/alerts', { method: 'GET' });
}

export async function createPriceAlert(data: CreatePriceAlertData): Promise<PriceAlert> {
  return fetchAuthed('/api/prices/alerts', { method: 'POST', body: JSON.stringify(data) });
}

export async function deletePriceAlert(id: string): Promise<void> {
  await fetchAuthed(`/api/prices/alerts/${id}`, { method: 'DELETE' });
}

// ─── Merchant / 商家 ─────────────────────────────────────────────────────────

export interface Merchant {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string | null;
  logo: string | null;
  status: string;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  rating: number;
  totalOrders: number;
  createdAt: string;
  services?: MerchantServiceItem[];
}

export interface MerchantServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number | null;
}

export async function fetchMerchants(type?: string, page = 1): Promise<{ items: Merchant[]; total: number }> {
  const qs = type ? `?type=${type}&page=${page}` : `?page=${page}`;
  return fetchJson(`/api/merchants${qs}`);
}

export async function fetchMerchantDetail(id: string): Promise<Merchant> {
  return fetchJson(`/api/merchants/${id}`);
}

// ─── Chat / 实时消息 ─────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  type: string;
  name: string | null;
  createdAt: string;
  lastMessage?: { content: string; createdAt: string; senderId: string };
  unreadCount?: number;
}

export interface ChatMessageItem {
  id: string;
  roomId: string;
  senderId: string;
  type: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

export async function fetchChatRooms(): Promise<ChatRoom[]> {
  return fetchAuthed('/api/chat/rooms', { method: 'GET' });
}

export async function fetchChatMessages(roomId: string, page = 1): Promise<{ items: ChatMessageItem[]; total: number }> {
  return fetchAuthed(`/api/chat/rooms/${roomId}/messages?page=${page}`, { method: 'GET' });
}

export async function sendChatMessage(roomId: string, content: string): Promise<ChatMessageItem> {
  return fetchAuthed(`/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, type: 'TEXT' }),
  });
}

export async function markChatRead(roomId: string): Promise<void> {
  await fetchAuthed(`/api/chat/rooms/${roomId}/read`, { method: 'POST' });
}
