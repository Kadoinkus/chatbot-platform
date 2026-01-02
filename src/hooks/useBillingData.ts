'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, InvoiceLine, Workspace, Assistant, Client, BillingPlan } from '@/types';
import { formatPlanForDisplay, type DisplayPlan } from '@/lib/planDisplayConfig';
import type { BillingMetrics, BillingSummary, PaymentMethod, CreditPackage } from '@/types/billing';
import { getInvoicesByClientId, getInvoiceLines, computeBillingSummary, getMascotCost } from '@/lib/billingDataService';
import { getClientById, getWorkspacesByClientId, getAssistantsByWorkspaceSlug } from '@/lib/dataService';

// =============================================================================
// Generic Data Hook State
// =============================================================================

interface DataState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// Client & Core Data Hook
// =============================================================================

interface UseBillingCoreData {
  client: Client | null;
  workspaces: Workspace[];
  workspaceAssistants: Record<string, Assistant[]>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseBillingOptions {
  enabled?: boolean;
}

/**
 * Hook for loading core billing data (client, workspaces, assistants)
 * Shared across multiple tabs
 */
export function useBillingCoreData(clientId: string, options: UseBillingOptions = {}): UseBillingCoreData {
  const enabled = options.enabled ?? true;
  const [client, setClient] = useState<Client | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<Record<string, Assistant[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [clientData, workspacesData] = await Promise.all([
        getClientById(clientId),
        getWorkspacesByClientId(clientId),
      ]);

      setClient(clientData || null);
      setWorkspaces(workspacesData || []);

      // Load assistants for each workspace in parallel to avoid sequential delays
      const assistantsEntries = await Promise.all(
        (workspacesData || []).map(async (workspace) => {
          const assistants = await getAssistantsByWorkspaceSlug(workspace.slug, clientId);
          return [workspace.slug, assistants || []] as const;
        })
      );
      setWorkspaceAssistants(Object.fromEntries(assistantsEntries));
    } catch (err) {
      console.error('Error loading billing core data:', err);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    client,
    workspaces,
    workspaceAssistants,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// =============================================================================
// Invoices Hook
// =============================================================================

interface UseInvoicesData {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  selectedInvoice: Invoice | null;
  selectedInvoiceLines: InvoiceLine[];
  linesLoading: boolean;
  selectInvoice: (invoice: Invoice) => Promise<void>;
  clearSelection: () => void;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading invoices data
 */
export function useInvoices(clientId: string, options: UseBillingOptions = {}): UseInvoicesData {
  const enabled = options.enabled ?? true;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceLines, setSelectedInvoiceLines] = useState<InvoiceLine[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getInvoicesByClientId(clientId);
      setInvoices(data);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectInvoice = useCallback(async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLinesLoading(true);

    try {
      const lines = await getInvoiceLines(invoice.id);
      setSelectedInvoiceLines(lines);
    } catch (err) {
      console.error('Error loading invoice lines:', err);
      setSelectedInvoiceLines([]);
    } finally {
      setLinesLoading(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedInvoice(null);
    setSelectedInvoiceLines([]);
  }, []);

  return {
    invoices,
    isLoading,
    error,
    selectedInvoice,
    selectedInvoiceLines,
    linesLoading,
    selectInvoice,
    clearSelection,
    refetch: fetchData,
  };
}

// =============================================================================
// Billing Metrics Hook
// =============================================================================

interface UseBillingMetricsData {
  metrics: BillingMetrics;
  usageWarnings: Workspace[];
  billingSummary: BillingSummary;
}

/**
 * Hook for computing billing metrics from workspaces
 */
export function useBillingMetrics(
  workspaces: Workspace[],
  workspaceAssistants: Record<string, Assistant[]>
): UseBillingMetricsData {
  // Memoize mascot total calculator
  const getMascotTotal = useCallback(
    (workspaceSlug: string, plan: string) => {
      const assistants = workspaceAssistants[workspaceSlug] || [];
      return assistants.reduce((total, assistant) => total + getMascotCost(assistant.id, plan), 0);
    },
    [workspaceAssistants]
  );

  // Compute metrics
  const metrics = useMemo<BillingMetrics>(() => {
    const totalMonthlyFee = workspaces.reduce((total, ws) => {
      const planCost = ws.monthlyFee || 0;
      const mascotCost = getMascotTotal(ws.slug, ws.plan);
      return total + planCost + mascotCost;
    }, 0);

    const totalCredits = workspaces.reduce((total, ws) => total + (ws.walletCredits || 0), 0);

    const activeWorkspaces = workspaces.filter((ws) => ws.status === 'active').length;

    const usageWarningsCount = workspaces.filter((ws) => {
      const bundlePct = ws.bundleLoads.limit ? ws.bundleLoads.used / ws.bundleLoads.limit : 0;
      const sessionsPct = ws.sessions?.limit ? ws.sessions.used / ws.sessions.limit : 0;
      return bundlePct > 0.8 || sessionsPct > 0.8;
    }).length;

    return {
      totalMonthlyFee,
      totalCredits,
      activeWorkspaces,
      totalWorkspaces: workspaces.length,
      usageWarningsCount,
    };
  }, [workspaces, getMascotTotal]);

  // Get workspaces with usage warnings
  const usageWarnings = useMemo(() => {
    return workspaces.filter((ws) => {
      const bundlePct = ws.bundleLoads.limit ? ws.bundleLoads.used / ws.bundleLoads.limit : 0;
      const sessionsPct = ws.sessions?.limit ? ws.sessions.used / ws.sessions.limit : 0;
      return bundlePct > 0.8 || sessionsPct > 0.8;
    });
  }, [workspaces]);

  // Compute billing summary
  const billingSummary = useMemo<BillingSummary>(() => {
    const summary = computeBillingSummary(workspaces, getMascotTotal);
    return {
      amountDue: summary.baseDueThisPeriod + summary.overageDueThisPeriod,
      monthlyCharge: summary.monthlyTotal,
      annualPrepaid: summary.annualTotal,
      setupFees: summary.setupTotal,
      workspaceBreakdown: workspaces.map((ws) => ({
        workspaceSlug: ws.slug,
        workspaceName: ws.name,
        plan: ws.plan,
        monthlyFee: ws.monthlyFee || 0,
        mascotCost: getMascotTotal(ws.slug, ws.plan),
        credits: ws.walletCredits || 0,
      })),
      nextBillingDate: summary.earliestBilling,
      renewalDate: summary.earliestRenewal,
    };
  }, [workspaces, getMascotTotal]);

  return {
    metrics,
    usageWarnings,
    billingSummary,
  };
}

// =============================================================================
// Payment Methods Hook (Placeholder)
// =============================================================================

interface UsePaymentMethodsData {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  addPaymentMethod: () => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  refetch: () => Promise<void>;
}

/**
 * Hook for payment methods (placeholder for Stripe integration)
 */
export function usePaymentMethods(): UsePaymentMethodsData {
  // Mock data for placeholder
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_mock_1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const addPaymentMethod = useCallback(() => {
    // Placeholder - will integrate with Stripe
    console.log('Add payment method - Stripe integration coming soon');
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    // Placeholder - will integrate with Stripe
    console.log('Remove payment method:', id);
  }, []);

  const setDefaultPaymentMethod = useCallback((id: string) => {
    // Placeholder - will integrate with Stripe
    console.log('Set default payment method:', id);
  }, []);

  const refetch = useCallback(async () => {
    // Placeholder - will fetch from Stripe
  }, []);

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    refetch,
  };
}

// =============================================================================
// Credits Hook
// =============================================================================

/**
 * Credit packages available for purchase
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'credits-20', name: '€20', credits: 20, price: 20 },
  { id: 'credits-50', name: '€50', credits: 50, price: 45, bonus: 5, popular: true },
  { id: 'credits-100', name: '€100', credits: 100, price: 85, bonus: 15 },
  { id: 'credits-250', name: '€250', credits: 250, price: 200, bonus: 50 },
];

interface UseCreditsData {
  totalCredits: number;
  creditsByWorkspace: Array<{ slug: string; name: string; credits: number }>;
  packages: CreditPackage[];
  purchaseCredits: (packageId: string, workspaceSlug?: string) => void;
}

/**
 * Hook for credits data
 */
export function useCredits(workspaces: Workspace[]): UseCreditsData {
  const totalCredits = useMemo(() => {
    return workspaces.reduce((total, ws) => total + (ws.walletCredits || 0), 0);
  }, [workspaces]);

  const creditsByWorkspace = useMemo(() => {
    return workspaces.map((ws) => ({
      slug: ws.slug,
      name: ws.name,
      credits: ws.walletCredits || 0,
    }));
  }, [workspaces]);

  const purchaseCredits = useCallback((packageId: string, workspaceSlug?: string) => {
    // Placeholder - will integrate with checkout
    console.log('Purchase credits:', packageId, 'for workspace:', workspaceSlug);
  }, []);

  return {
    totalCredits,
    creditsByWorkspace,
    packages: CREDIT_PACKAGES,
    purchaseCredits,
  };
}

// =============================================================================
// Usage Metrics Hook
// =============================================================================

interface UsageAggregate {
  used: number;
  limit: number;
  percentage: number;
}

interface UseUsageMetricsData {
  bundleUsage: UsageAggregate;
  sessionUsage: UsageAggregate;
  messageUsage: UsageAggregate;
  workspaceUsage: Array<{
    workspace: Workspace;
    bundlePercentage: number;
    sessionPercentage: number;
    hasWarning: boolean;
  }>;
}

/**
 * Hook for usage metrics
 */
export function useUsageMetrics(workspaces: Workspace[]): UseUsageMetricsData {
  const getTotalUsage = useCallback(
    (field: 'bundleLoads' | 'sessions' | 'messages'): UsageAggregate => {
      const totals = workspaces.reduce(
        (acc, ws) => {
          const counter = field === 'sessions' ? ws.sessions : ws[field];
          return {
            used: acc.used + (counter?.used || 0),
            limit: acc.limit + (counter?.limit || 0),
          };
        },
        { used: 0, limit: 0 }
      );

      return {
        ...totals,
        percentage: totals.limit ? (totals.used / totals.limit) * 100 : 0,
      };
    },
    [workspaces]
  );

  const bundleUsage = useMemo(() => getTotalUsage('bundleLoads'), [getTotalUsage]);
  const sessionUsage = useMemo(() => getTotalUsage('sessions'), [getTotalUsage]);
  const messageUsage = useMemo(() => getTotalUsage('messages'), [getTotalUsage]);

  const workspaceUsage = useMemo(() => {
    return workspaces.map((ws) => {
      const bundlePercentage = ws.bundleLoads.limit
        ? (ws.bundleLoads.used / ws.bundleLoads.limit) * 100
        : 0;
      const sessionPercentage = ws.sessions?.limit
        ? (ws.sessions.used / ws.sessions.limit) * 100
        : 0;

      return {
        workspace: ws,
        bundlePercentage,
        sessionPercentage,
        hasWarning: bundlePercentage > 80 || sessionPercentage > 80,
      };
    });
  }, [workspaces]);

  return {
    bundleUsage,
    sessionUsage,
    messageUsage,
    workspaceUsage,
  };
}

// =============================================================================
// Billing Plans Hook
// =============================================================================

interface UseBillingPlansData {
  billingPlans: BillingPlan[];
  displayPlans: DisplayPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading billing plans data for plan comparison
 */
export function useBillingPlans(options: UseBillingOptions = {}): UseBillingPlansData {
  const enabled = options.enabled ?? true;
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/plans', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch plans');
      const json = await response.json();
      setBillingPlans(json.data || []);
    } catch (err) {
      console.error('Error loading billing plans:', err);
      setError('Failed to load plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize display plans transformation
  const displayPlans = useMemo(() => {
    return billingPlans.map(formatPlanForDisplay);
  }, [billingPlans]);

  return {
    billingPlans,
    displayPlans,
    isLoading,
    error,
    refetch: fetchData,
  };
}
