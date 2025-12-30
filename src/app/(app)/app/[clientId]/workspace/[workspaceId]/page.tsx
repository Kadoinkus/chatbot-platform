'use client';
import { useState, useEffect, use } from 'react';
import { getClientById, getWorkspaceById, getAssistantsByWorkspaceSlug, getAssistantsByClientId } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import AssistantCard from '@/components/AssistantCard';
import { getClientBrandColor, registerClientPalette } from '@/lib/brandColors';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Settings, CreditCard, Activity,
  Bot as BotIcon, Calendar, AlertCircle
} from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  Tabs,
  TabPanel,
  Alert,
  Spinner,
  EmptyState,
} from '@/components/ui';
import { calculateNextResetDate, PLAN_CONFIG } from '@/lib/billingService';

export default function WorkspaceDetailPage({
  params
}: {
  params: Promise<{ clientId: string; workspaceId: string }>
}) {
  const { clientId, workspaceId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [workspace, setWorkspace] = useState<Workspace | undefined>();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspaceData] = await Promise.all([
          getClientById(clientId),
          getWorkspaceById(workspaceId, clientId)
        ]);

        let assistantsData: Assistant[] = [];
        const workspaceKeys = new Set<string>();
        if (workspaceData?.slug) workspaceKeys.add(workspaceData.slug);
        if (workspaceData?.id) workspaceKeys.add(workspaceData.id);
        workspaceKeys.add(workspaceId);

        // Try scoped fetch first
        const primaryKey = workspaceData?.slug ?? workspaceId;
        if (primaryKey) {
          assistantsData = await getAssistantsByWorkspaceSlug(primaryKey, clientId);
        }
        // Fallback: fetch all assistants for the client and filter by any matching key
        if (!assistantsData?.length) {
          const allAssistants = await getAssistantsByClientId(clientId);
          assistantsData = allAssistants.filter((a) => a.workspaceSlug && workspaceKeys.has(a.workspaceSlug));
        }

        // Register client palette for brand color lookups
        if (clientData?.palette?.primary) {
          registerClientPalette(clientData.id, clientData.palette.primary);
          registerClientPalette(clientData.slug, clientData.palette.primary);
        }

        setClient(clientData);
        setWorkspace(workspaceData);
        setAssistants(assistantsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, workspaceId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client || !workspace) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Package size={48} />}
            title="Workspace not found"
            message="The requested workspace could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  const brandColor = client.palette?.primary || getClientBrandColor(client.id) || getClientBrandColor(client.slug);

  const planType = (workspace.plan as keyof typeof PLAN_CONFIG) in PLAN_CONFIG ? (workspace.plan as keyof typeof PLAN_CONFIG) : 'starter';
  const planConfig = PLAN_CONFIG[planType];

  // Sessions is the client-facing usage metric
  const sessions = workspace.sessions || { used: 0, limit: 0, remaining: 0 };
  const usagePercentage = sessions.limit ? (sessions.used / sessions.limit) * 100 : 0;
  const formatDateSafe = (value?: string, opts?: Intl.DateTimeFormatOptions) => {
    if (!value) return 'Not set';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', opts);
  };
  const derivedNextBillingDate = (() => {
    const raw = workspace.nextBillingDate;
    if (raw && !isNaN(new Date(raw).getTime())) {
      return raw;
    }
    const start = workspace.subscriptionStartDate || workspace.createdAt;
    if (!start) return undefined;
    return calculateNextResetDate(
      start,
      workspace.billingResetDay ?? 1,
      workspace.billingCycle || 'monthly'
    );
  })();

  const tabs = [
    { id: 'assistants', label: `AI Assistants (${assistants.length})` },
    { id: 'usage', label: 'Usage & Billing' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <Page>
      <PageContent>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {workspace.name}
              <Badge plan={planType}>
                {workspace.plan.toUpperCase()}
              </Badge>
              {workspace.status !== 'active' && (
                <Badge variant="error">
                  {workspace.status.toUpperCase()}
                </Badge>
              )}
            </span>
          }
          description={workspace.description}
          backLink={
            <Link
              href={`/app/${client.slug}/home`}
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back to Workspaces
            </Link>
          }
          actions={
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon={<Settings size={16} />}>
                Settings
              </Button>
              <Button>
                Upgrade Plan
              </Button>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Sessions This Month</span>
              <Activity size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{sessions.used.toLocaleString()}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-foreground-tertiary mb-1">
                <span>{Math.round(usagePercentage)}% used</span>
                <span>{sessions.remaining.toLocaleString()} left</span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div
                  className="rounded-full h-2 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, usagePercentage)}%`,
                    backgroundColor: brandColor
                  }}
                />
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Wallet Balance</span>
              <CreditCard size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold">€{(workspace.walletCredits ?? 0).toFixed(2)}</p>
            <button className="text-xs text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 mt-1">
              + Add credits
            </button>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Active AI Assistants</span>
              <BotIcon size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{assistants.filter(a => a.status === 'Active').length}</p>
            <p className="text-xs text-foreground-tertiary mt-1">of {assistants.length} total</p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-secondary">Next Billing</span>
              <Calendar size={18} className="text-foreground-tertiary" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatDateSafe(derivedNextBillingDate, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-foreground-tertiary mt-1 capitalize">{workspace.billingCycle}</p>
          </Card>
        </div>

        {/* Warning if approaching limit */}
        {usagePercentage > 80 && usagePercentage < 100 && (
          <div className="mb-6">
            <Alert variant="warning" title="Approaching session limit">
              You've used {Math.round(usagePercentage)}% of your monthly sessions.
              Consider upgrading your plan or adding wallet credits for overages.
            </Alert>
          </div>
        )}

        {/* Tabs */}
        <Card padding="none">
          <Tabs tabs={tabs} defaultTab="assistants">
            <TabPanel tabId="assistants">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                      Workspace
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{workspace.name} AI Assistants</h3>
                  </div>
                  <Button icon={<Plus size={16} />}>
                    Add AI Assistant
                  </Button>
                </div>

                {assistants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assistants.map((assistant) => (
                      <AssistantCard key={assistant.id} assistant={assistant} clientId={client.id} workspace={workspace} workspaceName={workspace.name} brandColor={client.palette?.primary} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<BotIcon size={48} />}
                    title="No AI assistants in this workspace"
                    message="Add your first AI assistant to start handling conversations."
                    action={
                      <Button icon={<Plus size={16} />}>
                        Create First AI Assistant
                      </Button>
                    }
                  />
                )}
              </div>
            </TabPanel>

            <TabPanel tabId="usage">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Current subscription</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-foreground-secondary">Plan</span>
                    <span className="font-medium">{planConfig.name} · {workspace.billingCycle}</span>

                    <span className="text-foreground-secondary">Status</span>
                    <span className="font-medium capitalize">{workspace.status ?? 'active'}</span>

                    <span className="text-foreground-secondary">Next billing</span>
                    <span className="font-medium">{formatDateSafe(derivedNextBillingDate)}</span>

                    <span className="text-foreground-secondary">Contract start</span>
                    <span className="font-medium">{formatDateSafe(workspace.subscriptionStartDate)}</span>

                    <span className="text-foreground-secondary">Reset cadence</span>
                    <span className="font-medium capitalize">{workspace.usageResetInterval || 'Not set'}</span>

                    <span className="text-foreground-secondary">Next usage reset</span>
                    <span className="font-medium">{formatDateSafe(workspace.nextUsageResetDate)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Limits</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {[
                      { label: 'Conversations', used: workspace.sessions?.used ?? 0, limit: workspace.sessions?.limit ?? 0 },
                      { label: 'Bundle loads', used: workspace.bundleLoads.used, limit: workspace.bundleLoads.limit },
                    ].map(({ label, used, limit }) => (
                      <div className="contents" key={label}>
                        <span className="text-foreground-secondary">{label}</span>
                        <span className="font-medium">{used} / {limit || 'unlimited'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-background-secondary rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Overage bundle</span>
                      <span className="font-medium">€{workspace.overageRates.bundleLoads ?? 0}/bundle</span>
                    </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Overage sessions</span>
                          <span className="font-medium">€{workspace.overageRates.messages ?? 0}/session</span>
                        </div>
                    <p className="text-xs text-foreground-tertiary">
                      Wallet credits are used first when you exceed limits.
                    </p>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">€{(workspace.walletCredits ?? 0).toFixed(2)}</p>
                        <p className="text-sm text-foreground-secondary">Wallet balance</p>
                      </div>
                      <Button>
                        Top Up
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel tabId="settings">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Workspace Settings</h3>
                  <div className="space-y-4">
                    <Input
                      label="Workspace Name"
                      defaultValue={workspace.name}
                    />
                    <Textarea
                      label="Description"
                      defaultValue={workspace.description}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
                  <div className="border border-error-300 dark:border-error-700 rounded-lg p-4 bg-error-50 dark:bg-error-700/10">
                    <h4 className="font-medium text-error-900 dark:text-error-400 mb-2">Delete Workspace</h4>
                    <p className="text-sm text-foreground-secondary mb-4">
                      Once you delete a workspace, there is no going back. All AI assistants and data will be permanently removed.
                    </p>
                    <Button variant="danger">
                      Delete Workspace
                    </Button>
                  </div>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </Card>
      </PageContent>
    </Page>
  );
}





