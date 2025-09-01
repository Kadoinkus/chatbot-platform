'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
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
                <div key={workspace.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{workspace.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[workspace.plan]}`}>
                          {workspace.plan.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{workspace.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bots</p>
                          <p className="text-lg font-semibold">{bots.length}</p>
                          <p className="text-xs text-gray-500">
                            {bots.filter(b => b.status === 'Live').length} active
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Usage</p>
                          <p className="text-lg font-semibold">
                            {workspace.messages?.used?.toLocaleString() || '0'}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`${
                                usagePercentage > 90 ? 'bg-red-500' : 
                                usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              } rounded-full h-1.5`}
                              style={{ width: `${Math.min(100, usagePercentage)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Credits</p>
                          <p className="text-lg font-semibold">€{workspace.walletCredits?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-500">Available</p>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/app/${client.id}/workspace/${workspace.id}`}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"
                          >
                            Manage
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bot Preview */}
                  {bots.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Bots in this workspace:</p>
                      <div className="flex flex-wrap gap-2">
                        {bots.slice(0, 4).map(bot => (
                          <div key={bot.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                            <img 
                              src={bot.image} 
                              alt={bot.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="font-medium">{bot.name}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              bot.status === 'Live' ? 'bg-green-500' : 
                              bot.status === 'Paused' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </div>
                        ))}
                        {bots.length > 4 && (
                          <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
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