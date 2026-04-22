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
  // 目的地++ v1 深度字段
  transportLegs?: {
    from: string
    to: string
    mode: string
    distanceKm?: number
    durationMin?: number
    note?: string
    costFrom?: number
  }[] | null
  culturalProducts?: {
    name: string
    desc: string
    emoji?: string
    tag?: string
    localStore?: string
    priceFrom?: number
  }[] | null
  openingHoursBySeason?: {
    spring?: { open?: string; close?: string; note?: string }
    summer?: { open?: string; close?: string; note?: string }
    autumn?: { open?: string; close?: string; note?: string }
    winter?: { open?: string; close?: string; note?: string }
  } | null
  visitorTipsGrouped?: {
    transport?: string[]
    dining?: string[]
    gear?: string[]
    etiquette?: string[]
  } | null
  localGuides?: {
    name: string
    specialty: string
    languages: string[]
    rating?: number
    bio: string
    avatar?: string
  }[] | null
  photoStory?: {
    imageUrl?: string
    caption: string
    shotLocation?: string
    significance: string
    order?: number
  }[] | null
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
    console.error('[API] request failed:', path, err)
    throw err
  }
}


// Religion endpoints
export async function fetchReligions(): Promise<Religion[]> {
  const res = await request<PaginatedResponse<Religion>>('/religions', { limit: '100' })
  return res.items
}

export async function fetchReligionBySlug(slug: string): Promise<Religion> {
  const res = await request<PaginatedResponse<Religion>>('/religions', { slug, limit: '100' })
  return res.items[0]
}

export function fetchReligionById(id: string) {
  return request<Religion>(`/religions/${id}`)
}

// Holy site endpoints
export async function fetchHolySites(religionId?: string): Promise<HolySite[]> {
  const res = await request<PaginatedResponse<HolySite>>('/holy-sites', { ...(religionId ? { religionId } : {}), limit: '100' })
  return res.items
}

export function fetchHolySiteById(id: string) {
  return request<HolySite>(`/holy-sites/${id}`)
}

// Temple endpoints
export async function fetchTemples(religionId?: string): Promise<Temple[]> {
  const res = await request<PaginatedResponse<Temple>>('/temples', { ...(religionId ? { religionId } : {}), limit: '100' })
  return res.items
}

export function fetchTempleById(id: string) {
  return request<Temple>(`/temples/${id}`)
}

// Patriarch endpoints
export async function fetchPatriarchs(religionId?: string): Promise<Patriarch[]> {
  const res = await request<PaginatedResponse<Patriarch>>('/patriarchs', { ...(religionId ? { religionId } : {}), limit: '100' })
  return res.items
}

export function fetchPatriarchById(id: string) {
  return request<Patriarch>(`/patriarchs/${id}`)
}

// Teaching endpoints
export async function fetchTeachings(religionId?: string): Promise<Teaching[]> {
  const res = await request<PaginatedResponse<Teaching>>('/teachings', { ...(religionId ? { religionId } : {}), limit: '100' })
  return res.items
}

export function fetchTeachingById(id: string) {
  return request<Teaching>(`/teachings/${id}`)
}

