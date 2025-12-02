'use client';

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Options to display */
  options: SelectOption[];
  /** Placeholder option text */
  placeholder?: string;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Label for the select */
  label?: string;
  /** Helper text below select */
  helperText?: string;
  /** Full width (default: true, matching Input) */
  fullWidth?: boolean;
  /** Minimum width */
  minWidth?: string;
}

/**
 * Select component with consistent styling
 *
 * @example
 * // Basic select
 * <Select
 *   options={[
 *     { value: 'opt1', label: 'Option 1' },
 *     { value: 'opt2', label: 'Option 2' },
 *   ]}
 * />
 *
 * @example
 * // With placeholder
 * <Select placeholder="Select an option" options={options} />
 *
 * @example
 * // Auto width for filter bars
 * <Select fullWidth={false} options={options} />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      error,
      errorMessage,
      label,
      helperText,
      fullWidth = true,
      minWidth,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn(fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'select',
            fullWidth && 'w-full',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          style={minWidth ? { minWidth } : undefined}
          aria-invalid={error}
          aria-describedby={errorMessage ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-error-600 dark:text-error-500">
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p className="mt-1 text-sm text-foreground-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
