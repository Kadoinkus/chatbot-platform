'use client';

import { useState, useMemo, useEffect } from 'react';
import { getClientById, getBotsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import {
  fetchBotComparisonData,
  calculateTotals,
  type BotWithMetrics,
} from '@/lib/analytics/botComparison';
import type { Client, Bot, Workspace } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import { BarChart3 } from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Spinner,
  EmptyState,
  Modal,
} from '@/components/ui';
import { TabNavigation, ANALYTICS_TABS } from '@/components/analytics';

// Tab Components
import {
  FilterBar,
  OverviewTab,
  ConversationsTab,
  QuestionsTab,
  AudienceTab,
  AnimationsTab,
  CostsTab,
  CustomTab,
} from './components';

export default function AnalyticsDashboardPage({ params }: { params: { clientId: string } }) {
  // Data state
  const [client, setClient] = useState<Client | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [botMetrics, setBotMetrics] = useState<BotWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Filter state
  const [dateRange, setDateRange] = useState('30days');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedBots, setSelectedBots] = useState<string[]>(['all']);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Modal state
  const [questionsModal, setQuestionsModal] = useState<{
    open: boolean;
    questions: string[];
    title: string;
  }>({
    open: false,
    questions: [],
    title: '',
  });

  const brandColor = client ? getClientBrandColor(client.id) : '#3B82F6';

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData, botsData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspacesByClientId(params.clientId),
          getBotsByClientId(params.clientId),
        ]);

        setClient(clientData || null);
        setWorkspaces(workspacesData);
        setBots(botsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  // Load bot metrics when selection changes
  useEffect(() => {
    async function loadMetrics() {
      if (!client || bots.length === 0) return;

      setMetricsLoading(true);
      try {
        // Filter bots based on selection
        let filteredBotList = bots;
        if (selectedWorkspace !== 'all') {
          filteredBotList = filteredBotList.filter((b) => b.workspaceId === selectedWorkspace);
        }
        if (!selectedBots.includes('all') && selectedBots.length > 0) {
          filteredBotList = filteredBotList.filter((b) => selectedBots.includes(b.id));
        }

        // Convert date range to DateRange object
        const now = new Date();
        const daysMap: Record<string, number> = {
          today: 1,
          '7days': 7,
          '30days': 30,
          '90days': 90,
        };
        const days = daysMap[dateRange] || 30;
        const start = new Date(now);
        start.setDate(now.getDate() - days);
        const dateRangeParam = { start, end: now };

        const metrics = await fetchBotComparisonData(params.clientId, filteredBotList, dateRangeParam);
        setBotMetrics(metrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, [client, bots, selectedWorkspace, selectedBots, dateRange, params.clientId]);

  // Reset bot selection when workspace changes
  useEffect(() => {
    setSelectedBots(['all']);
  }, [selectedWorkspace]);

  // Calculate aggregated totals
  const totals = useMemo(() => calculateTotals(botMetrics), [botMetrics]);

  // Bot selection handler
  const handleBotToggle = (botId: string) => {
    if (botId === 'all') {
      if (selectedBots.includes('all') || selectedBots.length === 0) {
        setSelectedBots([]);
      } else {
        setSelectedBots(['all']);
      }
    } else {
      setSelectedBots((prev) => {
        const withoutAll = prev.filter((id) => id !== 'all');
        if (prev.includes(botId)) {
          return withoutAll.filter((id) => id !== botId);
        } else {
          return [...withoutAll, botId];
        }
      });
    }
  };

  // Questions modal handler
  const handleOpenQuestionsModal = (questions: string[], title: string) => {
    setQuestionsModal({ open: true, questions, title });
  };

  // Loading state
  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  // Client not found
  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BarChart3 size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  // Render active tab content
  const renderTabContent = () => {
    if (metricsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab botMetrics={botMetrics} totals={totals} brandColor={brandColor} />;
      case 'conversations':
        return <ConversationsTab botMetrics={botMetrics} totals={totals} brandColor={brandColor} />;
      case 'questions':
        return (
          <QuestionsTab
            botMetrics={botMetrics}
            brandColor={brandColor}
            onOpenQuestionsModal={handleOpenQuestionsModal}
          />
        );
      case 'audience':
        return <AudienceTab botMetrics={botMetrics} totals={totals} brandColor={brandColor} />;
      case 'animations':
        return <AnimationsTab botMetrics={botMetrics} brandColor={brandColor} />;
      case 'costs':
        return <CostsTab botMetrics={botMetrics} totals={totals} brandColor={brandColor} />;
      case 'custom':
        return <CustomTab />;
      default:
        return null;
    }
  };

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Analytics Dashboard"
          description={
            selectedWorkspace === 'all'
              ? `Compare bot performance for ${client.name}`
              : `${workspaces.find((w) => w.id === selectedWorkspace)?.name || 'Workspace'} - ${client.name}`
          }
        />

        {/* Filter Bar */}
        <FilterBar
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={setSelectedWorkspace}
          bots={bots}
          selectedBots={selectedBots}
          onBotToggle={handleBotToggle}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          brandColor={brandColor}
        />

        {/* Tab Navigation - Using shared component */}
        <TabNavigation
          tabs={ANALYTICS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          brandColor={brandColor}
        />

        {/* Tab Content */}
        {renderTabContent()}

        {/* Questions Modal */}
        <Modal
          isOpen={questionsModal.open}
          onClose={() => setQuestionsModal({ open: false, questions: [], title: '' })}
          title={questionsModal.title}
          size="lg"
        >
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questionsModal.questions.length > 0 ? (
              questionsModal.questions.map((q, i) => (
                <div key={i} className="p-3 bg-background-secondary rounded-lg">
                  <p className="text-sm text-foreground">{q}</p>
                </div>
              ))
            ) : (
              <p className="text-foreground-tertiary text-center py-4">No questions available</p>
            )}
          </div>
        </Modal>
      </PageContent>
    </Page>
  );
}
