import Taro from '@tarojs/taro'
import { getAccessToken } from './auth'

const BASE_URL = process.env.TARO_APP_API_URL
  || (process.env.NODE_ENV === 'development' ? 'http://192.168.1.22:3002/api' : 'https://zuting.fszyl.top/api')

export interface Religion {
  id: string
  name: string
  nameEn: string
  slug: string
  emoji: string
  description: string
  foundedYear: string
  origin: string
  followerCount: string
  _count?: {
    holySites: number
    temples: number
    patriarchs: number
    teachings: number
  }
}

export interface HolySite {
  id: string
  name: string
  nameEn: string
  description: string
  city: string
  country: string
  latitude: number
  longitude: number
  utcOffset: number
  imageUrl?: string
  openingHours?: string
  ticketPrice?: string
  bestSeason?: string
  visitDuration?: string
  transport?: string
  tips?: string[]
  nearbyFood?: string
  nearbyStay?: string
  nearbyExperience?: string
  nearbySights?: string
  religion?: Religion
  religionId: string
}

export interface Temple {
  id: string
  name: string
  nameEn?: string
  description: string
  city?: string
  country: string
  latitude?: number
  longitude?: number
  foundingDate?: string
  imageUrl?: string
  religion?: Religion
  religionId: string
}

export interface Patriarch {
  id: string
  name: string
  nameEn?: string
  title?: string
  dates?: string
  biography: string
  coreTeaching?: string
  imageUrl?: string
  religion?: Religion
  religionId: string
}

export interface Teaching {
  id: string
  name: string
  originalText: string
  sourceText?: string
  translationCn?: string
  religion?: Religion
  religionId: string
}

export interface Seal {
  id: number
  name: string
  series: string
  poem: string
  essence: string
  practice: string
  vow: string
  color?: string
}

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  let url = `${BASE_URL}${path}`
  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (query) url += `?${query}`
  }

  const token = getAccessToken()
  const header: Record<string, string> = {}
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({ url, method: 'GET', header })
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }
    throw new Error(`API Error: ${res.statusCode}`)
  } catch (err) {
    console.error(`[API] ${path} failed:`, err)
    throw err
  }
}

// Religion endpoints
export function fetchReligions() {
  return request<Religion[]>('/religions')
}

export function fetchReligionBySlug(slug: string) {
  return request<Religion[]>('/religions', { slug }).then(list => list[0])
}

export function fetchReligionById(id: string) {
  return request<Religion>(`/religions/${id}`)
}

// Holy site endpoints
export function fetchHolySites(religionId?: string) {
  return request<HolySite[]>('/holy-sites', religionId ? { religionId } : undefined)
}

export function fetchHolySiteById(id: string) {
  return request<HolySite>(`/holy-sites/${id}`)
}

// Temple endpoints
export function fetchTemples(religionId?: string) {
  return request<Temple[]>('/temples', religionId ? { religionId } : undefined)
}

export function fetchTempleById(id: string) {
  return request<Temple>(`/temples/${id}`)
}

// Patriarch endpoints
export function fetchPatriarchs(religionId?: string) {
  return request<Patriarch[]>('/patriarchs', religionId ? { religionId } : undefined)
}

export function fetchPatriarchById(id: string) {
  return request<Patriarch>(`/patriarchs/${id}`)
}

// Teaching endpoints
export function fetchTeachings(religionId?: string) {
  return request<Teaching[]>('/teachings', religionId ? { religionId } : undefined)
}

export function fetchTeachingById(id: string) {
  return request<Teaching>(`/teachings/${id}`)
}

// Seal endpoints
export function fetchSeals(series?: string) {
  return request<Seal[]>('/seals', series ? { series } : undefined)
}

export function fetchSealById(id: string) {
  return request<Seal>(`/seals/${id}`)
}

