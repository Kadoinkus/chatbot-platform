'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle, 
  Download, Plus, Wallet, Package, Activity, 
  DollarSign, Calendar, Bot, BarChart3, Settings, Store,
  Users, MessageCircle, Server
} from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/lib/dataService';

export default function BillingPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [billingModel, setBillingModel] = useState('prepaid');
  const [showAddCredits, setShowAddCredits] = useState(false);
  
  const [billingData] = useState({
    balance: 2450.00,
    monthlyUsage: 1823.45,
    subscriptions: [
      { id: 1, name: 'Pro Plan - Liza', price: 299, status: 'active', renewal: '2024-02-15' },
      { id: 2, name: 'Starter - Remco', price: 99, status: 'active', renewal: '2024-02-15' }
    ],
    purchasedTemplates: [
      { 
        id: 'template-1', 
        name: 'Customer Support Pro', 
        price: 29, 
        purchaseDate: '2024-01-15', 
        status: 'active',
        type: 'subscription'
      },
      { 
        id: 'template-6', 
        name: 'Education Tutor', 
        price: 35, 
        purchaseDate: '2024-01-20', 
        status: 'active',
        type: 'subscription'
      }
    ],
    mascotUsage: [
      { 
        id: 'liza', 
        name: 'Liza', 
        plan: 'Pro Plan',
        usage: 82,
        limit: 10000,
        conversations: 8234,
        apiCalls: 24521,
        bundleLoads: 823,
        bundleLimit: 1000,
        chatMessages: 42341,
        chatLimit: 50000,
        cost: 1245.32
      },
      { 
        id: 'remco', 
        name: 'Remco', 
        plan: 'Pay-as-you-go',
        usage: 45,
        limit: 5000,
        conversations: 2234,
        apiCalls: 8932,
        bundleLoads: 445,
        bundleLimit: 500,
        chatMessages: 18932,
        chatLimit: 25000,
        cost: 578.13
      }
    ],
    invoices: [
      { id: 'INV-001', date: '2024-01-01', amount: 398.00, status: 'paid' },
      { id: 'INV-002', date: '2024-01-15', amount: 125.00, status: 'paid' },
      { id: 'INV-003', date: '2024-02-01', amount: 398.00, status: 'pending' }
    ]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const clientData = await getClientById(params.clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  const getUsageColor = (usage: number) => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
              <p className="text-gray-600">Manage your subscription, credits, and usage limits</p>
            </div>
            <button 
              onClick={() => setShowAddCredits(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Credits
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Balance</span>
                <Wallet size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">${billingData.balance.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Prepaid credits</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Usage</span>
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold">${billingData.monthlyUsage.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">-12% from last month</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Subscriptions</span>
                <Package size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold">{billingData.subscriptions.length}</p>
              <p className="text-xs text-gray-500 mt-1">$398/month total</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Mascots</span>
                <Bot size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{billingData.mascotUsage.length}</p>
              <p className="text-xs text-gray-500 mt-1">All operational</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex gap-6 p-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'overview' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'usage' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mascot Usage
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'plans' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Billing Plans
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'payment' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'invoices' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`pb-2 px-1 font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'purchases' 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Purchases
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Current Billing Model</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        billingModel === 'payg' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input 
                          type="radio" 
                          name="billing" 
                          checked={billingModel === 'payg'}
                          onChange={() => setBillingModel('payg')}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3 mb-2">
                          <Activity size={20} />
                          <p className="font-medium">Pay-as-you-go</p>
                        </div>
                        <p className="text-sm text-gray-600">Set daily/monthly limits per mascot</p>
                      </label>
                      
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        billingModel === 'subscription' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input 
                          type="radio" 
                          name="billing" 
                          checked={billingModel === 'subscription'}
                          onChange={() => setBillingModel('subscription')}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3 mb-2">
                          <Package size={20} />
                          <p className="font-medium">Subscription</p>
                        </div>
                        <p className="text-sm text-gray-600">All-inclusive monthly plans</p>
                      </label>
                      
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        billingModel === 'prepaid' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input 
                          type="radio" 
                          name="billing" 
                          checked={billingModel === 'prepaid'}
                          onChange={() => setBillingModel('prepaid')}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet size={20} />
                          <p className="font-medium">Prepaid Credits</p>
                        </div>
                        <p className="text-sm text-gray-600">Load wallet with credits</p>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                        <DollarSign size={20} className="mb-2 text-gray-600" />
                        <p className="font-medium">Add Credits</p>
                        <p className="text-sm text-gray-600">Top up your balance</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                        <BarChart3 size={20} className="mb-2 text-gray-600" />
                        <p className="font-medium">Usage Report</p>
                        <p className="text-sm text-gray-600">Download detailed report</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                        <AlertCircle size={20} className="mb-2 text-gray-600" />
                        <p className="font-medium">Set Alerts</p>
                        <p className="text-sm text-gray-600">Configure notifications</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                        <Calendar size={20} className="mb-2 text-gray-600" />
                        <p className="font-medium">Billing Cycle</p>
                        <p className="text-sm text-gray-600">Change billing period</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'usage' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Mascot Usage & Limits</h3>
                    <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Last 3 Months</option>
                    </select>
                  </div>
                  
                  {billingData.mascotUsage.map((mascot) => (
                    <div key={mascot.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                          <div>
                            <p className="font-medium">{mascot.name}</p>
                            <p className="text-sm text-gray-600">{mascot.plan}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${mascot.cost}</p>
                          <p className="text-xs text-gray-600">this month</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Usage: {mascot.conversations} / {mascot.limit} conversations</span>
                          <span>{mascot.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(mascot.usage)}`}
                            style={{ width: `${mascot.usage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Bundle Loads */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Server size={14} className="text-gray-600" />
                              Bundle Loads (3D Experience)
                            </span>
                            <span>{mascot.bundleLoads.toLocaleString()} / {mascot.bundleLimit.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                (mascot.bundleLoads / mascot.bundleLimit * 100) < 70 ? 'bg-green-500' :
                                (mascot.bundleLoads / mascot.bundleLimit * 100) < 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, mascot.bundleLoads / mascot.bundleLimit * 100)}%` }}
                            />
                          </div>
                          {mascot.bundleLoads / mascot.bundleLimit > 0.9 && (
                            <p className="text-xs text-orange-600 mt-1">⚠️ 2D fallback active - bundle limit reached</p>
                          )}
                        </div>
                        
                        {/* Chat Messages */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} className="text-gray-600" />
                              Chat Messages
                            </span>
                            <span>{(mascot.chatMessages / 1000).toFixed(1)}k / {(mascot.chatLimit / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                (mascot.chatMessages / mascot.chatLimit * 100) < 70 ? 'bg-blue-500' :
                                (mascot.chatMessages / mascot.chatLimit * 100) < 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, mascot.chatMessages / mascot.chatLimit * 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="text-sm">
                            <span className="text-gray-600">Bandwidth cost: </span>
                            <span className="font-medium">${(mascot.bundleLoads * 0.05).toFixed(2)}</span>
                          </div>
                          <button className="text-sm text-black hover:underline">Adjust Limits</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'plans' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-2">Starter</h4>
                        <p className="text-3xl font-bold mb-4">$99<span className="text-sm text-gray-600">/month</span></p>
                        <ul className="space-y-2 mb-6">
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            500 bundle loads/month
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            25k chat messages
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Basic analytics
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            2D fallback included
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Email support
                          </li>
                        </ul>
                        <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          Select Plan
                        </button>
                      </div>
                      
                      <div className="border-2 border-black rounded-lg p-6 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs">
                          POPULAR
                        </div>
                        <h4 className="font-semibold text-lg mb-2">Pro</h4>
                        <p className="text-3xl font-bold mb-4">$299<span className="text-sm text-gray-600">/month</span></p>
                        <ul className="space-y-2 mb-6">
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            5,000 bundle loads/month
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            250k chat messages
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Advanced analytics
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Priority support
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Custom integrations
                          </li>
                        </ul>
                        <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                          Current Plan
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-2">Enterprise</h4>
                        <p className="text-3xl font-bold mb-4">Custom</p>
                        <ul className="space-y-2 mb-6">
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Unlimited bundle loads
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Unlimited chat messages
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Custom analytics
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            Dedicated support
                          </li>
                          <li className="text-sm flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            SLA guarantee
                          </li>
                        </ul>
                        <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          Contact Sales
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-gray-200 rounded" />
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Default</span>
                          <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                        </div>
                      </div>
                      
                      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600">
                        + Add Payment Method
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Billing Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-renewal</p>
                          <p className="text-sm text-gray-600">Automatically renew subscriptions</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto top-up</p>
                          <p className="text-sm text-gray-600">Add credits when balance is low</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Usage alerts</p>
                          <p className="text-sm text-gray-600">Email when reaching 80% of limit</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Invoice History</h3>
                    <button className="text-sm text-black hover:underline">Download All</button>
                  </div>
                  
                  <div className="space-y-3">
                    {billingData.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-600">{invoice.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {invoice.status}
                          </span>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'purchases' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Bot Template Purchases</h3>
                    <button className="text-sm text-black hover:underline">View All Orders</button>
                  </div>
                  
                  <div className="space-y-3">
                    {billingData.purchasedTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Bot size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-gray-600">Purchased on {template.purchaseDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${template.price}/month</p>
                            <p className="text-xs text-gray-600 capitalize">{template.type}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {template.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-gray-100 rounded" title="Manage">
                              <Settings size={16} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Download Receipt">
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Bot size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Need more bot templates?</h4>
                    <p className="text-sm text-gray-600 mb-4">Browse our marketplace for specialized bots</p>
                    <Link
                      href={`/app/${client.id}/marketplace`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      <Store size={16} />
                      Browse Marketplace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {showAddCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add Credits</h2>
              <p className="text-sm text-gray-600 mt-1">Top up your prepaid balance</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  <button className="p-2 border-2 border-black rounded-lg bg-gray-50">$100</button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:border-gray-300">$250</button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:border-gray-300">$500</button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:border-gray-300">$1000</button>
                </div>
                <input 
                  type="number" 
                  placeholder="Custom amount" 
                  className="w-full mt-2 p-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg">
                  <option>•••• 4242 (Default)</option>
                  <option>Add new card</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddCredits(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddCredits(false)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}