'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getAssistantsByWorkspaceSlug } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import {
  CreditCard, ChevronDown, ChevronUp,
  Plus, Wallet, Activity,
  Euro, Bot as BotIcon, BarChart3,
  MessageCircle, Server, AlertTriangle,
  Shield, Zap, Crown, Building2, ArrowLeft, Package
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
} from '@/components/ui';

export default function WorkspaceBillingPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<Record<string, Assistant[]>>({});
  const [loading, setLoading] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspacesByClientId(params.clientId)
        ]);

        setClient(clientData);
        setWorkspaces(workspacesData || []);

        // Load assistants for each workspace
        const assistantsData: Record<string, Assistant[]> = {};
        for (const workspace of workspacesData || []) {
          const assistants = await getAssistantsByWorkspaceSlug(workspace.slug, params.clientId);
          assistantsData[workspace.slug] = assistants || [];
        }
        setWorkspaceAssistants(assistantsData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

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
      const planConfig = getPlanConfig(ws.plan);
      const planCost = planConfig.price === 0 ? 0 : planConfig.price;
      const mascotCost = getWorkspaceMascotTotal(ws.slug, ws.plan);
      return total + planCost + mascotCost;
    }, 0);
  };

  const getTotalCredits = () => {
    return workspaces.reduce((total, ws) => total + ws.walletCredits, 0);
  };

  const getTotalAssistants = () => {
    return Object.values(workspaceAssistants).reduce((total, assistants) => total + assistants.length, 0);
  };

  const getUsageWarnings = () => {
    return workspaces.filter(ws =>
      (ws.bundleLoads.used / ws.bundleLoads.limit) > 0.8 ||
      (ws.messages.used / ws.messages.limit) > 0.9
    );
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
      starter: { name: 'Starter', icon: Package, color: 'text-foreground-secondary', price: 99, currency: 'EUR' },
      basic: { name: 'Basic', icon: Zap, color: 'text-info-600 dark:text-info-500', price: 299, currency: 'EUR' },
      premium: { name: 'Premium', icon: Crown, color: 'text-plan-premium-text', price: 2499, currency: 'EUR' },
      enterprise: { name: 'Enterprise', icon: Shield, color: 'text-warning-600 dark:text-warning-500', price: 0, currency: 'EUR' }
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
      return workspacePlan === 'starter' ? 30 : 0; // Free for Basic+
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
                  href={`/app/${params.clientId}/settings`}
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
                <p className="text-2xl font-bold text-foreground">€{getTotalMonthlyFee().toLocaleString()}</p>
                <p className="text-xs text-foreground-tertiary mt-1">
                  Across {workspaces.length} workspaces
                </p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Total Credits</span>
                  <Wallet size={16} className="text-warning-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">€{getTotalCredits().toFixed(2)}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Available for overages</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Active Workspaces</span>
                  <Building2 size={16} className="text-info-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {workspaces.filter(ws => ws.status === 'active').length}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">of {workspaces.length} total</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Usage Warnings</span>
                  <AlertTriangle size={16} className="text-error-500" />
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
                        {(workspace.bundleLoads.used / workspace.bundleLoads.limit) > 0.8 &&
                          ` - Bundle loads: ${Math.round((workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100)}%`}
                        {(workspace.messages.used / workspace.messages.limit) > 0.9 &&
                          ` - Messages: ${Math.round((workspace.messages.used / workspace.messages.limit) * 100)}%`}
                      </li>
                    ))}
                  </ul>
                </Alert>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 size={24} />
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
                <div className="text-center py-12">
                  <CreditCard size={48} className="text-foreground-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Invoices Coming Soon</h3>
                  <p className="text-foreground-secondary">Workspace-based invoicing will be available shortly.</p>
                </div>
              </Card>
            )}

            {/* Unified Workspace Dashboard */}
            <div className="space-y-4 mb-6">
              {workspaces.map(workspace => {
                const isExpanded = expandedWorkspaces.has(workspace.id);
                const assistants = workspaceAssistants[workspace.slug] || [];
                const bundleUsagePercent = (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100;
                const messageUsagePercent = (workspace.messages.used / workspace.messages.limit) * 100;
                const apiUsagePercent = (workspace.apiCalls.used / workspace.apiCalls.limit) * 100;
                const planConfig = getPlanConfig(workspace.plan);

                return (
                  <Card key={workspace.id} padding="none">
                    <div
                      className="p-6 cursor-pointer hover:bg-background-hover transition-colors"
                      onClick={() => toggleWorkspaceExpansion(workspace.id)}
                    >
                      {/* Compact Summary View */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <planConfig.icon size={28} className={planConfig.color} />
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
                            {getPlanConfig(workspace.plan).price === 0 ? (
                              <p className="text-lg font-semibold text-foreground">On Request</p>
                            ) : (
                              <div>
                                <p className="text-lg font-semibold text-foreground">
                                  €{(getPlanConfig(workspace.plan).price + getWorkspaceMascotTotal(workspace.slug, workspace.plan)).toLocaleString()}
                                </p>
                                {getWorkspaceMascotTotal(workspace.slug, workspace.plan) > 0 && (
                                  <p className="text-xs text-foreground-tertiary">
                                    Plan: €{getPlanConfig(workspace.plan).price.toLocaleString()} + Mascots: €{getWorkspaceMascotTotal(workspace.slug, workspace.plan)}
                                  </p>
                                )}
                              </div>
                            )}
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
                            {assistants.slice(0, 4).map(assistant => (
                              <div key={assistant.id} className="relative flex-shrink-0">
                                <img
                                  src={assistant.image}
                                  alt={assistant.name}
                                  className="w-8 h-8 rounded-full border-2 border-surface-elevated shadow-sm"
                                  style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                                  title={`${assistant.name} - ${assistant.status}`}
                                />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-elevated ${
                                  assistant.status === 'Active' ? 'bg-success-500' :
                                  assistant.status === 'Paused' ? 'bg-warning-500' : 'bg-error-500'
                                }`} />
                              </div>
                            ))}
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
                                  €{workspace.overageRates.bundleLoads}/load overage • {workspace.bundleLoads.remaining.toLocaleString()} remaining
                                </p>
                              </div>

                              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MessageCircle size={14} className="text-plan-premium-text" />
                                    Messages (OpenAI Processing)
                                  </span>
                                  <span className="text-sm text-foreground-secondary">
                                    {workspace.messages.used.toLocaleString()} / {workspace.messages.limit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full transition-all ${
                                      messageUsagePercent > 90 ? 'bg-error-500' :
                                      messageUsagePercent > 70 ? 'bg-warning-500' : 'bg-plan-premium-text'
                                    }`}
                                    style={{ width: `${Math.min(100, messageUsagePercent)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-foreground-tertiary">
                                  €{workspace.overageRates.messages}/message overage • {workspace.messages.remaining.toLocaleString()} remaining
                                </p>
                              </div>

                              <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Activity size={14} className="text-success-600 dark:text-success-500" />
                                    API Calls
                                  </span>
                                  <span className="text-sm text-foreground-secondary">
                                    {workspace.apiCalls.used.toLocaleString()} / {workspace.apiCalls.limit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full transition-all ${
                                      apiUsagePercent > 90 ? 'bg-error-500' :
                                      apiUsagePercent > 70 ? 'bg-warning-500' : 'bg-success-500'
                                    }`}
                                    style={{ width: `${Math.min(100, apiUsagePercent)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-foreground-tertiary">
                                  €{workspace.overageRates.apiCalls}/call overage • {workspace.apiCalls.remaining.toLocaleString()} remaining
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
                                      <img
                                        src={assistant.image}
                                        alt={assistant.name}
                                        className="w-10 h-10 rounded-full"
                                        style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                                      />
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
                                            {isIncluded ? 'Included' : 'Free'}
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
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Monthly Cost Breakdown
              </h3>
              <div className="space-y-3">
                {workspaces.map(workspace => {
                  const planConfig = getPlanConfig(workspace.plan);
                  const mascotCost = getWorkspaceMascotTotal(workspace.slug, workspace.plan);
                  const totalCost = planConfig.price + mascotCost;

                  return (
                    <div key={workspace.id} className="py-3 border-b border-border last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <planConfig.icon size={16} className={planConfig.color} />
                          <span className="font-medium text-foreground">{workspace.name}</span>
                          <Badge plan={getPlanBadgeType(workspace.plan)}>
                            {planConfig.name}
                          </Badge>
                        </div>
                        <span className="font-semibold text-foreground">
                          {planConfig.price === 0 ? 'On Request' : `€${totalCost.toLocaleString()}`}
                        </span>
                      </div>
                      {planConfig.price > 0 && mascotCost > 0 && (
                        <div className="flex justify-between items-center text-xs text-foreground-tertiary mt-1 pl-8">
                          <span>Plan: €{planConfig.price.toLocaleString()} + Mascots: €{mascotCost}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="border-t border-border pt-3 mt-4 flex justify-between items-center font-semibold text-lg">
                  <span className="text-foreground">Total Monthly Cost</span>
                  <span className="text-success-600 dark:text-success-500">
                    €{getTotalMonthlyFee().toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
      </PageContent>
    </Page>
  );
}
