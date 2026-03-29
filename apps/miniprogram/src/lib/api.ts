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

export interface ReviewReply {
  id: string
  content: string
  createdAt: string
  user: ReviewUser
}

export function replyToReview(reviewId: string, content: string) {
  return postRequest<ReviewReply>(`/reviews/${reviewId}/replies`, { content })
}

export function voteReview(reviewId: string) {
  return postRequest<{ voted: boolean }>(`/reviews/${reviewId}/vote`, {})
}

export function unvoteReview(reviewId: string) {
  return deleteRequest<{ voted: boolean }>(`/reviews/${reviewId}/vote`)
}

// --- Recommendations ---

export type EntityType = 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH' | 'ROUTE'

export interface RecommendedItem {
  id: string
  entityType: EntityType
  title: string
  imageUrl: string | null
  religion: string | null
  subtitle: string | null
}

export function fetchRelatedItems(entityType: EntityType, entityId: string, limit = 6) {
  return request<RecommendedItem[]>('/recommendations/related', {
    entityType,
    entityId,
    limit: String(limit),
  })
}

export function fetchPopularItems(religion?: string, limit = 8) {
  return request<RecommendedItem[]>('/recommendations/popular', {
    ...(religion ? { religion } : {}),
    limit: String(limit),
  })
}