// Route interfaces
export interface Route {
  id: string
  slug: string
  title: string
  titleEn: string
  subtitle: string
  category: string
  difficulty: string
  status: string
  duration: number
  nights: number
  season: string
  groupSize: string
  priceFrom: number
  coverImage: string | null
  highlights: string[]
  description: string
  itinerary: ItineraryDay[]
  included: string[]
  excluded: string[]
  tips: string[]
  rating: number | null
  reviewCount: number
  bookCount: number
  religion?: Religion
  sites: RouteSiteWithDetail[]
}

export interface ItineraryDay {
  day: number
  title: string
  activities: string[]
  meals: string[]
  accommodation: string
}

export interface RouteSiteWithDetail {
  id: string
  day: number
  order: number
  duration: string | null
  site: { id: string; name: string; country: string }
}

export interface PaginatedRoutes {
  items: Route[]
  total: number
  page: number
  pageSize: number
}

// Route endpoints
export function fetchRoutes(params?: { category?: string; difficulty?: string; sort?: string; page?: string; pageSize?: string }) {
  return request<PaginatedRoutes>('/routes', params as Record<string, string>)
}

export function fetchFeaturedRoutes(limit = 8) {
  return request<Route[]>('/routes/featured', { limit: String(limit) })
}

export function fetchRouteBySlug(slug: string) {
  return request<Route>(`/routes/${slug}`)
}

export function fetchRoutesBySite(siteId: string) {
  return request<Route[]>(`/routes/by-site/${siteId}`)
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Trip interfaces and endpoints
export interface Trip {
  id: string
  title: string
  status: string
  startDate: string | null
  endDate: string | null
  note: string | null
  sites: { id: string; site: { id: string; name: string; nameEn: string; city: string; country: string } }[]
  _count: { orders: number; journals: number }
  createdAt: string
}

export interface TripSiteDetail {
  id: string
  site: { id: string; name: string; nameEn: string; city: string; country: string }
  order: number
}

export interface TripStatusHistoryItem {
  id: string
  status: string
  note: string | null
  createdAt: string
}

export interface TripDetail extends Trip {
  user: { id: string; nickname: string; avatar: string | null }
  statusHistory: TripStatusHistoryItem[]
  orders: { id: string; status: string; amount: number; createdAt: string }[]
  journals: { id: string; title: string; createdAt: string }[]
  availableActions: { action: string; targetStatus: string; label: string }[]
  statusLabel: string
  statusColor: string
}

export function fetchTrips(status?: string) {
  return request<PaginatedResponse<Trip>>('/trips', status ? { status } : undefined)
}

export function fetchTrip(id: string) {
  return request<TripDetail>(`/trips/${id}`)
}

// Order endpoints
export interface Order {
  id: string
  tripId: string
  status: string
  amount: number
  createdAt: string
}

export function fetchOrders() {
  return request<Order[]>('/orders')
}

// Journal endpoints
export interface Journal {
  id: string
  title: string
  content: string
  mood: string | null
  isPublic: boolean
  images: string[]
  siteId: string | null
  tripId: string | null
  user?: { id: string; nickname: string; avatar: string | null }
  trip?: { id: string; title: string } | null
  createdAt: string
}

export function fetchJournals(params?: { page?: string; limit?: string; isPublic?: string; userId?: string }) {
  return request<PaginatedResponse<Journal>>('/journals', params)
}

export function fetchJournalById(id: string) {
  return request<Journal>(`/journals/${id}`)
}

// AI Chat endpoints
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AISuggestion {
  text: string
  category: string
}

export async function chatWithXiaohong(message: string, history?: ChatMessage[]): Promise<ChatMessage> {
  return postRequest<ChatMessage>('/xiaohong/chat', { message, history })
}

export function getAISuggestions() {
  return request<AISuggestion[]>('/xiaohong/suggestions')
}

// Trip transition
async function postRequest<T>(path: string, data?: Record<string, unknown> | object): Promise<T> {
  const url = `${BASE_URL}${path}`
  const token = getAccessToken()
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  try {
    const res = await Taro.request({
      url,
      method: 'POST',
      data,
      header,
    })
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }
    throw new Error(`API Error: ${res.statusCode}`)
  } catch (err) {
    console.error(`[API] POST ${path} failed:`, err)
    throw err
  }
}

