/**
 * Billing Data Service
 *
 * Centralized data fetching for billing-related entities (invoices, invoice lines).
 * Follows the same patterns as dataService.ts for consistency.
 *
 * Single entry point for all billing data in the UI layer.
 */

import type { Invoice, InvoiceLine, InvoiceWithLines, Workspace } from '@/types';
import { mapInvoice, mapInvoiceLine } from './billingMappers';

// Re-export mappers for direct use if needed
export { mapInvoice, mapInvoiceLine } from './billingMappers';

// Re-export billing calculation functions from billingService
export {
  PLAN_CONFIG,
  getWorkspaceUsageStatus,
  calculateProjectedOverage,
  calculateWorkspaceMonthlyCost,
  canAddBot,
  getNextUsageReset,
  getCurrentUsagePeriod,
  canUseWidget,
} from './billingService';

// =============================================================================
// API Helpers (aligned with dataService patterns)
// =============================================================================

interface ApiResponse<T> {
  data?: T;
  code?: string;
  message?: string;
}

async function apiGet<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const json: ApiResponse<T> = await response.json();
  return json.data ?? null;
}

// =============================================================================
// Invoice Operations
// =============================================================================

/**
 * Get all invoices for a client
 */
export async function getInvoicesByClientId(clientId: string): Promise<Invoice[]> {
  const data = await apiGet<Record<string, unknown>[]>(
    `/api/invoices?clientId=${encodeURIComponent(clientId)}`
  );
  if (!data) return [];
  return data.map(mapInvoice);
}

/**
 * Get invoices for a specific workspace
 */
export async function getInvoicesByWorkspaceSlug(workspaceSlug: string): Promise<Invoice[]> {
  const data = await apiGet<Record<string, unknown>[]>(
    `/api/invoices?workspaceSlug=${encodeURIComponent(workspaceSlug)}`
  );
  if (!data) return [];
  return data.map(mapInvoice);
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
  const data = await apiGet<Record<string, unknown>>(
    `/api/invoices/${encodeURIComponent(invoiceId)}`
  );
  if (!data) return undefined;
  return mapInvoice(data);
}

/**
 * Get invoice lines for an invoice
 */
export async function getInvoiceLines(invoiceId: string): Promise<InvoiceLine[]> {
  const data = await apiGet<Record<string, unknown>[]>(
    `/api/invoices/${encodeURIComponent(invoiceId)}/lines`
  );
  if (!data) return [];
  return data.map(mapInvoiceLine);
}

/**
 * Get an invoice with its lines in a single call
 * Convenience function to reduce round-trips
 */
export async function getInvoiceWithLines(invoiceId: string): Promise<InvoiceWithLines | undefined> {
  const [invoice, lines] = await Promise.all([
    getInvoiceById(invoiceId),
    getInvoiceLines(invoiceId),
  ]);

  if (!invoice) return undefined;
  return { ...invoice, lines };
}

// =============================================================================
// Billing Summary & Aggregations
// =============================================================================

export interface BillingSummary {
  monthlyTotal: number;
  annualTotal: number;
  monthlyCount: number;
  annualCount: number;
  earliestBilling: string | null;
  earliestRenewal: string | null;
  projectedOverage: number;
  setupTotal: number;
  baseDueThisPeriod: number;
  overageDueThisPeriod: number;
  totalCredits: number;
  totalActiveWorkspaces: number;
}

/**
 * Compute billing summary across workspaces
 * Aggregates monthly/annual totals, setup fees, and due amounts
 */
