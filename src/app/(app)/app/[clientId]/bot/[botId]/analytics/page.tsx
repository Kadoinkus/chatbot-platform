'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Tablet,
  RefreshCw,
  ExternalLink,
  Mail,
  Eye,
  X
} from 'lucide-react';

import { getClientById, getBotById } from '@/lib/dataService';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { getClientBrandColor } from '@/lib/brandColors';
import { getChartColors, GREY, GREYS, getContrastTextColor, ensureReadableColor } from '@/lib/chartColors';
import { tooltipStyle } from '@/lib/chartStyles';
import { exportToCSV, exportToJSON, exportToXLSX, generateExportFilename, type ExportFormat } from '@/lib/export';
import type { Client, Bot, ChatSessionWithAnalysis } from '@/types';
import type { OverviewMetrics, SentimentBreakdown, CategoryBreakdown, LanguageBreakdown, CountryBreakdown, TimeSeriesDataPoint, QuestionAnalytics, DeviceBreakdown, SentimentTimeSeriesDataPoint, HourlyBreakdown, AnimationStats } from '@/lib/db/analytics';
import { Page, PageContent, PageHeader, Card, Button, Input, Spinner, EmptyState, Modal } from '@/components/ui';

// Shared chart components
import {
  TimeSeriesAreaChart,
  SentimentAreaChart,
  StackedBarChart,
  VerticalBarChart,
  HorizontalBarChart,
  HourlyBarChart,
  DonutChart,
  safeString,
  formatAxisDate,
  formatAxisCurrency,
  type CustomTooltipContent,
} from '@/components/analytics/charts';

// Import Cell and Legend directly for remaining raw charts
import { Cell, Legend } from 'recharts';

