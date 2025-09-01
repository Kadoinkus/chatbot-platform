'use client';
import { getClientById, getBotById, getBotMetrics } from '@/lib/dataService';
import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { UsageLine, IntentBars } from '@/components/Charts';
import { ArrowLeft, MessageSquare, Clock, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import { getClientBrandColor } from '@/lib/brandColors';
import type { Client, Bot } from '@/lib/dataService';

export default function BotAnalyticsPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [metrics, setMetrics] = useState<any>();
  const [loading, setLoading] = useState(true);

  const brandColor = useMemo(() => {
    return bot ? getClientBrandColor(bot.clientId) : '#6B7280';
  }, [bot]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, botData, metricsData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId),
          getBotMetrics(params.botId)
        ]);
        setClient(clientData);
        setBot(botData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link 
            href={`/app/${client.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to bots
          </Link>
          
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <img 
                  src={bot.image} 
                  alt={bot.name}
                  className="w-24 h-24 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{bot.name}</h1>
                    <StatusBadge status={bot.status} />
                  </div>
                  <p className="text-gray-600 mb-4">{bot.description}</p>
                  <p className="text-sm text-gray-500">Client: {client.name}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  Configure
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Export Data
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Total Conversations</span>
                </div>
                <p className="text-2xl font-bold">{bot.conversations}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last week</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold">{bot.metrics.responseTime}s</p>
                <p className="text-xs text-gray-600 mt-1">Industry avg: 2.5s</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Resolution Rate</span>
                </div>
                <p className="text-2xl font-bold">{bot.metrics.resolutionRate}%</p>
                <p className="text-xs text-green-600 mt-1">Above average</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Star size={16} />
                  <span className="text-sm">Satisfaction</span>
                </div>
                <p className="text-2xl font-bold">{bot.metrics.csat}/5</p>
                <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Conversation Volume (7 days)</h2>
              {metrics && <UsageLine data={metrics.usageByDay} />}
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Top Intents</h2>
              {metrics && <IntentBars data={metrics.topIntents} />}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">Recent Conversations</h2>
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div>
                      <p className="font-medium">User #{1000 + i}</p>
                      <p className="text-sm text-gray-600">Question about product availability</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">2 min ago</p>
                    <p className="text-xs text-green-600">Resolved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}