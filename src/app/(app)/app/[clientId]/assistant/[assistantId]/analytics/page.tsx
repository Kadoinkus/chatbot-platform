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
  Download,
  ChevronDown,
  BarChart3,
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

import { getClientById, getAssistantById } from '@/lib/dataService';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { getClientBrandColor } from '@/lib/brandColors';
import { getChartColors, GREY, GREYS, getContrastTextColor, ensureReadableColor } from '@/lib/chartColors';
import { tooltipStyle } from '@/lib/chartStyles';
import { exportToCSV, exportToJSON, exportToXLSX, generateExportFilename, type ExportFormat } from '@/lib/export';
import type { Client, Assistant, ChatSessionWithAnalysis } from '@/types';
import type { OverviewMetrics, SentimentBreakdown, CategoryBreakdown, LanguageBreakdown, CountryBreakdown, TimeSeriesDataPoint, QuestionAnalytics, DeviceBreakdown, SentimentTimeSeriesDataPoint, HourlyBreakdown, AnimationStats } from '@/lib/db/analytics';
import { Page, PageContent, PageHeader, Card, Button, Input, Spinner, EmptyState, Modal, Select } from '@/components/ui';

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
import { TabNavigation, ANALYTICS_TABS } from '@/components/analytics';

// Tab components
import {
  OverviewTab,
  ConversationsTab,
  QuestionsTab,
  AudienceTab,
  AnimationsTab,
  CostsTab,
  CustomTab,
} from './components';

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


