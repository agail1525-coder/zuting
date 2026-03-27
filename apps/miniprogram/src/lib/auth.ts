import Taro from '@tarojs/taro'

const TOKEN_KEY = 'zuting_access_token'
const REFRESH_KEY = 'zuting_refresh_token'
const USER_KEY = 'zuting_user'

export const API_URL = process.env.TARO_APP_API_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api' : 'https://zuting.fszyl.top/api')

export interface User {
  id: string
  nickname: string
  avatar: string | null
  role: string
  phone: string | null
  email: string | null
  _count: { trips: number; orders: number; journals: number; practices: number }
}

// ---------- Token storage ----------

export function getAccessToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null
}

export function getRefreshToken(): string | null {
  return Taro.getStorageSync(REFRESH_KEY) || null
}

export function setTokens(accessToken: string, refreshToken: string) {
  Taro.setStorageSync(TOKEN_KEY, accessToken)
  Taro.setStorageSync(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_KEY)
  Taro.removeStorageSync(USER_KEY)
}

// ---------- Cached user ----------

export function getCachedUser(): User | null {
  const raw = Taro.getStorageSync(USER_KEY)
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export function setCachedUser(user: User) {
  Taro.setStorageSync(USER_KEY, JSON.stringify(user))
}

// ---------- WeChat Mini Program Login ----------

/**
 * WeChat native login flow for Mini Program:
 * 1. Taro.login() -> get wx code
 * 2. Send code to backend POST /api/auth/wechat/miniprogram
 * 3. Backend exchanges code for openid via jscode2session
 * 4. Backend returns JWT tokens + user info
 */
export async function wechatLogin(): Promise<User> {
  const loginRes = await Taro.login()
  if (!loginRes.code) {
    throw new Error('微信登录失败，请重试')
  }

  const res = await Taro.request({
    url: `${API_URL}/auth/wechat/miniprogram`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: { code: loginRes.code },
  })

  if (res.statusCode < 200 || res.statusCode >= 300) {
    const msg = res.data?.message || '微信登录失败'
    throw new Error(msg)
  }

  setTokens(res.data.accessToken, res.data.refreshToken)

  // If the backend returned user info inline, cache it
  if (res.data.user) {
    const inlineUser: User = {
      id: res.data.user.id,
      nickname: res.data.user.nickname,
      avatar: res.data.user.avatar || null,
      role: res.data.user.role || 'USER',
      phone: res.data.user.phone || null,
      email: res.data.user.email || null,
      _count: res.data.user._count || { trips: 0, orders: 0, journals: 0, practices: 0 },
    }
    setCachedUser(inlineUser)
  }

  // Always refresh full profile from server
  const user = await fetchMe()
  return user
}

// ---------- Auth API calls ----------

export async function login(phone: string, password: string): Promise<User> {
  const res = await Taro.request({
    url: `${API_URL}/auth/login`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: { phone, password },
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const msg = res.data?.message || '登录失败'
    throw new Error(msg)
  }
  setTokens(res.data.accessToken, res.data.refreshToken)
  const user = await fetchMe()
  return user
}

export async function register(data: {
  phone: string
  nickname: string
  password: string
}): Promise<User> {
  const res = await Taro.request({
    url: `${API_URL}/auth/register`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data,
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const msg = res.data?.message || '注册失败'
    throw new Error(msg)
  }
  setTokens(res.data.accessToken, res.data.refreshToken)
  const user = await fetchMe()
  return user
}

export async function fetchMe(): Promise<User> {
  const token = getAccessToken()
  if (!token) throw new Error('未登录')
  const res = await Taro.request({
    url: `${API_URL}/auth/me`,
    method: 'GET',
    header: { Authorization: `Bearer ${token}` },
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    clearTokens()
    throw new Error('登录已过期')
  }
  const user = res.data as User
  setCachedUser(user)
  return user
}

export async function logout() {
  const token = getAccessToken()
  if (token) {
    try {
      await Taro.request({
        url: `${API_URL}/auth/logout`,
        method: 'POST',
        header: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // ignore
    }
  }
  clearTokens()
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}
