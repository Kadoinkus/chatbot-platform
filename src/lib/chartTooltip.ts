'use client';

import type { CSSProperties } from 'react';

/**
 * Theme-aware tooltip styling for Recharts.
 * Uses CSS variables for light/dark support.
 */
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
  } as CSSProperties,
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  } as CSSProperties,
  itemStyle: {
    color: 'var(--text-secondary)',
  } as CSSProperties,
};