// Seal endpoints
export async function fetchSeals(series?: string): Promise<Seal[]> {
  const res = await request<PaginatedResponse<Seal>>('/seals', { ...(series ? { series } : {}), limit: '100' })
  return res.items
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
  items: T[]
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
    console.error('[API] POST failed:', path, err)
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
  postRequest<void>('/recommendations/view-history', { entityType, entityId }).catch((err) => { console.error('Record view failed:', err) })
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

export interface VerifyCouponResult {
  valid: boolean
  discount: number
  discountType: 'FIXED' | 'PERCENTAGE'
  message?: string
}

export function verifyCoupon(code: string, orderAmount: number) {
  return postRequest<VerifyCouponResult>('/coupons/verify', { code, orderAmount })
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

// ─── Referral / 分销推荐 ────────────────────────────────────────────────────

export interface ReferralStats {
  totalInvites: number
  level1Count: number
  level2Count: number
  totalRewards: number
  monthlyRewards: number
}

export interface TeamMember {
  id: string
  inviteeId: string
  level: number
  createdAt: string
}

export interface ReferralRewardItem {
  id: string
  orderId: string
  amount: number
  level: number
  status: string
  createdAt: string
}

export function fetchReferralStats() {
  return request<ReferralStats>('/referral/stats')
}

export function fetchMyTeam() {
  return request<{ level1: TeamMember[]; level2: TeamMember[] }>('/referral/my-team')
}

export function fetchMyRewards(page = 1, limit = 20) {
  return request<{ items: ReferralRewardItem[]; total: number; page: number; pageSize: number }>('/referral/my-rewards', {
    page: String(page),
    limit: String(limit),
  })
}

export function bindInviteCode(code: string) {
  return postRequest<void>('/referral/bind', { code })
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

export function fetchCheapestRoutes(limit = 10) {
  return request<PriceCompareItem[]>('/prices/cheapest', { limit: String(limit) })
}

export interface PriceTrendPoint {
  date: string
  price: number
}

export interface PriceTrendResponse {
  routeId: string
  title: string
  trend: PriceTrendPoint[]
  minPrice: number
  maxPrice: number
  avgPrice: number
  recommendation: string
}

export function fetchPriceTrend(routeId: string, days = 30) {
  return request<PriceTrendResponse>('/prices/trend', { routeId, days: String(days) })
}

// --- Photo Wall ---

export interface PhotoItem {
  id: string
  url: string
  userId: string
  userName: string
  userAvatar: string | null
  entityType: string
  entityId: string
  createdAt: string
}

export function fetchPhotoWall(params?: { page?: number; limit?: number }) {
  const p: Record<string, string> = {}
  if (params?.page) p['page'] = String(params.page)
  if (params?.limit) p['limit'] = String(params.limit)
  return request<{ items: PhotoItem[]; total: number }>('/community/photos', p)
}

// --- Merchant ---

export interface Merchant {
  id: string
  type: string
  name: string
  description: string | null
  logo: string | null
  rating: number
  totalOrders: number
  address: string | null
  services?: { id: string; name: string; price: number }[]
}

export function fetchMerchants(type?: string, page = 1) {
  const qs = type ? `?type=${type}&page=${page}` : `?page=${page}`
  return request<{ items: Merchant[]; total: number }>(`/merchants${qs}`)
}

export function fetchMerchantDetail(id: string) {
  return request<Merchant>(`/merchants/${id}`)
}

// ─── Chat / 实时消息 ─────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string
  type: string
  name: string | null
  createdAt: string
  lastMessage?: { content: string; createdAt: string; senderId: string }
  unreadCount?: number
}

export interface ChatMessageItem {
  id: string
  roomId: string
  senderId: string
  type: string
  content: string
  isDeleted: boolean
  createdAt: string
}

export function fetchChatRooms() {
  return request<ChatRoom[]>('/chat/rooms')
}

export function fetchChatMessages(roomId: string, page = 1) {
  return request<{ items: ChatMessageItem[]; total: number }>(`/chat/rooms/${roomId}/messages`, { page: String(page) })
}

export function sendChatMessage(roomId: string, content: string) {
  return postRequest<ChatMessageItem>(`/chat/rooms/${roomId}/messages`, { content, type: 'TEXT' })
}

export function markChatRead(roomId: string) {
  return postRequest<void>(`/chat/rooms/${roomId}/read`, {})
}

// ======== Media 多媒体导览 ========

export interface MediaContent {
  id: string
  entityType: string
  entityId: string
  mediaType: string
  title: string
  description: string | null
  url: string
  thumbnailUrl: string | null
  duration: number | null
  sortOrder: number
  isActive: boolean
}

export function fetchMediaByEntity(entityType: string, entityId: string) {
  return request<{ data: MediaContent[] }>('/media', { entityType, entityId })
    .then(res => Array.isArray(res.data) ? res.data.filter(m => m.isActive) : [])
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
    console.error('[API] DELETE failed:', path, err)
    throw err
  }
}

// ======== Team Culture 团队文化 (M32) ========

export interface TeamCultureTheme {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  color: string
  icon: string | null
  coverUrl: string | null
  keywords: string[]
  priceFrom: number | null
  durationDays: number | null
}

export interface TeamCase {
  id: string
  slug: string
  teamName: string
  orgType: string
  industry: string | null
  headcount: number
  story: string
  highlights: string[]
  photos: string[]
  testimonial: string | null
}

export async function fetchTeamCultureThemes(): Promise<TeamCultureTheme[]> {
  const res = await request<{ items: TeamCultureTheme[] }>('/team-culture/themes')
  return Array.isArray(res?.items) ? res.items : []
}

export async function fetchTeamCases(): Promise<TeamCase[]> {
  const res = await request<{ items: TeamCase[] }>('/team-culture/cases')
  return Array.isArray(res?.items) ? res.items : []
}

// ── Cultivation 修行圈 (M37) ──────────────────────────

export type CultivationRole = 'NONE' | 'SEEKER' | 'PRACTITIONER' | 'MENTOR' | 'MASTER'
export type Realm = 'AWAKENING' | 'CLARIFYING' | 'SEEING' | 'ATTAINING' | 'INTEGRATING' | 'RETURNING' | 'GIVING_BACK'

export interface CultivationMineResponse {
  hasAccess: boolean
  role: CultivationRole
  expiresAt: string | null
  application: { id: string; status: string; rejectionReason: string | null; createdAt: string } | null
}

export interface CompassResponse {
  journey: {
    primaryTradition: string
    currentRealm: Realm
    oxStage: number
    streakDays: number
    karmaPoints: number
  }
  currentSymbol: { symbolName: string; originalText: string; source: string } | null
  todaySteps: { id: string; title: string; kind: string; completed: boolean }[]
  streakDays: number
}

export interface OxPathResponse {
  currentStage: number
  stages: { stage: number; unlocked: boolean; current: boolean }[]
}

export function fetchCultivationMine() {
  return request<CultivationMineResponse>('/cultivation/apply/mine')
}

export function submitCultivationApplication(data: { motivation: string; experience?: string; primaryTradition?: string }) {
  return postRequest<unknown>('/cultivation/apply', data)
}

export function redeemCultivationInvite(code: string) {
  return postRequest<{ ok: boolean; role: string }>('/cultivation/invite/redeem', { code })
}

export function fetchCompass() {
  return request<CompassResponse>('/cultivation/compass')
}

export function fetchOxPath() {
  return request<OxPathResponse>('/cultivation/ox-path')
}

export function advanceOxStage() {
  return postRequest<unknown>('/cultivation/ox-path/advance')
}

export function submitSealPractice(data: { sealId: string; session: string; audioListenedSec: number; reflection?: string }) {
  return postRequest<unknown>('/cultivation/daily-seal/practice', data)
}

export function fetchThreeLives() {
  return request<{ personalGoal: string | null; familyGoal: string | null; businessGoal: string | null; reviewedAt: string | null }>('/cultivation/three-lives')
}

// ═══════════════════════════════════════════════
// M39 PKB 修行库 (Mini Program)
// ═══════════════════════════════════════════════

async function pkbRequest<T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any): Promise<T> {
  const url = `${BASE_URL}${path}`
  const token = getAccessToken()
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) header['Authorization'] = `Bearer ${token}`
  const res = await Taro.request({ url, method, data, header })
  if (res.statusCode >= 200 && res.statusCode < 300) return res.data as T
  throw new Error(`API Error: ${res.statusCode}`)
}

