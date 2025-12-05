'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { StatusBadge } from './metrics';
import { formatValue } from './utils';

type ColumnFormat = 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'datetime' | 'relative' | 'badge' | 'duration';

interface Column {
  key: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  format?: ColumnFormat;
  truncate?: number;
}

// ============================================
// Ranked Table
// ============================================
export function RankedTable({
  data,
  columns,
  showRank = true,
  onRowClick,
  limit = 10,
  exportButton = false,
  exportFilename = 'export',
}: {
  data: Array<Record<string, unknown>>;
  columns: Column[];
  showRank?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  limit?: number;
  exportButton?: boolean;
  exportFilename?: string;
}) {
  const displayData = data.slice(0, limit);

  const handleExport = () => {
    const headers = columns.map((c) => c.label).join(',');
    const rows = displayData.map((row) =>
      columns.map((col) => `"${row[col.key] || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
  };

  const renderCell = (row: Record<string, unknown>, col: Column) => {
    const value = row[col.key];
    if (value === null || value === undefined) return '-';

    if (col.format === 'badge') {
      return <StatusBadge value={String(value)} />;
    }

    let formatted = formatValue(value, col.format || 'text', { truncate: col.truncate });

    if (col.truncate && String(value).length > col.truncate) {
      return (
        <span title={String(value)}>{formatted}</span>
      );
    }

    return formatted;
  };

  return (
    <div>
      {exportButton && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleExport}
            className="btn-ghost text-sm flex items-center gap-1"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {showRank && <th className="w-12">#</th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.align === 'right' ? 'text-right' : ''}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {showRank && (
                  <td className="text-foreground-tertiary font-medium">{index + 1}</td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'text-right' : ''}
                  >
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Feed Table (paginated, for session lists)
// ============================================
export function FeedTable({
  data,
  columns,
  onRowClick,
  pageSize = 10,
}: {
  data: Array<Record<string, unknown>>;
  columns: Column[];
  onRowClick?: (row: Record<string, unknown>) => void;
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / pageSize);
  const displayData = data.slice(page * pageSize, (page + 1) * pageSize);

  const renderCell = (row: Record<string, unknown>, col: Column) => {
    const value = row[col.key];
    if (value === null || value === undefined) return '-';

    if (col.format === 'badge') {
      return <StatusBadge value={String(value)} />;
    }

    let formatted = formatValue(value, col.format || 'text', { truncate: col.truncate });

    if (col.truncate && String(value).length > col.truncate) {
      return (
        <span title={String(value)}>{formatted}</span>
      );
    }

    return formatted;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.align === 'right' ? 'text-right' : ''}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'text-right' : ''}
                  >
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-sm text-foreground-secondary">
            Page {page + 1} of {totalPages}
          </span>
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Simple List (for unanswered questions, etc.)
// ============================================
export function SimpleList({
  items,
  renderItem,
  emptyMessage = 'No items',
}: {
  items: Array<unknown>;
  renderItem: (item: unknown, index: number) => React.ReactNode;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item, index) => (
        <li key={index} className="py-3">
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
