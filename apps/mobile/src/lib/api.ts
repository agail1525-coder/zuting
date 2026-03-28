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
