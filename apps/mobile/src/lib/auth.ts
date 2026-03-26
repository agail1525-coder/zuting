import { Platform } from 'react-native';

const TOKEN_KEY = 'zuting_access_token';
const REFRESH_KEY = 'zuting_refresh_token';

// Use a declare to avoid needing @types/node for process.env
declare const process: { env: Record<string, string | undefined> };

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api';

// Dynamic import for expo-secure-store (may not be installed)
interface SecureStoreAPI {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}
let SecureStore: SecureStoreAPI | null = null;
try {
  SecureStore = require('expo-secure-store') as SecureStoreAPI;
} catch {
  SecureStore = null;
}

// Fallback: use AsyncStorage when SecureStore is unavailable (e.g. web)
interface AsyncStorageAPI {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
let AsyncStorage: AsyncStorageAPI | null = null;
try {
  const mod = require('@react-native-async-storage/async-storage');
  AsyncStorage = (mod.default || mod) as AsyncStorageAPI;
} catch {
  AsyncStorage = null;
}

// Simple in-memory fallback if neither is available
const memoryStore: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  if (SecureStore && Platform.OS !== 'web') {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // fall through
    }
  }
  if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      // fall through
    }
  }
  return memoryStore[key] ?? null;
}

async function setItem(key: string, value: string): Promise<void> {
  if (SecureStore && Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      // fall through
    }
  }
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      // fall through
    }
  }
  memoryStore[key] = value;
}

async function removeItem(key: string): Promise<void> {
  if (SecureStore && Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      // fall through
    }
  }
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch {
      // fall through
    }
  }
  delete memoryStore[key];
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await setItem(TOKEN_KEY, accessToken);
  await setItem(REFRESH_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await removeItem(TOKEN_KEY);
  await removeItem(REFRESH_KEY);
}
