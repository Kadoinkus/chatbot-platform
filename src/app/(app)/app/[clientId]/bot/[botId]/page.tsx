'use client';
import { getClientById, getBotById, getBotMetrics } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { UsageLine, IntentBars } from '@/components/Charts';
import { ArrowLeft, MessageSquare, Clock, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';

export default function BotAnalyticsPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [metrics, setMetrics] = useState<any>();
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </main>
      </div>
    );
  }

  if (!client || !bot) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 p-6">
          <p className="text-foreground-secondary">Bot not found</p>
        </main>
      </div>
    );
  }

  const brandColor = getClientBrandColor(bot.clientId);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar clientId={client.id} />

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link
            href={`/app/${client.id}`}
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to bots
          </Link>
          
          <div className="card p-8 mb-6">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center p-2"
                  style={{ backgroundColor: brandColor }}
                >
                  <img
                    src={bot.image}
                    alt={bot.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{bot.name}</h1>
                    <StatusBadge status={bot.status} />
                  </div>
                  <p className="text-foreground-secondary mb-4">{bot.description}</p>
                  <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn-primary px-4 py-2">
                  Configure
                </button>
                <button className="btn-secondary px-4 py-2">
                  Export Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Total Conversations</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{bot.conversations}</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">+12% from last week</p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{bot.metrics.responseTime}s</p>
                <p className="text-xs text-foreground-tertiary mt-1">Industry avg: 2.5s</p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Resolution Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{bot.metrics.resolutionRate}%</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">Above average</p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Star size={16} />
                  <span className="text-sm">Satisfaction</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{bot.metrics.csat}/5</p>
                <p className="text-xs text-foreground-tertiary mt-1">Last 7 days</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h2 className="font-semibold text-foreground mb-4">Conversation Volume (7 days)</h2>
              {metrics && <UsageLine data={metrics.usageByDay} />}
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-foreground mb-4">Top Intents</h2>
              {metrics && <IntentBars data={metrics.topIntents} />}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-foreground mb-4">Recent Conversations</h2>
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar-placeholder" />
                    <div>
                      <p className="font-medium text-foreground">User #{1000 + i}</p>
                      <p className="text-sm text-foreground-secondary">Question about product availability</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground-secondary">2 min ago</p>
                    <p className="text-xs text-success-600 dark:text-success-500">Resolved</p>
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