// Design system tokens - single source of truth for all platforms
export const COLORS = {
  // Brand
  gold: '#D4A855',
  goldLight: '#E8C97A',
  goldDark: '#B8922E',

  // Backgrounds
  bgPrimary: '#020617',
  bgSecondary: '#0f172a',
  bgCard: '#1e293b',
  bgCardHover: '#334155',

  // Text
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Special
  lotus: '#EC4899',
  jade: '#10B981',
  cinnabar: '#EF4444',
  incense: '#F59E0B',
} as const;

// Religion color system - single source of truth
export const RELIGION_COLORS: Record<string, {
  primary: string;
  light: string;
  dark: string;
  tailwindFrom: string;
  tailwindTo: string;
}> = {
  buddhism:           { primary: '#F59E0B', light: '#FDE68A', dark: '#B45309', tailwindFrom: 'from-amber-600/20',   tailwindTo: 'to-amber-900/20' },
  taoism:             { primary: '#10B981', light: '#6EE7B7', dark: '#047857', tailwindFrom: 'from-emerald-600/20', tailwindTo: 'to-emerald-900/20' },
  christianity:       { primary: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8', tailwindFrom: 'from-blue-600/20',    tailwindTo: 'to-blue-900/20' },
  islam:              { primary: '#059669', light: '#6EE7B7', dark: '#065F46', tailwindFrom: 'from-green-600/20',   tailwindTo: 'to-green-900/20' },
  hinduism:           { primary: '#F97316', light: '#FDBA74', dark: '#C2410C', tailwindFrom: 'from-orange-600/20',  tailwindTo: 'to-orange-900/20' },
  judaism:            { primary: '#6366F1', light: '#A5B4FC', dark: '#4338CA', tailwindFrom: 'from-indigo-600/20',  tailwindTo: 'to-indigo-900/20' },
  confucianism:       { primary: '#DC2626', light: '#FCA5A5', dark: '#991B1B', tailwindFrom: 'from-red-600/20',     tailwindTo: 'to-red-900/20' },
  sikhism:            { primary: '#EA580C', light: '#FDBA74', dark: '#9A3412', tailwindFrom: 'from-orange-600/20',  tailwindTo: 'to-orange-900/20' },
  shinto:             { primary: '#E11D48', light: '#FDA4AF', dark: '#9F1239', tailwindFrom: 'from-rose-600/20',    tailwindTo: 'to-rose-900/20' },
  'tibetan-buddhism': { primary: '#7C3AED', light: '#C4B5FD', dark: '#5B21B6', tailwindFrom: 'from-purple-600/20',  tailwindTo: 'to-purple-900/20' },
  indigenous:         { primary: '#78716C', light: '#D6D3D1', dark: '#44403C', tailwindFrom: 'from-stone-600/20',   tailwindTo: 'to-stone-900/20' },
  bahai:              { primary: '#0891B2', light: '#67E8F9', dark: '#155E75', tailwindFrom: 'from-cyan-600/20',    tailwindTo: 'to-cyan-900/20' },
};

// Route category colors (maps to religion themes)
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ZEN:            { bg: 'bg-stone-800/60',   text: 'text-stone-200',  border: 'border-stone-600/30' },
  BUDDHIST:       { bg: 'bg-amber-900/40',   text: 'text-amber-200',  border: 'border-amber-600/30' },
  TAOIST:         { bg: 'bg-emerald-900/40',  text: 'text-emerald-200', border: 'border-emerald-600/30' },
  CHRISTIAN:      { bg: 'bg-blue-900/40',    text: 'text-blue-200',   border: 'border-blue-600/30' },
  ISLAMIC:        { bg: 'bg-green-900/40',   text: 'text-green-200',  border: 'border-green-600/30' },
  CROSS_CULTURAL: { bg: 'bg-violet-900/40',  text: 'text-violet-200', border: 'border-violet-600/30' },
  HINDU:          { bg: 'bg-orange-900/40',  text: 'text-orange-200', border: 'border-orange-600/30' },
  HERITAGE:       { bg: 'bg-teal-900/40',    text: 'text-teal-200',   border: 'border-teal-600/30' },
  SILK_ROAD:      { bg: 'bg-yellow-900/40',  text: 'text-yellow-200', border: 'border-yellow-600/30' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Generate CSS variables string
export function generateCSSVariables(): string {
  const vars: string[] = [];
  Object.entries(COLORS).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    vars.push(`--color-${cssKey}: ${value};`);
  });
  return vars.join('\n');
}
