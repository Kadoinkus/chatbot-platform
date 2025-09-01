'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Plus, Search, Building2, Activity, CreditCard, ChevronRight, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';

export default function HomePage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceBots, setWorkspaceBots] = useState<Record<string, Bot[]>>({});
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client) {
    return <div className="p-6">Client not found</div>;
  }
  
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workspaceBots[workspace.id] || []).some(bot => 
      bot.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const planColors = {
    starter: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700'
  };

  const getTotalUsage = () => {
    return workspaces.reduce((total, ws) => total + (ws.messages?.used || 0), 0);
  };

  const getTotalBots = () => {
    return Object.values(workspaceBots).reduce((total, bots) => total + bots.length, 0);
  };

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your workspaces and AI assistants for {client.name}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Workspaces</span>
                <Building2 size={18} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{workspaces.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {workspaces.filter(ws => ws.status === 'active').length} active
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Bots</span>
                <BotIcon size={18} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{getTotalBots()}</p>
              <p className="text-xs text-gray-500 mt-1">Across all workspaces</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Month</span>
                <Activity size={18} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{getTotalUsage().toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Conversations handled</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search workspaces and bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Plus size={20} />
              New Workspace
            </button>
          </div>
          
          {/* Workspace Cards */}
          <div className="space-y-4">
            {filteredWorkspaces.map(workspace => {
              const bots = workspaceBots[workspace.id] || [];
              const usagePercentage = workspace.messages ? (workspace.messages.used / workspace.messages.limit) * 100 : 0;
              
              return (
                <div key={workspace.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Header Section */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{workspace.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${planColors[workspace.plan]}`}>
                            {workspace.plan}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{workspace.description}</p>
                      </div>
                      <Link
                        href={`/app/${client.id}/workspace/${workspace.id}`}
                        className="ml-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-colors duration-150"
                      >
                        Manage
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BotIcon size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{bots.length}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Bots</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {bots.filter(b => b.status === 'Live').length} active, {bots.filter(b => b.status === 'Paused').length} paused
                        </p>
                      </div>
                      
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {workspace.messages?.used?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Usage</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`${
                              usagePercentage > 90 ? 'bg-red-500' : 
                              usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            } rounded-full h-2 transition-all duration-300`}
                            style={{ width: `${Math.min(100, usagePercentage)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {workspace.messages?.limit ? `${Math.round(usagePercentage)}% of ${workspace.messages.limit.toLocaleString()}` : 'Unlimited'}
                        </p>
                      </div>
                      
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard size={16} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">€{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Credits</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Available balance</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bot Preview */}
                  {bots.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Active Bots</h4>
                        <Link 
                          href={`/app/${client.id}/workspace/${workspace.id}`}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all →
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {bots.slice(0, 4).map(bot => (
                          <Link
                            key={bot.id}
                            href={`/app/${client.id}/workspace/${workspace.id}`}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm hover:border-gray-400 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                          >
                            <img 
                              src={bot.image} 
                              alt={bot.name}
                              className="w-7 h-7 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: getClientBrandColor(bot.clientId) }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900 truncate block group-hover:text-gray-700 transition-colors">{bot.name}</span>
                              <span className={`text-xs capitalize transition-colors ${
                                bot.status === 'Live' ? 'text-green-600 group-hover:text-green-700' : 
                                bot.status === 'Paused' ? 'text-yellow-600 group-hover:text-yellow-700' : 'text-red-600 group-hover:text-red-700'
                              }`}>
                                {bot.status.toLowerCase()}
                              </span>
                            </div>
                          </Link>
                        ))}
                        {bots.length > 4 && (
                          <div className="flex items-center justify-center px-3 py-2 bg-gray-200 rounded-lg text-sm text-gray-600 font-medium">
                            +{bots.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
              <p className="text-gray-600 mb-6">Create your first workspace to organize your bots and manage resources.</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                <Plus size={20} />
                Create First Workspace
              </button>
            </div>
          )}

          {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No workspaces found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}