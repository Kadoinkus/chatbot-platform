/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Colors using CSS variables for theme switching
      colors: {
        // Background colors
        background: {
          DEFAULT: 'var(--bg-primary)',
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          inverse: 'var(--bg-inverse)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
        },
        // Foreground/text colors
        foreground: {
          DEFAULT: 'var(--text-primary)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          disabled: 'var(--text-disabled)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--border-primary)',
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          focus: 'var(--border-focus)',
        },
        // Interactive elements
        interactive: {
          DEFAULT: 'var(--interactive-primary)',
          primary: 'var(--interactive-primary)',
          'primary-hover': 'var(--interactive-primary-hover)',
          secondary: 'var(--interactive-secondary)',
          'secondary-hover': 'var(--interactive-secondary-hover)',
        },
        // Surface colors
        surface: {
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
        // Sidebar colors
        sidebar: {
          bg: 'var(--sidebar-bg)',
          text: 'var(--sidebar-text)',
          'text-hover': 'var(--sidebar-text-hover)',
          'text-active': 'var(--sidebar-text-active)',
          'item-hover': 'var(--sidebar-item-hover)',
          'item-active': 'var(--sidebar-item-active)',
          border: 'var(--sidebar-border)',
        },
        // Semantic colors (these stay consistent across themes)
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Plan colors
        plan: {
          starter: {
            bg: 'var(--plan-starter-bg)',
            text: 'var(--plan-starter-text)',
            border: 'var(--plan-starter-border)',
          },
          basic: {
            bg: 'var(--plan-basic-bg)',
            text: 'var(--plan-basic-text)',
            border: 'var(--plan-basic-border)',
          },
          premium: {
            bg: 'var(--plan-premium-bg)',
            text: 'var(--plan-premium-text)',
            border: 'var(--plan-premium-border)',
          },
          enterprise: {
            bg: 'var(--plan-enterprise-bg)',
            text: 'var(--plan-enterprise-text)',
            border: 'var(--plan-enterprise-border)',
          },
        },
        // Status colors
        status: {
          live: '#10B981',
          paused: '#F59E0B',
          'needs-finalization': '#EF4444',
          draft: '#6B7280',
        },
        // Accent color (for links, interactive highlights)
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#3B82F6',
        },
      },

      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },

      // Box shadows using CSS variables
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-default)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },

      // Font family
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      // Animation
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },

      // Z-index scale
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'popover': '60',
        'tooltip': '70',
        'toast': '80',
      },
    },
  },
  plugins: [],
};