export function recordView(entityType: EntityType, entityId: string): void {
  postRequest<void>('/recommendations/view-history', { entityType, entityId }).catch(() => {})
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

// --- Search Suggestions & Hot Keywords ---

export interface SearchSuggestion {
  text: string
  type: string
}

export interface HotKeyword {
  keyword: string
  count: number
}

export function fetchSearchSuggestions(q: string) {
  return request<SearchSuggestion[]>('/search/suggestions', { q })
}

export function fetchHotKeywords() {
  return request<HotKeyword[]>('/search/hot')
}

// --- Collections ---

export interface CollectionItem {
  id: string
  entityType: string
  entityId: string
  title: string
  image: string | null
  subtitle: string | null
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  coverImage: string | null
  itemCount: number
  items: CollectionItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateCollectionData {
  name: string
  description?: string
  isPublic?: boolean
}

export interface SavedStatus {
  saved: boolean
  collectionId: string | null
  itemId: string | null
}

export function fetchCollections() {
  return request<Collection[]>('/collections')
}

export function fetchCollectionById(id: string) {
  return request<Collection>(`/collections/${id}`)
}

export function createCollection(data: CreateCollectionData) {
  return postRequest<Collection>('/collections', data)
}

export function deleteCollection(id: string) {
  return deleteRequest<void>(`/collections/${id}`)
}

export function quickSave(entityType: string, entityId: string) {
  return postRequest<{ collectionId: string; itemId: string }>('/collections/quick-save', { entityType, entityId })
}

export function checkSaved(entityType: string, entityId: string) {
  return request<SavedStatus>('/collections/check-saved', { entityType, entityId })
}

export function removeFromCollection(collectionId: string, itemId: string) {
  return deleteRequest<void>(`/collections/${collectionId}/items/${itemId}`)
}

// --- Guides ---

export interface GuideItem {
  id: string
  title: string
  coverImage: string | null
  content: string
  tags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string | null
  user: { id: string; nickname: string; avatar: string | null }
}

export async function fetchGuides(params?: { sort?: string; page?: number }): Promise<{ items: GuideItem[]; total: number }> {
  const p: Record<string, string> = {}
  if (params?.sort) p['sort'] = params.sort
  if (params?.page) p['page'] = String(params.page)
  return request<{ items: GuideItem[]; total: number }>('/guides', p)
}

export async function fetchGuide(id: string): Promise<GuideItem> {
  return request<GuideItem>(`/guides/${id}`)
}

export async function likeGuide(id: string): Promise<void> {
  await postRequest<void>(`/guides/${id}/like`, {})
}

export async function unlikeGuide(id: string): Promise<void> {
  await deleteRequest<void>(`/guides/${id}/like`)
}

// --- Questions ---

export interface QuestionItem {
  id: string
  title: string
  content: string
  tags: string[]
  status: string
  viewCount: number
  answerCount: number
  createdAt: string
}

export interface AnswerItem {
  id: string
  content: string
  isAccepted: boolean
  voteCount: number
  createdAt: string
}

export async function fetchQuestions(params?: { sort?: string; page?: number }): Promise<{ items: QuestionItem[]; total: number }> {
  const p: Record<string, string> = {}
  if (params?.sort) p['sort'] = params.sort
  if (params?.page) p['page'] = String(params.page)
  return request<{ items: QuestionItem[]; total: number }>('/questions', p)
}

export async function fetchQuestion(id: string): Promise<QuestionItem & { answers: AnswerItem[] }> {
  return request<QuestionItem & { answers: AnswerItem[] }>(`/questions/${id}`)
}

// --- Community ---

export interface LeaderboardEntry {
  userId: string
  nickname: string
  avatar: string | null
  count: number
  rank: number
}

export async function fetchLeaderboard(type: string, period: string): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>('/community/leaderboard', { type, period })
}

export async function fetchTrending(): Promise<{ hotGuides: GuideItem[]; hotQuestions: QuestionItem[] }> {
  return request<{ hotGuides: GuideItem[]; hotQuestions: QuestionItem[] }>('/community/trending')
}

// --- Checkout & Coupons ---

export interface CouponItem {
  id: string
  code: string
  name: string
  type: string
  value: number
  minAmount: number | null
  maxDiscount: number | null
  startAt: string
  endAt: string
}

export interface PromotionItem {
  id: string
  name: string
  type: string
  discountType: string
  discountValue: number
  startAt: string
  endAt: string
  totalQuota: number
  usedQuota: number
  coverImage: string | null
}

export interface UserCoupon {
  id: string
  status: string
  claimedAt: string
  usedAt: string | null
  coupon: CouponItem
}

export interface UserCouponListResponse {
  data: UserCoupon[]
  total: number
  page: number
  limit: number
}

export interface AvailableCouponListResponse {
  data: CouponItem[]
  total: number
  page: number
  limit: number
}

export interface PromotionListResponse {
  data: PromotionItem[]
  total: number
  page: number
  limit: number
}

export function fetchAvailableCoupons(page = 1) {
  return request<AvailableCouponListResponse>('/coupons/available', { page: String(page) })
}

export function claimCoupon(couponId: string) {
  return postRequest<{ success: boolean; userCouponId: string }>(`/coupons/${couponId}/claim`, {})
}

export function fetchMyCoupons(status?: string) {
  return request<UserCouponListResponse>('/coupons/my/claimed', status ? { status } : undefined)
}

export function fetchPromotions(type?: string) {
  return request<PromotionListResponse>('/promotions', type ? { type } : undefined)
}

export interface CreateOrderInput {
  tripId: string
  amount: number
  couponCode?: string
  paymentMethod?: string
  note?: string
}

export interface CreateOrderResult {
  id: string
  orderNo: string
  totalAmount: number
  discountAmount: number
  payableAmount: number
  status: string
}

export function createOrder(input: CreateOrderInput) {
  return postRequest<CreateOrderResult>('/orders', input)
}

export function payOrder(orderId: string, paymentMethod: string) {
  return postRequest<OrderDetail>(`/orders/${orderId}/pay`, { paymentMethod })
}

// --- Membership ---

export interface MembershipData {
  id: string
  userId: string
  level: string       // BRONZE | SILVER | GOLD | PLATINUM
  points: number
  checkinStreak: number
  lastCheckinDate: string | null
  pointsHistory: PointsHistoryItem[]
  inviteCode: string
}

export interface PointsHistoryItem {
  id: string
  type: string
  points: number
  description: string
  createdAt: string
}

export interface PointsProductItem {
  id: string
  name: string
  description: string
  imageUrl: string | null
  pointsCost: number
  stock: number
  category: string
}

export interface PackageItem {
  id: string
  slug: string
  title: string
  subtitle: string | null
  type: string          // CLASSIC | PREMIUM | LUXURY | CUSTOM
  coverImage: string | null
  priceFrom: number
  duration: number
  nights: number
  groupSize: string | null
  highlights: string[]
  description: string
  religion?: { id: string; name: string; emoji: string }
  status: string
  rating: number | null
  reviewCount: number
}

export interface PackageDetail extends PackageItem {
  itinerary: Array<{ day: number; title: string; activities: string[]; meals: string[]; accommodation: string }>
  included: string[]
  excluded: string[]
  tips: string[]
  sites: Array<{ id: string; site: { id: string; name: string; country: string } }>
}

export function fetchMyMembership() {
  return request<MembershipData>('/membership/my')
}

export function checkin() {
  return postRequest<{ points: number; streak: number; totalPoints: number }>('/membership/checkin', {})
}

export function fetchPointsProducts(category?: string) {
  return request<PointsProductItem[]>('/membership/points-products', category ? { category } : undefined)
}

export function exchangeProduct(productId: string) {
  return postRequest<{ success: boolean; remainingPoints: number }>('/membership/points-products/exchange', { productId })
}

export function fetchPackages(params?: { type?: string; page?: string; pageSize?: string }) {
  return request<{ items: PackageItem[]; total: number }>('/packages', params as Record<string, string> | undefined)
}

export function fetchPackage(idOrSlug: string) {
  return request<PackageDetail>(`/packages/${idOrSlug}`)
}

export function fetchMyInviteCode() {
  return request<{ inviteCode: string; inviteCount: number; rewardPoints: number }>('/membership/invite-code')
}

// ─── Price Tools ─────────────────────────────────────────────────────────────

export interface PriceCalendarDay {
  date: string          // YYYY-MM-DD
  price: number | null  // null = not available
  level: 'low' | 'medium' | 'high' | 'unavailable'
  available: boolean
}

export interface PriceCalendarResponse {
  routeId: string
  year: number
  month: number
  days: PriceCalendarDay[]
  minPrice: number
  maxPrice: number
}

export interface PriceAlertItem {
  id: string
  routeId: string
  routeTitle: string
  targetPrice: number
  currentPrice: number | null
  triggered: boolean
  createdAt: string
}

export interface PriceAlertInput {
  routeId: string
  targetPrice: number
}

export interface PriceCompareItem {
  routeId: string
  routeTitle: string
  coverImage: string | null
  duration: number
  nights: number
  priceFrom: number
  priceHistory: { date: string; price: number }[]
  lowestPrice: number
  highestPrice: number
  avgPrice: number
}

export interface PriceHistoryResponse {
  routeId: string
  history: { date: string; price: number }[]
  lowestPrice: number
  highestPrice: number
  trend: 'rising' | 'falling' | 'stable'
}

export function fetchPriceCalendar(routeId: string, year: number, month: number) {
  return request<PriceCalendarResponse>('/prices/calendar', {
    routeId,
    year: String(year),
    month: String(month),
  })
}

export function fetchPriceHistory(routeId: string, days = 30) {
  return request<PriceHistoryResponse>(`/prices/history/${routeId}`, { days: String(days) })
}

export function fetchPriceAlerts() {
  return request<PriceAlertItem[]>('/prices/alerts')
}

export function createPriceAlert(input: PriceAlertInput) {
  return postRequest<PriceAlertItem>('/prices/alerts', input)
}

export function deletePriceAlert(alertId: string) {
  return deleteRequest<void>(`/prices/alerts/${alertId}`)
}

export function fetchPriceCompare(routeIds: string[]) {
  return request<PriceCompareItem[]>('/prices/compare', { ids: routeIds.join(',') })
}

async function deleteRequest<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`
  const token = getAccessToken()
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  try {
    const res = await Taro.request({ url, method: 'DELETE', header })
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }
    throw new Error(`API Error: ${res.statusCode}`)
  } catch (err) {
    console.error(`[API] DELETE ${path} failed:`, err)
    throw err
  }
}
