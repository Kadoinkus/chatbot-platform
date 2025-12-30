"use client";
import { useState, useEffect, use } from "react";
import { getClientById, getWorkspacesByClientId } from '@/lib/dataService';
import type { Client, Workspace } from '@/lib/dataService';
import {
  CheckCircle, Package, Activity,
  MessageCircle, Server, Info,
  Shield, Zap, Crown, ArrowLeft, Check, X
} from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function PlansPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData] = await Promise.all([
          getClientById(clientId),
          getWorkspacesByClientId(clientId)
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
  }, [clientId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Package size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  return (
    <Page>
      <PageContent>
            <PageHeader
              title="Choose Your Plan"
              description="Select the perfect plan for your workspace needs. Each workspace can have its own plan."
              backLink={
                <Link
                  href={`/app/${clientId}/settings`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Settings
                </Link>
              }
            />

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
                    bundleLoads: 100,
                    chatMessages: 1000,
                    apiCalls: 1000,
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
                  price: 399,
                  currency: 'EUR',
                  mascotSlots: 2,
                  sharedLimits: {
                    bundleLoads: 1000,
                    chatMessages: 15000,
                    apiCalls: 15000,
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
                  price: 699,
                  currency: 'EUR',
                  mascotSlots: 5,
                  sharedLimits: {
                    bundleLoads: 2000,
                    chatMessages: 30000,
                    apiCalls: 30000,
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
                  price: 2499,
                  currency: 'EUR',
                  mascotSlots: 10,
                  sharedLimits: {
                    bundleLoads: 5000,
                    chatMessages: 50000,
                    apiCalls: 50000,
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
                      <Button
                        fullWidth
                        onClick={() => console.log('Contact sales for Enterprise')}
                      >
                        Contact Sales
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        onClick={() => console.log(`Assign ${planConfig.tier} to workspace`)}
                        className={
                          planConfig.tier === 'basic'
                            ? 'bg-info-600 hover:bg-info-700'
                            : planConfig.tier === 'premium'
                            ? 'bg-plan-premium-text hover:opacity-90'
                            : ''
                        }
                      >
                        Assign to Workspace
                      </Button>
                    )}

                    <button className="w-full py-1 px-4 text-sm text-foreground-secondary hover:text-foreground transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Comparison Table */}
            <Card className="mb-8">
              <h4 className="font-semibold mb-6 flex items-center gap-2 text-lg text-foreground">
                <Info size={20} className="text-info-600 dark:text-info-500" />
                Detailed Plan Comparison
              </h4>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/5">Feature</TableHead>
                      <TableHead className="text-center w-36">
                        <div className="flex flex-col items-center gap-1">
                          <Package size={16} className="text-success-600 dark:text-success-500" />
                          <span>Starter</span>
                          <span className="text-xs font-normal text-foreground-tertiary">€99/mo</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-36">
                        <div className="flex flex-col items-center gap-1">
                          <Zap size={16} className="text-info-600 dark:text-info-500" />
                          <span>Basic</span>
                          <span className="text-xs font-normal text-foreground-tertiary">€399/mo</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-36">
                        <div className="flex flex-col items-center gap-1">
                          <Crown size={16} className="text-plan-premium-text" />
                          <span>Premium</span>
                          <span className="text-xs font-normal text-foreground-tertiary">€699/mo</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-36">
                        <div className="flex flex-col items-center gap-1">
                          <Shield size={16} className="text-foreground-secondary" />
                          <span>Enterprise</span>
                          <span className="text-xs font-normal text-foreground-tertiary">€2499/mo</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Mascot Slots</TableCell>
                      <TableCell className="text-center text-foreground-secondary">1</TableCell>
                      <TableCell className="text-center text-foreground-secondary">2</TableCell>
                      <TableCell className="text-center text-foreground-secondary">5</TableCell>
                      <TableCell className="text-center text-foreground-secondary">10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Bundle Loads (Shared)</TableCell>
                      <TableCell className="text-center text-foreground-secondary">100</TableCell>
                      <TableCell className="text-center text-foreground-secondary">1,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">2,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">5,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Chat Messages (Shared)</TableCell>
                      <TableCell className="text-center text-foreground-secondary">1,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">15,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">30,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">50,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">API Calls (Shared)</TableCell>
                      <TableCell className="text-center text-foreground-secondary">1,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">15,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">30,000</TableCell>
                      <TableCell className="text-center text-foreground-secondary">50,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Storage</TableCell>
                      <TableCell className="text-center text-foreground-secondary">50MB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">200MB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">2GB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">10GB</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Knowledgebase Size</TableCell>
                      <TableCell className="text-center text-foreground-secondary">0.1MB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">0.5MB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">5MB</TableCell>
                      <TableCell className="text-center text-foreground-secondary">20MB</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Chatflows</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Basic Q&A</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Templates</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Advanced</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Custom</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Templates Included</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Basic only</TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500 font-medium">Basic + Pro</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Marketplace Access</TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500">
                        <Check size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500">
                        <Check size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500">
                        <Check size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500">
                        <Check size={16} className="mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Custom Mascot Design</TableCell>
                      <TableCell className="text-center text-error-500">
                        <X size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-error-500">
                        <X size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-error-500">
                        <X size={16} className="mx-auto" />
                      </TableCell>
                      <TableCell className="text-center text-success-600 dark:text-success-500">
                        <Check size={16} className="mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Security Level</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Basic</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Enhanced</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Advanced</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Enterprise</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-foreground-secondary">Support</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Email</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Priority</TableCell>
                      <TableCell className="text-center text-foreground-secondary">24/7 Phone</TableCell>
                      <TableCell className="text-center text-foreground-secondary">Dedicated Manager</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Credit Pricing Info */}
            <Alert variant="info" title="Need More Flexibility?">
              <p className="mb-4">
                You can always add credit-based mascots to any plan for overflow capacity or specialized use cases.
              </p>
              <div className="text-sm">
                <p className="font-medium text-foreground">Credit Pricing:</p>
                <p className="text-foreground-secondary">Bundle Loads: $0.04 each • Messages: $0.0015 each • API Calls: $0.0001 each</p>
              </div>
            </Alert>
      </PageContent>
    </Page>
  );
}
