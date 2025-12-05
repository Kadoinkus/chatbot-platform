'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Globe,
  Sparkles,
  Receipt,
  Bot as BotIcon,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  MapPin,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

import { getClientById, getBotById } from '@/lib/dataService';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { getClientBrandColor } from '@/lib/brandColors';
import { getChartColors } from '@/lib/chartColors';
import { tooltipStyle } from '@/lib/chartStyles';
import type { Client, Bot, ChatSessionWithAnalysis } from '@/types';
import type { OverviewMetrics, SentimentBreakdown, CategoryBreakdown, LanguageBreakdown, CountryBreakdown, TimeSeriesDataPoint, QuestionAnalytics, DeviceBreakdown, SentimentTimeSeriesDataPoint, HourlyBreakdown, AnimationStats } from '@/lib/db/analytics';
import { Page, PageContent, PageHeader, Card, Button, Input, Spinner, EmptyState } from '@/components/ui';

// Import Cell directly (doesn't work well with dynamic import)
import { Cell } from 'recharts';

// Dynamically import other Recharts components
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

// Tab configuration matching the analytics spec
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'questions', label: 'Questions & Gaps', icon: HelpCircle },
  { id: 'audience', label: 'Audience', icon: Globe },
  { id: 'animations', label: 'Animations', icon: Sparkles },
  { id: 'costs', label: 'True Costs', icon: Receipt },
  { id: 'custom', label: 'Custom Metrics', icon: Filter }
];

