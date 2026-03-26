/**
 * Server-side currency formatting utilities.
 * Mirrors the logic in @zuting/config/currency for backend use.
 */

const CURRENCIES: Record<string, { symbol: string; decimals: number; locale: string }> = {
  CNY: { symbol: '¥', decimals: 2, locale: 'zh-CN' },
  USD: { symbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', decimals: 2, locale: 'de-DE' },
  GBP: { symbol: '£', decimals: 2, locale: 'en-GB' },
  JPY: { symbol: '¥', decimals: 0, locale: 'ja-JP' },
  KRW: { symbol: '₩', decimals: 0, locale: 'ko-KR' },
  INR: { symbol: '₹', decimals: 2, locale: 'hi-IN' },
  THB: { symbol: '฿', decimals: 2, locale: 'th-TH' },
  SGD: { symbol: 'S$', decimals: 2, locale: 'en-SG' },
  MYR: { symbol: 'RM', decimals: 2, locale: 'ms-MY' },
  ILS: { symbol: '₪', decimals: 2, locale: 'he-IL' },
  SAR: { symbol: '﷼', decimals: 2, locale: 'ar-SA' },
};

/**
 * Format an amount stored in the smallest currency unit (e.g. cents/fen)
 * into a human-readable string.
 */
export function formatAmount(cents: number, currency: string = 'CNY'): string {
  const config = CURRENCIES[currency] ?? CURRENCIES['CNY'];
  const amount = cents / Math.pow(10, config.decimals);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}
