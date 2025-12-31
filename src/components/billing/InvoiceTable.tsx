'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Spinner,
} from '@/components/ui';
import type { Invoice } from '@/types';
import { formatDate, formatMoney } from '@/lib/billingDataService';

export interface InvoiceTableProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  workspaceNames?: Record<string, string>;
  isLoading?: boolean;
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'overdue':
      return 'error';
    default:
      return 'warning';
  }
}

export function InvoiceTable({
  invoices,
  onSelectInvoice,
  workspaceNames = {},
  isLoading = false,
}: InvoiceTableProps) {
  const getWorkspaceName = (slug: string | null) => {
    if (!slug) return '-';
    return workspaceNames[slug] || slug;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-foreground-tertiary">
        <Spinner size="sm" />
        <span>Loading invoices...</span>
      </div>
    );
  }

  // Empty state
  if (invoices.length === 0) {
    return (
      <div className="py-6 text-center text-foreground-tertiary text-sm">
        No invoices found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Invoice #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(invoice => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer"
                onClick={() => onSelectInvoice(invoice)}
              >
                <TableCell className="font-medium text-foreground">
                  {invoice.invoiceNr}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {invoice.status || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell className="text-foreground-secondary">
                  {invoice.periodStart && invoice.periodEnd
                    ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatMoney(invoice.amountIncVat, invoice.currency)}
                </TableCell>
                <TableCell className="text-foreground-secondary">
                  {getWorkspaceName(invoice.workspaceSlug)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        if (invoice.invoiceUrl) window.open(invoice.invoiceUrl, '_blank');
                      }}
                      disabled={!invoice.invoiceUrl}
                    >
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectInvoice(invoice);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {invoices.map(invoice => (
          <div
            key={invoice.id}
            className="p-4 bg-surface-elevated rounded-lg border border-border cursor-pointer"
            onClick={() => onSelectInvoice(invoice)}
          >
            {/* Row 1: Invoice # + Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{invoice.invoiceNr}</span>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {invoice.status || '-'}
              </Badge>
            </div>

            {/* Row 2: Date + Total */}
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-foreground-secondary">
                {formatDate(invoice.invoiceDate)}
              </span>
              <span className="font-bold">
                {formatMoney(invoice.amountIncVat, invoice.currency)}
              </span>
            </div>

            {/* Row 3: Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  if (invoice.invoiceUrl) window.open(invoice.invoiceUrl, '_blank');
                }}
                disabled={!invoice.invoiceUrl}
              >
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onSelectInvoice(invoice);
                }}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default InvoiceTable;