export type PkbCategoryMini = 'PERSONAL' | 'FAMILY' | 'CAREER' | 'DAILY_STRUGGLE' | 'GENERAL'

export interface PkbEntryMini {
  id: string
  kind: string
  category: PkbCategoryMini
  title: string
  content: string
  mood: string | null
  createdAt: string
}

export interface PkbOverviewMini {
  pkb: {
    personalVow: string | null
    familyVow: string | null
    careerVow: string | null
    currentOxStage: number
    entryCount: number
    insightCount: number
  }
  recentEntries: PkbEntryMini[]
  activeRecs: Array<{ id: string; category: PkbCategoryMini; title: string; reason: string; scriptureSlug: string | null }>
}

export function fetchPkbOverview() {
  return pkbRequest<PkbOverviewMini>('/pkb/me', 'GET')
}

export function updatePkbVows(dto: { personalVow?: string; familyVow?: string; careerVow?: string }) {
  return pkbRequest('/pkb/me/vows', 'PUT', dto)
}

export function submitPkbStruggle(dto: { message: string; category?: PkbCategoryMini }) {
  return pkbRequest<{
    entry: PkbEntryMini
    reply: string
    dailyPractice: string
    citedScriptures: Array<{ slug: string; title: string; tradition: string | null }>
  }>('/pkb/me/struggle', 'POST', dto)
}

export function fetchPkbEntriesMini() {
  return pkbRequest<{ items: PkbEntryMini[]; total: number }>('/pkb/me/entries?pageSize=30', 'GET')
}

// ============================================================================
// Pillars (F5/F6) — 四部曲 + Rankings + CrawlerVideos + TpPackages + PublicProfile
// ============================================================================

