"use client";

import { useState, useEffect, useMemo, useRef, useCallback, use } from "react";
import { getClientById, getAssistantsByClientId } from '@/lib/dataService';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { getClientBrandColor } from '@/lib/brandColors';
import { getContrastTextColor } from '@/lib/chartColors';
import type { ChatSessionWithAnalysis, Workspace, Client, Assistant } from '@/types';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  ChevronDown,
} from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Card,
  EmptyState,
  Spinner,
  Modal,
  Button,
} from '@/components/ui';
import {
  KpiCard,
  KpiGrid,
  TabNavigation,
  ANALYTICS_TABS,
  FilterBar,
  ConversationsTab as SharedConversationsTab,
  normalizeSessions,
} from '@/components/analytics';
import { DateRangeBar } from '@/components/analytics/shared';
import { exportToCSV, exportToJSON, exportToXLSX, generateExportFilename, type ExportFormat } from '@/lib/export';

// Tab Components
import {
  OverviewTab,
  QuestionsTab,
  AudienceTab,
  AnimationsTab,
  CostsTab,
  CustomTab,
} from './components';


export default function ConversationHistoryPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBot, setSelectedBot] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [dateRange, setDateRange] = useState(30);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Data state
  const [sessions, setSessions] = useState<ChatSessionWithAnalysis[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedSession, setSelectedSession] = useState<ChatSessionWithAnalysis | null>(null);
  const [questionsSession, setQuestionsSession] = useState<ChatSessionWithAnalysis | null>(null);
  const [questionsType, setQuestionsType] = useState<'asked' | 'unanswered'>('asked');
  const scrollPositionRef = useRef<number>(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Get assistant info by mascot slug
  const getAssistantInfo = useCallback(
    (mascotId: string) => assistants.find((a) => a.id === mascotId),
    [assistants]
  );

  // Close export dropdown on outside click
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

  // Get date range filter
  const getDateRangeFilter = useCallback(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const start = new Date();

    if (useCustomRange && customDateRange.start && customDateRange.end) {
      const customStartDate = new Date(customDateRange.start);
      customStartDate.setHours(0, 0, 0, 0);
      const customEndDate = new Date(customDateRange.end);
      customEndDate.setHours(23, 59, 59, 999);
      return { start: customStartDate, end: customEndDate };
    }

    const days = typeof dateRange === 'number' ? dateRange : 30;
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    return { start, end: now };
  }, [customDateRange, dateRange, useCustomRange]);

  // Fetch client + assistants
  useEffect(() => {
    async function loadClientData() {
      try {
        setError(null);
        const [clientData, assistantsData] = await Promise.all([
          getClientById(clientId),
          getAssistantsByClientId(clientId),
        ]);
        setClient(clientData || null);
        setAssistants(assistantsData || []);
      } catch (err) {
        console.error('Error loading client/assistants:', err);
        setError('Failed to load client data. Please try again.');
      }
    }
    loadClientData();
  }, [clientId]);

  // Fetch sessions
  useEffect(() => {
    if (!client) return;

    async function loadData() {
      setLoading(true);
      try {
        const analytics = getAnalyticsForClient(clientId);
        const dateFilter = getDateRangeFilter();
        const sessionsData = await analytics.chatSessions.getWithAnalysisByClientId(clientId, {
          dateRange: dateFilter,
        });
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [clientId, client, dateRange, getDateRangeFilter]);

  // Fetch workspaces
  useEffect(() => {
    if (!client) return;

    async function loadWorkspaces() {
      try {
        const res = await fetch(`/api/workspaces?clientId=${clientId}`);
        const json = await res.json();
        setWorkspaces(json.data || []);
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
    }

    loadWorkspaces();
  }, [clientId, client]);

  // Modal handlers
  const handleOpenTranscript = useCallback((session: ChatSessionWithAnalysis) => {
    scrollPositionRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';
    setSelectedSession(session);
  }, []);

  const handleCloseTranscript = useCallback(() => {
    const scrollPos = scrollPositionRef.current;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPos);
    setSelectedSession(null);
  }, []);

  const handleOpenQuestions = useCallback(
    (session: ChatSessionWithAnalysis, type: 'asked' | 'unanswered') => {
      setQuestionsSession(session);
      setQuestionsType(type);
    },
    []
  );

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (selectedBot !== 'all' && session.mascot_slug !== selectedBot) return false;

      if (selectedStatus !== 'all') {
        const status = session.analysis?.resolution_status;
        if (selectedStatus === 'escalated') {
          if (!session.analysis?.escalated) return false;
        } else if (status !== selectedStatus) {
          return false;
        }
      }

      if (selectedWorkspace !== 'all') {
        const bot = getAssistantInfo(session.mascot_slug);
        if (bot?.workspaceSlug !== selectedWorkspace) return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const transcriptText = session.full_transcript?.map((m) => m.message).join(' ') || '';
        const summary = session.analysis?.summary || '';
        const category = session.analysis?.category || '';
        const sessionId = session.id || '';

        if (
          !sessionId.toLowerCase().includes(searchLower) &&
          !transcriptText.toLowerCase().includes(searchLower) &&
          !summary.toLowerCase().includes(searchLower) &&
          !category.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedBot, selectedStatus, selectedWorkspace, searchTerm, getAssistantInfo]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBot, selectedStatus, selectedWorkspace, searchTerm, activeTab, dateRange, useCustomRange, customDateRange]);

  // Ensure assistant selection stays in sync with workspace filter
  useEffect(() => {
    if (selectedWorkspace === 'all') return;
    const selectedAssistant = assistants.find((a) => a.id === selectedBot);
    if (selectedBot !== 'all' && (!selectedAssistant || selectedAssistant.workspaceSlug !== selectedWorkspace)) {
      setSelectedBot('all');
    }
  }, [assistants, selectedBot, selectedWorkspace]);

  // Normalize sessions for shared tabs + derive stats
  const { sessions: normalizedSessions, stats } = useMemo(
    () => normalizeSessions(filteredSessions, assistants),
    [filteredSessions, assistants]
  );

  const handleExport = useCallback(
    (format: ExportFormat) => {
      const { start, end } = getDateRangeFilter();
      const startDateStr = start.toISOString();
      const endDateStr = end.toISOString();
      const exportFn = format === 'csv' ? exportToCSV : format === 'xlsx' ? exportToXLSX : exportToJSON;

      const data = filteredSessions.map((s) => ({
        session_id: s.id,
        assistant_id: s.mascot_slug,
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

      const filename = generateExportFilename('conversations', clientId, start, end);
      exportFn(data, filename, 'Conversations');
      setShowExportDropdown(false);
    },
    [filteredSessions, getDateRangeFilter, clientId]
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(normalizedSessions.length / ITEMS_PER_PAGE));
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return normalizedSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [normalizedSessions, currentPage]);

  // Brand color
  const brandColor = useMemo(() => {
    return client ? getClientBrandColor(client.id) : '#6B7280';
  }, [client]);

  // Helper functions
  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '-';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatCost = (cost: number | null | undefined) => {
    if (!cost) return '-';
    return `€${cost.toFixed(4)}`;
  };

  const getStatusIcon = (session: ChatSessionWithAnalysis) => {
    if (session.analysis?.escalated) {
      return <AlertCircle size={16} className="text-warning-600 dark:text-warning-500" />;
    }
    switch (session.analysis?.resolution_status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-success-600 dark:text-success-500" />;
      case 'partial':
        return <Clock size={16} className="text-info-600 dark:text-info-500" />;
      case 'unresolved':
        return <AlertCircle size={16} className="text-error-600 dark:text-error-500" />;
      default:
        return <Clock size={16} className="text-foreground-tertiary" />;
    }
  };

  const getStatusLabel = (session: ChatSessionWithAnalysis) => {
    if (session.analysis?.escalated) return 'Escalated';
    const status = session.analysis?.resolution_status;
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSentimentIcon = (sentiment: string | null | undefined) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp size={14} className="text-success-600 dark:text-success-500" />;
      case 'negative':
        return <ThumbsDown size={14} className="text-error-600 dark:text-error-500" />;
      default:
        return <Minus size={14} className="text-foreground-tertiary" />;
    }
  };

  const getDeviceIcon = (deviceType: string | null | undefined) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={14} className="text-foreground-secondary" />;
      case 'tablet':
        return <Tablet size={14} className="text-foreground-secondary" />;
      default:
        return <Monitor size={14} className="text-foreground-secondary" />;
    }
  };

  // Shared tab props
  const baseTabProps = {
    sessions: normalizedSessions,
    paginatedSessions,
    brandColor,
    getAssistantInfo,
    onOpenTranscript: handleOpenTranscript,
    formatTimestamp,
    formatDuration,
    formatCost,
    currentPage,
    totalPages,
    totalItems: normalizedSessions.length,
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: setCurrentPage,
  };

  // Render active tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <Card className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-foreground-secondary">Loading conversations...</span>
        </Card>
      );
    }

    if (!client) {
      return (
        <Card className="py-12">
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="py-12">
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Error loading conversations"
            message={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </Card>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            {...baseTabProps}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getSentimentIcon={getSentimentIcon}
          />
        );
      case 'conversations':
        return (
          <>
            <KpiGrid className="mb-6">
              <KpiCard icon={MessageSquare} label="Total Conversations" value={normalizedSessions.length} />
              <KpiCard icon={CheckCircle} label="Resolved" value={normalizedSessions.filter((s) => s.analysis?.resolution_status === 'resolved').length} />
              <KpiCard icon={Clock} label="Avg Duration" value={normalizedSessions.length ? `${Math.round(normalizedSessions.reduce((sum, s) => sum + (s.analysis?.duration_seconds || 0), 0) / normalizedSessions.length / 60)} min` : '0 min'} />
              <KpiCard icon={BarChart3} label="Sentiment">
                <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                  <span className="text-success-600 dark:text-success-500">+{normalizedSessions.filter((s) => s.analysis?.sentiment === 'positive').length}</span>
                  <span className="text-foreground-secondary">· {normalizedSessions.filter((s) => s.analysis?.sentiment === 'neutral').length}</span>
                  <span className="text-error-600 dark:text-error-500">-{normalizedSessions.filter((s) => s.analysis?.sentiment === 'negative').length}</span>
                </div>
              </KpiCard>
            </KpiGrid>
            {normalizedSessions.length === 0 ? (
              <Card className="py-12">
                <EmptyState
                  icon={<MessageSquare size={48} />}
                  title="No conversations found"
                  message={
                    sessions.length === 0
                      ? 'No conversations yet for this time period'
                      : 'Try adjusting your search or filters'
                  }
                />
              </Card>
            ) : (
              <SharedConversationsTab
                sessions={normalizedSessions}
                paginatedSessions={paginatedSessions}
                brandColor={brandColor}
                showAssistantColumn
                onOpenTranscript={handleOpenTranscript}
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems: normalizedSessions.length,
                  itemsPerPage: ITEMS_PER_PAGE,
                  onPageChange: setCurrentPage,
                }}
              />
            )}
          </>
        );
      case 'questions':
        return <QuestionsTab {...baseTabProps} onOpenQuestions={handleOpenQuestions} />;
      case 'audience':
        return <AudienceTab {...baseTabProps} getDeviceIcon={getDeviceIcon} />;
      case 'animations':
        return <AnimationsTab {...baseTabProps} />;
      case 'costs':
        return <CostsTab {...baseTabProps} />;
      case 'custom':
        return <CustomTab {...baseTabProps} />;
      default:
        return null;
    }
  };

  return (
    <Page>
      <PageContent>
        <PageHeader title="Conversations" description="View and manage all customer conversations" />

        {/* Filters Bar */}
        <Card className="mb-6 p-4 space-y-4 overflow-visible">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterBar
              workspaces={workspaces}
              selectedWorkspace={selectedWorkspace}
              onWorkspaceChange={setSelectedWorkspace}
              assistants={assistants}
              assistantSelectionMode="single"
              selectedAssistants={[selectedBot]}
            onAssistantChange={(ids) => setSelectedBot(ids[0] || 'all')}
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'partial', label: 'Partial' },
              { value: 'unresolved', label: 'Unresolved' },
              { value: 'escalated', label: 'Escalated' },
            ]}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search conversations..."
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

        {/* Stats Overview - Using shared KpiCard */}
        <KpiGrid className="mb-6">
          <KpiCard
            icon={MessageSquare}
            label="Total Conversations"
            value={stats.total}
          />
          <KpiCard
            icon={CheckCircle}
            label="Resolved"
          value={stats.resolved}
          subtitle={`${stats.resolutionRate.toFixed(0)}% resolution rate`}
        />
        <KpiCard
          icon={Clock}
          label="Avg Duration"
          value={`${(stats.avgDurationSeconds / 60).toFixed(1)} min`}
        />
        <KpiCard icon={BarChart3} label="Sentiment">
          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <ThumbsUp size={14} className="text-success-600 dark:text-success-500" />
                {stats.sentimentCounts.positive}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Minus size={14} className="text-foreground-tertiary" />
                {stats.sentimentCounts.neutral}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <ThumbsDown size={14} className="text-error-600 dark:text-error-500" />
                {stats.sentimentCounts.negative}
              </span>
            </div>
          </KpiCard>
        </KpiGrid>

        {/* Tab Navigation - Using shared component */}
        <TabNavigation
          tabs={ANALYTICS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          brandColor={brandColor}
        />

        {/* Tab Content */}
        {renderTabContent()}

        {/* Transcript Modal */}
        <Modal isOpen={!!selectedSession} onClose={handleCloseTranscript} title="Transcript" size="lg">
          {selectedSession && (
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {selectedSession.full_transcript?.map((msg, i) => {
                const userTextColor = getContrastTextColor(brandColor);

                return (
                  <div key={i} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.author === 'user'
                          ? 'rounded-br-md'
                          : 'rounded-bl-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                      style={
                        msg.author === 'user'
                          ? {
                              backgroundColor: brandColor,
                              color: userTextColor,
                            }
                          : undefined
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              }) || <p className="text-center text-foreground-tertiary">No transcript available</p>}
            </div>
          )}
        </Modal>

        {/* Questions Modal */}
        <Modal
          isOpen={!!questionsSession}
          onClose={() => setQuestionsSession(null)}
          title={questionsType === 'asked' ? 'Questions Asked' : 'Unanswered Questions'}
          size="md"
        >
          {questionsSession && (
            <div className="max-h-[60vh] overflow-y-auto">
              {(() => {
                const questions =
                  questionsType === 'asked'
                    ? questionsSession.analysis?.questions
                    : questionsSession.analysis?.unanswered_questions;

                if (!questions || questions.length === 0) {
                  return (
                    <p className="text-center text-foreground-tertiary py-4">
                      No {questionsType === 'asked' ? 'questions' : 'unanswered questions'} found
                    </p>
                  );
                }

                return (
                  <ul className="space-y-3">
                    {questions.map((question, i) => (
                      <li key={i} className="flex gap-3 p-3 bg-background-secondary rounded-lg">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: questionsType === 'asked' ? brandColor : '#F59E0B',
                            color: questionsType === 'asked' ? getContrastTextColor(brandColor) : '#000',
                          }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground">{question}</p>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}
        </Modal>
      </PageContent>
    </Page>
  );
}
