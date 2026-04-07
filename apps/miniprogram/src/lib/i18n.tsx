import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'

import zhCN from './i18n/zh-CN.json'
import en from './i18n/en.json'
import ja from './i18n/ja.json'
import ko from './i18n/ko.json'
import th from './i18n/th.json'
import hi from './i18n/hi.json'
import ar from './i18n/ar.json'

/* ─── Types ─── */

export type Locale = 'zh-CN' | 'en' | 'ja' | 'ko' | 'th' | 'hi' | 'ar'

type TranslationMap = Record<string, string>

/* ─── Locale Registry ─── */

const messages: Record<Locale, TranslationMap> = {
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  th,
  hi,
  ar,
}

const STORAGE_KEY = 'zuting_locale'
const DEFAULT_LOCALE: Locale = 'zh-CN'

function getStoredLocale(): Locale {
  try {
    const stored = Taro.getStorageSync(STORAGE_KEY) as string
    if (stored && stored in messages) {
      return stored as Locale
    }
  } catch {
    // storage unavailable, fall back
  }
  return DEFAULT_LOCALE
}

/* ─── Context ─── */

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
})

/* ─── Provider ─── */

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      Taro.setStorageSync(STORAGE_KEY, newLocale)
    } catch {
      // storage write failed, locale still updated in memory
    }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // 1. Try current locale
      let value: string | undefined
      const current = messages[locale]
      if (current && key in current) {
        value = current[key]
      }
      // 2. Fallback to zh-CN
      if (!value && locale !== DEFAULT_LOCALE) {
        const fallback = messages[DEFAULT_LOCALE]
        if (fallback && key in fallback) {
          value = fallback[key]
        }
      }
      // 3. Return key itself if not found
      if (!value) return key
      // 4. Replace {param} placeholders
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, k) =>
          k in params ? String(params[k]) : `{${k}}`,
        )
      }
      return value
    },
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

/* ─── Hook ─── */

export function useTranslation() {
  return useContext(I18nContext)
}
