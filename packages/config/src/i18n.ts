// Supported languages
export const LANGUAGES = [
  { code: 'zh-CN', name: '中文', nameEn: 'Chinese' },
  { code: 'en', name: 'English', nameEn: 'English' },
  { code: 'ja', name: '日本語', nameEn: 'Japanese' },
  { code: 'ko', name: '한국어', nameEn: 'Korean' },
  { code: 'ar', name: 'العربية', nameEn: 'Arabic' },
  { code: 'hi', name: 'हिन्दी', nameEn: 'Hindi' },
  { code: 'th', name: 'ไทย', nameEn: 'Thai' },
  { code: 'vi', name: 'Tiếng Việt', nameEn: 'Vietnamese' },
  { code: 'id', name: 'Bahasa Indonesia', nameEn: 'Indonesian' },
  { code: 'ms', name: 'Bahasa Melayu', nameEn: 'Malay' },
  { code: 'fr', name: 'Français', nameEn: 'French' },
  { code: 'es', name: 'Español', nameEn: 'Spanish' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];
export const DEFAULT_LANGUAGE: LanguageCode = 'zh-CN';
