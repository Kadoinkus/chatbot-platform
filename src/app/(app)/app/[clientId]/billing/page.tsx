"use client";
import { useState, useEffect, use, useCallback } from "react";
import { getClientById, getWorkspacesByClientId, getAssistantsByWorkspaceSlug } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import {
  CreditCard, ChevronDown, ChevronUp,
  Plus, Wallet,
  Euro, Bot as BotIcon, BarChart3,
  Server, AlertTriangle,
  Shield, Zap, Crown, Layers, ArrowLeft, Package
} from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Badge,
  Alert,
  Spinner,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
} from '@/components/ui';

type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | string;

interface Invoice {
  id: string;
  invoice_nr: string;
  invoice_slug: string;
  client_slug: string;
  workspace_slug: string | null;
  invoice_type: string;
  invoice_date: string;
  due_date: string;
  period_start: string | null;
  period_end: string | null;
  status: InvoiceStatus;
  currency: string | null;
  vat_rate: number | null;
  vat_scheme: string | null;
  amount_ex_vat: number;
  amount_vat: number;
  amount_inc_vat: number;
  notes?: string | null;
  invoice_url?: string | null;
  supporting_doc_url?: string | null;
}

interface InvoiceLine {
  id: string;
  invoice_id: string;
  line_nr: number;
  line_type: string;
  description: string;
  quantity: number;
  unit_price_ex_vat: number;
  amount_ex_vat: number;
}

