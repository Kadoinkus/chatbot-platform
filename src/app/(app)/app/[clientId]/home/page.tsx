'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Plus, Search, Building2, Activity, CreditCard, ChevronRight, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function HomePage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceBots, setWorkspaceBots] = useState<Record<string, Bot[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspacesByClientId(params.clientId)
        ]);

        setClient(clientData);
        setWorkspaces(workspacesData || []);

        // Load bots for each workspace
        const botsData: Record<string, Bot[]> = {};
        for (const workspace of workspacesData || []) {
          const bots = await getBotsByWorkspaceId(workspace.id);
          botsData[workspace.id] = bots || [];
        }
        setWorkspaceBots(botsData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page className="flex items-center justify-center">
          <Spinner size="lg" />
        </Page>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page>
          <PageContent>
            <EmptyState
              icon={<Building2 size={48} />}
              title="Client not found"
              message="The requested client could not be found."
            />
          </PageContent>
        </Page>
      </div>
    );
  }

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workspaceBots[workspace.id] || []).some(bot =>
      bot.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getPlanBadge = (plan: string) => {
    const planMap: Record<string, 'starter' | 'growth' | 'premium' | 'enterprise'> = {
      starter: 'starter',
      basic: 'growth',
      growth: 'growth',
      premium: 'premium',
      enterprise: 'enterprise'
    };
    return planMap[plan] || 'starter';
  };

  const getTotalUsage = () => {
    return workspaces.reduce((total, ws) => total + (ws.messages?.used || 0), 0);
  };

  const getTotalBots = () => {
    return Object.values(workspaceBots).reduce((total, bots) => total + bots.length, 0);
  };

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <Page>
          <PageContent>
            <PageHeader
              title="Dashboard"
              description={`Manage your workspaces and AI assistants for ${client.name}`}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Total Workspaces</span>
                  <Building2 size={18} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{workspaces.length}</p>
                <p className="text-xs text-foreground-tertiary mt-1">
                  {workspaces.filter(ws => ws.status === 'active').length} active
                </p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Total Bots</span>
                  <BotIcon size={18} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{getTotalBots()}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Across all workspaces</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">This Month</span>
                  <Activity size={18} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{getTotalUsage().toLocaleString()}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Conversations handled</p>
              </Card>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  icon={<Search size={20} />}
                  placeholder="Search workspaces and bots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button icon={<Plus size={18} />}>
                New Workspace
              </Button>
            </div>

            {/* Workspace Cards */}
            <div className="space-y-4">
              {filteredWorkspaces.map(workspace => {
                const bots = workspaceBots[workspace.id] || [];
                const usagePercentage = workspace.messages ? (workspace.messages.used / workspace.messages.limit) * 100 : 0;

                return (
                  <Card key={workspace.id} hover padding="none">
                    {/* Header Section */}
                    <div className="p-6 pb-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{workspace.name}</h3>
                            <Badge plan={getPlanBadge(workspace.plan)}>
                              {workspace.plan}
                            </Badge>
                          </div>
                          <p className="text-foreground-secondary leading-relaxed">{workspace.description}</p>
                        </div>
                        <Link href={`/app/${client.id}/workspace/${workspace.id}`}>
                          <Button size="sm" iconRight={<ChevronRight size={14} />}>
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="w-8 h-8 bg-info-100 dark:bg-info-700/30 rounded-lg flex items-center justify-center">
                              <BotIcon size={16} className="text-info-600 dark:text-info-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">{bots.length}</p>
                              <p className="text-xs text-foreground-tertiary uppercase tracking-wide">Bots</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground-secondary">
                            {bots.filter(b => b.status === 'Live').length} active, {bots.filter(b => b.status === 'Paused').length} paused
                          </p>
                        </div>

                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="w-8 h-8 bg-success-100 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                              <Activity size={16} className="text-success-600 dark:text-success-500" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {workspace.messages?.used?.toLocaleString() || '0'}
                              </p>
                              <p className="text-xs text-foreground-tertiary uppercase tracking-wide">Usage</p>
                            </div>
                          </div>
                          <div className="w-full bg-background-tertiary rounded-full h-2 mt-1">
                            <div
                              className={`${
                                usagePercentage > 90 ? 'bg-error-500' :
                                usagePercentage > 70 ? 'bg-warning-500' : 'bg-success-500'
                              } rounded-full h-2 transition-all duration-300`}
                              style={{ width: `${Math.min(100, usagePercentage)}%` }}
                            />
                          </div>
                          <p className="text-xs text-foreground-tertiary mt-1">
                            {workspace.messages?.limit ? `${Math.round(usagePercentage)}% of ${workspace.messages.limit.toLocaleString()}` : 'Unlimited'}
                          </p>
                        </div>

                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="w-8 h-8 bg-plan-premium-bg rounded-lg flex items-center justify-center">
                              <CreditCard size={16} className="text-plan-premium-text" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
                              <p className="text-xs text-foreground-tertiary uppercase tracking-wide">Credits</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground-secondary">Available balance</p>
                        </div>
                      </div>
                    </div>

                    {/* Bot Preview */}
                    {bots.length > 0 && (
                      <div className="border-t border-border px-6 py-4 bg-background-secondary">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Active Bots</h4>
                          <Link
                            href={`/app/${client.id}/workspace/${workspace.id}`}
                            className="text-xs text-info-600 hover:text-info-700 dark:text-info-500 dark:hover:text-info-400 font-medium"
                          >
                            View all
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {bots.slice(0, 4).map(bot => (
                            <Link
                              key={bot.id}
                              href={`/app/${client.id}/workspace/${workspace.id}`}
                              className="flex items-center gap-2 px-3 py-2 bg-surface-elevated rounded-lg border border-border text-sm hover:border-border-secondary hover:shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                            >
                              <img
                                src={bot.image}
                                alt={bot.name}
                                className="w-7 h-7 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground truncate block transition-colors">{bot.name}</span>
                                <Badge
                                  variant={bot.status === 'Live' ? 'success' : bot.status === 'Paused' ? 'warning' : 'error'}
                                  className="text-xs px-1.5 py-0"
                                >
                                  {bot.status.toLowerCase()}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                          {bots.length > 4 && (
                            <div className="flex items-center justify-center px-3 py-2 bg-background-tertiary rounded-lg text-sm text-foreground-secondary font-medium">
                              +{bots.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
              <EmptyState
                icon={<Building2 size={48} />}
                title="No workspaces yet"
                message="Create your first workspace to organize your bots and manage resources."
                action={
                  <Button icon={<Plus size={18} />}>
                    Create First Workspace
                  </Button>
                }
              />
            )}

            {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
              <EmptyState
                title="No results found"
                message="No workspaces found matching your search."
              />
            )}
          </PageContent>
        </Page>
      </div>
    </AuthGuard>
  );
}
