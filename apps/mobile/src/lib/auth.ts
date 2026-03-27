import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'zuting_access_token';
const REFRESH_KEY = 'zuting_refresh_token';

// Use a declare to avoid needing @types/node for process.env
declare const process: { env: Record<string, string | undefined> };

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api';

// In-memory fallback for web platform (SecureStore is native-only)
const memoryStore: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryStore[key] ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStore[key] = value;
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    delete memoryStore[key];
    return;
  }
  await SecureStore.deleteItemAsync(key);
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
