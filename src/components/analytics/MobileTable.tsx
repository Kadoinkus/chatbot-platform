'use client';

import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string; // Optional width (e.g., '20%', '120px') for table layout control
}

interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileCard: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
}

/**
 * Responsive table component
 * - Desktop (lg+): Traditional table layout
 * - Mobile/Tablet: Stacked card layout
 */
export function MobileTable<T>({
  data,
  columns,
  mobileCard,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
  tableClassName = '',
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-foreground-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Traditional table */}
      <div className={`hidden lg:block overflow-x-auto ${className}`}>
        <table className={`w-full text-sm ${tableClassName}`}>
          {columns.some((c) => c.width) && (
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 font-medium text-foreground-secondary ${
                    col.align === 'right' ? 'text-right' :
                    col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-border last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-background-secondary' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 ${
                      col.align === 'right' ? 'text-right' :
                      col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet: Card stack */}
      <div className={`lg:hidden space-y-3 ${className}`}>
        {data.map((item, index) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'cursor-pointer' : ''}
          >
            {mobileCard(item, index)}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Pre-styled mobile card wrapper
 */
interface MobileCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({ children, onClick, className = '' }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 bg-background-secondary rounded-lg border border-border ${
        onClick ? 'cursor-pointer active:bg-background-tertiary' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Badge component for mobile cards
 */
interface MobileBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function MobileBadge({ children, variant = 'default', className = '' }: MobileBadgeProps) {
  const variants = {
    default: 'bg-background-tertiary text-foreground-secondary',
    success: 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500',
    warning: 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500',
    error: 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500',
    info: 'bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default MobileTable;
