/**
 * Filters - Utility functions for filtering and sorting data
 *
 * These functions provide reusable filtering and sorting logic
 * that can be used across components.
 */

/**
 * Filter items by a search query across specified keys
 */
export function filterBySearch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  keys: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter(item =>
    keys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (typeof value === 'number') {
        return value.toString().includes(lowerQuery);
      }
      if (Array.isArray(value)) {
        return value.some(v =>
          typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    })
  );
}

/**
 * Sort items by a key
 */
export function sortBy<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Filter items by status
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  status: string | 'all'
): T[] {
  if (status === 'all') return items;
  return items.filter(item => item.status === status);
}

/**
 * Filter items by date range
 */
export function filterByDateRange<T extends Record<string, unknown>>(
  items: T[],
  from: Date,
  to: Date,
  dateKey: keyof T
): T[] {
  return items.filter(item => {
    const value = item[dateKey];
    if (!value) return false;

    const date = value instanceof Date ? value : new Date(String(value));
    return date >= from && date <= to;
  });
}

/**
 * Filter items by a specific value
 */
export function filterByValue<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T,
  value: unknown
): T[] {
  if (value === 'all' || value === null || value === undefined) return items;
  return items.filter(item => item[key] === value);
}

/**
 * Get unique values for a key
 */
export function getUniqueValues<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T
): unknown[] {
  const values = items.map(item => item[key]);
  return [...new Set(values)];
}

/**
 * Group items by a key
 */
export function groupBy<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const value = String(item[key] ?? 'undefined');
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Paginate items
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate date range presets
 */
export function getDateRangePreset(
  preset: 'today' | '7days' | '30days' | '90days' | 'year'
): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (preset) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      break;
    case '7days':
      from.setDate(from.getDate() - 7);
      break;
    case '30days':
      from.setDate(from.getDate() - 30);
      break;
    case '90days':
      from.setDate(from.getDate() - 90);
      break;
    case 'year':
      from.setFullYear(from.getFullYear() - 1);
      break;
  }

  return { from, to };
}

/**
 * Check if an item matches multiple filters
 */
export function matchesFilters<T extends Record<string, unknown>>(
  item: T,
  filters: Partial<Record<keyof T, unknown>>
): boolean {
  return Object.entries(filters).every(([key, value]) => {
    if (value === 'all' || value === null || value === undefined) return true;
    return item[key as keyof T] === value;
  });
}

/**
 * Filter items by multiple filters
 */
export function filterByMultiple<T extends Record<string, unknown>>(
  items: T[],
  filters: Partial<Record<keyof T, unknown>>
): T[] {
  return items.filter(item => matchesFilters(item, filters));
}
