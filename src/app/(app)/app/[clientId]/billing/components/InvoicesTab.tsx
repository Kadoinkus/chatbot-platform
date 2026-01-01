'use client';

import { FileText, Download, RefreshCw } from 'lucide-react';
import { Card, Button, Alert, Skeleton, EmptyState } from '@/components/ui';
import { InvoiceTable, InvoiceDetailModal } from '@/components/billing';
import type { Invoice, InvoiceLine } from '@/types';

interface InvoicesTabProps {
  clientId: string;
  clientSlug: string;
  invoices: Invoice[];
  workspaceNames: Record<string, string>;
  isLoading?: boolean;
  error?: string | null;
  selectedInvoice: Invoice | null;
  selectedInvoiceLines: InvoiceLine[];
  linesLoading: boolean;
  onSelectInvoice: (invoice: Invoice) => void;
  onCloseModal: () => void;
  onRetry?: () => void;
}

/**
 * Invoices tab - Billing history
 */
export function InvoicesTab({
  invoices,
  workspaceNames,
  isLoading = false,
  error = null,
  selectedInvoice,
  selectedInvoiceLines,
  linesLoading,
  onSelectInvoice,
  onCloseModal,
  onRetry,
}: InvoicesTabProps) {
  if (isLoading) {
    return <InvoicesTabSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load history">
        <p className="mt-1">{error}</p>
        {onRetry && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<RefreshCw size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="No billing history yet"
        message="Your invoices and transactions will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </p>
        <Button variant="secondary" size="sm" icon={<Download size={14} />}>
          Export All
        </Button>
      </div>

      {/* Invoice Table */}
      <Card padding="none" className="overflow-hidden">
        <InvoiceTable
          invoices={invoices}
          onSelectInvoice={onSelectInvoice}
          workspaceNames={workspaceNames}
          isLoading={false}
        />
      </Card>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        lines={selectedInvoiceLines}
        linesLoading={linesLoading}
        workspaceName={
          selectedInvoice?.workspaceSlug
            ? workspaceNames[selectedInvoice.workspaceSlug]
            : undefined
        }
        onClose={onCloseModal}
      />
    </div>
  );
}

/**
 * Skeleton loading state
 */
function InvoicesTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height="1rem" width="80px" />
        <Skeleton height="2rem" width="100px" rounded="lg" />
      </div>

      {/* Table skeleton */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height="1rem" width="80%" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-b-0">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} height="1rem" width={j === 0 ? '90%' : '70%'} />
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default InvoicesTab;
