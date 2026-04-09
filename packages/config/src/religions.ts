// 12 cultural tradition slugs, names, symbols, colors
export const RELIGIONS = [
  { slug: 'buddhism', name: '佛教文化', nameEn: 'Buddhist Culture', symbol: '☸', color: '#F59E0B' },
  { slug: 'taoism', name: '道教文化', nameEn: 'Taoist Culture', symbol: '☯', color: '#10B981' },
  { slug: 'christianity', name: '基督文化', nameEn: 'Christian Culture', symbol: '✝', color: '#3B82F6' },
  { slug: 'islam', name: '伊斯兰文化', nameEn: 'Islamic Culture', symbol: '☪', color: '#059669' },
  { slug: 'hinduism', name: '印度文化', nameEn: 'Hindu Culture', symbol: '🕉', color: '#F97316' },
  { slug: 'judaism', name: '犹太文化', nameEn: 'Jewish Culture', symbol: '✡', color: '#6366F1' },
  { slug: 'confucianism', name: '儒家文化', nameEn: 'Confucian Culture', symbol: '儒', color: '#DC2626' },
  { slug: 'sikhism', name: '锡克文化', nameEn: 'Sikh Culture', symbol: '☬', color: '#EA580C' },
  { slug: 'shinto', name: '神道文化', nameEn: 'Shinto Culture', symbol: '⛩', color: '#E11D48' },
  { slug: 'tibetan-buddhism', name: '藏传文化', nameEn: 'Tibetan Buddhist Culture', symbol: '༄', color: '#7C3AED' },
  { slug: 'indigenous', name: '原住民文化', nameEn: 'Indigenous Culture', symbol: '◉', color: '#78716C' },
  { slug: 'bahai', name: '巴哈伊文化', nameEn: "Bahá'í Culture", symbol: '✦', color: '#0891B2' },
] as const;

export type ReligionSlug = typeof RELIGIONS[number]['slug'];
