'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspaceById, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import BotCard from '@/components/BotCard';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Settings, CreditCard, Activity, 
  Package, Users, Bot as BotIcon, TrendingUp,
  Clock, Calendar, DollarSign, AlertCircle
} from 'lucide-react';

export default function WorkspaceDetailPage({ 
  params 
}: { 
  params: { clientId: string; workspaceId: string } 
}) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspace, setWorkspace] = useState<Workspace | undefined>();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bots');

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspaceData, botsData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspaceById(params.workspaceId),
          getBotsByWorkspaceId(params.workspaceId)
        ]);
        setClient(clientData);
        setWorkspace(workspaceData);
        setBots(botsData || []);
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
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </main>
      </div>
    );
  }

  if (!client || !workspace) {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <p className="text-foreground-secondary">Workspace not found</p>
        </main>
      </div>
    );
  }

  const planDetails: Record<string, { color: string; features: string[] }> = {
    starter: {
      color: 'badge-plan-starter',
      features: ['25,000 messages/month', '1,000 bundle loads', 'Basic analytics', 'Email support']
    },
    basic: {
      color: 'badge-plan-growth',
      features: ['100,000 messages/month', '5,000 bundle loads', 'Advanced analytics', 'Priority support']
    },
    growth: {
      color: 'badge-plan-growth',
      features: ['100,000 messages/month', '5,000 bundle loads', 'Advanced analytics', 'Priority support']
    },
    premium: {
      color: 'badge-plan-premium',
      features: ['500,000 messages/month', '25,000 bundle loads', 'Full analytics', '24/7 support', 'API access']
    },
    enterprise: {
      color: 'badge-plan-enterprise',
      features: ['2M+ messages/month', '100,000 bundle loads', 'Custom analytics', 'Dedicated support', 'SLA']
    }
  };

  const usagePercentage = workspace.messages ? (workspace.messages.used / workspace.messages.limit) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar clientId={client.id} />

      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link
            href={`/app/${client.id}/home`}
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-6"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          {/* Workspace Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
                  <span className={`badge ${planDetails[workspace.plan].color}`}>
                    {workspace.plan.toUpperCase()}
                  </span>
                  {workspace.status !== 'active' && (
                    <span className="badge bg-error-100 text-error-700 dark:bg-error-700/30 dark:text-error-500">
                      {workspace.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-foreground-secondary">{workspace.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary px-4 py-2">
                  <Settings size={16} />
                  Settings
                </button>
                <button className="btn-primary px-4 py-2">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Usage This Month</span>
                <Activity size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{workspace.messages?.used?.toLocaleString() || '0'}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-foreground-tertiary mb-1">
                  <span>{Math.round(usagePercentage)}% used</span>
                  <span>{workspace.messages?.remaining?.toLocaleString() || '0'} left</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div
                    className={`${
                      usagePercentage > 90 ? 'bg-error-500' :
                      usagePercentage > 70 ? 'bg-warning-500' : 'bg-success-500'
                    } rounded-full h-2`}
                    style={{ width: `${Math.min(100, usagePercentage)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Wallet Balance</span>
                <CreditCard size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold">€{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
              <button className="text-xs text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 mt-1">
                + Add credits
              </button>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Active Bots</span>
                <BotIcon size={18} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{bots.filter(b => b.status === 'Live').length}</p>
              <p className="text-xs text-foreground-tertiary mt-1">of {bots.length} total</p>
            </div>

            <div className="card p-4">
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
            </div>
          </div>

          {/* Warning if approaching limit */}
          {usagePercentage > 80 && usagePercentage < 100 && (
            <div className="mb-6 p-4 bg-warning-100 dark:bg-warning-700/20 border border-warning-300 dark:border-warning-700 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-warning-600 dark:text-warning-500 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-200">Approaching usage limit</p>
                <p className="text-sm text-warning-800 dark:text-warning-300 mt-1">
                  You've used {Math.round(usagePercentage)}% of your monthly limit.
                  Consider upgrading your plan or adding wallet credits for overages.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-border">
              <div className="flex gap-6 p-6">
                <button
                  onClick={() => setActiveTab('bots')}
                  className={`pb-2 px-1 font-medium transition-colors relative ${
                    activeTab === 'bots'
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Bots ({bots.length})
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`pb-2 px-1 font-medium transition-colors relative ${
                    activeTab === 'usage'
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Usage & Billing
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-2 px-1 font-medium transition-colors relative ${
                    activeTab === 'settings'
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Bots Tab */}
              {activeTab === 'bots' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Workspace Bots</h3>
                    <button className="btn-primary px-4 py-2 flex items-center gap-2">
                      <Plus size={16} />
                      Add Bot
                    </button>
                  </div>

                  {bots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bots.map((bot) => (
                        <BotCard key={bot.id} bot={bot} clientId={client.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BotIcon size={48} className="mx-auto text-foreground-tertiary mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No bots in this workspace</h3>
                      <p className="text-foreground-secondary mb-4">Add your first bot to start handling conversations.</p>
                      <button className="btn-primary px-4 py-2 inline-flex items-center gap-2">
                        <Plus size={16} />
                        Create First Bot
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Usage Tab */}
              {activeTab === 'usage' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Current Plan Features</h3>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={20} className="text-foreground" />
                        <span className="font-medium text-foreground capitalize">{workspace.plan} Plan</span>
                      </div>
                      <ul className="space-y-2">
                        {planDetails[workspace.plan].features.map((feature, idx) => (
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
                        <button className="btn-primary px-4 py-2">
                          Top Up
                        </button>
                      </div>
                      <p className="text-xs text-foreground-tertiary">
                        Credits are used when you exceed your monthly conversation limit at €{workspace.overageRates?.messages || '0'} per message.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Workspace Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Workspace Name</label>
                        <input
                          type="text"
                          value={workspace.name}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                        <textarea
                          value={workspace.description}
                          rows={3}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
                    <div className="border border-error-300 dark:border-error-700 rounded-lg p-4 bg-error-50 dark:bg-error-700/10">
                      <h4 className="font-medium text-error-900 dark:text-error-400 mb-2">Delete Workspace</h4>
                      <p className="text-sm text-foreground-secondary mb-4">
                        Once you delete a workspace, there is no going back. All bots and data will be permanently removed.
                      </p>
                      <button className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors">
                        Delete Workspace
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