export default function WorkspaceBillingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<Record<string, Assistant[]>>({});
  const [loading, setLoading] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<Record<string, InvoiceLine[]>>({});
  const [loadingInvoiceLines, setLoadingInvoiceLines] = useState<string | null>(null);

  const getWorkspaceName = (slug: string | null) => {
    if (!slug) return '—';
    const match = workspaces.find(ws => ws.slug === slug);
    return match?.name || slug;
  };

  const normalizeInvoice = useCallback((raw: Record<string, unknown>): Invoice => {
    const workspaceSlug = typeof raw['workspace_slug'] === 'string' ? (raw['workspace_slug'] as string) : null;
    const vatRaw = raw['vat_rate'];
    const amountEx = raw['amount_ex_vat'];
    const amountVat = raw['amount_vat'];
    const amountInc = raw['amount_inc_vat'];

    return {
      id: String(raw['id'] ?? ''),
      invoice_nr: String(raw['invoice_nr'] ?? ''),
      invoice_slug: String(raw['invoice_slug'] ?? ''),
      client_slug: String(raw['client_slug'] ?? ''),
      workspace_slug: workspaceSlug,
      invoice_type: String(raw['invoice_type'] ?? ''),
      invoice_date: String(raw['invoice_date'] ?? ''),
      due_date: String(raw['due_date'] ?? ''),
      period_start: (raw['period_start'] as string | null) ?? null,
      period_end: (raw['period_end'] as string | null) ?? null,
      status: (raw['status'] as InvoiceStatus) ?? 'paid',
      currency: (raw['currency'] as string | null) ?? null,
      vat_rate: vatRaw !== null && vatRaw !== undefined ? Number(vatRaw) : null,
      vat_scheme: (raw['vat_scheme'] as string | null) ?? null,
      amount_ex_vat: typeof amountEx === 'number' || typeof amountEx === 'string' ? Number(amountEx) : 0,
      amount_vat: typeof amountVat === 'number' || typeof amountVat === 'string' ? Number(amountVat) : 0,
      amount_inc_vat: typeof amountInc === 'number' || typeof amountInc === 'string' ? Number(amountInc) : 0,
      notes: (raw['notes'] as string | null) ?? null,
      invoice_url: (raw['invoice_url'] as string | null) ?? null,
      supporting_doc_url: (raw['supporting_doc_url'] as string | null) ?? null,
    };
  }, []);

  const normalizeInvoiceLine = useCallback((raw: Record<string, unknown>): InvoiceLine => {
    const quantity = raw['quantity'];
    const unitPrice = raw['unit_price_ex_vat'];
    const amountEx = raw['amount_ex_vat'];
    const lineNr = raw['line_nr'];

    return {
      id: String(raw['id'] ?? ''),
      invoice_id: String(raw['invoice_id'] ?? ''),
      line_nr: typeof lineNr === 'number' || typeof lineNr === 'string' ? Number(lineNr) : 0,
      line_type: String(raw['line_type'] ?? ''),
      description: String(raw['description'] ?? ''),
      quantity: typeof quantity === 'number' || typeof quantity === 'string' ? Number(quantity) : 0,
      unit_price_ex_vat: typeof unitPrice === 'number' || typeof unitPrice === 'string' ? Number(unitPrice) : 0,
      amount_ex_vat: typeof amountEx === 'number' || typeof amountEx === 'string' ? Number(amountEx) : 0,
    };
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const formatMoney = (value: number, currency: string | null = 'EUR') => {
    const code = (currency || 'EUR').toUpperCase();
    const prefix = code === 'EUR' ? '€' : code === 'USD' ? '$' : `${code} `;
    return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const computeBillingSummary = () => {
    let monthlyTotal = 0;
    let annualTotal = 0;
    let monthlyCount = 0;
    let annualCount = 0;
    let earliestBilling: string | null = null;
    let earliestRenewal: string | null = null;
    let setupTotal = 0;
    let baseDueThisPeriod = 0;
    const overageDueThisPeriod = 0; // placeholder until overage calc is added here

    workspaces.forEach(ws => {
      const total = (ws.monthlyFee || 0) + getWorkspaceMascotTotal(ws.slug, ws.plan);
      const isAnnual = (ws as Record<string, unknown>).billingCycle === 'annual' ||
        (ws as Record<string, unknown>).billing_frequency === 'yearly';
      const setupFee =
        Number((ws as Record<string, unknown>).setup_fee_ex_vat ?? (ws as Record<string, unknown>).setupFee ?? 0) || 0;
      setupTotal += setupFee;
      if (isAnnual) {
        annualTotal += total * 12;
        annualCount += 1;
        const renewalRaw = (ws as Record<string, unknown>).next_billing_date ||
          (ws as Record<string, unknown>).contract_end ||
          (ws as Record<string, unknown>).contractEnd ||
          null;
        const renewal = typeof renewalRaw === 'string' || typeof renewalRaw === 'number' ? renewalRaw : null;
        if (renewal) {
          if (!earliestRenewal || new Date(renewal) < new Date(earliestRenewal)) {
            earliestRenewal = String(renewal);
          }
        }
        // Base prepaid; only overage would be due (placeholder 0 here)
      } else {
        monthlyTotal += total;
        monthlyCount += 1;
        const billingRaw = (ws as Record<string, unknown>).next_billing_date || null;
        const billing = typeof billingRaw === 'string' || typeof billingRaw === 'number' ? billingRaw : null;
        if (billing) {
          if (!earliestBilling || new Date(billing) < new Date(earliestBilling)) {
            earliestBilling = String(billing);
          }
        }
        baseDueThisPeriod += total;
      }
    });

    const projectedOverage = 0; // placeholder until overage calc is added here

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
    };
  };

  const fetchInvoices = useCallback(async (client: string) => {
    setInvoicesLoading(true);
    setInvoiceError(null);
    try {
      const res = await fetch(`/api/invoices?clientId=${encodeURIComponent(client)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const json = await res.json();
      setInvoices((json.data || []).map(normalizeInvoice));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoiceError('Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  }, [normalizeInvoice]);

  const fetchInvoiceLines = async (invoiceKey: string, fallbackKeys: string[] = []) => {
    setLoadingInvoiceLines(invoiceKey);
    const keysToTry = [invoiceKey, ...fallbackKeys].filter(Boolean);

    let fetched = false;
    for (const key of keysToTry) {
      try {
        const res = await fetch(`/api/invoices/${encodeURIComponent(key)}/lines`, { cache: 'no-store' });
        if (!res.ok) {
          const errText = await res.text();
          console.error(`Invoice lines fetch failed for key ${key}: ${res.status} ${errText}`);
          continue;
        }
        const json = await res.json();
        setInvoiceLines(prev => ({
          ...prev,
          [invoiceKey]: (json.data || []).map(normalizeInvoiceLine),
        }));
        fetched = true;
        break;
      } catch (error) {
        console.error('Error fetching invoice lines:', error);
      }
    }

    if (!fetched) {
      console.error('Failed to fetch invoice lines after trying all identifiers');
    }
    setLoadingInvoiceLines(null);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData] = await Promise.all([
          getClientById(clientId),
          getWorkspacesByClientId(clientId)
        ]);

        setClient(clientData);
        setWorkspaces(workspacesData || []);

        // Load assistants for each workspace
        const assistantsData: Record<string, Assistant[]> = {};
        for (const workspace of workspacesData || []) {
          const assistants = await getAssistantsByWorkspaceSlug(workspace.slug, clientId);
          assistantsData[workspace.slug] = assistants || [];
        }
        setWorkspaceAssistants(assistantsData);
        await fetchInvoices(clientId);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, fetchInvoices]);

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

  const openInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const lookupKey = invoice.id;
    if (!invoiceLines[lookupKey]) {
      const fallbacks = [invoice.invoice_slug || '', invoice.invoice_nr || ''].filter(Boolean);
      await fetchInvoiceLines(lookupKey, fallbacks);
    }
  };

  const statusBadgeProps = (status: InvoiceStatus) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'paid') return { variant: 'success' as const };
    if (normalized === 'overdue') return { variant: 'error' as const };
    return { variant: 'warning' as const };
  };

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

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

  // Calculate totals across all workspaces
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
    return Object.values(workspaceAssistants).reduce((total, assistants) => total + assistants.length, 0);
  };

  const getUsageWarnings = () => {
    return workspaces.filter(ws => {
      const bundlePct = ws.bundleLoads.limit ? ws.bundleLoads.used / ws.bundleLoads.limit : 0;
      const sessionsPct = ws.sessions?.limit ? (ws.sessions.used / ws.sessions.limit) : 0;
      return bundlePct > 0.8 || sessionsPct > 0.8;
    });
  };

  const getPlanBadgeType = (plan: string): 'starter' | 'basic' | 'premium' | 'enterprise' => {
    const planMap: Record<string, 'starter' | 'basic' | 'premium' | 'enterprise'> = {
      starter: 'starter',
      basic: 'basic',
      premium: 'premium',
      enterprise: 'enterprise'
    };
    return planMap[plan] || 'starter';
  };

  const getPlanConfig = (plan: string) => {
    const configs = {
      starter: { name: 'Starter', icon: Package, color: 'text-foreground-tertiary' },
      basic: { name: 'Basic', icon: Zap, color: 'text-foreground-tertiary' },
      premium: { name: 'Premium', icon: Crown, color: 'text-foreground-tertiary' },
      enterprise: { name: 'Enterprise', icon: Shield, color: 'text-foreground-tertiary' },
      custom: { name: 'Custom', icon: Shield, color: 'text-foreground-tertiary' },
    };
    return configs[plan as keyof typeof configs] || configs.starter;
  };

  // Mock mascot pricing data (in real app, this would come from bot data)
  const getMascotPricing = (botId: string) => {
    const mascotPricing = {
      'm1': { type: 'notso-pro', studioPrice: 0, studioName: 'Notso AI' },
      'm2': { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' },
      'm3': { type: 'third-party', studioPrice: 45, studioName: 'Animation Studio X' },
      'm4': { type: 'third-party', studioPrice: 25, studioName: 'Creative Mascots Co' },
      'm5': { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' },
      'm6': { type: 'notso-pro', studioPrice: 0, studioName: 'Notso AI' },
      'm7': { type: 'third-party', studioPrice: 35, studioName: 'Digital Arts Studio' },
      'm8': { type: 'third-party', studioPrice: 60, studioName: 'Premium Animations' }
    };
    return mascotPricing[botId as keyof typeof mascotPricing] || { type: 'notso-standard', studioPrice: 0, studioName: 'Notso AI' };
  };

  const getMascotCost = (botId: string, workspacePlan: string) => {
    const mascot = getMascotPricing(botId);

    if (mascot.type === 'notso-standard') return 0;

    if (mascot.type === 'notso-pro') {
      return workspacePlan === 'starter' ? 30 : 0; // Included for Basic+
    }

    return mascot.studioPrice; // Third-party price
  };

  const getWorkspaceMascotTotal = (workspaceSlug: string, plan: string) => {
    const assistants = workspaceAssistants[workspaceSlug] || [];
    return assistants.reduce((total, assistant) => total + getMascotCost(assistant.id, plan), 0);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Monthly Total</span>
                  <Euro size={16} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  €{getTotalMonthlyFee().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">
                  Across {workspaces.length} workspaces
                </p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Total Credits</span>
                  <Wallet size={16} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">€{getTotalCredits().toFixed(2)}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Available for overages</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Active Workspaces</span>
                  <Layers size={16} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {workspaces.filter(ws => ws.status === 'active').length}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">of {workspaces.length} total</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Usage Warnings</span>
                  <AlertTriangle size={16} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{getUsageWarnings().length}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Near limits</p>
              </Card>
            </div>

            {/* Usage Warnings */}
            {getUsageWarnings().length > 0 && (
              <div className="mb-6">
                <Alert variant="warning" title="Usage Warnings">
                  <ul className="text-sm space-y-1 mt-2">
                    {getUsageWarnings().map(workspace => (
                      <li key={workspace.id}>
                        <strong>{workspace.name}</strong> is approaching limits
                        {(workspace.bundleLoads.limit && (workspace.bundleLoads.used / workspace.bundleLoads.limit) > 0.8) &&
                          ` - Bundle loads: ${Math.round((workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100)}%`}
                        {(workspace.sessions?.limit && (workspace.sessions.used / workspace.sessions.limit) > 0.8) &&
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

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Workspace</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesLoading && (
                        <TableRow>
                          <TableCell colSpan={9}>
                            <div className="flex items-center justify-center py-6 gap-2 text-foreground-tertiary">
                              <Spinner size="sm" />
                              <span>Loading invoices…</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {!invoicesLoading && invoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9}>
                            <div className="py-6 text-center text-foreground-tertiary text-sm">
                              No invoices found.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {!invoicesLoading && invoices.map(invoice => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-background-hover" onClick={() => openInvoice(invoice)}>
                          <TableCell className="font-medium text-foreground">{invoice.invoice_nr}</TableCell>
                          <TableCell>
                            <Badge {...statusBadgeProps(invoice.status)}>{invoice.status || '—'}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                          <TableCell className="text-foreground-secondary">
                            {invoice.period_start && invoice.period_end
                              ? `${formatDate(invoice.period_start)} – ${formatDate(invoice.period_end)}`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {formatMoney(invoice.amount_inc_vat, invoice.currency)}
                          </TableCell>
                          <TableCell className="text-foreground-secondary">{getWorkspaceName(invoice.workspace_slug)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (invoice.invoice_url) window.open(invoice.invoice_url, '_blank');
                                }}
                                disabled={!invoice.invoice_url}
                              >
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInvoice(invoice);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Unified Workspace Dashboard */}
            <div className="space-y-4 mb-6">
              {workspaces.map(workspace => {
                const isExpanded = expandedWorkspaces.has(workspace.id);
                const assistants = workspaceAssistants[workspace.slug] || [];
                const bundleUsagePercent = workspace.bundleLoads.limit ? (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100 : 0;
                const sessionsUsagePercent = workspace.sessions?.limit ? (workspace.sessions.used / workspace.sessions.limit) * 100 : 0;
                const planConfig = getPlanConfig(workspace.plan);
                const mascotTotal = getWorkspaceMascotTotal(workspace.slug, workspace.plan);
                const totalCost = (workspace.monthlyFee || 0) + mascotTotal;

                return (
                  <Card key={workspace.id} padding="none">
                    <div
                      className="p-6 cursor-pointer hover:bg-background-hover transition-colors"
                      onClick={() => toggleWorkspaceExpansion(workspace.id)}
                    >
                    {/* Compact Summary View */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{workspace.name}</h3>
                            <Badge plan={getPlanBadgeType(workspace.plan)}>
                              {planConfig.name}
                              </Badge>
                              {workspace.status !== 'active' && (
                                <Badge variant="error">
                                  {workspace.status.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground-secondary">
                              {assistants.length} AI assistant{assistants.length !== 1 ? 's' : ''} • {workspace.billingCycle} billing • {workspace.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-foreground-tertiary">Monthly Cost</p>
                            <div>
                              <p className="text-lg font-semibold text-foreground">
                                {totalCost === 0 ? 'Included' : `€${totalCost.toLocaleString()}`}
                              </p>
                              {mascotTotal > 0 && (
                                <p className="text-xs text-foreground-tertiary">
                                  Plan: €{workspace.monthlyFee.toLocaleString()} + Mascots: €{mascotTotal}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground-tertiary">Credits</p>
                            <p className="text-lg font-semibold text-foreground">€{workspace.walletCredits.toFixed(2)}</p>
                          </div>
                          {isExpanded ? <ChevronUp size={20} className="text-foreground-tertiary" /> : <ChevronDown size={20} className="text-foreground-tertiary" />}
                        </div>
                      </div>

                      {/* AI Assistant Summary */}
                      {assistants.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                              <BotIcon size={14} />
                              {assistants.filter(a => a.status === 'Active').length} active of {assistants.length} AI assistants
                            </p>
                            <span className="text-xs text-foreground-tertiary">Click to expand</span>
                          </div>
                          <div className="flex items-center gap-2 overflow-hidden">
                          {assistants.slice(0, 4).map(assistant => {
                            const brandBg = getClientBrandColor(assistant.clientId);
                            return (
                              <div
                                key={assistant.id}
                                className="relative flex-shrink-0 w-8 h-8 rounded-full border-2 border-surface-elevated shadow-sm overflow-hidden flex items-center justify-center"
                                style={{ backgroundColor: brandBg }}
                              >
                                {assistant.image?.trim() ? (
                                  <img
                                    src={assistant.image.trim()}
                                    alt={assistant.name}
                                    className="w-full h-full object-cover"
                                    title={`${assistant.name} - ${assistant.status}`}
                                  />
                                ) : (
                                  <span
                                    className="text-xs font-semibold text-white"
                                    title={`${assistant.name} - ${assistant.status}`}
                                  >
                                    {assistant.name.charAt(0)}
                                  </span>
                                )}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-elevated ${
                                  assistant.status === 'Active' ? 'bg-success-500' :
                                  assistant.status === 'Paused' ? 'bg-warning-500' : 'bg-error-500'
                                }`} />
                              </div>
                            );
                          })}
                            {assistants.length > 4 && (
                              <div className="w-8 h-8 bg-background-tertiary rounded-full flex items-center justify-center text-xs text-foreground-secondary font-medium">
                                +{assistants.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <BotIcon size={16} className="text-foreground-tertiary mx-auto mb-1" />
                          <p className="text-sm text-foreground-tertiary">No AI assistants in this workspace</p>
                          <button className="text-xs text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 mt-1">+ Add first AI Assistant</button>
                        </div>
                      )}
                    </div>

                    {/* Detailed Expanded View */}
                    {isExpanded && (
                      <div className="border-t border-border p-6 bg-background-secondary">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Detailed Resource Usage */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground-secondary mb-4 flex items-center gap-2">
                              <BarChart3 size={16} />
                              Resource Usage Details
                            </h4>
                            <div className="space-y-4">
                              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Server size={14} className="text-info-600 dark:text-info-500" />
                                    Bundle Loads (3D Rendering)
                                  </span>
                                  <span className="text-sm text-foreground-secondary">
                                    {workspace.bundleLoads.used.toLocaleString()} / {workspace.bundleLoads.limit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full transition-all ${
                                      bundleUsagePercent > 90 ? 'bg-error-500' :
                                      bundleUsagePercent > 70 ? 'bg-warning-500' : 'bg-info-500'
                                    }`}
                                    style={{ width: `${Math.min(100, bundleUsagePercent)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-foreground-tertiary">
                                  €{workspace.overageRates.bundleLoads}/load overage · {workspace.bundleLoads.remaining.toLocaleString()} remaining
                                </p>
                              </div>

                              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Server size={14} className="text-plan-premium-text" />
                                    Sessions (Conversations)
                                  </span>
                                  <span className="text-sm text-foreground-secondary">
                                    {workspace.sessions?.used.toLocaleString()} / {workspace.sessions?.limit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full transition-all ${
                                      sessionsUsagePercent > 90 ? 'bg-error-500' :
                                      sessionsUsagePercent > 70 ? 'bg-warning-500' : 'bg-plan-premium-text'
                                    }`}
                                    style={{ width: `${Math.min(100, sessionsUsagePercent)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-foreground-tertiary">
                                  €{workspace.overageRates.sessions}/session overage · {workspace.sessions?.remaining.toLocaleString()} remaining
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Workspace AI Assistants & Actions */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground-secondary mb-4 flex items-center gap-2">
                              <BotIcon size={16} />
                              Workspace AI Assistants ({assistants.length})
                            </h4>
                            {assistants.length > 0 ? (
                              <div className="space-y-2 mb-6">
                                {assistants.map(assistant => {
                                  const mascotInfo = getMascotPricing(assistant.id);
                                  const mascotCost = getMascotCost(assistant.id, workspace.plan);
                                  const isIncluded = mascotInfo.type === 'notso-pro' && workspace.plan !== 'starter';

                                  return (
                                    <div key={assistant.id} className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-border">
                                      {assistant.image?.trim() ? (
                                        <img
                                          src={assistant.image.trim()}
                                          alt={assistant.name}
                                          className="w-10 h-10 rounded-full"
                                          style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                                        />
                                      ) : (
                                        <div
                                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                          style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                                        >
                                          {assistant.name.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-medium text-foreground">{assistant.name}</p>
                                          <span className={`w-2 h-2 rounded-full ${
                                            assistant.status === 'Active' ? 'bg-success-500' :
                                            assistant.status === 'Paused' ? 'bg-warning-500' : 'bg-error-500'
                                          }`} />
                                        </div>
                                        <p className="text-xs text-foreground-tertiary mb-1">{assistant.description}</p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-foreground-secondary">{mascotInfo.studioName}</span>
                                          {mascotInfo.type === 'notso-pro' && (
                                            <Badge variant="info" className="text-xs">Pro</Badge>
                                          )}
                                          {mascotInfo.type === 'third-party' && (
                                    <Badge variant="warning" className="text-xs">3rd Party</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {mascotCost === 0 ? (
                                  <span className="text-sm font-medium text-success-600 dark:text-success-500">
                                    {isIncluded ? 'Included' : 'Included'}
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium text-foreground">€{mascotCost}/mo</span>
                                )}
                              </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="bg-surface-elevated rounded-lg border border-border p-6 text-center mb-6">
                                <BotIcon size={32} className="text-foreground-tertiary mx-auto mb-2" />
                                <p className="text-sm text-foreground-tertiary">No AI assistants in this workspace</p>
                              </div>
                            )}

                            {/* Mascot Cost Summary */}
                            {assistants.length > 0 && (
                              <div className="bg-background-tertiary rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground-secondary">Mascot Costs</span>
                                  <span className="text-sm font-bold text-foreground">
                                    €{getWorkspaceMascotTotal(workspace.slug, workspace.plan)}/mo
                                  </span>
                                </div>
                                <div className="text-xs text-foreground-secondary space-y-1">
                                  {assistants.filter(assistant => getMascotCost(assistant.id, workspace.plan) > 0).length > 0 ? (
                                    assistants.filter(assistant => getMascotCost(assistant.id, workspace.plan) > 0).map(assistant => (
                                      <div key={assistant.id} className="flex justify-between">
                                        <span>{assistant.name} ({getMascotPricing(assistant.id).studioName})</span>
                                        <span>€{getMascotCost(assistant.id, workspace.plan)}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-success-600 dark:text-success-500">All mascots included in plan or free</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Link href={`/app/${client.slug}/plans`} className="flex-1">
                                  <Button fullWidth>
                                    Upgrade Plan
                                  </Button>
                                </Link>
                                <Button variant="secondary" className="flex-1">
                                  Add Credits
                                </Button>
                              </div>
                              <Link href={`/app/${client.slug}/workspace/${workspace.slug}`}>
                                <Button variant="secondary" fullWidth>
                                  Manage Workspace →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Monthly Cost Breakdown */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Billing Summary
              </h3>
              <div className="space-y-3">
                {(() => {
                  const summary = computeBillingSummary();
                  const totalDue = summary.baseDueThisPeriod + summary.projectedOverage;
                  const lines: { label: string; value: string; muted?: boolean }[] = [];

                  // Amount due (base + projected overage placeholder)
                  lines.push({
                    label: 'Amount due this period',
                    value: totalDue === 0 && summary.annualCount > 0 && summary.monthlyCount === 0
                      ? '€0 (base already paid)'
                      : `€${totalDue.toLocaleString()}`,
                  });

                  // Monthly
                  if (summary.monthlyCount > 0) {
                    lines.push({ label: 'Monthly charge', value: `€${summary.monthlyTotal.toLocaleString()}` });
                    if (summary.earliestBilling) {
                      lines.push({ label: 'Next billing', value: formatDate(summary.earliestBilling) });
                    }
                  }

                  // Annual
                  if (summary.annualCount > 0) {
                    lines.push({ label: 'Prepaid annual', value: `€${summary.annualTotal.toLocaleString()}` });
                    lines.push({
                      label: 'Monthly equivalent',
                      value: `€${(summary.annualTotal / 12).toLocaleString()}`,
                      muted: true,
                    });
                    if (summary.earliestRenewal) {
                      lines.push({ label: 'Next renewal', value: formatDate(summary.earliestRenewal) });
                    }
                  }

                  // Setup and overages
                  if (summary.setupTotal > 0) {
                    lines.push({ label: 'One-time setup fees', value: `€${summary.setupTotal.toLocaleString()}` });
                  }
                  if (summary.projectedOverage > 0) {
                    lines.push({
                      label: 'Projected overages',
                      value: `€${summary.projectedOverage.toLocaleString()}`,
                    });
                  }

                  return (
                    <div className="text-sm text-foreground space-y-1">
                      {lines.map((line, idx) => (
                        <div key={idx} className={line.muted ? 'text-foreground-tertiary' : ''}>
                          <span className="text-foreground-secondary">{line.label}: </span>
                          <span>{line.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="border-t border-border pt-3 mt-4 text-sm text-foreground">
                  <div className="font-semibold mb-2">Per Workspace</div>
                  <div className="rounded-lg border border-border divide-y divide-border bg-transparent">
                    {workspaces.map(workspace => {
                      const planConfig = getPlanConfig(workspace.plan);
                      const mascotCost = getWorkspaceMascotTotal(workspace.slug, workspace.plan);
                      const totalCost = (workspace.monthlyFee || 0) + mascotCost;
                      const isAnnual =
                        (workspace as Record<string, unknown>).billingCycle === 'annual' ||
                        (workspace as Record<string, unknown>).billing_frequency === 'yearly';
                      const nextBilling =
                        (workspace as Record<string, unknown>).next_billing_date ||
                        (workspace as Record<string, unknown>).contract_end ||
                        (workspace as Record<string, unknown>).contractEnd ||
                        '';
                      const annualTotal = totalCost * 12;
                      const setupFee =
                        Number((workspace as Record<string, unknown>).setup_fee_ex_vat ?? (workspace as Record<string, unknown>).setupFee ?? 0) || 0;

                      return (
                        <div key={workspace.id} className="p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{workspace.name}</span>
                              <Badge plan={getPlanBadgeType(workspace.plan)}>
                                {planConfig.name}
                              </Badge>
                            </div>
                            <span className="font-semibold text-foreground">
                              {totalCost === 0
                                ? 'Included'
                                : isAnnual
                                  ? `Prepaid: €${annualTotal.toLocaleString()}`
                                  : `€${totalCost.toLocaleString()}/month`}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-foreground-tertiary mt-2">
                            {workspace.monthlyFee > 0 && mascotCost > 0 && (
                              <span>Plan: €{workspace.monthlyFee.toLocaleString()} + Mascots: €{mascotCost}</span>
                            )}
                            {setupFee > 0 && (
                              <span>Setup fee: €{setupFee.toLocaleString()}</span>
                            )}
                            {isAnnual && totalCost > 0 && (
                              <span className="text-foreground-tertiary">≈ €{totalCost.toLocaleString()} / month (info only)</span>
                            )}
                            {nextBilling && (
                              <span>{isAnnual ? 'Renews' : 'Next billing'}: {formatDate(nextBilling)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

          {/* Invoice Detail Modal */}
          <Modal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            title={selectedInvoice ? `Invoice ${selectedInvoice.invoice_nr}` : 'Invoice'}
            size="xl"
            className="max-h-[90vh]"
          >
            {selectedInvoice && (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-foreground-secondary">{selectedInvoice.invoice_type}</p>
                    <div className="flex items-center gap-2">
                      <Badge {...statusBadgeProps(selectedInvoice.status)}>{selectedInvoice.status || '—'}</Badge>
                      <span className="text-xs text-foreground-tertiary">
                        {selectedInvoice.currency || 'EUR'} • VAT {selectedInvoice.vat_rate ?? '—'}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => selectedInvoice.invoice_url && window.open(selectedInvoice.invoice_url, '_blank')}
                      disabled={!selectedInvoice.invoice_url}
                    >
                      Download PDF
                    </Button>
                    {selectedInvoice.supporting_doc_url && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(selectedInvoice.supporting_doc_url!, '_blank')}>
                        Supporting Doc
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-background-tertiary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Invoice Date</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.invoice_date)}</p>
                  </div>
                  <div className="p-3 bg-background-tertiary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Due Date</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                  <div className="p-3 bg-background-tertiary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Period</p>
                    <p className="font-semibold text-foreground">
                      {selectedInvoice.period_start && selectedInvoice.period_end
                        ? `${formatDate(selectedInvoice.period_start)} – ${formatDate(selectedInvoice.period_end)}`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-background-tertiary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Workspace</p>
                    <p className="font-semibold text-foreground">{getWorkspaceName(selectedInvoice.workspace_slug)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Amount ex VAT</p>
                    <p className="font-semibold text-foreground">{formatMoney(selectedInvoice.amount_ex_vat, selectedInvoice.currency)}</p>
                  </div>
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <p className="text-xs text-foreground-secondary">VAT</p>
                    <p className="font-semibold text-foreground">{formatMoney(selectedInvoice.amount_vat, selectedInvoice.currency)}</p>
                  </div>
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <p className="text-xs text-foreground-secondary">Total (inc VAT)</p>
                    <p className="font-semibold text-foreground">{formatMoney(selectedInvoice.amount_inc_vat, selectedInvoice.currency)}</p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="p-3 bg-background-tertiary rounded-lg text-foreground">
                    <p className="text-xs text-foreground-secondary mb-1">Notes</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Invoice Lines</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="text-xs w-full table-fixed">
                      <thead className="bg-background-secondary text-foreground-secondary text-[10px]">
                        <tr>
                          <th className="py-2 px-2 text-center font-medium w-[5%]">#</th>
                          <th className="py-2 px-2 text-left font-medium">Description</th>
                          <th className="py-2 px-2 text-left font-medium w-[12%]">Type</th>
                          <th className="py-2 px-2 text-right font-medium w-[8%]">Qty</th>
                          <th className="py-2 px-2 text-right font-medium w-[15%]">Unit ex VAT</th>
                          <th className="py-2 px-2 text-right font-medium w-[18%]">Amount ex VAT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loadingInvoiceLines === selectedInvoice.id && (
                          <tr>
                            <td colSpan={6}>
                              <div className="flex items-center justify-center py-4 gap-2 text-foreground-tertiary text-sm">
                                <Spinner size="sm" />
                                <span>Loading lines…</span>
                              </div>
                            </td>
                          </tr>
                        )}

                        {loadingInvoiceLines !== selectedInvoice.id &&
                          (!invoiceLines[selectedInvoice.id] || invoiceLines[selectedInvoice.id].length === 0) && (
                          <tr>
                            <td colSpan={6}>
                              <div className="py-4 text-center text-foreground-tertiary text-sm">No lines found.</div>
                            </td>
                          </tr>
                        )}

                        {invoiceLines[selectedInvoice.id]?.map(line => (
                          <tr key={line.id}>
                            <td className="py-2 px-2 text-center text-foreground-secondary">{line.line_nr}</td>
                            <td className="py-2 px-2 text-foreground break-words">{line.description}</td>
                            <td className="py-2 px-2 text-foreground-secondary capitalize">{line.line_type}</td>
                            <td className="py-2 px-2 text-right">{line.quantity}</td>
                            <td className="py-2 px-2 text-right">{formatMoney(line.unit_price_ex_vat, selectedInvoice.currency)}</td>
                            <td className="py-2 px-2 text-right font-semibold">{formatMoney(line.amount_ex_vat, selectedInvoice.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal>
      </PageContent>
    </Page>
  );
}
