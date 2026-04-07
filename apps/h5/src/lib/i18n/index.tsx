import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import zhCN from "./zh-CN.json";
import en from "./en.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ar from "./ar.json";
import hi from "./hi.json";
import th from "./th.json";

export type Locale = "zh-CN" | "en" | "ja" | "ko" | "ar" | "hi" | "th";

const LOCALE_STORAGE_KEY = "zuting-locale";
const DEFAULT_LOCALE: Locale = "zh-CN";

const translations: Record<Locale, Record<string, string>> = {
  "zh-CN": zhCN,
  en: en,
  ja: ja,
  ko: ko,
  ar: ar,
  hi: hi,
  th: th,
};

const langMap: Record<Locale, string> = {
  "zh-CN": "zh",
  en: "en",
  ja: "ja",
  ko: "ko",
  ar: "ar",
  hi: "hi",
  th: "th",
};

const RTL_LOCALES: Locale[] = ["ar"];

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && stored in translations) return stored as Locale;
  return DEFAULT_LOCALE;
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = getInitialLocale();
    if (saved !== locale) {
      setLocaleState(saved);
    }
    document.documentElement.lang = langMap[saved];
    document.documentElement.dir = isRTL(saved) ? "rtl" : "ltr";
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = langMap[newLocale];
      document.documentElement.dir = isRTL(newLocale) ? "rtl" : "ltr";
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
