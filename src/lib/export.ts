/**
 * Export Utilities
 *
 * Functions for exporting analytics data to CSV, JSON, and XLSX formats.
 */

import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  sheetName?: string;
}

/**
 * Convert data array to CSV string
 */
function arrayToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special cases
      if (value === null || value === undefined) return '';

      // Convert to string first
      let strValue: string;
      if (typeof value === 'string') {
        strValue = value;
      } else if (typeof value === 'object') {
        try {
          strValue = JSON.stringify(value) || '';
        } catch {
          strValue = '';
        }
      } else {
        strValue = String(value);
      }

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = strValue.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  const csv = arrayToCSV(data);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Export data to XLSX format
 */
export function exportToXLSX<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Data'
): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const maxWidth = 50;
  const colWidths: { wch: number }[] = [];

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach((header, i) => {
      let maxLen = header.length;
      data.forEach(row => {
        const val = row[header];
        const len = val ? String(val).length : 0;
        if (len > maxLen) maxLen = len;
      });
      colWidths[i] = { wch: Math.min(maxLen + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;
  }

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Export data to multiple sheets in XLSX format
 */
export function exportToXLSXMultiSheet(
  sheets: { name: string; data: Record<string, unknown>[] }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    if (sheet.data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);

      // Auto-size columns
      const maxWidth = 50;
      const colWidths: { wch: number }[] = [];
      const headers = Object.keys(sheet.data[0]);
      headers.forEach((header, i) => {
        let maxLen = header.length;
        sheet.data.forEach(row => {
          const val = row[header];
          const len = val ? String(val).length : 0;
          if (len > maxLen) maxLen = len;
        });
        colWidths[i] = { wch: Math.min(maxLen + 2, maxWidth) };
      });
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31)); // Sheet names max 31 chars
    }
  });

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Generic export function that handles all formats
 */
export function exportData<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
): void {
  switch (options.format) {
    case 'csv':
      exportToCSV(data, options.filename);
      break;
    case 'json':
      exportToJSON(data, options.filename);
      break;
    case 'xlsx':
      exportToXLSX(data, options.filename, options.sheetName);
      break;
  }
}

/**
 * Format date for export filename
 */
export function formatExportDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate export filename with date range
 */
export function generateExportFilename(
  baseName: string,
  mascotId: string,
  startDate: Date,
  endDate: Date
): string {
  const start = formatExportDate(startDate);
  const end = formatExportDate(endDate);
  return `${baseName}_${mascotId}_${start}_to_${end}`;
}
