/**
 * Billing Hub Tab Configuration
 *
 * 3 tabs: Overview, Plans, Invoices
 */

import { Layers, Receipt, FileText } from 'lucide-react';
import type { BillingTab, BillingTabId } from '@/types/billing';

/**
 * Billing hub tab definitions
 */
export const BILLING_TABS: BillingTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Layers,
    description: 'Your workspaces and subscriptions',
  },
  {
    id: 'plans',
    label: 'Plans',
    icon: Receipt,
    description: 'Compare and choose plans',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: FileText,
    description: 'Billing history',
  },
];

/**
 * Default tab when none specified in URL
 */
export const DEFAULT_BILLING_TAB: BillingTabId = 'overview';

/**
 * URL query parameter name for tab state
 */
export const TAB_PARAM_NAME = 'tab';

/**
 * Get tab by ID
 */
export function getBillingTabById(id: BillingTabId): BillingTab | undefined {
  return BILLING_TABS.find((tab) => tab.id === id);
}

/**
 * Validate if a string is a valid billing tab ID
 */
export function isValidBillingTabId(id: string | null): id is BillingTabId {
  if (!id) return false;
  return BILLING_TABS.some((tab) => tab.id === id);
}

/**
 * Get tab ID from URL search params, with fallback to default
 */
export function getTabFromSearchParams(
  searchParams: URLSearchParams | null
): BillingTabId {
  const tabParam = searchParams?.get(TAB_PARAM_NAME) ?? null;
  if (isValidBillingTabId(tabParam)) {
    return tabParam;
  }
  return DEFAULT_BILLING_TAB;
}
