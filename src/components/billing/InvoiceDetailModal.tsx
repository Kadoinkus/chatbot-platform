'use client';

import { Modal, Badge, Button } from '@/components/ui';
import { InvoiceLineTable } from './InvoiceLineTable';
import type { Invoice, InvoiceLine } from '@/types';
import { formatDate, formatMoney } from '@/lib/billingDataService';

export interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  lines: InvoiceLine[];
  linesLoading?: boolean;
  workspaceName?: string;
  onClose: () => void;
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

export function InvoiceDetailModal({
  invoice,
  lines,
  linesLoading = false,
  workspaceName,
  onClose,
}: InvoiceDetailModalProps) {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={!!invoice}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNr}`}
      size="xl"
      className="max-h-[90vh]"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 text-sm">
        {/* Header with status and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-foreground-secondary">{invoice.invoiceType}</p>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {invoice.status || '-'}
              </Badge>
              <span className="text-xs text-foreground-tertiary">
                {invoice.currency || 'EUR'} • VAT {invoice.vatRate ?? '-'}%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                invoice.invoiceUrl && window.open(invoice.invoiceUrl, '_blank')
              }
              disabled={!invoice.invoiceUrl}
            >
              Download PDF
            </Button>
            {invoice.supportingDocUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(invoice.supportingDocUrl!, '_blank')}
              >
                Supporting Doc
              </Button>
            )}
          </div>
        </div>

        {/* Date info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 sm:p-3 bg-background-tertiary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Invoice Date</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {formatDate(invoice.invoiceDate)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-background-tertiary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Due Date</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="p-2 sm:p-3 bg-background-tertiary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Period</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {invoice.periodStart && invoice.periodEnd
                ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`
                : '-'}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-background-tertiary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Workspace</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {workspaceName || invoice.workspaceSlug || '-'}
            </p>
          </div>
        </div>

        {/* Amount breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="p-2 sm:p-3 bg-background-secondary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Amount ex VAT</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {formatMoney(invoice.amountExVat, invoice.currency)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-background-secondary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">VAT</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {formatMoney(invoice.amountVat, invoice.currency)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2 sm:p-3 bg-background-secondary rounded-lg">
            <p className="text-[10px] sm:text-xs text-foreground-secondary">Total (inc VAT)</p>
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              {formatMoney(invoice.amountIncVat, invoice.currency)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-3 bg-background-tertiary rounded-lg text-foreground">
            <p className="text-xs text-foreground-secondary mb-1">Notes</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Invoice Lines */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Invoice Lines</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <InvoiceLineTable
              lines={lines}
              currency={invoice.currency}
              isLoading={linesLoading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default InvoiceDetailModal;
