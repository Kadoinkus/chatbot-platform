'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import type { BotWithMetrics } from '@/lib/analytics/botComparison';
import { getClientBrandColor } from '@/lib/brandColors';

type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDefinition<T = BotWithMetrics> {
  key: string;
  header: string;
  render: (bot: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sortValue?: (bot: T) => number | string;
  width?: string;
}

interface BotComparisonTableProps {
  bots: BotWithMetrics[];
  columns: ColumnDefinition[];
  brandColor?: string;
  pageSize?: number;
  showPagination?: boolean;
  onBotClick?: (botId: string) => void;
  emptyMessage?: string;
  expandableContent?: (bot: BotWithMetrics) => ReactNode;
  title?: string;
  description?: string;
}

/**
 * Reusable bot comparison table with:
 * - Bot image + name in first column
 * - Configurable columns per tab
 * - Sorting by any column
 * - Pagination (default 10 per page)
 * - Brand color for highlights
 * - Optional expandable rows
 */
export function BotComparisonTable({
  bots,
  columns,
  brandColor,
  pageSize = 10,
  showPagination = true,
  onBotClick,
  emptyMessage = 'No bots selected',
  expandableContent,
  title,
  description,
}: BotComparisonTableProps) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [expandedBots, setExpandedBots] = useState<Set<string>>(new Set());

  // Handle sorting
  const handleSort = (key: string, sortValue?: (bot: BotWithMetrics) => number | string) => {
    if (!sortValue) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Sort and paginate bots
  const { sortedBots, displayBots, totalPages } = useMemo(() => {
    let sorted = [...bots];

    if (sortKey && sortDirection) {
      const column = columns.find(c => c.key === sortKey);
      if (column?.sortValue) {
        sorted.sort((a, b) => {
          const aVal = column.sortValue!(a);
          const bVal = column.sortValue!(b);

          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }

          const comparison = String(aVal).localeCompare(String(bVal));
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    const total = Math.ceil(sorted.length / pageSize);
    const display = showPagination
      ? sorted.slice(page * pageSize, (page + 1) * pageSize)
      : sorted;

    return { sortedBots: sorted, displayBots: display, totalPages: total };
  }, [bots, sortKey, sortDirection, page, pageSize, columns, showPagination]);

  const toggleExpand = (botId: string) => {
    setExpandedBots(prev => {
      const next = new Set(prev);
      if (next.has(botId)) {
        next.delete(botId);
      } else {
        next.add(botId);
      }
      return next;
    });
  };

  if (bots.length === 0) {
    return (
      <div className="card overflow-hidden">
        {(title || description) && (
          <div className="p-6 border-b border-border">
            {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-foreground-secondary mt-1">{description}</p>}
          </div>
        )}
        <div className="p-12 text-center text-foreground-tertiary">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {(title || description) && (
        <div className="p-6 border-b border-border">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-foreground-secondary mt-1">{description}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {expandableContent && <th className="w-10"></th>}
              <th>Bot</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.sortValue ? 'cursor-pointer hover:bg-background-hover' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key, col.sortValue)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortValue && (
                      <ArrowUpDown
                        size={14}
                        className={`${sortKey === col.key ? 'text-foreground' : 'text-foreground-tertiary'}`}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayBots.map((bot) => (
              <>
                <tr
                  key={bot.botId}
                  onClick={() => onBotClick?.(bot.botId)}
                  className={onBotClick ? 'cursor-pointer' : ''}
                >
                  {expandableContent && (
                    <td className="w-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(bot.botId);
                        }}
                        className="p-1 hover:bg-background-hover rounded"
                      >
                        {expandedBots.has(bot.botId) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                  )}
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: brandColor || getClientBrandColor(bot.clientId) }}
                      >
                        <img
                          src={bot.botImage}
                          alt={bot.botName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{bot.botName}</span>
                        <div className="text-xs text-foreground-tertiary">
                          <span className={`px-1.5 py-0.5 rounded-full ${
                            bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                            bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                            'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                          }`}>
                            {bot.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                    >
                      {col.render(bot)}
                    </td>
                  ))}
                </tr>
                {expandableContent && expandedBots.has(bot.botId) && (
                  <tr key={`${bot.botId}-expanded`} className="bg-background-secondary">
                    <td colSpan={columns.length + 2} className="p-4">
                      {expandableContent(bot)}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <span className="text-sm text-foreground-secondary">
            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, bots.length)} of {bots.length} bots
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-foreground-secondary">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Status badge for resolution/sentiment
 */
export function StatusBadge({
  value,
  variant = 'default'
}: {
  value: string | number;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}) {
  const variants = {
    success: 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500',
    warning: 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500',
    error: 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500',
    info: 'bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500',
    default: 'bg-background-tertiary text-foreground-secondary',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {value}
    </span>
  );
}

/**
 * Progress bar for percentages
 */
export function ProgressBar({
  value,
  color = 'info',
  showLabel = true,
}: {
  value: number;
  color?: 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
}) {
  const colors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-background-tertiary rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-foreground-secondary w-12 text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

/**
 * Trend indicator with arrow
 */
export function TrendIndicator({
  value,
  suffix = '%',
  inverse = false,
}: {
  value: number;
  suffix?: string;
  inverse?: boolean;
}) {
  const isPositive = inverse ? value < 0 : value > 0;
  const isNegative = inverse ? value > 0 : value < 0;

  return (
    <span className={`text-sm font-medium ${
      isPositive ? 'text-success-600 dark:text-success-500' :
      isNegative ? 'text-error-600 dark:text-error-500' :
      'text-foreground-tertiary'
    }`}>
      {value > 0 ? '+' : ''}{value}{suffix}
    </span>
  );
}

export default BotComparisonTable;
