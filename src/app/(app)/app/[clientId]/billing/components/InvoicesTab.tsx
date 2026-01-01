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
 * Invoices tab - Invoice history with detail modals
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
      <Alert variant="error" title="Failed to load invoices">
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
        title="No invoices yet"
        message="Your invoice history will appear here once billing begins."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <FileText size={24} />
          Invoice History ({invoices.length})
        </h2>
        <Button variant="secondary" icon={<Download size={16} />}>
          Export All
        </Button>
      </div>

      {/* Invoice Table */}
      <Card className="p-0 overflow-hidden">
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
 * Skeleton loading state for Invoices tab
 */
function InvoicesTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height="1.75rem" width="200px" />
        <Skeleton height="2.5rem" width="120px" rounded="lg" />
      </div>

      {/* Table skeleton */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="1rem" width="80%" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-b-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
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
