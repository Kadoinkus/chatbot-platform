/**
 * UI Classes - Canonical Class Map for Design System
 * ==================================================
 *
 * This file documents all canonical CSS class strings used in the design system.
 * Use these constants when building custom components to ensure consistency.
 *
 * IMPORTANT: Always prefer using UI primitives from @/components/ui over raw classes.
 * This file is for reference and edge cases where primitives don't fit.
 */

// =============================================================================
// BUTTONS
// =============================================================================

export const buttonClasses = {
  /** Base button styles - do not use alone */
  base: 'btn',

  /** Primary button (black/white bg, inverted text) */
  primary: 'btn-primary',

  /** Secondary button (transparent bg, border) */
  secondary: 'btn-secondary',

  /** Ghost button (transparent, no border) */
  ghost: 'btn-ghost',

  /** Danger/destructive button (red) */
  danger: 'btn-danger',

  /** Button sizes */
  sizes: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4',
    lg: 'h-12 px-6 text-lg',
  },
} as const;

// =============================================================================
// FORM CONTROLS
// =============================================================================

export const formClasses = {
  /** Text input field */
  input: 'input',

  /** Select dropdown */
  select: 'select',

  /** Textarea */
  textarea: 'input resize-none',

  /** Form label */
  label: 'label',

  /** Checkbox */
  checkbox: 'checkbox',

  /** Toggle/Switch wrapper */
  toggle: 'toggle',
  toggleActive: 'toggle toggle-active',
  toggleThumb: 'toggle-thumb',
} as const;

// =============================================================================
// CARDS & CONTAINERS
// =============================================================================

export const cardClasses = {
  /** Basic card with border and shadow */
  base: 'card',

  /** Card with hover effect */
  hover: 'card-hover',

  /** Card padding options */
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8',
  },

  /** Settings panel variant */
  settings: 'settings-panel',
} as const;

// =============================================================================
// BADGES & TAGS
// =============================================================================

export const badgeClasses = {
  /** Base badge styles */
  base: 'badge',

  /** Semantic variants */
  variants: {
    default: 'bg-background-tertiary text-foreground-secondary',
    success: 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500',
    warning: 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500',
    error: 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500',
    info: 'bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500',
  },

  /** Plan tier badges */
  plans: {
    starter: 'badge-plan-starter',
    growth: 'badge-plan-growth',
    premium: 'badge-plan-premium',
    enterprise: 'badge-plan-enterprise',
  },

  /** Small tag/chip variant */
  tag: 'tag',

  /** Status dot */
  statusDot: 'status-dot',
} as const;

// =============================================================================
// TABLES
// =============================================================================

export const tableClasses = {
  /** Data table wrapper */
  table: 'data-table',

  /** Table header cell */
  th: 'text-left px-6 py-3 text-sm font-medium text-foreground-secondary',

  /** Table data cell */
  td: 'px-6 py-4 text-foreground',

  /** Table row with hover */
  row: 'border-b border-border hover:bg-background-hover transition-colors',
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

export const navClasses = {
  /** Tab button */
  tab: 'tab',
  tabActive: 'tab-active',

  /** Navigation item */
  navItem: 'nav-item',
  navItemActive: 'nav-item-active',

  /** Pagination */
  pagination: 'pagination',
  paginationBtn: 'pagination-btn',
  paginationBtnActive: 'pagination-btn-active',
} as const;

// =============================================================================
// ALERTS & FEEDBACK
// =============================================================================

export const alertClasses = {
  /** Base alert styles */
  base: 'alert',

  /** Alert variants */
  variants: {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  },

  /** Alert child elements */
  icon: 'alert-icon',
  title: 'alert-title',
  message: 'alert-message',
} as const;

export const emptyStateClasses = {
  /** Empty state container */
  container: 'empty-state',
  icon: 'empty-state-icon',
  title: 'empty-state-title',
  message: 'empty-state-message',
} as const;

// =============================================================================
// LINKS
// =============================================================================

export const linkClasses = {
  /** Primary link (accent color) */
  primary: 'link',

  /** Subtle/secondary link */
  subtle: 'link-subtle',
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layoutClasses = {
  /** Container with responsive padding */
  container: 'container max-w-7xl mx-auto',

  /** Page padding */
  pagePadding: 'p-4 lg:p-8 pt-20 lg:pt-8',

  /** Main content offset for sidebar */
  mainWithSidebar: 'flex-1 lg:ml-16 min-h-screen',

  /** Filter bar */
  filterBar: 'filter-bar',
} as const;

// =============================================================================
// SETTINGS
// =============================================================================

export const settingsClasses = {
  panel: 'settings-panel',
  title: 'settings-title',
  section: 'settings-section',
  row: 'settings-row',
  rowContent: 'settings-row-content',
  rowTitle: 'settings-row-title',
  rowDesc: 'settings-row-desc',
} as const;

// =============================================================================
// FORM GROUPS
// =============================================================================

export const formGroupClasses = {
  group: 'form-group',
  content: 'form-group-content',
  label: 'form-group-label',
  desc: 'form-group-desc',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typographyClasses = {
  /** Page title */
  pageTitle: 'text-2xl lg:text-3xl font-bold text-foreground',

  /** Section title */
  sectionTitle: 'section-title',

  /** Body text */
  body: 'text-base text-foreground',

  /** Secondary text */
  secondary: 'text-foreground-secondary',

  /** Tertiary/muted text */
  muted: 'text-foreground-tertiary',

  /** Small text */
  small: 'text-sm',

  /** Extra small text */
  xs: 'text-xs',
} as const;

// =============================================================================
// UTILITIES
// =============================================================================

export const utilityClasses = {
  /** Avatar placeholder */
  avatarPlaceholder: 'avatar-placeholder',

  /** Animation classes */
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
  },
} as const;

// =============================================================================
// STATUS COLORS (for dynamic status styling)
// =============================================================================

export const statusColors = {
  live: {
    bg: 'bg-success-100 dark:bg-success-700/30',
    text: 'text-success-700 dark:text-success-500',
    dot: 'bg-success-500',
  },
  paused: {
    bg: 'bg-warning-100 dark:bg-warning-700/30',
    text: 'text-warning-700 dark:text-warning-500',
    dot: 'bg-warning-500',
  },
  error: {
    bg: 'bg-error-100 dark:bg-error-700/30',
    text: 'text-error-700 dark:text-error-500',
    dot: 'bg-error-500',
  },
  draft: {
    bg: 'bg-background-tertiary',
    text: 'text-foreground-secondary',
    dot: 'bg-foreground-tertiary',
  },
} as const;
