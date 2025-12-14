// ============================================
// Safe Formatters (prevent runtime errors)
// ============================================

/**
 * Safe string formatter - handles null/undefined/non-string values
 */
export const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

/**
 * Safe number formatter - handles null/undefined/non-number values
 */
export const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Safe date formatter for axis ticks
 */
export const formatAxisDate = (value: unknown): string => {
  const str = safeString(value);
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return str;
  }
};

/**
 * Safe currency formatter for axis ticks (Euro)
 */
export const formatAxisCurrency = (value: unknown, decimals = 2): string => {
  return '\u20AC' + safeNumber(value).toFixed(decimals);
};

/**
 * Safe percent formatter for axis ticks
 */
export const formatAxisPercent = (value: unknown, decimals = 1): string => {
  return `${safeNumber(value).toFixed(decimals)}%`;
};

/**
 * Safe hour formatter (e.g., "14:00")
 */
export const formatAxisHour = (value: unknown): string => {
  return `${safeString(value)}:00`;
};
