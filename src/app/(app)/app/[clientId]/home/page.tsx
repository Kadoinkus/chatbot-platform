'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Plus, Search, Building2, Activity, CreditCard, ChevronRight, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';

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
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 p-6">
          <p className="text-foreground-secondary">Client not found</p>
        </main>
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

  const planColors: Record<string, string> = {
    starter: 'badge-plan-starter',
    basic: 'badge-plan-growth',
    growth: 'badge-plan-growth',
    premium: 'badge-plan-premium',
    enterprise: 'badge-plan-enterprise'
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

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground-secondary">Manage your workspaces and AI assistants for {client.name}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Total Workspaces</span>
                <Building2 size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{workspaces.length}</p>
              <p className="text-xs text-foreground-tertiary mt-1">
                {workspaces.filter(ws => ws.status === 'active').length} active
              </p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Total Bots</span>
                <BotIcon size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{getTotalBots()}</p>
              <p className="text-xs text-foreground-tertiary mt-1">Across all workspaces</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">This Month</span>
                <Activity size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{getTotalUsage().toLocaleString()}</p>
              <p className="text-xs text-foreground-tertiary mt-1">Conversations handled</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary" size={20} />
              <input
                type="text"
                placeholder="Search workspaces and bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <button className="btn-primary px-4 py-2">
              <Plus size={20} />
              New Workspace
            </button>
          </div>
          
          {/* Workspace Cards */}
          <div className="space-y-4">
            {filteredWorkspaces.map(workspace => {
              const bots = workspaceBots[workspace.id] || [];
              const usagePercentage = workspace.messages ? (workspace.messages.used / workspace.messages.limit) * 100 : 0;

              return (
                <div key={workspace.id} className="card-hover overflow-hidden">
                  {/* Header Section */}
                  <div className="p-6 pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{workspace.name}</h3>
                          <span className={`badge ${planColors[workspace.plan]}`}>
                            {workspace.plan}
                          </span>
                        </div>
                        <p className="text-foreground-secondary leading-relaxed">{workspace.description}</p>
                      </div>
                      <Link
                        href={`/app/${client.id}/workspace/${workspace.id}`}
                        className="btn-primary ml-4 px-4 py-2 text-sm"
                      >
                        Manage
                        <ChevronRight size={14} />
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
                              <span className={`text-xs capitalize transition-colors ${
                                bot.status === 'Live' ? 'text-success-600 dark:text-success-500' :
                                bot.status === 'Paused' ? 'text-warning-600 dark:text-warning-500' : 'text-error-600 dark:text-error-500'
                              }`}>
                                {bot.status.toLowerCase()}
                              </span>
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
                </div>
              );
            })}
          </div>
          
          {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Building2 size={24} className="text-foreground-tertiary" />
              </div>
              <h3 className="empty-state-title">No workspaces yet</h3>
              <p className="empty-state-message">Create your first workspace to organize your bots and manage resources.</p>
              <button className="btn-primary px-4 py-2">
                <Plus size={20} />
                Create First Workspace
              </button>
            </div>
          )}

          {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
            <div className="empty-state">
              <p className="text-foreground-tertiary">No workspaces found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
