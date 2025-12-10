'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getClientById, getAssistantsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import {
  fetchAssistantComparisonData,
  calculateTotals,
  type AssistantWithMetrics,
} from '@/lib/analytics/assistantComparison';
import type { Client, Assistant, Workspace } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import { BarChart3, MessageSquare, CheckCircle, Clock, Download, ChevronDown } from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Spinner,
  EmptyState,
  Card,
  Modal,
} from '@/components/ui';
import {
  TabNavigation,
  ANALYTICS_TABS,
  FilterBar,
  KpiCard,
  KpiGrid,
  ConversationsTab as SharedConversationsTab,
  normalizeAssistantMetrics,
} from '@/components/analytics';
import { DateRangeBar } from '@/components/analytics/shared';
import { exportToCSV, exportToJSON, exportToXLSX, generateExportFilename, type ExportFormat } from '@/lib/export';

// Lazy-loaded tab components
const OverviewTab = dynamic(() => import('./components/OverviewTab'), { loading: () => <TabFallback /> });
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
  const [conversationPage, setConversationPage] = useState(1);
  const CONVERSATIONS_PER_PAGE = 10;

  // Filter state
  const [dateRange, setDateRange] = useState(30);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>(['all']);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (!exportDropdownRef.current?.contains(target)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

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
        now.setHours(23, 59, 59, 999);

        let start = new Date(now);
        let end = new Date(now);

        if (useCustomRange && customDateRange.start && customDateRange.end) {
          start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
        } else {
          const days = typeof dateRange === 'number' ? dateRange : 30;
          start = new Date(now);
          start.setDate(now.getDate() - days);
          start.setHours(0, 0, 0, 0);
        }

        const dateRangeParam = { start, end };

        const metrics = await fetchAssistantComparisonData(params.clientId, filteredAssistantList, dateRangeParam);
        setAssistantMetrics(metrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, [client, assistants, selectedWorkspace, selectedAssistants, dateRange, useCustomRange, customDateRange, params.clientId]);

  // Reset assistant selection when workspace changes
  useEffect(() => {
    setSelectedAssistants(['all']);
  }, [selectedWorkspace]);

  // Calculate aggregated totals
  const totals = useMemo(() => calculateTotals(assistantMetrics), [assistantMetrics]);

  const { sessions: normalizedSessions, stats: conversationStats } = useMemo(
    () => normalizeAssistantMetrics(assistantMetrics, assistants),
    [assistantMetrics, assistants]
  );

  const totalConversationPages = Math.max(1, Math.ceil(normalizedSessions.length / CONVERSATIONS_PER_PAGE));
  const paginatedConversations = useMemo(() => {
    const startIndex = (conversationPage - 1) * CONVERSATIONS_PER_PAGE;
    return normalizedSessions.slice(startIndex, startIndex + CONVERSATIONS_PER_PAGE);
  }, [normalizedSessions, conversationPage, CONVERSATIONS_PER_PAGE]);

  useEffect(() => {
    setConversationPage(1);
  }, [assistantMetrics]);

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

  const getExportDateRange = useCallback(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate = new Date(now);
    let endDate = new Date(now);

    if (useCustomRange && customDateRange.start && customDateRange.end) {
      startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = typeof dateRange === 'number' ? dateRange : 30;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }, [customDateRange, dateRange, useCustomRange]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      const { startDate, endDate } = getExportDateRange();
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      const exportFn =
        format === 'csv' ? exportToCSV : format === 'xlsx' ? exportToXLSX : exportToJSON;

      switch (activeTab) {
        case 'overview': {
          const data = assistantMetrics.map((a) => ({
            assistant_id: a.assistantId,
            assistant_name: a.assistantName,
            status: a.status,
            total_sessions: a.overview.totalSessions,
            total_messages: a.overview.totalMessages,
            total_tokens: a.overview.totalTokens,
            total_cost_eur: a.overview.totalCostEur,
            avg_response_time_ms: a.overview.averageResponseTimeMs,
            avg_session_duration_sec: a.overview.averageSessionDurationSeconds,
            resolution_rate: a.overview.resolutionRate,
            escalation_rate: a.overview.escalationRate,
            start_date: startDateStr,
            end_date: endDateStr,
          }));
          const filename = generateExportFilename('overview', params.clientId, startDate, endDate);
          exportFn(data, filename, 'Overview');
          break;
        }

        case 'conversations': {
          const data = normalizedSessions.map((s) => ({
            session_id: s.id,
            assistant_id: s.assistant?.id,
            assistant_name: s.assistant?.name,
            date: s.session_started_at,
            sentiment: s.analysis?.sentiment,
            category: s.analysis?.category,
            resolution: s.analysis?.resolution_status,
            escalated: s.analysis?.escalated || false,
            messages: s.total_messages,
            duration_seconds: s.session_duration_seconds || 0,
            country: s.visitor_country,
            device: s.device_type,
            start_date: startDateStr,
            end_date: endDateStr,
          }));
          const filename = generateExportFilename('conversations', params.clientId, startDate, endDate);
          exportFn(data, filename, 'Conversations');
          break;
        }

        case 'questions': {
          const questionRows = assistantMetrics.flatMap((a) =>
            a.questions.map((q) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              question: q.question,
              frequency: q.frequency,
              answered: q.answered,
              start_date: startDateStr,
              end_date: endDateStr,
            }))
          );
          const unansweredRows = assistantMetrics.flatMap((a) =>
            a.unanswered.map((q) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              question: q.question,
              frequency: q.frequency,
              answered: q.answered,
              start_date: startDateStr,
              end_date: endDateStr,
            }))
          );
          const filename = generateExportFilename('questions', params.clientId, startDate, endDate);
          exportFn([...questionRows, ...unansweredRows], filename, 'Questions');
          break;
        }

        case 'audience': {
          const countries = assistantMetrics.flatMap((a) =>
            a.countries.map((c) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'country',
              name: c.country,
              count: c.count,
              percentage: c.percentage,
              start_date: startDateStr,
              end_date: endDateStr,
            }))
          );
          const languages = assistantMetrics.flatMap((a) =>
            a.languages.map((l) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'language',
              name: l.language,
              count: l.count,
              percentage: l.percentage,
              start_date: startDateStr,
              end_date: endDateStr,
            }))
          );
          const devices = assistantMetrics.flatMap((a) =>
            a.devices.map((d) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'device',
              name: d.deviceType,
              count: d.count,
              percentage: d.percentage,
              start_date: startDateStr,
              end_date: endDateStr,
            }))
          );
          const filename = generateExportFilename('audience', params.clientId, startDate, endDate);
          exportFn([...countries, ...languages, ...devices], filename, 'Audience');
          break;
        }

        case 'animations': {
          const rows = assistantMetrics.flatMap((a) => [
            ...a.animations.topAnimations.map((anim) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'animation',
              name: anim.animation,
              count: anim.count,
              start_date: startDateStr,
              end_date: endDateStr,
            })),
            ...a.animations.topEasterEggs.map((ee) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'easter_egg',
              name: ee.animation,
              count: ee.count,
              start_date: startDateStr,
              end_date: endDateStr,
            })),
            ...a.animations.waitSequences.map((ws) => ({
              assistant_id: a.assistantId,
              assistant_name: a.assistantName,
              type: 'wait_sequence',
              name: ws.sequence,
              count: ws.count,
              start_date: startDateStr,
              end_date: endDateStr,
            })),
          ]);
          const filename = generateExportFilename('animations', params.clientId, startDate, endDate);
          exportFn(rows, filename, 'Animations');
          break;
        }

        case 'costs': {
          const rows = assistantMetrics.map((a) => ({
            assistant_id: a.assistantId,
            assistant_name: a.assistantName,
            total_tokens: a.overview.totalTokens,
            total_cost_eur: a.overview.totalCostEur,
            start_date: startDateStr,
            end_date: endDateStr,
          }));
          const filename = generateExportFilename('costs', params.clientId, startDate, endDate);
          exportFn(rows, filename, 'Costs');
          break;
        }

        default:
          break;
      }

      setShowExportDropdown(false);
    },
    [activeTab, assistantMetrics, customDateRange, dateRange, normalizedSessions, params.clientId, useCustomRange, getExportDateRange]
  );

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
        if (normalizedSessions.length === 0) {
          return (
            <EmptyState
              icon={<MessageSquare size={48} />}
              title="No conversations"
              message="Adjust your filters to load conversation analytics."
            />
          );
        }
        return (
          <>
            <KpiGrid className="mb-6">
              <KpiCard icon={MessageSquare} label="Total Conversations" value={conversationStats.total} />
              <KpiCard
                icon={CheckCircle}
                label="Resolved"
                value={conversationStats.resolved}
                subtitle={`${conversationStats.resolutionRate.toFixed(0)}% resolution rate`}
              />
              <KpiCard
                icon={Clock}
                label="Avg Duration"
                value={`${(conversationStats.avgDurationSeconds / 60).toFixed(1)} min`}
              />
              <KpiCard icon={BarChart3} label="Sentiment">
                <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                  <span className="text-success-600 dark:text-success-500">+{conversationStats.sentimentCounts.positive}</span>
                  <span className="text-foreground-secondary">· {conversationStats.sentimentCounts.neutral}</span>
                  <span className="text-error-600 dark:text-error-500">-{conversationStats.sentimentCounts.negative}</span>
                </div>
              </KpiCard>
            </KpiGrid>
            <SharedConversationsTab
              sessions={normalizedSessions}
              paginatedSessions={paginatedConversations}
              brandColor={brandColor}
              showAssistantColumn
              pagination={{
                currentPage: conversationPage,
                totalPages: totalConversationPages,
                totalItems: normalizedSessions.length,
                itemsPerPage: CONVERSATIONS_PER_PAGE,
                onPageChange: setConversationPage,
              }}
            />
          </>
        );
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

        <Card className="mb-6 p-4 space-y-4 overflow-visible">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterBar
              workspaces={workspaces}
              selectedWorkspace={selectedWorkspace}
              onWorkspaceChange={setSelectedWorkspace}
              assistants={assistants}
              selectedAssistants={selectedAssistants}
              onAssistantChange={(ids) => setSelectedAssistants(ids.length ? ids : ['all'])}
              assistantSelectionMode="multi"
              brandColor={brandColor}
            />
            <div className="relative self-start lg:self-auto" ref={exportDropdownRef}>
              <button
                onClick={() => setShowExportDropdown((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground hover:bg-background-hover transition"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border border-border bg-surface-elevated shadow-lg z-20">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background-hover"
                  >
                    .csv
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background-hover"
                  >
                    .xlsx
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background-hover"
                  >
                    .json
                  </button>
                </div>
              )}
            </div>
          </div>

          <DateRangeBar
            brandColor={brandColor}
            dateRange={dateRange}
            useCustomRange={useCustomRange}
            customDateRange={customDateRange}
            presets={[1, 7, 30, 90]}
            onPresetChange={(days) => {
              setUseCustomRange(false);
              setDateRange(days);
            }}
            onCustomApply={(range) => setCustomDateRange(range)}
            onCustomToggle={(enabled) => setUseCustomRange(enabled)}
          />
        </Card>

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