// Dynamically import Recharts components still needed for custom implementations
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

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
  const [selectedTranscript, setSelectedTranscript] = useState<ChatSessionWithAnalysis | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [sessionIdsModal, setSessionIdsModal] = useState<{ open: boolean; title: string; sessionIds: string[] }>({
    open: false,
    title: '',
    sessionIds: [],
  });

  // Ref to preserve scroll position when opening modal
  const scrollPositionRef = useRef<number>(0);
  const exportDropdownRef = useRef<HTMLDivElement>(null);


  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle opening transcript modal while preserving scroll position
  const handleOpenTranscript = useCallback((session: ChatSessionWithAnalysis) => {
    // Store current scroll position FIRST
    scrollPositionRef.current = window.scrollY;

    // Lock scroll position by fixing the body BEFORE state change
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    setSelectedTranscript(session);
  }, []);

  // Handle closing transcript modal
  const handleCloseTranscript = useCallback(() => {
    const scrollPos = scrollPositionRef.current;

    // Remove fixed positioning
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    // Restore scroll position
    window.scrollTo(0, scrollPos);

    setSelectedTranscript(null);
  }, []);

  // Find session IDs for a question
  const findSessionsForQuestion = useCallback((questionText: string) => {
    return sessions
      .filter(s => s.analysis?.questions?.some(q =>
        q.toLowerCase().includes(questionText.toLowerCase()) ||
        questionText.toLowerCase().includes(q.toLowerCase())
      ))
      .map(s => s.id);
  }, [sessions]);

  // Find session IDs for a URL handoff
  const findSessionsForUrl = useCallback((url: string) => {
    return sessions
      .filter(s => s.analysis?.url_links?.some(u => u.includes(url) || url.includes(u)))
      .map(s => s.id);
  }, [sessions]);

  // Find session IDs for an email handoff
  const findSessionsForEmail = useCallback((email: string) => {
    return sessions
      .filter(s => s.analysis?.email_links?.includes(email))
      .map(s => s.id);
  }, [sessions]);

  // Copy session ID to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Get current date range for exports
  const getExportDateRange = useCallback(() => {
    let startDate: Date, endDate: Date;
    if (useCustomRange && customDateRange.start && customDateRange.end) {
      startDate = new Date(customDateRange.start);
      endDate = new Date(customDateRange.end);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
    }
    return { startDate, endDate };
  }, [useCustomRange, customDateRange, dateRange]);

  // Handle export for current tab
  const handleExport = useCallback((format: ExportFormat) => {
    const { startDate, endDate } = getExportDateRange();
    const mascotId = params.botId;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const exportFn = format === 'csv' ? exportToCSV :
                     format === 'json' ? exportToJSON :
                     exportToXLSX;

    switch (activeTab) {
      case 'overview': {
        const data = timeSeries.map(ts => ({
          mascot_id: mascotId,
          date: ts.date,
          sessions: ts.sessions,
          messages: ts.messages,
          tokens: ts.tokens,
          cost_eur: ts.cost,
          start_date: startDateStr,
          end_date: endDateStr,
        }));
        const filename = generateExportFilename('overview', mascotId, startDate, endDate);
        exportFn(data, filename, 'Overview');
        break;
      }

      case 'conversations': {
        const data = sessions.map(s => ({
          session_id: s.id,
          mascot_id: s.mascot_id,
          start_date: s.session_started_at,
          end_date: s.session_ended_at || '',
          duration_seconds: s.session_duration_seconds || 0,
          total_messages: s.total_messages,
          user_messages: s.user_messages,
          bot_messages: s.bot_messages,
          sentiment: s.analysis?.sentiment || '',
          category: s.analysis?.category || '',
          resolution_status: s.analysis?.resolution_status || '',
          country: s.visitor_country || '',
          language: s.analysis?.language || '',
          device_type: s.device_type || '',
          total_tokens: s.total_tokens,
          total_cost_eur: s.total_cost_eur,
          full_transcript: s.full_transcript ? JSON.stringify(s.full_transcript) : '',
          export_start_date: startDateStr,
          export_end_date: endDateStr,
        }));
        const filename = generateExportFilename('conversations', mascotId, startDate, endDate);
        exportFn(data, filename, 'Conversations');
        break;
      }

      case 'questions': {
        // Combine questions, unanswered questions, URL handoffs, and email handoffs
        const questionData = questions.map(q => ({
          type: 'question',
          session_id: '',
          mascot_id: mascotId,
          content: q.question,
          category: '',
          frequency: q.frequency,
          answered: q.answered ? 'Yes' : 'No',
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const unansweredData = unansweredQuestions.map(q => ({
          type: 'unanswered_question',
          session_id: '',
          mascot_id: mascotId,
          content: q.question,
          category: '',
          frequency: q.frequency,
          answered: 'No',
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        // URL handoffs
        const urlHandoffs: { destination: string; category: string; count: number }[] = [];
        sessions.forEach(s => {
          s.analysis?.url_links?.forEach(url => {
            const existing = urlHandoffs.find(h => h.destination === url);
            if (existing) {
              existing.count++;
            } else {
              urlHandoffs.push({ destination: url, category: s.analysis?.category || 'Unknown', count: 1 });
            }
          });
        });
        const urlData = urlHandoffs.map(h => ({
          type: 'url_handoff',
          session_id: '',
          mascot_id: mascotId,
          content: h.destination,
          category: h.category,
          frequency: h.count,
          answered: '',
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        // Email handoffs
        const emailHandoffs: { destination: string; category: string; count: number }[] = [];
        sessions.forEach(s => {
          s.analysis?.email_links?.forEach(email => {
            const existing = emailHandoffs.find(h => h.destination === email);
            if (existing) {
              existing.count++;
            } else {
              emailHandoffs.push({ destination: email, category: s.analysis?.category || 'Unknown', count: 1 });
            }
          });
        });
        const emailData = emailHandoffs.map(h => ({
          type: 'email_handoff',
          session_id: '',
          mascot_id: mascotId,
          content: h.destination,
          category: h.category,
          frequency: h.count,
          answered: '',
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const allData = [...questionData, ...unansweredData, ...urlData, ...emailData];
        const filename = generateExportFilename('questions_gaps', mascotId, startDate, endDate);
        exportFn(allData, filename, 'Questions & Gaps');
        break;
      }

      case 'audience': {
        // Combine countries, languages, devices
        const countryData = countries.map(c => ({
          type: 'country',
          name: c.country,
          count: c.count,
          percentage: c.percentage,
          mascot_id: mascotId,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const languageData = languages.map(l => ({
          type: 'language',
          name: l.language,
          count: l.count,
          percentage: l.percentage,
          mascot_id: mascotId,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const deviceData = devices.map(d => ({
          type: 'device',
          name: d.deviceType,
          count: d.count,
          percentage: d.percentage,
          mascot_id: mascotId,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const allData = [...countryData, ...languageData, ...deviceData];
        const filename = generateExportFilename('audience', mascotId, startDate, endDate);
        exportFn(allData, filename, 'Audience');
        break;
      }

      case 'animations': {
        if (!animationStats) break;
        const animationData = [
          ...animationStats.topAnimations.map(a => ({
            type: 'animation',
            name: a.animation,
            count: a.count,
            mascot_id: mascotId,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
          ...animationStats.topEasterEggs.map(e => ({
            type: 'easter_egg',
            name: e.animation,
            count: e.count,
            mascot_id: mascotId,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
          ...animationStats.waitSequences.map(w => ({
            type: 'wait_sequence',
            name: w.sequence,
            count: w.count,
            mascot_id: mascotId,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
        ];
        const filename = generateExportFilename('animations', mascotId, startDate, endDate);
        exportFn(animationData, filename, 'Animations');
        break;
      }

      case 'costs': {
        const data = sessions.map(s => ({
          session_id: s.id,
          mascot_id: s.mascot_id,
          date: s.session_started_at,
          total_tokens: s.total_tokens,
          input_tokens: s.input_tokens,
          output_tokens: s.output_tokens,
          total_cost_eur: s.total_cost_eur,
          analytics_cost_eur: s.analysis?.analytics_total_cost_eur || 0,
          combined_cost_eur: s.total_cost_eur + (s.analysis?.analytics_total_cost_eur || 0),
          start_date: startDateStr,
          end_date: endDateStr,
        }));
        const filename = generateExportFilename('costs', mascotId, startDate, endDate);
        exportFn(data, filename, 'Costs');
        break;
      }

      default:
        break;
    }

    setShowExportDropdown(false);
  }, [activeTab, sessions, timeSeries, questions, unansweredQuestions, countries, languages, devices, animationStats, params.botId, getExportDateRange]);

  const brandColor = useMemo(() => {
    return client ? getClientBrandColor(client.id) : '#6B7280';
  }, [client]);

  // Readable brand color for text on light backgrounds
  const readableBrandColor = useMemo(() => {
    return ensureReadableColor(brandColor);
  }, [brandColor]);

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

  // Calculate if a color is light or dark (for text contrast)
  const isLightColor = (hexColor: string): boolean => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate relative luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Determine text color based on background
  const getContrastTextColor = (bgColor: string): string => {
    return isLightColor(bgColor) ? '#1F2937' : '#FFFFFF';
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
        <Card className="mb-6 overflow-visible">
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

            <div className="relative" ref={exportDropdownRef}>
              <Button
                variant="secondary"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className={`ml-1 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {/* Export Dropdown */}
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-surface-elevated rounded-lg shadow-lg border border-border py-1 z-[100] min-w-[100px]">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-hover transition-colors"
                  >
                    .csv
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-hover transition-colors"
                  >
                    .xlsx
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background-hover transition-colors"
                  >
                    .json
                  </button>
                </div>
              )}
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
            {/* Key KPIs */}
            {(() => {
              const newUsers = sessions.filter(s => s.glb_source === 'cdn_fetch' || (s.glb_transfer_size && s.glb_transfer_size > 0)).length;
              const recurringUsers = sessions.filter(s => s.glb_source === 'memory_cache' || (s.glb_source !== 'cdn_fetch' && !s.glb_transfer_size)).length;
              const totalUsers = sessions.length || 1;
              const returnRate = (recurringUsers / totalUsers) * 100;

              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                      <Users size={16} />
                      <span className="text-sm">Total Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(overview?.totalSessions || 0)}</p>
                    <p className="text-xs text-foreground-tertiary mt-1">{formatNumber(overview?.totalMessages || 0)} messages</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                      <RefreshCw size={16} />
                      <span className="text-sm">Return Rate</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: brandColor }}>{formatPercent(returnRate)}</p>
                    <p className="text-xs text-foreground-tertiary mt-1">{formatNumber(recurringUsers)} returning, {formatNumber(newUsers)} new</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                      <CheckCircle size={16} />
                      <span className="text-sm">Resolution Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatPercent(overview?.resolutionRate || 0)}</p>
                    <p className="text-xs text-foreground-tertiary mt-1">issues resolved</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                      <Download size={16} />
                      <span className="text-sm">Bundle Loads</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(newUsers)}</p>
                    <p className="text-xs text-foreground-tertiary mt-1">GLB downloads from CDN</p>
                  </Card>
                </div>
              );
            })()}

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions Over Time - Larger */}
              <Card className="lg:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">Sessions Over Time</h3>
                <div className="h-[280px]">
                  {(() => {
                    // Enhance timeSeries with new vs recurring data
                    const enhancedTimeSeries = timeSeries.map(day => {
                      const daySessions = sessions.filter(s => {
                        const sessionDate = new Date(s.session_started_at || s.created_at).toISOString().split('T')[0];
                        return sessionDate === day.date;
                      });
                      const newCount = daySessions.filter(s => s.glb_source === 'cdn_fetch' || (s.glb_transfer_size && s.glb_transfer_size > 0)).length;
                      const returningCount = daySessions.length - newCount;
                      return {
                        ...day,
                        new: newCount,
                        returning: returningCount
                      };
                    });

                    return (
                      <TimeSeriesAreaChart
                        data={enhancedTimeSeries}
                        series={[
                          { key: 'returning', name: 'Returning', color: GREY[500] },
                          { key: 'new', name: 'New', color: brandColor },
                        ]}
                        height={280}
                        brandColor={brandColor}
                      />
                    );
                  })()}
                </div>
              </Card>

              {/* User Breakdown Donut */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">User Breakdown</h3>
                <div className="h-[280px]">
                  {(() => {
                    const newUsers = sessions.filter(s => s.glb_source === 'cdn_fetch' || (s.glb_transfer_size && s.glb_transfer_size > 0)).length;
                    const recurringUsers = sessions.length - newUsers;
                    const userData = [
                      { name: 'Returning', value: recurringUsers, color: GREY[500] },
                      { name: 'New', value: newUsers, color: brandColor }
                    ];

                    return (
                      <DonutChart
                        data={userData}
                        height={280}
                        brandColor={brandColor}
                        innerRadius={55}
                        outerRadius={85}
                        showLabels={true}
                      />
                    );
                  })()}
                </div>
              </Card>
            </div>

            {/* Bottom Row - Categories & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories - 2 cols */}
              <Card className="lg:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
                <div className="h-[240px]">
                  <HorizontalBarChart
                    data={categories.slice(0, 6).map(c => ({ name: c.category, value: c.count }))}
                    dataKey="value"
                    nameKey="name"
                    height={240}
                    brandColor={brandColor}
                    yAxisWidth={120}
                  />
                </div>
              </Card>

              {/* Quick Insights */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Quick Insights</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground-secondary">Top Country</span>
                      <Globe size={14} className="text-foreground-tertiary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{countries[0]?.country || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground-secondary">Top Language</span>
                      <MessageSquare size={14} className="text-foreground-tertiary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{languages[0]?.language || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground-secondary">Mobile Users</span>
                      <Smartphone size={14} className="text-foreground-tertiary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {formatPercent(devices.find(d => d.deviceType?.toLowerCase() === 'mobile')?.percentage || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground-secondary">Positive Sentiment</span>
                      <ThumbsUp size={14} className="text-foreground-tertiary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {sentiment ? formatPercent((sentiment.positive / (sentiment.positive + sentiment.neutral + sentiment.negative)) * 100) : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-6">
            {/* Conversation KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Clock size={16} />
                  <span className="text-sm">Avg Session Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(overview?.averageSessionDurationSeconds || 0)}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">widget open duration</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Avg Engagement</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {(() => {
                    const engagementTimes = sessions
                      .filter(s => s.first_message_at && s.last_message_at)
                      .map(s => {
                        const first = new Date(s.first_message_at!).getTime();
                        const last = new Date(s.last_message_at!).getTime();
                        return (last - first) / 1000;
                      });
                    const avg = engagementTimes.length > 0
                      ? engagementTimes.reduce((a, b) => a + b, 0) / engagementTimes.length
                      : 0;
                    return formatDuration(avg);
                  })()}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">first to last message</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <ThumbsUp size={16} />
                  <span className="text-sm">Positive Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {sentiment ? formatPercent((sentiment.positive / (sentiment.positive + sentiment.neutral + sentiment.negative)) * 100) : '0%'}
                </p>
                <p className="text-xs text-foreground-tertiary mt-1">{sentiment?.positive || 0} positive sessions</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Escalation Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPercent(overview?.escalationRate || 0)}</p>
                <p className="text-xs text-foreground-tertiary mt-1">to human support</p>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Over Time */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Sentiment Over Time</h3>
                <div className="h-[280px]">
                  <SentimentAreaChart
                    data={sentimentTimeSeries}
                    height={280}
                    brandColor={brandColor}
                  />
                </div>
              </Card>

              {/* Resolution Status */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Resolution Status</h3>
                <div className="h-[280px]">
                  <DonutChart
                    data={resolutionData.map(d => ({ name: d.name, value: d.value, color: d.fill }))}
                    height={280}
                    brandColor={brandColor}
                  />
                </div>
              </Card>
            </div>

            {/* Peak Hours & Session Duration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peak Hours */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Peak Hours</h3>
                <div className="h-[200px]">
                  <HourlyBarChart
                    data={hourlyBreakdown}
                    height={200}
                    brandColor={brandColor}
                  />
                </div>
              </Card>

              {/* Session Duration Distribution */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Session Duration</h3>
                <div className="h-[200px]">
                  {(() => {
                    // Group sessions by duration buckets
                    const buckets = {
                      '< 1 min': 0,
                      '1-3 min': 0,
                      '3-5 min': 0,
                      '5-10 min': 0,
                      '10+ min': 0,
                    };

                    sessions.forEach(s => {
                      const duration = s.session_duration_seconds || 0;
                      if (duration < 60) buckets['< 1 min']++;
                      else if (duration < 180) buckets['1-3 min']++;
                      else if (duration < 300) buckets['3-5 min']++;
                      else if (duration < 600) buckets['5-10 min']++;
                      else buckets['10+ min']++;
                    });

                    const durationData = Object.entries(buckets).map(([range, count]) => ({
                      name: range,
                      value: count,
                    }));

                    return (
                      <VerticalBarChart
                        data={durationData}
                        dataKey="value"
                        xAxisKey="name"
                        height={200}
                        brandColor={brandColor}
                      />
                    );
                  })()}
                </div>
              </Card>
            </div>

            {/* Session Breakdown - Unified Card */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Session Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Outcomes */}
                <div className="pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border md:pr-6">
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Outcomes</p>
                  <div className="space-y-2">
                    {(() => {
                      const total = sessions.length || 1;
                      const outcomes = [
                        { name: 'Completed', count: sessions.filter(s => s.analysis?.session_outcome === 'completed').length },
                        { name: 'Abandoned', count: sessions.filter(s => s.analysis?.session_outcome === 'abandoned').length },
                        { name: 'Timeout', count: sessions.filter(s => s.analysis?.session_outcome === 'timeout').length },
                        { name: 'Error', count: sessions.filter(s => s.analysis?.session_outcome === 'error').length },
                      ].filter(o => o.count > 0);

                      const barColors = [brandColor, GREYS[4], GREYS[5], GREYS[6]];
                      return outcomes.map((outcome, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{outcome.name}</span>
                            <span className="text-foreground-secondary">{formatPercent((outcome.count / total) * 100)}</span>
                          </div>
                          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(outcome.count / total) * 100}%`, backgroundColor: barColors[i % barColors.length] }}
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Engagement */}
                <div className="pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border md:pr-6">
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Engagement</p>
                  <div className="space-y-2">
                    {(() => {
                      const total = sessions.length || 1;
                      const levels = [
                        { name: 'High', count: sessions.filter(s => s.analysis?.engagement_level === 'high').length },
                        { name: 'Medium', count: sessions.filter(s => s.analysis?.engagement_level === 'medium').length },
                        { name: 'Low', count: sessions.filter(s => s.analysis?.engagement_level === 'low').length },
                      ];

                      const barColors = [brandColor, GREYS[4], GREYS[5]];
                      return levels.map((level, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{level.name}</span>
                            <span className="text-foreground-secondary">{formatPercent((level.count / total) * 100)}</span>
                          </div>
                          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(level.count / total) * 100}%`, backgroundColor: barColors[i % barColors.length] }}
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Conversation Types */}
                <div>
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Conversation Types</p>
                  <div className="space-y-2">
                    {(() => {
                      const total = sessions.length || 1;
                      const typeCounts: Record<string, number> = {};
                      sessions.forEach(s => {
                        const type = s.analysis?.conversation_type;
                        if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
                      });

                      const barColors = [brandColor, GREYS[4], GREYS[5], GREYS[6]];
                      return Object.entries(typeCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([type, count], i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              <span className="text-foreground-secondary">{formatPercent((count / total) * 100)}</span>
                            </div>
                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(count / total) * 100}%`, backgroundColor: barColors[i % barColors.length] }}
                              />
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Sessions Table */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Recent Conversations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Session ID</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Messages</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Sentiment</th>
                      <th className="text-left py-3 px-4 text-foreground-secondary font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-foreground-secondary font-medium">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map((session) => (
                      <tr key={session.id} className="border-b border-border hover:bg-background-hover">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => copyToClipboard(session.id)}
                            className="font-mono text-xs text-foreground-secondary hover:text-foreground transition-colors"
                            title="Click to copy"
                          >
                            {session.id.slice(0, 8)}...
                          </button>
                        </td>
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
                        <td className="py-3 px-4 text-center">
                          {session.full_transcript && session.full_transcript.length > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenTranscript(session);
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                              style={{ color: brandColor }}
                              title="View conversation"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <span className="text-foreground-tertiary">-</span>
                          )}
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

            {/* Handoff Analytics - Single Clean Card */}
            <Card>
              <h3 className="font-semibold text-foreground mb-6">Handoff Analytics</h3>
              {(() => {
                const sessionsWithHandoffs = sessions.filter(s =>
                  (s.analysis?.url_links && s.analysis.url_links.length > 0) ||
                  (s.analysis?.email_links && s.analysis.email_links.length > 0)
                ).length;
                const urlOnly = sessions.filter(s =>
                  (s.analysis?.url_links && s.analysis.url_links.length > 0) &&
                  (!s.analysis?.email_links || s.analysis.email_links.length === 0)
                ).length;
                const emailOnly = sessions.filter(s =>
                  (!s.analysis?.url_links || s.analysis.url_links.length === 0) &&
                  (s.analysis?.email_links && s.analysis.email_links.length > 0)
                ).length;
                const both = sessions.filter(s =>
                  (s.analysis?.url_links && s.analysis.url_links.length > 0) &&
                  (s.analysis?.email_links && s.analysis.email_links.length > 0)
                ).length;
                const handoffRate = sessions.length > 0 ? (sessionsWithHandoffs / sessions.length) * 100 : 0;

                return (
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left: Handoff Rate */}
                    <div className="flex-1">
                      <p className="text-sm text-foreground-secondary mb-3">Handoff Rate</p>
                      <div className="flex items-end gap-3 mb-4">
                        <span className="text-5xl font-bold" style={{ color: brandColor }}>
                          {handoffRate.toFixed(1)}%
                        </span>
                        <span className="text-foreground-secondary pb-2">
                          of sessions
                        </span>
                      </div>
                      <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${handoffRate}%`, backgroundColor: brandColor }}
                        />
                      </div>
                      <p className="text-sm text-foreground-tertiary mt-2">
                        {sessionsWithHandoffs} of {sessions.length} sessions included a URL or email handoff
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t md:border-t-0 md:border-l border-border" />

                    {/* Right: Breakdown */}
                    <div className="flex-1">
                      <p className="text-sm text-foreground-secondary mb-3">Handoff Breakdown</p>
                      {sessionsWithHandoffs === 0 ? (
                        <p className="text-foreground-tertiary">No handoffs yet</p>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">URL Only</span>
                              <span className="text-foreground-secondary">{urlOnly} ({sessionsWithHandoffs > 0 ? ((urlOnly / sessionsWithHandoffs) * 100).toFixed(0) : 0}%)</span>
                            </div>
                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sessionsWithHandoffs > 0 ? (urlOnly / sessionsWithHandoffs) * 100 : 0}%`,
                                  backgroundColor: brandColor
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">Email Only</span>
                              <span className="text-foreground-secondary">{emailOnly} ({sessionsWithHandoffs > 0 ? ((emailOnly / sessionsWithHandoffs) * 100).toFixed(0) : 0}%)</span>
                            </div>
                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sessionsWithHandoffs > 0 ? (emailOnly / sessionsWithHandoffs) * 100 : 0}%`,
                                  backgroundColor: GREY[400]
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">Both URL & Email</span>
                              <span className="text-foreground-secondary">{both} ({sessionsWithHandoffs > 0 ? ((both / sessionsWithHandoffs) * 100).toFixed(0) : 0}%)</span>
                            </div>
                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sessionsWithHandoffs > 0 ? (both / sessionsWithHandoffs) * 100 : 0}%`,
                                  backgroundColor: GREY[600]
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* Questions Lists - Clean Simple Design with Scroll */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Top Questions</h3>
                  {questions.length > 5 && (
                    <span className="text-xs text-foreground-tertiary">{questions.length} total</span>
                  )}
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {questions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setSessionIdsModal({
                        open: true,
                        title: q.question,
                        sessionIds: findSessionsForQuestion(q.question),
                      })}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left"
                    >
                      <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{q.question}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-foreground-secondary">{q.frequency}×</span>
                        {q.answered ? (
                          <CheckCircle size={14} className="text-success-500" />
                        ) : (
                          <AlertTriangle size={14} className="text-warning-500" />
                        )}
                      </div>
                    </button>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-sm text-foreground-tertiary text-center py-6">No questions yet</p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Unanswered Questions</h3>
                  {unansweredQuestions.length > 0 && (
                    <span className="text-xs text-warning-600 dark:text-warning-500 font-medium">
                      {unansweredQuestions.length} gaps
                    </span>
                  )}
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {unansweredQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setSessionIdsModal({
                        open: true,
                        title: q.question,
                        sessionIds: findSessionsForQuestion(q.question),
                      })}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left"
                    >
                      <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{q.question}</span>
                      <span className="text-sm text-foreground-secondary flex-shrink-0">{q.frequency}×</span>
                    </button>
                  ))}
                  {unansweredQuestions.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle size={24} className="text-success-500 mx-auto mb-2" />
                      <p className="text-sm text-foreground-secondary">All questions answered</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Handoffs - Clean Simple Design with Scroll */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* URL Handoffs */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">URL Handoffs</h3>
                  <span className="text-xs text-foreground-tertiary">
                    {sessions.filter(s => s.analysis?.url_links && s.analysis.url_links.length > 0).length} sessions
                  </span>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {(() => {
                    const urlHandoffs: { destination: string; fullUrl: string; count: number }[] = [];

                    sessions.forEach(s => {
                      s.analysis?.url_links?.forEach(url => {
                        let shortUrl = url;
                        try {
                          const parsed = new URL(url);
                          shortUrl = parsed.hostname + parsed.pathname;
                        } catch {}

                        const existing = urlHandoffs.find(h => h.destination === shortUrl);
                        if (existing) existing.count++;
                        else urlHandoffs.push({ destination: shortUrl, fullUrl: url, count: 1 });
                      });
                    });

                    const sorted = urlHandoffs.sort((a, b) => b.count - a.count);

                    if (sorted.length === 0) {
                      return (
                        <p className="text-sm text-foreground-tertiary text-center py-6">No URL handoffs yet</p>
                      );
                    }

                    return sorted.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => setSessionIdsModal({
                          open: true,
                          title: h.destination,
                          sessionIds: findSessionsForUrl(h.fullUrl),
                        })}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left"
                      >
                        <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{h.destination}</span>
                        <span className="text-sm text-foreground-secondary flex-shrink-0">{h.count}×</span>
                      </button>
                    ));
                  })()}
                </div>
              </Card>

              {/* Email Handoffs */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Email Handoffs</h3>
                  <span className="text-xs text-foreground-tertiary">
                    {sessions.filter(s => s.analysis?.email_links && s.analysis.email_links.length > 0).length} sessions
                  </span>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {(() => {
                    const emailHandoffs: { destination: string; count: number }[] = [];

                    sessions.forEach(s => {
                      s.analysis?.email_links?.forEach(email => {
                        const existing = emailHandoffs.find(h => h.destination === email);
                        if (existing) existing.count++;
                        else emailHandoffs.push({ destination: email, count: 1 });
                      });
                    });

                    const sorted = emailHandoffs.sort((a, b) => b.count - a.count);

                    if (sorted.length === 0) {
                      return (
                        <p className="text-sm text-foreground-tertiary text-center py-6">No email handoffs yet</p>
                      );
                    }

                    return sorted.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => setSessionIdsModal({
                          open: true,
                          title: h.destination,
                          sessionIds: findSessionsForEmail(h.destination),
                        })}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left"
                      >
                        <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{h.destination}</span>
                        <span className="text-sm text-foreground-secondary flex-shrink-0">{h.count}×</span>
                      </button>
                    ));
                  })()}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            {/* Audience KPIs - Meaningful metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Globe size={16} />
                  <span className="text-sm">Top Country</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{countries[0]?.country || 'N/A'}</p>
                <p className="text-sm text-foreground-secondary">{countries[0] ? `${formatPercent((countries[0].count / sessions.length) * 100)} of sessions` : ''}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <MessageSquare size={16} />
                  <span className="text-sm">Top Language</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{languages[0]?.language || 'N/A'}</p>
                <p className="text-sm text-foreground-secondary">{languages[0] ? `${formatPercent(languages[0].percentage)} of sessions` : ''}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Smartphone size={16} />
                  <span className="text-sm">Mobile</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPercent(devices.find(d => d.deviceType?.toLowerCase() === 'mobile')?.percentage || 0)}
                </p>
                <p className="text-sm text-foreground-secondary">of all users</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 text-foreground-secondary mb-2">
                  <Monitor size={16} />
                  <span className="text-sm">Desktop</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPercent(devices.find(d => d.deviceType?.toLowerCase() === 'desktop')?.percentage || 0)}
                </p>
                <p className="text-sm text-foreground-secondary">of all users</p>
              </Card>
            </div>

            {/* Geographic - Countries & Languages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Countries</h3>
                <div className="h-[240px]">
                  <HorizontalBarChart
                    data={countries.slice(0, 6).map(c => ({ name: c.country, value: c.count }))}
                    dataKey="value"
                    nameKey="name"
                    height={240}
                    brandColor={brandColor}
                    yAxisWidth={70}
                  />
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-4">Languages</h3>
                <div className="h-[240px]">
                  <HorizontalBarChart
                    data={languages.slice(0, 6).map(l => ({ name: l.language, value: l.percentage }))}
                    dataKey="value"
                    nameKey="name"
                    height={240}
                    brandColor={brandColor}
                    yAxisWidth={70}
                  />
                </div>
              </Card>
            </div>

            {/* Technology Stack - Device, Browser, OS */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Technology Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Devices */}
                <div className="pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border md:pr-6">
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Devices</p>
                  <div className="space-y-2">
                    {devices.map((device, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{device.deviceType || 'Unknown'}</span>
                            <span className="text-foreground-secondary">{formatPercent(device.percentage)}</span>
                          </div>
                          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${device.percentage}%`, backgroundColor: brandColor }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browsers */}
                <div className="pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border md:pr-6">
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Browsers</p>
                  <div className="space-y-2">
                    {(() => {
                      const browserCounts: Record<string, number> = {};
                      sessions.forEach(s => {
                        const browser = s.browser_name || 'Unknown';
                        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
                      });
                      const total = sessions.length || 1;
                      return Object.entries(browserCounts)
                        .map(([name, count]) => ({ name, percentage: (count / total) * 100 }))
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 4)
                        .map((browser, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground">{browser.name}</span>
                                <span className="text-foreground-secondary">{formatPercent(browser.percentage)}</span>
                              </div>
                              <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${browser.percentage}%`, backgroundColor: brandColor }}
                                />
                              </div>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </div>

                {/* Operating Systems */}
                <div>
                  <p className="text-sm font-medium text-foreground-secondary mb-3">Operating Systems</p>
                  <div className="space-y-2">
                    {(() => {
                      const osCounts: Record<string, number> = {};
                      sessions.forEach(s => {
                        const os = s.os_name || 'Unknown';
                        osCounts[os] = (osCounts[os] || 0) + 1;
                      });
                      const total = sessions.length || 1;
                      return Object.entries(osCounts)
                        .map(([name, count]) => ({ name, percentage: (count / total) * 100 }))
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 4)
                        .map((os, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground">{os.name}</span>
                                <span className="text-foreground-secondary">{formatPercent(os.percentage)}</span>
                              </div>
                              <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${os.percentage}%`, backgroundColor: brandColor }}
                                />
                              </div>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
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
                    <HorizontalBarChart
                      data={animationStats.topAnimations.map(a => ({ name: a.animation, value: a.count }))}
                      dataKey="value"
                      nameKey="name"
                      nameFormatter={(v) => safeString(v).replace(/_/g, ' ').replace('2type T', '')}
                      height={280}
                      brandColor={brandColor}
                      yAxisWidth={140}
                    />
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
                    <HorizontalBarChart
                      data={animationStats.topEasterEggs.map(e => ({ name: e.animation, value: e.count }))}
                      dataKey="value"
                      nameKey="name"
                      nameFormatter={(v) => safeString(v).replace('easter_', '').replace(/_/g, ' ')}
                      height={280}
                      brandColor={brandColor}
                      yAxisWidth={140}
                    />
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center">
                    <p className="text-foreground-secondary">No easter eggs triggered yet</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Wait Sequence & Easter Eggs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wait Sequence Distribution */}
              <Card>
                <h3 className="font-semibold text-foreground mb-2">Wait Sequence Distribution</h3>
                <p className="text-sm text-foreground-secondary mb-4">Idle animation playlists triggered</p>
                {animationStats?.waitSequences && animationStats.waitSequences.length > 0 ? (
                  <div className="h-[220px]">
                    <VerticalBarChart
                      data={animationStats.waitSequences.map(w => ({ name: w.sequence, value: w.count }))}
                      dataKey="value"
                      xAxisKey="name"
                      xAxisFormatter={(v) => `Playlist ${safeString(v).toUpperCase()}`}
                      height={220}
                      brandColor={brandColor}
                    />
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-foreground-secondary">No wait sequence data available</p>
                  </div>
                )}
              </Card>

              {/* Easter Eggs in Conversations */}
              <Card>
                <h3 className="font-semibold text-foreground mb-2">Easter Eggs in Conversations</h3>
                <p className="text-sm text-foreground-secondary mb-4">
                  {animationStats?.sessionsWithEasterEggs || 0} of {animationStats?.totalSessions || 0} sessions ({animationStats?.totalSessions ? ((animationStats.sessionsWithEasterEggs / animationStats.totalSessions) * 100).toFixed(1) : 0}%)
                </p>
                <div className="h-[220px]">
                  {(() => {
                    const sessionsWithEasterEggs = animationStats?.sessionsWithEasterEggs || 0;
                    const totalSessions = animationStats?.totalSessions || 0;
                    const sessionsWithoutEasterEggs = totalSessions - sessionsWithEasterEggs;
                    const easterEggData = [
                      { name: 'With Easter Eggs', value: sessionsWithEasterEggs, color: brandColor },
                      { name: 'Without Easter Eggs', value: sessionsWithoutEasterEggs, color: '#71717A' }
                    ];

                    return (
                      <DonutChart
                        data={easterEggData}
                        height={220}
                        brandColor={brandColor}
                        innerRadius={50}
                        outerRadius={80}
                        showLabels={true}
                      />
                    );
                  })()}
                </div>
              </Card>
            </div>

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

            {/* Cost Breakdown per Session */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Cost Breakdown per Session</h3>
              <p className="text-sm text-foreground-secondary mb-4">Conversation costs vs. analysis costs per session (stacked)</p>
              <div className="h-[320px]">
                <StackedBarChart
                  data={sessions.map((s, i) => ({
                    session: `#${i + 1}`,
                    conversation: s.total_cost_eur || 0,
                    analysis: s.analysis?.analytics_total_cost_eur || 0,
                    conversationTokens: s.total_tokens || 0,
                    analysisTokens: s.analysis?.analytics_total_tokens || 0,
                  }))}
                  series={[
                    { key: 'conversation', name: 'Conversation Cost', color: brandColor },
                    { key: 'analysis', name: 'Analysis Cost', color: GREY[500] },
                  ]}
                  xAxisKey="session"
                  yAxisFormatter={(v) => formatAxisCurrency(v, 3)}
                  height={320}
                  brandColor={brandColor}
                  customTooltip={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0]?.payload as Record<string, number>;
                    return (
                      <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-foreground mb-2">Session {label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-foreground">
                            <span style={{ color: brandColor }}>●</span> Conversation: €{data?.conversation?.toFixed(4)} ({formatNumber(data?.conversationTokens || 0)} tokens)
                          </p>
                          <p className="text-foreground">
                            <span style={{ color: GREY[500] }}>●</span> Analysis: €{data?.analysis?.toFixed(4)} ({formatNumber(data?.analysisTokens || 0)} tokens)
                          </p>
                          <p className="text-foreground-secondary pt-1 border-t border-border mt-1">
                            Total: €{((data?.conversation || 0) + (data?.analysis || 0)).toFixed(4)} ({formatNumber((data?.conversationTokens || 0) + (data?.analysisTokens || 0))} tokens)
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </Card>

            {/* Input vs Output Tokens & LLM Model Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input vs Output Tokens */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Input vs Output Tokens</h3>
                <p className="text-sm text-foreground-secondary mb-4">Output tokens typically cost 3-4x more than input</p>
                <div className="h-[250px]">
                  {(() => {
                    const inputTokens = sessions.reduce((sum, s) => sum + (s.input_tokens || 0), 0);
                    const outputTokens = sessions.reduce((sum, s) => sum + (s.output_tokens || 0), 0);
                    const tokenData = [
                      { name: 'Input (Prompts)', value: inputTokens, color: brandColor },
                      { name: 'Output (Responses)', value: outputTokens, color: GREY[500] }
                    ];

                    return (
                      <DonutChart
                        data={tokenData}
                        height={250}
                        brandColor={brandColor}
                        innerRadius={50}
                        outerRadius={80}
                        showLabels={true}
                      />
                    );
                  })()}
                </div>
              </Card>

              {/* LLM Model Usage */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">LLM Model Usage</h3>
                <p className="text-sm text-foreground-secondary mb-4">Models used for session analysis</p>
                <div className="h-[250px]">
                  {(() => {
                    const modelCounts: Record<string, number> = {};
                    sessions.forEach(s => {
                      const model = s.analysis?.analytics_model_used || 'Unknown';
                      modelCounts[model] = (modelCounts[model] || 0) + 1;
                    });
                    const modelData = Object.entries(modelCounts)
                      .map(([model, count]) => ({ name: model, value: count }))
                      .sort((a, b) => b.value - a.value);

                    return (
                      <DonutChart
                        data={modelData}
                        height={250}
                        brandColor={brandColor}
                        innerRadius={50}
                        outerRadius={80}
                        showLabels={true}
                      />
                    );
                  })()}
                </div>
              </Card>
            </div>

            {/* Cost by Resolution Status */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Cost by Resolution Status</h3>
              <p className="text-sm text-foreground-secondary mb-4">Compare costs between resolved, partial, and unresolved conversations</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {(() => {
                  const resolved = sessions.filter(s => s.analysis?.resolution_status === 'resolved');
                  const partial = sessions.filter(s => s.analysis?.resolution_status === 'partial');
                  const unresolved = sessions.filter(s => s.analysis?.resolution_status === 'unresolved');

                  const resolvedCost = resolved.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
                  const partialCost = partial.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);
                  const unresolvedCost = unresolved.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

                  const avgResolvedCost = resolved.length > 0 ? resolvedCost / resolved.length : 0;
                  const avgPartialCost = partial.length > 0 ? partialCost / partial.length : 0;
                  const avgUnresolvedCost = unresolved.length > 0 ? unresolvedCost / unresolved.length : 0;

                  return (
                    <>
                      <div className="p-4 bg-background-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColor }} />
                          <p className="text-sm font-medium text-foreground">Resolved</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(avgResolvedCost)}</p>
                        <p className="text-sm text-foreground-secondary">avg per session ({resolved.length} sessions)</p>
                        <p className="text-xs text-foreground-tertiary mt-1">Total: {formatCurrency(resolvedCost)}</p>
                      </div>
                      <div className="p-4 bg-background-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GREY[400] }} />
                          <p className="text-sm font-medium text-foreground">Partial</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(avgPartialCost)}</p>
                        <p className="text-sm text-foreground-secondary">avg per session ({partial.length} sessions)</p>
                        <p className="text-xs text-foreground-tertiary mt-1">Total: {formatCurrency(partialCost)}</p>
                      </div>
                      <div className="p-4 bg-background-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GREY[600] }} />
                          <p className="text-sm font-medium text-foreground">Unresolved</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(avgUnresolvedCost)}</p>
                        <p className="text-sm text-foreground-secondary">avg per session ({unresolved.length} sessions)</p>
                        <p className="text-xs text-foreground-tertiary mt-1">Total: {formatCurrency(unresolvedCost)}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>

            {/* Most Expensive Sessions */}
            <Card>
              <h3 className="font-semibold text-foreground mb-4">Most Expensive Sessions</h3>
              <p className="text-sm text-foreground-secondary mb-4">Top sessions by total cost - identify outliers and optimization opportunities</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-sm font-medium text-foreground-secondary">Session</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">Total Cost</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">Tokens</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-foreground-secondary">Messages</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-foreground-secondary">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions
                      .map((s, i) => ({
                        ...s,
                        index: i + 1,
                        totalCost: (s.total_cost_eur || 0) + (s.analysis?.analytics_total_cost_eur || 0)
                      }))
                      .sort((a, b) => b.totalCost - a.totalCost)
                      .slice(0, 5)
                      .map((session) => (
                        <tr key={session.id} className="border-b border-border hover:bg-background-hover">
                          <td className="py-2 px-3">
                            <span className="text-sm font-medium text-foreground">#{session.index}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-sm font-semibold" style={{ color: brandColor }}>
                              {formatCurrency(session.totalCost)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-sm text-foreground">{formatNumber(session.total_tokens || 0)}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-sm text-foreground">{session.total_messages || 0}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              session.analysis?.resolution_status === 'resolved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : session.analysis?.resolution_status === 'partial'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {session.analysis?.resolution_status || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {sessions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-foreground-secondary">No session data available</p>
                  </div>
                )}
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

        {/* Transcript Modal */}
        <Modal
          isOpen={!!selectedTranscript}
          onClose={handleCloseTranscript}
          title="Conversation Transcript"
          description={selectedTranscript ? `${new Date(selectedTranscript.session_started_at).toLocaleDateString()} • ${selectedTranscript.total_messages} messages • ${selectedTranscript.analysis?.category || 'Unknown category'}` : ''}
          size="lg"
        >
          {selectedTranscript?.full_transcript && (
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {selectedTranscript.full_transcript.map((msg, index) => {
                const userTextColor = getContrastTextColor(brandColor);
                const userTimestampColor = isLightColor(brandColor) ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.7)';

                return (
                  <div
                    key={index}
                    className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.author === 'user'
                          ? 'rounded-br-md'
                          : 'rounded-bl-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                      style={msg.author === 'user' ? {
                        backgroundColor: brandColor,
                        color: userTextColor,
                      } : undefined}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${msg.author === 'bot' ? 'text-gray-500 dark:text-gray-400' : ''}`}
                        style={msg.author === 'user' ? { color: userTimestampColor } : undefined}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>

        {/* Session IDs Modal */}
        <Modal
          isOpen={sessionIdsModal.open}
          onClose={() => setSessionIdsModal({ open: false, title: '', sessionIds: [] })}
          title="Related Sessions"
          description={sessionIdsModal.title}
          size="md"
        >
          <div className="space-y-2">
            <p className="text-sm text-foreground-secondary mb-3">
              Click a session ID to copy it, then search in the Conversations tab.
            </p>
            {sessionIdsModal.sessionIds.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {sessionIdsModal.sessionIds.map((id, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      copyToClipboard(id);
                    }}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background-hover transition-colors text-left group"
                  >
                    <code className="text-sm text-foreground font-mono">{id}</code>
                    <span className="text-xs text-foreground-tertiary group-hover:text-foreground-secondary">
                      Click to copy
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-tertiary text-center py-6">
                No matching sessions found
              </p>
            )}
          </div>
        </Modal>
      </PageContent>
    </Page>
  );
}