export default function AssistantAnalyticsPage({ params }: { params: { clientId: string; assistantId: string } }) {
  // State
  const [client, setClient] = useState<Client | undefined>();
  const [assistant, setAssistant] = useState<Assistant | undefined>();
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
  const desktopExportDropdownRef = useRef<HTMLDivElement>(null);
  const mobileExportDropdownRef = useRef<HTMLDivElement>(null);


  // Close export dropdown when clicking/touching outside
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      const target = event.target as Node;
      const clickedInsideDesktop = desktopExportDropdownRef.current?.contains(target);
      const clickedInsideMobile = mobileExportDropdownRef.current?.contains(target);
      if (!clickedInsideDesktop && !clickedInsideMobile) setShowExportDropdown(false);
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
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
    const mascotSlug = params.assistantId;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const exportFn = format === 'csv' ? exportToCSV :
                     format === 'json' ? exportToJSON :
                     exportToXLSX;

    switch (activeTab) {
      case 'overview': {
        const data = timeSeries.map(ts => ({
          mascot_slug: mascotSlug,
          date: ts.date,
          sessions: ts.sessions,
          messages: ts.messages,
          tokens: ts.tokens,
          cost_eur: ts.cost,
          start_date: startDateStr,
          end_date: endDateStr,
        }));
        const filename = generateExportFilename('overview', mascotSlug, startDate, endDate);
        exportFn(data, filename, 'Overview');
        break;
      }

      case 'conversations': {
        const data = sessions.map(s => ({
          session_id: s.id,
          mascot_slug: s.mascot_slug,
          start_date: s.session_started_at,
          end_date: s.session_ended_at || '',
          duration_seconds: s.session_duration_seconds || 0,
          total_messages: s.total_messages,
          user_messages: s.user_messages,
          assistant_messages: s.assistant_messages,
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
        const filename = generateExportFilename('conversations', mascotSlug, startDate, endDate);
        exportFn(data, filename, 'Conversations');
        break;
      }

      case 'questions': {
        // Combine questions, unanswered questions, URL handoffs, and email handoffs
        const questionData = questions.map(q => ({
          type: 'question',
          session_id: '',
          mascot_slug: mascotSlug,
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
          mascot_slug: mascotSlug,
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
          mascot_slug: mascotSlug,
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
          mascot_slug: mascotSlug,
          content: h.destination,
          category: h.category,
          frequency: h.count,
          answered: '',
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const allData = [...questionData, ...unansweredData, ...urlData, ...emailData];
        const filename = generateExportFilename('questions_gaps', mascotSlug, startDate, endDate);
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
          mascot_slug: mascotSlug,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const languageData = languages.map(l => ({
          type: 'language',
          name: l.language,
          count: l.count,
          percentage: l.percentage,
          mascot_slug: mascotSlug,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const deviceData = devices.map(d => ({
          type: 'device',
          name: d.deviceType,
          count: d.count,
          percentage: d.percentage,
          mascot_slug: mascotSlug,
          start_date: startDateStr,
          end_date: endDateStr,
        }));

        const allData = [...countryData, ...languageData, ...deviceData];
        const filename = generateExportFilename('audience', mascotSlug, startDate, endDate);
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
            mascot_slug: mascotSlug,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
          ...animationStats.topEasterEggs.map(e => ({
            type: 'easter_egg',
            name: e.animation,
            count: e.count,
            mascot_slug: mascotSlug,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
          ...animationStats.waitSequences.map(w => ({
            type: 'wait_sequence',
            name: w.sequence,
            count: w.count,
            mascot_slug: mascotSlug,
            start_date: startDateStr,
            end_date: endDateStr,
          })),
        ];
        const filename = generateExportFilename('animations', mascotSlug, startDate, endDate);
        exportFn(animationData, filename, 'Animations');
        break;
      }

      case 'costs': {
        const data = sessions.map(s => ({
          session_id: s.id,
          mascot_slug: s.mascot_slug,
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
        const filename = generateExportFilename('costs', mascotSlug, startDate, endDate);
        exportFn(data, filename, 'Costs');
        break;
      }

      default:
        break;
    }

    setShowExportDropdown(false);
  }, [activeTab, sessions, timeSeries, questions, unansweredQuestions, countries, languages, devices, animationStats, params.assistantId, getExportDateRange]);

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
        const [clientData, assistantData] = await Promise.all([
          getClientById(params.clientId),
          getAssistantById(params.assistantId)
        ]);

        setClient(clientData);
        setAssistant(assistantData);

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
          analytics.aggregations.getOverviewByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getSentimentByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getCategoriesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getLanguagesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getCountriesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getDevicesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getTimeSeriesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getQuestionsByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getUnansweredQuestionsByBotId(params.assistantId, dateRangeFilter),
          analytics.chatSessions.getWithAnalysisByBotId(params.assistantId, { dateRange: dateRangeFilter }),
          analytics.aggregations.getSentimentTimeSeriesByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getHourlyBreakdownByBotId(params.assistantId, dateRangeFilter),
          analytics.aggregations.getAnimationStatsByBotId(params.assistantId, dateRangeFilter)
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
  }, [params.clientId, params.assistantId, dateRange, useCustomRange, customDateRange]);

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
  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<BotIcon size={48} />}
            title="AI Assistant not found"
            message="The requested AI Assistant could not be found."
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
          title={`${assistant.name} Analytics`}
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

        {/* Header Card */}
        <Card className="mb-6 overflow-visible">
          {/* Desktop: Horizontal layout */}
          <div className="hidden lg:flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={assistant.image}
                alt={assistant.name}
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{assistant.name} Analytics</h1>
                <p className="text-foreground-secondary">{assistant.description}</p>
              </div>
            </div>

            <div className="relative" ref={desktopExportDropdownRef}>
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

          {/* Mobile: Stacked layout */}
          <div className="lg:hidden space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={assistant.image}
                alt={assistant.name}
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">{assistant.name} Analytics</h1>
                <p className="text-sm text-foreground-secondary truncate">{assistant.description}</p>
              </div>
            </div>

            <div className="relative" ref={mobileExportDropdownRef}>
              <Button
                variant="secondary"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="w-full justify-center"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className={`ml-1 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {/* Export Dropdown - Mobile */}
              {showExportDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface-elevated rounded-lg shadow-lg border border-border py-1 z-[100]">
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

          {/* Date Range Selector - Desktop */}
          <div className="hidden lg:flex items-center justify-between flex-wrap gap-4">
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

          {/* Date Range Selector - Mobile */}
          <div className="lg:hidden space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-secondary mb-1 block">Time Period</label>
                <Select
                  fullWidth
                  value={useCustomRange ? 'custom' : String(dateRange)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setShowDatePicker(true);
                    } else {
                      setUseCustomRange(false);
                      setDateRange(Number(val));
                    }
                  }}
                  options={[
                    { value: '7', label: 'Last 7 days' },
                    { value: '30', label: 'Last 30 days' },
                    { value: '90', label: 'Last 90 days' },
                    { value: 'custom', label: 'Custom Range' },
                  ]}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2 text-xs text-foreground-tertiary bg-background-secondary px-3 py-2.5 rounded-lg w-full">
                  <BarChart3 size={12} />
                  <span className="truncate">
                    {useCustomRange && customDateRange.start && customDateRange.end
                      ? `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`
                      : `Last ${dateRange} days`}
                  </span>
                </div>
              </div>
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

        {/* Tab Navigation - Using shared component */}
        <TabNavigation
          tabs={ANALYTICS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          brandColor={brandColor}
        />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            brandColor={brandColor}
            sessions={sessions}
            overview={overview}
            sentiment={sentiment}
            categories={categories}
            timeSeries={timeSeries}
            countries={countries}
            languages={languages}
            devices={devices}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
          />
        )}

        {activeTab === 'conversations' && (
          <ConversationsTab
            brandColor={brandColor}
            sessions={sessions}
            overview={overview}
            sentiment={sentiment}
            sentimentTimeSeries={sentimentTimeSeries}
            hourlyBreakdown={hourlyBreakdown}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
            onOpenTranscript={handleOpenTranscript}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            brandColor={brandColor}
            sessions={sessions}
            questions={questions}
            unansweredQuestions={unansweredQuestions}
            categories={categories}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
            onShowSessionIds={(title, ids) => setSessionIdsModal({ open: true, title, sessionIds: ids })}
          />
        )}

        {activeTab === 'audience' && (
          <AudienceTab
            brandColor={brandColor}
            sessions={sessions}
            countries={countries}
            languages={languages}
            devices={devices}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
          />
        )}

        {activeTab === 'animations' && (
          <AnimationsTab
            brandColor={brandColor}
            sessions={sessions}
            animationStats={animationStats}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
          />
        )}

        {activeTab === 'costs' && (
          <CostsTab
            brandColor={brandColor}
            sessions={sessions}
            overview={overview}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
          />
        )}

        {activeTab === 'custom' && <CustomTab />}

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
                        className={`text-xs mt-1 ${msg.author === 'assistant' ? 'text-gray-500 dark:text-gray-400' : ''}`}
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