async function pillarPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = getAccessToken()
  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) header['Authorization'] = `Bearer ${token}`
  const res = await Taro.request({ url: `${BASE_URL}${path}`, method: 'POST', header, data: body })
  if (res.statusCode >= 200 && res.statusCode < 300) return res.data as T
  throw new Error(`API ${res.statusCode}`)
}

// ── Culture-Life (M40) ──────────────────────────────────────────────────────
export const LIFE_QUESTION_CODES = [
  'ORIGIN_PURPOSE', 'SUFFERING', 'LOVE_RELATIONSHIP', 'WEALTH_DESIRE',
  'FREEDOM_FATE', 'DEATH_TRANSCENDENCE', 'SIN_REDEMPTION', 'KNOWLEDGE',
  'SELF_OTHER', 'TIME_ETERNITY', 'BODY_SOUL', 'LEGACY_IMMORTALITY',
] as const
export type LifeQuestionCode = typeof LIFE_QUESTION_CODES[number]

export const LIFE_STAGES = ['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'] as const
export type LifeStage = typeof LIFE_STAGES[number]

export const LIFE_QUESTION_META: Record<LifeQuestionCode, { title: string; emoji: string }> = {
  ORIGIN_PURPOSE:      { title: '生命的起源与目的', emoji: '🌱' },
  SUFFERING:           { title: '苦难的意义',       emoji: '🔥' },
  LOVE_RELATIONSHIP:   { title: '爱与关系',         emoji: '💞' },
  WEALTH_DESIRE:       { title: '财富与欲望',       emoji: '⚖️' },
  FREEDOM_FATE:        { title: '自由与命运',       emoji: '🦅' },
  DEATH_TRANSCENDENCE: { title: '死亡与超越',       emoji: '🕊️' },
  SIN_REDEMPTION:      { title: '罪与救赎',         emoji: '✝️' },
  KNOWLEDGE:           { title: '知识与无知',       emoji: '📜' },
  SELF_OTHER:          { title: '自我与他者',       emoji: '👥' },
  TIME_ETERNITY:       { title: '时间与永恒',       emoji: '⏳' },
  BODY_SOUL:           { title: '身体与灵魂',       emoji: '🌬️' },
  LEGACY_IMMORTALITY:  { title: '传承与不朽',       emoji: '🌳' },
}

export const LIFE_STAGE_META: Record<LifeStage, { title: string; emoji: string; age: string }> = {
  BIRTH:    { title: '诞生',  emoji: '👶', age: '0-3' },
  GROWTH:   { title: '成长',  emoji: '🌱', age: '4-17' },
  MARRIAGE: { title: '成家',  emoji: '💍', age: '18-30' },
  CAREER:   { title: '立业',  emoji: '💼', age: '25-45' },
  MIDLIFE:  { title: '中年',  emoji: '🌓', age: '40-60' },
  AGING:    { title: '老年',  emoji: '🍂', age: '60+' },
  DEATH:    { title: '临终',  emoji: '🕯️', age: '—' },
}

export interface ReligionBadge {
  id: string
  name: string
  nameEn: string
  slug: string
  symbol: string | null
  color: string | null
}

export interface LifeQuestion {
  id: string
  code: LifeQuestionCode
  title: string
  titleEn: string
  question: string
  philosophicalDepth: string
  sortOrder: number
}

export interface ScriptureRefMini { scripture: string; chapter?: string; quote: string; translation?: string }
export interface MasterQuoteMini  { master: string; quote: string; source?: string }

export interface LifePerspective {
  id: string
  religionId: string
  questionId: string
  corePosition: string
  elaboration: string
  scriptureRefs: ScriptureRefMini[] | null
  masterQuotes: MasterQuoteMini[] | null
  practiceGuide: string | null
  aiReflection: string | null
  religion?: ReligionBadge
  question?: LifeQuestion
}

export interface LifeStageGuide {
  id: string
  religionId: string
  stage: LifeStage
  title: string
  keyWisdom: string
  rituals: Array<{ name: string; purpose?: string; howTo?: string }> | null
  challenges: Array<{ challenge: string; guidance: string }> | null
  scriptureRef: string | null
  religion?: ReligionBadge
}

export const fetchLifeQuestions = () =>
  request<{ items: LifeQuestion[]; total: number }>('/culture-life/questions')

export const fetchQuestionMatrix = (code: string) =>
  request<LifeQuestion & { perspectives: LifePerspective[] }>(`/culture-life/questions/${code}`)

export const fetchLifeStages = () =>
  request<{ items: LifeStageGuide[]; total: number }>('/culture-life/stages')

