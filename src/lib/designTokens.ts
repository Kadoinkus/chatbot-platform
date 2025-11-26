/**
 * Design Tokens - Single Source of Truth for all design decisions
 *
 * This file defines the design system tokens that power the entire application.
 * All colors, typography, spacing, and other design values should reference these tokens.
 *
 * Usage:
 * - Tailwind config references these for custom theme
 * - CSS variables are generated from these tokens
 * - Components can import specific tokens when needed
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Brand Colors
  brand: {
    primary: '#000000',
    secondary: '#6B7280',
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
  },

  // Neutral Colors (for backgrounds, borders, text)
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Plan/Tier Colors
  plans: {
    starter: {
      bg: '#F3F4F6',
      text: '#374151',
      border: '#E5E7EB',
    },
    growth: {
      bg: '#DBEAFE',
      text: '#1D4ED8',
      border: '#BFDBFE',
    },
    premium: {
      bg: '#F3E8FF',
      text: '#7C3AED',
      border: '#DDD6FE',
    },
    enterprise: {
      bg: '#FFEDD5',
      text: '#C2410C',
      border: '#FED7AA',
    },
  },

  // Status Colors
  status: {
    live: '#10B981',
    paused: '#F59E0B',
    needsFinalization: '#EF4444',
    draft: '#6B7280',
  },
} as const;

// ============================================================================
// LIGHT THEME
// ============================================================================

export const lightTheme = {
  // Backgrounds
  bg: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[900],
    hover: colors.neutral[100],
    active: colors.neutral[200],
  },

  // Text
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[0],
    disabled: colors.neutral[400],
  },

  // Borders
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[300],
    focus: colors.neutral[900],
  },

  // Interactive Elements
  interactive: {
    primary: colors.neutral[900],
    primaryHover: colors.neutral[700],
    secondary: colors.neutral[100],
    secondaryHover: colors.neutral[200],
  },

  // Surfaces (cards, modals, etc.)
  surface: {
    elevated: colors.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Sidebar specific
  sidebar: {
    bg: colors.neutral[900],
    text: colors.neutral[300],
    textHover: colors.neutral[0],
    textActive: colors.neutral[0],
    itemHover: 'rgba(255, 255, 255, 0.05)',
    itemActive: 'rgba(255, 255, 255, 0.1)',
    border: colors.neutral[800],
  },
} as const;

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme = {
  // Backgrounds
  bg: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
    inverse: colors.neutral[0],
    hover: colors.neutral[800],
    active: colors.neutral[700],
  },

  // Text
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[400],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[900],
    disabled: colors.neutral[600],
  },

  // Borders
  border: {
    primary: colors.neutral[700],
    secondary: colors.neutral[600],
    focus: colors.neutral[400],
  },

  // Interactive Elements
  interactive: {
    primary: colors.neutral[0],
    primaryHover: colors.neutral[200],
    secondary: colors.neutral[800],
    secondaryHover: colors.neutral[700],
  },

  // Surfaces (cards, modals, etc.)
  surface: {
    elevated: colors.neutral[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Sidebar specific
  sidebar: {
    bg: colors.neutral[950],
    text: colors.neutral[400],
    textHover: colors.neutral[0],
    textActive: colors.neutral[0],
    itemHover: 'rgba(255, 255, 255, 0.05)',
    itemActive: 'rgba(255, 255, 255, 0.1)',
    border: colors.neutral[800],
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Dark mode shadows (slightly more visible)
export const darkShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  none: 'none',
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button variants
  button: {
    sizes: {
      sm: { px: spacing[3], py: spacing[1.5], fontSize: typography.fontSize.sm[0] },
      md: { px: spacing[4], py: spacing[2], fontSize: typography.fontSize.sm[0] },
      lg: { px: spacing[6], py: spacing[3], fontSize: typography.fontSize.base[0] },
    },
  },

  // Card styles
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
  },

  // Input styles
  input: {
    borderRadius: borderRadius.xl,
    padding: { x: spacing[4], y: spacing[3] },
  },

  // Badge styles
  badge: {
    borderRadius: borderRadius.full,
    padding: { x: spacing[2.5], y: spacing[1] },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get plan colors by plan type
 */
export const getPlanColors = (plan: string) => {
  const planKey = plan.toLowerCase() as keyof typeof colors.plans;
  return colors.plans[planKey] || colors.plans.starter;
};

/**
 * Get status color
 */
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'Live': colors.status.live,
    'Paused': colors.status.paused,
    'Needs finalization': colors.status.needsFinalization,
    'Draft': colors.status.draft,
  };
  return statusMap[status] || colors.status.draft;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type PlanType = keyof typeof colors.plans;
export type StatusType = keyof typeof colors.status;
