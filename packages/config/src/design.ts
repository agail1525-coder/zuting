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
