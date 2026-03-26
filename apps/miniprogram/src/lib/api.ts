import Taro from '@tarojs/taro'

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

  try {
    const res = await Taro.request({ url, method: 'GET' })
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

// Trip interfaces and endpoints
export interface Trip {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
  sitesCount: number
  description: string
}

export interface TripDetail extends Trip {
  sites: { id: string; name: string; city: string; country: string }[]
  history: { status: string; date: string; note: string }[]
}

export function fetchTrips(status?: string) {
  return request<Trip[]>('/trips', status ? { status } : undefined)
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
  mood: string
  siteId?: string
  siteName?: string
  createdAt: string
}

export function fetchJournals() {
  return request<Journal[]>('/journals')
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
  const url = `${BASE_URL}/chat`
  try {
    const res = await Taro.request({
      url,
      method: 'POST',
      data: { message, history },
      header: { 'Content-Type': 'application/json' },
    })
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as ChatMessage
    }
    throw new Error(`API Error: ${res.statusCode}`)
  } catch (err) {
    console.error('[API] /chat failed:', err)
    throw err
  }
}

export function getAISuggestions() {
  return request<AISuggestion[]>('/chat/suggestions')
}
