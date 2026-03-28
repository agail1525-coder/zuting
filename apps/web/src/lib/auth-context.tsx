'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAccessToken, setTokens, clearTokens } from './auth';
import { fetchMe, loginUser, registerUser, logoutUser } from './api';

interface User {
  id: string;
  nickname: string;
  avatar: string | null;
  role: string;
  phone: string | null;
  email: string | null;
  _count: { trips: number; orders: number; journals: number; practices: number };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { phone?: string; email?: string; password: string; nickname: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      setUser(await fetchMe(token));
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (phone: string, password: string) => {
    const data = await loginUser(phone, password);
    setTokens(data.accessToken, data.refreshToken);
    await refreshUser();
  };

  const register = async (body: { phone?: string; email?: string; password: string; nickname: string }) => {
    const data = await registerUser(body);
    setTokens(data.accessToken, data.refreshToken);
    await refreshUser();
  };

  const logout = async () => {
    const token = getAccessToken();
    if (token) {
      await logoutUser(token);
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
