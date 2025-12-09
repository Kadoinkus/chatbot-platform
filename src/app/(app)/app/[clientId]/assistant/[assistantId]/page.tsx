'use client';
import { getClientById, getAssistantById, getAssistantMetrics } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { UsageLine, IntentBars } from '@/components/Charts';
import { ArrowLeft, MessageSquare, Clock, TrendingUp, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import type { Client, Assistant } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function AssistantAnalyticsPage({ params }: { params: { clientId: string; assistantId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [assistant, setAssistant] = useState<Assistant | undefined>();
  const [metrics, setMetrics] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, assistantData, metricsData] = await Promise.all([
          getClientById(params.clientId),
          getAssistantById(params.assistantId),
          getAssistantMetrics(params.assistantId)
        ]);
        setClient(clientData);
        setAssistant(assistantData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.assistantId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BotIcon size={48} />}
            title="AI Assistant not found"
            message="The requested AI assistant could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  const brandColor = getClientBrandColor(assistant.clientId);

  return (
    <Page>
      <PageContent>
            <PageHeader
              title={assistant.name}
              description={assistant.description}
              backLink={
                <Link
                  href={`/app/${client.id}`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to AI Assistants
                </Link>
              }
            />

            <Card className="mb-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center p-2"
                    style={{ backgroundColor: brandColor }}
                  >
                    <img
                      src={assistant.image}
                      alt={assistant.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">{assistant.name}</h1>
                      <StatusBadge status={assistant.status} />
                    </div>
                    <p className="text-foreground-secondary mb-4">{assistant.description}</p>
                    <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>Configure</Button>
                  <Button variant="secondary">Export Data</Button>
                </div>
              </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Total Conversations</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{assistant.conversations}</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">+12% from last week</p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{assistant.metrics.responseTime}s</p>
                <p className="text-xs text-foreground-tertiary mt-1">Industry avg: 2.5s</p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Resolution Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{assistant.metrics.resolutionRate}%</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">Above average</p>
              </div>
            </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <h2 className="font-semibold text-foreground mb-4">Conversation Volume (7 days)</h2>
                {metrics && <UsageLine data={metrics.usageByDay} />}
              </Card>

              <Card>
                <h2 className="font-semibold text-foreground mb-4">Top Intents</h2>
                {metrics && <IntentBars data={metrics.topIntents} />}
              </Card>
            </div>

            <Card>
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
            </Card>
      </PageContent>
    </Page>
  );
}
