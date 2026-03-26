export function formatDate(date: string | Date, locale: string = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale: string = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date, locale: string = 'zh-CN'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return rtf.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, 'day');
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, 'month');
  return rtf.format(-Math.floor(months / 12), 'year');
}

/** Format local time for a holy site given its UTC offset */
export function formatLocalTime(utcOffset: number): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + utcOffset * 3600000);
  return local.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const LOCALE_MAP: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
};
