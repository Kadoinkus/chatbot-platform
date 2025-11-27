'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Label for the textarea */
  label?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Allow resize (default: false) */
  resizable?: boolean;
}

/**
 * Textarea component with consistent styling
 *
 * @example
 * // Basic textarea
 * <Textarea placeholder="Enter description..." />
 *
 * @example
 * // With label
 * <Textarea label="Description" rows={4} />
 *
 * @example
 * // Resizable
 * <Textarea resizable />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      errorMessage,
      label,
      helperText,
      resizable = false,
      className,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'input',
            !resizable && 'resize-none',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          style={{ minHeight: `${rows * 1.5 + 1.5}rem` }}
          aria-invalid={error}
          aria-describedby={errorMessage ? `${textareaId}-error` : undefined}
          {...props}
        />
        {errorMessage && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-error-600 dark:text-error-500">
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

Textarea.displayName = 'Textarea';

export default Textarea;