export function computeBillingSummary(
  workspaces: Workspace[],
  getMascotTotal: (workspaceSlug: string, plan: string) => number = () => 0
): BillingSummary {
  let monthlyTotal = 0;
  let annualTotal = 0;
  let monthlyCount = 0;
  let annualCount = 0;
  let earliestBilling: string | null = null;
  let earliestRenewal: string | null = null;
  let setupTotal = 0;
  let baseDueThisPeriod = 0;
  let totalCredits = 0;
  let totalActiveWorkspaces = 0;
  const overageDueThisPeriod = 0; // Placeholder until overage calc is added

  workspaces.forEach(ws => {
    const total = (ws.monthlyFee || 0) + getMascotTotal(ws.slug, ws.plan);
    const wsRecord = ws as Record<string, unknown>;
    const isAnnual =
      wsRecord.billingCycle === 'annual' || wsRecord.billing_frequency === 'yearly';
    const setupFee = Number(wsRecord.setup_fee_ex_vat ?? wsRecord.setupFee ?? 0) || 0;

    setupTotal += setupFee;
    totalCredits += ws.walletCredits || 0;

    if (ws.status === 'active') {
      totalActiveWorkspaces += 1;
    }

    if (isAnnual) {
      annualTotal += total * 12;
      annualCount += 1;

      const renewalRaw =
        wsRecord.next_billing_date || wsRecord.contract_end || wsRecord.contractEnd || null;
      const renewal =
        typeof renewalRaw === 'string' || typeof renewalRaw === 'number'
          ? String(renewalRaw)
          : null;

      if (renewal) {
        if (!earliestRenewal || new Date(renewal) < new Date(earliestRenewal)) {
          earliestRenewal = renewal;
        }
      }
    } else {
      monthlyTotal += total;
      monthlyCount += 1;

      const billingRaw = wsRecord.next_billing_date || null;
      const billing =
        typeof billingRaw === 'string' || typeof billingRaw === 'number'
          ? String(billingRaw)
          : null;

      if (billing) {
        if (!earliestBilling || new Date(billing) < new Date(earliestBilling)) {
          earliestBilling = billing;
        }
      }

      baseDueThisPeriod += total;
    }
  });

  const projectedOverage = 0; // Placeholder until overage calc is added

  return {
    monthlyTotal,
    annualTotal,
    monthlyCount,
    annualCount,
    earliestBilling,
    earliestRenewal,
    projectedOverage,
    setupTotal,
    baseDueThisPeriod,
    overageDueThisPeriod,
    totalCredits,
    totalActiveWorkspaces,
  };
}

// =============================================================================
// Plan Display Helpers
// =============================================================================

export type PlanBadgeType = 'starter' | 'basic' | 'premium' | 'enterprise';

export function getPlanBadgeType(plan: string): PlanBadgeType {
  const planMap: Record<string, PlanBadgeType> = {
    starter: 'starter',
    basic: 'basic',
    premium: 'premium',
    enterprise: 'enterprise',
  };
  return planMap[plan] || 'starter';
}

export interface PlanDisplayConfig {
  name: string;
  color: string;
}

export function getPlanDisplayConfig(plan: string): PlanDisplayConfig {
  const configs: Record<string, PlanDisplayConfig> = {
    starter: { name: 'Starter', color: 'text-foreground-tertiary' },
    basic: { name: 'Basic', color: 'text-foreground-tertiary' },
    premium: { name: 'Premium', color: 'text-foreground-tertiary' },
    enterprise: { name: 'Enterprise', color: 'text-foreground-tertiary' },
    custom: { name: 'Custom', color: 'text-foreground-tertiary' },
  };
  return configs[plan] || configs.starter;
}

// =============================================================================
// Mascot Pricing (Hardcoded for now - TODO: move to database)
// =============================================================================

export interface MascotPricing {
  type: 'notso-standard' | 'notso-pro' | 'third-party';
  studioPrice: number;
  studioName: string;
}

const MASCOT_PRICING_DATA: Record<string, MascotPricing> = {
  m1: { type: 'notso-pro', studioPrice: 0, studioName: 'Notso AI' },
  m2: { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' },
  m3: { type: 'third-party', studioPrice: 45, studioName: 'Animation Studio X' },
  m4: { type: 'third-party', studioPrice: 25, studioName: 'Creative Mascots Co' },
  m5: { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' },
  m6: { type: 'notso-pro', studioPrice: 0, studioName: 'Notso AI' },
  m7: { type: 'third-party', studioPrice: 35, studioName: 'Digital Arts Studio' },
  m8: { type: 'third-party', studioPrice: 60, studioName: 'Premium Animations' },
};

export function getMascotPricing(botId: string): MascotPricing {
  return MASCOT_PRICING_DATA[botId] || { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' };
}

export function getMascotCost(botId: string, workspacePlan: string): number {
  const mascot = getMascotPricing(botId);
  if (mascot.type === 'notso-standard') return 0;
  if (mascot.type === 'notso-pro') {
    return workspacePlan === 'starter' ? 30 : 0;
  }
  return mascot.studioPrice;
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format a date value to localized string
 */
export function formatDate(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '-';
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

/**
 * Format a money value with currency symbol
 */
export function formatMoney(value: number, currency: string | null = 'EUR'): string {
  const code = (currency || 'EUR').toUpperCase();
  const prefix = code === 'EUR' ? '€' : code === 'USD' ? '$' : `${code} `;
  return `${prefix}${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
