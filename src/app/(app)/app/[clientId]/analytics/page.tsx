'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { getClientById, getBotsByClientId, getWorkspacesByClientId } from '@/lib/dataService';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import {
  fetchBotComparisonData,
  calculateTotals,
  calculateBotCosts,
  calculateReturnRate,
  calculateResolutionBreakdown,
  calculateHandoffs,
  getTopBrowser,
  generateMultiBotTimeSeries,
  formatDuration,
  formatCost,
  formatPercent,
  formatNumber,
  type BotWithMetrics,
  type AggregatedMetrics,
} from '@/lib/analytics/botComparison';
import type { Client, Bot, Workspace } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import { MultiLineChart } from '@/components/Charts';
import {
  BotComparisonTable,
  ProgressBar,
  TrendIndicator,
  type ColumnDefinition,
} from '@/components/analytics/BotComparisonTable';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  MessageSquare,
  Clock,
  Star,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  BarChart3,
  HelpCircle,
  Globe,
  Sparkles,
  DollarSign,
  Settings,
  Eye,
} from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Select,
  Spinner,
  EmptyState,
  Modal,
} from '@/components/ui';

export default function AnalyticsDashboardPage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [botMetrics, setBotMetrics] = useState<BotWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedBots, setSelectedBots] = useState<string[]>(['all']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [questionsModal, setQuestionsModal] = useState<{ open: boolean; questions: string[]; title: string }>({
    open: false,
    questions: [],
    title: '',
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          filteredBotList = filteredBotList.filter(b => b.workspaceId === selectedWorkspace);
        }
        if (!selectedBots.includes('all') && selectedBots.length > 0) {
          filteredBotList = filteredBotList.filter(b => selectedBots.includes(b.id));
        }

        // Convert date range to DateRange object
        const now = new Date();
        const daysMap: Record<string, number> = {
          'today': 1,
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset bot selection when workspace changes
  useEffect(() => {
    setSelectedBots(['all']);
  }, [selectedWorkspace]);

  // Calculate aggregated totals
  const totals = useMemo(() => calculateTotals(botMetrics), [botMetrics]);

  // Bot selection handlers
  const handleBotToggle = (botId: string) => {
    if (botId === 'all') {
      if (selectedBots.includes('all') || selectedBots.length === 0) {
        setSelectedBots([]);
      } else {
        setSelectedBots(['all']);
      }
    } else {
      setSelectedBots(prev => {
        const withoutAll = prev.filter(id => id !== 'all');
        if (prev.includes(botId)) {
          return withoutAll.filter(id => id !== botId);
        } else {
          return [...withoutAll, botId];
        }
      });
    }
  };

  const getSelectionLabel = () => {
    const workspaceFilteredBots = bots.filter(bot =>
      selectedWorkspace === 'all' || bot.workspaceId === selectedWorkspace
    );

    if (selectedBots.includes('all') || selectedBots.length === 0) {
      return 'All Bots';
    }
    if (selectedBots.length === 1) {
      const bot = workspaceFilteredBots.find(b => b.id === selectedBots[0]);
      return bot?.name || 'Select Bots';
    }
    return `${selectedBots.length} Bots Selected`;
  };

  // Tab configuration - matching Conversations page
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'questions', label: 'Questions & Gaps', icon: HelpCircle },
    { id: 'audience', label: 'Audience', icon: Globe },
    { id: 'animations', label: 'Animations', icon: Sparkles },
    { id: 'costs', label: 'True Costs', icon: DollarSign },
    { id: 'custom', label: 'Custom', icon: Settings },
  ];

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

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

  const workspaceOptions = [
    { value: 'all', label: 'All Workspaces' },
    ...workspaces.map(ws => ({ value: ws.id, label: ws.name })),
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
  ];

  // Column definitions for each tab
  const overviewColumns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => <span className="font-medium">{formatNumber(bot.overview.totalSessions)}</span>,
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (bot) => formatNumber(bot.overview.totalMessages),
      sortValue: (bot) => bot.overview.totalMessages,
      align: 'right',
    },
    {
      key: 'duration',
      header: 'Avg Duration',
      render: (bot) => formatDuration(bot.overview.averageSessionDurationSeconds),
      sortValue: (bot) => bot.overview.averageSessionDurationSeconds,
      align: 'right',
    },
    {
      key: 'resolution',
      header: 'Resolution Rate',
      render: (bot) => (
        <ProgressBar
          value={bot.overview.resolutionRate}
          color={bot.overview.resolutionRate >= 80 ? 'success' : bot.overview.resolutionRate >= 60 ? 'warning' : 'error'}
        />
      ),
      sortValue: (bot) => bot.overview.resolutionRate,
      width: '150px',
    },
    {
      key: 'returnRate',
      header: 'Return Rate',
      render: (bot) => {
        const { returnRate } = calculateReturnRate(bot);
        return formatPercent(returnRate);
      },
      sortValue: (bot) => calculateReturnRate(bot).returnRate,
      align: 'right',
    },
  ];

  const conversationsColumns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => formatNumber(bot.overview.totalSessions),
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'resolved',
      header: 'Resolved',
      render: (bot) => {
        const { resolved } = calculateResolutionBreakdown(bot);
        return <span className="text-success-600 dark:text-success-500">{resolved}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).resolved,
      align: 'right',
    },
    {
      key: 'partial',
      header: 'Partial',
      render: (bot) => {
        const { partial } = calculateResolutionBreakdown(bot);
        return <span className="text-warning-600 dark:text-warning-500">{partial}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).partial,
      align: 'right',
    },
    {
      key: 'unresolved',
      header: 'Unresolved',
      render: (bot) => {
        const { unresolved } = calculateResolutionBreakdown(bot);
        return <span className="text-error-600 dark:text-error-500">{unresolved}</span>;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).unresolved,
      align: 'right',
    },
    {
      key: 'escalated',
      header: 'Escalated',
      render: (bot) => {
        const { escalated } = calculateResolutionBreakdown(bot);
        return escalated;
      },
      sortValue: (bot) => calculateResolutionBreakdown(bot).escalated,
      align: 'right',
    },
    {
      key: 'sentiment',
      header: 'Sentiment',
      render: (bot) => (
        <div className="flex gap-1 text-xs">
          <span className="text-success-600 dark:text-success-500">{bot.sentiment.positive}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-foreground-secondary">{bot.sentiment.neutral}%</span>
          <span className="text-foreground-tertiary">/</span>
          <span className="text-error-600 dark:text-error-500">{bot.sentiment.negative}%</span>
        </div>
      ),
    },
  ];

  const questionsColumns: ColumnDefinition[] = [
    {
      key: 'questions',
      header: 'Questions',
      render: (bot) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuestionsModal({
              open: true,
              questions: bot.questions.map(q => q.question),
              title: `Questions - ${bot.botName}`,
            });
          }}
          className="text-info-600 dark:text-info-500 hover:underline"
        >
          {bot.questions.length}
        </button>
      ),
      sortValue: (bot) => bot.questions.length,
      align: 'right',
    },
    {
      key: 'answered',
      header: 'Answered',
      render: (bot) => {
        const answered = bot.questions.length - bot.unanswered.length;
        return <span className="text-success-600 dark:text-success-500">{answered}</span>;
      },
      sortValue: (bot) => bot.questions.length - bot.unanswered.length,
      align: 'right',
    },
    {
      key: 'unanswered',
      header: 'Unanswered',
      render: (bot) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuestionsModal({
              open: true,
              questions: bot.unanswered.map(q => q.question),
              title: `Unanswered Questions - ${bot.botName}`,
            });
          }}
          className="text-error-600 dark:text-error-500 hover:underline"
        >
          {bot.unanswered.length}
        </button>
      ),
      sortValue: (bot) => bot.unanswered.length,
      align: 'right',
    },
    {
      key: 'answerRate',
      header: 'Answer Rate',
      render: (bot) => {
        const rate = bot.questions.length > 0
          ? ((bot.questions.length - bot.unanswered.length) / bot.questions.length) * 100
          : 0;
        return (
          <ProgressBar
            value={rate}
            color={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'error'}
          />
        );
      },
      sortValue: (bot) => bot.questions.length > 0 ? ((bot.questions.length - bot.unanswered.length) / bot.questions.length) * 100 : 0,
      width: '150px',
    },
    {
      key: 'urlHandoffs',
      header: 'URL Handoffs',
      render: (bot) => calculateHandoffs(bot).urlHandoffs,
      sortValue: (bot) => calculateHandoffs(bot).urlHandoffs,
      align: 'right',
    },
    {
      key: 'emailHandoffs',
      header: 'Email Handoffs',
      render: (bot) => calculateHandoffs(bot).emailHandoffs,
      sortValue: (bot) => calculateHandoffs(bot).emailHandoffs,
      align: 'right',
    },
  ];

  const audienceColumns: ColumnDefinition[] = [
    {
      key: 'topCountry',
      header: 'Top Country',
      render: (bot) => bot.countries[0]?.country || '-',
    },
    {
      key: 'topLanguage',
      header: 'Top Language',
      render: (bot) => bot.languages[0]?.language || '-',
    },
    {
      key: 'mobile',
      header: 'Mobile %',
      render: (bot) => {
        const mobile = bot.devices.find(d => d.deviceType === 'mobile');
        return formatPercent(mobile?.percentage || 0);
      },
      sortValue: (bot) => bot.devices.find(d => d.deviceType === 'mobile')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'desktop',
      header: 'Desktop %',
      render: (bot) => {
        const desktop = bot.devices.find(d => d.deviceType === 'desktop');
        return formatPercent(desktop?.percentage || 0);
      },
      sortValue: (bot) => bot.devices.find(d => d.deviceType === 'desktop')?.percentage || 0,
      align: 'right',
    },
    {
      key: 'topBrowser',
      header: 'Top Browser',
      render: (bot) => getTopBrowser(bot),
    },
  ];

  const animationsColumns: ColumnDefinition[] = [
    {
      key: 'easterEggs',
      header: 'Easter Eggs',
      render: (bot) => formatNumber(bot.animations.easterEggsTriggered),
      sortValue: (bot) => bot.animations.easterEggsTriggered,
      align: 'right',
    },
    {
      key: 'sessionsWithEaster',
      header: 'Sessions w/ Easter',
      render: (bot) => formatNumber(bot.animations.sessionsWithEasterEggs),
      sortValue: (bot) => bot.animations.sessionsWithEasterEggs,
      align: 'right',
    },
    {
      key: 'easterRate',
      header: 'Easter Rate',
      render: (bot) => {
        const rate = bot.animations.totalSessions > 0
          ? (bot.animations.sessionsWithEasterEggs / bot.animations.totalSessions) * 100
          : 0;
        return formatPercent(rate);
      },
      sortValue: (bot) => bot.animations.totalSessions > 0 ? (bot.animations.sessionsWithEasterEggs / bot.animations.totalSessions) * 100 : 0,
      align: 'right',
    },
    {
      key: 'topEasterEgg',
      header: 'Top Easter Egg',
      render: (bot) => bot.animations.topEasterEggs[0]?.animation || '-',
    },
    {
      key: 'newUsers',
      header: 'New Users',
      render: (bot) => {
        const { newUsers } = calculateReturnRate(bot);
        return formatNumber(newUsers);
      },
      sortValue: (bot) => calculateReturnRate(bot).newUsers,
      align: 'right',
    },
    {
      key: 'returningUsers',
      header: 'Returning',
      render: (bot) => {
        const { returningUsers } = calculateReturnRate(bot);
        return formatNumber(returningUsers);
      },
      sortValue: (bot) => calculateReturnRate(bot).returningUsers,
      align: 'right',
    },
  ];

  const costsColumns: ColumnDefinition[] = [
    {
      key: 'sessions',
      header: 'Sessions',
      render: (bot) => formatNumber(bot.overview.totalSessions),
      sortValue: (bot) => bot.overview.totalSessions,
      align: 'right',
    },
    {
      key: 'tokens',
      header: 'Total Tokens',
      render: (bot) => formatNumber(bot.overview.totalTokens),
      sortValue: (bot) => bot.overview.totalTokens,
      align: 'right',
    },
    {
      key: 'chatCost',
      header: 'Chat Cost',
      render: (bot) => {
        const { chatCost } = calculateBotCosts(bot);
        return formatCost(chatCost);
      },
      sortValue: (bot) => calculateBotCosts(bot).chatCost,
      align: 'right',
    },
    {
      key: 'analysisCost',
      header: 'Analysis Cost',
      render: (bot) => {
        const { analysisCost } = calculateBotCosts(bot);
        return formatCost(analysisCost);
      },
      sortValue: (bot) => calculateBotCosts(bot).analysisCost,
      align: 'right',
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (bot) => {
        const { totalCost } = calculateBotCosts(bot);
        return <span className="font-semibold">{formatCost(totalCost)}</span>;
      },
      sortValue: (bot) => calculateBotCosts(bot).totalCost,
      align: 'right',
    },
    {
      key: 'costPerSession',
      header: 'Cost/Session',
      render: (bot) => {
        const { costPerSession } = calculateBotCosts(bot);
        return formatCost(costPerSession);
      },
      sortValue: (bot) => calculateBotCosts(bot).costPerSession,
      align: 'right',
    },
  ];

  const customColumns: ColumnDefinition[] = [
    {
      key: 'custom1',
      header: 'Custom Field 1',
      render: () => '-',
    },
    {
      key: 'custom2',
      header: 'Custom Field 2',
      render: () => '-',
    },
  ];

  // Get columns for current tab
  const getColumnsForTab = () => {
    switch (activeTab) {
      case 'overview': return overviewColumns;
      case 'conversations': return conversationsColumns;
      case 'questions': return questionsColumns;
      case 'audience': return audienceColumns;
      case 'animations': return animationsColumns;
      case 'costs': return costsColumns;
      case 'custom': return customColumns;
      default: return overviewColumns;
    }
  };

  // Get KPI cards for current tab
  const renderKPICards = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <MessageSquare size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totals.totalSessions)}</h3>
              <p className="text-foreground-secondary text-sm">Total Sessions</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <CheckCircle size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatPercent(totals.avgResolutionRate)}</h3>
              <p className="text-foreground-secondary text-sm">Avg Resolution Rate</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <Clock size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatDuration(totals.avgSessionDurationSeconds)}</h3>
              <p className="text-foreground-secondary text-sm">Avg Duration</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-plan-premium-bg rounded-lg">
                  <Users size={24} className="text-plan-premium-text" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totals.totalMessages)}</h3>
              <p className="text-foreground-secondary text-sm">Total Messages</p>
            </div>
          </div>
        );

      case 'conversations':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <CheckCircle size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatPercent(totals.avgResolutionRate)}</h3>
              <p className="text-foreground-secondary text-sm">Resolution Rate</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <AlertTriangle size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatPercent(totals.avgEscalationRate)}</h3>
              <p className="text-foreground-secondary text-sm">Escalation Rate</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <Star size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{totals.sentiment.positive}%</h3>
              <p className="text-foreground-secondary text-sm">Positive Sentiment</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-error-100 dark:bg-error-700/30 rounded-lg">
                  <TrendingUp size={24} className="text-error-600 dark:text-error-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{totals.sentiment.negative}%</h3>
              <p className="text-foreground-secondary text-sm">Negative Sentiment</p>
            </div>
          </div>
        );

      case 'questions':
        const totalQuestions = botMetrics.reduce((sum, b) => sum + b.questions.length, 0);
        const totalUnanswered = botMetrics.reduce((sum, b) => sum + b.unanswered.length, 0);
        const totalAnswered = totalQuestions - totalUnanswered;
        const avgAnswerRate = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
        const totalUrlHandoffs = botMetrics.reduce((sum, b) => sum + calculateHandoffs(b).urlHandoffs, 0);
        const totalEmailHandoffs = botMetrics.reduce((sum, b) => sum + calculateHandoffs(b).emailHandoffs, 0);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <HelpCircle size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalQuestions)}</h3>
              <p className="text-foreground-secondary text-sm">Total Questions</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <CheckCircle size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatPercent(avgAnswerRate)}</h3>
              <p className="text-foreground-secondary text-sm">Answer Rate</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <AlertTriangle size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalUnanswered)}</h3>
              <p className="text-foreground-secondary text-sm">Knowledge Gaps</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-plan-premium-bg rounded-lg">
                  <Globe size={24} className="text-plan-premium-text" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalUrlHandoffs + totalEmailHandoffs)}</h3>
              <p className="text-foreground-secondary text-sm">Total Handoffs</p>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <Globe size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totals.totalSessions)}</h3>
              <p className="text-foreground-secondary text-sm">Total Visitors</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <Users size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {botMetrics.length > 0 ? new Set(botMetrics.flatMap(b => b.countries.map(c => c.country))).size : 0}
              </h3>
              <p className="text-foreground-secondary text-sm">Countries</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <MessageSquare size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {botMetrics.length > 0 ? new Set(botMetrics.flatMap(b => b.languages.map(l => l.language))).size : 0}
              </h3>
              <p className="text-foreground-secondary text-sm">Languages</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-plan-premium-bg rounded-lg">
                  <BarChart3 size={24} className="text-plan-premium-text" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {botMetrics.length > 0 ? new Set(botMetrics.flatMap(b => b.devices.map(d => d.deviceType))).size : 0}
              </h3>
              <p className="text-foreground-secondary text-sm">Device Types</p>
            </div>
          </div>
        );

      case 'animations':
        const totalEasterEggs = botMetrics.reduce((sum, b) => sum + b.animations.easterEggsTriggered, 0);
        const totalSessionsWithEaster = botMetrics.reduce((sum, b) => sum + b.animations.sessionsWithEasterEggs, 0);
        const totalAnimationSessions = botMetrics.reduce((sum, b) => sum + b.animations.totalSessions, 0);
        const easterRate = totalAnimationSessions > 0 ? (totalSessionsWithEaster / totalAnimationSessions) * 100 : 0;
        const totalNewUsers = botMetrics.reduce((sum, b) => sum + calculateReturnRate(b).newUsers, 0);
        const totalReturning = botMetrics.reduce((sum, b) => sum + calculateReturnRate(b).returningUsers, 0);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <Sparkles size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalEasterEggs)}</h3>
              <p className="text-foreground-secondary text-sm">Easter Eggs Triggered</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <Star size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatPercent(easterRate)}</h3>
              <p className="text-foreground-secondary text-sm">Easter Egg Rate</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <Users size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalNewUsers)}</h3>
              <p className="text-foreground-secondary text-sm">New Users</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-plan-premium-bg rounded-lg">
                  <TrendingUp size={24} className="text-plan-premium-text" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatNumber(totalReturning)}</h3>
              <p className="text-foreground-secondary text-sm">Returning Users</p>
            </div>
          </div>
        );

      case 'costs':
        const totalChatCost = botMetrics.reduce((sum, b) => sum + calculateBotCosts(b).chatCost, 0);
        const totalAnalysisCost = botMetrics.reduce((sum, b) => sum + calculateBotCosts(b).analysisCost, 0);
        const totalCost = totalChatCost + totalAnalysisCost;
        const avgCostPerSession = totals.totalSessions > 0 ? totalCost / totals.totalSessions : 0;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info-100 dark:bg-info-700/30 rounded-lg">
                  <DollarSign size={24} className="text-info-600 dark:text-info-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatCost(totalChatCost)}</h3>
              <p className="text-foreground-secondary text-sm">Chat Cost</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-700/30 rounded-lg">
                  <BarChart3 size={24} className="text-success-600 dark:text-success-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatCost(totalAnalysisCost)}</h3>
              <p className="text-foreground-secondary text-sm">Analysis Cost</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-700/30 rounded-lg">
                  <TrendingUp size={24} className="text-warning-600 dark:text-warning-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatCost(totalCost)}</h3>
              <p className="text-foreground-secondary text-sm">Total Cost</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-plan-premium-bg rounded-lg">
                  <Clock size={24} className="text-plan-premium-text" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{formatCost(avgCostPerSession)}</h3>
              <p className="text-foreground-secondary text-sm">Avg Cost/Session</p>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="p-6 mb-6 bg-background-secondary rounded-lg border border-border">
            <p className="text-foreground-secondary text-center">Custom metrics coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Render charts for current tab
  const renderCharts = () => {
    if (botMetrics.length === 0) return null;

    switch (activeTab) {
      case 'overview':
        const sessionsData = generateMultiBotTimeSeries(botMetrics, 'sessions');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sessions Over Time</h3>
              <div className="h-80">
                <MultiLineChart
                  data={sessionsData}
                  series={botMetrics.map(b => ({ name: b.botName, dataKey: b.botName }))}
                  xAxisKey="date"
                  yAxisLabel="Sessions"
                  height={300}
                />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Messages Over Time</h3>
              <div className="h-80">
                <MultiLineChart
                  data={generateMultiBotTimeSeries(botMetrics, 'messages')}
                  series={botMetrics.map(b => ({ name: b.botName, dataKey: b.botName }))}
                  xAxisKey="date"
                  yAxisLabel="Messages"
                  height={300}
                />
              </div>
            </div>
          </div>
        );

      case 'costs':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cost Over Time</h3>
              <div className="h-80">
                <MultiLineChart
                  data={generateMultiBotTimeSeries(botMetrics, 'cost')}
                  series={botMetrics.map(b => ({ name: b.botName, dataKey: b.botName }))}
                  xAxisKey="date"
                  yAxisLabel="Cost (€)"
                  height={300}
                />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Token Usage Over Time</h3>
              <div className="h-80">
                <MultiLineChart
                  data={generateMultiBotTimeSeries(botMetrics, 'tokens')}
                  series={botMetrics.map(b => ({ name: b.botName, dataKey: b.botName }))}
                  xAxisKey="date"
                  yAxisLabel="Tokens"
                  height={300}
                />
              </div>
            </div>
          </div>
        );

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
              : `${workspaces.find(w => w.id === selectedWorkspace)?.name || 'Workspace'} - ${client.name}`
          }
        />

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-end mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground-secondary">Workspace:</span>
            </div>
            <Select
              fullWidth={false}
              options={workspaceOptions}
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              minWidth="180px"
            />
          </div>

          {/* Bot Selection Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground-secondary">Bot Selection:</span>
            </div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-11 px-4 bg-info-100 dark:bg-info-700/30 border-2 border-info-500/30 rounded-xl hover:bg-info-100/80 dark:hover:bg-info-700/40 focus:outline-none focus:ring-2 focus:ring-info-500 min-w-[200px] justify-between"
            >
              <span className="truncate font-medium text-info-700 dark:text-info-500">{getSelectionLabel()}</span>
              <ChevronDown size={16} className={`transition-transform text-info-600 dark:text-info-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-surface-elevated border border-border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <h4 className="font-medium text-sm text-foreground-secondary">Select Bots to Compare</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBots.includes('all') || selectedBots.length === 0}
                      onChange={() => handleBotToggle('all')}
                      className="rounded border-border text-interactive focus:ring-interactive"
                    />
                    <span className="text-sm font-medium text-foreground">All Bots</span>
                  </label>
                  <hr className="mx-3 border-border" />
                  {selectedWorkspace === 'all' ? (
                    workspaces.map(workspace => {
                      const workspaceBots = bots.filter(bot => bot.workspaceId === workspace.id);
                      if (workspaceBots.length === 0) return null;

                      return (
                        <div key={workspace.id}>
                          <div className="px-3 py-2 text-xs font-medium text-foreground-tertiary bg-background-secondary border-t border-border">
                            {workspace.name}
                          </div>
                          {workspaceBots.map(bot => (
                            <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBots.includes(bot.id)}
                                onChange={() => handleBotToggle(bot.id)}
                                className="rounded border-border text-interactive focus:ring-interactive"
                              />
                              <img
                                src={bot.image}
                                alt={bot.name}
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: brandColor }}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-foreground">{bot.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                                bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                                'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                              }`}>
                                {bot.status}
                              </span>
                            </label>
                          ))}
                        </div>
                      );
                    })
                  ) : (
                    bots.filter(bot => bot.workspaceId === selectedWorkspace).map(bot => (
                      <label key={bot.id} className="flex items-center gap-3 p-3 hover:bg-background-hover cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBots.includes(bot.id)}
                          onChange={() => handleBotToggle(bot.id)}
                          className="rounded border-border text-interactive focus:ring-interactive"
                        />
                        <img
                          src={bot.image}
                          alt={bot.name}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: brandColor }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{bot.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          bot.status === 'Live' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500' :
                          bot.status === 'Paused' ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-500' :
                          'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-500'
                        }`}>
                          {bot.status}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Select
            fullWidth={false}
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            minWidth="140px"
          />
          <Button variant="secondary" icon={<Filter size={18} />}>
            Filters
          </Button>
          <Button icon={<Download size={18} />}>
            Export Report
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border-secondary'
                    }`}
                    style={activeTab === tab.id ? { borderBottomColor: brandColor } : {}}
                  >
                    <Icon
                      size={20}
                      className={`mr-2 ${
                        activeTab === tab.id ? 'text-foreground' : 'text-foreground-tertiary group-hover:text-foreground-secondary'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {metricsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            {renderKPICards()}

            {/* Charts */}
            {renderCharts()}

            {/* Bot Comparison Table */}
            <BotComparisonTable
              bots={botMetrics}
              columns={getColumnsForTab()}
              brandColor={brandColor}
              title={`Bot Comparison - ${tabs.find(t => t.id === activeTab)?.label || 'Overview'}`}
              description={
                botMetrics.length === 0
                  ? 'No bots selected'
                  : `Comparing ${botMetrics.length} bot${botMetrics.length !== 1 ? 's' : ''}`
              }
              emptyMessage="Select bots to compare their metrics"
              expandableContent={
                activeTab === 'questions'
                  ? (bot) => (
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Top Unanswered Questions</h4>
                        {bot.unanswered.length > 0 ? (
                          <ul className="space-y-2">
                            {bot.unanswered.slice(0, 5).map((q, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-warning-600 dark:text-warning-500 font-medium">•</span>
                                <span className="text-foreground">{q.question}</span>
                                <span className="text-foreground-tertiary">({q.frequency}x)</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-foreground-tertiary text-sm">No unanswered questions</p>
                        )}
                      </div>
                    )
                  : undefined
              }
            />
          </>
        )}

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
