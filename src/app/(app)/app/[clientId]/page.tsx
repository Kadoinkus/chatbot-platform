'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import BotCard from '@/components/BotCard';
import AuthGuard from '@/components/AuthGuard';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AllBotsPage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [allBots, setAllBots] = useState<(Bot & { workspaceName: string })[]>([]);
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
        
        // Load all bots from all workspaces
        const botsWithWorkspace: (Bot & { workspaceName: string })[] = [];
        for (const workspace of workspacesData || []) {
          const bots = await getBotsByWorkspaceId(workspace.id);
          bots.forEach(bot => {
            botsWithWorkspace.push({
              ...bot,
              workspaceName: workspace.name
            });
          });
        }
        setAllBots(botsWithWorkspace);
        
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
  
  // Filter bots based on search term and selected workspace
  const filteredBots = allBots.filter(bot => {
    const matchesSearch = 
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.workspaceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWorkspace = 
      selectedWorkspace === 'all' || 
      bot.workspaceId === selectedWorkspace;
    
    return matchesSearch && matchesWorkspace;
  });

  const planColors = {
    starter: 'bg-gray-100 text-gray-700',
    growth: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700'
  };

  const getWorkspaceBadgeColor = (workspaceId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    return workspace ? planColors[workspace.plan] : 'bg-gray-100 text-gray-700';
  };

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">All Bots</h1>
            <p className="text-gray-600">Manage all your AI assistants across all workspaces for {client.name}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Bots</span>
              </div>
              <p className="text-2xl font-bold">{allBots.length}</p>
              <p className="text-xs text-gray-500 mt-1">Across {workspaces.length} workspaces</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Bots</span>
              </div>
              <p className="text-2xl font-bold">{allBots.filter(b => b.status === 'Live').length}</p>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Paused Bots</span>
              </div>
              <p className="text-2xl font-bold">{allBots.filter(b => b.status === 'Paused').length}</p>
              <p className="text-xs text-gray-500 mt-1">Temporarily inactive</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Conversations</span>
              </div>
              <p className="text-2xl font-bold">
                {allBots.reduce((total, bot) => total + bot.conversations, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bots and workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Workspace Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white min-w-[180px]"
              >
                <option value="all">All Workspaces</option>
                {workspaces.map(workspace => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Link 
              href={`/app/${client.id}/marketplace`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              New Bot
            </Link>
          </div>
          
          {/* Bot Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredBots.map(bot => (
              <BotCard 
                key={bot.id} 
                bot={bot} 
                clientId={client.id} 
                workspaceName={bot.workspaceName}
              />
            ))}
          </div>
          
          {/* Empty States */}
          {filteredBots.length === 0 && allBots.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
              <p className="text-gray-600 mb-4">Create your first bot to get started with AI assistance.</p>
              <Link 
                href={`/app/${client.id}/marketplace`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Plus size={20} />
                Create First Bot
              </Link>
            </div>
          )}

          {filteredBots.length === 0 && allBots.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bots found matching your search criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWorkspace('all');
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}