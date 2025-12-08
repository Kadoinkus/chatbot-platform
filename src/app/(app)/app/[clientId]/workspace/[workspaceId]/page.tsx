'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspaceById, getAssistantsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import AssistantCard from '@/components/AssistantCard';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Settings, CreditCard, Activity,
  Package, Bot as BotIcon, Calendar, AlertCircle
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

export default function WorkspaceDetailPage({
  params
}: {
  params: { clientId: string; workspaceId: string }
}) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspace, setWorkspace] = useState<Workspace | undefined>();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspaceData, assistantsData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspaceById(params.workspaceId),
          getAssistantsByWorkspaceId(params.workspaceId)
        ]);
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
  }, [params.clientId, params.workspaceId]);

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

  const planDetails: Record<string, { features: string[] }> = {
    starter: {
      features: ['25,000 messages/month', '1,000 bundle loads', 'Basic analytics', 'Email support']
    },
    basic: {
      features: ['100,000 messages/month', '5,000 bundle loads', 'Advanced analytics', 'Priority support']
    },
    premium: {
      features: ['500,000 messages/month', '25,000 bundle loads', 'Full analytics', '24/7 support', 'API access']
    },
    enterprise: {
      features: ['2M+ messages/month', '100,000 bundle loads', 'Custom analytics', 'Dedicated support', 'SLA']
    }
  };

  const getPlanType = (plan: string): 'starter' | 'basic' | 'premium' | 'enterprise' => {
    const planMap: Record<string, 'starter' | 'basic' | 'premium' | 'enterprise'> = {
      starter: 'starter',
      basic: 'basic',
      premium: 'premium',
      enterprise: 'enterprise'
    };
    return planMap[plan] || 'starter';
  };

  // Sessions is the client-facing usage metric (messages is admin-only)
  const sessions = workspace.sessions || { used: 0, limit: 5000, remaining: 5000 };
  const usagePercentage = (sessions.used / sessions.limit) * 100;

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
                  <Badge plan={getPlanType(workspace.plan)}>
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
                  href={`/app/${client.id}/home`}
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
                      className={`${
                        usagePercentage > 90 ? 'bg-error-500' :
                        usagePercentage > 70 ? 'bg-warning-500' : 'bg-success-500'
                      } rounded-full h-2 transition-all duration-300`}
                      style={{ width: `${Math.min(100, usagePercentage)}%` }}
                    />
                  </div>
                </div>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Wallet Balance</span>
                  <CreditCard size={18} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold">€{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
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
                  {new Date(workspace.nextBillingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
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
                          <AssistantCard key={assistant.id} assistant={assistant} clientId={client.id} workspace={workspace} workspaceName={workspace.name} />
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
                      <h3 className="text-lg font-semibold text-foreground mb-4">Current Plan Features</h3>
                      <div className="bg-background-secondary rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Package size={20} className="text-foreground" />
                          <span className="font-medium text-foreground capitalize">{workspace.plan} Plan</span>
                        </div>
                        <ul className="space-y-2">
                          {planDetails[workspace.plan]?.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-foreground-secondary">
                              <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Billing Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-foreground-secondary">Billing Cycle</span>
                          <span className="font-medium text-foreground capitalize">{workspace.billingCycle}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-foreground-secondary">Next Billing Date</span>
                          <span className="font-medium text-foreground">
                            {new Date(workspace.nextBillingDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-foreground-secondary">Overage Rate</span>
                          <span className="font-medium text-foreground">€{workspace.overageRates?.messages || '0'}/message</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-foreground-secondary">Workspace Created</span>
                          <span className="font-medium text-foreground">
                            {new Date(workspace.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Wallet Credits</h3>
                      <div className="bg-background-secondary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-foreground">€{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
                            <p className="text-sm text-foreground-secondary">Available balance</p>
                          </div>
                          <Button>
                            Top Up
                          </Button>
                        </div>
                        <p className="text-xs text-foreground-tertiary">
                          Credits are used when you exceed your monthly conversation limit at €{workspace.overageRates?.messages || '0'} per message.
                        </p>
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
