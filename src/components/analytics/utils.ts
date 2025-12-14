'use client';

// ============================================
// Formatting Utilities
// ============================================

export function formatNumber(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(ms: number): string {
  if (ms === null || ms === undefined || isNaN(ms)) return '-';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  if (seconds > 0) return `${seconds}s`;
  return `${ms}ms`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function formatValue(
  value: unknown,
  format: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'datetime' | 'relative' | 'duration' = 'text',
  options?: { decimals?: number; truncate?: number }
): string {
  if (value === null || value === undefined) return '-';

  switch (format) {
    case 'number':
      return formatNumber(Number(value), options?.decimals ?? 0);
    case 'currency':
      return formatCurrency(Number(value), options?.decimals ?? 2);
    case 'percentage':
      return formatPercentage(Number(value), options?.decimals ?? 1);
    case 'date':
      return formatDate(value as Date | string);
    case 'datetime':
      return formatDateTime(value as Date | string);
    case 'relative':
      return formatRelativeTime(value as Date | string);
    case 'duration':
      return formatDuration(Number(value));
    case 'text':
    default: {
      const str = String(value);
      return options?.truncate ? truncateText(str, options.truncate) : str;
    }
  }
}

// ============================================
// Calculation Utilities
// ============================================

export function calculateChange(current: number, previous: number): {
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'neutral';
} {
  if (previous === 0) {
    return {
      change: current,
      changePercent: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'neutral',
    };
  }

  const change = current - previous;
  const changePercent = (change / previous) * 100;

  return {
    change,
    changePercent,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  };
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + (val || 0), 0);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function groupBy<T>(data: T[], key: keyof T): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function countBy<T>(data: T[], key: keyof T): Record<string, number> {
  const grouped = groupBy(data, key);
  return Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, v.length])
  );
}
