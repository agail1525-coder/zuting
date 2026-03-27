import Taro from '@tarojs/taro'
import { getAccessToken } from './auth'

const BASE_URL = process.env.TARO_APP_API_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api' : 'https://zuting.fszyl.top/api')

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
  religion?: Religion
  religionId: string
}

export interface Temple {
  id: string
  name: string
  nameEn: string
  description: string
  city: string
  country: string
  latitude: number
  longitude: number
  founded: string
  imageUrl?: string
  religion?: Religion
  religionId: string
}

export interface Patriarch {
  id: string
  name: string
  nameEn: string
  title: string
  era: string
  biography: string
  imageUrl?: string
  religion?: Religion
  religionId: string
}

export interface Teaching {
  id: string
  content: string
  source: string
  religion?: Religion
  religionId: string
}

export interface Seal {
  id: string
  number: number
  name: string
  nameEn: string
  series: string
  verse: string
  meaning: string
  practice: string
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

// Seal endpoints
export function fetchSeals(series?: string) {
  return request<Seal[]>('/seals', series ? { series } : undefined)
}

export function fetchSealById(id: string) {
  return request<Seal>(`/seals/${id}`)
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

export function fetchJournals(params?: { page?: string; limit?: string; isPublic?: string }) {
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
