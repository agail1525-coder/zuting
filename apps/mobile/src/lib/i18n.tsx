import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import zhCN from './i18n/zh-CN.json';
import en from './i18n/en.json';
import ja from './i18n/ja.json';
import ko from './i18n/ko.json';
import th from './i18n/th.json';
import hi from './i18n/hi.json';
import ar from './i18n/ar.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'zh-CN' | 'en' | 'ja' | 'ko' | 'th' | 'hi' | 'ar';

type Messages = Record<string, string>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = '@zuting/locale';
const DEFAULT_LOCALE: Locale = 'zh-CN';

const MESSAGES: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  th,
  hi,
  ar,
};

const RTL_LOCALES: Locale[] = ['ar'];

export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  th: 'ไทย',
  hi: 'हिन्दी',
  ar: 'العربية',
};

export const ALL_LOCALES: Locale[] = [
  'zh-CN',
  'en',
  'ja',
  'ko',
  'th',
  'hi',
  'ar',
];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
  isRTL: false,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Load persisted locale on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored: string | null) => {
      if (stored && ALL_LOCALES.includes(stored as Locale)) {
        setLocaleState(stored as Locale);
      }
    });
  }, []);

  // Persist locale when changed
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  // Translation function — falls back to zh-CN, then to raw key
  const t = useCallback(
    (key: string): string => {
      const msg = MESSAGES[locale]?.[key];
      if (msg !== undefined) return msg;

      // Fallback to zh-CN
      const fallback = MESSAGES[DEFAULT_LOCALE]?.[key];
      if (fallback !== undefined) return fallback;

      // Return the key itself as last resort
      return key;
    },
    [locale],
  );

  const isRTL = RTL_LOCALES.includes(locale);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, isRTL }),
    [locale, setLocale, t, isRTL],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTranslation() {
  return useContext(I18nContext);
}
