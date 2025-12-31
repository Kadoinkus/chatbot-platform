'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Spinner,
} from '@/components/ui';
import type { InvoiceLine } from '@/types';
import { formatMoney } from '@/lib/billingDataService';

export interface InvoiceLineTableProps {
  lines: InvoiceLine[];
  currency: string;
  isLoading?: boolean;
}

export function InvoiceLineTable({
  lines,
  currency,
  isLoading = false,
}: InvoiceLineTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 gap-2 text-foreground-tertiary text-sm">
        <Spinner size="sm" />
        <span>Loading lines...</span>
      </div>
    );
  }

  // Empty state
  if (lines.length === 0) {
    return (
      <div className="py-4 text-center text-foreground-tertiary text-sm">
        No lines found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Table variant="compact">
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead className="text-center w-[5%]">#</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="text-right w-[8%]">Qty</TableHead>
              <TableHead className="text-right w-[15%]">Unit ex VAT</TableHead>
              <TableHead className="text-right w-[18%]">Amount ex VAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map(line => (
              <TableRow key={line.id}>
                <TableCell className="text-center text-foreground-secondary">
                  {line.lineNr}
                </TableCell>
                <TableCell className="break-words">{line.description}</TableCell>
                <TableCell className="text-foreground-secondary capitalize">
                  {line.lineType}
                </TableCell>
                <TableCell className="text-right">{line.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatMoney(line.unitPriceExVat, currency)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(line.amountExVat, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile List */}
      <div className="sm:hidden divide-y divide-border">
        {lines.map(line => (
          <div key={line.id} className="py-3 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{line.description}</p>
              <p className="text-xs text-foreground-secondary">
                {line.quantity} x {formatMoney(line.unitPriceExVat, currency)}
                {line.lineType && (
                  <span className="ml-2 capitalize">({line.lineType})</span>
                )}
              </p>
            </div>
            <span className="text-sm font-bold ml-3">
              {formatMoney(line.amountExVat, currency)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default InvoiceLineTable;
