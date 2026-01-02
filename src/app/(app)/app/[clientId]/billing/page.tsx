'use client';

import { use, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  ShieldAlert,
  RefreshCw,
  Euro,
  Wallet,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useBillingCoreData,
  useInvoices,
  useBillingMetrics,
  useCredits,
  useBillingPlans,
} from '@/hooks/useBillingData';
import {
  Page,
  PageContent,
  PageHeader,
  Spinner,
  EmptyState,
  Card,
  Button,
  Alert,
  Tabs,
  TabPanel,
} from '@/components/ui';
import {
  BILLING_TABS,
  DEFAULT_BILLING_TAB,
  TAB_PARAM_NAME,
  isValidBillingTabId,
} from '@/components/billing';
import type { BillingTabId } from '@/types/billing';
import { canAccessBilling } from '@/types/billing';
import { formatMoney } from '@/lib/billingDataService';

import {
  SubscriptionTab,
  PlansTab,
  InvoicesTab,
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

  // Credits data
  const { totalCredits, packages, purchaseCredits } = useCredits(workspaces);

  // Billing plans data (for plans comparison tab)
  const {
    billingPlans,
    displayPlans,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useBillingPlans({ enabled: billingDataEnabled });

  // Tab navigation
  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(TAB_PARAM_NAME, tabId);
      router.push(`/app/${clientId}/billing?${params.toString()}`);
    },
    [router, clientId, searchParams]
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

  // Tab items for UI (no icons - cleaner look)
  const tabItems = useMemo(
    () =>
      BILLING_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
      })),
    []
  );

  // Format next billing date
  const nextBillingDate = billingSummary.nextBillingDate
    ? new Date(billingSummary.nextBillingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

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
              administrators.
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

  // Common props for tab components
  const commonProps = {
    clientId,
    clientSlug: client.slug,
  };

  return (
    <Page>
      <PageContent>
        {/* 1. Header */}
        <PageHeader
          title="Billing"
          description={`${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''} with ${getTotalAssistants()} AI assistant${getTotalAssistants() !== 1 ? 's' : ''}`}
        />

        {/* 2. KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Monthly Fee */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Monthly Fee</span>
              <Euro size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatMoney(metrics.totalMonthlyFee, 'EUR')}
            </p>
            <p className="text-xs text-foreground-tertiary mt-1">
              Total across workspaces
            </p>
          </Card>

          {/* Available Credits */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Credits</span>
              <Wallet size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatMoney(totalCredits, 'EUR')}
            </p>
            <p className="text-xs text-foreground-tertiary mt-1">
              Total balance
            </p>
          </Card>

          {/* Active Workspaces */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Workspaces</span>
              <Layers size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.activeWorkspaces}
            </p>
            <p className="text-xs text-foreground-tertiary mt-1">
              of {metrics.totalWorkspaces} total
            </p>
          </Card>

          {/* Next Billing */}
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Next Billing</span>
              <Calendar size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{nextBillingDate}</p>
            <p className="text-xs text-foreground-tertiary mt-1">
              Upcoming charge
            </p>
          </Card>
        </div>

        {/* 3. Warning Banner (conditional) */}
        {usageWarnings.length > 0 && (
          <Alert variant="warning" title="Usage Warnings" className="mb-6">
            <ul className="text-sm space-y-1 mt-2">
              {usageWarnings.slice(0, 3).map((workspace) => {
                const bundlePct = workspace.bundleLoads.limit
                  ? Math.round(
                      (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100
                    )
                  : 0;
                const sessionsPct = workspace.sessions?.limit
                  ? Math.round(
                      (workspace.sessions.used / workspace.sessions.limit) * 100
                    )
                  : 0;

                return (
                  <li key={workspace.id} className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-warning-500 flex-shrink-0"
                    />
                    <span>
                      <strong>{workspace.name}</strong>
                      {bundlePct > 80 && ` - Bundle loads at ${bundlePct}%`}
                      {sessionsPct > 80 && ` - Sessions at ${sessionsPct}%`}
                    </span>
                  </li>
                );
              })}
            </ul>
            {usageWarnings.length > 3 && (
              <p className="text-sm text-foreground-secondary mt-2">
                +{usageWarnings.length - 3} more workspaces with warnings
              </p>
            )}
          </Alert>
        )}

        {/* 4. Tabbed Canvas - 3 Tabs */}
        <Card padding="none">
          <div className="px-4">
            <Tabs
              tabs={tabItems}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            >
              {/* Overview Tab */}
              <TabPanel tabId="overview" className="mt-0">
                <div className="p-3 pt-0">
                  <SubscriptionTab
                    workspaces={workspaces}
                    workspaceAssistants={workspaceAssistants}
                    packages={packages}
                    getMascotTotal={getMascotTotal}
                    onPurchaseCredits={purchaseCredits}
                    isLoading={coreLoading}
                  />
                </div>
              </TabPanel>

              {/* Plans Tab */}
              <TabPanel tabId="plans" className="mt-0">
                <div className="p-3 pt-0">
                  <BillingErrorBoundary>
                    <PlansTab
                      billingPlans={billingPlans}
                      displayPlans={displayPlans}
                      isLoading={plansLoading}
                      error={plansError}
                      onRetry={refetchPlans}
                    />
                  </BillingErrorBoundary>
                </div>
              </TabPanel>

              {/* Invoices Tab */}
              <TabPanel tabId="invoices" className="mt-0">
                <div className="p-3 pt-0">
                  <BillingErrorBoundary>
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
                  </BillingErrorBoundary>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </Card>
      </PageContent>
    </Page>
  );
}
