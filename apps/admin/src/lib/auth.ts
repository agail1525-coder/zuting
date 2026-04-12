const TOKEN_KEY = 'zuting_admin_token';
const REFRESH_KEY = 'zuting_admin_refresh';
const ROLE_KEY = 'zuting_admin_role';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getCurrentUserRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setCurrentUserRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);

  // Verify admin role
  const me = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${data.accessToken}` },
  });
  if (!me.ok) throw new Error('Failed to get user profile');
  const user = await me.json();
  if (user.role !== 'ADMIN') {
    clearTokens();
    throw new Error('仅管理员可登录后台 / Admin access only');
  }
  setCurrentUserRole(user.role);
  return user;
}

export function logout() {
  clearTokens();
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
