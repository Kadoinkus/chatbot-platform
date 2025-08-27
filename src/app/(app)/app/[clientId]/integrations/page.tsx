'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { Plus, Search, ExternalLink, Settings, Zap, CheckCircle, Clock, AlertTriangle, Globe, MessageSquare, Mail, Phone } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'messaging' | 'crm' | 'analytics' | 'automation' | 'support';
  status: 'connected' | 'available' | 'setup_required';
  icon: string;
  features: string[];
  setupTime: string;
  popularity: 'high' | 'medium' | 'low';
  premium?: boolean;
}

export default function IntegrationsHubPage({ params }: { params: { clientId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSetupModal, setShowSetupModal] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your team communication platform to receive notifications and manage conversations directly in Slack.',
      category: 'messaging',
      status: 'connected',
      icon: '🟣',
      features: ['Real-time notifications', 'Direct message management', 'Team collaboration'],
      setupTime: '5 minutes',
      popularity: 'high'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Enable your bots to respond to WhatsApp messages and manage customer conversations.',
      category: 'messaging',
      status: 'available',
      icon: '💚',
      features: ['Message automation', 'Rich media support', 'Business profile integration'],
      setupTime: '15 minutes',
      popularity: 'high'
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      description: 'Connect your Facebook page to automatically respond to customer messages.',
      category: 'messaging',
      status: 'available',
      icon: '🔵',
      features: ['Auto-responses', 'Rich cards', 'Persistent menu'],
      setupTime: '10 minutes',
      popularity: 'medium'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync customer data and create leads automatically from chat conversations.',
      category: 'crm',
      status: 'setup_required',
      icon: '☁️',
      features: ['Lead creation', 'Contact syncing', 'Activity tracking'],
      setupTime: '30 minutes',
      popularity: 'high',
      premium: true
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Integrate with your HubSpot CRM to track conversations and manage customer relationships.',
      category: 'crm',
      status: 'available',
      icon: '🟠',
      features: ['Contact management', 'Deal tracking', 'Email sequences'],
      setupTime: '20 minutes',
      popularity: 'high',
      premium: true
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track conversation metrics and user interactions in your Google Analytics dashboard.',
      category: 'analytics',
      status: 'connected',
      icon: '📊',
      features: ['Event tracking', 'Goal conversion', 'Custom dimensions'],
      setupTime: '10 minutes',
      popularity: 'medium'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to thousands of apps and automate workflows based on chat interactions.',
      category: 'automation',
      status: 'available',
      icon: '⚡',
      features: ['Workflow automation', '5000+ app connections', 'Custom triggers'],
      setupTime: '15 minutes',
      popularity: 'high'
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Escalate complex conversations to your Zendesk support team seamlessly.',
      category: 'support',
      status: 'available',
      icon: '🎫',
      features: ['Ticket creation', 'Agent handoff', 'SLA tracking'],
      setupTime: '25 minutes',
      popularity: 'medium',
      premium: true
    },
    {
      id: 'intercom',
      name: 'Intercom',
      description: 'Integrate with Intercom to provide seamless customer support and engagement.',
      category: 'support',
      status: 'setup_required',
      icon: '💬',
      features: ['Live chat handoff', 'Customer profiles', 'Conversation history'],
      setupTime: '20 minutes',
      popularity: 'medium',
      premium: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: Globe },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'crm', label: 'CRM', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: Settings },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'support', label: 'Support', icon: Phone }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const availableCount = integrations.filter(i => i.status === 'available').length;

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle size={14} />
            Connected
          </div>
        );
      case 'setup_required':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            <Clock size={14} />
            Setup Required
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Plus size={14} />
            Available
          </div>
        );
    }
  };

  const getActionButton = (integration: Integration) => {
    switch (integration.status) {
      case 'connected':
        return (
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings size={16} />
            Configure
          </button>
        );
      case 'setup_required':
        return (
          <button 
            onClick={() => setShowSetupModal(integration.id)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <AlertTriangle size={16} />
            Complete Setup
          </button>
        );
      default:
        return (
          <button 
            onClick={() => setShowSetupModal(integration.id)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Plus size={16} />
            Connect
          </button>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Integrations</h1>
            <p className="text-gray-600">Connect your favorite tools and automate your workflows</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Available</p>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-xs text-gray-500 mt-1">Integrations</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Connected</p>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-xs text-green-600 mt-1">Active integrations</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-xs text-blue-600 mt-1">Ready to connect</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Categories</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-gray-500 mt-1">Different types</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={16} />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Connected Integrations */}
          {connectedCount > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Connected Integrations</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.filter(i => i.status === 'connected').map(integration => (
                  <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          {integration.premium && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Premium</span>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                    <div className="flex items-center justify-between">
                      {getActionButton(integration)}
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Integrations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedCategory === 'all' ? 'All Integrations' : `${categories.find(c => c.id === selectedCategory)?.label} Integrations`}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map(integration => (
                <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {integration.premium && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Premium</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            integration.popularity === 'high' ? 'bg-green-100 text-green-700' :
                            integration.popularity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {integration.popularity} popularity
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {integration.features.map(feature => (
                        <li key={feature} className="text-xs text-gray-600 flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Setup: {integration.setupTime}
                    </div>
                    <div className="flex items-center gap-2">
                      {getActionButton(integration)}
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <ExternalLink size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Modal */}
          {showSetupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                {(() => {
                  const integration = integrations.find(i => i.id === showSetupModal);
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{integration?.icon}</span>
                        <h2 className="text-xl font-semibold">Connect {integration?.name}</h2>
                      </div>
                      
                      <p className="text-gray-600 mb-6">{integration?.description}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key / Credentials
                          </label>
                          <input
                            type="password"
                            placeholder="Enter your API key..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        {integration?.id === 'slack' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Slack Workspace URL
                            </label>
                            <input
                              type="url"
                              placeholder="https://yourworkspace.slack.com"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                        )}

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Setup time:</strong> {integration?.setupTime}
                          </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                            Connect Integration
                          </button>
                          <button 
                            onClick={() => setShowSetupModal(null)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}