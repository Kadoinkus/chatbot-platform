'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import { 
  getClientBillingV2,
  calculateTotalMonthlyCostV2,
  calculateSharedPoolUsage,
  canAddMascot,
  BILLING_CONFIG,
  type ClientBillingV2,
  type ClientSubscription
} from '@/lib/billingService';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Download, Plus, Wallet, Package, Activity, Users, Sparkles,
  DollarSign, Calendar, Bot, BarChart3, Settings, Check, X, Palette,
  MessageCircle, Server, Eye, Info, ArrowUpRight, ArrowDownRight,
  Star, Shield, Zap, Crown, Gift, ShoppingBag, PieChart, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function BillingPage({ params }: { params: { clientId: string } }) {
  const [billingData, setBillingData] = useState<ClientBillingV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'usage' | 'plans' | 'marketplace' | 'invoices'>('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddMascotModal, setShowAddMascotModal] = useState(false);
  const [expandedMascots, setExpandedMascots] = useState<Set<string>>(new Set());

  const client = clients.find(c => c.id === params.clientId);

  useEffect(() => {
    async function loadData() {
      const billing = await getClientBillingV2(params.clientId);
      setBillingData(billing);
      setLoading(false);
    }
    loadData();
  }, [params.clientId]);

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

  if (!client || !billingData) {
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

  const costs = calculateTotalMonthlyCostV2(billingData);
  const poolUsage = billingData.subscription ? 
    calculateSharedPoolUsage(billingData.subscription, billingData.mascots) : null;
  const mascotSlots = canAddMascot(billingData);
  const plan = billingData.subscription?.plan || null;

  const toggleMascotExpansion = (mascotId: string) => {
    setExpandedMascots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mascotId)) {
        newSet.delete(mascotId);
      } else {
        newSet.add(mascotId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={params.clientId} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
              <p className="text-gray-600">
                {plan ? `${plan.name} Plan with ${billingData.mascots.length} mascot${billingData.mascots.length !== 1 ? 's' : ''}` : 'Credit-based billing'}
              </p>
            </div>
            <div className="flex gap-3">
              {plan && plan.tier !== 'enterprise' && (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2"
                >
                  <ArrowUpRight size={18} />
                  Upgrade Plan
                </button>
              )}
              <button 
                onClick={() => setShowAddMascotModal(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={18} />
                Add Mascot
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">${costs.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Projected: ${costs.projectedTotal.toFixed(2)}
              </p>
            </div>

            {plan && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Mascot Slots</span>
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {billingData.subscription?.mascotIds.length || 0}/{plan.mascotSlots}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mascotSlots.availableSlots} available
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Bundle Usage</span>
                    <Server size={16} className="text-green-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {poolUsage ? `${poolUsage.totalUsage.bundleLoadsPercent.toFixed(0)}%` : '0%'}
                  </p>
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        poolUsage && poolUsage.totalUsage.bundleLoadsPercent > 90 ? 'bg-red-500' :
                        poolUsage && poolUsage.totalUsage.bundleLoadsPercent > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${poolUsage?.totalUsage.bundleLoadsPercent || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Message Usage</span>
                    <MessageCircle size={16} className="text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {poolUsage ? `${poolUsage.totalUsage.chatMessagesPercent.toFixed(0)}%` : '0%'}
                  </p>
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        poolUsage && poolUsage.totalUsage.chatMessagesPercent > 90 ? 'bg-red-500' :
                        poolUsage && poolUsage.totalUsage.chatMessagesPercent > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${poolUsage?.totalUsage.chatMessagesPercent || 0}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Credit Balance</span>
                <Wallet size={16} className="text-orange-400" />
              </div>
              <p className="text-2xl font-bold">${billingData.creditBalance.toFixed(2)}</p>
              {billingData.autoRecharge.enabled && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-recharge at ${billingData.autoRecharge.threshold}
                </p>
              )}
            </div>
          </div>

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
                onClick={() => setActiveView('usage')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'usage' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Usage Details
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
                onClick={() => setActiveView('marketplace')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeView === 'marketplace' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Marketplace
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
                  {/* Current Plan Details */}
                  {plan ? (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Crown size={20} />
                        Your {plan.name} Plan
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold">${plan.price}/month</span>
                            {plan.tier === 'enterprise' && (
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full">
                                ENTERPRISE
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {plan.features.map((feature, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Shared Resource Pool</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Bundle Loads</span>
                                <span>{poolUsage?.totalUsage.bundleLoads.toLocaleString()} / {plan.sharedLimits.bundleLoads.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                  style={{ width: `${Math.min(100, poolUsage?.totalUsage.bundleLoadsPercent || 0)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Chat Messages</span>
                                <span>{poolUsage?.totalUsage.chatMessages.toLocaleString()} / {plan.sharedLimits.chatMessages.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                                  style={{ width: `${Math.min(100, poolUsage?.totalUsage.chatMessagesPercent || 0)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Credit-Based Billing</p>
                      <p className="text-gray-600 mb-4">You're using pay-as-you-go credits for your mascots</p>
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Switch to Subscription
                      </button>
                    </div>
                  )}

                  {/* Mascot List */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Bot size={20} />
                      Active Mascots ({billingData.mascots.length})
                    </h3>
                    <div className="space-y-4">
                      {billingData.mascots.map(mascot => {
                        const isExpanded = expandedMascots.has(mascot.id);
                        const isSubscription = mascot.billingModel === 'subscription';
                        
                        return (
                          <div key={mascot.id} className="border border-gray-200 rounded-lg">
                            <div 
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleMascotExpansion(mascot.id)}
                            >
                              <div className="flex items-center gap-4">
                                <img 
                                  src={client?.mascots.find(m => m.id === mascot.id)?.image || mascot.image || mascot.template.image} 
                                  alt={mascot.name}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div>
                                  <p className="font-medium flex items-center gap-2">
                                    {mascot.name}
                                    {mascot.template.type === 'custom' && (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                        CUSTOM
                                      </span>
                                    )}
                                    {mascot.template.type === 'premium' && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                        PREMIUM
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {mascot.template.name} • {isSubscription ? 'Subscription' : 'Credits'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {mascot.template.monthlyFee > 0 && (
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">Template fee</p>
                                    <p className="font-medium">${mascot.template.monthlyFee}/mo</p>
                                  </div>
                                )}
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Usage</p>
                                  <p className="font-medium">
                                    {mascot.currentUsage.bundleLoads.toLocaleString()} loads
                                  </p>
                                </div>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Template Details</p>
                                    <div className="space-y-1 text-sm">
                                      <p>Artist: {mascot.template.artistName}</p>
                                      <p>Animations: {mascot.template.animations}</p>
                                      <p className="flex items-center gap-1">
                                        Rating: 
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                        {mascot.template.rating}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Current Usage</p>
                                    <div className="space-y-1 text-sm">
                                      <p>Bundle Loads: {mascot.currentUsage.bundleLoads.toLocaleString()}</p>
                                      <p>Messages: {mascot.currentUsage.chatMessages.toLocaleString()}</p>
                                      <p>API Calls: {mascot.currentUsage.apiCalls.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Asset Packs</p>
                                    {mascot.purchasedAssetPacks.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {mascot.purchasedAssetPacks.map(pack => (
                                          <span key={pack} className="px-2 py-1 bg-white rounded text-xs">
                                            {pack}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No asset packs purchased</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <PieChart size={20} />
                      Monthly Cost Breakdown
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        {costs.breakdown.subscriptionBase > 0 && (
                          <div className="flex justify-between">
                            <span>Base Subscription</span>
                            <span className="font-medium">${costs.breakdown.subscriptionBase.toFixed(2)}</span>
                          </div>
                        )}
                        {costs.breakdown.templateFees.length > 0 && (
                          <>
                            <div className="border-t pt-3">
                              <p className="text-sm text-gray-600 mb-2">Template Fees:</p>
                              {costs.breakdown.templateFees.map(fee => (
                                <div key={fee.templateId} className="flex justify-between pl-4 mb-1">
                                  <span className="text-sm">{fee.templateName}</span>
                                  <span className="text-sm">${fee.fee.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {costs.breakdown.creditUsage > 0 && (
                          <div className="flex justify-between">
                            <span>Credit Usage</span>
                            <span className="font-medium">${costs.breakdown.creditUsage.toFixed(2)}</span>
                          </div>
                        )}
                        {costs.breakdown.assetPurchases > 0 && (
                          <div className="flex justify-between">
                            <span>Asset Purchases</span>
                            <span className="font-medium">${costs.breakdown.assetPurchases.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${costs.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'usage' && poolUsage && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Shared Resource Pool Usage</h3>
                    
                    {/* Usage Warnings */}
                    {poolUsage.warnings.length > 0 && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-900 mb-1">Usage Warnings</p>
                            <ul className="text-sm text-yellow-800 space-y-1">
                              {poolUsage.warnings.map((warning, i) => (
                                <li key={i}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Per-Mascot Usage Breakdown */}
                    <div className="space-y-4">
                      {poolUsage.perMascot.map(mascotUsage => {
                        const mascot = billingData.mascots.find(m => m.id === mascotUsage.mascotId);
                        if (!mascot) return null;

                        return (
                          <div key={mascotUsage.mascotId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={client?.mascots.find(m => m.id === mascot.id)?.image || mascot.image || mascot.template.image} 
                                  alt={mascot.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <p className="font-medium">{mascot.name}</p>
                                  <p className="text-sm text-gray-600">{mascot.template.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">% of total usage</p>
                                <p className="font-medium">
                                  {((mascotUsage.percentOfTotal.bundleLoads + 
                                     mascotUsage.percentOfTotal.chatMessages) / 2).toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Bundle Loads</p>
                                <p className="font-medium text-sm">
                                  {mascotUsage.usage.bundleLoads.toLocaleString()}
                                </p>
                                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500"
                                    style={{ width: `${mascotUsage.percentOfTotal.bundleLoads}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Chat Messages</p>
                                <p className="font-medium text-sm">
                                  {mascotUsage.usage.chatMessages.toLocaleString()}
                                </p>
                                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-500"
                                    style={{ width: `${mascotUsage.percentOfTotal.chatMessages}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">API Calls</p>
                                <p className="font-medium text-sm">
                                  {mascotUsage.usage.apiCalls.toLocaleString()}
                                </p>
                                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500"
                                    style={{ width: `${mascotUsage.percentOfTotal.apiCalls}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Usage Allocation Settings */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Usage Allocation Settings</h4>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Configure Limits
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Set soft limits for each mascot to prevent one from consuming all resources.
                        Currently using automatic distribution based on usage patterns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'plans' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
                    <p className="text-gray-600">Select the perfect plan for your mascot needs</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {Object.values(BILLING_CONFIG.plans).map((planConfig) => {
                      const isCurrentPlan = plan?.tier === planConfig.tier;
                      const tierOrder = ['starter', 'basic', 'premium', 'enterprise'];
                      const currentIndex = plan ? tierOrder.indexOf(plan.tier) : -1;
                      const planIndex = tierOrder.indexOf(planConfig.tier);
                      const canUpgrade = !plan || (currentIndex >= 0 && planIndex > currentIndex);
                      const canDowngrade = plan && currentIndex > planIndex;
                      
                      return (
                        <div 
                          key={planConfig.tier} 
                          className={`relative rounded-xl border-2 p-6 ${
                            isCurrentPlan 
                              ? 'border-black bg-gray-50' 
                              : planConfig.tier === 'premium'
                              ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            display: 'grid',
                            gridTemplateRows: 'auto auto 1fr auto',
                            height: '750px'
                          }}
                        >
                          {isCurrentPlan && (
                            <div className="absolute -top-3 right-3">
                              <span className="bg-black text-white px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle size={12} />
                                CURRENT
                              </span>
                            </div>
                          )}

                          {/* Header Section - Grid Row 1 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              {planConfig.tier === 'starter' && <Package size={24} className="text-green-600" />}
                              {planConfig.tier === 'basic' && <Zap size={24} className="text-blue-600" />}
                              {planConfig.tier === 'premium' && <Crown size={24} className="text-purple-600" />}
                              {planConfig.tier === 'enterprise' && <Shield size={24} className="text-gray-800" />}
                            </div>
                            <h4 className="text-xl font-bold mb-1">{planConfig.name}</h4>
                            <div className="text-3xl font-bold mb-1">
                              {planConfig.price === 0 ? (
                                <span className="text-2xl">Price on Request</span>
                              ) : (
                                <>
                                  {planConfig.currency === 'EUR' ? '€' : '$'}{planConfig.price}
                                  <span className="text-lg text-gray-600 font-normal">/month</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{planConfig.mascotSlots} mascot slot{planConfig.mascotSlots !== 1 ? 's' : ''}</p>
                          </div>

                          {/* Resource Pool Section - Grid Row 2 */}
                          <div className="mt-6">
                            <p className="font-medium text-sm text-gray-700 mb-3">Shared Resource Pool:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Server size={12} className="text-blue-600" />
                                  <span className="text-xs text-blue-700 font-medium">Bundle Loads</span>
                                </div>
                                <span className="text-xs font-bold text-blue-900">{planConfig.sharedLimits.bundleLoads.toLocaleString()}</span>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageCircle size={12} className="text-purple-600" />
                                  <span className="text-xs text-purple-700 font-medium">Messages</span>
                                </div>
                                <span className="text-xs font-bold text-purple-900">{planConfig.sharedLimits.chatMessages.toLocaleString()}</span>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity size={12} className="text-green-600" />
                                  <span className="text-xs text-green-700 font-medium">API Calls</span>
                                </div>
                                <span className="text-xs font-bold text-green-900">{planConfig.sharedLimits.apiCalls.toLocaleString()}</span>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Server size={12} className="text-orange-600" />
                                  <span className="text-xs text-orange-700 font-medium">Storage</span>
                                </div>
                                <span className="text-xs font-bold text-orange-900">{planConfig.sharedLimits.storage}</span>
                              </div>
                            </div>
                          </div>

                          {/* Key Features - Grid Row 3 (flexible) */}
                          <div className="mt-6">
                            <p className="font-medium text-sm text-gray-700 mb-2">Key Features:</p>
                            <ul className="space-y-1">
                              {planConfig.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Buttons Section - Grid Row 4 (fixed at bottom) */}
                          <div className="mt-6 space-y-2">
                            {isCurrentPlan ? (
                              <button 
                                disabled
                                className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                              >
                                Current Plan
                              </button>
                            ) : planConfig.tier === 'enterprise' ? (
                              <button 
                                onClick={() => console.log('Contact sales for Enterprise')}
                                className="w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-medium hover:from-gray-900 hover:to-gray-800 transition-colors"
                              >
                                Contact Sales
                              </button>
                            ) : canUpgrade ? (
                              <button 
                                onClick={() => console.log(`Upgrade to ${planConfig.tier}`)}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                  planConfig.tier === 'basic'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : planConfig.tier === 'premium'
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-black text-white hover:bg-gray-800'
                                }`}
                              >
                                Upgrade to {planConfig.name}
                              </button>
                            ) : canDowngrade ? (
                              <button 
                                onClick={() => console.log(`Downgrade to ${planConfig.tier}`)}
                                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                              >
                                Downgrade to {planConfig.name}
                              </button>
                            ) : (
                              <button 
                                onClick={() => console.log(`Switch to ${planConfig.tier}`)}
                                className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                              >
                                Select {planConfig.name}
                              </button>
                            )}
                            
                            <button className="w-full py-1 px-4 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                              Learn More
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                      <Info size={20} className="text-blue-600" />
                      Detailed Plan Comparison
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="text-left py-4 px-4 font-semibold text-gray-800 rounded-tl-lg w-2/5">Feature</th>
                            <th className="text-center py-4 px-2 font-semibold text-gray-800 w-36">
                              <div className="flex flex-col items-center gap-1">
                                <Package size={16} className="text-green-600" />
                                <span>Starter</span>
                                <span className="text-xs font-normal text-gray-600">$99/mo</span>
                              </div>
                            </th>
                            <th className="text-center py-4 px-2 font-semibold text-gray-800 w-36">
                              <div className="flex flex-col items-center gap-1">
                                <Zap size={16} className="text-blue-600" />
                                <span>Basic</span>
                                <span className="text-xs font-normal text-gray-600">$299/mo</span>
                              </div>
                            </th>
                            <th className="text-center py-4 px-2 font-semibold text-gray-800 w-36">
                              <div className="flex flex-col items-center gap-1">
                                <Crown size={16} className="text-purple-600" />
                                <span>Premium</span>
                                <span className="text-xs font-normal text-gray-600">€2499/mo</span>
                              </div>
                            </th>
                            <th className="text-center py-4 px-2 font-semibold text-gray-800 rounded-tr-lg w-36">
                              <div className="flex flex-col items-center gap-1">
                                <Shield size={16} className="text-gray-700" />
                                <span>Enterprise</span>
                                <span className="text-xs font-normal text-gray-600">Custom</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Mascot Slots</td>
                            <td className="text-center py-4 px-2 text-gray-600">1</td>
                            <td className="text-center py-4 px-2 text-gray-600">2</td>
                            <td className="text-center py-4 px-2 text-gray-600">5</td>
                            <td className="text-center py-4 px-2 text-gray-600">10</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Bundle Loads (Shared)</td>
                            <td className="text-center py-4 px-2 text-gray-600">1,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">5,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">25,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">100,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Chat Messages (Shared)</td>
                            <td className="text-center py-4 px-2 text-gray-600">25,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">100,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">500,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">2,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">API Calls (Shared)</td>
                            <td className="text-center py-4 px-2 text-gray-600">50,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">250,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">1,000,000</td>
                            <td className="text-center py-4 px-2 text-gray-600">5,000,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Storage</td>
                            <td className="text-center py-4 px-2 text-gray-600">50MB</td>
                            <td className="text-center py-4 px-2 text-gray-600">200MB</td>
                            <td className="text-center py-4 px-2 text-gray-600">2GB</td>
                            <td className="text-center py-4 px-2 text-gray-600">10GB</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Knowledgebase Size</td>
                            <td className="text-center py-4 px-2 text-gray-600">0.1MB</td>
                            <td className="text-center py-4 px-2 text-gray-600">0.5MB</td>
                            <td className="text-center py-4 px-2 text-gray-600">5MB</td>
                            <td className="text-center py-4 px-2 text-gray-600">20MB</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Chatflows</td>
                            <td className="text-center py-4 px-2 text-gray-600">Basic Q&A</td>
                            <td className="text-center py-4 px-2 text-gray-600">Templates</td>
                            <td className="text-center py-4 px-2 text-gray-600">Advanced</td>
                            <td className="text-center py-4 px-2 text-gray-600">Custom</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Templates Included</td>
                            <td className="text-center py-4 px-2 text-gray-600">Basic only</td>
                            <td className="text-center py-4 px-2 text-green-600 font-medium">Basic + Pro</td>
                            <td className="text-center py-4 px-2 text-green-600 font-medium">Basic + Pro</td>
                            <td className="text-center py-4 px-2 text-green-600 font-medium">Basic + Pro</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Marketplace Access</td>
                            <td className="text-center py-4 px-2 text-green-600">
                              <Check size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-green-600">
                              <Check size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-green-600">
                              <Check size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-green-600">
                              <Check size={16} className="mx-auto" />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Custom Mascot Design</td>
                            <td className="text-center py-4 px-2 text-red-500">
                              <X size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-red-500">
                              <X size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-red-500">
                              <X size={16} className="mx-auto" />
                            </td>
                            <td className="text-center py-4 px-2 text-green-600">
                              <Check size={16} className="mx-auto" />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Security Level</td>
                            <td className="text-center py-4 px-2 text-gray-600">Basic</td>
                            <td className="text-center py-4 px-2 text-gray-600">Enhanced</td>
                            <td className="text-center py-4 px-2 text-gray-600">Advanced</td>
                            <td className="text-center py-4 px-2 text-gray-600">Enterprise</td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700">Support</td>
                            <td className="text-center py-4 px-2 text-gray-600">Email</td>
                            <td className="text-center py-4 px-2 text-gray-600">Priority</td>
                            <td className="text-center py-4 px-2 text-gray-600">24/7 Phone</td>
                            <td className="text-center py-4 px-2 text-gray-600">Dedicated Manager</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap size={20} className="text-blue-600" />
                      Need More Flexibility?
                    </h4>
                    <p className="text-gray-700 mb-4">
                      You can always add credit-based mascots to any plan for overflow capacity or specialized use cases.
                    </p>
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <p className="font-medium">Credit Pricing:</p>
                        <p className="text-gray-600">Bundle Loads: $0.04 each • Messages: $0.0015 each • API Calls: $0.0001 each</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'marketplace' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Marketplace Purchases</h3>
                    <Link 
                      href={`/app/${params.clientId}/marketplace`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Browse Marketplace →
                    </Link>
                  </div>

                  {billingData.marketplacePurchases.length > 0 ? (
                    <div className="space-y-4">
                      {billingData.marketplacePurchases.map(purchase => (
                        <div key={purchase.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            {purchase.type === 'template_subscription' ? (
                              <Palette size={24} className="text-purple-500" />
                            ) : (
                              <ShoppingBag size={24} className="text-blue-500" />
                            )}
                            <div>
                              <p className="font-medium">{purchase.itemName}</p>
                              <p className="text-sm text-gray-600">
                                by {purchase.artistName} • {new Date(purchase.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${purchase.amount}</p>
                            {purchase.recurring && (
                              <p className="text-xs text-gray-600">Monthly</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No marketplace purchases yet</p>
                      <Link 
                        href={`/app/${params.clientId}/marketplace`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Browse Templates
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'invoices' && (
                <div className="space-y-4">
                  {billingData.invoices.map(invoice => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${invoice.amount.toFixed(2)}</p>
                          <span className={`px-2 py-1 text-xs rounded ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {invoice.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.description}</span>
                            <span>${item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}