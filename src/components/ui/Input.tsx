'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Icon to display inside input (left) */
  icon?: ReactNode;
  /** Icon to display inside input (right) */
  iconRight?: ReactNode;
  /** Full width (default: true) */
  fullWidth?: boolean;
}

/**
 * Input component with consistent styling
 *
 * @example
 * // Basic input
 * <Input placeholder="Enter your name" />
 *
 * @example
 * // With label and error
 * <Input label="Email" error errorMessage="Invalid email" />
 *
 * @example
 * // With icon
 * <Input icon={<Search size={20} />} placeholder="Search..." />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      errorMessage,
      label,
      helperText,
      icon,
      iconRight,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn(fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              icon && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-error-500 focus:ring-error-500',
              !fullWidth && 'w-auto',
              className
            )}
            aria-invalid={error}
            aria-describedby={errorMessage ? `${inputId}-error` : undefined}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary">
              {iconRight}
            </span>
          )}
        </div>
        {errorMessage && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600 dark:text-error-500">
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

Input.displayName = 'Input';

export default Input;
