'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Download, Plus, Wallet, Package, Activity, Users, Sparkles,
  DollarSign, Calendar, Bot as BotIcon, BarChart3, Settings, Check, X,
  MessageCircle, Server, Eye, Info, ArrowUpRight, AlertTriangle,
  Star, Shield, Zap, Crown, Gift, ShoppingBag, Building2
} from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceBillingPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceBots, setWorkspaceBots] = useState<Record<string, Bot[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'workspaces' | 'plans' | 'invoices'>('overview');
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
    return workspaces.reduce((total, ws) => total + ws.monthlyFee, 0);
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
    growth: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700'
  };

  const getPlanConfig = (plan: string) => {
    const configs = {
      starter: { name: 'Starter', icon: Package, color: 'text-gray-600', price: 49 },
      growth: { name: 'Growth', icon: Zap, color: 'text-blue-600', price: 99 },
      premium: { name: 'Premium', icon: Crown, color: 'text-purple-600', price: 299 },
      enterprise: { name: 'Enterprise', icon: Shield, color: 'text-orange-600', price: 999 }
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
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">${getTotalMonthlyFee().toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Across {workspaces.length} workspaces
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Credits</span>
                <Wallet size={16} className="text-orange-400" />
              </div>
              <p className="text-2xl font-bold">${getTotalCredits().toFixed(2)}</p>
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

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'overview' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('workspaces')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'workspaces' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Workspace Details
              </button>
              <button
                onClick={() => setActiveView('plans')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'plans' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveView('invoices')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'invoices' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Invoices
              </button>
            </div>

            <div className="p-6">
              {activeView === 'overview' && (
                <div className="space-y-6">
                  {/* Workspace Summary Cards */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Building2 size={20} />
                      Your Workspaces ({workspaces.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {workspaces.map(workspace => {
                        const bots = workspaceBots[workspace.id] || [];
                        const bundleUsagePercent = (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100;
                        const messageUsagePercent = (workspace.messages.used / workspace.messages.limit) * 100;
                        const planConfig = getPlanConfig(workspace.plan);
                        
                        return (
                          <div key={workspace.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <planConfig.icon size={20} className={planConfig.color} />
                                <div>
                                  <p className="font-medium">{workspace.name}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[workspace.plan]}`}>
                                    {planConfig.name}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${workspace.monthlyFee}/mo</p>
                                <p className="text-xs text-gray-500">{bots.length} bot{bots.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Bundle Loads</p>
                                <p className="text-sm font-medium">
                                  {workspace.bundleLoads.used.toLocaleString()} / {workspace.bundleLoads.limit.toLocaleString()}
                                </p>
                                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      bundleUsagePercent > 90 ? 'bg-red-500' : 
                                      bundleUsagePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min(100, bundleUsagePercent)}%` }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Messages</p>
                                <p className="text-sm font-medium">
                                  {workspace.messages.used.toLocaleString()} / {workspace.messages.limit.toLocaleString()}
                                </p>
                                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      messageUsagePercent > 90 ? 'bg-red-500' : 
                                      messageUsagePercent > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                                    }`}
                                    style={{ width: `${Math.min(100, messageUsagePercent)}%` }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Credits</p>
                                <p className="text-sm font-medium">${workspace.walletCredits.toFixed(2)}</p>
                                <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                                  + Add credits
                                </button>
                              </div>
                            </div>

                            <Link 
                              href={`/app/${client.id}/workspace/${workspace.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Manage workspace →
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Cost Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 size={20} />
                      Monthly Cost Breakdown
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        {workspaces.map(workspace => (
                          <div key={workspace.id} className="flex justify-between">
                            <span>{workspace.name} ({getPlanConfig(workspace.plan).name})</span>
                            <span className="font-medium">${workspace.monthlyFee.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total Monthly</span>
                          <span>${getTotalMonthlyFee().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'workspaces' && (
                <div className="space-y-4">
                  {workspaces.map(workspace => {
                    const isExpanded = expandedWorkspaces.has(workspace.id);
                    const bots = workspaceBots[workspace.id] || [];
                    const bundleUsagePercent = (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100;
                    const messageUsagePercent = (workspace.messages.used / workspace.messages.limit) * 100;
                    const apiUsagePercent = (workspace.apiCalls.used / workspace.apiCalls.limit) * 100;
                    const planConfig = getPlanConfig(workspace.plan);
                    
                    return (
                      <div key={workspace.id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleWorkspaceExpansion(workspace.id)}
                        >
                          <div className="flex items-center gap-4">
                            <planConfig.icon size={24} className={planConfig.color} />
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {workspace.name}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[workspace.plan]}`}>
                                  {planConfig.name}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                {bots.length} bot{bots.length !== 1 ? 's' : ''} • {workspace.billingCycle} billing
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Monthly fee</p>
                              <p className="font-medium">${workspace.monthlyFee}/mo</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Credits</p>
                              <p className="font-medium">${workspace.walletCredits.toFixed(2)}</p>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Resource Usage</p>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center gap-2">
                                        <Server size={14} className="text-blue-600" />
                                        Bundle Loads (3D Rendering)
                                      </span>
                                      <span>{workspace.bundleLoads.used.toLocaleString()} / {workspace.bundleLoads.limit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${
                                          bundleUsagePercent > 90 ? 'bg-red-500' : 
                                          bundleUsagePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.min(100, bundleUsagePercent)}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      ${workspace.overageRates.bundleLoads}/load overage rate
                                    </p>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center gap-2">
                                        <MessageCircle size={14} className="text-purple-600" />
                                        Messages (OpenAI)
                                      </span>
                                      <span>{workspace.messages.used.toLocaleString()} / {workspace.messages.limit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${
                                          messageUsagePercent > 90 ? 'bg-red-500' : 
                                          messageUsagePercent > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                                        }`}
                                        style={{ width: `${Math.min(100, messageUsagePercent)}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      ${workspace.overageRates.messages}/message overage rate
                                    </p>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center gap-2">
                                        <Activity size={14} className="text-green-600" />
                                        API Calls
                                      </span>
                                      <span>{workspace.apiCalls.used.toLocaleString()} / {workspace.apiCalls.limit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${
                                          apiUsagePercent > 90 ? 'bg-red-500' : 
                                          apiUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, apiUsagePercent)}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      ${workspace.overageRates.apiCalls}/call overage rate
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Workspace Bots</p>
                                {bots.length > 0 ? (
                                  <div className="space-y-2">
                                    {bots.map(bot => (
                                      <div key={bot.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                                        <img 
                                          src={bot.image} 
                                          alt={bot.name}
                                          className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{bot.name}</p>
                                          <p className="text-xs text-gray-600">{bot.description}</p>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${
                                          bot.status === 'Live' ? 'bg-green-500' : 
                                          bot.status === 'Paused' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No bots in this workspace</p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between">
                              <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                  Upgrade Plan
                                </button>
                                <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                                  Add Credits
                                </button>
                              </div>
                              <Link 
                                href={`/app/${client.id}/workspace/${workspace.id}`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                Manage Workspace →
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeView === 'plans' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Workspace Plans</h3>
                    <p className="text-gray-600">Each workspace can have its own plan. Choose what fits each team's needs.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {[
                      {
                        tier: 'starter',
                        name: 'Starter',
                        price: 49,
                        bundleLoads: 1000,
                        messages: 25000,
                        apiCalls: 50000,
                        features: ['1,000 bundle loads', '25K messages', 'Basic support', '2D fallback']
                      },
                      {
                        tier: 'growth',
                        name: 'Growth',
                        price: 99,
                        bundleLoads: 5000,
                        messages: 100000,
                        apiCalls: 250000,
                        features: ['5,000 bundle loads', '100K messages', 'Priority support', 'Analytics']
                      },
                      {
                        tier: 'premium',
                        name: 'Premium',
                        price: 299,
                        bundleLoads: 25000,
                        messages: 500000,
                        apiCalls: 1000000,
                        features: ['25,000 bundle loads', '500K messages', '24/7 support', 'API access']
                      },
                      {
                        tier: 'enterprise',
                        name: 'Enterprise',
                        price: 999,
                        bundleLoads: 100000,
                        messages: 2000000,
                        apiCalls: 5000000,
                        features: ['100,000 bundle loads', '2M messages', 'Dedicated support', 'Custom features']
                      }
                    ].map((plan) => (
                      <div key={plan.tier} className="border border-gray-200 rounded-xl p-6">
                        <div className="text-center mb-4">
                          <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                          <div className="text-3xl font-bold mb-2">
                            ${plan.price}<span className="text-lg text-gray-600 font-normal">/mo</span>
                          </div>
                          <p className="text-sm text-gray-600">per workspace</p>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Server size={14} className="text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Bundle Loads</span>
                            </div>
                            <span className="text-lg font-bold text-blue-900">{plan.bundleLoads.toLocaleString()}</span>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle size={14} className="text-purple-600" />
                              <span className="text-sm font-medium text-purple-900">Messages</span>
                            </div>
                            <span className="text-lg font-bold text-purple-900">{plan.messages.toLocaleString()}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button className="w-full py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                          Assign to Workspace
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info size={20} className="text-blue-600" />
                      How Workspace Billing Works
                    </h4>
                    <ul className="text-gray-700 space-y-2 text-sm">
                      <li>• Each workspace has its own plan and resource limits</li>
                      <li>• Bundle loads are for expensive 3D avatar rendering</li>
                      <li>• When bundle loads run out, bots automatically fallback to 2D mode</li>
                      <li>• Messages and API calls are for OpenAI processing (cheaper)</li>
                      <li>• Wallet credits handle overages at per-workspace rates</li>
                      <li>• You can mix different plans across workspaces</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeView === 'invoices' && (
                <div className="text-center py-12">
                  <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Invoices Coming Soon</h3>
                  <p className="text-gray-600">Workspace-based invoicing will be available shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}