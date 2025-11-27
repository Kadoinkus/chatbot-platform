'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Toggle/Switch component
 *
 * @example
 * // Basic toggle
 * <Toggle checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
 *
 * @example
 * // With label
 * <Toggle label="Enable notifications" checked={enabled} onChange={...} />
 *
 * @example
 * // With description
 * <Toggle
 *   label="Dark mode"
 *   description="Enable dark mode for the application"
 *   checked={isDark}
 *   onChange={...}
 * />
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, layout = 'horizontal', className, id, checked, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          'flex cursor-pointer',
          layout === 'horizontal' ? 'items-center justify-between' : 'flex-col gap-2',
          className
        )}
      >
        {(label || description) && (
          <div className={layout === 'horizontal' ? 'flex-1' : ''}>
            {label && <span className="font-medium text-foreground">{label}</span>}
            {description && (
              <p className="text-sm text-foreground-secondary">{description}</p>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              'toggle',
              checked && 'toggle-active'
            )}
          >
            <span className="toggle-thumb" />
          </div>
        </div>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