export function transitionTrip(tripId: string, action: string) {
  return postRequest<TripDetail>(`/trips/${tripId}/transition`, { action })
}

// Trip creation
export interface CreateTripInput {
  title: string
  startDate: string
  endDate: string
  persons?: number
  contactName?: string
  contactPhone?: string
  note?: string
}

export function createTrip(input: CreateTripInput) {
  return postRequest<TripDetail>('/trips', input)
}

// Journal creation
export interface CreateJournalInput {
  title: string
  content: string
  mood?: string
  isPublic?: boolean
  tripId?: string
}

export function createJournal(input: CreateJournalInput) {
  return postRequest<Journal>('/journals', input)
}

// Search endpoints
export interface SearchResultItem {
  type: string
  id: string | number
  title: string
  subtitle: string | null
  descriptionSnippet: string | null
  image: string | null
  religion: { name: string; symbol: string | null; color: string | null } | null
}

export interface SearchResponse {
  query: string
  type: string
  page: number
  limit: number
  total: number
  results: SearchResultItem[]
}

export function searchAll(q: string, type: string = 'all', page: number = 1, limit: number = 20) {
  return request<SearchResponse>('/search', {
    q,
    type,
    page: String(page),
    limit: String(limit),
  })
}

// --- Reviews ---

export interface ReviewUser {
  id: string
  nickname: string | null
  avatar: string | null
}

export interface Review {
  id: string
  rating: number
  content: string
  images: string[]
  createdAt: string
  user: ReviewUser
}

export interface ReviewListResponse {
  data: Review[]
  total: number
  page: number
  limit: number
}

export interface ReviewStats {
  averageRating: number
  totalCount: number
  distribution: Record<number, number>
}

export interface CreateReviewData {
  targetType: 'TRIP' | 'GUIDE' | 'SITE'
  targetId: string
  rating: number
  content?: string
}

export function fetchReviewStats(targetType: string, targetId: string) {
  return request<ReviewStats>(`/reviews/stats/${targetType}/${targetId}`)
}

export function fetchReviews(targetType: string, targetId: string, limit = 5) {
  return request<ReviewListResponse>('/reviews', { targetType, targetId, limit: String(limit) })
}

export function createReview(data: CreateReviewData) {
  return postRequest<Review>('/reviews', data)
}

// --- Orders ---

export interface OrderDetail {
  id: string
  orderNo: string
  tripId: string
  userId: string
  totalAmount: number
  paidAmount: number | null
  paymentMethod: string | null
  status: string
  createdAt: string
  paidAt: string | null
  cancelledAt: string | null
  refundedAt: string | null
  trip?: { id: string; title: string; status: string }
}

export interface OrderListResponse {
  data: OrderDetail[]
  total: number
  page: number
  limit: number
}

export function fetchOrderList(params?: { status?: string; page?: string; limit?: string }) {
  return request<OrderListResponse>('/orders', params)
}

export function cancelOrder(id: string) {
  return postRequest<OrderDetail>(`/orders/${id}/cancel`, {})
}

// --- Notifications ---

export interface AppNotification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  link: string | null
  read: boolean
  createdAt: string
}

export interface NotificationListResponse {
  data: AppNotification[]
  total: number
  page: number
  limit: number
}

export function fetchNotifications(params?: { page?: string; limit?: string; unreadOnly?: string }) {
  return request<NotificationListResponse>('/notifications', params)
}

export function fetchUnreadCount() {
  return request<{ count: number }>('/notifications/unread-count')
}

export function markNotificationRead(id: string) {
  return postRequest<AppNotification>(`/notifications/${id}/read`, {})
}

export function markAllNotificationsRead() {
  return postRequest<void>('/notifications/read-all', {})
}