export default function BotAnalyticsPage({ params }: { params: { clientId: string; botId: string } }) {
  // State
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(30);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Analytics data state
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [sentiment, setSentiment] = useState<SentimentBreakdown | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [languages, setLanguages] = useState<LanguageBreakdown[]>([]);
  const [countries, setCountries] = useState<CountryBreakdown[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdown[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [questions, setQuestions] = useState<QuestionAnalytics[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<QuestionAnalytics[]>([]);
  const [sessions, setSessions] = useState<ChatSessionWithAnalysis[]>([]);
  const [sentimentTimeSeries, setSentimentTimeSeries] = useState<SentimentTimeSeriesDataPoint[]>([]);
  const [hourlyBreakdown, setHourlyBreakdown] = useState<HourlyBreakdown[]>([]);
  const [animationStats, setAnimationStats] = useState<AnimationStats | null>(null);

  const brandColor = useMemo(() => {
    return client ? getClientBrandColor(client.id) : '#6B7280';
  }, [client]);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Calculate date range
        let startDate: Date, endDate: Date;
        if (useCustomRange && customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          startDate = new Date();
          startDate.setDate(startDate.getDate() - dateRange);
          startDate.setHours(0, 0, 0, 0);
        }

        const dateRangeFilter = { start: startDate, end: endDate };

        // Load basic data
        const [clientData, botData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId)
        ]);

        setClient(clientData);
        setBot(botData);

        if (!clientData) {
          setLoading(false);
          return;
        }

        // Get analytics for this client (hybrid routing)
        const analytics = getAnalyticsForClient(clientData.id);

        // Load all analytics data in parallel
        const [
          overviewData,
          sentimentData,
          categoriesData,
          languagesData,
          countriesData,
          devicesData,
          timeSeriesData,
          questionsData,
          unansweredData,
          sessionsData,
          sentimentTimeSeriesData,
          hourlyBreakdownData,
          animationStatsData
        ] = await Promise.all([
          analytics.aggregations.getOverviewByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getSentimentByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getCategoriesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getLanguagesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getCountriesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getDevicesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getTimeSeriesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getQuestionsByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getUnansweredQuestionsByBotId(params.botId, dateRangeFilter),
          analytics.chatSessions.getWithAnalysisByBotId(params.botId, { dateRange: dateRangeFilter }),
          analytics.aggregations.getSentimentTimeSeriesByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getHourlyBreakdownByBotId(params.botId, dateRangeFilter),
          analytics.aggregations.getAnimationStatsByBotId(params.botId, dateRangeFilter)
        ]);

        setOverview(overviewData);
        setSentiment(sentimentData);
        setCategories(categoriesData);
        setLanguages(languagesData);
        setCountries(countriesData);
        setDevices(devicesData);
        setTimeSeries(timeSeriesData);
        setQuestions(questionsData);
        setUnansweredQuestions(unansweredData);
        setSessions(sessionsData);
        setSentimentTimeSeries(sentimentTimeSeriesData);
        setHourlyBreakdown(hourlyBreakdownData);
        setAnimationStats(animationStatsData);

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.clientId, params.botId, dateRange, useCustomRange, customDateRange]);

  // Format helpers
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('nl-NL').format(Math.round(value));
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Loading state
  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  // Not found state
  if (!client || !bot) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BotIcon size={48} />}
            title="Bot not found"
            message="The requested bot could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  // Sentiment data for pie chart - using getChartColors order (brand → black → white)
  const sentimentColors = getChartColors(brandColor, 3);
  const sentimentChartData = sentiment ? [
    { name: 'Positive', value: sentiment.positive, fill: sentimentColors[0] },  // Brand
    { name: 'Neutral', value: sentiment.neutral, fill: sentimentColors[2] },    // White
    { name: 'Negative', value: sentiment.negative, fill: sentimentColors[1] }   // Black
  ] : [];

  // Resolution data - using getChartColors order (brand → black → white)
  const resolutionColors = getChartColors(brandColor, 3);
  const resolutionData = sessions.length > 0 ? [
    { name: 'Resolved', value: sessions.filter(s => s.analysis?.resolution_status === 'resolved').length, fill: resolutionColors[0] },   // Brand
    { name: 'Partial', value: sessions.filter(s => s.analysis?.resolution_status === 'partial').length, fill: resolutionColors[2] },    // White
    { name: 'Unresolved', value: sessions.filter(s => s.analysis?.resolution_status === 'unresolved').length, fill: resolutionColors[1] } // Black
  ] : [];

  return (
    <Page>
      <PageContent>
        <PageHeader
          title={`${bot.name} Analytics`}
          description={bot.description}
          backLink={
            <Link
              href={`/app/${client.id}`}
              className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back to bots
            </Link>
          }
        />

        {/* Header Card */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={bot.image}
                alt={bot.name}
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{bot.name} Analytics</h1>
                <p className="text-foreground-secondary">{bot.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Calendar size={16} className="text-foreground-tertiary" />
              <span className="text-sm font-medium text-foreground-secondary">Time Period:</span>

              <div className="flex gap-1 bg-background-tertiary p-1 rounded-lg">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => { setUseCustomRange(false); setDateRange(days); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !useCustomRange && dateRange === days
                        ? 'bg-surface-elevated text-foreground shadow-sm'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-hover'
                    }`}
                    style={!useCustomRange && dateRange === days ? { color: brandColor } : {}}
                  >
                    Last {days} days
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  useCustomRange
                    ? 'text-white shadow-sm'
                    : 'bg-surface-elevated text-foreground-secondary border-border hover:bg-background-hover'
                }`}
                style={useCustomRange ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              >
                Custom Range
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground-tertiary bg-background-secondary px-3 py-2 rounded-lg">
              <BarChart3 size={14} />
              {useCustomRange && customDateRange.start && customDateRange.end
                ? `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`
                : `Showing last ${dateRange} days`}
            </div>
          </div>

          {/* Custom Date Picker */}
          {showDatePicker && (
            <div className="bg-background-secondary rounded-lg p-4 border border-border mt-4">
              <h4 className="font-medium text-foreground mb-3">Select Custom Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  max={customDateRange.end || new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={customDateRange.start}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowDatePicker(false); setUseCustomRange(false); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (customDateRange.start && customDateRange.end) {
                      setUseCustomRange(true);
                      setShowDatePicker(false);
                    }
                  }}
                  disabled={!customDateRange.start || !customDateRange.end}
                >
                  Apply Range
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Tab Navigation */}
        <Card className="mb-6 p-0">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-interactive text-foreground'
                        : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border'
                    }`}
                    style={activeTab === tab.id ? { borderBottomColor: brandColor } : {}}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Users size={16} />
                  <span className="text-sm">Total Sessions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(overview?.totalSessions || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Total Messages</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(overview?.totalMessages || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Response</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {((overview?.averageResponseTimeMs || 0) / 1000).toFixed(1)}s
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Resolution Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPercent(overview?.resolutionRate || 0)}</p>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sessions Over Time */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Sessions Over Time</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <Tooltip {...tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke={brandColor}
                        fill={brandColor}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Sentiment Distribution */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Sentiment Distribution</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend
                        formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Categories */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                      width={150}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" fill={brandColor} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-6">
            {/* Conversation KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Duration</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(overview?.averageSessionDurationSeconds || 0)}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Escalation Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPercent(overview?.escalationRate || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <ThumbsUp size={16} />
                  <span className="text-sm">Positive</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{sentiment?.positive || 0}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <ThumbsDown size={16} />
                  <span className="text-sm">Negative</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{sentiment?.negative || 0}</p>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Over Time */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Sentiment Over Time</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend
                        formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
                      />
                      <Area type="monotone" dataKey="positive" stackId="1" stroke={sentimentColors[0]} fill={sentimentColors[0]} fillOpacity={0.6} name="Positive" />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke={sentimentColors[2]} fill={sentimentColors[2]} fillOpacity={0.6} name="Neutral" />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke={sentimentColors[1]} fill={sentimentColors[1]} fillOpacity={0.6} name="Negative" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Resolution Status */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Resolution Status</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resolutionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {resolutionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend
                        formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Peak Hours */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Peak Hours</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip
                      {...tooltipStyle}
                      labelFormatter={(value) => `${value}:00 - ${value}:59`}
                    />
                    <Bar dataKey="count" fill={brandColor} radius={[4, 4, 0, 0]} name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Sessions Table */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Recent Conversations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Messages</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Sentiment</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map((session) => (
                      <tr key={session.id} className="border-b border-border hover:bg-background-hover">
                        <td className="py-3 px-4 text-foreground">
                          {new Date(session.session_started_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-foreground">{session.total_messages}</td>
                        <td className="py-3 px-4 text-foreground">{session.analysis?.category || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            session.analysis?.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            session.analysis?.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {session.analysis?.sentiment === 'positive' && <ThumbsUp size={12} />}
                            {session.analysis?.sentiment === 'negative' && <ThumbsDown size={12} />}
                            {session.analysis?.sentiment === 'neutral' && <Minus size={12} />}
                            {session.analysis?.sentiment || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.analysis?.resolution_status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            session.analysis?.resolution_status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {session.analysis?.resolution_status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <HelpCircle size={16} />
                  <span className="text-sm">Total Questions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(questions.length)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Unanswered</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(unansweredQuestions.length)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Answer Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPercent(questions.length > 0 ? ((questions.length - unansweredQuestions.length) / questions.length) * 100 : 0)}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <BarChart3 size={16} />
                  <span className="text-sm">Top Category</span>
                </div>
                <p className="text-2xl font-bold text-foreground truncate">{categories[0]?.category || '-'}</p>
              </Card>
            </div>

            {/* Questions Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Top Questions Asked</h3>
                <div className="space-y-3">
                  {questions.slice(0, 10).map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                      <span className="text-sm text-foreground flex-1 mr-4">{q.question}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground-secondary">{q.frequency}x</span>
                        {q.answered ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <AlertTriangle size={16} className="text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Unanswered Questions</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">
                    {unansweredQuestions.length} gaps
                  </span>
                </div>
                <div className="space-y-3">
                  {unansweredQuestions.slice(0, 10).map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                      <span className="text-sm text-foreground flex-1 mr-4">{q.question}</span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{q.frequency}x</span>
                    </div>
                  ))}
                  {unansweredQuestions.length === 0 && (
                    <div className="text-center py-8 text-foreground-secondary">
                      <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                      <p>All questions answered!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            {/* Audience KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Globe size={16} />
                  <span className="text-sm">Countries</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{countries.length}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Languages</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{languages.length}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Monitor size={16} />
                  <span className="text-sm">Device Types</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{devices.length}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Smartphone size={16} />
                  <span className="text-sm">Mobile Users</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPercent(devices.find(d => d.deviceType?.toLowerCase() === 'mobile')?.percentage || 0)}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Countries */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Top Countries</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countries.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <YAxis
                        type="category"
                        dataKey="country"
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                        width={80}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="count" fill={brandColor} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Languages */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Languages</h3>
                <div className="space-y-3">
                  {languages.slice(0, 8).map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{lang.language}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-background-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${lang.percentage}%`, backgroundColor: brandColor }}
                          />
                        </div>
                        <span className="text-sm text-foreground-secondary w-12 text-right">
                          {formatPercent(lang.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Devices */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Device Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                {devices.map((device, index) => {
                  const Icon = device.deviceType?.toLowerCase() === 'mobile' ? Smartphone :
                             device.deviceType?.toLowerCase() === 'tablet' ? Tablet : Monitor;
                  return (
                    <div key={index} className="text-center p-4 bg-background-secondary rounded-lg">
                      <Icon size={32} className="mx-auto mb-2 text-foreground-secondary" />
                      <p className="text-2xl font-bold text-foreground">{formatPercent(device.percentage)}</p>
                      <p className="text-sm text-foreground-secondary">{device.deviceType || 'Unknown'}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="space-y-6">
            {/* Animation KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Sparkles size={16} />
                  <span className="text-sm">Total Triggers</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(animationStats?.totalTriggers || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Users size={16} />
                  <span className="text-sm">Unique Animations</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{animationStats?.topAnimations?.length || 0}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Easter Egg % per Session</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {animationStats?.totalSessions ? formatPercent((animationStats.sessionsWithEasterEggs / animationStats.totalSessions) * 100) : '0%'}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Easter Eggs Found</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(animationStats?.easterEggsTriggered || 0)}</p>
              </Card>
            </div>

            {/* Top Animations Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Top Response Animations</h3>
                {animationStats?.topAnimations && animationStats.topAnimations.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={animationStats.topAnimations} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                        <YAxis
                          dataKey="animation"
                          type="category"
                          width={140}
                          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                          tickFormatter={(value) => value.replace(/_/g, ' ').replace('2type T', '')}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" fill={brandColor} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center">
                    <p className="text-foreground-secondary">No animation data available</p>
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-4">Easter Egg Triggers</h3>
                {animationStats?.topEasterEggs && animationStats.topEasterEggs.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={animationStats.topEasterEggs} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                        <YAxis
                          dataKey="animation"
                          type="category"
                          width={140}
                          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                          tickFormatter={(value) => value.replace('easter_', '').replace(/_/g, ' ')}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" fill={brandColor} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center">
                    <p className="text-foreground-secondary">No easter eggs triggered yet</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Wait Sequence Distribution */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Wait Sequence Distribution</h3>
              <p className="text-sm text-foreground-secondary mb-4">Idle animation playlists triggered after each bot response</p>
              {animationStats?.waitSequences && animationStats.waitSequences.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={animationStats.waitSequences}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="sequence"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        tickFormatter={(value) => `Playlist ${value.toUpperCase()}`}
                      />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(value, name) => [value, 'Times Played']}
                        labelFormatter={(label) => `Wait Playlist ${label.toUpperCase()}`}
                      />
                      <Bar dataKey="count" fill={brandColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <p className="text-foreground-secondary">No wait sequence data available</p>
                </div>
              )}
            </Card>

            {/* Easter Eggs in Conversations */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Easter Eggs in Conversations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[280px]">
                  {(() => {
                    const sessionsWithEasterEggs = animationStats?.sessionsWithEasterEggs || 0;
                    const totalSessions = animationStats?.totalSessions || 0;
                    const sessionsWithoutEasterEggs = totalSessions - sessionsWithEasterEggs;
                    const easterEggData = [
                      { name: 'With Easter Eggs', value: sessionsWithEasterEggs, color: brandColor },
                      { name: 'Without Easter Eggs', value: sessionsWithoutEasterEggs, color: '#71717A' }
                    ];

                    return totalSessions > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={easterEggData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {easterEggData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-foreground-secondary">No session data available</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <p className="text-sm text-foreground-secondary mb-1">Sessions with Easter Eggs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {animationStats?.sessionsWithEasterEggs || 0} of {animationStats?.totalSessions || 0}
                    </p>
                    <p className="text-sm font-medium" style={{ color: brandColor }}>
                      {animationStats?.totalSessions ? ((animationStats.sessionsWithEasterEggs / animationStats.totalSessions) * 100).toFixed(1) : 0}% discovery rate
                    </p>
                  </div>
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <p className="text-sm text-foreground-secondary mb-1">Avg Easter Eggs per Session</p>
                    <p className="text-2xl font-bold text-foreground">
                      {animationStats?.totalSessions ? (animationStats.easterEggsTriggered / animationStats.totalSessions).toFixed(2) : 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Animation Performance Summary */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Animation Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <p className="text-3xl font-bold text-foreground mb-1">{formatNumber(animationStats?.totalTriggers || 0)}</p>
                  <p className="text-sm text-foreground-secondary">Total Animation Plays</p>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <p className="text-3xl font-bold text-foreground mb-1">{animationStats?.topAnimations?.length || 0}</p>
                  <p className="text-sm text-foreground-secondary">Different Animations Used</p>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <p className="text-3xl font-bold text-foreground mb-1">{animationStats?.topEasterEggs?.length || 0}</p>
                  <p className="text-sm text-foreground-secondary">Easter Egg Types Found</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-6">
            {/* Cost KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <DollarSign size={16} />
                  <span className="text-sm">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(overview?.totalCostEur || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Receipt size={16} />
                  <span className="text-sm">Cost per Session</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency((overview?.totalCostEur || 0) / Math.max(overview?.totalSessions || 1, 1))}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Total Tokens</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(overview?.totalTokens || 0)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Sparkles size={16} />
                  <span className="text-sm">Cost per Message</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency((overview?.totalCostEur || 0) / Math.max(overview?.totalMessages || 1, 1))}
                </p>
              </Card>
            </div>

            {/* Cost Over Time */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Cost Over Time</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                      tickFormatter={(value) => `€${value.toFixed(2)}`}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [`€${Number(value).toFixed(4)}`, 'Cost']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke={brandColor}
                      fill={brandColor}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Token Usage */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Token Usage Over Time</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="tokens" fill={brandColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Empty State */}
            <Card>
              <div className="text-center py-16">
                <Filter size={48} className="mx-auto mb-4 text-foreground-tertiary" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Custom Metrics</h3>
                <p className="text-foreground-secondary max-w-md mx-auto mb-6">
                  Create custom analytics dashboards tailored to your business needs.
                  Track specific KPIs, set up custom filters, and build personalized reports.
                </p>
                <Button variant="secondary" disabled>
                  <Filter size={16} />
                  Create Custom Metric
                </Button>
              </div>
            </Card>
          </div>
        )}
      </PageContent>
    </Page>
  );
}
