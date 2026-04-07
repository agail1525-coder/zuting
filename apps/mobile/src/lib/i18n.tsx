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
  t: (key: string, params?: Record<string, string | number>) => string;
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
  t: (key: string, _params?: Record<string, string | number>) => key,
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
    (key: string, params?: Record<string, string | number>): string => {
      let msg = MESSAGES[locale]?.[key];
      if (msg === undefined) {
        // Fallback to zh-CN
        msg = MESSAGES[DEFAULT_LOCALE]?.[key];
      }
      if (msg === undefined) {
        // Return the key itself as last resort
        return key;
      }
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return msg;
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
