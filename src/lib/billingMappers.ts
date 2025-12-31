/**
 * Billing Mappers
 *
 * Normalize Supabase invoice/billing data (snake_case) to domain types (camelCase).
 * Used by billingDataService.ts for consistent data transformation.
 */

import type { Invoice, InvoiceLine, InvoiceStatus, InvoiceType, InvoiceLineType } from '@/types';

// =============================================================================
// Invoice Mapper
// =============================================================================

/**
 * Map raw Supabase invoice row to Invoice type
 * Normalizes snake_case fields to camelCase
 */
export function mapInvoice(raw: Record<string, unknown>): Invoice {
  return {
    id: String(raw.id ?? ''),
    invoiceNr: String(raw.invoice_nr ?? ''),
    invoiceSlug: String(raw.invoice_slug ?? ''),
    clientSlug: String(raw.client_slug ?? ''),
    workspaceSlug: raw.workspace_slug ? String(raw.workspace_slug) : null,
    invoiceType: (raw.invoice_type as InvoiceType) ?? 'subscription',
    invoiceDate: String(raw.invoice_date ?? ''),
    dueDate: String(raw.due_date ?? ''),
    periodStart: raw.period_start ? String(raw.period_start) : null,
    periodEnd: raw.period_end ? String(raw.period_end) : null,
    status: (raw.status as InvoiceStatus) ?? 'paid',
    currency: String(raw.currency ?? 'EUR'),
    vatRate: raw.vat_rate != null ? Number(raw.vat_rate) : null,
    vatScheme: raw.vat_scheme ? String(raw.vat_scheme) : null,
    amountExVat: Number(raw.amount_ex_vat) || 0,
    amountVat: Number(raw.amount_vat) || 0,
    amountIncVat: Number(raw.amount_inc_vat) || 0,
    notes: raw.notes ? String(raw.notes) : null,
    invoiceUrl: raw.invoice_url ? String(raw.invoice_url) : null,
    supportingDocUrl: raw.supporting_doc_url ? String(raw.supporting_doc_url) : null,
    createdAt: String(raw.created_at ?? ''),
    updatedAt: String(raw.updated_at ?? ''),
  };
}

// =============================================================================
// Invoice Line Mapper
// =============================================================================

/**
 * Map raw Supabase invoice_line row to InvoiceLine type
 * Normalizes snake_case fields to camelCase
 */
export function mapInvoiceLine(raw: Record<string, unknown>): InvoiceLine {
  return {
    id: String(raw.id ?? ''),
    invoiceId: String(raw.invoice_id ?? ''),
    lineNr: Number(raw.line_nr) || 0,
    lineType: (raw.line_type as InvoiceLineType) ?? 'subscription',
    description: String(raw.description ?? ''),
    quantity: Number(raw.quantity) || 0,
    unitPriceExVat: Number(raw.unit_price_ex_vat) || 0,
    amountExVat: Number(raw.amount_ex_vat) || 0,
  };
}
