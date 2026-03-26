// 12 religion slugs, names, symbols, colors
export const RELIGIONS = [
  { slug: 'buddhism', name: '佛教', nameEn: 'Buddhism', symbol: '☸', color: '#F59E0B' },
  { slug: 'taoism', name: '道教', nameEn: 'Taoism', symbol: '☯', color: '#10B981' },
  { slug: 'christianity', name: '基督教', nameEn: 'Christianity', symbol: '✝', color: '#3B82F6' },
  { slug: 'islam', name: '伊斯兰教', nameEn: 'Islam', symbol: '☪', color: '#059669' },
  { slug: 'hinduism', name: '印度教', nameEn: 'Hinduism', symbol: '🕉', color: '#F97316' },
  { slug: 'judaism', name: '犹太教', nameEn: 'Judaism', symbol: '✡', color: '#6366F1' },
  { slug: 'confucianism', name: '儒教', nameEn: 'Confucianism', symbol: '儒', color: '#DC2626' },
  { slug: 'sikhism', name: '锡克教', nameEn: 'Sikhism', symbol: '☬', color: '#EA580C' },
  { slug: 'shinto', name: '神道教', nameEn: 'Shinto', symbol: '⛩', color: '#E11D48' },
  { slug: 'tibetan-buddhism', name: '藏传佛教', nameEn: 'Tibetan Buddhism', symbol: '༄', color: '#7C3AED' },
  { slug: 'indigenous', name: '原住民灵性', nameEn: 'Indigenous Spirituality', symbol: '◉', color: '#78716C' },
  { slug: 'bahai', name: '巴哈伊教', nameEn: "Bahá'í", symbol: '✦', color: '#0891B2' },
] as const;

export type ReligionSlug = typeof RELIGIONS[number]['slug'];
