/**
 * theme/theme.ts
 *
 * Centralized design tokens for the Ductivity app.
 * Import from here instead of hardcoding hex values.
 */

export const colors = {
  bg: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#1C2333',
    elevated: '#21262D',
    card: 'rgba(22, 27, 34, 0.75)',
  },
  accent: {
    primary: '#E94560',
    secondary: '#FF6B6B',
    muted: 'rgba(233, 69, 96, 0.15)',
    glow: 'rgba(233, 69, 96, 0.4)',
  },
  text: {
    primary: '#F0F6FC',
    secondary: '#C9D1D9',
    muted: '#8B949E',
    dim: '#484F58',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.12)',
    accent: 'rgba(233, 69, 96, 0.3)',
  },
  category: {
    productive: '#58D68D',
    'semi-productive': '#F0B429',
    'non-productive': '#FF6B6B',
    meh: '#8B949E',
  },
  status: {
    success: '#58D68D',
    warning: '#F0B429',
    danger: '#FF6B6B',
  },
};

export const gradients = {
  screenBg: ['#0D1117', '#161B22', '#0D1117'] as const,
  accent: ['#E94560', '#C13B52'] as const,
  accentWarm: ['#E94560', '#FF6B6B'] as const,
  card: ['rgba(22, 27, 34, 0.8)', 'rgba(28, 35, 51, 0.6)'] as const,
  tabBar: ['#161B22', '#0D1117'] as const,
  topLine: ['transparent', '#E94560', 'transparent'] as const,
  shimmer: ['transparent', 'rgba(255,255,255,0.04)', 'transparent'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  tiny: { fontSize: 10, fontWeight: '600' as const },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};