export const fetchStageMatrix = (stage: string) =>
  request<{ stage: string; items: LifeStageGuide[] }>(`/culture-life/stages/${stage}`)

export const submitDialogue = (situation: string, questionCode?: string) =>
  pillarPost<{ reply: string; citedPerspectives?: LifePerspective[] }>(
    '/culture-life/dialogue',
    { situation, ...(questionCode ? { questionCode } : {}) },
  )

// ── Faith-Assessment (M36) ──────────────────────────────────────────────────
export type FaithMode = 'PERSONAL' | 'FAMILY' | 'ENTERPRISE'

export interface FaithQuestionOption {
  key: 'A' | 'B' | 'C' | 'D'
  text: string
  score: number
  crossScores?: Record<string, number>
}

export interface FaithQuestion {
  id: string
  dimension: string
  sortOrder: number
  questionText: string
  options: FaithQuestionOption[]
}

export interface FaithAssessmentResult {
  id: string
  mode: FaithMode
  scores: {
    awareness: number
    resilience: number
    vision: number
    connection: number
    legacy: number
  }
  totalScore: number
  level: string
  levelCode: string
  levelColor: string
  strongestDimension: string
  weakestDimension: string
  recommendedThemes: string[]
  pointsEarned: number
}

export const fetchFaithQuestions = (mode: FaithMode) =>
  request<{ items: FaithQuestion[]; total: number }>(`/faith-assessment/questions`, { mode })

export const submitFaithAssessment = (
  mode: FaithMode,
  answers: { questionId: string; selectedOption: string }[],
) => pillarPost<FaithAssessmentResult>('/faith-assessment/submit', { mode, answers })

// ── Personal-Growth (M34) ───────────────────────────────────────────────────
export interface PersonalGrowthRichContent {
  dimension?: { code: string; label: string; kicker: string }
  entrepreneurPainPoint?: { title: string; body: string; signs?: string[]; stage?: string }
  philosophy?: { title: string; body: string; quotes?: Array<{ source: string; text: string; translation?: string }> }
  dailyItinerary?: Array<{ day: number; title: string; location: string; dawn?: string; morning?: string; afternoon?: string; evening?: string; soloTime?: string; rituals?: string[] }>
  mentorProfile?: { name: string; title: string; bio: string; expertise?: string[]; philosophy?: string }
  transformationPath?: string[]
  targetAudience?: string[]
  testimonials?: Array<{ name: string; role: string; company: string; quote: string; before: string; after: string }>
  gallery?: string[]
}

export interface PersonalGrowthTheme {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  color: string
  icon: string | null
  coverUrl: string | null
  keywords: string[]
  holySites: string[]
  routes: string[]
  rituals: Array<{ name: string; durationMin: number; description: string }> | null
  richContent: PersonalGrowthRichContent | null
  priceFrom: number | null
  durationDays: number | null
}

export interface PersonalGrowthCase {
  id: string
  slug: string
  teamName: string
  orgType: string
  industry: string | null
  headcount: number
  story: string
  highlights: string[]
  photos: string[]
  videoUrl: string | null
  testimonial: string | null
  publishedAt: string | null
  viewCount: number
  theme: { id: string; slug: string; title: string; color: string } | null
}

export const fetchPgThemes = (page = 1, pageSize = 12) =>
  request<{ items: PersonalGrowthTheme[]; total: number; page: number; pageSize: number }>(
    '/personal-growth/themes', { page: String(page), pageSize: String(pageSize) },
  )

export const fetchPgTheme = (slug: string) =>
  request<PersonalGrowthTheme>(`/personal-growth/themes/${slug}`)

export const fetchPgCases = (page = 1, pageSize = 12) =>
  request<{ items: PersonalGrowthCase[]; total: number; page: number; pageSize: number }>(
    '/personal-growth/cases', { page: String(page), pageSize: String(pageSize) },
  )

export const fetchPgCase = (slug: string) =>
  request<PersonalGrowthCase>(`/personal-growth/cases/${slug}`)

// ── Family-Harmony (M35) ────────────────────────────────────────────────────
export interface FamilyHarmonyRichContent {
  dimension?: { code: string; label: string; kicker: string }
  familyPainPoint?: { title: string; body: string; signs?: string[]; familyType?: string }
  philosophy?: { title: string; body: string; quotes?: Array<{ source: string; text: string; translation?: string }> }
  dailyItinerary?: Array<{ day: number; title: string; location: string; dawn?: string; morning?: string; afternoon?: string; evening?: string; familyTime?: string; rituals?: string[] }>
  mentorProfile?: { name: string; title: string; bio: string; expertise?: string[]; philosophy?: string }
  healingPath?: string[]
  targetAudience?: string[]
  testimonials?: Array<{ name: string; role: string; familySize: number; quote: string; before: string; after: string }>
  gallery?: string[]
}

