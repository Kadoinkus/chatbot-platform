'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className = '',
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg transition-colors
          bg-interactive-secondary hover:bg-interactive-secondary-hover
          text-foreground-secondary hover:text-foreground
          ${className}`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun size={iconSizes[size]} />
        ) : (
          <Moon size={iconSizes[size]} />
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Sun size={iconSizes[size]} className="text-foreground-tertiary" />
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isDark ? 'bg-interactive' : 'bg-border-secondary'}`}
          role="switch"
          aria-checked={isDark}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <Moon size={iconSizes[size]} className="text-foreground-tertiary" />
        {showLabel && (
          <span className="ml-2 text-sm text-foreground-secondary">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-interactive-secondary">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center justify-center p-2 rounded-md transition-colors
            ${theme === 'light'
              ? 'bg-surface-elevated text-foreground shadow-sm'
              : 'text-foreground-tertiary hover:text-foreground'}`}
          title="Light mode"
        >
          <Sun size={iconSizes[size]} />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-center p-2 rounded-md transition-colors
            ${theme === 'dark'
              ? 'bg-surface-elevated text-foreground shadow-sm'
              : 'text-foreground-tertiary hover:text-foreground'}`}
          title="Dark mode"
        >
          <Moon size={iconSizes[size]} />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center justify-center p-2 rounded-md transition-colors
            ${theme === 'system'
              ? 'bg-surface-elevated text-foreground shadow-sm'
              : 'text-foreground-tertiary hover:text-foreground'}`}
          title="System preference"
        >
          <Monitor size={iconSizes[size]} />
        </button>
      </div>
      {showLabel && (
        <span className="block mt-1 text-xs text-center text-foreground-tertiary capitalize">
          {theme}
        </span>
      )}
    </div>
  );
}
