/**
 * Billing Hub Type Definitions
 *
 * Types for the billing hub tabbed interface.
 * Core domain types (Invoice, BillingPlan, etc.) are in ./index.ts
 */

import type { LucideIcon } from 'lucide-react';
import type { Workspace, Assistant, Invoice, InvoiceLine } from './index';

// =============================================================================
// Billing Tab Navigation
// =============================================================================

/**
 * Tab IDs for the billing hub - used for URL params and component lookup
 * 3 tabs: overview, plans, invoices
 */
export type BillingTabId = 'overview' | 'plans' | 'invoices';

/**
 * Tab configuration for billing hub navigation
 */
export interface BillingTab {
  id: BillingTabId;
  label: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * Common props passed to all billing tab components
 */
export interface BillingTabProps {
  clientId: string;
  clientSlug: string;
}

// =============================================================================
// Tab-Specific Props
// =============================================================================

/**
 * Overview tab props - Visual workspace billing breakdown
 */
export interface OverviewTabProps extends BillingTabProps {
  workspaces: Workspace[];
  workspaceAssistants: Record<string, Assistant[]>;
  getMascotTotal: (workspaceSlug: string, plan: string) => number;
  isLoading?: boolean;
}

/**
 * History tab props - All invoices (subscriptions + one-time)
 */
export interface HistoryTabProps extends BillingTabProps {
  invoices: Invoice[];
  workspaceNames: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  selectedInvoice: Invoice | null;
  selectedInvoiceLines: InvoiceLine[];
  linesLoading: boolean;
  onSelectInvoice: (invoice: Invoice) => void;
  onCloseModal: () => void;
  onRetry: () => void;
}

/**
 * Payment tab props - Payment methods + Credits combined
 */
export interface PaymentTabProps extends BillingTabProps {
  paymentMethods: PaymentMethod[];
  totalCredits: number;
  workspaces: Workspace[];
  packages: CreditPackage[];
  isLoading: boolean;
  onAddPaymentMethod?: () => void;
  onRemovePaymentMethod?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onPurchaseCredits?: (packageId: string) => void;
}

// =============================================================================
// Billing Metrics
// =============================================================================

/**
 * Key metrics for billing overview
 */
export interface BillingMetrics {
  totalMonthlyFee: number;
  totalCredits: number;
  activeWorkspaces: number;
  totalWorkspaces: number;
  usageWarningsCount: number;
}

/**
 * Billing summary aggregated across workspaces
 */
export interface BillingSummary {
  amountDue: number;
  monthlyCharge: number;
  annualPrepaid: number;
  setupFees: number;
  workspaceBreakdown: WorkspaceBillingSummary[];
  nextBillingDate: string | null;
  renewalDate: string | null;
}

export interface WorkspaceBillingSummary {
  workspaceSlug: string;
  workspaceName: string;
  plan: string;
  monthlyFee: number;
  mascotCost: number;
  credits: number;
}

// =============================================================================
// Payment Methods
// =============================================================================

export type PaymentMethodType = 'card' | 'bank' | 'sepa';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt?: string;
}

// =============================================================================
// Credit Packages
// =============================================================================

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

// =============================================================================
// Usage Thresholds
// =============================================================================

export type UsageLevel = 'normal' | 'warning' | 'critical' | 'exceeded';

export interface UsageThreshold {
  level: UsageLevel;
  minPercentage: number;
  maxPercentage: number;
  color: string;
  action?: string;
}

export const USAGE_THRESHOLDS: UsageThreshold[] = [
  { level: 'normal', minPercentage: 0, maxPercentage: 79, color: 'info' },
  { level: 'warning', minPercentage: 80, maxPercentage: 89, color: 'warning' },
  { level: 'critical', minPercentage: 90, maxPercentage: 99, color: 'orange' },
  { level: 'exceeded', minPercentage: 100, maxPercentage: Infinity, color: 'error' },
];

/**
 * Get usage level based on percentage
 */
export function getUsageLevel(percentage: number): UsageLevel {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'normal';
}

/**
 * Get color class for usage level
 */
export function getUsageColor(percentage: number): string {
  const level = getUsageLevel(percentage);
  switch (level) {
    case 'exceeded':
      return 'bg-error-500';
    case 'critical':
      return 'bg-orange-500';
    case 'warning':
      return 'bg-warning-500';
    default:
      return 'bg-info-500';
  }
}

// =============================================================================
// Authorization
// =============================================================================

/**
 * Roles that can access billing
 */
export const BILLING_ALLOWED_ROLES = ['owner', 'admin', 'superadmin'] as const;
export type BillingAllowedRole = (typeof BILLING_ALLOWED_ROLES)[number];

/**
 * Check if user role can access billing
 */
export function canAccessBilling(role: string): boolean {
  return BILLING_ALLOWED_ROLES.includes(role as BillingAllowedRole);
}
