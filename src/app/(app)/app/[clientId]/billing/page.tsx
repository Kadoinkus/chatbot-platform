'use client';

import { useState, useEffect, use, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useBillingCoreData,
  useInvoices,
  useBillingMetrics,
  usePaymentMethods,
  useCredits,
  useUsageMetrics,
} from '@/hooks/useBillingData';
import {
  Page,
  PageContent,
  PageHeader,
  Spinner,
  EmptyState,
  Card,
  Button,
} from '@/components/ui';
import { TabNavigation } from '@/components/analytics';
import {
  BILLING_TABS,
  DEFAULT_BILLING_TAB,
  TAB_PARAM_NAME,
  isValidBillingTabId,
} from '@/components/billing';
import type { BillingTabId } from '@/types/billing';
import { canAccessBilling } from '@/types/billing';

import {
  OverviewTab,
  WorkspacesTab,
  InvoicesTab,
  PaymentMethodsTab,
  CreditsTab,
  UsageTab,
  BillingErrorBoundary,
} from './components';

export default function BillingHubPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth & authorization
  const { session, isLoading: authLoading } = useAuth();
  const isAuthorizedForBilling = session ? canAccessBilling(session.role) : true;
  const billingDataEnabled = !authLoading && isAuthorizedForBilling;

  // Get active tab from URL
  const tabParam = searchParams.get(TAB_PARAM_NAME);
  const activeTab: BillingTabId = isValidBillingTabId(tabParam)
    ? tabParam
    : DEFAULT_BILLING_TAB;

  // Core billing data
  const {
    client,
    workspaces,
    workspaceAssistants,
    isLoading: coreLoading,
    error: coreError,
    refetch: refetchCore,
  } = useBillingCoreData(clientId, { enabled: billingDataEnabled });

  // Invoices data
  const {
    invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    selectedInvoice,
    selectedInvoiceLines,
    linesLoading,
    selectInvoice,
    clearSelection,
    refetch: refetchInvoices,
  } = useInvoices(clientId, { enabled: billingDataEnabled });

  // Billing metrics (derived from workspaces)
  const { metrics, usageWarnings, billingSummary } = useBillingMetrics(
    workspaces,
    workspaceAssistants
  );

  // Payment methods (placeholder)
  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();

  // Credits data
  const { totalCredits, packages, purchaseCredits } = useCredits(workspaces);

  // Usage metrics
  const { bundleUsage, sessionUsage, messageUsage, workspaceUsage } =
    useUsageMetrics(workspaces);

  // Workspace expansion state
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );

  const toggleWorkspaceExpansion = useCallback((workspaceId: string) => {
    setExpandedWorkspaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  }, []);

  // Tab navigation
  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(TAB_PARAM_NAME, tabId);
      router.push(`/app/${clientId}/billing?${params.toString()}`);
    },
    [router, clientId, searchParams]
  );

  const navigateToTab = useCallback(
    (tabId: BillingTabId) => {
      handleTabChange(tabId);
    },
    [handleTabChange]
  );

  // Mascot cost calculator
  const getMascotTotal = useCallback(
    (workspaceSlug: string, plan: string) => {
      const { getMascotCost } = require('@/lib/billingDataService');
      const assistants = workspaceAssistants[workspaceSlug] || [];
      return assistants.reduce(
        (total: number, assistant: { id: string }) =>
          total + getMascotCost(assistant.id, plan),
        0
      );
    },
    [workspaceAssistants]
  );

  // Build workspace name lookup for invoices
  const workspaceNames = useMemo(() => {
    return workspaces.reduce((acc, ws) => {
      acc[ws.slug] = ws.name;
      return acc;
    }, {} as Record<string, string>);
  }, [workspaces]);

  // Get total assistants count
  const getTotalAssistants = useCallback(() => {
    return Object.values(workspaceAssistants).reduce(
      (total, assistants) => total + assistants.length,
      0
    );
  }, [workspaceAssistants]);

  // Brand color for tabs
  const brandColor =
    client?.brandColors?.primary || client?.palette?.primary || '#3B82F6';

  // Loading state
  if (authLoading || coreLoading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  // Authorization check
  if (!authLoading && !isAuthorizedForBilling) {
    return (
      <Page>
        <PageContent>
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/30">
                <ShieldAlert
                  size={32}
                  className="text-warning-600 dark:text-warning-400"
                />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Access Restricted
            </h2>
            <p className="text-foreground-secondary mb-4">
              Billing information is only available to account owners and
              administrators. Please contact your administrator for access.
            </p>
            <Button onClick={() => router.push(`/app/${clientId}`)}>
              Back to Dashboard
            </Button>
          </Card>
        </PageContent>
      </Page>
    );
  }

  // Core data error handling
  if (coreError) {
    return (
      <Page>
        <PageContent>
          <Card className="max-w-lg mx-auto p-8">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CreditCard size={32} className="text-warning-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Unable to load billing data
                </h2>
                <p className="text-foreground-secondary">{coreError}</p>
              </div>
              <div className="flex justify-center">
                <Button icon={<RefreshCw size={16} />} onClick={refetchCore}>
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        </PageContent>
      </Page>
    );
  }

  // No client found
  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<CreditCard size={48} />}
            title="No billing data found"
            message="Unable to load billing information."
          />
        </PageContent>
      </Page>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    const commonProps = {
      clientId,
      clientSlug: client.slug,
    };

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            {...commonProps}
            metrics={metrics}
            usageWarnings={usageWarnings}
            workspaces={workspaces}
            billingSummary={billingSummary}
            getMascotTotal={getMascotTotal}
            onNavigateToTab={navigateToTab}
            isLoading={coreLoading}
          />
        );
      case 'workspaces':
        return (
          <WorkspacesTab
            {...commonProps}
            workspaces={workspaces}
            workspaceAssistants={workspaceAssistants}
            expandedWorkspaces={expandedWorkspaces}
            onToggleExpand={toggleWorkspaceExpansion}
            getMascotTotal={getMascotTotal}
            isLoading={coreLoading}
            error={coreError}
            onRetry={refetchCore}
          />
        );
      case 'invoices':
        return (
          <InvoicesTab
            {...commonProps}
            invoices={invoices}
            workspaceNames={workspaceNames}
            isLoading={invoicesLoading}
            error={invoicesError}
            selectedInvoice={selectedInvoice}
            selectedInvoiceLines={selectedInvoiceLines}
            linesLoading={linesLoading}
            onSelectInvoice={selectInvoice}
            onCloseModal={clearSelection}
            onRetry={refetchInvoices}
          />
        );
      case 'payment-methods':
        return (
          <PaymentMethodsTab
            {...commonProps}
            paymentMethods={paymentMethods}
            isLoading={paymentMethodsLoading}
          />
        );
      case 'credits':
        return (
          <CreditsTab
            {...commonProps}
            totalCredits={totalCredits}
            workspaces={workspaces}
            packages={packages}
            isLoading={coreLoading}
            error={coreError}
            onPurchaseCredits={purchaseCredits}
            onRetry={refetchCore}
          />
        );
      case 'usage':
        return (
          <UsageTab
            {...commonProps}
            bundleUsage={bundleUsage}
            sessionUsage={sessionUsage}
            messageUsage={messageUsage}
            workspaceUsage={workspaceUsage}
            isLoading={coreLoading}
            error={coreError}
            onRetry={refetchCore}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Billing"
          description={`${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''} with ${getTotalAssistants()} AI assistant${getTotalAssistants() !== 1 ? 's' : ''}`}
        />

        {/* Tab Navigation */}
        <TabNavigation
          tabs={BILLING_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          brandColor={brandColor}
        />

        {/* Tab Content with Error Boundary */}
        <BillingErrorBoundary>
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
          >
            {renderTabContent()}
          </div>
        </BillingErrorBoundary>
      </PageContent>
    </Page>
  );
}
