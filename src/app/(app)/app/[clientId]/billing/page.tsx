'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Download, Plus, Wallet, Package, Activity, Users, Sparkles,
  Euro, Calendar, Bot as BotIcon, BarChart3, Settings, Check, X,
  MessageCircle, Server, Eye, Info, ArrowUpRight, AlertTriangle,
  Star, Shield, Zap, Crown, Gift, ShoppingBag, Building2
} from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceBillingPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceBots, setWorkspaceBots] = useState<Record<string, Bot[]>>({});
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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16">
          <div className="text-center p-8">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No billing data found</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate totals across all workspaces
  const getTotalMonthlyFee = () => {
    return workspaces.reduce((total, ws) => {
      const planConfig = getPlanConfig(ws.plan);
      return total + (planConfig.price === 0 ? 0 : planConfig.price);
    }, 0);
  };

  const getTotalCredits = () => {
    return workspaces.reduce((total, ws) => total + ws.walletCredits, 0);
  };

  const getTotalBots = () => {
    return Object.values(workspaceBots).reduce((total, bots) => total + bots.length, 0);
  };

  const getUsageWarnings = () => {
    return workspaces.filter(ws => 
      (ws.bundleLoads.used / ws.bundleLoads.limit) > 0.8 ||
      (ws.messages.used / ws.messages.limit) > 0.9
    );
  };

  const planColors = {
    starter: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700'
  };

  const getPlanConfig = (plan: string) => {
    const configs = {
      starter: { name: 'Starter', icon: Package, color: 'text-gray-600', price: 99, currency: 'EUR' },
      basic: { name: 'Basic', icon: Zap, color: 'text-blue-600', price: 299, currency: 'EUR' },
      premium: { name: 'Premium', icon: Crown, color: 'text-purple-600', price: 2499, currency: 'EUR' },
      enterprise: { name: 'Enterprise', icon: Shield, color: 'text-orange-600', price: 0, currency: 'EUR' }
    };
    return configs[plan as keyof typeof configs] || configs.starter;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={params.clientId} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Workspaces</h1>
              <p className="text-gray-600">
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} with {getTotalBots()} bot{getTotalBots() !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                <Plus size={18} />
                New Workspace
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Total</span>
                <Euro size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">€{getTotalMonthlyFee().toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                Across {workspaces.length} workspaces
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Credits</span>
                <Wallet size={16} className="text-orange-400" />
              </div>
              <p className="text-2xl font-bold">€{getTotalCredits().toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Available for overages</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Workspaces</span>
                <Building2 size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold">
                {workspaces.filter(ws => ws.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">of {workspaces.length} total</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Usage Warnings</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="text-2xl font-bold">{getUsageWarnings().length}</p>
              <p className="text-xs text-gray-500 mt-1">Near limits</p>
            </div>
          </div>

          {/* Usage Warnings */}
          {getUsageWarnings().length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 mb-1">Usage Warnings</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
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
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 size={24} />
              Your Workspaces
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowInvoices(!showInvoices)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <CreditCard size={16} />
                {showInvoices ? 'Hide' : 'View'} Invoices
              </button>
            </div>
          </div>

          {/* Invoices Section */}
          {showInvoices && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="text-center py-12">
                <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Invoices Coming Soon</h3>
                <p className="text-gray-600">Workspace-based invoicing will be available shortly.</p>
              </div>
            </div>
          )}

          {/* Unified Workspace Dashboard */}
          <div className="space-y-4 mb-6">{workspaces.map(workspace => {
            const isExpanded = expandedWorkspaces.has(workspace.id);
            const bots = workspaceBots[workspace.id] || [];
            const bundleUsagePercent = (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100;
            const messageUsagePercent = (workspace.messages.used / workspace.messages.limit) * 100;
            const apiUsagePercent = (workspace.apiCalls.used / workspace.apiCalls.limit) * 100;
            const planConfig = getPlanConfig(workspace.plan);
            
            return (
              <div key={workspace.id} className="bg-white rounded-xl border border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleWorkspaceExpansion(workspace.id)}
                >
                  {/* Compact Summary View */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <planConfig.icon size={28} className={planConfig.color} />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold">{workspace.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[workspace.plan]}`}>
                            {planConfig.name}
                          </span>
                          {workspace.status !== 'active' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {workspace.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {bots.length} bot{bots.length !== 1 ? 's' : ''} • {workspace.billingCycle} billing • {workspace.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Monthly Cost</p>
                        <p className="text-lg font-semibold">
                          {getPlanConfig(workspace.plan).price === 0 ? 'On Request' : 
                           `€${getPlanConfig(workspace.plan).price.toLocaleString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Credits</p>
                        <p className="text-lg font-semibold">€{workspace.walletCredits.toFixed(2)}</p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Bot Summary */}
                  {bots.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <BotIcon size={14} />
                          {bots.filter(b => b.status === 'Live').length} active of {bots.length} bots
                        </p>
                        <span className="text-xs text-gray-500">Click to expand</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        {bots.slice(0, 4).map(bot => (
                          <div key={bot.id} className="relative flex-shrink-0">
                            <img 
                              src={bot.image} 
                              alt={bot.name}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              title={`${bot.name} - ${bot.status}`}
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              bot.status === 'Live' ? 'bg-green-500' : 
                              bot.status === 'Paused' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </div>
                        ))}
                        {bots.length > 4 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                            +{bots.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <BotIcon size={16} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">No bots in this workspace</p>
                      <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">+ Add first bot</button>
                    </div>
                  )}
                </div>

                {/* Detailed Expanded View */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Detailed Resource Usage */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <BarChart3 size={16} />
                          Resource Usage Details
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Server size={14} className="text-blue-600" />
                                Bundle Loads (3D Rendering)
                              </span>
                              <span className="text-sm text-gray-600">
                                {workspace.bundleLoads.used.toLocaleString()} / {workspace.bundleLoads.limit.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full transition-all ${
                                  bundleUsagePercent > 90 ? 'bg-red-500' : 
                                  bundleUsagePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(100, bundleUsagePercent)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              €{workspace.overageRates.bundleLoads}/load overage • {workspace.bundleLoads.remaining.toLocaleString()} remaining
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <MessageCircle size={14} className="text-purple-600" />
                                Messages (OpenAI Processing)
                              </span>
                              <span className="text-sm text-gray-600">
                                {workspace.messages.used.toLocaleString()} / {workspace.messages.limit.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full transition-all ${
                                  messageUsagePercent > 90 ? 'bg-red-500' : 
                                  messageUsagePercent > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${Math.min(100, messageUsagePercent)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              €{workspace.overageRates.messages}/message overage • {workspace.messages.remaining.toLocaleString()} remaining
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Activity size={14} className="text-green-600" />
                                API Calls
                              </span>
                              <span className="text-sm text-gray-600">
                                {workspace.apiCalls.used.toLocaleString()} / {workspace.apiCalls.limit.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full transition-all ${
                                  apiUsagePercent > 90 ? 'bg-red-500' : 
                                  apiUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, apiUsagePercent)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              €{workspace.overageRates.apiCalls}/call overage • {workspace.apiCalls.remaining.toLocaleString()} remaining
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Workspace Bots & Actions */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <BotIcon size={16} />
                          Workspace Bots ({bots.length})
                        </h4>
                        {bots.length > 0 ? (
                          <div className="space-y-2 mb-6">
                            {bots.map(bot => (
                              <div key={bot.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                <img 
                                  src={bot.image} 
                                  alt={bot.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{bot.name}</p>
                                  <p className="text-xs text-gray-500">{bot.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    bot.status === 'Live' ? 'bg-green-500' : 
                                    bot.status === 'Paused' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  <span className="text-xs text-gray-500">{bot.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center mb-6">
                            <BotIcon size={32} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No bots in this workspace</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/app/${client.id}/plans`}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                            >
                              Upgrade Plan
                            </Link>
                            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                              Add Credits
                            </button>
                          </div>
                          <Link 
                            href={`/app/${client.id}/workspace/${workspace.id}`}
                            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors text-center"
                          >
                            Manage Workspace →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {/* Monthly Cost Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Monthly Cost Breakdown
            </h3>
            <div className="space-y-3">
              {workspaces.map(workspace => {
                const planConfig = getPlanConfig(workspace.plan);
                return (
                  <div key={workspace.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <planConfig.icon size={16} className={planConfig.color} />
                      <span className="font-medium">{workspace.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[workspace.plan]}`}>
                        {planConfig.name}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {planConfig.price === 0 ? 'On Request' : 
                       `€${planConfig.price.toLocaleString()}`}
                    </span>
                  </div>
                );
              })}
              <div className="border-t pt-3 mt-4 flex justify-between items-center font-semibold text-lg">
                <span>Total Monthly Cost</span>
                <span className="text-green-600">
                  €{getTotalMonthlyFee().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
