"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, type Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "zh-CN", label: "中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "th", label: "ไทย" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 text-xs font-medium rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
      >
        {current.label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gold/20 bg-slate-900/95 backdrop-blur-sm shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === lang.code
                  ? "text-gold bg-gold/10"
                  : "text-gray-300 hover:text-gold hover:bg-gold/5"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
