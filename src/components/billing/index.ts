/**
 * Billing Components
 *
 * Reusable UI components for billing & invoicing functionality.
 * Uses the shared UI component library for consistent styling.
 */

export { InvoiceTable, type InvoiceTableProps } from './InvoiceTable';
export { InvoiceLineTable, type InvoiceLineTableProps } from './InvoiceLineTable';
export { InvoiceDetailModal, type InvoiceDetailModalProps } from './InvoiceDetailModal';
export { BillingSummaryCard, type BillingSummaryCardProps } from './BillingSummaryCard';
export { WorkspaceBillingCard, type WorkspaceBillingCardProps } from './WorkspaceBillingCard';
export { BillingMetricsGrid, type BillingMetricsGridProps, type BillingMetrics } from './BillingMetricsGrid';

// Tab configuration
export {
  BILLING_TABS,
  DEFAULT_BILLING_TAB,
  TAB_PARAM_NAME,
  getBillingTabById,
  isValidBillingTabId,
  getTabFromSearchParams,
} from './billingTabsConfig';
