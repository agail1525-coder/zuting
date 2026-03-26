"use client";

import { useMemo } from "react";

const CURRENCIES: Record<
  string,
  { decimals: number; locale: string }
> = {
  CNY: { decimals: 2, locale: "zh-CN" },
  USD: { decimals: 2, locale: "en-US" },
  EUR: { decimals: 2, locale: "de-DE" },
  GBP: { decimals: 2, locale: "en-GB" },
  JPY: { decimals: 0, locale: "ja-JP" },
  KRW: { decimals: 0, locale: "ko-KR" },
  INR: { decimals: 2, locale: "hi-IN" },
  THB: { decimals: 2, locale: "th-TH" },
  SGD: { decimals: 2, locale: "en-SG" },
  MYR: { decimals: 2, locale: "ms-MY" },
  ILS: { decimals: 2, locale: "he-IL" },
  SAR: { decimals: 2, locale: "ar-SA" },
};

interface CurrencyDisplayProps {
  /** Amount in the smallest currency unit (e.g. cents for CNY/USD, whole yen for JPY) */
  amount: number;
  /** ISO 4217 currency code, defaults to CNY */
  currency?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Displays a monetary amount formatted according to the currency's locale.
 * Accepts amounts in the smallest unit (cents/fen) and converts for display.
 */
export default function CurrencyDisplay({
  amount,
  currency = "CNY",
  className,
}: CurrencyDisplayProps) {
  const formatted = useMemo(() => {
    const config = CURRENCIES[currency] ?? CURRENCIES["CNY"];
    const displayAmount = amount / Math.pow(10, config.decimals);
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(displayAmount);
  }, [amount, currency]);

  return <span className={className}>{formatted}</span>;
}
