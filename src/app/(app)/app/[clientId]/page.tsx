'use client';
import { clients } from '@/lib/data';
import BotCard from '@/components/BotCard';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function ClientDashboard({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const client = clients.find(c => c.id === params.clientId);
  if (!client) {
    return <div className="p-6">Client not found</div>;
  }
  
  const filteredBots = client.mascots.filter(bot =>
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Bots</h1>
            <p className="text-gray-600">Manage and monitor your AI assistants for {client.name}</p>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              <Plus size={20} />
              Create New Bot
            </button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {filteredBots.map(bot => (
              <BotCard key={bot.id} bot={bot} clientId={client.id} />
            ))}
          </div>
          
          {filteredBots.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bots found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}