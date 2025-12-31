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
  return (
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
        {isLoading && (
          <TableRow hoverable={false}>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-center py-4 gap-2 text-foreground-tertiary text-sm">
                <Spinner size="sm" />
                <span>Loading lines...</span>
              </div>
            </TableCell>
          </TableRow>
        )}

        {!isLoading && lines.length === 0 && (
          <TableRow hoverable={false}>
            <TableCell colSpan={6}>
              <div className="py-4 text-center text-foreground-tertiary text-sm">
                No lines found.
              </div>
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          lines.map(line => (
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
  );
}

export default InvoiceLineTable;