export interface FamilyHarmonyTheme extends Omit<PersonalGrowthTheme, 'richContent'> {
  richContent: FamilyHarmonyRichContent | null
}

export type FamilyHarmonyCase = PersonalGrowthCase

export const fetchFhThemes = (page = 1, pageSize = 12) =>
  request<{ items: FamilyHarmonyTheme[]; total: number; page: number; pageSize: number }>(
    '/family-harmony/themes', { page: String(page), pageSize: String(pageSize) },
  )

export const fetchFhTheme = (slug: string) =>
  request<FamilyHarmonyTheme>(`/family-harmony/themes/${slug}`)

export const fetchFhCases = (page = 1, pageSize = 12) =>
  request<{ items: FamilyHarmonyCase[]; total: number; page: number; pageSize: number }>(
    '/family-harmony/cases', { page: String(page), pageSize: String(pageSize) },
  )

export const fetchFhCase = (slug: string) =>
  request<FamilyHarmonyCase>(`/family-harmony/cases/${slug}`)

// ── Crawler Videos (CW-YT) ──────────────────────────────────────────────────
export interface CrawlerVideo {
  id: string
  title: string
  url: string
  thumbnailUrl: string | null
  channel: string | null
  publishedAt: string | null
  durationSec: number | null
  viewCount: number | null
}

export const fetchCrawlerVideos = async (
  targetType: 'holySite' | 'religion',
  targetId: string,
  limit = 12,
): Promise<CrawlerVideo[]> => {
  try {
    const res = await request<{ items: CrawlerVideo[] }>(
      '/crawlers/videos',
      { targetType, targetId, limit: String(limit) },
    )
    return Array.isArray(res?.items) ? res.items : []
  } catch {
    return []
  }
}

// ── Community Rankings ──────────────────────────────────────────────────────
export interface RankingEntry {
  userId: string
  nickname: string
  avatar: string | null
  count: number
  rank: number
}

export const fetchRankings = async (
  type: 'guide' | 'review' | 'trip' | 'journal',
  period: 'week' | 'month' | 'all' = 'month',
): Promise<RankingEntry[]> => {
  try {
    return await request<RankingEntry[]>('/community/leaderboard', { type, period })
  } catch {
    return []
  }
}

// ── TP++ Tiered Packages ────────────────────────────────────────────────────
export type TpTier = 'LUXURY' | 'BUSINESS' | 'STANDARD' | 'BUDGET'

export interface TpPackageItem {
  id: string
  tier: TpTier
  category: string
  name: string
  description: string | null
  priceFrom: number
  currency: string
  rating: number | null
  coverImage: string | null
  holySiteId: string | null
  merchantId: string | null
}

export const fetchTpPackages = async (
  holySiteId?: string,
  tier?: TpTier,
): Promise<TpPackageItem[]> => {
  try {
    const params: Record<string, string> = {}
    if (holySiteId) params.holySiteId = holySiteId
    if (tier) params.tier = tier
    const res = await request<{ items?: TpPackageItem[] } | TpPackageItem[]>(
      '/destination-package', params,
    )
    if (Array.isArray(res)) return res
    return Array.isArray((res as { items?: TpPackageItem[] })?.items)
      ? (res as { items: TpPackageItem[] }).items
      : []
  } catch {
    return []
  }
}

export const TP_TIER_META: Record<TpTier, { name: string; color: string; icon: string }> = {
  LUXURY:   { name: '尊贵', color: '#8B6914', icon: '👑' },
  BUSINESS: { name: '商务', color: '#1E40AF', icon: '💼' },
  STANDARD: { name: '标准', color: '#3264ff', icon: '✨' },
  BUDGET:   { name: '自助', color: '#059669', icon: '🎒' },
}

// ── User public profile ─────────────────────────────────────────────────────
export interface PublicUserProfile {
  displayName: string | null
  avatar: string | null
  bio: string | null
  location: string | null
  pilgrimLevel: number
  totalTrips: number
  totalSites: number
  guideCount: number
  reviewCount: number
}

export const fetchPublicUserProfile = (userId: string) =>
  request<PublicUserProfile>(`/users/${userId}/profile`)
