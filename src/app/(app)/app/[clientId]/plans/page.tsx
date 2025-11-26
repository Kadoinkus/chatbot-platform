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
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16">
          <div className="text-center p-8">
            <p className="text-foreground-secondary">Client not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar clientId={params.clientId} />

      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
            <p className="text-foreground-secondary">Select the perfect plan for your workspace needs. Each workspace can have its own plan.</p>
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
                className={`relative rounded-xl border-2 p-6 bg-surface-elevated ${
                  planConfig.tier === 'premium'
                    ? 'border-plan-premium-border bg-plan-premium-bg'
                    : 'border-border hover:border-border-secondary'
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
                    {planConfig.tier === 'starter' && <Package size={24} className="text-success-600 dark:text-success-500" />}
                    {planConfig.tier === 'basic' && <Zap size={24} className="text-info-600 dark:text-info-500" />}
                    {planConfig.tier === 'premium' && <Crown size={24} className="text-plan-premium-text" />}
                    {planConfig.tier === 'enterprise' && <Shield size={24} className="text-foreground" />}
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-1">{planConfig.name}</h4>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {planConfig.price === 0 ? (
                      <span className="text-2xl">Price on Request</span>
                    ) : (
                      <>
                        €{planConfig.price}
                        <span className="text-lg text-foreground-secondary font-normal">/month</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground-secondary">{planConfig.mascotSlots} mascot slot{planConfig.mascotSlots !== 1 ? 's' : ''}</p>
                </div>

                {/* Resource Pool Section */}
                <div className="mt-6">
                  <p className="font-medium text-sm text-foreground-secondary mb-3">Shared Resource Pool:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-info-100 dark:bg-info-700/30 rounded-lg p-2 border border-info-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Server size={12} className="text-info-600 dark:text-info-500" />
                        <span className="text-xs text-info-700 dark:text-info-500 font-medium">Bundle Loads</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{planConfig.sharedLimits.bundleLoads.toLocaleString()}</span>
                    </div>
                    <div className="bg-plan-premium-bg rounded-lg p-2 border border-plan-premium-border">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={12} className="text-plan-premium-text" />
                        <span className="text-xs text-plan-premium-text font-medium">Messages</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{planConfig.sharedLimits.chatMessages.toLocaleString()}</span>
                    </div>
                    <div className="bg-success-100 dark:bg-success-700/30 rounded-lg p-2 border border-success-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-success-600 dark:text-success-500" />
                        <span className="text-xs text-success-700 dark:text-success-500 font-medium">API Calls</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{planConfig.sharedLimits.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="bg-warning-100 dark:bg-warning-700/30 rounded-lg p-2 border border-warning-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Server size={12} className="text-warning-600 dark:text-warning-500" />
                        <span className="text-xs text-warning-700 dark:text-warning-500 font-medium">Storage</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{planConfig.sharedLimits.storage}</span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mt-6">
                  <p className="font-medium text-sm text-foreground-secondary mb-2">Key Features:</p>
                  <ul className="space-y-1">
                    {planConfig.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
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
                      className="btn-primary w-full py-2 px-4"
                    >
                      Contact Sales
                    </button>
                  ) : (
                    <button
                      onClick={() => console.log(`Assign ${planConfig.tier} to workspace`)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        planConfig.tier === 'basic'
                          ? 'bg-info-600 text-white hover:bg-info-700'
                          : planConfig.tier === 'premium'
                          ? 'bg-plan-premium-text text-white hover:opacity-90'
                          : 'btn-primary'
                      }`}
                    >
                      Assign to Workspace
                    </button>
                  )}

                  <button className="w-full py-1 px-4 text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="card p-6 mb-8">
            <h4 className="font-semibold mb-6 flex items-center gap-2 text-lg text-foreground">
              <Info size={20} className="text-info-600 dark:text-info-500" />
              Detailed Plan Comparison
            </h4>

            <div className="overflow-x-auto">
              <table className="data-table table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/5">Feature</th>
                    <th className="text-center w-36">
                      <div className="flex flex-col items-center gap-1">
                        <Package size={16} className="text-success-600 dark:text-success-500" />
                        <span>Starter</span>
                        <span className="text-xs font-normal text-foreground-tertiary">$99/mo</span>
                      </div>
                    </th>
                    <th className="text-center w-36">
                      <div className="flex flex-col items-center gap-1">
                        <Zap size={16} className="text-info-600 dark:text-info-500" />
                        <span>Basic</span>
                        <span className="text-xs font-normal text-foreground-tertiary">$299/mo</span>
                      </div>
                    </th>
                    <th className="text-center w-36">
                      <div className="flex flex-col items-center gap-1">
                        <Crown size={16} className="text-plan-premium-text" />
                        <span>Premium</span>
                        <span className="text-xs font-normal text-foreground-tertiary">€2499/mo</span>
                      </div>
                    </th>
                    <th className="text-center w-36">
                      <div className="flex flex-col items-center gap-1">
                        <Shield size={16} className="text-foreground-secondary" />
                        <span>Enterprise</span>
                        <span className="text-xs font-normal text-foreground-tertiary">Custom</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Mascot Slots</td>
                    <td className="text-center text-foreground-secondary">1</td>
                    <td className="text-center text-foreground-secondary">2</td>
                    <td className="text-center text-foreground-secondary">5</td>
                    <td className="text-center text-foreground-secondary">10</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Bundle Loads (Shared)</td>
                    <td className="text-center text-foreground-secondary">1,000</td>
                    <td className="text-center text-foreground-secondary">5,000</td>
                    <td className="text-center text-foreground-secondary">25,000</td>
                    <td className="text-center text-foreground-secondary">100,000</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Chat Messages (Shared)</td>
                    <td className="text-center text-foreground-secondary">25,000</td>
                    <td className="text-center text-foreground-secondary">100,000</td>
                    <td className="text-center text-foreground-secondary">500,000</td>
                    <td className="text-center text-foreground-secondary">2,000,000</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">API Calls (Shared)</td>
                    <td className="text-center text-foreground-secondary">50,000</td>
                    <td className="text-center text-foreground-secondary">250,000</td>
                    <td className="text-center text-foreground-secondary">1,000,000</td>
                    <td className="text-center text-foreground-secondary">5,000,000</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Storage</td>
                    <td className="text-center text-foreground-secondary">50MB</td>
                    <td className="text-center text-foreground-secondary">200MB</td>
                    <td className="text-center text-foreground-secondary">2GB</td>
                    <td className="text-center text-foreground-secondary">10GB</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Knowledgebase Size</td>
                    <td className="text-center text-foreground-secondary">0.1MB</td>
                    <td className="text-center text-foreground-secondary">0.5MB</td>
                    <td className="text-center text-foreground-secondary">5MB</td>
                    <td className="text-center text-foreground-secondary">20MB</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Chatflows</td>
                    <td className="text-center text-foreground-secondary">Basic Q&A</td>
                    <td className="text-center text-foreground-secondary">Templates</td>
                    <td className="text-center text-foreground-secondary">Advanced</td>
                    <td className="text-center text-foreground-secondary">Custom</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Templates Included</td>
                    <td className="text-center text-foreground-secondary">Basic only</td>
                    <td className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</td>
                    <td className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</td>
                    <td className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Marketplace Access</td>
                    <td className="text-center text-success-600 dark:text-success-500">
                      <Check size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-success-600 dark:text-success-500">
                      <Check size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-success-600 dark:text-success-500">
                      <Check size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-success-600 dark:text-success-500">
                      <Check size={16} className="mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Custom Mascot Design</td>
                    <td className="text-center text-error-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-error-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-error-500">
                      <X size={16} className="mx-auto" />
                    </td>
                    <td className="text-center text-success-600 dark:text-success-500">
                      <Check size={16} className="mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Security Level</td>
                    <td className="text-center text-foreground-secondary">Basic</td>
                    <td className="text-center text-foreground-secondary">Enhanced</td>
                    <td className="text-center text-foreground-secondary">Advanced</td>
                    <td className="text-center text-foreground-secondary">Enterprise</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-foreground-secondary">Support</td>
                    <td className="text-center text-foreground-secondary">Email</td>
                    <td className="text-center text-foreground-secondary">Priority</td>
                    <td className="text-center text-foreground-secondary">24/7 Phone</td>
                    <td className="text-center text-foreground-secondary">Dedicated Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit Pricing Info */}
          <div className="bg-info-100 dark:bg-info-700/30 rounded-xl p-6 border border-info-500/30">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
              <Zap size={20} className="text-info-600 dark:text-info-500" />
              Need More Flexibility?
            </h4>
            <p className="text-foreground-secondary mb-4">
              You can always add credit-based mascots to any plan for overflow capacity or specialized use cases.
            </p>
            <div className="flex gap-4">
              <div className="text-sm">
                <p className="font-medium text-foreground">Credit Pricing:</p>
                <p className="text-foreground-secondary">Bundle Loads: $0.04 each • Messages: $0.0015 each • API Calls: $0.0001 each</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}