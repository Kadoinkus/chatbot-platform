'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import { 
  getClientBilling, 
  calculateTotalMonthlyCost, 
  predictCreditUsage,
  getSubscriptionPlans,
  getCreditPricing,
  updateBotBilling,
  purchaseCredits,
  type ClientBilling,
  type BotBilling 
} from '@/lib/billingService';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle, ChevronDown,
  Download, Plus, Wallet, Package, Activity, Table, Grid3X3,
  DollarSign, Calendar, Bot, BarChart3, Settings, Check, X,
  Users, MessageCircle, Server, Eye, EyeOff, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import type { Client, Mascot } from '@/lib/data';

export default function BillingPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [billingData, setBillingData] = useState<ClientBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedBots, setExpandedBots] = useState<Set<string>>(new Set());
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, {
    model: 'subscription' | 'credits';
    tier?: 'basic' | 'premium' | 'enterprise';
  }>>({});

  useEffect(() => {
    async function loadData() {
      // Find client with mascots
      const clientData = clients.find(c => c.id === params.clientId);
      setClient(clientData);
      
      // Load billing data
      const billing = await getClientBilling(params.clientId);
      setBillingData(billing);
      
      setLoading(false);
    }
    loadData();
  }, [params.clientId]);

  const handleBillingChange = (botId: string, model: 'subscription' | 'credits', tier?: 'basic' | 'premium' | 'enterprise') => {
    setPendingChanges(prev => ({
      ...prev,
      [botId]: { model, tier }
    }));
  };

  const saveBillingChanges = async (botId: string) => {
    const change = pendingChanges[botId];
    if (!change) return;

    const success = await updateBotBilling(params.clientId, botId, change.model, change.tier);
    if (success) {
      setSaveSuccess(botId);
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[botId];
        return newChanges;
      });
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handlePurchaseCredits = async () => {
    const result = await purchaseCredits(params.clientId, creditAmount);
    if (result.success && billingData) {
      setBillingData({
        ...billingData,
        balance: result.newBalance
      });
      setShowBuyCredits(false);
      setSaveSuccess('credits');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const toggleBotExpansion = (botId: string) => {
    setExpandedBots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(botId)) {
        newSet.delete(botId);
      } else {
        newSet.add(botId);
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading billing data...</p>
            </div>
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
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No billing data found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalCosts = calculateTotalMonthlyCost(billingData);
  const costTrend = totalCosts.total > 1500 ? 'up' : 'down';
  const costChange = Math.abs((totalCosts.total - 1500) / 1500 * 100);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
              <p className="text-gray-600">Manage costs and monitor usage across all bots</p>
            </div>
            <button 
              onClick={() => setShowBuyCredits(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={18} />
              Buy Credits
            </button>
          </div>
          
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Monthly Cost</span>
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">${totalCosts.total.toFixed(2)}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${costTrend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                {costTrend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {costChange.toFixed(1)}% from last month
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Subscriptions</span>
                <Package size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold">${totalCosts.subscriptions.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalCosts.breakdown.filter(b => b.type === 'subscription').length} active plans
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Credit Usage</span>
                <Wallet size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold">${totalCosts.credits.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">This month so far</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Credit Balance</span>
                <Wallet size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-bold">${billingData.balance.toFixed(2)}</p>
              {billingData.autoRecharge.enabled && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-recharge at ${billingData.autoRecharge.threshold}
                </p>
              )}
            </div>
          </div>
          
          {/* Bot Management Section */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Bot Billing Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure billing for {client.mascots.length} bots
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                      title="Card view"
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                      title="Table view"
                    >
                      <Table size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {client.mascots.map(mascot => {
                    const botBilling = billingData.bots[mascot.id];
                    const isExpanded = expandedBots.has(mascot.id);
                    const hasChanges = pendingChanges[mascot.id] !== undefined;
                    const predictions = botBilling ? predictCreditUsage(botBilling) : null;
                    
                    if (!botBilling) return null;
                    
                    return (
                      <div key={mascot.id} className={`border rounded-lg transition-all ${
                        hasChanges ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                      }`}>
                        <div className="p-4">
                          {/* Bot Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={mascot.image} 
                                alt={mascot.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  {mascot.name}
                                  {saveSuccess === mascot.id && (
                                    <CheckCircle size={16} className="text-green-500" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">{mascot.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleBotExpansion(mascot.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                              <p className="text-lg font-semibold">
                                ${botBilling.billingModel === 'subscription' 
                                  ? botBilling.monthlyPrice 
                                  : botBilling.usage.currentMonthCost.toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">
                                {botBilling.billingModel === 'subscription' ? 'Plan' : 'Credits'}
                              </p>
                              <p className="text-lg font-semibold">
                                {botBilling.billingModel === 'subscription' 
                                  ? botBilling.subscriptionTier 
                                  : `$${botBilling.credits.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                          
                          {/* Usage Bars */}
                          {botBilling.billingModel === 'subscription' && (
                            <div className="space-y-2 mb-4">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Bundle Loads</span>
                                  <span>{botBilling.usage.bundleLoads} / {botBilling.usage.bundleLimit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      (botBilling.usage.bundleLoads / botBilling.usage.bundleLimit * 100) < 70 
                                        ? 'bg-green-500' 
                                        : (botBilling.usage.bundleLoads / botBilling.usage.bundleLimit * 100) < 90 
                                          ? 'bg-yellow-500' 
                                          : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(100, botBilling.usage.bundleLoads / botBilling.usage.bundleLimit * 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Messages</span>
                                  <span>{(botBilling.usage.chatMessages / 1000).toFixed(1)}k / {(botBilling.usage.chatLimit / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      (botBilling.usage.chatMessages / botBilling.usage.chatLimit * 100) < 70 
                                        ? 'bg-blue-500' 
                                        : (botBilling.usage.chatMessages / botBilling.usage.chatLimit * 100) < 90 
                                          ? 'bg-yellow-500' 
                                          : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(100, botBilling.usage.chatMessages / botBilling.usage.chatLimit * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Credit predictions */}
                          {botBilling.billingModel === 'credits' && predictions && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                                <div className="text-xs">
                                  <p className="font-medium text-yellow-900">
                                    Credits will last ~{predictions.daysRemaining} days
                                  </p>
                                  <p className="text-yellow-700">
                                    Monthly estimate: ${predictions.estimatedMonthlyCost}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t pt-4 mt-4 space-y-4">
                              {/* Billing Model Selection */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Billing Model</label>
                                <select
                                  value={pendingChanges[mascot.id]?.model || botBilling.billingModel}
                                  onChange={(e) => {
                                    const model = e.target.value as 'subscription' | 'credits';
                                    handleBillingChange(mascot.id, model, model === 'subscription' ? 'basic' : undefined);
                                  }}
                                  className="w-full p-2 border border-gray-200 rounded-lg"
                                >
                                  <option value="subscription">Monthly Subscription</option>
                                  <option value="credits">Pay with Credits</option>
                                </select>
                              </div>
                              
                              {/* Subscription Tier Selection */}
                              {(pendingChanges[mascot.id]?.model || botBilling.billingModel) === 'subscription' && (
                                <div>
                                  <label className="block text-sm font-medium mb-2">Subscription Tier</label>
                                  <select
                                    value={pendingChanges[mascot.id]?.tier || botBilling.subscriptionTier || 'basic'}
                                    onChange={(e) => {
                                      const tier = e.target.value as 'basic' | 'premium' | 'enterprise';
                                      handleBillingChange(mascot.id, 'subscription', tier);
                                    }}
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                  >
                                    <option value="basic">Basic ($99/mo)</option>
                                    <option value="premium">Premium ($299/mo)</option>
                                    <option value="enterprise">Enterprise ($999/mo)</option>
                                  </select>
                                </div>
                              )}
                              
                              {/* Save Button */}
                              {hasChanges && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveBillingChanges(mascot.id)}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                  >
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPendingChanges(prev => {
                                        const newChanges = { ...prev };
                                        delete newChanges[mascot.id];
                                        return newChanges;
                                      });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Bot</th>
                        <th className="text-left py-2 px-3">Model</th>
                        <th className="text-left py-2 px-3">Plan/Credits</th>
                        <th className="text-right py-2 px-3">Monthly Cost</th>
                        <th className="text-right py-2 px-3">Usage</th>
                        <th className="text-center py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.mascots.map(mascot => {
                        const botBilling = billingData.bots[mascot.id];
                        if (!botBilling) return null;
                        
                        return (
                          <tr key={mascot.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <img src={mascot.image} alt={mascot.name} className="w-8 h-8 rounded-full" />
                                <div>
                                  <p className="font-medium">{mascot.name}</p>
                                  <p className="text-xs text-gray-600">{mascot.status}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                botBilling.billingModel === 'subscription'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {botBilling.billingModel}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {botBilling.billingModel === 'subscription'
                                ? botBilling.subscriptionTier
                                : `$${botBilling.credits.toFixed(2)}`}
                            </td>
                            <td className="py-3 px-3 text-right font-medium">
                              ${botBilling.billingModel === 'subscription'
                                ? botBilling.monthlyPrice
                                : botBilling.usage.currentMonthCost.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="text-xs">
                                <p>{botBilling.usage.bundleLoads} loads</p>
                                <p>{(botBilling.usage.chatMessages / 1000).toFixed(1)}k msgs</p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Link
                                href={`/app/${params.clientId}/bot/${mascot.id}/analytics`}
                                className="text-sm text-black hover:underline"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Invoices</h2>
                <button className="text-sm text-black hover:underline">View All</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {billingData.invoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </span>
                      <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle size={18} />
          {saveSuccess === 'credits' ? 'Credits purchased successfully!' : 'Changes saved successfully!'}
        </div>
      )}
      
      {/* Buy Credits Modal */}
      {showBuyCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Buy Credits</h2>
                <button 
                  onClick={() => setShowBuyCredits(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Amount</label>
                <div className="grid grid-cols-2 gap-2">
                  {[50, 100, 250, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCreditAmount(amount)}
                      className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                        creditAmount === amount
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      ${amount}
                      {amount >= 250 && (
                        <div className="text-xs mt-1">
                          {amount === 250 && 'Save 5%'}
                          {amount === 500 && 'Save 10%'}
                          {amount === 1000 && 'Save 15%'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Balance:</span>
                  <span className="font-medium">${billingData.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>After Purchase:</span>
                  <span className="font-bold">${(billingData.balance + creditAmount).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBuyCredits(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseCredits}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Purchase ${creditAmount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}