export const CURRENCIES = {
  CNY: { symbol: '¥', name: '人民币', nameEn: 'Chinese Yuan', decimals: 2, locale: 'zh-CN' },
  USD: { symbol: '$', name: '美元', nameEn: 'US Dollar', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', name: '欧元', nameEn: 'Euro', decimals: 2, locale: 'de-DE' },
  GBP: { symbol: '£', name: '英镑', nameEn: 'British Pound', decimals: 2, locale: 'en-GB' },
  JPY: { symbol: '¥', name: '日元', nameEn: 'Japanese Yen', decimals: 0, locale: 'ja-JP' },
  KRW: { symbol: '₩', name: '韩元', nameEn: 'Korean Won', decimals: 0, locale: 'ko-KR' },
  INR: { symbol: '₹', name: '印度卢比', nameEn: 'Indian Rupee', decimals: 2, locale: 'hi-IN' },
  THB: { symbol: '฿', name: '泰铢', nameEn: 'Thai Baht', decimals: 2, locale: 'th-TH' },
  SGD: { symbol: 'S$', name: '新加坡元', nameEn: 'Singapore Dollar', decimals: 2, locale: 'en-SG' },
  MYR: { symbol: 'RM', name: '马来西亚林吉特', nameEn: 'Malaysian Ringgit', decimals: 2, locale: 'ms-MY' },
  ILS: { symbol: '₪', name: '以色列谢克尔', nameEn: 'Israeli Shekel', decimals: 2, locale: 'he-IL' },
  SAR: { symbol: '﷼', name: '沙特里亚尔', nameEn: 'Saudi Riyal', decimals: 2, locale: 'ar-SA' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/** Format amount (stored in smallest unit) to display string */
export function formatCurrency(amountInSmallestUnit: number, currency: CurrencyCode = 'CNY'): string {
  const config = CURRENCIES[currency];
  const amount = amountInSmallestUnit / Math.pow(10, config.decimals);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

/** Get exchange rate (placeholder — in production, use real-time API) */
export function getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
  // Placeholder rates relative to CNY
  const toCNY: Record<CurrencyCode, number> = {
    CNY: 1, USD: 7.25, EUR: 7.85, GBP: 9.15, JPY: 0.048,
    KRW: 0.0053, INR: 0.087, THB: 0.20, SGD: 5.35, MYR: 1.55,
    ILS: 1.95, SAR: 1.93,
  };
  return toCNY[from] / toCNY[to];
}

/** Convert amount between currencies */
export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  return Math.round(amount * getExchangeRate(from, to));
}

/** Payment methods available per currency/region */
export const PAYMENT_METHODS_BY_REGION = {
  CN: ['wechat', 'alipay'],
  INTL: ['stripe'],
  JP: ['stripe'],
  KR: ['stripe'],
  IN: ['stripe'],
  GLOBAL: ['stripe'],
} as const;
