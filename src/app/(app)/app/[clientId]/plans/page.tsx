'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId } from '@/lib/dataService';
import type { Client, Workspace } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { 
  CheckCircle, Package, Activity, Users,
  DollarSign, Settings, Check, X,
  MessageCircle, Server, Info, 
  Star, Shield, Zap, Crown
} from 'lucide-react';

export default function PlansPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
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
            <p className="text-gray-600">Client not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={params.clientId} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">Select the perfect plan for your workspace needs. Each workspace can have its own plan.</p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start mb-8">
            {[
              {
                tier: 'starter',
                name: 'Starter',
                price: 99,
                currency: 'EUR',
                mascotSlots: 1,
                sharedLimits: {
                  bundleLoads: 1000,
                  chatMessages: 25000,
                  apiCalls: 50000,
                  storage: '50MB'
                },
                features: [
                  '1 mascot slot',
                  'Basic Q&A chatflow',
                  '0.1MB knowledgebase',
                  'Basic templates only',
                  'Email support',
                  'Basic analytics',
                  'Standard chat widget',
                  'Basic security & encryption'
                ]
              },
              {
                tier: 'basic',
                name: 'Basic',
                price: 299,
                currency: 'EUR',
                mascotSlots: 2,
                sharedLimits: {
                  bundleLoads: 5000,
                  chatMessages: 100000,
                  apiCalls: 250000,
                  storage: '200MB'
                },
                features: [
                  '2 mascot slots',
                  'Basic chatflow templates',
                  '0.5MB knowledgebase',
                  'Basic + Pro templates',
                  'Priority support',
                  'Advanced analytics',
                  'Custom branded widget',
                  'Enhanced security & compliance'
                ]
              },
              {
                tier: 'premium',
                name: 'Premium',
                price: 2499,
                currency: 'EUR',
                mascotSlots: 5,
                sharedLimits: {
                  bundleLoads: 25000,
                  chatMessages: 500000,
                  apiCalls: 1000000,
                  storage: '2GB'
                },
                features: [
                  'Up to 5 mascot slots',
                  'Advanced chatflows',
                  '5MB knowledgebase',
                  'Basic + Pro templates',
                  '24/7 phone support',
                  'Custom analytics dashboard',
                  'White-label solution',
                  'Advanced security & audit logs'
                ]
              },
              {
                tier: 'enterprise',
                name: 'Enterprise',
                price: 0,
                currency: 'EUR',
                mascotSlots: 10,
                sharedLimits: {
                  bundleLoads: 100000,
                  chatMessages: 2000000,
                  apiCalls: 5000000,
                  storage: '10GB'
                },
                features: [
                  'Up to 10 mascot slots',
                  'Custom chatflows',
                  '20MB knowledgebase',
                  'All templates + custom design',
                  'Dedicated account manager',
                  'Custom analytics dashboard',
                  'On-premise deployment options',
                  'Enterprise-grade security & SLA'
                ]
              }
            ].map((planConfig) => (
              <div 
                key={planConfig.tier} 
                className={`relative rounded-xl border-2 p-6 ${
                  planConfig.tier === 'premium'
                    ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  display: 'grid',
                  gridTemplateRows: 'auto auto 1fr auto',
                  height: '750px'
                }}
              >
                {/* Header Section */}
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
                        €{planConfig.price}
                        <span className="text-lg text-gray-600 font-normal">/month</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{planConfig.mascotSlots} mascot slot{planConfig.mascotSlots !== 1 ? 's' : ''}</p>
                </div>

                {/* Resource Pool Section */}
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

                {/* Key Features */}
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

                {/* Buttons Section */}
                <div className="mt-6 space-y-2">
                  {planConfig.tier === 'enterprise' ? (
                    <button 
                      onClick={() => console.log('Contact sales for Enterprise')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-medium hover:from-gray-900 hover:to-gray-800 transition-colors"
                    >
                      Contact Sales
                    </button>
                  ) : (
                    <button 
                      onClick={() => console.log(`Assign ${planConfig.tier} to workspace`)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        planConfig.tier === 'basic'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : planConfig.tier === 'premium'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      Assign to Workspace
                    </button>
                  )}
                  
                  <button className="w-full py-1 px-4 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
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

          {/* Credit Pricing Info */}
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
      </main>
    </div>
  );
}