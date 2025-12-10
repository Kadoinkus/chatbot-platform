'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getClientById, getAssistantsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import {
  fetchAssistantComparisonData,
  calculateTotals,
  type AssistantWithMetrics,
} from '@/lib/analytics/assistantComparison';
import type { Client, Assistant, Workspace } from '@/lib/dataService';
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
import { FilterBar } from './components';

// Lazy-loaded tab components
const OverviewTab = dynamic(() => import('./components/OverviewTab'), { loading: () => <TabFallback /> });
const ConversationsTab = dynamic(() => import('./components/ConversationsTab'), { loading: () => <TabFallback /> });
const QuestionsTab = dynamic(() => import('./components/QuestionsTab'), { loading: () => <TabFallback /> });
const AudienceTab = dynamic(() => import('./components/AudienceTab'), { loading: () => <TabFallback /> });
const AnimationsTab = dynamic(() => import('./components/AnimationsTab'), { loading: () => <TabFallback /> });
const CostsTab = dynamic(() => import('./components/CostsTab'), { loading: () => <TabFallback /> });
const CustomTab = dynamic(() => import('./components/CustomTab'), { loading: () => <TabFallback /> });

function TabFallback() {
  return (
    <div className="py-10 flex justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function AnalyticsDashboardPage({ params }: { params: { clientId: string } }) {
  // Data state
  const [client, setClient] = useState<Client | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [assistantMetrics, setAssistantMetrics] = useState<AssistantWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Filter state
  const [dateRange, setDateRange] = useState('30days');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>(['all']);

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
        const [clientData, workspacesData, assistantsData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspacesByClientId(params.clientId),
          getAssistantsByClientId(params.clientId),
        ]);

        setClient(clientData || null);
        setWorkspaces(workspacesData);
        setAssistants(assistantsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  // Load assistant metrics when selection changes
  useEffect(() => {
    async function loadMetrics() {
      if (!client || assistants.length === 0) return;

      setMetricsLoading(true);
      try {
        // Filter assistants based on selection
        let filteredAssistantList = assistants;
        if (selectedWorkspace !== 'all') {
          filteredAssistantList = filteredAssistantList.filter((a) => a.workspaceId === selectedWorkspace);
        }
        if (!selectedAssistants.includes('all') && selectedAssistants.length > 0) {
          filteredAssistantList = filteredAssistantList.filter((a) => selectedAssistants.includes(a.id));
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

        const metrics = await fetchAssistantComparisonData(params.clientId, filteredAssistantList, dateRangeParam);
        setAssistantMetrics(metrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, [client, assistants, selectedWorkspace, selectedAssistants, dateRange, params.clientId]);

  // Reset assistant selection when workspace changes
  useEffect(() => {
    setSelectedAssistants(['all']);
  }, [selectedWorkspace]);

  // Calculate aggregated totals
  const totals = useMemo(() => calculateTotals(assistantMetrics), [assistantMetrics]);

  // Assistant selection handler
  const handleAssistantToggle = (assistantId: string) => {
    if (assistantId === 'all') {
      if (selectedAssistants.includes('all') || selectedAssistants.length === 0) {
        setSelectedAssistants([]);
      } else {
        setSelectedAssistants(['all']);
      }
    } else {
      setSelectedAssistants((prev) => {
        const withoutAll = prev.filter((id) => id !== 'all');
        if (prev.includes(assistantId)) {
          return withoutAll.filter((id) => id !== assistantId);
        } else {
          return [...withoutAll, assistantId];
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
        return <OverviewTab assistantMetrics={assistantMetrics} totals={totals} brandColor={brandColor} />;
      case 'conversations':
        return <ConversationsTab assistantMetrics={assistantMetrics} totals={totals} brandColor={brandColor} />;
      case 'questions':
        return (
          <QuestionsTab
            assistantMetrics={assistantMetrics}
            brandColor={brandColor}
            onOpenQuestionsModal={handleOpenQuestionsModal}
          />
        );
      case 'audience':
        return <AudienceTab assistantMetrics={assistantMetrics} totals={totals} brandColor={brandColor} />;
      case 'animations':
        return <AnimationsTab assistantMetrics={assistantMetrics} brandColor={brandColor} />;
      case 'costs':
        return <CostsTab assistantMetrics={assistantMetrics} totals={totals} brandColor={brandColor} />;
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
              ? `Compare AI assistant performance for ${client.name}`
              : `${workspaces.find((w) => w.id === selectedWorkspace)?.name || 'Workspace'} - ${client.name}`
          }
        />

        {/* Filter Bar */}
        <FilterBar
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={setSelectedWorkspace}
          assistants={assistants}
          selectedAssistants={selectedAssistants}
          onAssistantToggle={handleAssistantToggle}
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
