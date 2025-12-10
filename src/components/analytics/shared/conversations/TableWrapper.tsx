'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Table, TableHeader, TableBody, TableRow } from '@/components/ui';

interface TableWrapperProps {
  children: React.ReactNode;
  headers: React.ReactNode;
  brandColor: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Shared table wrapper with pagination for desktop view.
 */
export function TableWrapper({
  children,
  headers,
  brandColor,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: TableWrapperProps) {
  const safeItemsPerPage = Math.max(itemsPerPage || 1, 1);
  const startItem = (currentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(currentPage * safeItemsPerPage, totalItems);

  return (
    <Card padding="none" className="overflow-hidden hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>{headers}</TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>

      <div className="px-6 py-4 flex items-center justify-between bg-background-secondary border-t border-border">
        <p className="text-sm text-foreground-secondary">
          Showing {startItem}-{endItem} of {totalItems}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="text-foreground-secondary" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'text-foreground-secondary hover:bg-background-hover'
                  }`}
                  style={currentPage === page ? { backgroundColor: brandColor } : {}}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} className="text-foreground-secondary" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

interface MobileListWrapperProps {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Shared mobile list wrapper with pagination.
 */
export function MobileListWrapper({
  children,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: MobileListWrapperProps) {
  const safeItemsPerPage = Math.max(itemsPerPage || 1, 1);
  const startItem = (currentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(currentPage * safeItemsPerPage, totalItems);

  return (
    <div className="lg:hidden space-y-3">
      {children}

      {/* Mobile Pagination */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-foreground-secondary">
          {startItem}-{endItem} of {totalItems}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-foreground-secondary" />
            </button>
            <span className="text-sm font-medium text-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-foreground-secondary" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableWrapper;
