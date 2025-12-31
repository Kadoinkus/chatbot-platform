'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CreditCard, Plus, Layers, ArrowLeft } from 'lucide-react';
import {
  getClientById,
  getWorkspacesByClientId,
  getAssistantsByWorkspaceSlug,
} from '@/lib/dataService';
import type { Client, Workspace, Assistant, Invoice, InvoiceLine } from '@/types';
import {
  getInvoicesByClientId,
  getInvoiceLines,
  computeBillingSummary,
  getMascotCost,
} from '@/lib/billingDataService';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Alert,
  Spinner,
  EmptyState,
} from '@/components/ui';
import {
  InvoiceTable,
  InvoiceDetailModal,
  BillingSummaryCard,
  WorkspaceBillingCard,
  BillingMetricsGrid,
  type BillingMetrics,
} from '@/components/billing';

export default function WorkspaceBillingPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<Record<string, Assistant[]>>({});
  const [loading, setLoading] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  // Invoice state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceLines, setSelectedInvoiceLines] = useState<InvoiceLine[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setInvoicesLoading(true);
        const [clientData, workspacesData, invoicesData] = await Promise.all([
          getClientById(clientId),
          getWorkspacesByClientId(clientId),
          getInvoicesByClientId(clientId),
        ]);

        setClient(clientData);
        setWorkspaces(workspacesData || []);
        setInvoices(invoicesData);

        // Load assistants for each workspace
        const assistantsData: Record<string, Assistant[]> = {};
        for (const workspace of workspacesData || []) {
          const assistants = await getAssistantsByWorkspaceSlug(workspace.slug, clientId);
          assistantsData[workspace.slug] = assistants || [];
        }
        setWorkspaceAssistants(assistantsData);
      } catch (error) {
        console.error('Error loading data:', error);
        setInvoiceError('Failed to load billing data');
      } finally {
        setLoading(false);
        setInvoicesLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  // Handle invoice selection
  const handleSelectInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLinesLoading(true);
    try {
      const lines = await getInvoiceLines(invoice.id);
      setSelectedInvoiceLines(lines);
    } catch (error) {
      console.error('Error loading invoice lines:', error);
      setSelectedInvoiceLines([]);
    } finally {
      setLinesLoading(false);
    }
  };

  const handleCloseInvoiceModal = () => {
    setSelectedInvoice(null);
    setSelectedInvoiceLines([]);
  };

  const toggleWorkspaceExpansion = (workspaceId: string) => {
    setExpandedWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  // Compute mascot total for a workspace
  const getWorkspaceMascotTotal = (workspaceSlug: string, plan: string) => {
    const assistants = workspaceAssistants[workspaceSlug] || [];
    return assistants.reduce((total, assistant) => total + getMascotCost(assistant.id, plan), 0);
  };

  // Loading state
  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
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

  // Calculate metrics
  const getTotalMonthlyFee = () => {
    return workspaces.reduce((total, ws) => {
      const planCost = ws.monthlyFee || 0;
      const mascotCost = getWorkspaceMascotTotal(ws.slug, ws.plan);
      return total + planCost + mascotCost;
    }, 0);
  };

  const getTotalCredits = () => {
    return workspaces.reduce((total, ws) => total + (ws.walletCredits || 0), 0);
  };

  const getTotalAssistants = () => {
    return Object.values(workspaceAssistants).reduce(
      (total, assistants) => total + assistants.length,
      0
    );
  };

  const getUsageWarnings = () => {
    return workspaces.filter(ws => {
      const bundlePct = ws.bundleLoads.limit ? ws.bundleLoads.used / ws.bundleLoads.limit : 0;
      const sessionsPct = ws.sessions?.limit ? ws.sessions.used / ws.sessions.limit : 0;
      return bundlePct > 0.8 || sessionsPct > 0.8;
    });
  };

  // Build workspace name lookup for invoices
  const workspaceNames = workspaces.reduce(
    (acc, ws) => {
      acc[ws.slug] = ws.name;
      return acc;
    },
    {} as Record<string, string>
  );

  // Compute billing summary
  const billingSummary = computeBillingSummary(workspaces, getWorkspaceMascotTotal);

  // Build metrics for the grid
  const usageWarnings = getUsageWarnings();
  const metrics: BillingMetrics = {
    totalMonthlyFee: getTotalMonthlyFee(),
    totalCredits: getTotalCredits(),
    activeWorkspaces: workspaces.filter(ws => ws.status === 'active').length,
    totalWorkspaces: workspaces.length,
    usageWarningsCount: usageWarnings.length,
  };

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Billing & Workspaces"
          description={`${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''} with ${getTotalAssistants()} bot${getTotalAssistants() !== 1 ? 's' : ''}`}
          backLink={
            <Link
              href={`/app/${clientId}/settings`}
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>
          }
          actions={
            <Button icon={<Plus size={18} />}>
              New Workspace
            </Button>
          }
        />

        {/* Key Metrics */}
        <BillingMetricsGrid metrics={metrics} />

        {/* Usage Warnings */}
        {usageWarnings.length > 0 && (
          <div className="mb-6">
            <Alert variant="warning" title="Usage Warnings">
              <ul className="text-sm space-y-1 mt-2">
                {usageWarnings.map(workspace => (
                  <li key={workspace.id}>
                    <strong>{workspace.name}</strong> is approaching limits
                    {workspace.bundleLoads.limit &&
                      workspace.bundleLoads.used / workspace.bundleLoads.limit > 0.8 &&
                      ` - Bundle loads: ${Math.round((workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100)}%`}
                    {workspace.sessions?.limit &&
                      workspace.sessions.used / workspace.sessions.limit > 0.8 &&
                      ` - Sessions: ${Math.round((workspace.sessions.used / workspace.sessions.limit) * 100)}%`}
                  </li>
                ))}
              </ul>
            </Alert>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Layers size={24} />
            Your Workspaces
          </h2>
          <Button
            variant="secondary"
            icon={<CreditCard size={16} />}
            onClick={() => setShowInvoices(!showInvoices)}
          >
            {showInvoices ? 'Hide' : 'View'} Invoices
          </Button>
        </div>

        {/* Invoices Section */}
        {showInvoices && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Invoices</h3>
                <p className="text-sm text-foreground-tertiary">Latest invoices for this client</p>
              </div>
            </div>

            {invoiceError && (
              <Alert variant="error" title="Unable to load invoices" className="mb-4">
                {invoiceError}
              </Alert>
            )}

            <InvoiceTable
              invoices={invoices}
              onSelectInvoice={handleSelectInvoice}
              workspaceNames={workspaceNames}
              isLoading={invoicesLoading}
            />
          </Card>
        )}

        {/* Workspace Cards */}
        <div className="space-y-4 mb-6">
          {workspaces.map(workspace => (
            <WorkspaceBillingCard
              key={workspace.id}
              workspace={workspace}
              assistants={workspaceAssistants[workspace.slug] || []}
              isExpanded={expandedWorkspaces.has(workspace.id)}
              onToggleExpand={() => toggleWorkspaceExpansion(workspace.id)}
              clientSlug={client.slug}
              mascotTotal={getWorkspaceMascotTotal(workspace.slug, workspace.plan)}
            />
          ))}
        </div>

        {/* Billing Summary */}
        <BillingSummaryCard
          workspaces={workspaces}
          summary={billingSummary}
          getMascotTotal={getWorkspaceMascotTotal}
        />

        {/* Invoice Detail Modal */}
        <InvoiceDetailModal
          invoice={selectedInvoice}
          lines={selectedInvoiceLines}
          linesLoading={linesLoading}
          workspaceName={
            selectedInvoice?.workspaceSlug ? workspaceNames[selectedInvoice.workspaceSlug] : undefined
          }
          onClose={handleCloseInvoiceModal}
        />
      </PageContent>
    </Page>
  );
}
